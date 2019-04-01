import Vue from 'vue/dist/vue.js'
import VueRouter from 'vue-router';
import jframe from './framework/demo.app.vue'

Vue.use(VueRouter)

/**Bind VLoing to div('#id'), set jserv root = jserv
 * @param {string} selector html DOM selector
 * @param {string} jserv semantic.jserv url root path
 * @param {string} homepage home page url loaded when logged in successfully
 */
export function appLogin(selector, jserv, homepage) {
	if (selector === undefined)
		selector = '#login';
	var app = new Vue(Object.assign({},
		jframe,
		{ el: selector, }));
	app.bindLogin(homepage, jserv);
	return app;
}

/**Bind VHome to div('#id'), set jserv root = jserv
 * @param {string} selector html DOM selector
 * @param {string} jserv semantic.jserv url root path
 */
export function appHome(selector, jserv) {
	if (selector === undefined)
		selector = '#home';
	var app = new Vue(Object.assign({},
		jframe,	// from demo.app.vue
		{ el: selector, }));
	app.bindHome(jserv);
	return app;
}
