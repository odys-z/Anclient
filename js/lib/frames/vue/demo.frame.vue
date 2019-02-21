/* Application Frame
 * This component handling a typical application senario: link back and forth of login.vue and homepage.vue.
 * When customerized by index.js, it becomes a real application instance.
 */

<template>
	 <div id='app-frame'></div>
</template>
<script>
  import VLogin from './login.vue'
  import VHome from './homepage.vue'

  import { animationMixin } from '../../view/vue/menu/mixin'

  export default {
	name: 'frame',
	components: { VLogin, VHome },

	props: {
		theme: { 'default' },
	},

	mixins: [animationMixin],

	data() { return {
		isLogin: false,
	} },

	created() { },
	methods: { },
	computed: { },
	watch: { },
	provide() { },
  }

  export {VLogin, VHome, View}
</script>
<style>
</style>
