/** Example: Hello x-visual
 */
import * as an from 'anclient'
import * as xv from 'x-visual'
import Bars from './bars'
import {vec3conn, Jvector} from '../../lib/jvector'

/** Hollow XWorld Application.
 * add the user implemented system, Cube, into xworld, then show it.
 * @class
 */
export class App {
	constructor(canv, jserv = null) {
		// initialize a client of jsample
		this.an = an.an;
		this.an.init(jserv ? jserv : "http://127.0.0.1:8080/jserv-sample");
		this.canv = canv;
		this.ssClient = undefined;
	}

	load() {
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

			let jvector = new Jvector(client);
			// 1. bind simple bars
			jvector.query(onQuery);

			// 2. load vectors from port vec3.serv
			jvector.getVectors((resp) => {
				console.log(jvector.vectorsOf(resp),
							jvector.x(resp), jvector.y(resp), jvector.z(resp));
			});

			function onQuery(resp) {
				console.log(resp);

				let c = document.getElementById(that.canv);
				const xworld = new xv.XWorld(c, window, {
					camera: {far: 10000} // default 5000
				});
				var ecs = xworld.xecs;

				xworld.addSystem('hello', // any group name as you like
					new Bars(ecs, {xscene: xworld.xscene})
					.create(an.Protocol.rs2arr(resp.body[0].rs[0])));
				xworld.startUpdate();
			}
		}

		function onError (code, resp) {
			if (code === an.Protocol.MsgCode.exIo)
				alert('Network Failed!');
			else if (resp.body[0])
				// most likely MsgCode.exSession for password error
				alert(code + ': ' + resp.body[0].m);
			else console.error(resp);
		}
	}
}
