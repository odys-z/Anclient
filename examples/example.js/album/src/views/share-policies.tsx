import React, { ReactNode } from 'react';
import withStyles from "@material-ui/core/styles/withStyles";

import { Protocol, Inseclient, AnsonValue, PageInf, Tierec } from '@anclient/semantier';

import { AnContext, JsonServs, CrudCompW, AnTablistProps, AnTreeditor, AnError, L, AnContextType, PhotoCollect, ClassNames, Media
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
		this.hasError = false;
    }

	componentDidMount() {
        console.log(this.uri);
        let client = (this.context as AnContextType).anClient;
        let that = this;
        if (client) {
		    this.tier = new AlbumEditier({uri: this.uri, client, comp: this});
		    this.tier.setContext(this.context as AnContextType);
            this.tier.loadSharePolicy(new PageInf(), (sharing) => {
                that.setState({});
            })
        }
        else
            console.error("Requires logged in. (client can not be undefined)");
    }

	// toSearch(e?: React.UIEvent) {
    //     if (!this.tier)
    //         return;

    //     let tier = this.tier;
	// 	let that = this;

	// 	tier && tier.stree({
	// 		sk: 'orgs',
	// 		pageInf: new PageInf(0, -1, 0, []),
	// 		onOk: (resp) => {
	// 			tier.forest = (resp.Body(0) as AnDatasetResp).forest as AnTreeNode[];
	// 			that.setState({});
	// 		}}, that.context.error);
	// }

    render() {
		const { classes, width } = this.props;

		let media = CrudCompW.getMedia(width);

		// if (this.props.reload && this.state.tobeLoad) {
        //     this.tier?.loadSharePolicy({
        //         type: '',
        //         page: 0,
        //         nv: function (k: string, v: string): PageInf {
        //             throw new Error('Function not implemented.');
        //         },
        //         condtsRec: function (): Tierec & { [p: string]: AnsonValue; } {
        //             throw new Error('Function not implemented.');
        //         }
        //     },
        //         (collects: Array<PhotoCollect>) => {
        //         });
		// 	this.state.tobeLoad = false;
		// }

		return (<>
          { this.tier &&
            <AnTreeditor
                {... this.props}
                pk={'pid'}
                sk={Protocol.sk.sharetree} tnode={this.tier?.root()}
                onSelectChange={undefined}
                uri={this.uri} mtabl='ind_emotion'
                tier={this.tier}
                columns={[
                    { type: 'text', field: 'pname', label: L('Share'),
                        grid: {xs: 6, sm: 6} },
                    { type: 'text', field: 'shareby', label: L('By'),
                        grid: {xs: 3, sm: 2} },
                    { type: 'actions', field: '', label: '', grid: {xs: 3, md: 2},
                        formatter: () => <>{'Edit'}</> }
                ]}
                isMidNode={(n: { rowtype: string; }) => n.rowtype === 'cate' || !n.rowtype}
                editForm={this.detailForm}
            />}
          { this.confirm }

		  { this.hasError &&
			<AnError onClose={this.onErrorClose} fullScreen={false}
				tier={undefined}
				title={L('Error')} msg={this.error.msg || ''} /> }
        </>);
	}

    // treeNodes = (opts: {
    //         classes: ClassNames | undefined;
    //         media: Media; }): React.ReactNode => {
    //     return (<>
    //     </>);
    // }
}
SharePoliciesComp.contextType = AnContext;

/**
 */
const SharePolicies = withStyles<any, any, SharePolicyProps>(styles)(withWidth()(SharePoliciesComp));

export { SharePolicies, SharePoliciesComp }
