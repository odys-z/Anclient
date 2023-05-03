import React from 'react';
import ReactDOM from 'react-dom';

import { Protocol, SessionClient, AnsonResp, AnsonMsg, ErrorCtx } from '@anclient/semantier';

import { L, Langstrs,
	AnContext, AnError, AnReactExt, JsonServs, AnreactAppOptions,
	AnTreeditor,
	Comprops,
	CrudCompW
} from '@anclient/anreact';
import { Button } from '@material-ui/core';
import { Replay } from '@material-ui/icons';

type AlbumProps = {
	servs: JsonServs;
	servId: string;

	orgId: string;

	ihome: string;
	iportal?: string;
	/** parent of iframe */
	iparent?: object | Window;
	iwindow?: Window | undefined; // window object
}

/** The application main, context singleton and error handler */
export class Admin extends CrudCompW<AlbumProps & Comprops> {
	servId: string;

    inclient: SessionClient;

	anReact: AnReactExt;  // helper for React

	error: ErrorCtx;

    hasError: any;
    nextAction: string | undefined;

	constructor(props: AlbumProps | Readonly<AlbumProps>) {
		super(props);

		// this.uri = props.uri;
		this.servId = props.servId || 'host';
		this.nextAction = 're-login',

		this.onError = this.onError.bind(this);
		this.onErrorClose = this.onErrorClose.bind(this);

		this.inclient = new SessionClient(SessionClient.loadStorage());

		this.error = {onError: this.onError, msg: ''};
		this.hasError = false,

		Protocol.sk.albumtree = 't-album';

        // design note: exendPorts shall be an automized processing
		this.anReact = new AnReactExt(this.inclient, this.error)
                        .extendPorts({
                            /* see jserv-album/album, port name: album */
                            album: "album.less",
                        });
	}

	onError(c: string, r: AnsonMsg<AnsonResp> ) {
		console.error(c, r);
		this.error.msg = r.Body()?.msg();
		this.hasError = !!c;
		this.nextAction = c === Protocol.MsgCode.exSession ? 're-login' : 'ignore';
		this.setState({});
	}

	onErrorClose() {
        this.hasError = false;
		this.setState({});
	}

	render() {
		let {classes} = this.props;
	  	return (
		<AnContext.Provider value={{
			servId: this.servId,
			servs: this.props.servs,
			anClient: this.inclient,
			uiHelper: this.anReact,
			hasError: this.hasError,
			iparent: this.props.iparent,
			ihome: this.props.iportal || 'portal.html',
			error: this.error,
			ssInf: undefined,
		}} >
			{<AnTreeditor pk={'/local/album'}
				title={""}
				columns={[{label: "v", field: ""}]}
				onSelectChange={(ids: String[])=>{}}/>}
			<Button variant="contained" color='primary'
				className={classes?.button} onClick={this.reshape}
				startIcon={<Replay />}
			>{L('Update')}</Button>

			<AnTreeditor sk={Protocol.sk.albumtree}
				uri={this.uri} mtabl='ind_emotion'
				// pk={{ type: 'text', field: 'indId', label: L('Indicator Id'), hide: 1, validator: {len: 12} }}
				parent={{ type: 'text', field: 'parent', label: L('Album'), hide: 1, validator: {len: 12} }}
				columns={[
					{ type: 'text', field: 'indName', label: L('Indicator'),
					validator: {len: 200, notNull: true}, grid: {xs: 6, sm: 6} },
					{ type: 'float', field: 'weight', label: L('Weight'),
					validator: {minLen: 0.0}, grid: {xs: 3, sm: 1},
					formatter: (col, n) => n.node.weight},
					{ type: 'formatter', label: L('Question Type'), grid: {xs: 2, sm: 2},
					formatter: (col, rec) => { return readableQtype(rec.node.qtype || rec.node.vtype, true) } },
					{ type: 'actions', label: '', grid: {xs: 3, md: 3} }
				]}
				fields={[
					{ type: 'text', field: 'parent', label: 'parent', hide: 1 },
					{ type: 'text', field: 'indName', label: L('Indicator'),
					validator: {len: 200, notNull: true} },
					{ type: 'float', field: 'weight', label: L('Default Weight'),
					validator: {min: 0.0} },
					{ type: 'cbb', field: 'qtype', label: L('Question Type'),
					// If a node is the type of the first option, it means that node is middle (internal) node.
					options: [{n: L('[ Category ]'), v: 'cate'}, ...QuizProtocol.Qtype.options()],
					validator: {notNull: true} },
					{ type: 'int',field: 'sort', label: L('UI Sort'),
					validator: {notNull: true} },
					{ type: 'text', field: 'remarks', label: L('Remarks'),
					validator: {len: 500}, props: {sm: 12, lg: 6} }
				]}
				isMidNode={n => n.qtype === 'cate' || !n.qtype}
				detailFormTitle={L('Indicator Details')}
			/>
			{this.confirm}

			{this.hasError &&
				<AnError onClose={this.onErrorClose} fullScreen={false}
					uri={"/login"} tier={undefined}
					title={L('Error')} msg={this.error.msg || ''} />}
		</AnContext.Provider>
		);
	}

	/**
	 * see App.bindHtml()
	 * @param opts
	 * opts.home: home page
	 */
	static bindHtml(elem: string, opts: AnreactAppOptions & {org: string, home?: string}) : void {
		let portal = opts.portal ?? 'index.html';
		let org = opts.org;
		try { Langstrs.load('/res-vol/lang.json'); } catch (e) {}
		AnReactExt.bindDom(elem, opts, onJsonServ);

		function onJsonServ(elem: string, opts: AnreactAppOptions, json: JsonServs) {
			let dom = document.getElementById(elem);
			ReactDOM.render(
			  <Admin
				servs={json} servId={opts.serv || 'host'}
				orgId={org}
				ihome='index.html'
				iportal={portal} iwindow={window}
			  />, dom);
		}
	}


}