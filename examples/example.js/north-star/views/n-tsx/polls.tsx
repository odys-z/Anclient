
import React from 'react';
import {withStyles, Theme } from "@material-ui/core/styles";
import withWidth from "@material-ui/core/withWidth";
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

import { Semantier, Protocol, AnsonMsg, AnsonBody, AnsonResp, AnResultset,
	OnLoadOk, QueryConditions, AnlistColAttrs
} from "@anclient/semantier-st";

import {
	L, AnConst, Comprops,
    AnContext, ConfirmDialog, AnTablist, AnQueryst, jsample, invalidStyles, CrudCompW, CompOpts
} from '@anclient/anreact';

import { PollDetails } from './poll-details';

const { JsampleIcons } = jsample;

export interface PollsProp extends Comprops {
    readonly classes: {
        funcName?: string;
        crudButton: string;
		list: string;
		smalltip?: string; };
};

const styles = (theme: Theme) => (Object.assign(
	invalidStyles, {
	crudButton: {
		margin: theme.spacing(1),
	},
	funcName: {
		fontSize: "1.4em",
	},
	smalltip: {
		fontSize: "0.8em",
		color: "#21217d"
	}
} ));

class PollsComp extends CrudCompW<PollsProp> {

	state = {
		students: [],
		condQzName: { type: 'text', field: '', val: '', label: L('Quiz Name') },
		condTag:  { type: 'text', field: '', val: '', label: L('Quiz Tag') },
		condUser: { type: 'cbb', field: '',
					sk: 'users.org-arg', nv: {n: 'text', v: 'value'},
					sqlArgs: [],
					val: AnConst.cbbAllItem,
					options: [ AnConst.cbbAllItem ],
					label: L('My Students') },

        queryReq: undefined as typeof AnsonBody,
		pageInf: { page: 0, size: 25, total: 0 },
		buttons: { start: true, stop: false, edit: false},
		selected: {ids: new Set<string>()},
	};

    tier: PollsTier;

    confirm: JSX.Element;
    detailsForm: JSX.Element;
	q: QueryConditions = {};

	constructor(props: PollsProp) {
		super(props);

		this.closeDetails = this.closeDetails.bind(this);
		this.toSearch = this.toSearch.bind(this);
		this.onPageInf = this.onPageInf.bind(this);
		this.onTableSelect = this.onTableSelect.bind(this);

		this.toShowDetails = this.toShowDetails.bind(this);

		this.toStop = this.toStop.bind(this);
	}

	componentDidMount() {
		console.log('Polls TSX', this.uri);
		this.tier = new PollsTier(this);
		this.tier.setContext(this.context);
	}

	toSearch(condts?: QueryConditions) {
		if (this.tier) {
			let that = this;
			this.q = condts || this.q;
			this.tier.records( this.q,
				(_cols, rows) => {
					that.state.selected.ids.clear();
					console.log(rows);
					that.setState({});
				} );
		}
	}

	onPageInf(page: number, size: number) {
		this.state.pageInf.size = size;
		this.state.pageInf.page = page;
		// let query = this.state.queryReq;
		// if (query) {
		// 	query.Body().Page(size, page);
		// 	this.state.pageInf = {page, size, total: this.state.pageInf.total};
		// 	this.context.anReact.bindTablist(query, this, this.context.error);
		// }
	}

	onTableSelect(rowIds: string[]) {
		// this.state.selected.ids = rowIds;
		this.setState( {
			buttons: {
				start: this.state.buttons.start,
				stop: rowIds &&  rowIds.length >= 1,
				edit: rowIds && rowIds.length === 1,
			},
		} );
	}

    toShowDetails(e: React.UIEvent): void {
		this.tier.pkval = this.getByIx(this.state.selected.ids, 0);
        this.detailsForm = (
            <PollDetails uri={this.uri}
				tier={this.tier}
				onClose={this.closeDetails}
            />);
    }

	toStop(e: React.UIEvent) {
		let ids = this.state.selected.ids;
		let that = this;
		this.tier.pollsUsers(this.uri,
			{pollIds: ids},
			( (users) => {
				console.log(users);
				let txt = L('Totally {count} polls, {users} users will be updated. Are you sure?',
							{ count: ids.size,
							  users: users.Body().msg() });
				that.confirm =
					(<ConfirmDialog open={true}
						ok={L('OK')} cancel={true} 
						title={L('Info')} msg={txt}
						onOk={ () => {
								that.tier.stopolls(this.uri, this.getByIx(ids),
									( rsp => { that.confirm = undefined; } )); // make sure it's an array
						 	}
						}
							onClose={ () => {that.confirm === undefined} }
					/>);
				that.setState( {} );
			}) );
	}

	closeDetails() {
		this.detailsForm = undefined;
		this.setState({});
	}

	render() {
		const { classes } = this.props;
		let btn = this.state.buttons;
		this.state.condUser.sqlArgs = [this.context.anClient.userInfo.uid];
		return ( <>
			<Typography className={classes.funcName} >{L('Polls Trending - TSX')}</Typography>
			<AnQueryst uri={this.uri}
				onSearch={this.toSearch}
				fields={[ this.state.condQzName, this.state.condTag, this.state.condUser ]}
				// query={ (q: typeof AnQueryst) => { return {
				// 	qzName:q.conds[0].val ? q.conds[0].val : undefined,
				// 	tag:   q.conds[1].val ? q.conds[1].val : undefined,
				// 	orgId: q.conds[2].val ? q.conds[2].val.v : undefined,
				// } } }
				onLoaded={this.toSearch}
			/>
			<Grid container alignContent="flex-end" >
				<Button variant="contained" disabled={!btn.stop}
					className={classes.crudButton} onClick={this.toStop}
					startIcon={<JsampleIcons.DetailPanel />}
				>{L('Stop Poll')}</Button>
				<Button variant="contained" disabled={!btn.edit}
					className={classes.crudButton} onClick={this.toShowDetails}
					startIcon={<JsampleIcons.Add />}
				>{L('Details')}</Button>
				{/*
				<Button variant="contained" disabled={!btn.edit}
					className={classes.crudButton} onClick={this.toEdit}
					startIcon={<JsampleIcons.Delete />}
				>{L('Setup Users')}</Button>*/}
			</Grid>
			<Typography className={classes.smalltip}>A quiz may have multiple records here.</Typography>
			{this.tier && <AnTablist
				className={classes.list} checkbox={true} pk={this.tier.pk}
				columns={this.tier.columns(undefined)}
				rows={this.tier.rows}
				pageInf={this.state.pageInf}
				onPageInf={this.onPageInf}
				selected={this.state.selected}
				onSelectChange={this.onTableSelect}
			/>}
			{this.detailsForm}
			{this.confirm}
		</>);
	}
}
PollsComp.contextType = AnContext;

const Polls = withStyles<any, any, PollsProp>(styles)(withWidth()(PollsComp));

class PollsTier extends Semantier {
	/**{@link StarPorts.polls} */
	// port = 'npolls';

	_fields = [
		{field: 'title', label: L('Title')},
		{field: 'tags',  label: L('#tag')},
		{field: 'qid',  label: L('quiz ID')},
	];

    _cols = [
        { label: L('quiz event'),field: "pid",    visible: false },
        { label: L('Quiz Name'), field: "title",  css: {color: 'primary'}, className: 'bold'},
        { label: L('Users'),     field: "users",  css: {color: 'primary'} },
        { label: L('Status'),    field: "state",  css: {color: 'primary'} },
        // { label: L('Subject'),   field: "subject",style: {color: 'primary'} }
	] as AnlistColAttrs<JSX.Element, CompOpts>[];

	/**quiz id */
	pk = 'qid';

	/** poll id (pkval of poll-details) */
	pollId: string;

    constructor(comp: PollsComp) {
        super(comp);

		Protocol.registerBody(NPollsReq._type,
			(jsonBd: {uri: string, condts: PollQueryConditions}) => { return new NPollsReq(jsonBd); });

		Protocol.registerBody(NPollsResp._type,
			(jsonBd: any) => { return new NPollsResp(jsonBd); });
    }

	/**[Promiting Style]
	 * Get all poll users for pollIds, with state in states.
	 * port: quiz
     *
     * @param opts
     * @param onLoad
     * @param errCtx
     * @returns
     */
    records(opts: QueryConditions, onLoad: OnLoadOk) {
		let {pollIds, states} = opts;
		let opt = {};
		opt[NPollsReq.pollIds] = pollIds;
		opt[NPollsReq.states] = states;
		if (!this.client) return;

		let client = this.client;
		let that = this;

		let req = client.userReq(this.uri, 'npolls',
					new NPollsReq( {uri: this.uri, condts: opts} )
					.A(NPollsReq.A.list) );

		console.log(req);
		client.commit(req,
			(resp: AnsonMsg<NPollsResp>) => {
				let {cols, rows} = AnsonResp.rs2arr(resp.Body().Rs());
				that.rows = rows;
				that.resetFormSession();
				onLoad(cols, rows);
			},
			this.errCtx);
	}

	/**
	 * Load poll of pid (many cards, each for different user)
	 * @param opts
	 * @param opts.pkval poll id
	 * @param onLoad
	 * @returns
	 */
    record(opts: {pkval: string}, onLoad: OnLoadOk) {
		if (!this.client) return;

		let { pkval } = opts;

		pkval = pkval || this.pkval ;
		if (!pkval) {
			console.warn("Calling record() with empty pk.");
			return;
		}

		let client = this.client;
		let that = this;

		let req = client.userReq( this.uri, 'npolls',
					new NPollsReq( {uri: this.uri, condts: {quizId: pkval}} )
					.A(NPollsReq.A.pollCards) );

		console.log(req);
		client.commit(req,
			(resp: AnsonMsg<NPollsResp>) => {
				let {cols, rows} = AnsonResp.rs2arr(resp.Body().polls);
				that.rows = rows;
				that.resetFormSession();
				onLoad(cols, rows);
			},
			this.errCtx);
	}
}

interface PollQueryConditions extends QueryConditions {
	quizId?: string;
	title?: string;
	tag?: string;
	userId?: string;
	pollState?: 'done' | 'poll' | '' | undefined;
	pollId?: string;
}

/**The poll request message body */
class NPollsReq extends AnsonBody {
    /**
     * https://stackoverflow.com/questions/32494174/can-you-create-nested-classes-in-typescript
     */
 	static A = class {
		// static start = 'start';
		/** load poll list */
		static list = 'list';
		/** load poll cards */
		static pollCards = 'r/cards';
		/** stop all polls */
		static stopolls = 'stopolls';
		/**get all users of polls (pollIds, quizId, states) */
		static pollsUsers = 'polls-users';
	}

	/**Parameter name: poll ids*/
    static pollIds = "pids";
	/**Parameter name: poll states*/
    static states = "states";

	static _type = "io.oz.ever.conn.n.poll.NPollsReq";

	/**quiz Id */
	quizId: string;

	constructor(jso: {uri: string, condts: PollQueryConditions}) {
		super({type: NPollsReq._type, uri: jso.uri});

		this.quizId = jso.condts.quizId;
	}

}

class NPollsResp extends AnsonResp {
	static _type = "io.oz.ever.conn.n.poll.NPollsResp";
	polls: AnResultset;

	constructor(jsonBd) {
		super(jsonBd);

		this.polls = jsonBd.polls;
	}

	Rs(rsx = 0) {
		return this.polls;
	}
}

export { Polls, PollsComp, NPollsReq, PollsTier }
