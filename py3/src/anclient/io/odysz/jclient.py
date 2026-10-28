from collections.abc import Callable
from sys import stderr
from typing import Protocol, Any, Optional

import requests

from anson.io.odysz.aes2 import AESHelper2
from anson.io.odysz.anson import Anson
from semanticshare.io.odysz.semantics import SessionInf
from semanticshare.io.odysz.semantic.jprotocol import MsgCode, Port, AnsonMsg, AnsonBody, AnsonResp, AnsonHeader
from semanticshare.io.odysz.semantic.jserv.echo import EchoReq
from semanticshare.io.odysz.semantic.jserv.signup import SingupReq
from semanticshare.io.odysz.semantic.jsession import AnSessionReq, AnSessionResp


class SsException(Exception):
    """
    Java io.odysz.semantics.x.SsException: login failed.
    """
    code: MsgCode

    def __init__(self, code: MsgCode, msg: str):
        super().__init__(f'{code}: {msg}')
        self.code = code


class OnError:
    err : Callable = None
    def __call__(self, code: MsgCode, msg: str, *args: str) -> None:
        return self.err(code, msg, args)

    def __init__(self, on_err: Callable[[MsgCode, str, ...], None]):
        self.err = on_err


class Clients:
    """
    Java stub
    """

    servRt = None
    timeout = None

    @staticmethod
    def pingLess(funcUri: str, errCtx: OnError=None):

        req = EchoReq()
        req.a = EchoReq.A.echo

        client = InsecureClient(Clients.servRt)
        jmsg = client.userReq(funcUri, Port.echo, req)

        resp = client.commit(jmsg, errCtx)

        return resp

    @classmethod
    def init(cls, jserv: str, timeout: int=20):
        cls.servRt = jserv
        cls.timeout = timeout

    def loginWithUrl(self):
        pass

class SessionClient:
    myservRt: str
    ssInf: SessionInf
    header: AnsonHeader

    @staticmethod
    def signupLess(errCtx: OnError = None):
        '''
        Testing, only for py3 client.
        Easy to breach through into database.
        :param errCtx:
        :return:
        '''

        from semanticshare.io.odysz.semantic.jserv.signup import A
        req = SingupReq()
        req.a = A.singup

        client = InsecureClient(Clients.servRt)
        jmsg = client.userReq("/py3/signup", Port.singup, req)

        resp = client.commit(jmsg, errCtx)

        return resp

    @staticmethod
    def loginWithUri(servroot: str, uri: str, uid: str, pswdPlain: str, mac: str = None) -> 'SessionClient':
        """
        Login to servroot/login.serv, the same as Java SessionClient.loginWithUri().

        Only the token, encrypt(uid, pswd, iv), is sent, never the password.

        :param servroot: jserv root, e.g. http://127.0.0.1:8080/jserv-sample
        :param uri: the client's function uri
        :param mac: device id
        :return: the logged in client, with the server's ssToken repacked
        :raises SsException: login failed, e.g. code exSession for a wrong password, or exIo
        """
        if uid is None or pswdPlain is None:
            raise SsException(MsgCode.exSemantics, 'user id and password can not be null.')

        iv = AESHelper2.getRandom()
        req = AnSessionReq.formatLogin(uid, AESHelper2.encrypt(uid, pswdPlain, iv), AESHelper2.encode64(iv), mac)

        errs = []
        def on_err(code: MsgCode, msg: str, *args) -> None:
            errs.append((code, msg))

        client = InsecureClient(servroot)
        resp = client.commit(client.userReq(uri, Port.session, req), OnError(on_err))

        if not isinstance(resp, AnSessionResp):
            code, msg = errs[0] if len(errs) > 0 else (MsgCode.exGeneral, f'Unexpected login reply: {resp}')
            raise SsException(code, f'Login failed: {msg}')

        ssinf = resp.ssInf
        ssinf.ssToken = AESHelper2.repackSessionToken(ssinf.ssToken, pswdPlain, uid)
        if mac is not None:
            ssinf.device = mac

        c = SessionClient(servroot, ssinf)
        c.profile = resp.profile
        return c

    def __init__(self, jserv: str, ssInf: SessionInf):
        self.proxies = {
            "http" : None,
            "https": None,
        }
        '''
        https://stackoverflow.com/a/40470853/7362888
        '''

        self.myservRt = jserv
        self.ssInf = ssInf
        self.header = None
        self.profile: Optional[Anson] = None
        '''
        AnSessionResp.profile replied on login.
        '''

    def Header(self):
        if self.header is None:
            self.header = AnsonHeader(ssid=self.ssInf.ssid, uid=self.ssInf.uid, token=self.ssInf.ssToken)
        return self.header

    def commit(self, req: AnsonMsg, err: OnError) ->Optional[AnsonResp]:
        try:
            url = f'{self.myservRt}/{req.port.value}'
            print(req.toBlock(False))
            resp = requests.post(url=url,
                                 proxies=self.proxies,
                                 data=req.toBlock(False),
                                 timeout=Clients.timeout)
            if resp.status_code == 200:
                data = resp.json()  # If the response is JSON
                env = AnsonResp.from_envelope(data)
                if env.code != MsgCode.ok and env.code != MsgCode.ok.name:
                    print(f"Error: {env.code}\n{env.Body().msg()}", file=stderr)
                    err(env.code, env.Body().msg(), env)
                    return None
                else:
                    return env.Body()

            else:
                print(f"Error: {resp.status_code}", file=stderr)
                res = f'{resp.status_code}\n{self.myservRt}\n{"" if req is None else req.toBlock()}'
                try: err(MsgCode.exIo, res, resp.text)
                except Exception as e:
                    try:
                        print("[ERROR!] There are errors in error handler:", err)
                        print(e)
                    except: pass
                return None
        except Exception as e:
            if err is not None:
                err(MsgCode.exIo, '[SessionClient.commit()] ' +
                                  e.message if hasattr(e, 'message') else str(e), None)
            else:
                raise e

    def userReq(self, uri: str, port: Port, bodyItem: AnsonBody, *act: Any) -> AnsonMsg:
        bodyItem.uri = uri
        if act is not None and len(act) > 0:
            self.Header().act = act

        return AnsonMsg(port).Header(self.Header()).Body(bodyItem)


class InsecureClient(SessionClient):

    def __init__(self, servRt: str):
        super().__init__(servRt, SessionInf(uid='uid'))

