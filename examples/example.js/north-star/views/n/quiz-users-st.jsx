
import React from 'react';
import { withStyles } from "@material-ui/core/styles";
import withWidth from "@material-ui/core/withWidth";
import PropTypes from "prop-types";

import Button from "@material-ui/core/Button";
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

import { AnClient, SessionClient, Protocol, AnsonResp } from '@anclient/semantier';
import { L, Langstrs,
    AnContext, AnError, CrudCompW, AnReactExt,
    AnTablist
} from '@anclient/anreact';

const styles = (theme) => ( {
	root: {
	}
} );

class QuizUserFormComp extends CrudCompW {
	state = {
		title: '',
		rows: [],
		selected: {Ids: new Set()},
	};

	constructor(props) {
		super(props);
		this.toSave = this.toSave.bind(this);
		this.toClose = this.toClose.bind(this);
		this.onTableSelect = this.onTableSelect.bind(this);
		this.toSearch = this.toSearch.bind(this);
	}

	componentDidMount() {
		let that = this;
		this.props.jquiz.quizUsers(
			{ uri: this.props.uri,
			  quizId: this.props.quizId,
			  isNew: this.props.crud === Protocol.CRUD.c
			},
			resp => {
				let users = resp.Body().quizUsers;
				let {cols, rows} = AnsonResp.rs2arr(users);
				if (rows)
					rows.forEach( (r, x) => {
						r.myMsg = 'TODO ...';
					});
				console.log(cols, rows);
				that.setState({
					title: L('Target Users: {usrNum}', {usrNum: rows.length}),
					rows
				});
			});
	}

	toSave(e) {
		if (e) e.stopPropagation();

		if (this.props.onClose)
			this.props.onSave([...this.state.selected.Ids]);
	}

	toClose(e) {
		if (e) e.stopPropagation();
		if (this.props.onClose)
			this.props.onClose();
	}

	onTableSelect(selectedIds) {
		// this.setState({selectedIds});
		// console.log(selectedIds);
	}

	render () {
		let { classes, tier } = this.props;
		return (
			<Dialog className={classes.root}
				open={true}
				fullScreen={!!this.props.fullScreen}
				onClose={this.handleClose} >

				<DialogTitle id="t-quizusers">{this.state.title}</DialogTitle>

				<DialogContent>
					{this.tier && <AnTablist pk={tier.pk}
						className={classes.root} checkbox={true}
						columns={tier.columns()}
						rows={this.state.rows}
						selectedIds={this.state.selected}
						pageInf={this.state.pageInf}
						onPageInf={this.onPageInf}
						onSelectChange={this.onTableSelect}
					/>}
				<DialogActions>
					<Button onClick={this.toSave} color="inherit">
						{L('OK')}
					</Button>
					<Button onClick={this.toClose} color="inherit" autoFocus>
						{L('Close')}
					</Button>
				</DialogActions>
				</DialogContent>
			</Dialog>);
	}
}
QuizUserFormComp.contextType = AnContext;

QuizUserFormComp.propTypes = {
	uri: PropTypes.string.isRequired,
	tier: PropTypes.object.isRequired
}

const QuizUserForm = withWidth()(withStyles(styles)(QuizUserFormComp));
export { QuizUserForm, QuizUserFormComp }

class QuizUsersTier extends Semantier {

	_cols = [
		{ text: L(''), field:"checked" },  // first field as checkbox
		{ text: L('userId'), hide: true, field: "userId" },
		{ text: L('User Name'), color: 'primary', field: "userName", className: 'bold'},
		{ text: L('My Message'), color: 'primary', field: "myMsg", editabl: true} ];

}
