import Vue from 'vue/dist/vue.js'
import VueRouter from 'vue-router';
import jframe from './framework/demo.app.vue'

Vue.use(VueRouter)

// User controls
// const Dashboard = { template: '<div>Dashboard Page</div>' }
//
// const router = new VueRouter({
//   routes: [
//     { path: '/',
//       name: 'Dashboard',
//       component: Dashboard,
//     },
//     { path: '/login',
//       name: 'Login',
//       component: jvue.Login,
//     },
//     { path: '/sys/params',
//       name: 'System Params',
//       component: Params,
//     },
//     { path: 'user-info',
//       name: 'Personal Info',
//       component: UserInfo,
//     },
//     { path: 'roles',
//       name: 'Roles',
//       component: jvue.Roles,
//     }
//   ]
// })
//
// var menu2 = [
// 	{ header: true,
// 	  title: 'Loading...'
// 	},
// 	{ separar: true },
// 	{ href: '/user-info',
// 	  title: 'Personal Info',
// 	  icon: 'fa fa-chart-area',
// 	  badge: {
// 		text: '*',
// 		class: 'badge-danger'
// 	  }
// 	},
// ];

/**Bind VLoing to div('#id'), set jserv root = jserv
 * @param {string} selector html DOM selector
 * @param {string} jserv semantic.jserv url root path
 * @param {string} homepage home page url loaded when logged in successfully
 */
export function appLogin(selector, jserv, homepage) {
	if (selector === undefined)
		selector = '#login';
	var app = new Vue(Object.assign({},
		jframe,
		{ el: selector, }));
	app.bindLogin(homepage, jserv);
	return app;
}

/**Bind VHome to div('#id'), set jserv root = jserv
 * @param {string} selector html DOM selector
 * @param {string} jserv semantic.jserv url root path
 */
export function appHome(selector, jserv) {
	if (selector === undefined)
		selector = '#home';
	var app = new Vue(Object.assign({},
		jframe,
		{ el: selector, }));
	app.bindHome(jserv);
	return app;
}
