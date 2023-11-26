import React, { ReactNode } from 'react';
import withStyles from "@material-ui/core/styles/withStyles";

import { CRUD, Protocol, Inseclient, PageInf, Tierec, AnTreeNode, size } from '@anclient/semantier';
import { AnContext, JsonServs, CrudCompW,
    AnTablistProps, AnTreeditor, AnError, L, AnContextType, 
    CompOpts, AnTreegridCol, AnTreegrid, jsample, regex
} from '@anclient/anreact';

import { Button, Grid, Theme, Typography, withWidth } from '@material-ui/core';
import { AlbumEditier } from '../album-editier';
import { DocIcon } from '../icons/doc-ico';
import { SharePolicyDetails } from './sahre-policy-details';

const {JsampleIcons} = jsample;

const styles = (theme: Theme) => ( {
    action: {
        padding: 0
    }
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
	docIcon  : DocIcon;
    hasError: boolean;
    onErrorClose: any;
    error: any;

	constructor(props: SharePolicyProps) {
		super(props);
		this.docIcon = new DocIcon();

		this.hasError = false;
        this.switchButton = this.switchButton.bind(this);
        this.toggle = this.toggle.bind(this);
    }

	componentDidMount() {
        console.log(this.uri);
        let client = (this.context as AnContextType).anClient;
        let that = this;
        if (client) {
		    this.tier = new AlbumEditier({uri: this.uri, client, comp: this});
		    this.tier.setContext(this.context as AnContextType);
            this.tier.loadSharePolicy(new PageInf(), (sharing) => {
                that.setState({preview: true});
            })
        }
        else
            console.error("Requires logged in. (client can not be undefined)");
    }

    render() {
		const { classes, width } = this.props;

		let media = CrudCompW.getMedia(width);
        let that = this;

		return (<>
          { this.tier && this.state.preview ?
            <AnTreegrid
                pk={''} singleCheck
                tier={this.tier}
                columns={[
                { type: 'iconame', field: 'pname', label: L('File Name'),
                    grid: {xs: 6, sm: 6, md: 5} },
                { type: 'text', field: 'mime', label: L('type'),
                    colFormatter: typeParser,
                    grid: {xs: 1} },
                { type: 'text', field: 'shareby', label: L('share by'),
                    grid: {xs: false, sm: 3, md: 2} },
                { type: 'text', field: 'filesize', label: L('size'), 
                    grid: {xs: false, sm: 2, md: 2},
                      colFormatter: (col, n, opts) => {return (
                            <Button key={`${n.id}.${opts?.colx}`}
                                onClick={() => this.editPolicy(n)}
                                startIcon={ n.node.children? <JsampleIcons.Edit /> : <JsampleIcons.Check/>}
                                color="primary" className={classes?.action}>
                                {media.isMd && L('Shares')}
                            </Button>
                      )},
                      thFormatter: this.switchButton }
                ]}
                onSelectChange={this.selectPolicy}
            />
            :
            <AnTreeditor
                {... this.props}
                pk={'pid'}
                sk={Protocol.sk.sharetree} tnode={this.tier?.root()}
                onSelectChange={undefined}
                uri={this.uri} mtabl='ind_emotion'
                tier={this.tier}
                columns={[
                    { type: 'text', field: 'pname', label: L('Name'),
                        grid: {xs: 6, sm: 6} },
                    { type: 'text', field: 'shareby', label: L('By'),
                        grid: {xs: 3, sm: 2} },
                    { type: 'actions', field: '', label: '', grid: {xs: 3, md: 2},
                        formatter: () => undefined,
                        thFormatter: this.switchButton }
                ]}
                isMidNode={(n: { rowtype: string; }) => n.rowtype === 'cate' || !n.rowtype}
                editForm={this.detailForm}
            />
          }
          { this.confirm }

		  { this.hasError &&
			<AnError onClose={this.onErrorClose} fullScreen={false}
				tier={undefined}
				title={L('Error')} msg={this.error.msg || ''} /> }
        </>);

        function typeParser(c: AnTreegridCol, n: AnTreeNode, opt?: CompOpts) {
            if (n.node.children?.length as number > 0) return <></>;
            else return that.docIcon.typeParser(c, n, opt);
        }
	}

	selectPolicy = (ids: Map<string, Tierec>) => {
		if (size(ids) > 0 && this.tier) {
			let fid = ids.keys().next().value;
			let file = ids.get(fid) as AnTreeNode;
			let t = regex.mime2type(file.node.mime || "");
		}
		this.setState({});
	};

    switchButton(col: AnTreegridCol, colx: number, opts?: CompOpts ) {
		const { classes, width } = this.props;
		let media = CrudCompW.getMedia(width);

		return (
          <Grid key={`th-${colx}`} item {...col.grid} className={classes?.treeCell}>
            { this.state.preview ?
			  <><Button onClick={this.toggle}
				    startIcon={<JsampleIcons.Search />} color="primary" >
                </Button>
			  {media?.isMd && L('Edit') }
              </>
              :
			  <><Button onClick={this.toggle}
				    startIcon={<JsampleIcons.Check />} color="primary" >
                </Button>
			    {media?.isMd && L('Preview') }
              </>}
          </Grid>);
    }

    toggle(e: React.UIEvent) {
        this.setState({preview: !this.state.preview})
    }

    editPolicy = (n: AnTreeNode) => {
        let that = this;
        this.confirm = (
          <SharePolicyDetails {...this}
            crud={CRUD.u}
            pk={n.id}
            tier={this.tier}
            onClose={() => {
                that.confirm = undefined;
                if (that.tier)
                    that.tier.rec = undefined;
                that.setState({});
            }}
          >
          </SharePolicyDetails>);

    };
}
SharePoliciesComp.contextType = AnContext;

/**
 */
const SharePolicies = withStyles<any, any, SharePolicyProps>(styles)(withWidth()(SharePoliciesComp));

export { SharePolicies, SharePoliciesComp }
