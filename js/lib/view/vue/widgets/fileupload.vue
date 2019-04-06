<!-- https://vuejs.org/v2/guide/forms.html -->
<template>
	<ol>
		<li v-for="file in files"
				v-bind:value="file.name"
				@click="remove(file.id);">
			{{ option.text }}
		</li>
	</ol>
	<input type="file" value="" placeholder="add local file" ></input>
	<input type="button" value="upload" ></input>
</template>

<script>
  export default {
	props: ['options', 'debug'],
	data: {
		options: [],
		files: [],
	},
	methods: {
		upload() {
		},
		remove(fileId) {
			for (var ix = 0; ix < files.length; ix++) {
			}
		},
	},
  }
</script>
