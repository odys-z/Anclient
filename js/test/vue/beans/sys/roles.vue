<!--Business Bean - Roles CRUD
	This component include a typical application senario of editing roles' rights.
 -->
<template>
	 <div>
		<h4 class='current-func'>ROLES v0.1: {{title}}</h4>
		<modalog ref='role-details'>
			<div slot='modal-form'>
				<p style='color:blue'>Dialog 1</p>
				<p style='color:blue'>Poppings</p>
			</div>
		</modalog>
		<modalog ref='another-dialog'>
			<div slot='modal-form'>
				<p style='color:cyan'>Dialog 2</p>
				<p style='color:cyan'>Poppings</p>
			</div>
		</modalog>
		<listoolbar>
			<div slot='tools'>Condition Controls Goes Here
				<input type='button' :value='[txt.search]' @click='onQuery'></input>
				<input type='button' :value="[txt.edit] + ' - 1'" @click="onEdit('role-details')"
					title='modalog ref: role-details'></input>
				<input type='button' :value="[txt.edit] + ' - 2'" @click="onEdit('another-dialog')"
					title='modalog ref: another-dialog'></input>
			</div>
		</listoolbar>
	 </div>
</template>

<script>
  import Vue from 'vue/dist/vue.js'
  import {Listoolbar, Modalog} from '../../../../dist/jvue-SNAPSHOT.min.js'

  import RoleForm from './role-details.vue'

  // Component from JVue
  Vue.component('modalog', Modalog);
  Vue.component('listoolbar', Listoolbar);

  // Application Beans
  Vue.component('role-info', RoleForm);

  const antForm = { template: '<div><h1>Dialog 2</h1><p>Another content ...</p><slot name="modal-form">x</slot></div>' }
  Vue.component('another-info', antForm);

  export default {
	name: 'VRoles',
	data() {
		return {
			title: 'Roles',
			currentRole: {},
			txt: {
				search: 'zh:Query',
				edit: 'zh:Edit',
			}
		}
	},
	methods: {
		onLoad: function(jserv) {
			console.log('VRoles.onLoad()');
			console.log(jserv);
		},
		onQuery: function() {
			console.log('VRoles.onQuery()');
		},
		onEdit: function(ref) {
			console.log('VRoles.onEdit()');
			this.$refs[ref].pop(this.currentRole);
		},
	}
  }
</script>
<style>
</style>
