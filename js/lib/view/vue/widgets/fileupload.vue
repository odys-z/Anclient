<!-- https://vuejs.org/v2/guide/forms.html -->
<template>
	<ol>
		<li v-for="file in files"
			v-bind:value="file.name"
			@click="remove(file.id);"
			v-bind:title="tooltip">
			{{ file.name }}
		</li>
	</ol>
	<input type="file" value="" placeholder="add local file" ></input>
	<input type="button" value="upload" ></input>
</template>

<script>
  export default {
	props: ['options', 'debug'],
	data: {
		tooltip: "click to remove the file",
		files: [],
	},
	methods: {
		upload() {
		},
		remove(fileId) {
			for (var ix = 0; ix < files.length; ix++) {
				if (files[ix].id === fileId) {
					files.remove(ix);
					break;
				}
			}
		},
	},
	onMounted() {
		if (this.options.tooltip !== undefined)
			this.tooltip = this.options.tooltip;
	}
  }
</script>
