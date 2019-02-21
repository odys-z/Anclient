import Vue from 'vue/dist/vue.js'
import VueRouter from 'vue-router';

// import SidebarMenu from '../lib/components/vue/menu/SidebarMenu.vue'
import jvue from '../../lib/view/vue/homepage.vue'

Vue.use(jvue)
Vue.use(VueRouter)

const Dashboard = { template: '<div>Dashboard Page</div>' }
const Charts = { template: '<div>Charts Page</div>' }
const Tables = { template: '<div>Tables Page</div>' }
const Auth = { template: '<div>Auth <router-view/></div>' }
const Login = { template: '<div>Login Page</div>' }
const Registration = { template: '<div>Registration Page</div>' }

const router = new VueRouter({
  routes: [
    {
      path: '/',
      name: 'Dashboard',
      component: Dashboard,
    },
    {
      path: '/charts',
      name: 'Charts',
      component: Charts,
    },
    {
      path: '/tables',
      name: 'Tables',
      component: Tables,
    },
    {
      path: '/auth',
      name: 'Auth',
      component: Auth,
      children: [
        {
          path: 'login',
          name: 'Login',
          component: Login,
        },
        {
          path: 'registration',
          name: 'Registration',
          component: Registration,
        }
      ]
    },
  ]
})

var menu2 = [
	{ header: true,
	  title: 'Count'
	},
	{ href: '/',
	  title: 'Contriessssssss',
	  icon: 'fa fa-user'
	},
	{ href: '/charts',
	  title: 'Map x',
	  icon: 'fa fa-chart-area',
	  badge: { text: 'Estonia',
	           class: 'badge-danger' }
	},
	{ href: '/tables',
	  title: 'Tables',
	  icon: 'fa fa-table'
	},
	{ href: '/disabled',
	  title: 'Disabled x',
	  icon: 'fa fa-cog',
	  disabled: true,
	  badge: { text: '2000', }
	},

	// Browser complain: ReferenceError: separator is not defined
	// { header: true,
	//   component: separator,
	//   visibleOnCollapse: true
	// },
	// so let's handle this in vue app.
	{ seperator: true},

	{ header: true,
	  title: 'German'
	},
];

Vue.component('sidebar-menu', SidebarMenu);

export function menu(id) {
	if (id === undefined)
		id = '#app';
	var obj = new Vue(Object.assign({}, jvue, { el: id }, {router: router}));
	obj.bindMenu(menu2);
	return obj;
}
