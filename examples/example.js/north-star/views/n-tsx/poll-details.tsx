
import React, { UIEvent } from 'react';
import { withStyles } from '@material-ui/core/styles';
import withWidth from "@material-ui/core/withWidth";

import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';

import { Protocol, Semantier } from '@anclient/semantier-st';
import { L, AnContext, ConfirmDialog
} from '@anclient/anreact';

import { starTheme } from '../../common/star-theme';
import { PollsTier } from './polls';
import { Anform, FormProp } from '../../common/north';
import { DefaultCardList } from './card-form';

const { CRUD } = Protocol;

const styles = (theme: starTheme) => (Object.assign(
	Semantier.invalidStyles as any, (theme: starTheme) => {
		return ({
			root: {},
			card: {
				margin: theme.spacing(2)
			},
		});
	}
));

/**
 * Tiered record form is a component for UI record layout, automaitcally bind data,
 * resolving FK's auto-cbb. As to child relation table, this component currently
 * is not planned to supprt.
 * <p>A kid always been saved as a "Dynamo"</p>
 */
class PollDetailsComp extends Anform {
	state = {
		record: {},
		crud: Protocol.CRUD.r,
	};
	tier: PollsTier;
	confirm: JSX.Element;

	constructor (props : FormProp) {
		super(props);

		this.state.crud = props.crud ? props.crud
				: props.c ? CRUD.c
				: props.u ? CRUD.u
				: CRUD.r;

		this.tier = props.tier as PollsTier;

		this.toCancel = this.toCancel.bind(this);
		this.toStop = this.toStop.bind(this);
		this.showConfirm = this.showConfirm.bind(this);
	}

	componentDidMount() {
		if (this.tier.pkval) {
			let that = this;
			this.tier.record(undefined, // use tier.pkval
				(_cols, rows) => {
					that.setState({record: rows[0]});
				} );
		}
	}

	toStop(e: UIEvent) {
		if (e) e.stopPropagation();
	}

	toCancel (e: React.UIEvent) {
		e.stopPropagation();
		if (typeof this.props.onClose === 'function')
			this.props.onClose(e);
	}

	showConfirm(msg: string) {
		let that = this;
		this.confirm = (
			<ConfirmDialog title={L('Info')}
				ok={L('OK')} cancel={false} open
				onClose={() => {that.confirm = undefined;} }
				msg={msg} />);
		this.setState({});
	}

	render () {
		const { classes, width } = this.props;

		let title = L('Poll\'s Details');

		return (<>
		  <Dialog className={classes.root}
			classes={{ paper: classes.dialogPaper }}
			open={true} fullWidth maxWidth="lg"
			onClose={this.toCancel}
		  >
			<DialogTitle id="u-title" color="primary" >
				{title}
			</DialogTitle>
			<DialogContent className={classes.content}>
			  <Box className={classes.smalltip}>
				  {L('Tip: Document can been replaced by uploading another file.')}
			  </Box>
			  <DefaultCardList uri={this.props.uri}
				  tier={this.tier}
				  fields={this.tier.fields({
					  pid: {grid: {sm: 3, md: 2}},
					  mime: {grid: {sm: 4, md: 3}} })}
			  />
			</DialogContent>
			<DialogActions className={classes.buttons}>
				<Button onClick={this.toStop} variant="contained" color="primary">
					{L("Stop")}
				</Button>
				<Button onClick={this.toCancel} variant="contained" color="primary">
					{L("Close")}
				</Button>
			</DialogActions>
		  </Dialog>
		  {this.confirm}
		</>);
	}
}
PollDetailsComp.contextType = AnContext;

/**using type check instead of runtime check
PollDetailsComp.propTypes = {
	uri: PropTypes.string.isRequired,
	tier: PropTypes.object.isRequired,
	crud: PropTypes.string,
	c: PropTypes.bool,
	u: PropTypes.bool,
	dense: PropTypes.bool
};
 */

const PollDetails = withWidth()(withStyles(styles)(PollDetailsComp));
export { PollDetails, PollDetailsComp };
