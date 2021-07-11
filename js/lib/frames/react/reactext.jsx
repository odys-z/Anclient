import $ from 'jquery';
import React from 'react';

import {L} from './utils/langstr';
import {ConfirmDialog} from './widgets/messagebox.jsx'

export const AnContext = React.createContext({
	//	Anclient
	an: undefined,
	ssInf: undefined,

	pageOrigin: '.',
	servId: 'host',
	servs: { host: 'http://localhost:8080/jserv-sample' },

	anReact: undefined,

	// error handling pattern like
	// https://medium.com/technofunnel/error-handling-in-react-hooks-e42ab91c48f4
	error: {
		onError: undefined, // (MsgCode, AnsonResp) => {}
		msg: undefined
	},
	hasError: false,

	setServ: function(servId, json) {
		let me = AnContext;
		me.servs = Object.assign(me.servs, json);
		me.servId = servId ? servId : 'host';
	}
});

export class AnError extends React.Component {
	props = undefined;

	state = {
		porps: undefined,
	};

	constructor(props) {
		super(props);
		this.state.props = props;
	}

	render() {
		let ctx = this.context;// .errors;
		return (
			<ConfirmDialog ok={L('OK')} title={L('Error')} cancel={false}
					open={!!ctx.hasError} onClose={this.state.props.onClose}
					fullScreen={this.state.props.fullScreen}
					msg={ctx.error.msg} />
		);
	}
}
AnError.contextType = AnContext;


// /** React helpers for AnClient */
// export class AnReact {
//
// 	/**Try figure out serv root, then bind to html tag.
// 	 * First try ./private.json/<serv-id>,
// 	 * then  ./github.json/<serv-id>,
// 	 * where serv-id = this.context.servId || host
// 	 *
// 	 * For test, have elem = undefined
// 	 * @param {string} elem html element id, null for test
// 	 * @param {object} opts serv id
// 	 * @param {string} [opts.serv='host'] serv id
// 	 * @param {function} onJsonServ function to render React Dom, i. e.
// 	 * <pre>(elem, json) => {
// 			let dom = document.getElementById(elem);
// 			ReactDOM.render(<LoginApp servs={json} servId={opts.serv} iparent={opts.parent}/>, dom);
// 	}</pre>
// 	 */
// 	static bindDom(elem, opts, onJsonServ) {
// 		// this.state.servId = serv;
// 		if (opts.serv) opts.serv = 'host';
//
// 		if (typeof elem === 'string') {
// 			$.ajax({
// 				dataType: "json",
// 				url: 'private.json',
// 			})
// 			.done((json) => onJsonServ(elem, json))
// 			.fail(
// 				$.ajax({
// 					dataType: "json",
// 					url: 'github.json',
// 				})
// 				.done((json) => onJsonServ(elem, json))
// 				.fail( (e) => { $(e.responseText).appendTo($('#' + elem)) } )
// 			)
// 		}
// 	}
// }
