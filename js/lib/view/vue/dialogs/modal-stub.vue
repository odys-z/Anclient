<!-- template for the modal component
	https://vuejs.org/v2/examples/modal.html
-->
<template>
	<div id="app">
	  <button id="show-modal" v-if="debug" @click="showModal = true">Show Modal</button>
	  <!-- use the modal component, pass in the prop -->
	  <modal v-if="showModal" @close="showModal = false">
	    <!--
	      you can use custom content here to overwrite
	      default content
	    -->
	    <h3 slot="header">custom header</h3>
	  </modal>
	</div>
</template>
<!--
<template>
  <transition name="modal" >
    <div class="modal-mask" id='details'>
      <div class="modal-wrapper">
        <div class="modal-container">

          <div class="modal-header">
            <slot name="header">
              default header
            </slot>
          </div>

          <div class="modal-body">
            <slot name="body">
              default body
            </slot>
          </div>

          <div class="modal-footer">
            <slot name="footer">
              default footer
			  <!- -
              <button class="modal-default-button" @click="$emit('close')">
                OK </button> - - >
              <button class="modal-default-button" @click="onOk">
                {{ok}}
              </button>
            </slot>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>
-->

<script>
	// register modal component
	// Vue.component('modal', {
	//   template: '#modal-template'
	// })

	// start app
	// new Vue({
	//   el: '#app',
	//   data: {
	//     showModal: false
	//   }
	// })
  export default {
	name: 'details',
	data: () => {
		debug: false,
		dialog: '',
		parent: '',
		returned: '',
	},
	methods: {
		//vervified at jsfiddle
		show: function(debug) {
			this.debug = debug;
		},
		onOk: function(code) {
			this.returned = code;
		},
		onCancle: function() {
		}
	}
  }
</script>

<style>
<style>
