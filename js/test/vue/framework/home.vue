<!-- Home Page Component -->
<template>
  <div id="home" :class="[{'collapsed' : collapsed}]">
	<slot name='banner'>
		<h1>Banner - {{sysInfo.title}}</h1>
	</slot>
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
  // import { animationMixin } from '../../view/vue/menu/mixin'

  import jvue from '../../../dist/jvue-0.0.1.min.js'

  import Params from './beans/sys/params.vue'
  import UserInfo from './beans/sys/user-infos.vue'

  Vue.use(VueRouter)

  Vue.use(Params)
  Vue.use(UserInfo)

  const Dashboard = { template: '<div>Dashboard Page</div>' }

  const router = new VueRouter({
    routes: [
    { path: '/',
      name: 'Dashboard',
      component: Dashboard,
    },
    { path: '/login',
      name: 'Login',
      component: jvue.Login,
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
      component: jvue.Roles,
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

  export default {
	name: 'VHome',
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
		}
	},
	methods: {
		logout: function(url) {
			window.top.location = url;
		},
		onLoad: function(jserv) {
			console.log('VHome.onLoad()');
			console.log(jserv);
		},
	    onCollapse(collapsed) {
	      console.log(collapsed)
	      this.collapsed = collapsed
	    },
	    onItemClick(event, item) {
	      console.log('onItemClick')
	      // console.log(event)
	      // console.log(item)
	    }
	}
}
</script>

<style lang="scss">
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
