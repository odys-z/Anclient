<!--A generic workflow component can be used as a basic workflow form.
	The task details slot can be used to show business information.
	The task-details.vue is used showing how to use this component.
 -->
<template>
	<div>
		<h4 class='current-func' v-if='title'>{{txt.title}}</h4>
		<div class='lay-block'>{{wf.name}}</div>
		<div class="lay-block">
			<!--
			<tree ref='tree1' :canDeleteRoot="true" :data='treeData' :draggable='true'
				:halfcheck='true' :multiple="true"/>
			-->
			<semantable/>
		</div>
	</div>
	<slot name='details'>
		<h1>Task Details {{txt.title}}</h1>
	</slot>
</template>

<script>
  import Vue from 'vue/dist/vue.js'
  import {_J, SessionClient, DatasetCfg} from '../../../dist/jclient-SNAPSHOT.min.js';
  import {Semantable} from '../../../../dist/jvue-SNAPSHOT.min.js'

  // Vue.component('tree', Tree);

  Vue.component('semantable', Semantable);

  export default {
	name: 'VCheapFlow',
	data() {
		return {
			wf: {
				name: 'wf-name',
			}
			/** workflow configured nodes that showing as a list*/
			nodes: {
			}
			currentInst: {},
			txt: {
				title: 'TITLE',
			},
		},
	},
	methods: {
		onLoad: function(jserv) {
			console.log('VCheap.onLoad()');
			loadFlow();
		},
		onSave: function(rec) {
			console.log('VCheap.onSave()');
		},
	}
  }

  function loadFlow(ssClient) {
	var req = ssClient.query("a_user", "u", "test", {page: 0, size: 20});
		req.body[0]
			.expr("userName", "un").expr("userId", "uid").expr("roleName", "role")
			.j("a_roles", "r", "u.roleId = r.roleId")
			.whereCond("=", "u.userId", "'admin'");

		J.post(req, function(resp) {
			console.log(resp);
			// bind
			// bind(resp);
			// semantbl.bind(resp.rs[0][0], resp.rs[0].slice(1));

			// working: semantbl.bind();
			semantbl.bind();
			// semantbl.bind(resp.rs[0][0], resp.rs[0].slice(1));
		});
  }
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
