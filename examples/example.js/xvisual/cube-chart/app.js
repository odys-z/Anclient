/** Example: Hello x-visual
 */
import * as an from 'anclient'
import * as xv from 'x-visual'
import {vec3conn, Jvector} from '../../lib/jvector'

/** Hollow XWorld Application.
 * add the user implemented system, Cube, into xworld, then show it.
 * @class
 */
export class App {
	constructor(canv, serv) {
		// initialize a client of jsample
		this.an = an.an;
		this.an.init(serv ? serv : "http://127.0.0.1:8080/jserv-sample");
		this.canv = canv;
		this.ssClient = undefined;
	}

	load(onload) {
		let that = this;
		if (!this.loggedin) {
			this.an.login(
				"admin",  // user name
				"123456", // password (won't be sent on line - already set at server)
				// callback parameter is a session client initialized with session token
				// client.ssInf has session Id, token & user information got from server
				reload,
				onError
			);
		}
		else reload(this.ssClient);

		function reload (client) {
			that.ssClient = client;
			that.loggedin = true;

			// load vectors from port vec3.serv
			let jvector = new Jvector(client);
			jvector.getCubes(onload ? onload :
				(resp) => {
					console.log(jvector.vectorsOf(resp),
							jvector.x(resp), jvector.y(resp), jvector.z(resp));
				} );
		}

		function onError (code, resp) {
			if (code === an.Protocol.MsgCode.exIo)
				alert('Network Failed!');
			else if (resp.body[0])
				// most likely MsgCode.exSession for password error
				alert(resp.body[0].m);
			else console.error(resp);
		}
	}
}
