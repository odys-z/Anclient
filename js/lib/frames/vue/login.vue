<!--Application Frame
	This component is included a typical application senario frame, the demo.frame.vue.
	When customerized by index.js, it becomes a real application instance.
 -->
 <template>
	 <div>
		<h4>{{title}}</h4>
		<input id='login-userId' :bind='uid' class='login' placeholder="login Id"></input>
		<input id='login-pswd' :bind='pswd' class='pswd' placeholder="password"></input>
		<input type='button' value='ok' v-on:click='onOk("home.html")'></input>
	 </div>
 </template>
 <script>
  export default {
	name: 'VLogin',
	data() {
		return {
			title: 'Login',
			uid: '',
			pswd: '',
		}
	},
	methods: {
		onLoad: function(jserv) {
			console.log('VLogin.onLoad()');
			console.log(jserv);
		},
		onOk: function(url) {
			window.top.location = url;
			console.log('VLogin.onOk(' + url + ')');
		},
	}
  }
 </script>
 <style>
 </style>
