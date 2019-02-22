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
  import VHome from './homepage.vue'

  import { animationMixin } from '../../view/vue/menu/mixin'

  export default {
	name: 'frame',
	components: { VLogin, VHome },

	props: {
		theme: [ 'default' ],
	},

	mixins: [animationMixin],

	data() { return {
		isLogin: false,
	} },

	created() { },
	methods: {
		bindLogin: function(jserv) {
			console.log('Frame.bindLogin():');
			this.jserv = jserv;
			console.log(this);

			// bind to div
			var login = new Vue(Object.assign({}, VLogin, { el: '#frame' }));
			login.onLoad(jserv);
		},
		bindHome: function(jserv, router) {
			console.log('Frame.bindHome(' + jserv + ')');
			this.jserv = jserv;
			console.log(this);

			// bind to div
			var home = new Vue(Object.assign({},
				VHome,
				{ el: '#frame',
				  router: router }));
			home.onLoad(jserv);
		},
	},
	computed: { },
	watch: { },
	provide() { },
  }
  export * from './login.vue'
  export * from './homepage.vue'
</script>
<style>
</style>
