
import React from 'react';
import { withStyles } from "@material-ui/core/styles";
import withWidth from "@material-ui/core/withWidth";
import PropTypes from "prop-types";

import { Card, TextField, Typography } from '@material-ui/core';

import { AnClient, SessionClient, Protocol } from '@anclient/semantier';
import { L, Langstrs,
    AnContext, AnError, CrudCompW, AnReactExt, AnQueryForm,
    AnTree, stree_t
} from 'anclient';

const styles = (theme) => ( {
	root: {
	}
} );

class QuizUserStartComp extends CrudCompW {
	state = {
		forest: []
	};

	constructor(props) {
		super(props);

		this.toSearchQuiz = this.toSearchQuiz.bind(this);
		this.toSearchKids = this.toSearchKids.bind(this);
		this.onQuizSelect = this.onQuizSelect.bind(this);
	}

	componentDidMount() {
		console.log(this.props.uri)

		let that = this;
		let sk = 'north.my-class';
		let t = stree_t.sqltree; // loading dataset reshaped to tree
		let ds = {  uri: 'override by sk', sk, t,
					sqlArgs: [this.context.anClient.userInfo.uid],
					// onOk: resp => {that.setState({}); console.log(resp)}
				  };
		this.context.anReact.stree(ds, this.context.error, this);


	}

	toSearchQuiz(e, q) {

		let client = this.context.anClient;

		let queryReq = QuizzesComp.buildReq(client, this.uri, query, pageInf);

		this.context.anReact.bindTablist(queryReq, this, this.context.error);
	}


	toSearchKids(e, q) {

		let client = this.context.anClient;

		let queryReq = QuizzesComp.buildReq(client, this.uri, query, pageInf);

		// only because rows'name is different
		queryReq.onOk = (resp) => {
			let rs = resp.Body().Rs();
			let {rows} = AnsonResp.rs2arr( rs );
			this.setState({kids: rows});
		}

		this.context.anReact.bindTablist(queryReq, this, this.context.error);
	}

	onQuizSelect(rowIds) {
		this.setState({selectedId: [...rowIds][0]})
	}

	onUserSelect(rowIds) {
		this.setState({targetUsers: rowIds});
	}

	render () {
		let { classes } = this.props;
		return (
			<Dialog className={classes.root}
				open={true}
				fullScreen={!!this.props.fullScreen}
				onClose={this.handleClose} >

				<DialogTitle id="t-quizusers">{this.state.title}</DialogTitle>

				<DialogContent>
					<Grid container>
					<Grid item sm={12} md={6} >
						<AnQueryForm sm={12} md={6}
							onSearch={this.toSearchQuiz}
							conds={[ { type: 'text', val: '', label: L('Title')} ]}
							query={ (q) => qTitl: q.state.conds[0].val }
						/>
						<AnTablist
							className={classes.root} checkbox singleCheck paging={false}
							columns={[
								{ text: L(''), field:"checked" },  // first field as checkbox
								{ text: L('qid'), hide: true, field: "qid" },
								{ text: L('Title'), field: "Title", color: 'primary', className: 'bold'},
							]}
							rows={this.state.rows} pk='qid'
							onSelectChange={this.onQuizSelect}
						/>
					</Grid>
					<Grid item sm={12} md={6}>
						<AnQueryForm sm={12} md={6}
							onSearch={this.toSearchKids}
							conds={[ { type: 'cbb', val: '', label: L('Class'), sk: 'north.my-classes'} ]}
							query={ (q) => {qClass: q.state.conds[0].val && q.state.conds[0].val.v} }
						/>
						<AnTablist
							className={classes.root} checkbox={true} paging={false}
							columns={[
								{ text: L(''), field:"checked" },  // first field as checkbox
								{ text: L('userId'), hide: true, field: "userId" },
								{ text: L('Name'), field: "userName", color: 'primary'},
								{ text: L('Org / Class'), field: "orgName" },
							]}
							rows={this.state.rows} pk='userId'
							onSelectChange={this.onUserSelect}
						/>
					</Grid>
					</Grid>
				<DialogActions>
					<Button onClick={this.toStartPoll} color="inherit">
						{L('Start a New Poll')}
					</Button>
					<Button onClick={this.toClose} color="inherit" autoFocus>
						{L('Cancel')}
					</Button>
				</DialogActions>
				</DialogContent>
			</Dialog>);
	}
}
QuizUserStartComp.contextType = AnContext;

QuizUserStartComp.propTypes = {
	uri: PropTypes.string.isRequired,
};

const QuizUserStart = withWidth()(withStyles(styles)(QuizUserStartComp));
export { QuizUserStart, QuizUserStartComp }
