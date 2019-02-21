import Vue from 'vue/dist/vue.js'
import VueRouter from 'vue-router';

// import SidebarMenu from '../lib/components/vue/menu/SidebarMenu.vue'
// import jvue from '../../lib/view/vue/homepage.vue'
import {jvue, Login} from '../../dist/jvue-0.0.1.min.js'

import Params from './beans/sys/params.vue'

Vue.use(jvue)
Vue.use(VueRouter)

// User controls
const dashboard = { template: '<div>Dashboard Page</div>' }

const router = new VueRouter({
  routes: [
    { path: '/',
      name: 'Dashboard',
      component: Dashboard,
    },
    { path: '/charts',
      name: 'Charts',
      component: Charts,
    },
    { path: '/tables',
      name: 'Tables',
      component: Tables,
    },
    { path: '/sys',
      name: 'System',
      component: Auth,
      children: [
        { path: 'login',
          name: 'Login',
          component: Login,
        },
        { path: 'registration',
          name: 'Registration',
          component: Registration,
        }
      ]
    },
  ]
})

var menu2 = [
	{ header: true,
	  title: 'Loading...'
	},
	{ separar: true },
	{ href: '/userInfo',
	  title: 'Personal Info',
	  icon: 'fa fa-chart-area',
	  badge: {
		text: '*',
		class: 'badge-danger'
	  }
	},
];

// Vue.component('sidebar-menu', SidebarMenu);

export function menu(id) {
	if (id === undefined)
		id = '#app';
	var obj = new Vue(Object.assign({}, jvue, { el: id }, {router: router}));
	obj.bindMenu(menu2, dashboard);
	return obj;
}
