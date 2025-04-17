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
}

/**
 * Album View
 */
export class AlbumShares extends CrudCompW<AlbumShareProps> {

    inclient?: Inseclient;
	anReact? : AnReactExt;  // helper for React
	error: ErrorCtx;
    nextAction: string | undefined;

	synuri = '/album/syn';
	apk_web = 'res-vol/portfolio-0.7.apk';

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
        if (client) {
		    // this.tier = new GalleryTier({uri: this.uri, synuri: this.props.synuri, client, comp: this});
		    // this.tier.setContext(this.context as AnContextType);
			// this.toSearch();
        }
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
		<Card style={{"position": "absolute"}}>
			<CardActionArea href={apklink}>
			<QRCode value={apklink} bgColor={'#FFFFFF'} fgColor={'#000000'} size={128} level='H' />
			<DownloadAlbumIcon containersize={128} size={32} />
			</CardActionArea>
		</Card>
		</>);
	}
}
