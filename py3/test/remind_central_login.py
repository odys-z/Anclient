"""
A test which always fails, run by .github/workflows/remind-central-login-test.yml on each push
changing py3/**. The failed run is the reminder: GitHub emails the failure to the pusher.

Why: anclient.py3 with the registry central is tested in the private repository
Acadynamo/Semantic-Network, by two workflows (.github/workflows, tests in .github/ci-test),
which a workflow of this public repository can't start without a token of that repository.
So they are started by hand, with the commit of this push:

    gh workflow run py3-central-login.yml  -R Acadynamo/Semantic-Network -f anclient_ref=<sha>
    gh workflow run py3-central-signup.yml -R Acadynamo/Semantic-Network -f anclient_ref=<sha>

Both are built from source (semantic.jserv, the central, antson's py3 packages, and this py3 at <sha>):
    py3-central-login  (central_login.py)  admin (r00): login, session token, touch,
                                           profile.home = '/home', profile.orgId = None
    py3-central-signup (central_signup.py) kepler signs up with a new community, kepler-lab, then logs
                                           in (r01): the same, profile.home = '/org/domains',
                                           profile.orgId = 'kepler-lab'

Not a t_*.py module, so test/test.py (discover, pattern t_*.py) never runs it.

Run in py3 (the workflow sets ANCLIENT_SHA, ANCLIENT_REF):
    python3 -m unittest test.remind_central_login
"""
import os
import unittest

central_repo = 'Acadynamo/Semantic-Network'
central_workflows = ['py3-central-login.yml', 'py3-central-signup.yml']


class RemindCentralLoginTest(unittest.TestCase):

    @unittest.skipUnless(os.environ.get('GITHUB_ACTIONS') == 'true', 'a CI reminder only')
    def test_run_central_login(self):
        sha = os.environ.get('ANCLIENT_SHA', '<sha>')
        ref = os.environ.get('ANCLIENT_REF', '')
        cmds = [f'gh workflow run {w} -R {central_repo} -f anclient_ref={sha}' for w in central_workflows]
        cmd = ' && '.join(cmds)
        print(f'\nanclient.py3 changed at {sha} ({ref}): run the central tests,\n    ' + '\n    '.join(cmds) + '\n')

        # Always fails, on purpose: the failure is the reminder (an email to the pusher).
        self.fail(f'Reminder, not a broken build. Run the central tests: {cmd}')


if __name__ == '__main__':
    unittest.main()
