/** Example: Hello x-visual
 */
import * as an from 'anclient'
import * as xv from 'x-visual'
import Bars from './bars'

/** Hollow XWorld Application.
 * add the user implemented system, Cube, into xworld, then show it.
 * @class
 */
export class App {
	constructor(canv) {
		// initialize a client of jsample
		this.an = an.an;
		this.an.init("http://127.0.0.1:8080/jserv-sample");
		this.canv = canv;
		this.ssClient = undefined;
	}

	login() {
		let that = this;
	    this.an.login(
	        "admin",             // user name
	        "odys-z.github.io",  // password (won't sent on line - already set at server)
	        // callback parameter is a session client initialized with session token
	        // client.ssInf has session Id, token & user information got from server
	        function(client){
	            that.ssClient = client;
	            console.log(client.ssInf);
	            that.query();
	        });
	}

	/** Create a query request and post back to server. */
	query(conn) {
	    var req = this.ssClient.query(conn, "an_vectors", "v", {page: 0, size: 20});
	    req.body[0]
	        .expr("cate", "c").expr("year").expr("age").expr("amount")
	        .whereCond("=", "planet", "'mars'");

	    $an.post(req,
	        // success callback. resp is a server message
	        function(resp) {
	            console.log(resp);

				let c = document.getElementById(this.canv);
				const xworld = new xv.XWorld(c, window, {
					camera: {far: 10000} // default 5000
				});
				var ecs = xworld.xecs;

				xworld.addSystem('hello', // any group name as you like
					new Bars(ecs, {xscene: xworld.xscene}));
				xworld.startUpdate();
	        });
	}
}
