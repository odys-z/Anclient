<template>
	<div>
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
