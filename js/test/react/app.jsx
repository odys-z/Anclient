import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import { Sys } from '../../lib/frames/react/sys.jsx';

/** The application main, context singleton and error handler */
class App extends React.Component {
	constructor(props) {
		super(props);
	}

	onError() {

	}

	render() {
		return (
			<AnContext.Provider value={{
				error: {onError}
			}} >
				<Sys />
			</AnContext.Provider>
		);
	}

	/**Try figure out serv root, then bind to html tag.
	 * First try ./private.json/<serv-id>,
	 * then  ./github.json/<serv-id>,
	 * where serv-id = this.context.servId || host
	 *
	 * For test, have elem = undefined
	 * @param {string} elem html element id, null for test
	 * @param {object} [opts={}] serv id
	 * @param {string} [opts.serv='host'] serv id
	 * @param {string} [opts.iportal='portal.html'] page showed after logout
	 */
	static bindHtml(elem, opts = {}) {
		AnReact.bindDom(elem, opts, onJsonServ);

		function onJsonServ(elem, json) {
			let dom = document.getElementById(elem);
			ReactDOM.render(<Sys servs={json} servId={opts.serv} iportal={opts.portal} window={Window}/>, dom);
		}
	}
}

export {App};
