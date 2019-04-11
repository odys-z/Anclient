
var $J = new $J();
$J.init(null, "http://127.0.0.1:8080/semantic.jserv");

var ssClient;

function login() {
	$J.login("admin", "", function(client){
		ssClient = client;
		console.log(ssClient.ssInf);
		query();
	});
}

function query(conn) {
	var req = ssClient.query(conn, "a_user", "u", "test", {page: 0, size: 20});
	req.body[0]
		.expr("userName", "un").expr("userId", "uid").expr("roleName", "role")
		.j("a_roles", "r", "u.roleId = r.roleId")
		.whereCond("=", "u.userId", "'admin'");

	$J.post(req, function(resp) {
			console.log(resp);
		});
}
