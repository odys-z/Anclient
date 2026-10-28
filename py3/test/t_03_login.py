"""
The py3 version of anclient.cmake/tests/t01_anclient_session.cpp, PING & AnSESSION.

Requires starting jserv-sample JsampleApp at localhost:8080 before running the test,
with user ody, password 123456 (the same as the c++ test).

Run in py3: python3 -m unittest test.t_03_login
"""
import sys
import unittest

from anson.io.odysz.aes2 import AESHelper2
from anson.io.odysz.anson import Anson
from semanticshare.io.odysz.semantic.jprotocol import AnsonResp, MsgCode

from src.anclient.io.odysz.jclient import Clients, SessionClient, SsException

jserv = 'http://127.0.0.1:8080/jserv-sample'
myuri = 'anclient.py3'
uid, plainkey = 'ody', '123456'


def show(case: str, **pairs):
    print(f'\n[{case}]')
    for k, v in pairs.items():
        print(f'  {k:<8}: {v}')


class AnSessionTest(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        Anson.java_src('semanticshare')
        Clients.init(jserv)

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

    def test_wrong_pswd(self):
        with self.assertRaises(SsException) as x:
            SessionClient.loginWithUri(jserv, myuri, uid, 'wrong-' + plainkey)
        show('wrong password', code=x.exception.code, error=x.exception)


if __name__ == '__main__':
    unittest.main()
