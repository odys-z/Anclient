import sys
import unittest

from semanticshare.io.odysz.semantic.jprotocol import AnsonResp, MsgCode

from anson.io.odysz.anson import Anson
from src.anclient.io.odysz.jclient import Clients


class AnclientTest(unittest.TestCase):
    def testPing(self):
        Anson.java_src('semanticshare')
        def err_ctx (c: MsgCode, e: str, *args: str) -> None:
            print(c, e.format(args), file=sys.stderr)
            self.fail(e)

        # Clients.servRt = 'http://192.168.0.1:8964/jserv-album'
        Clients.servRt = 'http://127.0.0.1:8964/jserv-album'
        resp = Clients.pingLess('Anson.py3/test', err_ctx)
        self.assertIsNotNone(resp)

        print(Clients.servRt, '<echo>', resp.toBlock())
        self.assertEqual(type(resp.body[0]), AnsonResp)
        self.assertEqual('ok', resp.code, resp.body[0].msg()) # TODO MsgCode.ok


if __name__ == '__main__':
    unittest.main()
    t = AnclientTest()
    t.testPing()

