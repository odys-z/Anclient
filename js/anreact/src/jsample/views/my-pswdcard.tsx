import React from 'react';
import withStyles from "@material-ui/core/styles/withStyles";
import Button from '@material-ui/core/Button';

import { L } from '../../utils/langstr';
import { Semantext } from '@anclient/semantier';
	import { ConfirmDialog } from '../../react/widgets/messagebox'
	import { TRecordForm } from '../../react/widgets/t-record-form';

import { MyInfTier } from './my-infcard';
import { Comprops, DetailFormW } from '../../react/crud';
import { Theme, withWidth } from '@material-ui/core';
import { invalidStyles } from '../../react/anreact';

const styles = (theme: Theme) => (Object.assign(
	invalidStyles, {
		root: {}
	} )
);

/**
 * Adding-only file list shared for every users.
 */
class MyPswdComp extends DetailFormW<Comprops> {

	state = {
		sizeOptions:[10, 25, 50],
		total: 0,
		page: 0,
		size: 10,
	}

	// selected = undefined; // props.selected.Ids, the set
	tier: PswdTier;
	confirm: JSX.Element;

	constructor(props){
		super(props)
		this.uri = this.props.uri;

		this.changePswd = this.changePswd.bind(this);
		this.showConfirm = this.showConfirm.bind(this);
	}

	componentDidMount() {
		console.log(this.props.uri);

		// TODO DOC: MyInfCard is created outside of context provider,
		// see test/jsample/app.jsx: render().myInfoPanels(AnContext)
		// Don't set this in constructor. This.context changed after it.
		this.context = this.props.anContext || this.context;
		this.getTier();

		this.tier.pkval.v = this.props.ssInf.uid;
		this.setState({});
	}

	getTier = () => {
		this.tier = new PswdTier(this);

		// Semantier is the lower tier, shouldn't know React.Context. Any better way?
		this.tier.setContext(this.context as unknown as Semantext);
	}

	showConfirm(msg: string | string[]) {
		let that = this;
		this.confirm = (
			<ConfirmDialog title={L('Info')}
				ok={L('OK')} cancel={false} open
				onClose={() => {
					that.confirm = undefined;
					that.setState({});
				} }
				msg={msg} />);
		this.setState({});
	}

	changePswd(e: React.MouseEvent<HTMLElement>) {
		let that = this;
		if (!this.tier.changePswd({uri: this.props.uri},
			(resp) => { that.showConfirm(L('Password changed successfully!')); })) {
			this.setState({});
		}
	}

	render() {
		return ( <>
			{this.tier
			 && <form><TRecordForm uri={this.props.uri}
					tier={this.tier}
					fields={this.tier.fields()}
					enableValidate={true}
				/></form>}
			<Button onClick={this.changePswd} color="inherit">
				{L('Save')}
			</Button>
			{this.confirm}
		</> );
	}
}

// const MyPswd = withWidth()(withStyles(styles)(MyPswdComp));
const MyPswd = withStyles<any, any, Comprops>(styles)(withWidth()(MyPswdComp));
export { MyPswd, MyPswdComp }

class PswdTier extends MyInfTier {

	rec = undefined;
	rows = undefined;

	constructor(comp) {
		super(comp);
	}

	// NOTE
	// must be a shared object. Sytle will be changed for validation. So can not directly returned by columns() in hard coded.
	_fields = [
		{ field: 'userId',   type: 'text',  label: L('Log ID'), grid: {sm: 6, lg: 4}, disabled: true },
		{ field: 'userName', type: 'text',  label: L('Name'),   grid: {sm: 6, lg: 4}, disabled: true },
		{ field: 'pswd',  type: 'password', label: L('Old Password'), grid: {md: 6, lg: 4},
		  autocomplete: "on",
		  validator: {notNull: true} },
		{ field: 'pswd1', type: 'password', label: L('New Password'), grid: {md: 6, lg: 4},
		  autocomplete: "on",
		  validator: {notNull: true} },
		{ field: 'pswd2', type: 'password', label: L('Confirm New'),  grid: {md: 6, lg: 4},
		  autocomplete: "on",
		  validator: (v, rec, f) => !!v && rec.pswd1 === v ? 'ok' : 'notNull' } ] as Array<any>;

	changePswd(opts, onOk) {
		if (!this.client) return;

		// let { uri } = opts;
		let { pswd, pswd1, pswd2 } = this.rec;

		if (this.validate()) {
			this.client.setPswd(pswd, pswd1, {
				onOk,
				onError: this.errCtx
			});
			return true;
		}
		else return false;
	}
}
