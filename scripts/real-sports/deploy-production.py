"""Prepare/activate the explicitly approved bridge through the Sports release runner.

No credentials or complete container environments are printed. Run on the Sports host.
"""
import datetime,hashlib,json,os,re,secrets,shutil,socket,subprocess,sys,time,urllib.parse,urllib.request,urllib.error,uuid
from pathlib import Path

BASE=Path('/opt/bnbu-sports-production')
WORK=Path('/home/ubuntu/companion-real-candidate-20261022')
NAME='companion-real-20261022'
RELEASE=BASE/'releases'/NAME
BACKEND='bnbu-sports-production-backend-1'
BRIDGE='bnbu-companion-bridge-20261022'
UNIT=Path('/etc/systemd/system/bnbu-companion-bridge.service')
ENV=Path('/etc/bnbu-sports-production/companion-bridge.env')
NGINX=Path('/etc/nginx/sites-available/bnbu-staging-hk.conf')
BASE_IMAGE='sha256:4b0d322cc5e49ef1c00ab919fd243c429728702cb76bc17eb7730ac82712394e'

def command(args,**kwargs):
 r=subprocess.run(args,capture_output=True,**kwargs)
 if r.returncode:
  diagnostic=WORK/('private-error-'+uuid.uuid4().hex+'.log')
  diagnostic.write_bytes(r.stderr.encode() if isinstance(r.stderr,str) else r.stderr);os.chmod(diagnostic,0o600)
  raise RuntimeError('Command failed: '+args[0]+'; private diagnostic '+str(diagnostic))
 return r.stdout
def output(*args):return command(list(args),text=True).strip()
def inspect(name):return json.loads(output('docker','inspect',name))[0]
def digest(path):return hashlib.sha256(Path(path).read_bytes()).hexdigest()
def save(path,value):
 path.write_text(json.dumps(value,indent=2));os.chmod(path,0o600)
def database_environment():
 secret=json.loads(Path('/etc/bnbu-sports-production/secrets/migrator.json').read_text())
 url=urllib.parse.urlsplit(secret['MIGRATION_DATABASE_URL'])
 assert url.hostname=='172.19.0.16' and url.path=='/bnbusports','Unexpected database target'
 return dict(os.environ,PGHOST=url.hostname,PGPORT=str(url.port or 5432),PGDATABASE='bnbusports',PGUSER=urllib.parse.unquote(url.username),PGPASSWORD=urllib.parse.unquote(url.password),PGSSLMODE='verify-full',PGSSLROOTCERT='/etc/bnbu-sports-production/secrets/tencentdb-ca-chain.pem')
def sql(query):return command(['psql','-X','-tA','-v','ON_ERROR_STOP=1','-c',query],text=True,env=database_environment()).strip()
def switch(path):
 link=BASE/('current-companion-'+uuid.uuid4().hex)
 try:link.symlink_to(path);os.replace(link,BASE/'current')
 finally:
  if link.is_symlink():link.unlink()
def require_free_port(port):
 with socket.socket() as s:s.bind(('127.0.0.1',port))
def verify_backup(backup):
 for name,entry in json.loads((backup/'verification.json').read_text()).items():
  assert Path(name).name==name
  assert (backup/name).stat().st_size==entry['bytes'] and digest(backup/name)==entry['sha256'],'Backup changed'
 command(['pg_restore','--list',str(backup/'database.dump')])
def probe(port):
 try:urllib.request.urlopen(f'http://127.0.0.1:{port}/not-a-route',timeout=2)
 except urllib.error.HTTPError as e:return e.code==404
 except (urllib.error.URLError,TimeoutError):return False
 return False
def validate_candidate():
 manifest=json.loads((WORK/'manifest.json').read_text())
 assert manifest['baselineRelease']=='resource-guard-20261020'
 for entry in manifest['files']:
  path=WORK/entry['path'];assert path.resolve().is_relative_to(WORK.resolve())
  assert digest(path)==entry['sha256'],entry['path']
 return manifest
def container_args(image,port,envfile,name,mounts):
 args=['docker','run','--rm','--name',name,'--network','host','--read-only','--tmpfs','/tmp:rw,nosuid,nodev,size=16m','--memory','256m','--memory-swap','320m','--cpus','0.5','--pids-limit','64','--cap-drop','ALL','--security-opt','no-new-privileges','--env-file',str(envfile),'-e',f'COMPANION_BRIDGE_PORT={port}']
 for m in mounts:args+=['--mount',f"type=bind,source={m['Source']},target={m['Destination']},readonly"]
 return args+[image]

assert os.geteuid()==0
os.umask(0o077)
mode=sys.argv[1]
if mode=='--prepare':
 assert not RELEASE.exists() and not (WORK/'prepared-production.json').exists()
 assert not ENV.exists() and not UNIT.exists(),'Existing bridge configuration requires review'
 previous=(BASE/'current').resolve();assert previous.name=='resource-guard-20261020'
 backend=inspect(BACKEND);assert backend['Image']==BASE_IMAGE
 assert shutil.disk_usage(BASE).free>5*1024**3,'Insufficient backup space'
 manifest=validate_candidate()
 image=output('docker','image','inspect','--format','{{.Id}}','bnbu-companion-bridge:candidate-20261022-v2')
 # Query only official organization identifiers; never users or personal records.
 organizations=json.loads(sql("SELECT coalesce(json_agg(json_build_object('id',id,'code',organization_code)), '[]'::json) FROM organizations WHERE status='ACTIVE'"))
 original_env=dict(value.split('=',1) for value in backend['Config']['Env'])
 public=original_env.get('PUBLIC_ORGANIZATION_CODE')
 matching=[item for item in organizations if item['code']==public] if public else organizations
 assert len(matching)==1,'Official organization must be unambiguous'
 organization=matching[0]['id']
 assert sql("SELECT count(*) FROM information_schema.tables WHERE table_schema='companion_sports'")=='0','Bridge schema already installed'
 runtime_mount=next(m for m in backend['Mounts'] if m['Destination']=='/run/secrets/runtime.json')
 app_database=urllib.parse.urlsplit(json.loads(Path(runtime_mount['Source']).read_text())['DATABASE_URL'])
 app_role=urllib.parse.unquote(app_database.username)
 assert re.fullmatch(r'[A-Za-z_][A-Za-z0-9_]*',app_role),'Unexpected application role'
 assert app_database.hostname=='172.19.0.16' and app_database.path=='/bnbusports'
 # Complete, catalog-verified database backup plus a separate schema backup.
 stamp=datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%dT%H%M%SZ')
 backup=Path('/var/backups/bnbu-companion-bridge')/stamp;backup.mkdir(parents=True,mode=0o700)
 os.chmod(backup.parent,0o700)
 for filename,flags in [('database.dump',['--format=custom','--no-owner','--no-acl']),('schema.sql',['--schema-only','--no-owner','--no-acl'])]:
  with (backup/filename).open('xb') as stream:
   r=subprocess.run(['nice','-n','15','pg_dump',*flags],env=database_environment(),stdout=stream,stderr=subprocess.PIPE,timeout=240)
   assert r.returncode==0 and (backup/filename).stat().st_size>0,'Database backup failed'
 command(['pg_restore','--list',str(backup/'database.dump')])
 shutil.copytree(previous,backup/'release',symlinks=True)
 shutil.copy2(NGINX,backup/'nginx.conf');shutil.copy2(BASE/'operations/retention-state.json',backup/'retention-state.json')
 save(backup/'containers.json',[backend,inspect('bnbu-sports-production-portal-1'),inspect('bnbu-sports-production-media-worker-1')])
 backup_result={name:{'bytes':(backup/name).stat().st_size,'sha256':digest(backup/name)} for name in ['database.dump','schema.sql','nginx.conf']}
 save(backup/'verification.json',backup_result)
 # Bridge inherits protected settings, with a dedicated signing key and a small heap.
 original_env.update(COMPANION_BRIDGE_SECRET=secrets.token_urlsafe(48),COMPANION_BRIDGE_ORGANIZATION_ID=organization,COMPANION_BRIDGE_WEB_ORIGIN='https://www.student.bnbusports.cn',NODE_OPTIONS='--max-old-space-size=160',MEDIA_WORKER_ENABLED='false')
 assert all('\n' not in k+v and '\r' not in k+v for k,v in original_env.items())
 private_env=backup/'bridge.env';private_env.write_text(''.join(f'{k}={v}\n' for k,v in sorted(original_env.items())));os.chmod(private_env,0o600)
 mounts=[m for m in backend['Mounts'] if m['Destination'] in ['/run/secrets/runtime.json','/run/secrets/tencentdb-ca-chain.pem','/run/bnbu-apns']]
 canary=BRIDGE+'-canary'
 require_free_port(4181);require_free_port(4180)
 args=container_args(image,4181,private_env,canary,mounts)
 args.remove('--rm')
 args.insert(2,'-d')
 command(args)
 try:
  for _ in range(40):
   if not inspect(canary)['State']['Running']:raise RuntimeError('Candidate process exited')
   if probe(4181):break
   time.sleep(.5)
  time.sleep(1)
  assert inspect(canary)['State']['Running'] and probe(4181),'Candidate did not become ready'
 finally:
  r=subprocess.run(['docker','logs',canary],capture_output=True)
  (backup/'canary.log').write_bytes(r.stdout+r.stderr)
  subprocess.run(['docker','stop','--time','15',canary],capture_output=True)
  subprocess.run(['docker','rm',canary],capture_output=True)
 shutil.copytree(previous,RELEASE,symlinks=True)
 # Resolve new release Compose file locally without changing any old retained file.
 config=json.loads(output('docker','compose','--project-directory',str(previous),'--profile','*','config','--format','json'))
 (RELEASE/'compose.override.yml').write_text(json.dumps(config,indent=2));os.chmod(RELEASE/'compose.override.yml',0o600)
 env=(RELEASE/'.env').read_text();env,n=re.subn(r'(?m)^COMPOSE_FILE=.*$','COMPOSE_FILE='+str(RELEASE/'compose.override.yml'),env);assert n==1
 (RELEASE/'.env').write_text(env)
 for entry in manifest['files']:
  if entry['path'].startswith('web/'):
   target=RELEASE/entry['path'];target.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(WORK/entry['path'],target)
 command(['docker','compose','--project-directory',str(RELEASE),'config','--quiet'])
 # Explicit embedding is restricted to the approved localhost parent and this page.
 additions='''    # companion-real-20261022
    location = /student/companion.html {
        add_header Content-Security-Policy "frame-ancestors 'self' http://127.0.0.1:4186" always;
        add_header Cache-Control no-store always;
        add_header Referrer-Policy no-referrer always;
        add_header X-Content-Type-Options nosniff always;
        try_files $uri =404;
    }
    location = /api/companion-bridge/handoff {
        proxy_pass http://127.0.0.1:4180;
        proxy_set_header Host $host;
        client_max_body_size 16k;
        add_header Cache-Control no-store always;
    }
    location = /api/companion-bridge/personal {
        proxy_pass http://127.0.0.1:4180;
        proxy_set_header Host $host;
        proxy_set_header Authorization $http_authorization;
        client_max_body_size 16k;
        add_header Cache-Control no-store always;
    }
'''
 nginx=NGINX.read_text();needle='    location /student/ { try_files $uri $uri/ =404; }'
 assert nginx.count(needle)==1 and 'companion-real-20261022' not in nginx
 (backup/'nginx-candidate.conf').write_text(nginx.replace(needle,additions+needle))
 args=container_args(image,4180,ENV,BRIDGE,mounts)
 assert all(' ' not in arg for arg in args),'Unit argument quoting requires review'
 (backup/'bridge.service').write_text('[Unit]\nDescription=BNBU Sports Companion connection bridge\nAfter=docker.service network-online.target\nRequires=docker.service\n\n[Service]\nType=simple\nRestart=on-failure\nRestartSec=5\nTimeoutStopSec=30\nExecStart='+' '.join('/usr/bin/docker' if i==0 else arg for i,arg in enumerate(args))+'\nExecStop=/usr/bin/docker stop --time 20 '+BRIDGE+'\n\n[Install]\nWantedBy=multi-user.target\n')
 gate={'release':str(RELEASE),'previous':str(previous),'image':image,'baseImage':BASE_IMAGE,'backup':str(backup),'appRole':app_role,'organization':organization,'nginxBefore':digest(NGINX),'containers':{n:{'id':inspect(n)['Id'],'startedAt':inspect(n)['State']['StartedAt'],'restarts':inspect(n)['RestartCount']} for n in [BACKEND,'bnbu-sports-production-portal-1','bnbu-sports-production-media-worker-1']}}
 save(WORK/'prepared-production.json',gate)
 print(json.dumps({'result':'PREPARED_WITH_VERIFIED_BACKUP','backup':str(backup),'files':backup_result,'candidateCanary':'PASS','release':str(RELEASE)}))
elif mode=='--apply':
 assert os.environ.get('BNBU_DEPLOY_MANAGED')=='1','Use the mandatory Sports deployment runner'
 gate=json.loads((WORK/'prepared-production.json').read_text());backup=Path(gate['backup'])
 assert re.fullmatch(r'[A-Za-z_][A-Za-z0-9_]*',gate['appRole'])
 assert backup.resolve().is_relative_to(Path('/var/backups/bnbu-companion-bridge'))
 verify_backup(backup);require_free_port(4180)
 assert (BASE/'current').resolve()==Path(gate['previous']) and inspect(BACKEND)['Image']==gate['baseImage']
 assert digest(NGINX)==gate['nginxBefore']
 validate_candidate()
 count=sql("SELECT count(*) FROM information_schema.tables WHERE table_schema='companion_sports'")
 resume=count!='0'
 if resume:
  assert count=='5' and json.loads((WORK/'activation-result.json').read_text())['result']=='ROLLED_BACK'
  assert sql("SELECT string_agg(table_name,',' ORDER BY table_name) FROM information_schema.tables WHERE table_schema='companion_sports'")=='handoffs,launch_limits,owners,requests,sessions'
  assert sql('SELECT (SELECT count(*) FROM companion_sports.owners)+(SELECT count(*) FROM companion_sports.sessions)+(SELECT count(*) FROM companion_sports.handoffs)+(SELECT count(*) FROM companion_sports.requests)+(SELECT count(*) FROM companion_sports.launch_limits)')=='0','Existing bridge data requires fresh recovery review'
  assert digest(ENV)==digest(backup/'bridge.env') and digest(UNIT)==digest(backup/'bridge.service')
 else:assert not ENV.exists() and not UNIT.exists()
 try:
  schema=(WORK/'schema.sql').read_text()
  if not resume:sql('BEGIN; SET LOCAL lock_timeout=\'5s\';\n'+schema+'\nGRANT USAGE ON SCHEMA companion_sports TO "'+gate['appRole']+'"; GRANT SELECT,INSERT,UPDATE,DELETE ON ALL TABLES IN SCHEMA companion_sports TO "'+gate['appRole']+'"; COMMIT;')
  shutil.copy2(backup/'bridge.env',ENV);os.chmod(ENV,0o600)
  shutil.copy2(backup/'bridge.service',UNIT);os.chmod(UNIT,0o644)
  command(['systemctl','daemon-reload']);command(['systemctl','enable','--now','bnbu-companion-bridge.service'])
  for _ in range(50):
   if probe(4180):break
   time.sleep(.5)
  assert probe(4180),'Bridge failed readiness'
  shutil.copy2(backup/'nginx-candidate.conf',NGINX)
  command(['nginx','-t'])
  switch(RELEASE)
  command(['systemctl','reload','nginx'])
  time.sleep(1)
  # Run the same independent business verifier inside the rollback boundary as well.
  command([sys.executable,str(WORK/'verify-production.py'),'--release',NAME,'--manifest',str(WORK/'manifest.json')])
  save(WORK/'activation-result.json',{'result':'ACTIVATED','release':NAME,'backup':str(backup)})
  print(json.dumps({'result':'ACTIVATED','release':NAME,'backup':str(backup)}))
 except BaseException:
  subprocess.run(['systemctl','disable','--now','bnbu-companion-bridge.service'],capture_output=True)
  if (BASE/'current').resolve()==RELEASE:switch(Path(gate['previous']))
  shutil.copy2(backup/'nginx.conf',NGINX)
  command(['nginx','-t']);command(['systemctl','reload','nginx'])
  save(WORK/'activation-result.json',{'result':'ROLLED_BACK','schema':'Retained for explicit recovery; no bulk restore or data deletion'})
  raise
else:raise SystemExit('Use --prepare or --apply')
