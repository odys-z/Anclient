/* This is a pack to register all components implemented in view/vue/ *.vue.
	After reading vue docs many times, it's still not sure if this is the correct
	way to provide all vue components as lib. See
	https://vuejs.org/v2/guide/components-registration.html
	The component can not been imported as named component. See
	https://github.com/vuejs/vue-loader/issues/1234
	But user shouldn't import every UI wedget one by one. So we provided them in a pack.
<template>
	<div>
	</div>
</template>
<script>
 */
  // import Vue from 'vue/dist/vue.js'
  import Listoolbar from './mixins/listoolbar.vue'
  import Semantable from './table/semantable.vue'
  import SidebarMenu from './menu/sidebarMenu.vue'

  // Vue.component('SidebarMenu', SidebarMenu);
  // Vue.component('sidebar-menu', SidebarMenu);

  // export default {
	// name: 'jcomponents',
	// components: {
	// 	Listoolbar, Semantable,
	// },
	// data() {
	// 	return {};
	// }
	// 		// register globally
	// 		// https://vuejs.org/v2/guide/components-registration.html#Local-Registration
	// 		// https://github.com/chrisvfritz/vue-enterprise-boilerplate/blob/master/src/components/_globals.js
	// 		// Vue.component(componentName, componentConfig.default || componentConfig);
	// 		// Vue.component('SidebarMenu', SidebarMenu);
  // }

  export {default as SidebarMenu} from './menu/sidebarMenu.vue'
/*
</script>
*/
