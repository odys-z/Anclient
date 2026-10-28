"""
The py3 version of anclient.cmake/tests/t01_anclient_session.cpp, PING & AnSESSION,
against the jsample test app (io.odysz.jsample.JSampleApp), with user ody, password 123456.

The app is packaged into a temporary folder, started and stopped by the invoke tasks of
semantic-jserv/jserv-sample, a sibling project of Anclient: {github}/semantic-jserv/jserv-sample.
"invoke package" builds the jar (mvn clean package) if it's not built yet.

Requires invoke, and anclient.py3 installed for jserv-sample/tasks.py (stop posts with its InsecureClient).

Run in py3: python3 -m unittest test.t_03_login
"""
import json
import shutil
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

from anson.io.odysz.aes2 import AESHelper2
from anson.io.odysz.anson import Anson
from semanticshare.io.odysz.semantic.jprotocol import AnsonResp, MsgCode, OnError, Port
from semanticshare.io.odysz.semantic.jserv.crud import SsException
from semanticshare.io.odysz.semantic.jsession import AnSessionReq

from src.anclient.io.odysz.jclient import Clients, SessionClient

jsample = Path(__file__).resolve().parents[3] / 'semantic-jserv' / 'jserv-sample'
jsample_ver = '[1.5.9,)'
'''
jserv-sample's pom version: JsampleCtrl, JSampleApp in io.odysz.jsample, settings' port.
'''

myuri = 'anclient.py3'
uid, plainkey = 'ody', '123456'

jserv: str = None


def invoke(*args: str) -> None:
    '''
    Run "invoke <args>" in jserv-sample.
    :raises AssertionError: the task failed (exit code != 0)
    '''
    cmd = [sys.executable, '-m', 'invoke', *args]
    print('[jsample]', ' '.join(args))
    r = subprocess.run(cmd, cwd=jsample)
    if r.returncode != 0:
        raise AssertionError(f'Failed: {" ".join(cmd)} (in {jsample}), exit code {r.returncode}')


def show(case: str, **pairs):
    print(f'\n[{case}]')
    for k, v in pairs.items():
        print(f'  {k:<8}: {v}')


class AnSessionTest(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        global jserv
        Anson.java_src('semanticshare')

        if not (jsample / 'tasks.py').is_file():
            raise AssertionError(f'Cannot find jserv-sample/tasks.py: {jsample}')

        cls.pkg = Path(tempfile.mkdtemp(prefix='jsample-'))
        cls.started = False
        try:
            invoke('package', '--target', str(cls.pkg), '--require', jsample_ver)
            invoke('start', '--target', str(cls.pkg))
            cls.started = True
        except Exception:
            shutil.rmtree(cls.pkg, ignore_errors=True)
            raise

        with open(cls.pkg / 'WEB-INF' / 'settings.json', 'r', encoding='utf-8') as f:
            jserv = f'http://127.0.0.1:{json.load(f)["port"]}/jserv-sample'
        Clients.init(jserv)

    @classmethod
    def tearDownClass(cls):
        try:
            if cls.started:
                invoke('stop', '--target', str(cls.pkg))
        finally:
            shutil.rmtree(cls.pkg, ignore_errors=True)

    def test_ping(self):
        def err_ctx(c: MsgCode, e: str, *args: str) -> None:
            print(c, e, file=sys.stderr)
            self.fail(e)

        resp = Clients.pingLess('Anson.py3/test', err_ctx)
        self.assertIsNotNone(resp)
        self.assertEqual(type(resp), AnsonResp)
        show('ping', jserv=jserv, echo=resp.msg())

    def test_session(self):
        c = SessionClient.loginWithUri(jserv, myuri, uid, plainkey, 'test.device')

        self.assertEqual(uid, c.ssInf.uid)
        self.assertEqual('test.device', c.ssInf.device)
        ss = c.ssInf.ssToken.split(':')
        self.assertEqual(2, len(ss))

        # what the client keeps is the repacked token, encrypt(uid:knowledge, pswd, iv2) : iv2
        plain = AESHelper2.decrypt(ss[0], plainkey, AESHelper2.decode64(ss[1]))
        knowledge = plain.split(':')[1]
        show('login', uid=uid, ssid=c.ssInf.ssid, ssToken=c.ssInf.ssToken, plain=plain, knows=knowledge)

        self.assertEqual(f'{uid}:{knowledge}', plain)
        self.assertTrue(AESHelper2.verifyToken(c.ssInf.ssToken, knowledge, uid, plainkey))

        header = c.Header()
        self.assertEqual(c.ssInf.ssid, header.ssid)
        self.assertEqual(c.ssInf.ssToken, header.ssToken)

    def test_touch(self):
        '''
        The server verifies the repacked token in the header (AnSession.verify(), token verification on).
        '''
        c = SessionClient.loginWithUri(jserv, myuri, uid, plainkey, 'test.device')

        errs = []
        req = AnSessionReq()
        req.a = AnSessionReq.A.touch
        resp = c.commit(c.userReq(myuri, Port.session, req), OnError(lambda code, e, *a: errs.append((code, e))))
        show('touch', ssid=c.ssInf.ssid, token=c.ssInf.ssToken, resp=None if resp is None else resp.code, errs=errs)
        self.assertIsNotNone(resp, errs)

        # a token not made of the server's knowledge is refused
        iv = AESHelper2.getRandom()
        c.ssInf.ssToken = f'{AESHelper2.encrypt(f"{uid}:not-the-knowledge", plainkey, iv)}:{AESHelper2.encode64(iv)}'
        c.header = None
        errs.clear()
        resp = c.commit(c.userReq(myuri, Port.session, req), OnError(lambda code, e, *a: errs.append((code, e))))
        show('touch, wrong token', resp=resp, errs=errs)
        self.assertIsNone(resp)
        self.assertIn(errs[0][0], (MsgCode.exSession, MsgCode.exSession.name))

    def test_wrong_pswd(self):
        with self.assertRaises(SsException) as x:
            SessionClient.loginWithUri(jserv, myuri, uid, 'wrong-' + plainkey)
        show('wrong password', code=x.exception.code, error=x.exception)
        self.assertEqual(MsgCode.exSession, x.exception.code)

    def test_unreachable(self):
        with self.assertRaises(IOError) as x:
            SessionClient.loginWithUri('http://127.0.0.1:1/jserv-sample', myuri, uid, plainkey)
        show('unreachable', error=x.exception)


if __name__ == '__main__':
    unittest.main()
