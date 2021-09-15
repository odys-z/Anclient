import React from 'react';
import { withStyles } from "@material-ui/core/styles";
import withWidth from "@material-ui/core/withWidth";
import PropTypes from "prop-types";
import { Button, Grid, Card, Typography, Link } from '@material-ui/core';

import { L } from '../../utils/langstr';
	import { Protocol } from '../../protocol';
	import { AnConst } from '../../utils/consts';
	import { CrudCompW } from '../../react/crud';
	import { AnContext, AnError } from '../../react/reactext';
	import { ConfirmDialog } from '../../react/widgets/messagebox.jsx'
	import { AnTablistLevelUp } from '../../react/widgets/table-list-lu';
	import { AnQueryForm } from '../../react/widgets/query-form';
	import { AnsonResp } from '../../protocol';
	import { JsampleIcons } from '../styles';

const styles = theme => ({
});

/** Simple session info card. Jsample use this to show user's personal info.
 * As UserDetails handling data binding by itself, and quit with data persisted
 * at jserv, this component is used to try the other way - no data persisting,
 * but with data automated data loading and state hook.
 */
class SsInfCardComp extends React.Component {

	state = {
		record: { uid: undefined, roleId: undefined },
	}

	constructor (props) {
		super(props);

		let {uid, roleId} = props;
		this.state.rec = {uid, roleId}
	}

	componentDidMount() {
		console.log(this.props.uri);
		let that = this;
		// this senario is an illustrating of general query's necessity.
		let req = this.context.anClient.query(this.props.uri, 'a_users', 'u')
		req.Body()
			.l("a_roles", "r", "r.roleId=u.roleId")
			.l("a_orgs", "o", "o.orgId=u.orgId")
			.whereEq('userId', this.props.ssInf.uid);
		this.context.anReact.bindStateRec({uri: this.props.uri, req}, undefined, that);
	}

	render() {
		return <RecordForm uri={this.props.uri} mtabl='a_users'
			fields={ [
				{ field: 'userId',   label: L('Log ID'), grid: {sm: 6, lg: 4}, disabled: true },
				{ field: 'userName', label: L('Name'),   grid: {sm: 6, lg: 4} },
				{ field: 'roleName', label: L('Role'),   grid: {sm: 6, lg: 4} },
				{ field: 'avatar',   label: L('Avatar'), grid: {md: 6}, formatter: loadAvatar } // probably another component
			] }
			record={this.state.record} />

		function loadAvatar() {
			return avatarIcon({ color: "primary", viewBox: "0 0 512 512" });
		}
	}
}
SsInfCardComp.contextType = AnContext;

SsInfCardComp.propTypes = {
	uri: PropTypes.string.isRequired,
	width: PropTypes.oneOf(["lg", "md", "sm", "xl", "xs"]).isRequired,
	ssInf: PropTypes.object.isRequired,
};

const SsInfCard = withWidth()(withStyles(styles)(SsInfCardComp));
export { SsInfCard, SsInfCardComp };
