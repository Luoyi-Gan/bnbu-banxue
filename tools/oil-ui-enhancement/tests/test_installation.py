"""Test installation idempotency and recovery in a fully isolated temporary Codex home."""
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]
ORIGINAL = b'---\nname: oil-ui\ndescription: Fixture for lifecycle verification\n---\n\n# oil-ui\n\nOriginal body.\n'


class Installation(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix='oil-ui-installer-test-')
        self.home = Path(self.temp.name)
        self.target = self.home / 'skills' / 'oil-ui'
        self.target.mkdir(parents=True)
        self.entry = self.target / 'SKILL.md'
        self.entry.write_bytes(ORIGINAL)

    def tearDown(self):
        self.temp.cleanup()

    def run_installer(self, *args, success=True):
        env = dict(os.environ, CODEX_HOME=str(self.home))
        result = subprocess.run([sys.executable, '-X', 'utf8', str(ROOT / 'scripts' / 'install_enhancement.py'), *args], env=env, capture_output=True, text=True, encoding='utf-8')
        self.assertEqual(result.returncode == 0, success, result.stdout + result.stderr)
        return result

    def test_idempotency_and_restore(self):
        self.run_installer()
        once = self.entry.read_bytes()
        self.run_installer()
        self.assertEqual(once, self.entry.read_bytes())
        self.run_installer('--check')
        self.run_installer('--restore')
        self.assertEqual(self.entry.read_bytes(), ORIGINAL)
        self.run_installer('--check', success=False)

    def test_later_reference_edits_are_protected(self):
        self.run_installer()
        reference = self.target / 'references' / 'enhanced' / 'motion.md'
        reference.write_text('User edited this reference.', encoding='utf-8')
        self.run_installer('--check', success=False)
        self.run_installer('--restore', success=False)
        self.assertEqual(reference.read_text(encoding='utf-8'), 'User edited this reference.')

    def test_later_entrypoint_edits_are_detected(self):
        self.run_installer()
        self.entry.write_bytes(self.entry.read_bytes() + b'\nLater edit.\n')
        self.run_installer('--check', success=False)
        self.run_installer('--restore', success=False)

    def test_unexpected_skill_is_not_overwritten(self):
        unexpected = ORIGINAL.replace(b'# oil-ui', b'# other-skill')
        self.entry.write_bytes(unexpected)
        self.run_installer(success=False)
        self.assertEqual(self.entry.read_bytes(), unexpected)


if __name__ == '__main__':
    unittest.main()
