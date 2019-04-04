<template>
  <div >
	<!--
	<button type="button" v-if="debug" @click="pop">modal dialog</button>
	-->
	<transition name="modal" >
	    <div class="modal-mask" id='modal' v-if="showing" >
	      <div class="modal-wrapper" ref="modalWrapper">
	        <div class="modal-container">

	          <div class="modal-header">
	            <slot name="header">
	              default header
	            </slot>
	          </div>

	          <div class="modal-body">
	            <slot name="modal-form" class="modal-body">
	              default form content
	            </slot>
	          </div>

	          <div class="modal-footer">
	              <div v-if="jstyle.footer.visible">
					<div>&nbsp;</div>
	                <button class="modal-default-button" @click="onOk">
	                  {{jstyle.ok.text}}
	                </button>
			      </div>
				  <div v-if="!jstyle.footer.visible">&nbsp;</div>
				  <slot name="footer" class="modal-footer"></slot>
	          </div>
			  <div>&nbsp;</div>
	        </div>
	      </div>
	    </div>
	</transition>
  </div>
</template>

<script>
// npm i --save lodash
import _ from 'lodash'
import Vue from 'vue/dist/vue.js'

export default {
  name: 'VList',
  props: ['dlg-style'],
  data () {
    return {
		showing: false,
		// bus: new Vue(),
		jstyle: {
			ok: {text: '[OK]'},
			footer: {visible: true},
		},
	}
  },
  // on: {
	// close: function() {
	// 	this.showing = false;
	// }
  // },
  methods: {
	pop: function (record) {
		if (this.dlgStyle !== undefined) {
			// npm i --save lodash
			_.merge(this.jstyle, this.dlgStyle);
		}
		this.showing = true;

		this.$nextTick(function() {
			this.$emit('dlg-evt',
						{evt: 'shown',
						 args: {height: this.$refs.modalWrapper.clientHeight}});
		});
	},

	onOk: function () {
		this.onClose('ok');
	},

	onClose: function (code) {
		console.log(code);
		this.showing = false;
		// this.bus.$emit('dlgClosed', code);
		this.$emit('dlg-evt',
				{evt: 'close',
				 args: {result: code},
			 	});
	}
  },
  mounted() {
	console.log('emitting ...');
	var w = this.$refs.modalWrapper;
	w = w ? w.clientHeight : 0;
	this.$emit('dlg-evt',
				{evt: 'mounted',
				 args: {height: w},
			 	});
  }
}

</script>

<style>
	.modal-mask {
	  position: fixed;
	  z-index: 9998;
	  top: 0;
	  left: 0;
	  width: 100%;
	  height: 100%;
	  background-color: rgba(0, 0, 0, .5);
	  display: table;
	  transition: opacity .3s ease;
	}

	.modal-wrapper {
	  display: table-cell;
	  vertical-align: middle;
	}

	.modal-container {
	  width: 500px;
	  margin: 0px auto;
	  padding: 20px 30px;
	  background-color: #fff;
	  border-radius: 2px;
	  box-shadow: 0 2px 8px rgba(0, 0, 0, .33);
	  transition: all .3s ease;
	  font-family: Helvetica, Arial, sans-serif;
	}

	.modal-header h3 {
	  margin-top: 0;
	  color: #42b983;
	}

	.modal-body {
	  margin: 20px 0;
	}

	.modal-footer {
	  margin: 0px auto;
	}

	.modal-default-button {
	  float: right;
	  border-radius: 4px;
	}

	/*
	 * The following styles are auto-applied to elements with
	 * transition="modal" when their visibility is toggled
	 * by Vue.js.
	 *
	 * You can easily play with the modal transition by editing
	 * these styles.
	 */

	.modal-enter {
	  opacity: 0;
	}

	.modal-leave-active {
	  opacity: 0;
	}

	.modal-enter .modal-container,
	.modal-leave-active .modal-container {
	  -webkit-transform: scale(1.1);
	  transform: scale(1.1);
	}
</style>
