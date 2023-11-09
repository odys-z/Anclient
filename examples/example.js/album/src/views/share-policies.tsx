import React, { ReactNode } from 'react';
import withStyles from "@material-ui/core/styles/withStyles";

import { Protocol, Inseclient } from '@anclient/semantier';

import { AnContext, JsonServs, CrudCompW, AnTablistProps, AnTreeditor, AnError, L, AnContextType
} from '@anclient/anreact';
import { Theme, withWidth } from '@material-ui/core';
import { AlbumEditier } from '../album-editier';

const styles = (theme: Theme) => ( {
} );

interface SharePolicyProps extends AnTablistProps {
	servs: JsonServs;
	servId: string;

	/** album id */
	aid: string;

	iportal?: string;
	iparent?: any; // parent of iframe
	iwindow?: Window | undefined; // window object

	userid?: string;
	passwd?: string;
}

/** The application main, context singleton and error handler */
class SharePoliciesComp extends CrudCompW<SharePolicyProps> {
    inclient?: Inseclient;

    toSetPolicy = (e: React.UIEvent, colx: number) => {};

    editForm: ReactNode;
    tier?: AlbumEditier;
    detailForm: JSX.Element | undefined;
    confirm: JSX.Element | undefined;
    hasError: boolean;
    onErrorClose: any;
    error: any;

	constructor(props: SharePolicyProps) {
		super(props);
		this.hasError = false,

        this.toSearch = this.toSearch.bind(this);
    }

	componentDidMount() {
        let client = (this.context as AnContextType).anClient;
        if (client) {
		    this.tier = new AlbumEditier({uri: this.uri, client, comp: this});
		    this.tier.setContext(this.context as AnContextType);
        }
        else
            console.error("Requires logged in. (client can not be undefined)");
    }

    render() {
		const { classes, width } = this.props;

		let media = CrudCompW.getMedia(width);

		if (this.props.reload && this.state.tobeLoad) {
			this.toSearch();
			this.state.tobeLoad = false;
		}

		return (<>
          <AnTreeditor
            {... this.props}
            pk={'pid'}
            sk={Protocol.sk.collectree} tnode={this.tier?.root()}
            onSelectChange={undefined}
            uri={this.uri} mtabl='ind_emotion'
            columns={[
                { type: 'text', field: 'share', label: L('Share'),
                    grid: {xs: 6, sm: 6} },
                { type: 'text', field: 'shareby', label: L('By'),
                    grid: {xs: 3, sm: 2} },
                { type: 'text', field: 'tags', label: L('Hashtag'),
                    grid: {xs: 3, sm: 2} },
                { type: 'actions', field: '', label: '', grid: {xs: 3, md: 2},
                    formatter: () => <>{'Edit'}</> }
            ]}
            isMidNode={(n: { rowtype: string; }) => n.rowtype === 'cate' || !n.rowtype}
            editForm={this.detailForm}
          />
          { this.confirm }

		  { this.hasError &&
			<AnError onClose={this.onErrorClose} fullScreen={false}
				tier={undefined}
				title={L('Error')} msg={this.error.msg || ''} /> }
        </>);
	}

    toSearch() {
        throw new Error('Method not implemented.');
    }

    treeNodes = (opts: {
            classes: import("@anclient/anreact").ClassNames | undefined;
            media: import("@anclient/anreact").Media; }): React.ReactNode => {
        throw new Error('Method not implemented.');
    }
}
SharePoliciesComp.contextType = AnContext;

/**
 */
const SharePolicies = withStyles<any, any, SharePolicyProps>(styles)(withWidth()(SharePoliciesComp));

export { SharePolicies, SharePoliciesComp }
