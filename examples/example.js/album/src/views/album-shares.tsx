import React from 'react';

import { Protocol, Inseclient, AnsonResp, AnsonMsg, 
	ErrorCtx, SessionClient} from '@anclient/semantier';

import { AnReactExt, 
	CrudCompW, AnContextType, 
	Comprops} from '@anclient/anreact';
import QRCode from 'react-qr-code';
import { Card, CardActionArea, Typography } from '@material-ui/core';
import { DownloadAlbumIcon } from '../icons/android';

interface AlbumShareProps extends Comprops {
	synuri: string
	/** album id */
	aid: string;

	/** path (folder to) res.json, default "res-vol" */
	res_json?: string;
}

/**
 * Album View
 * 
 * Apk download link is: (props.res_json || 'res-vol')/res.json/{apk},
 * where apk = res.json's json.apk.
 * @see AlbumShareProps["res_json"]
 */
export class AlbumShares extends CrudCompW<AlbumShareProps> {

    inclient?: Inseclient;
	anReact? : AnReactExt;  // helper for React
	error: ErrorCtx;
    nextAction: string | undefined;

	synuri = '/album/syn';
	// apk_web = 'res-vol/portfolio-0.7.apk';
	apk_web: string | undefined = undefined; // 'url-root/res-vol/res.json/{apk}';

	/**
	 * The entity table name updated each time loaded a tree.
	 * Issue: See java AlbumResp.docTable's comments
	docTabl: string = 'h_photos';
	 */

	state = {
		hasError: false,
	};

	client : SessionClient | undefined;

	/**
	 * Restore session from window.localStorage
	 */
	constructor(props: AlbumShareProps | Readonly<AlbumShareProps>) {
		super(props);

		this.uri = '/album/sys/shares';

		this.error   = {onError: this.onError, msg: '', that: this};
	}

	componentDidMount() {
		console.log(this.uri);
        let client = (this.context as AnContextType).anClient;
        if (client) { }

		let that = this;
		let res_vol = `${this.props.res_json || 'res-vol'}`; 
		fetch(`${res_vol}/res.json`) // Path relative to public folder
			.then((response) => response.json())
			.then((json) => {
				that.apk_web = `${res_vol}/${json.apk}`;
				if (typeof(that.apk_web) != 'string') 
					console.error('apk_web is invalid.');
				else {
					console.log(that.apk_web);
					that.setState({});
				}
			})
			.catch((error) => console.error('Error loading JSON:', error));
	}

	onError(c: string, r: AnsonMsg<AnsonResp> ) {
		console.error(c, r.Body()?.msg(), r);
		let ui = (this as ErrorCtx).that as AlbumShares;
		ui.error.msg = r.Body()?.msg();
		ui.state.hasError = !!c;
		ui.nextAction = c === Protocol.MsgCode.exSession ? 're-login' : 'ignore';
		ui.setState({});
	}

	onErrorClose() {
        this.state.hasError = false;
		this.setState({});
	}

	render() {
	  let {protocol, host} = window.location;
	  let apklink = `${protocol}//${host}/${this.apk_web}`;
	  console.log(apklink);
	  return (<> 
	  	<Typography variant="h4" gutterBottom>Download APK</Typography>
		{ this.apk_web &&
		  <Card style={{"position": "absolute"}}>
			<CardActionArea href={apklink}>
			<QRCode value={apklink} bgColor={'#FFFFFF'} fgColor={'#000000'} size={128} level='H' />
			<DownloadAlbumIcon containersize={128} size={32} />
			</CardActionArea>
		  </Card>}
		</>);
	}
}
