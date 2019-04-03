<!--Business Bean - Roles CRUD
	This component include a typical application senario of editing roles' rights.
 -->
<template>
	 <div>
		<h4 class='current-func'>ROLES v 0.1: {{title}}</h4>
		<modalog ref='role-details' :dlg-style='rolestyle'>
			<role-info slot='modal-form'/>
		</modalog>
		<modalog ref='another-dialog' :dlg-style='style2'>
			<div slot='modal-form' class='modal-body'>
				<p style='color:cyan'>Dialog 2</p>
				<p style='color:cyan'>Poppings</p>
			</div>
			<div slot='footer'>
				<button class="modal-default-button" @click="onClose('another-dialog')"> {{txt.ok}} </button>
			</div>
		</modalog>
		<listoolbar>
			<div slot='tools'>Condition Controls Goes Here
				<input type='button' :value='txt.search' @click='onQuery'></input>
				<input type='button' :value="txt.edit + ' - 1'" @click="onEdit('role-details')"
					title='modalog ref: role-details'></input>
				<input type='button' :value="txt.edit + ' - 2'" @click="onEdit('another-dialog')"
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

  //customize dialog
  var rolestyle = {
	ok: {text: 'zh:Confirm'},
	cancle: {text: 'zh:Cancle'}
  };

  var style2 = {
	ok: {text: 'zh:OK'},
	footer: {visible: false}
  };

  export default {
	name: 'VRoles',
	data() {
		return {
			title: 'Roles',
			rolestyle: rolestyle,
			style2: style2,
			currentRole: {},
			txt: {
				search: 'zh:Query',
				edit: 'zh:Edit',
				ok: 'Close by Roles',
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
			// this.dlgStyle = rolestyle;
			this.$refs[ref].pop(this.currentRole);
		},
		onClose: function(ref) {
			console.log('VRoles.onClose()');
			this.$refs[ref].onClose('cancle');
		},
	}
  }
</script>
<style>
</style>
