<!-- https://vuejs.org/v2/guide/forms.html -->
<template>
	<div>
		<div v-if="files.length === 0" class='nofile'>No File Selected</div>
		<ol style="display:flex">
			<li style="display:flow-root; padding: 1em"
				v-for="file in files"
				v-bind:value="file.name"
				@click="remove(file.id);"
				v-bind:title="tooltip">
				<img :src="file.src" class="preview"></img>
				<div class="progress" :id="'up-' + file.id"/>
				<div style="width: 6em; transform: translate(0, -60px);">{{file.info}}</div>
			</li>
		</ol>
		<input type="file" ref="fileElem" multiple accept="image/*"
			placeholder="add local file" @change="handleFiles" style="display:none" >
		<a href="#" id="fileSelect" @click="triggerFiels">Select some files</a>
		<input type="button" value="upload" @click="upload"></input>
	</div>
</template>

<script>
  import $ from 'jquery'
  import * as ProgressBar from '../../../opensources/progressbar.js'

  // Vue.component('progress-circle', ProgressBar.circle);

  export default {
	name: 'file-upload',
	props: ['options', 'debug'],
	data: () => ({
		tooltip: "click to remove the file",
		// 'http://localhost:8080/semantic.jserv/file.serv?t=upload&file=',
		serv: 'http://localhost:8080/semantic.jserv/file.serv',
		files: [],
		file_seq: 0,
	}),
	methods: {
		upload() {
			for (let i = 0; i < this.files.length; i++) {
				var f = this.files[i];
				if (f.upload == true)
					continue;
				var progId = '#up-' + f.id;
				f.upload = true;
				this.fileUpload(progId, f.file, f);
			}
		},

		remove(fileId) {
			for (var ix = 0; ix < this.files.length; ix++) {
				var finf = this.files[ix];
				if (finf.id === fileId) {
					// uploaded file can't been removed
					if (!finf.upload)
						this.files.splice(ix, 1);
					break;
				}
			}

			// var fileInfs = this.$refs.fileElem.files;
			// for (var ix = 0; ix < fileInfs.length; ix++) {
			// 	if (fileInfs[ix].id === fileId) {
			// 		fileInfs.splice(ix, 1);
			// 		break;
			// 	}
			// }
		},

		triggerFiels() {
			this.$refs.fileElem.click();
		},

		handleFiles() {
			console.log('handleFiles:');
			var fileInfs = this.$refs.fileElem.files;
			console.log(fileInfs);

			var reg = /\s+|\.+/gi

			if (fileInfs !== undefined && fileInfs.length > 0) {
				/* Design Memo:
				 * You can modify this logic to remove already selected files by user.
				 * Modifying the source, that's how opensource working.
				 * this.files = [];
				 */
				for (let i = 0; i < fileInfs.length; i++) {
					var f = fileInfs[i];
					this.files.push({ id: this.file_seq++ + '-' + f.name.replace(reg, '_'),
						filename: f.name,
						info: f.name + " [" + f.size + "]",
						sise: f.size,
					 	src: window.URL.createObjectURL(f),
						upload: false,
						file: f});
				}
			}
		},

		fileUpload(throbId, file, fileInf) {
			const that = this;
			var circle = this.createThrobber(throbId);

			var formData = new FormData();
			formData.append("file", file, file.name);

			// 'http://localhost:8080/semantic.jserv/file.serv?t=upload&file='
			var servUrl = this.serv + '?t=upload';
			$.ajax({
				type: "POST",
				url: servUrl,
				xhr: function () {
					var myXhr = $.ajaxSettings.xhr();
					if (myXhr.upload) {
						// use event handlers for progressbar visuals
					    myXhr.upload.addEventListener('progress', function(e) {
										if (e.lengthComputable) {
											const percentage = Math.round(e.loaded / e.total);
											circle.animate(percentage);
										}
									}, false);
					    myXhr.upload.addEventListener('load', function(e) {
										circle.animate(1);
									}, false);
					    myXhr.upload.addEventListener('error', function(e) {
										circle.animate(0);
										circle.setText('error');
									}, false);
					}
					return myXhr;
				},
				success: function (data) {
					console.log(data);
					file.Info = data.fileId;
				},
				error: function (error) {
					console.log(error);
					fileInf.upload = false;
				},
				async: true,
				data: formData,
				cache: false,
				contentType: false,
				processData: false,
				timeout: 60000
			});
		},

		createThrobber(domId) {
			var c = new ProgressBar.Circle(domId, {
				color: '#7CB03C',
				strokeWidth: 5.1,
				trailColor: '#f4f4f4',
				duration: 3000,
	    		easing: 'easeInOut',
				text: { value: 'A',
						className: 'progress__label',
						style: {
							// fontFamily: '"Raleway", Helvetica, sans-serif'
						},
						autoStyleContainer: false },
				step: function(state, circle) {
					// circle.path.setAttribute('stroke', state.color);
					circle.path.setAttribute('stroke-width', 5);
					var value = Math.round(circle.value() * 100);
					if (value === 100) {
						circle.path.setAttribute('stroke', '#0f0');
						circle.text.style.color = '#0f0';
					}

					if (circle.value() === 0)
					  circle.setText('');
					else
					  circle.setText(value);
				}
			}) ;
			c.animate(0.1);
			return c;
		},
	},
	mounted() {

		if (this.options !== undefined && this.options.tooltip !== undefined)
			this.tooltip = this.options.tooltip;

		// this.createThrobber('#progress');
	}
  }


</script>

<style>
	.nofile {
		color: silver;
		font-size: 2em;
	}

	.progress {
		height: 60px;
		position: relative;
		transform: translate(0, -60px);
	}

	.progress > svg {
		height: 100%;
		display: block;
	}

	.progress__label {
		position: absolute;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%);
	}

	.preview {
		height: 60px;
		position: relative;
		display: block;
	}
</style>
