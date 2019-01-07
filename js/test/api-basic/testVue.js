var $J = new $J();
$J.init(null, "http://127.0.0.1:8080/semantic.jserv");

// console.log($J.cfg);
var ssClient;
$J.login("admin", "admin@admin", function(client){
	ssClient = client;
	console.log(ssClient);
});

/*
var req = Protocol.query("a_functions", "f")
			.j("a_roles", "r", "r.roleId=f.roleId")
			.commit();
console.log(req);

$J.loadPage(req, -1, -1, function(resp) {
	console.log(resp);
});
*/

function test() {
	testAES();
}
