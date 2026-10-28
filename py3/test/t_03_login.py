"""
The py3 version of anclient.cmake/tests/t01_anclient_session.cpp, PING & AnSESSION,
against the jsample test app (io.odysz.jsample.JSampleApp), with user ody, password 123456.

The app is packaged into a temporary folder by "invoke package" of semantic-jserv/jserv-sample (which builds
the jar if it's not built yet), then started and stopped by test/jsample.py. Requires invoke.

Run in py3: python3 -m unittest test.t_03_login
"""
import shutil
import sys
import unittest

from anson.io.odysz.aes2 import AESHelper2
from anson.io.odysz.anson import Anson
from semanticshare.io.odysz.semantic.jprotocol import AnsonResp, MsgCode, OnError, Port
from semanticshare.io.odysz.semantic.jsession import AnSessionReq

from src.anclient.io.odysz.jclient import Clients, SessionClient
from test import jsample

jsample_ver = '[1.5.9,)'
'''
jserv-sample's pom version: JsampleCtrl, JSampleApp in io.odysz.jsample, settings' port.
'''

myuri = 'anclient.py3'
uid, plainkey = 'ody', '123456'

jserv: str = None


def show(case: str, **pairs):
    print(f'\n[{case}]')
    for k, v in pairs.items():
        print(f'  {k:<8}: {v}')


class AnSessionTest(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        global jserv
        Anson.java_src('semanticshare')

        cls.pkg = jsample.package(jsample_ver)
        try:
            cls.proc = jsample.start(cls.pkg)
        except Exception:
            shutil.rmtree(cls.pkg, ignore_errors=True)
            raise

        jserv = jsample.jserv_of(cls.pkg)
        Clients.init(jserv)

    @classmethod
    def tearDownClass(cls):
        try:
            code = jsample.stop(cls.pkg, cls.proc)
            show('jsample stopped', exit=code)
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


if __name__ == '__main__':
    unittest.main()
