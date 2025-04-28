import React from 'react';

import { Protocol, Inseclient, AnsonResp, AnsonMsg, 
	ErrorCtx, SessionClient} from '@anclient/semantier';

import { AnReactExt, 
	CrudCompW, AnContextType, 
	Comprops,
	ExternalHosts} from '@anclient/anreact';
import QRCode from 'react-qr-code';
import { Box, Card, CardActionArea, Typography, Grid, Paper } from '@material-ui/core';
import { IcoDownloadApk, IcoLoginAlbum } from '../icons/android';
import { formatJservQr } from '../tiers/synode-utils';

interface AlbumShareProps extends Comprops {
	synuri: string
	/** album id */
	aid: string;

	/** path (folder to) res.json, default "res-vol" */
	// res_json?: string;

	/** e. g. private/host.json (the default) */
	// host_json?: string;
}

/**
 * Album View
 * 
 * To Generate APK link:
 *  
 * First round: url_apk = (props.res_json || 'res-vol')/res.json/{apk},
 * Second round: try resolve private/host.json.localip, url = localip : window[href].port / url_apk
 * 
 * where apk = res.json's json.apk.
 * @see AlbumShareProps["res_json"]
 */
export class AlbumShares extends CrudCompW<AlbumShareProps> {

    inclient?: Inseclient;
	anReact? : AnReactExt;  // helper for React
	// error: ErrorCtx;
    nextAction: string | undefined;

	synuri = '/album/syn';

	/** 'url-root/res-vol/res.json/{apk}'; */
	apk_web: string | undefined = undefined;

	state = {
		hasError: false,
	};

	client : SessionClient | undefined;

	servdoms: ExternalHosts | undefined;

	constructor(props: AlbumShareProps | Readonly<AlbumShareProps>) {
		super(props);

		this.uri = '/album/sys/shares';

		// this.error   = {onError: this.onError, msg: '', that: this};
	}

	componentDidMount() {
		console.log(this.uri);
        let client = (this.context as AnContextType).anClient;
        if (client) { }

		let that = this;

        // let res_vol = (this.context as AnContextType).res_vol || 'res-vol';
		let host_json = (this.context as AnContextType).host_json;


		// fetch(`${res_vol}/res.json`) // Path relative to public folder
		fetch(host_json)
		.then((response) => response.json())
		.then((json) => {

			that.servdoms = new ExternalHosts(json); 

			let apk = json.resources.apk;
			if (typeof(apk) != 'string') 
				console.error('Apk resource is invalid.');
			else {
				let {protocol, host} = window.location;
				that.apk_web = `${protocol}//${host}/${apk}`;
				console.log(that.apk_web);

				if (host_json)
				fetch(host_json)
				.then((response) => response.json())
				.then((json) => {
					let ip = json.localip;
					if (ip) {
						let {protocol, port} = window.location;
						if (port) that.apk_web = `${protocol}//${ip}:${port}/${apk}`;
						else that.apk_web = `${protocol}//${ip}/${apk}`;
						console.log(that.apk_web);
					}
					else console.warn("host.json doesn't provide ip configuration.");
					that.setState({});
				});
				that.setState({});
			}
		})
		.catch((error) => console.error('Error loading JSON:', error));
	}

	// onError(c: string, r: AnsonMsg<AnsonResp> ) {
	// 	console.error(c, r.Body()?.msg(), r);
	// 	let ui = (this as ErrorCtx).that as AlbumShares;
	// 	ui.error.msg = r.Body()?.msg();
	// 	ui.state.hasError = !!c;
	// 	ui.nextAction = c === Protocol.MsgCode.exSession ? 're-login' : 'ignore';
	// 	ui.setState({});
	// }

	// onErrorClose() {
    //     this.state.hasError = false;
	// 	this.setState({});
	// }

	render() {
	  return (
	  <Grid container alignContent="flex-end" alignItems='stretch' style={{"marginTop": "5em"}} >
		<Grid item md={4} xs={12} sm={12} >
		<Paper style={{"height": 200}}>
	  	<Typography variant="h6" color='primary' gutterBottom>Download APK</Typography>
		{ this.apk_web &&
		  <Card style={{"position": "absolute"}}>
			<CardActionArea href={this.apk_web}>
			<QRCode value={this.apk_web} bgColor={'#FFFFFF'} fgColor={'#000000'} size={128} level='H' />
			<IcoDownloadApk containersize={128} size={32} />
			</CardActionArea>
		  </Card>}
		</Paper>
		</Grid>

		<Grid item md={4} xs={12} sm={12} >
		<Paper style={{"height": 200}}>
		<Typography variant='h6' color='primary' gutterBottom>Login on Andriod.</Typography>
		<Card style={{'position': 'absolute'}}>
			{this.servdoms &&  this.servdoms.syndomx && 
				<QRCode value={formatJservQr(this.servdoms.host, this.servdoms.syndomx[this.servdoms.host] as string)}
						bgColor={'#FFFFFF'} fgColor={'#000000'} size={128} level='H' />
			}
			<IcoLoginAlbum containersize={128} size={32} />
		</Card>
		</Paper>
		</Grid>
	  </Grid>
		);
	}
}
