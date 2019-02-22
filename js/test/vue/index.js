import Vue from 'vue/dist/vue.js'
import VueRouter from 'vue-router';

// import SidebarMenu from '../lib/components/vue/menu/SidebarMenu.vue'
// import jvue from '../../lib/view/vue/homepage.vue'
import {VLogin, VHome} from '../../dist/jvue-0.0.1.min.js'

import Params from './beans/sys/params.vue'
import UserInfo from './beans/sys/user-infos.vue'

Vue.use(VLogin)
Vue.use(VHome)
Vue.use(VueRouter)

// User controls
const dashboard = { template: '<div>Dashboard Page</div>' }

const router = new VueRouter({
  routes: [
    { path: '/',
      name: 'Dashboard',
      component: Dashboard,
    },
    { path: '/login',
      name: 'Login',
      component: Login,
    },
    { path: '/sys/params',
      name: 'System Params',
      component: Params,
    },
    { path: 'user-info',
      name: 'Personal Info',
      component: UserInfo,
    },
    { path: 'roles',
      name: 'Roles',
      component: Roles,
    }
  ]
})

var menu2 = [
	{ header: true,
	  title: 'Loading...'
	},
	{ separar: true },
	{ href: '/user-info',
	  title: 'Personal Info',
	  icon: 'fa fa-chart-area',
	  badge: {
		text: '*',
		class: 'badge-danger'
	  }
	},
];


// Move to app.vue? ////////////////////////////////////////////////////////////
//
export function appLogin(id, jserv) {
	if (id === undefined)
		id = '#login';
	var obj = new Vue(Object.assign({},
		{ el: id,
		  // router: router,
		  components: { VLogin }
		}));
	obj.onLoad(jserv);
	return obj;
}


export function appHome(id, jserv) {
	if (id === undefined)
		id = '#home';
	var obj = new Vue(Object.assign({},
		{ el: id,
		  router: router,
		  components: { VHome }
		}));
	obj.onLoad(jserv);
	return obj;
}
