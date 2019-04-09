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
				<div style="width: 6em">{{file.info}}</div>
			</li>
		</ol>
		<input type="file" ref="fileElem" multiple accept="image/*"
			placeholder="add local file" @change="handleFiles" style="display:none" >
		<a href="#" id="fileSelect" @click="triggerFiels">Select some files</a>
		<input type="button" value="upload" ></input>

		<!--
		<input type="file" ref="fileElem" multiple accept="image/*" style="display:none">
		-->
		<div id='progress' class='progress'></div>
	</div>
</template>

<script>
  import * as ProgressBar from '../../../opensources/progressbar.js'

  // Vue.component('progress-circle', ProgressBar.circle);

  export default {
	name: 'file-upload',
	props: ['options', 'debug'],
	data: () => ({
		tooltip: "click to remove the file",
		files: [{name: 'n', id: '0', src: '', info: 'add file'}],
	}),
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

		triggerFiels() {
			this.$refs.fileElem.click();
		},

		handleFiles() {
			console.log('handleFiles:');
			var fileInfs = this.$refs.fileElem.files;
			console.log(fileInfs);
			console.log(this.$refs.fileElem);
			if (!fileInfs.length) {
				// fileList.innerHTML = "<p>No files selected!</p>";
			}
			else {
				/*
				fileList.innerHTML = "";
				const list = document.createElement("ul");
				fileList.appendChild(list);
				for (let i = 0; i < files.length; i++) {
					const li = document.createElement("li");
					list.appendChild(li);

					const thrb = document.createElement('div');
					thrb.classList.add('progress');
					thrb.id = 'file-img-' + i;
					li.appendChild(thrb);

					const img = document.createElement("img");
					img.src = window.URL.createObjectURL(files[i]);
					img.height = 60;
					img.classList.add("obj");
					img.file = files[i];
					// img.onload = function() {
					//   window.URL.revokeObjectURL(this.src);
					// }
					li.appendChild(img);
					const info = document.createElement("span");
					info.innerHTML = files[i].name + ": " + files[i].size + " bytes";
					li.appendChild(info);
				} */
				this.files = [];
				for (let i = 0; i < fileInfs.length; i++) {
					var f = fileInfs[i];
					console.log('push:');
					console.log(f);
					this.files.push({ id: 'file-img-' + i,
						filename: f.name,
						info: f.name + ": " + f.size,
					 	src: window.URL.createObjectURL(f),
						file: f});
				}
			}
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

		this.createThrobber('#progress');

		// this.files.push( {name: 'm', id: '1', src: '', info: 'add file ...'} );
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
