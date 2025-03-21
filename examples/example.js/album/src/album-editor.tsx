import React from 'react';
import ReactDOM from 'react-dom';

import { Protocol, SessionClient, AnsonResp, AnsonMsg, ErrorCtx } from '@anclient/semantier';

import { L, Langstrs,
	AnContext, AnError, AnReactExt, JsonHosts, AnreactAppOptions,
	AnTreeditor, Comprops, CrudCompW, ConfirmDialog
} from '@anclient/anreact';
import { AlbumEditier } from './tiers/album-tier';
import Typography from '@material-ui/core/Typography';

type AlbumProps = {
	servs: JsonHosts;
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

    // ssclient: SessionClient;
	tier: AlbumEditier;

	anReact: AnReactExt;  // helper for React

	error: ErrorCtx;

    hasError: any;
    nextAction: string | undefined;

	confirm = <ConfirmDialog title={L('Info')}></ConfirmDialog>;
 
	detailForm = undefined;

	preview = (_col: any, rec: any) => {
		return <></>;
	};

	synuri = '/album/syn';
		
	constructor(props: AlbumProps | Readonly<AlbumProps>) {
		super(props);

		this.servId = props.servId || 'host';
		this.nextAction = 're-login',

		this.onError = this.onError.bind(this);
		this.onErrorClose = this.onErrorClose.bind(this);
		this.reshape = this.reshape.bind(this);

		let client = new SessionClient(SessionClient.loadStorage());
		this.tier = new AlbumEditier({uri: '/example/album', comp: this, client});

		this.error = {onError: this.onError, msg: ''};
		this.hasError = false,

		Protocol.sk.collectree = 't-collects';

        // design note: exendPorts shall be an automized processing
		this.anReact = new AnReactExt(client, this.error)
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

	reshape() {

	}

	render() {
	  return (
		<AnContext.Provider value={{
			servId: this.servId,
			servs: this.props.servs,
			anClient: this.tier.client,
			uiHelper: this.anReact,
			hasError: this.hasError,
			iparent: this.props.iwindow,
			ihome: this.props.iportal || 'portal.html',
			error: this.error,
			ssInf: undefined,
		}} >
		  { this.tier.synodeLable() &&
		    <Typography noWrap variant='body2'>{this.tier.synodeLable()}</Typography>}
		  <AnTreeditor {... this.props}
			pk={'pid'}
			sk={Protocol.sk.collectree} tnode={this.tier.root()}
			onSelectChange={undefined}
			uri={this.uri} docuri={this.synuri}
			columns={[
				{ type: 'text', field: 'share', label: L('Share'),
					grid: {xs: 6, sm: 6} },
				{ type: 'text', field: 'shareby', label: L('By'),
					grid: {xs: 3, sm: 2} },
				{ type: 'text', field: 'tags', label: L('Hashtag'),
					grid: {xs: 3, sm: 2} },
				{ type: 'actions', field: '', label: '', grid: {xs: 3, md: 2} }
			]}
			isMidNode={(n: { rowtype: string; }) => n.rowtype === 'cate' || !n.rowtype}
			editForm={this.detailForm}
		  />
		  { this.confirm }

		  { this.hasError &&
			<AnError onClose={this.onErrorClose} fullScreen={false}
				tier={undefined}
				title={L('Error')} msg={this.error.msg || ''} /> }
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

		function onJsonServ(elem: string, opts: AnreactAppOptions, json: JsonHosts) {
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