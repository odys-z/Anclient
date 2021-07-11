////////////////////     jsample application common      ///////////////////////

/** project utils
 * @deprecated replacedd by test/jsample.js
 * @module jsample/easyui */
const anconsts = {
	/**Warning log level, the higher value, the more verbose.<br>
	 * A coding convention of odys-z, nothing about the framework
	 * - feel free to ignore this.<br>
	 *
	 * 0: fatal error<br>
	 * 1: tolerable internal error<br>
	 * 2: design faults, or temporarily usable<br>
	 * 3: debug information that's essential to diagnose<br>
	 * 4+: additional debug information, etc.
	 */
	verbose: 5,

	/** if your tomcat server.xml is configured like:
	 * <Context docBase="jserv-sample" path="/jsample" reloadable="true"
	 * 		source="org.eclipse.jst.j2ee.server:jserv-sample"/></Host>
	 * you should get the engcosts/src/main/webapp/index.html
	serv: 'http://localhost:8080/jsample',
	 */

	/** default connection Id used by this client,
	 * Must be one of web-app/WEB-INF/connects.xml/t/c/id
	conn: 'sys-sqlite',
	 * */

	/**datas.xml/sk, sk for ir-combobox, ir-cbbtree shouldn't be here. */
	sk: {
		/**sk: system function menu dataset */
		menu: 'sys.menu.jsample',
	},
}

const samports = {
	/** see semantic.jserv/io.odysz.jsample.SysMenu */
	menu: "menu.serv",
	/** see semantic.jserv/io.odysz.jsample.cheap.CheapServ */
	cheapflow: "cheapflow.sample",

	/** views/Tool/project-toolBack-details.js */
	tools: "tools.serv11",
}

/** Workflow Id*/
const workflowId = {
	/** change a form test flow 1 */
	flow01: 't01',

	/** change a form test flow 2 */
	flow02: 't02',
}

export {anconsts, samports, workflowId};
