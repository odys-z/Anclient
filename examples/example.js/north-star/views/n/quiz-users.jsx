
import React from 'react';
import { withStyles } from "@material-ui/core/styles";
import withWidth from "@material-ui/core/withWidth";
import PropTypes from "prop-types";

import Button from "@material-ui/core/Button";
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';

import dateFormat from "dateformat";
import { CRUD, AnsonResp } from '@anclient/semantier-st';
import { L, AnContext, CrudCompW, AnTablist
} from '@anclient/anreact';

const styles = (theme) => ( {
	root: {
	}
} );

class QuizUserFormComp extends CrudCompW {
	state = {
		title: '',
		rows: [],
		selected: {ids: new Set()},
	};

	constructor(props) {
		super(props);
		this.toSave = this.toSave.bind(this);
		this.toClose = this.toClose.bind(this);
		this.onTableSelect = this.onTableSelect.bind(this);
	}

	toSave(e) {
		if (e) e.stopPropagation();

		if (this.props.onSave)
			this.props.onSave([...this.state.selected.ids]);
	}

	toClose(e) {
		if (e) e.stopPropagation();
		if (this.props.onClose)
			this.props.onClose();
	}

	onTableSelect(selectedIds) {
	}

	componentDidMount() {
		let that = this;
		this.props.jquiz.quizUsers(
			{ uri: this.props.uri,
			  quizId: this.props.quizId,
			  isNew: this.props.crud === CRUD.c
			},
			resp => {
				let users = resp.Body().quizUsers;
				let {cols, rows} = AnsonResp.rs2arr(users);
				if (rows)
					rows.forEach( (r, x) => {
						r.myMsg = `${dateFormat()} @ ${r.userName}`;
					});
				console.log(cols, rows);
				that.setState({
					title: L('Target Users: {usrNum}', {usrNum: rows.length}),
					rows
				});
			});
	}

	render () {
		let {classes} = this.props;
		return (
			<Dialog className={classes.root}
				open={true}
				fullScreen={!!this.props.fullScreen}
				onClose={this.handleClose} >

				<DialogTitle id="t-quizusers">{this.state.title}</DialogTitle>

				<DialogContent>
					<AnTablist selected={this.state.selected}
						className={classes.root} checkbox={true} paging={false}
						columns={[
							{ label: L(''), field:"checked" },  // first field as checkbox
							{ label: L('userId'), visible: false, field: "userId" },
							{ label: L('User Name'), color: 'primary', field: "userName", className: 'bold'},
							{ label: L('Message'), color: 'primary', field: "myMsg", editabl: true},
						]}
						rows={this.state.rows} pk='userId'
						onSelectChange={this.onTableSelect}
					/>
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
}

const QuizUserForm = withWidth()(withStyles(styles)(QuizUserFormComp));
export { QuizUserForm, QuizUserFormComp }
