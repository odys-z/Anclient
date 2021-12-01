
import React, { UIEvent } from 'react';
import withStyles from '@material-ui/core/styles/withStyles';
import withWidth from "@material-ui/core/withWidth";
import { Theme } from '@material-ui/core/styles';

import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';

import { Tierec, CRUD, TierCol } from '@anclient/semantier-st';
import { L, AnContext, ConfirmDialog, invalidStyles, DetailFormW, ClassNames, Media } from '@anclient/anreact';

import { PollsTier } from './polls';
import { CardsForm, CardsFormProps } from './card-form';

const styles = (theme: Theme) => (Object.assign(
	invalidStyles, {
		root: {},
		fromBody: {},
		cardGrid: {
		},
		card: {
			margin: theme.spacing(2)
		},
		headCard: {

		}
	}
));

/**
 * Render multiple cards in a form - acctually using rows.
 */
class PollDetailsComp extends DetailFormW<CardsFormProps> {
	state = {
		record: {},
		crud: CRUD.r,
	};
	tier: PollsTier;
	confirm: JSX.Element;

	head(rec: Tierec, cols: Array<TierCol>, classes: ClassNames, media: Media) {
		return <Typography variant='subtitle1' className={classes.headCard}>{rec.Title}</Typography>;
	}

	gridCard(rec: Tierec, x: number, classes: ClassNames, media: Media) {
		return <Grid key={x} item className={classes.cardGrid} >{rec.Title}</Grid>;
	}

	constructor (props : CardsFormProps) {
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
		// Only CardForm needing to load records
		// Poll details form is actually a list form
		if (this.tier.pollId) {

		}
		// if (this.tier.pkval) {
		// 	let that = this;
		// 	this.tier.record(undefined, // use tier.pkval
		// 		(_cols, rows) => {
		// 			that.setState({record: rows[0]});
		// 		} );
		// }
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
			  {/* <Box className={classes.smalltip}>
				  {L('Tip: Document can been replaced by uploading another file.')}
			  </Box> */}
			  <CardsForm uri={this.props.uri}
				  tier={this.tier}
				  columns={this.tier.columns()}
				  rows={this.tier.rows}
				  headFormatter={this.head}
				  CardFormatter={this.gridCard}
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

const PollDetails = withStyles<any, any, CardsFormProps>(styles)(withWidth()(PollDetailsComp));
export { PollDetails, PollDetailsComp };
