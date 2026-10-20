"""Run as root on the existing Huitongli host after uploading verified build files.

prepare tests migrations and the explicit demo seed against a restored database.
activate backs up again, replaces only API/frontend, then inserts the same demo seed.
Existing Compose secrets remain on the server in mode-0600 files.
"""
import hashlib
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
import time
from urllib.parse import urlsplit, urlunsplit
import yaml

BASE = Path('/opt/bnbu-banxue')
RELEASE = BASE / 'releases' / 'huitongli-20261020-c10e823'
CHECK_DB = 'huitongli_check_20261020'
CHECK_CONTAINER = 'huitongli-release-check-20261020'
IMAGE = 'bnbu-banxue-api:huitongli-20261020-c10e823'
STATE = RELEASE / 'deployment-state.json'

def run(args, **kwargs):
    return subprocess.run(args, check=True, **kwargs)

def output(args):
    return subprocess.check_output(args).decode().strip()

def pg(*args, **kwargs):
    return run(['docker', 'exec', '-i', 'bnbu-banxue-postgres-1', *args], **kwargs)

def backup(name, user, database):
    target = BASE / 'backups' / name
    target.mkdir(mode=0o700)
    with (target / 'database.dump').open('wb') as stream:
        pg('pg_dump', '-U', user, '-d', database, '-Fc', stdout=stream)
    run(['docker', 'run', '--rm', '-v', 'bnbu-banxue_object-data:/source:ro', '-v', f'{target}:/backup', 'nginx:stable-alpine', 'tar', '-czf', '/backup/objects.tar.gz', '-C', '/source', '.'])
    return str(target)

def ready(container):
    for _ in range(60):
        p = subprocess.run(['docker', 'exec', container, 'node', '-e', "fetch('http://127.0.0.1:4175/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        if p.returncode == 0:
            return
        time.sleep(1)
    raise RuntimeError(f'{container} failed health check; inspect container logs')

def seed(container):
    run(['docker', 'exec', '-e', 'BNBU_SEED_DEMO=huitongli-demo-v1', '-e', 'BNBU_DEMO_CREDENTIALS_FILE=/tmp/demo-accounts.json', container, 'node', '/app/seed-cloud-demo.mjs'])

def verify(container):
    run(['docker', 'exec', '-e', 'BNBU_DEMO_CREDENTIALS_FILE=/tmp/demo-accounts.json', container, 'node', '/app/verify-release.mjs'])

phase = sys.argv[1]
if phase == 'prepare':
    assert not STATE.exists(), 'Release already prepared'
    for line in (RELEASE / 'SHA256SUMS').read_text().splitlines():
        expected, relative = line.split('  ', 1)
        path = (RELEASE / relative).resolve()
        assert path.is_relative_to(RELEASE), 'Manifest path outside release'
        assert hashlib.sha256(path.read_bytes()).hexdigest() == expected, relative
    old = (BASE / 'current').resolve()
    config = json.loads(output(['docker', 'compose', '-p', 'bnbu-banxue', '-f', str(old / 'compose.yaml'), 'config', '--format', 'json']))
    env = config['services']['postgres']['environment']
    user, database = env['POSTGRES_USER'], env['POSTGRES_DB']
    saved = backup(f'before-huitongli-20261020-check-{time.time_ns()}', user, database)
    # All unchanged secrets and delivery settings stay in the host-only Compose file.
    config['services']['api']['image'] = IMAGE
    config['services']['api']['build'] = {'context': '.', 'dockerfile': 'api.Dockerfile'}
    config['services']['api']['mem_limit'] = '384m'
    config['services']['frontend']['volumes'] = [f'{RELEASE}/dist:/usr/share/nginx/html:ro', f'{RELEASE}/frontend.conf:/etc/nginx/conf.d/default.conf:ro']
    (RELEASE / 'compose.yaml').write_text(yaml.safe_dump(config, sort_keys=False))
    os.chmod(RELEASE / 'compose.yaml', 0o600)
    shutil.copy2(old / 'frontend.conf', RELEASE / 'frontend.conf')
    run(['docker', 'build', '-f', str(RELEASE / 'api.Dockerfile'), '-t', IMAGE, str(RELEASE)])
    pg('psql', '-U', user, '-d', database, '-v', 'ON_ERROR_STOP=1', '-c', f'CREATE DATABASE {CHECK_DB}')
    with open(saved + '/database.dump', 'rb') as stream:
        pg('pg_restore', '-U', user, '-d', CHECK_DB, '--exit-on-error', stdin=stream)
    api_env = dict(config['services']['api']['environment'])
    url = urlsplit(api_env['DATABASE_URL'])
    api_env['DATABASE_URL'] = urlunsplit(url._replace(path='/' + CHECK_DB))
    api_env['BNBU_LOCAL_OUTBOX'] = '1'
    for key in list(api_env):
        if key.startswith(('BNBU_EMAIL_', 'BNBU_AOKSEND_', 'BNBU_ACTIVITY_MAIL_', 'BNBU_ACTIVITY_OCR_')):
            del api_env[key]
    env_file = RELEASE / 'check.env'
    env_file.write_text('\n'.join(f'{k}={v}' for k, v in api_env.items()) + '\n')
    os.chmod(env_file, 0o600)
    run(['docker', 'run', '-d', '--name', CHECK_CONTAINER, '--network', 'bnbu-banxue_default', '--memory', '384m', '--env-file', str(env_file), '-v', f'{RELEASE}:/release:ro', '-v', 'bnbu-banxue_object-data:/app/data:ro', IMAGE])
    ready(CHECK_CONTAINER)
    seed(CHECK_CONTAINER)
    verify(CHECK_CONTAINER)
    # A second seed must reject an existing fixture and preserve its passwords/content.
    repeat = subprocess.run(['docker', 'exec', '-e', 'BNBU_SEED_DEMO=huitongli-demo-v1', '-e', 'BNBU_DEMO_CREDENTIALS_FILE=/tmp/second-seed.json', CHECK_CONTAINER, 'node', '/app/seed-cloud-demo.mjs'], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    assert repeat.returncode != 0, 'Repeated seed unexpectedly succeeded'
    STATE.write_text(json.dumps({'previous': str(old), 'backup': saved, 'image': IMAGE, 'prepared': True}, indent=2))
    run(['docker', 'stop', CHECK_CONTAINER], stdout=subprocess.DEVNULL)
    print('PREPARED: restored database migration, seed, login, feeds and logout verified')
elif phase == 'activate':
    state = json.loads(STATE.read_text())
    assert state['prepared'] and not state.get('activated')
    assert (BASE / 'current').resolve() == Path(state['previous']), 'Current release changed'
    config = yaml.safe_load((RELEASE / 'compose.yaml').read_text())
    env = config['services']['postgres']['environment']
    saved = backup('before-huitongli-20261020-activate', env['POSTGRES_USER'], env['POSTGRES_DB'])
    command = ['docker', 'compose', '-p', 'bnbu-banxue', '-f', str(RELEASE / 'compose.yaml'), 'up', '-d', '--no-build', '--no-deps', 'api', 'frontend']
    try:
        run(command)
        ready('bnbu-banxue-api-1')
        # Mount-independent assets path lets the seed validate the deployed photo filenames.
        run(['docker', 'cp', str(RELEASE / 'dist/assets'), 'bnbu-banxue-api-1:/tmp/demo-assets'])
        run(['docker', 'exec', '-e', 'BNBU_DEMO_ASSETS=/tmp/demo-assets', '-e', 'BNBU_SEED_DEMO=huitongli-demo-v1', '-e', 'BNBU_DEMO_CREDENTIALS_FILE=/tmp/demo-accounts.json', 'bnbu-banxue-api-1', 'node', '/app/seed-cloud-demo.mjs'])
        verify('bnbu-banxue-api-1')
    except BaseException:
        run(['docker', 'compose', '-p', 'bnbu-banxue', '-f', state['previous'] + '/compose.yaml', 'up', '-d', '--no-build', '--no-deps', 'api', 'frontend'])
        raise
    creds = BASE / 'backups' / 'demo-accounts-20261020.json'
    run(['docker', 'cp', 'bnbu-banxue-api-1:/tmp/demo-accounts.json', str(creds)])
    os.chmod(creds, 0o600)
    link = BASE / 'current.next-20261020'
    link.symlink_to(RELEASE)
    os.replace(link, BASE / 'current')
    state.update(activated=True, activationBackup=saved, credentials=str(creds))
    STATE.write_text(json.dumps(state, indent=2))
    print('ACTIVATED', RELEASE, 'BACKUP', saved)
else:
    raise SystemExit('Expected prepare or activate')
