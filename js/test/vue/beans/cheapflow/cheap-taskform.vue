<!--A generic workflow component can be used as a basic workflow form.
	The task details slot can be used to show business information.
	The task-details.vue is used showing how to use this component.
 -->
<template>
	<div>
		<h4 class='current-func' v-if='txt.title'>{{txt.title}}</h4>
		<div class='lay-block'>
			<div>{{wf.name}} - {{task.name}}</div>
			<semantable id='list' :th='th' :options='{single: true}' :debug='true'/>
		</div>
		<slot name='details'>
			<h1>Task Details {{txt.title}}</h1>
		</slot>
	</div>
</template>

<script>
  import Vue from 'vue/dist/vue.js'
  // import {_J, SessionClient, DatasetCfg} from '../../../dist/jclient-SNAPSHOT.min.js';
  import {CheapReq, chpEnumReq} from   '../../../../dist/jclient-SNAPSHOT.min.js';
  import {Semantable} from '../../../../dist/jvue-SNAPSHOT.min.js'

  Vue.component('semantable', Semantable);

  const th = [
	  {expr: 'instId', visible: false,},
	  {expr: 'checked', check: true, text: '',},
	  {expr: 'sort', text: 'zh:SORT', cellStyle: 'color:red',},
	  {expr: 'nodeName', text: 'zh:N-NAME', cellStyle: 'text-align: center',},
	  {expr: 'nodeId', visible: false,},
	  {expr: 'taskId', visible: false,},
	  {expr: 'handleTxt', text: 'zh:HANDLE TXT',},
	  {expr: 'descpt', text: 'zh:DES'},
	  {expr: 'oper', text: 'zh:OPER',},
	  {expr: 'opertime', text: 'zh:DATE',},
  ];

  export default {
	name: 'VCheapFlow',
	props: ['vargs'],
	data() {
		return {
			th: th,
			wf: {
				name: 'wf-name',
			},
			/** workflow configured nodes that showing as a list*/
			nodes: {
			},
			task: {
				name: '',
			},
			currentInst: {},
			txt: {
				title: 'TITLE - cheap-taskform.vue',
			},
		};
	},
	methods: {
		onLoad: function(jserv) {
			console.log('VCheap.onLoad()');
			console.log(J);
		},
		onSave: function(rec) {
			console.log('VCheap.onSave()');
		},
	},
	mounted() {
		console.log('VCheap.mounted()');
		console.log(this.vargs.J);
		_J = this.vargs.J;
		_debug = this.vargs.debug;
		_client = this.vargs.jclient;
		_args = this.vargs.args;
		_port = this.vargs.port;
		loadFlow(_client, _args);
	}
  }

  var _J;
  var _client;
  var _args;
  var _port;
  var _debug;

  function loadFlow(jclient, args) {
	var req = new CheapReq()
		.loadFlow(args.wfId, args.taskId);

	var t = chpEnumReq.load;
	var act = { func: 'cheap',
				cmd: 'load',
				cate: t,
				remarks: 'test loading flow'};
	var jmsg = jclient.userReq(null, t, _port, act, req);
	jclient.commit(jmsg, function(resp, J) {
		console.log(resp);
	 	var semantbl = new Vue(Object.assign({}, Semantable, { el: "#list" }));

		// semantbl.bind(resp.rs[0][0], resp.rs[0].slice(1));
		var ths = _J.respCols(resp);
		var trs = _J.respRows(resp);
		semantbl.bind(ths, trs, th);
	});
  }

  // Backup for roles.vue - will be moved in the future
  // function loadFlow(jclient) {
	// var req = jclient.query(null, "a_user", "u", {page: 0, size: 20});
	// 	req.body[0]
	// 		.expr("userName", "un").expr("userId", "uid").expr("roleName", "role")
	// 		.j("a_roles", "r", "u.roleId = r.roleId")
	// 		.whereCond("=", "u.userId", "'admin'");
  //
	// 	_J.post(req, function(resp) {
	// 		console.log(resp);
	//  		var semantbl = new Vue(Object.assign({}, Semantable, { el: "#list" }));
  //
	// 		// semantbl.bind(resp.rs[0][0], resp.rs[0].slice(1));
	// 		var ths = _J.respCols(resp);
	// 		var trs = _J.respRows(resp);
	// 		semantbl.bind(ths, trs);
	// 	});
  // }
</script>
<style>
  .lay-block{
	float: left;
	width: 50%;
	padding: 3px;
	box-sizing: border-box;
	border: 1px dotted #ccccdd;
	overflow: auto;
	/* height: 600px; */
  }
</style>
