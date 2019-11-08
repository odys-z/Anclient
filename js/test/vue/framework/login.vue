<!--Application Frame
	This component is included a typical application senario frame, the demo.frame.vue.
	When customerized by index.js, it becomes a real application instance.
 -->
<template>
	<div>
		<h4>{{title}}</h4>
		<input id='login-userId' v-model='uid' class='login' placeholder="login Id" required></input>
		<input id='login-pswd' v-model="pswd" class='pswd' type="password" placeholder="password" required></input>
		<input type='button' value='ok' v-on:click='onLogin()'></input>
	</div>
</template>
<script>
  import {J} from '../../../dist/anclient-SNAPSHOT.min.js';

  var $J;
  var ssClient;

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
			var home = this.home;

			$J.login(this.uid, this.pswd, function(client){
				ssClient = client;
				console.log(ssClient.ssInf);
				window.top.location = home;
			});
		},
	}
  }
</script>
<style>
</style>
