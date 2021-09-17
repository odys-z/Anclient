import React from 'react';
import { withStyles } from "@material-ui/core/styles";
import withWidth from "@material-ui/core/withWidth";
import PropTypes from "prop-types";
import { Button, Grid, Card, Typography } from '@material-ui/core';

import { Protocol, AnsonResp } from '@anclient/semantier';
import { L } from '../../utils/langstr';
	import { Semantier  } from '@anclient/semantier';
	import { AnConst } from '../../utils/consts';
	import { CrudCompW } from '../../react/crud';
	import { AnContext, AnError } from '../../react/reactext';
	import { ConfirmDialog } from '../../react/widgets/messagebox.jsx'
	import { AnTablistLevelUp } from '../../react/widgets/table-list-lu';
	import { AnQueryForm } from '../../react/widgets/query-form';
	import { TRecordForm } from '../../react/widgets/t-record-form';
	import ImageUpload from '../../react/widgets/image-upload';
	import { JsampleIcons } from '../styles';

const styles = theme => ({
});

/** Simple session info card. Jsample use this to show user's personal info.
 * As UserDetails handling data binding by itself, and quit with data persisted
 * at jserv, this component is used to try the other way - no data persisting,
 * but with data automated data loading and state hook.
 */
class MyInfCardComp extends React.Component {

	state = { }

	constructor (props) {
		super(props);

		this.uri = this.props.uri;

		let {uid, roleId} = props;
		this.state.rec = {uid, roleId}
	}

	componentDidMount() {
		console.log(this.props.uri);
		let that = this;

		if (!this.tier) this.getTier()

		this.tier.myInf({userId: this.props.ssInf.uid},
						(cols, record) => that.setState({cols, record}) );
	}

	getTier = () => {
		this.tier = new MyInfTier(this);
		this.tier.setContext(this.context);
	}

	render() {
		return (
		  <>{this.tier
			 && <TRecordForm uri={this.props.uri}
					tier={this.tier}
					fields={this.tier.columns()}
				/>}
			<Button onClick={this.handleClose} color="inherit">
				{L('Save')}
			</Button>
		  </>
		);
	}
}
MyInfCardComp.contextType = AnContext;

MyInfCardComp.propTypes = {
	uri: PropTypes.string.isRequired,
	width: PropTypes.oneOf(["lg", "md", "sm", "xl", "xs"]).isRequired,
	ssInf: PropTypes.object.isRequired,
};

const MyInfCard = withWidth()(withStyles(styles)(MyInfCardComp));
export { MyInfCard, MyInfCardComp };

class MyInfTier extends Semantier {

	uri = undefined;

	constructor(opts) {
		super('session');
		this.uri = opts.uri;
	}

	columns() {
		return [
			{ field: 'userId',   label: L('Log ID'), grid: {sm: 6, lg: 4}, disabled: true },
			{ field: 'userName', label: L('Name'),   grid: {sm: 6, lg: 4} },
			{ field: 'roleName', label: L('Role'),   grid: {sm: 6, lg: 4} },
			{ field: 'avatar',   label: L('Avatar'), grid: {md: 6}, formatter: loadAvatar } // use loadAvatar for default
		];

		function loadAvatar() {
			// return AvatarIcon({
			// 	color: "primary",
			// 	width: 32, height: 32,
			// 	onClick: (e) => {
			// 		console.log(e);
			// 	}
		 	// });
			return (
				<ImageUpload
					blankIcon={{color: "primary", width: 32, height: 32}}
					src64={this.rec.img}
				/>);
		}
	}

	myInf(conds, onLoad) {
		let { userId } = conds;

		let client = this.client;
		if (!client)
			return;

		let that = this;

		// NOTE
		// Is this senario is an illustrating of general query's necessity?
		let req = client.query(this.uri, 'a_users', 'u')
		req.Body()
			.l("a_roles", "r", "r.roleId=u.roleId")
			.l("a_orgs", "o", "o.orgId=u.orgId")
			.whereEq('userId', userId);

		client.commit(req,
			(resp) => {
				// NOTE because of using general query, extra hanling is needed
				let {cols, rows} = AnsonResp.rs2arr(resp.Body().Rs());
				that.rec = rows && rows[0];
				onLoad(cols, rows && rows[0]);
			},
			this.errCtx);
	}


}
