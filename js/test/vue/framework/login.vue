<!--Application Frame
	This component is included a typical application senario frame, the demo.frame.vue.
	When customerized by index.js, it becomes a real application instance.
 -->
<template>
	<div>
		<h4>{{title}}</h4>
		<input id='login-userId' :bind='uid' class='login' placeholder="login Id"></input>
		<input id='login-pswd' :bind='pswd' class='pswd' placeholder="password"></input>
		<input type='button' value='ok' v-on:click='onLogin()'></input>
	</div>
</template>
<script>
  import {J} from '../../../dist/jclient-SNAPSHOT.min.js';

  var $J;

  export default {
	name: 'VLogin',
	data() {
		return {
			title: 'Demo Login',
			uid: '',
			pswd: '',
			home: 'index.html',
			jserv: '',
		}
	},
	methods: {
		onLoad: function(jserv) {
			console.log('VLogin.onLoad()');
			console.log(jserv);
			this.jserv = jserv;
			$J = new J(jserv);
		},
		onLogin: function() {
			// window.top.location = this.home;
			console.log('VLogin.onLogin(' + this.home + ')');

			$J.login("admin", "admin@admin", function(client){
				ssClient = client;
				console.log(ssClient.ssInf);
			});
		},
	}
  }
</script>
<style>
</style>
