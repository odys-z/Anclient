
import React, { UIEvent } from 'react';
import { withStyles } from '@material-ui/core/styles';
import withWidth from "@material-ui/core/withWidth";

import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import DialogTitle from '@material-ui/core/DialogTitle';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card/Card';

import { AnlistColAttrs, Tierec, Protocol, Semantier } from '@anclient/semantier-st';
import { L, AnContext, ConfirmDialog
} from '@anclient/anreact';

import { starTheme } from '../../common/star-theme';
import { PollsTier } from './polls';
import { Anform, FormProp } from '../../common/north';
import { CardsForm } from './card-form';

const { CRUD } = Protocol;

const styles = (theme: starTheme) => (Object.assign(
	Semantier.invalidStyles as any, (theme: starTheme) => {
		return ({
			root: {},
			cardGrid: {

			},
			card: {
				margin: theme.spacing(2)
			},
			headCard: {

			}
		});
	}
));

/**
 * Some parent controlled user actions, like SessionInf can be added here.
 * This is a good example that a UI widget can be controlled via type checking.
 */
interface CardsFormProp extends FormProp {
}

/**
 * Render multiple cards in a form - acctually using rows.
 */
class PollDetailsComp extends Anform<CardsFormProp> {
	state = {
		record: {},
		crud: Protocol.CRUD.r,
	};
	tier: PollsTier;
	confirm: typeof ConfirmDialog;

	head(rec: Tierec, x: number, classes: AnMUIClasses, media: Media) {
		return <Card key={x} className={classes.headCard}>{rec.Title}</Card>;
	}

	card(rec: Tierec, x: number, classes: AnMUIClasses, media: Media) {
		return <Grid key={x} item className={classes.cardGrid} >{rec.Title}</Grid>;
	}

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
			  {/* <Box className={classes.smalltip}>
				  {L('Tip: Document can been replaced by uploading another file.')}
<<<<<<< HEAD
			  </Box>
			  <DefaultCardList uri={this.props.uri}
=======
			  </Box> */}
			  <CardsForm uri={this.props.uri}
>>>>>>> master
				  tier={this.tier}
				  columns={this.tier.columns()}
				  rows={this.tier.rows}
				  headFormatter={this.head}
				  CardsFormatter={this.card}
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

const PollDetails = withWidth()(withStyles(styles)(PollDetailsComp));
export { PollDetails, PollDetailsComp };
