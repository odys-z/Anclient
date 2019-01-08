var $J = new $J();
$J.init(null, "http://127.0.0.1:8080/semantic.jserv");

/*
var req = Protocol.query("a_functions", "f")
			.j("a_roles", "r", "r.roleId=f.roleId")
			.commit();
console.log(req);

$J.loadPage(req, -1, -1, function(resp) {
	console.log(resp);
});
*/

var ssClient;

function login() {
	$J.login("admin", "admin@admin", function(client){
		ssClient = client;
		console.log(ssClient.ssInf);
		query();
	});
}

function query() {
	var req = ssClient.query("a_user", "u", "test", {page: 0, size: 20});
	req.body[0]
		.expr("userName", "un").expr("userId", "uid").expr("roleName", "role")
		.j("a_roles", "r", "u.roleId = r.roleId")
		.whereCond("=", "u.userId", "'admin'");

	$J.post(req, function(resp) {
		console.log(resp);
		});
}

function load() {
	if (typeof ssClient === "undefined")
		login();

	var req = ssClient.query("e_devices", "d", "test", {page: 0, size: 20});
	req.body[0]
		.expr("a.areaid", "areaId").expr("a.areaName", "areaName")
		.expr("deviceId", "did").expr("deviceName", "dname").expr("fireStatus", "status")
		.j("e_areas", "a", "d.areaId = a.areaId")
		.whereCond("=", "a.areaId", "'000027'");

	$J.post(req, function(resp) {
		console.log(resp);
		});
}
