
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

function load() {
	if (typeof obj7 === "undefined") {
		testVue();
		// FIXME not correct
		alert('try again');
		return;
	}

	if (typeof ssClient === "undefined")
		login();

	// This asynchronized process will report error, but enough to show how to use JClient.js with vue.js.
	var req = ssClient.query("e_devices", "d", "test", {page: 0, size: 20});
	req.body[0]
		.expr("a.areaid", "areaId").expr("a.areaName", "areaName")
		.expr("deviceId", "id").expr("deviceName", "text").expr("fireStatus", "status")
		.j("e_areas", "a", "d.areaId = a.areaId")
		.whereCond("=", "a.areaId", "'000027'");

	$J.post(req, function(resp) {
		console.log(resp);
		obj7.groceryList = Protocol.rs2arr(resp.rs[0]);
		});
}

////////////////////////////////////////////////////////////////////////////////

Vue.component('comp-item', {
	// The compItem component now accepts a
	// "prop", which is like a custom attribute.
	// This prop is called 'rec'.
	props: ['rec'],
	template: '<li>Vue Item [ID: {{ rec.id }}] The item text: {{ rec.text }}</li>'
});

var obj7;

function testVue() {
	obj7 = new Vue({
		el: '#obj-7',
		data: {
		groceryList: [
				{ id: 0, text: 'Vegetables' },
			] }
	});
}
