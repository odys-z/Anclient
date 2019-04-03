<!--Business Bean - Cheap-flow CRUD
	This component include a typical application senario of workflow handling.
 -->
<template>
	 <div>
		<h4 class='current-func'>{{title}}</h4>
		<modalog ref='flow-details' :dlg-style='flowstyle'>
			<flow-form slot='modal-form' :vargs='crud'/>
		</modalog>
		<listoolbar>
			<div slot='tools'>Condition Controls Goes Here
				<input type='button' :value='txt.search' @click='onQuery'></input>
				<input type='button' :value="txt.edit" @click="onEdit('flow-details')"
					title='modalog ref: role-details'></input>
			</div>
		</listoolbar>
	 </div>
</template>

<script>
  import _ from 'lodash'
  import Vue from 'vue/dist/vue.js'
  import {Listoolbar, Modalog} from '../../../../dist/jvue-SNAPSHOT.min.js'
  // import {Samport} from '../../framework/port.js'

  import CheapForm from './cheap-taskform.vue'

  // Component from JVue
  Vue.component('modalog', Modalog);
  Vue.component('listoolbar', Listoolbar);

  // Application Beans
  Vue.component('flow-form', CheapForm);

  //customize dialog
  const flowstyle = {
	ok: {text: 'zh:Confirm'},
	cancle: {text: 'zh:Cancle'}
  };

  // var crud = {
	//   J: null,
	//   jclient: null,	// will be initialized once logged in.
	//   // port: null,
	//   // args are explained by views (Semantics only understood by business)
	//   // wfId and taskId are for testing, shouldn't handled by home.vue
	//   // - cheap-tskform.vue need it to load a form.
	//   // In a crud senario, it should be used to communicate between main lists and popping forms.
	//   args: {wfId: 't01', taskId: '000001'},
  // };

  export default {
	name: 'VRoles',
	props: ['J', 'vargs', 'debug'],
	data() {
		return {
			title: '',
			crud: {J: null, jclient: {}, args: {}, debug: true},
			flowstyle: flowstyle,
			txt: {
				search: 'zh:Query',
				edit: 'zh:Edit',
			}
		}
	},
	methods: {
		onLoad: function(jserv) {
			console.log('VTasks.onLoad()');
			console.log(jserv);
		},
		onQuery: function() {
			console.log('VTasks.onQuery()');
		},
		onEdit: function(ref) {
			console.log('VTasks.onEdit()');
			// this.dlgStyle = rolestyle;
			this.$refs[ref].pop(this.currentRole);
		},
	},
	mounted() {
		console.log('VTasks.mounted()');
		this.crud.J = this.J;
		console.log(this.vargs.jclient);
		this.crud.jclient = this.vargs.jclient;
		_.merge(this.crud.args, this.vargs.args);
		console.log(this.crud.args);
		this.crud.port = this.J.port('cheapflow');
	}
  }
</script>
<style>
</style>
