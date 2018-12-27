var japi = new Japi();
japi.init("test.jserv", "http://127.0.0.1:8080/semantic.jserv");

console.log(japi.jserv);

var req = protocol.query("a_functions", "f")
			.j("a_roles", "r", "r.roleId=f.roleId")
			.commit();
console.log(req);

japi.loadPage(req, -1, -1, function(resp) {
	console.log(resp);
});
