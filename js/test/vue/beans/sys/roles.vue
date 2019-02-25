<!--Application Frame
	This component is included a typical application senario frame, the demo.frame.vue.
	When customerized by index.js, it becomes a real application instance.
 -->
 <template>
	 <div>
		<h4 class='current-func'>{{title}}</h4>
		<modalog ref='role-details'>
			<role-info/>
		</modalog>
		<modalog ref='another-dialog'>
			<another-dialog/>
		</modalog>
		<listoolbar>
			<div slot='tools'>Condition Controls Goes Here
				<input type='button' value='[txt.search]' @click='onQuery'></input>
				<input type='button' value='[txt.edit]' @click="onEdit('role-details')"></input>
			</div>
		</listoolbar>
	 </div>
 </template>

 <script>
  import Vue from 'vue/dist/vue.js'
  import {Listoolbar, Modalog} from '../../../../dist/jvue-SNAPSHOT.min.js'

  Vue.component('modal-parent', Modalog);
  Vue.component('listoolbar', Listoolbar);

  const roleForm = { template: '<div><h1>Role Details</h1><p>form content ...</p></div>' }
  Vue.component('role-info', roleForm);
  const antForm = { template: '<div><h1>Another Details</h1><p>Another content ...</p></div>' }
  Vue.component('another-dialog', antForm);

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
			this.$refs[ref].pop(currentRole);
		},
	}
  }
 </script>
 <style>
 </style>
