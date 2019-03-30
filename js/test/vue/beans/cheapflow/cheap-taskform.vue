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
  import {Tree} from '../../../../dist/jvue-SNAPSHOT.min.js'

  // Vue.component('tree', Tree);

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
			console.log(jserv);
		},
		onSave: function(rec) {
			console.log('VCheap.onSave()');
		},
	}
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
