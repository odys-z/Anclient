<template>
	<div>
		<list-toolbar/>
		<semantable/>
	</div>
</template>

<script>
  import Vue from 'vue/dist/vue.js'
  import {Listoolbar, Semantable} from '../../../../dist/jvue-SNAPSHOT.min.js'

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
