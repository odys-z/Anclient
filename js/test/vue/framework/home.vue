<!-- Home Page Component -->
<template>
  <div id="home" :class="[{'collapsed' : collapsed}]">
	<h1>Banner - {{sysInfo.title}}</h1>
    <div class="home">
      <!--
      <div>select theme:
        <select v-model="selectedTheme">
          <option v-for="(theme, index) in themes" :key="index">{{theme == '' ? 'default-theme' : theme}}</option>
        </select>
      </div>
      <hr style="margin: 50px 0px;border: 1px solid #e3e3e3;">
      -->
      <sidebar-menu :menu="menu" :collapsed="collapsed" @collapse="onCollapse"
            :theme="selectedTheme" :showOneChild="true" @itemClick="onItemClick"/>
      <router-view/>
    </div>
  </div>
</template>

<script>
  import Vue from 'vue/dist/vue.js'
  import VueRouter from 'vue-router';

  import {_J, SessionClient, DatasetCfg} from '../../../dist/jclient-SNAPSHOT.min.js';
  import {SidebarMenu} from '../../../dist/jvue-SNAPSHOT.min.js'

  import Params from '../beans/sys/params.vue'
  import UserInfo from '../beans/sys/user-infos.vue'
  import Logout from '../beans/sys/logout.vue'
  import Roles from '../beans/sys/roles.vue'

  Vue.use(VueRouter)

  Vue.use(Logout)
  Vue.use(Roles)
  Vue.use(Params)
  Vue.use(UserInfo)

  const Dashboard = { template: '<div>Dashboard Page</div>' }

  Vue.component('sidebar-menu', SidebarMenu);

  const router = new VueRouter({
    routes: [
    { path: '/',
      name: 'Dashboard',
      component: Dashboard,
    },
    { path: '/logout',
      name: 'Logout',
      component: Logout,
    },
    { path: '/sys/params',
      name: 'System Params',
      component: Params,
    },
    { path: '/user-info',
      name: 'Personal Info',
      component: UserInfo,
    },
    { path: '/sys/roles',
      name: 'Roles',
      component: Roles,
    } ]
  })

  var menu2 = [
    { header: true,
      title: 'Static Default'
    },
    { href: '/',
      title: 'Dashboard',
      icon: 'fa fa-user'
    },
    { title: 'Multiple Level Functions',
      icon: 'fa fa-list-alt',
      child: [
        { href: '#',
          title: 'Module 1'
        },
        { title: 'Module 2',
          child: [
            { href: '#',
              title: 'Module 2.1'
            },
            { href: '#',
              title: 'Module 2.2'
            },
          ]
        },
      ]
    },
    { title: 'Administration',
      icon: 'fa fa-file',
      href: '/sys',
      child: [
        { href: '/sys/params',
          title: 'System Parameters',
          icon: 'fa fa-cog'
        },
        { href: '/sys/roles',
          title: 'Roles',
          icon: 'fa fa-lock'
        },
        { href: '/sys/workflow',
          title: 'Workflow Engine',
          icon: 'fa fa-unlock',
          disabled: true
        }
      ]
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


  var ssClient;

  /**See jclient.java/io.odysz.jsample.protocol.Samport */
  var Samport = {
	// static get menu() { return "menu.sample"; }
	menu: "menu.sample",
	cheapflow: "cheapflow.smaple"
  }

  var sk = new class {
	static get menu () {return "sys.menu.vue-sample"};
  }();

  // Now JMessage can handle user defined ports, e.g. servlet "menu.sample"
  _J.understandPorts(Samport);

  export default {
	name: 'VHome',
	router,
	// components: {
	// 	SidebarMenu
	// },
	created() {
	},

	data() {
		return {
			sysInfo: {
				title: 'SYSTEM TITLE',
			},
			menu: [
				{ header: true,
				  title: 'Loading...'
			}, ],
			collapsed: false,
			// themes: ['', 'white-theme'],
			selectedTheme: 'white-theme',
			currentRoute: '',
			/**Default DB connection */
			conn: 'jserv-sample',
		}
	},
	methods: {
		logout: function(url) {
			window.top.location = url;
		},
		onLoad: function(jserv, debugUser, debugPswd) {
			console.log('VHome.onLoad(): getting menu...');
			this.jserv = jserv;
			// $J = new J(jserv);
			ssClient = new SessionClient();
			// console.log(jserv);
			// this.menu = menu2;
			initHome(this, jserv, this.conn, debugUser, debugPswd);
		},
		onCollapse(collapsed) {
		  console.log(collapsed)
		  this.collapsed = collapsed
		},
		onItemClick(event, item) {
		  console.log('onItemClick')
		  console.log(event)
		  console.log(item)
		}
	}
  }

  function initHome(home, jserv, conn, debugUser, debugPswd) {
	_J.init(jserv, conn);

	if (ssClient === undefined || ssClient.ssInf === undefined) {
		// create a fake session client for debug
		_J.login(debugUser, debugPswd, function(client){
			ssClient = client;
			console.log(ssClient);
			loadMenu(home);
		});
	}
	else {
		console.log(ssClient);
		loadMenu(home);
	}
  }

  /**Compare with jclient.java/test/io.odysz.jclient.SemantiClientTest*/
  function loadMenu(homeVue) {
	var req = new DatasetCfg(homeVue.conn, sk.menu);
	var t = "menu";
	var act = { func: 'home.vue',
				cmd: 'load-menu',
				cate: t,
				remarks: 'test jclient.js loading menu from menu.sample'};
	var jmsg = ssClient.userReq(homeVue.conn, t, Samport.menu, act, req);
	ssClient.commit(jmsg, function(resp) {
		console.log(resp);
		homeVue.menu = resp.data.menu;
	});
  }
</script>

<style lang="scss">
	// This is a local caching for network problem in China, use the following if possible.
	// @import url('https://fonts.googleapis.com/css?family=Source+Sans+Pro:400,600');
	@import url('../../../lib/opensources/googlefonts.css');

	body,
	html {
	  margin: 0;
	  padding: 0;
	}

	body {
	  font-family: 'Source Sans Pro', sans-serif;
	  background-color: #f2f4f7;
	}

	#home {
	  padding-left: 350px;
	}

	#home.collapsed {
	  padding-left: 50px;
	}

	.home {
	  padding: 50px;
	}

	.badge-danger {
	  background-color: #ff2a2a;
	  color: #fff;
	}
</style>
