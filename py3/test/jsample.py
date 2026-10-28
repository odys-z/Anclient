'''
Packages, starts and stops the jsample test app (io.odysz.jsample.JSampleApp) for tests.

The app is built and packaged by semantic-jserv/jserv-sample/tasks.py, a sibling project of Anclient:
{github}/semantic-jserv/jserv-sample, with "invoke package"; this module starts the package with
java -jar and stops it with a post to JsampleCtrl from localhost.

    pkg = jsample.package('[1.5.9,)')
    p = jsample.start(pkg)
    ...
    jsample.stop(pkg, p)
'''
import json
import os
import shutil
import subprocess
import sys
import tempfile
import time
from enum import Enum
from pathlib import Path
from typing import Union

from anson.io.odysz.common import Utils
from semanticshare.io.odysz.semantic.jprotocol import AnsonResp, MsgCode, OnError, UserReq

from src.anclient.io.odysz.jclient import Clients, InsecureClient

jserv_sample = Path(__file__).resolve().parents[3] / 'semantic-jserv' / 'jserv-sample'
myuri = 'anclient.py3/test'


class Samport(Enum):
    '''
    Java io.odysz.jsample.protocol.Samport, only the ports used here. Serialized by name.
    '''
    ctrl = 'ctrl.less'


def package(require: str) -> Path:
    '''
    invoke package --target <a temporary folder> --require <require>, in jserv-sample.
    Builds the jar (mvn clean package) if it's not built yet.
    :param require: maven version range of jserv-sample, e.g. "[1.5.9,)"
    :return: the package folder
    :raises AssertionError: the task failed
    '''
    if not (jserv_sample / 'tasks.py').is_file():
        raise AssertionError(f'Cannot find jserv-sample/tasks.py: {jserv_sample}')

    pkg = Path(tempfile.mkdtemp(prefix='jsample-'))
    cmd = [sys.executable, '-m', 'invoke', 'package', '--target', str(pkg), '--require', require]
    print('[jsample]', ' '.join(cmd[2:]))
    r = subprocess.run(cmd, cwd=jserv_sample)
    if r.returncode != 0:
        shutil.rmtree(pkg, ignore_errors=True)
        raise AssertionError(f'Failed: {" ".join(cmd)} (in {jserv_sample}), exit code {r.returncode}')
    return pkg


def jserv_of(pkg: Union[str, Path]) -> str:
    '''
    :return: http://127.0.0.1:<port>/jserv-sample, port of pkg/WEB-INF/settings.json
    '''
    with open(Path(pkg) / 'WEB-INF' / 'settings.json', 'r', encoding='utf-8') as f:
        return f'http://127.0.0.1:{json.load(f)["port"]}/jserv-sample'


def ping(jserv: str) -> bool:
    Clients.init(jserv)
    errs = []
    resp = Clients.pingLess(myuri, OnError(lambda c, e, *a: errs.append((c, e))))
    return isinstance(resp, AnsonResp) and len(errs) == 0


def java_exe() -> str:
    java_home = os.environ.get('JAVA_HOME')
    if java_home:
        exe = Path(java_home) / 'bin' / ('java.exe' if Utils.iswindows() else 'java')
        if exe.is_file():
            return str(exe)
    exe = shutil.which('java')
    if exe is None:
        raise AssertionError('Cannot find java, set JAVA_HOME or PATH.')
    return exe


def log_tail(pkg: Path, lines: int = 30) -> str:
    log = pkg / 'jsample.log'
    return ''.join(log.read_text(encoding='utf-8', errors='replace').splitlines(True)[-lines:]) if log.is_file() else ''


def start(pkg: Union[str, Path], timeout: int = 60) -> subprocess.Popen:
    '''
    java -jar bin/jserv-sample-<version>.jar in pkg, and wait until it answers echo. Output goes to pkg/jsample.log.
    :raises AssertionError: the app exits, or doesn't answer in timeout seconds
    '''
    pkg = Path(pkg).resolve()
    jars = sorted((pkg / 'bin').glob('jserv-sample-*.jar'))
    if len(jars) == 0:
        raise AssertionError(f'No jserv-sample jar in {pkg / "bin"}.')

    jserv = jserv_of(pkg)
    if ping(jserv):
        raise AssertionError(f'A jserv is already running at {jserv}.')

    with open(pkg / 'jsample.log', 'w', encoding='utf-8') as log:
        p = subprocess.Popen([java_exe(), '-Dfile.encoding=UTF-8', '-jar', str(jars[-1].relative_to(pkg))],
                             cwd=pkg, stdin=subprocess.DEVNULL, stdout=log, stderr=subprocess.STDOUT)

    t0 = time.time()
    while time.time() - t0 < timeout:
        if p.poll() is not None:
            raise AssertionError(f'JSample exited with code {p.returncode}:\n{log_tail(pkg)}')
        if ping(jserv):
            print(f'[jsample] running at {jserv}, pid {p.pid}')
            return p
        time.sleep(1)

    p.kill()
    p.wait()
    raise AssertionError(f'JSample does not answer at {jserv} in {timeout} seconds:\n{log_tail(pkg)}')


def stop(pkg: Union[str, Path], p: subprocess.Popen, timeout: int = 30) -> int:
    '''
    Post to JsampleCtrl from localhost, which stops the app gracefully, and wait for the process to exit.
    Killed only if it doesn't exit in timeout seconds.
    :return: the process' exit code
    '''
    errs = []
    client = InsecureClient(jserv_of(pkg))
    resp = client.commit(client.userReq(myuri, Samport.ctrl, UserReq()),
                         OnError(lambda c, e, *a: errs.append((c, e))))
    print('[jsample] JsampleCtrl:', resp.msg() if resp is not None else errs)

    try:
        p.wait(timeout)
    except subprocess.TimeoutExpired:
        Utils.warn('JSample (pid {}) is not stopped in {} seconds, killing it.\n{}', p.pid, timeout, log_tail(Path(pkg)))
        p.kill()
        p.wait()
    return p.returncode
