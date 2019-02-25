<template>
	<div><slot name='tools'></slot></div>
</template>

<script>
  export default {
	name: 'Listoolbar',
	data() {
		return {
			// register query data
			query: ''
		}
	}
  }
</script>

<style >
</style>
