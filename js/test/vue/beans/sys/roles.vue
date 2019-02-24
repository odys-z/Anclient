<!--Application Frame
	This component is included a typical application senario frame, the demo.frame.vue.
	When customerized by index.js, it becomes a real application instance.
 -->
 <template>
	 <div>
		<h4 class='current-func'>{{title}}</h4>
		<modal-parent id='role-details'/>
		<list-toolbar>
			<div slot='tools'>Condition Controls Goes Here
				<input type='button' value='[txt.search]' @click='onQuery'></input>
			</div>
		</list-toolbar>
	 </div>
 </template>
 <script>
  import {Listoolbar, ModalParent} from '../../../dist/jvue-snapshot.min.js'

  Vue.component('modal-parent', ModalParent);
  Vue.component('list-toolbar', Listoolbar);

  export default {
	name: 'VRoles',
	data() {
		return {
			title: 'Roles',
			uid: '',
			pswd: '',
			txt: {
				search: 'zh:Query'
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
		onEdit: function() {
			console.log('VRoles.onEdit()');
		},
	}
  }
 </script>
 <style>
 </style>
