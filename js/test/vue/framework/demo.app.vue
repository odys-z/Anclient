/* Application Frame
 * This component handling a typical application senario: link back and forth of login.vue and homepage.vue.
 * When customerized by index.js, it becomes a real application instance.
 */
<template>
	 <div id='frame'></div>
</template>
<script>
  import Vue from 'vue/dist/vue.js'
  import VLogin from './login.vue'
  // import VHome from './home.vue'
  import VHome from './home-try-static-slot.vue'

  import { animationMixin } from '../../../lib/view/vue/menu/mixin'

  // const Dashboard = { template: '<div>Dashboard Page</div>' }
  //
  // const router = new VueRouter({
  //   routes: [
  //   { path: '/',
  //     name: 'Dashboard',
  //     component: Dashboard,
  //   },
  //   { path: '/login',
  //     name: 'Login',
  //     component: jvue.Login,
  //   },
  //   { path: '/sys/params',
  //     name: 'System Params',
  //     component: Params,
  //   },
  //   { path: 'user-info',
  //     name: 'Personal Info',
  //     component: UserInfo,
  //   },
  //   { path: 'roles',
  //     name: 'Roles',
  //     component: jvue.Roles,
  //   } ]
  // })
  //
  // var menu2 = [
	// { header: true,
	//   title: 'Loading...'
	// },
	// { separar: true },
	// { href: '/user-info',
	//   title: 'Personal Info',
	//   icon: 'fa fa-chart-area',
	//   badge: {
	// 	text: '*',
	// 	class: 'badge-danger'
	//   }
	// },
  // ];

  export default {
	name: 'frame',
	components: { VLogin, VHome },

	props: {
		theme: [ 'default' ],
	},

	mixins: [animationMixin],

	data() { return {
		jserv: '',
		isLogin: false,
	} },

	created() { },
	methods: {
		bindLogin: function(jserv) {
			console.log('app.bindLogin():');
			this.jserv = jserv;
			console.log(this);

			// bind to div
			var login = new Vue(Object.assign({}, VLogin, { el: '#frame' }));
			login.onLoad(jserv);
		},
		bindHome: function(jserv, router) {
			console.log('app.bindHome(' + jserv + ')');
			this.jserv = jserv;
			console.log(this);

			// bind to div
			var home = new Vue(Object.assign({},
				VHome,
				{ el: '#frame',
				  // router: router
				}));
			home.onLoad(jserv);
		},

		// /**Bind VLoing to div('#id'), set jserv root = jserv
		//  * @param {string} selector html DOM selector
		//  * @param {string} jserv semantic.jserv url root path
		//  */
		// appLogin: function (selector, jserv) {
		// 	if (selector === undefined)
		// 		selector = '#login';
		// 	var obj = new Vue(Object.assign({},
		// 		jvue,
		// 		{ el: selector, }));
		// 	this.bindLogin(jserv);
		// 	return this;
		// }
		//
		// /**Bind VHome to div('#id'), set jserv root = jserv
		//  * @param {string} selector html DOM selector
		//  * @param {string} jserv semantic.jserv url root path
		//  */
		// appHome: function (selector, jserv) {
		// 	if (selector === undefined)
		// 		selector = '#home';
		// 	var obj = new Vue(Object.assign({},
		// 		jvue,
		// 		{ el: selector, }));
		// 	obj.bindHome(jserv, router);
		// 	return obj;
		// }
	},
	computed: { },
	watch: { },
	provide() { },
  }
  export * from './login.vue'
  export * from './home.vue'
</script>
<style>
</style>
