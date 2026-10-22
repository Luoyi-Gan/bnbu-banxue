"""Independent post-activation checks. Does not create users or exercise records."""
import argparse
import hashlib
import json
import subprocess
import time
import urllib.error
import urllib.request
from pathlib import Path

parser = argparse.ArgumentParser()
parser.add_argument('--release', required=True)
parser.add_argument('--manifest', required=True)
parser.add_argument('--parent', default='http://127.0.0.1:4186')
args = parser.parse_args()
root = Path('/opt/bnbu-sports-production/current').resolve()
assert root.name == args.release, 'Unexpected active release'
manifest = json.loads(Path(args.manifest).read_text())
for item in manifest['files']:
    if item['path'].startswith('web/'):
        assert hashlib.sha256((root / item['path']).read_bytes()).hexdigest() == item['sha256'], item['path']

def request(path, expected, payload=None):
    req = urllib.request.Request(
        'https://www.student.bnbusports.cn' + path,
        data=payload,
        headers={'Content-Type': 'application/json'},
    )
    try:
        with urllib.request.urlopen(req, timeout=20) as response:
            status, headers = response.status, response.headers
    except urllib.error.HTTPError as error:
        status, headers = error.code, error.headers
    assert status in expected, (path, status)
    return headers

request('/student/', {200})
request('/api/v1/health/ready', {200})
for _ in range(16):
    headers = request('/student/companion.html', {200})
    if args.parent in headers.get('Content-Security-Policy', ''):
        break
    time.sleep(.5)
assert args.parent in headers.get('Content-Security-Policy', ''), 'Missing explicit allowed parent'
assert headers.get('X-Frame-Options', '').upper() != 'DENY', 'Embedding still blocked'
request('/student/personal.html', {200})
request('/api/companion-bridge/handoff', {401}, b'{"code":"invalid"}')
request('/api/companion-bridge/personal', {401}, b'{}')
request('/internal/companion-sports', {404}, b'{}')
bridge = json.loads(subprocess.check_output(['docker', 'inspect', 'bnbu-companion-bridge-20261022']))[0]
assert bridge['State']['Running'], 'Bridge stopped'
ports = bridge['NetworkSettings']['Ports']
assert all(port['HostIp'] in ('127.0.0.1', '::1') for bindings in ports.values() for port in (bindings or [])), 'Bridge publicly exposed'
listeners = subprocess.check_output(['ss', '-H', '-ltn', 'sport = :4180'], text=True).splitlines()
assert listeners and all(line.split()[3].startswith('127.0.0.1:') for line in listeners), 'Bridge socket must bind loopback only'
print(json.dumps({'release': root.name, 'assets': 'verified', 'public_routes': 'verified', 'bridge': 'loopback only', 'real_user_login': 'requires authenticated owner verification'}))
