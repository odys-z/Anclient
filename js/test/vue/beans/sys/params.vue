<template>
	<div>
		<h1>Params.vue</h1>
		<h5>toolebar here</h5>
		<list-toolbar/>
		<semantable/>
	</div>
</template>

<script>
  import {listToolbar, semantable} from '../../../../dist/jvue-0.0.1.min.js'

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
