<template>
	<div>
		<h1>Params.vue</h1>
		<h5>toolebar here</h5>
		<list-toolbar/>
		<semantable/>
	</div>
</template>

<script>
  import Vue from 'vue/dist/vue.js'
  import {listToolbar, semantable} from '../../../../dist/jvue-SNAPSHOT.min.js'

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
