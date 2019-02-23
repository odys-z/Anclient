<template>
	<div>
		<list-toolbar/>
		<semantable/>
	</div>
</template>

<script>
  import {Listoolbar, Semantable} from '../../../../dist/jvue-0.0.1.min.js'

  export default {
	name: 'UserInfos',
	data () {
		return {
			users: []
		}
	}
  }
</script>

<style>
</style>
