<!-- https://vuejs.org/v2/guide/forms.html -->
<template>
	<select v-model="selected">
		<option v-for="option in options"
				v-bind:value="option.value"
				@click="setCurrentSelectedOption(option);">
			{{ option.text }}
		</option>
	</select>
</template>

<script>
  export default {
	props: ['options', debug],
	data: {
		selected: 'A',
		options: [
			{ text: 'One', value: 'A' },
			{ text: 'Two', value: 'B' },
			{ text: 'Three', value: 'C' } ]
	},
	methods: {
		/**Listening to the event e.g:
		 * <vue-dropdown @onSelected = "myLocalSetterFunction($event)"></vue-dropdown>
		 * https://github.com/JonathanDn/vue-dropdown
		 */
		setCurrentSelectedOption(option) {
			this.$emit("onSelected", option);
		},
	},
  }
</script>
