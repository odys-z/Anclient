import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import { Sys } from '../../lib/frames/react/sys.jsx'

class App extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		return (<SysComp />);
	}


	/**Try figure out serv root, then bind to html tag.
	 * First try ./private.json/<serv-id>,
	 * then  ./github.json/<serv-id>,
	 * where serv-id = this.context.servId || host
	 *
	 * For test, have elem = undefined
	 * @param {string} elem html element id
	 * @param {string} serv serv id
	 */
	static bindHtml(elem, serv = 'host') {
		// this.state.servId = serv;
		if (typeof elem === 'string') {
			$.ajax({
				dataType: "json",
				url: 'private.json',
			})
			.done(onJsonServ)
			.fail(
				$.ajax({
					dataType: "json",
					url: 'github.json',
				})
				.done(onJsonServ)
				.fail( (e) => { $(e.responseText).appendTo($('#' + elem)) } )
			)
		}

		function onJsonServ(json) {
			let dom = document.getElementById(elem);
		   	ReactDOM.render(<Sys servs={json} servId={serv}/>, dom);
		}
	}
}

export {App}
