import Vue from 'vue/dist/vue.js'
import VueRouter from 'vue-router';

// import SidebarMenu from '../lib/components/vue/menu/SidebarMenu.vue'
// import jvue from '../../lib/view/vue/homepage.vue'
import jlib from '../../dist/jvue-0.0.1.min.js'

// import Params from './beans/sys/params.vue'
// import UserInfo from './beans/sys/user-infos.vue'

import jframe from './framework/demo.app.vu'

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
 */
export function appLogin(selector, jserv) {
	if (selector === undefined)
		selector = '#login';
	var obj = new Vue(Object.assign({},
		jvue, jframe,
		{ el: selector, }));
	obj.bindLogin(jserv);
	return obj;
}

/**Bind VHome to div('#id'), set jserv root = jserv
 * @param {string} selector html DOM selector
 * @param {string} jserv semantic.jserv url root path
 */
export function appHome(selector, jserv) {
	if (selector === undefined)
		selector = '#home';
	var obj = new Vue(Object.assign({},
		jvue, jframe,
		{ el: selector, }));
	obj.bindHome(jserv, router);
	return obj;
}
