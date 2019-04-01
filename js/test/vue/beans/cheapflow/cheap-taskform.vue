<!--A generic workflow component can be used as a basic workflow form.
	The task details slot can be used to show business information.
	The task-details.vue is used showing how to use this component.
 -->
<template>
	<div>
		<h4 class='current-func' v-if='txt.title'>{{txt.title}}</h4>
		<div class='lay-block'>
			<div>{{wf.name}} - {{task.name}}</div>
			<semantable id='list' :heads='colHeads'>
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

  const colHeads = [
	  {col: 'instId', hidden: true, },
	  {col: 'sort', txt: 'zh:SORT'},
	  {col: 'nodeName', txt: 'zh:N-NAME'},
	  {col: 'nodeId', txt: 'zh:N-NAME'},
  ];

  export default {
	name: 'VCheapFlow',
	props: ['J', 'vargs',],
	data() {
		return {
			colHeads: colHeads,
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
		// console.log(this.J);
		_J = this.J;
		_client = this.vargs.jclient;
		_args = this.vargs.args;
		_ports = this.vargs.ports;
		loadFlow(_client, _args);
	}
  }

  var _J;
  var _client;
  var _args;
  var _ports;

  function loadFlow(jclient, args) {
	var req = new CheapReq()
		.loadFlow(args.wfId, args.tskId);

	var t = chpEnumReq.load;
	var act = { func: 'cheap',
				cmd: 'load',
				cate: t,
				remarks: 'test loading flow'};
	var jmsg = jclient.userReq(null, t, _ports.cheapflow, act, req);
	jclient.commit(jmsg, function(resp) {
		console.log(resp);
	 	var semantbl = new Vue(Object.assign({}, Semantable, { el: "#list" }));

		// semantbl.bind(resp.rs[0][0], resp.rs[0].slice(1));
		var ths = _J.respCols(resp);
		var trs = _J.respRows(resp);
		semantbl.bind(ths, trs, colHeads);
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
