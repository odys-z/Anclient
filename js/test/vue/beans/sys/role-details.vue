<!--Sub-module of Roles CRUD
	This component include a typical application senario of editing roles' rights.
	TODO: should this module been abstracted as a typical UI component?
 -->
<template>
	 <div>
		<h4 class='current-func' v-if='title'>{{txt.title}}</h4>
		<div class='lay-block'>Left Panel</div>
		<div class="lay-block">
			<tree ref='tree1' :canDeleteRoot="true" :data='treeData' :draggable='true'
				:halfcheck='true' :multiple="true"/>
		</div>
	 </div>
</template>

<script>
  import Vue from 'vue/dist/vue.js'
  import {Tree} from '../../../../dist/jvue-SNAPSHOT.min.js'

  Vue.component('tree', Tree);

  export default {
	name: 'VRoleDetails',
	data() {
		return {
			title: true,
			currentRole: {},
			txt: {
				title: 'Role Details',
			},
			treeData: [{
		        title: 'System',
		        expanded: true,
		        children: [{
		          title: 'role 1-1',
		          expanded: true,
		          children: [{
		            title: 'role 1-1-1'
		          }, {
		            title: 'role 1-1-2'
		          }, {
		            title: 'role 1-1-3'
		          }]
		        }, {
		          title: 'role 1-2',
		          children: [{
		            title: "<span style='color: red'>role 1-2-1</span>"
		          }, {
		            title: "<span style='color: red'>role 1-2-2</span>"
		          }]
		        }]
		    }],
		}
	},
	methods: {
		onLoad: function(jserv) {
			console.log('Role Details.onLoad()');
			console.log(jserv);
		},
		onSave: function(rec) {
			console.log('VRole Details.onSave()');
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
