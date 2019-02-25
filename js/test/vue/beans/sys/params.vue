<template>
	<div>
		<h1>Params.vue</h1>
		<h5>toolebar here</h5>
		<listoolbar/>
		<semantable/>
	</div>
</template>

<script>
  import Vue from 'vue/dist/vue.js'
  import {Listoolbar, Semantable} from '../../../../dist/jvue-SNAPSHOT.min.js'

  Vue.component('listoolbar', Listoolbar);
  Vue.component('semantable', Semantable);

  export default {
	  name: 'SysParams',
	  data () {
		  return {
			  paras: []
		  }
	  }
  }
</script>

<style>
</style>
