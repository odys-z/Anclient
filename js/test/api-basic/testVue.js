
import VueGoodTablePlugin from 'vue-good-table';

// import the styles
import 'vue-good-table/dist/vue-good-table.css'

Vue.use(VueGoodTablePlugin);

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

////////////////////////////////////////////////////////////////////////////////

export default {
  name: 'my-component',
  data(){
    return {
      columns: [
        {
          label: 'Name',
          field: 'name',
        },
        {
          label: 'Age',
          field: 'age',
          type: 'number',
        },
        {
          label: 'Created On',
          field: 'createdAt',
          type: 'date',
          dateInputFormat: 'YYYY-MM-DD',
          dateOutputFormat: 'MMM Do YY',
        },
        {
          label: 'Percent',
          field: 'score',
          type: 'percentage',
        },
      ],
      rows: [
        { id:1, name:"John", age: 20, createdAt: '201-10-31:9: 35 am',score: 0.03343 },
        { id:2, name:"Jane", age: 24, createdAt: '2011-10-31', score: 0.03343 },
        { id:3, name:"Susan", age: 16, createdAt: '2011-10-30', score: 0.03343 },
        { id:4, name:"Chris", age: 55, createdAt: '2011-10-11', score: 0.03343 },
        { id:5, name:"Dan", age: 40, createdAt: '2011-10-21', score: 0.03343 },
        { id:6, name:"John", age: 20, createdAt: '2011-10-31', score: 0.03343 },
      ],
    };
  },
};
