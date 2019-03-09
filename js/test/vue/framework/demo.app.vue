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
  import VHome from './home.vue'

  import { animationMixin } from '../../../lib/view/vue/menu/mixin'

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
		bindLogin: function(home, jserv) {
			console.log('app.bindLogin():');
			this.jserv = jserv;
			console.log(this);

			// bind to div
			var login = new Vue(Object.assign({}, VLogin, { el: '#frame' }));
			login.home = home;
			login.onLoad(jserv);
		},
		bindHome: function(jserv, router) {
			console.log('app.bindHome(' + jserv + ')');
			this.jserv = jserv;
			// console.log(this);

			// bind to div
			var home = new Vue(Object.assign({},
				VHome,
				{ el: '#frame', }));

			// if (fakeSession) {
			// 	// use a fake session for develope, debuging
			// 	// When deployed, the local storage should working, this branch shouldn't reached
			// }
			home.onLoad(jserv, "admin", "admin@admin");
		},
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
