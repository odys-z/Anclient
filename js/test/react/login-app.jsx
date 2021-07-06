import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import { Login } from '../../lib/frames/react/login.jsx';

/** The application main, context singleton and error handler, but only for login
 * used in iframe (no origin change). */
class LoginApp extends React.Component {
	state = {
		anClient: undefined,
		hasError: false,
	};

	constructor(props) {
		super(props);
	}

	onError(msg) {
	}

	render() {
		return (
			<AnContext.Provider value={{
				pageOrigin: window ? window.origin : 'localhost',
				servId: this.props.servId,
				servs: this.props.servs,
				anClient: this.state.anClient,
				hasError: this.state.hasError,
				error: {onError, msg: ''},
			}} >
				<Login />
			</AnContext.Provider>
		);
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
		   	ReactDOM.render(<Login servs={json} servId={serv}/>, dom);
		}
	}
}

export {LoginApp};
