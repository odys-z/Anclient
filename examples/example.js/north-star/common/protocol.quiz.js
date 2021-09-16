// NOTE for unit test, use this:
// import { Protocol, AnsonResp, AnsonBody } from '../../node_modules/anclient/lib/protocol.js';
// import { L } from '../../node_modules/anclient/lib/utils/langstr.js';
// for jsample, use
import { Protocol, AnsonResp, AnsonBody } from '@anclient/semantier';
import { L } from '@anclient/anreact';

export class QuizReq {
	constructor () { }

	/** {@link Quiz} use a simple array for question array. This is error prone
	 * to implement protocol. This method helps convert it to array of n-v pairs.
	 * DESIGN NOTE:
	 * This check shouldn't happen if the pattern is optimized.
	 */
	static questionToNvs (quests, cols =
		// ["qid", "question", "answers", "qtype", "answer", "quizId", "qorder", "shortDesc", "hints", "extra"]) {
		["question", "answers", "indId", "qtype", "answer", "quizId", "qorder", "shortDesc", "hints", "extra"]) {

		/*
		* NOTE 19 Aug 2021: If put return array of this fucntion into
		* SemanticObject.data.props, the server side can't figure out 2D array in props
		* map, which makes it print a lot of warning. So use checkQuestion();
		*/
		console.warn('This function is deprecated!');

		let qs = [];
		if (quests)
			quests.forEach( (q, x) => {
				let qlen = Object.keys(q).length;
				let row = new Array(Math.min(qlen, cols.length));
				for (let i = 0; i < cols.length && i < qlen; i++)
					row[i] = [cols[i], q[cols[i]]];
				qs.push(row);
			} );
		return qs;
	}

	static questionCols = ["question", "answers", "indId", "qtype", "answer", "quizId", "qorder", "shortDesc", "hints", "extra", "title"];
	static checkQuestions(arr) {
		let qs = [];
		if (arr)
			arr.forEach( (ar, x) => qs.push(QuizReq.checkQuestion(ar, x)));
		return qs;
	}

	static checkQuestion(ar, x) {
		let q = {type: 'io.odysz.jquiz.JsonQuestion'};
		if (x !== null && x !== undefined)
			q.qid = "" + x;

		for (let i = 0; i < QuizReq.questionCols.length; i++)
			q[QuizReq.questionCols[i]] = ar[QuizReq.questionCols[i]];

		return q;
	}
}

export class QuizResp extends AnsonResp {
	constructor (body) {
		let respObj = body.length ? body[0] : body;
		super(respObj);
		this.data = respObj.data;
		this.m = respObj.m;
		this.map = respObj.map;
  		this.port = respObj.serv;
		this.seq = respObj.seq;

		this.quizId = respObj.quizId;

		let rs = respObj.data && respObj.data.props && respObj.data.props.rs && respObj.data.props.rs[0];
		if (rs) {
			this.cols = rs.length ? [] : rs.colnames;
			this.rows = rs.length ? [] : rs.results;
		}
		this.quizUsers = respObj.quizUsers;

		this.qs = respObj.data && respObj.data.props && respObj.data.props.questions || {};
	}

	/**
	 * @return {array} [ {qid, owner, title, tags, quizinfo, oper, optime} ]
	 */
	quizzes_deprecated() {
		if (this.qz === undefined) {
			// let cols = this.cols;

			this.qz = QuizResp.toArrByOrder(
				['QID', 'QOWNER', 'TITLE', 'TAGS', 'QUIZINFO', 'OPER', 'OPTIME'],
				this.rows, this.cols);
		}
		return this.qz;
	}

	/**
	 * @return {object} {
	 * title: quiz title,
	 * quizId,
	 * quizinfo,
	 * subject,
	 * tags,
	 * questions: [ {qid, qorder, qtype, shortdesc, question, answer, hints, extra, additional} ]
	 * }
	 */
	questions_deprecated() {
		this.quizzes();
		let {title, qid, quizinfo, tags, subject} = this.qz && this.qz.length ? this.qz[0] : {};
		let questions = QuizResp.toArrByOrder(
            [ "QID", "QUESTION", "ANSWERS", "QTYPE", "ANSWER", "QORDER", "SHORTDESC", "HINTS", "EXTRA"],
			this.qs.results, this.qs.colnames);
		if (questions)
			questions.forEach( (q, x) => {
				// replaceAll is not available for test
				q.answers = q.answers ? q.answers.split('\\n').join('\n') : '';
			} );
		return {quizId: qid, title, subject, tags, quizinfo, questions};
	}

	quiz_questions() {
		let {cols, rows} = AnsonResp.rs2arr(this.data.props.rs[0]);
		let quiz = rows[0] || {title: L('New Quiz')};

		// let questions = QuizResp.toArrByOrder(
        //     [ "QID", "QUESTION", "SUBJECT", "ANSWERS", "QTYPE", "ANSWER", "QORDER", "QUIZINFO", "HINTS", "EXTRA"],
		// 	this.qs.results, this.qs.colnames);
		// if (questions)
		// 	questions.forEach( (q, x) => {
		// 		// replaceAll is not available for test
		// 		q.answers = q.answers ? q.answers.split('\\n').join('\n') : '';
		// 	} );
		let questions = AnsonResp.rs2arr(this.data.props.questions);
		questions = questions.rows;

		return {quizId: quiz.qid, quiz, questions};
	}

	quizUserIds() {
		let ids = [];
		let {cols, rows} = AnsonResp.rs2arr(this.quizUsers);
		if (rows)
			rows.forEach( (r, x) => ids.push(r.userId));
		return ids;
	}

	static toArrByOrder(colsOrder, rows, cols) {
		if (rows && cols) {
			let qzs = [];
			rows.forEach( (r, rx) => {
				// console.log(r);
				let qz = {};
				colsOrder.forEach( (c, x) => {
					if (c in cols){
						let [cx, cn] = cols[c];
						cx--; // a headach bug from java ResultSet
						qz[cn] = r[cx];
					}
				})
				qzs.push(qz);
			} )
			return qzs;
		}
		else return [];
	}
}

/**
 * @see io.odysz.jquiz.QuizProtocol
 */
export const QuizProtocol = {
	quizId: "quizId",
	templName: 'templ-id',
	questions: "questions",
	qtitle: "title",
	subject: "subject",
	tags: "tags",
	quizinfo: "quizinfo",
	qowner: "qowner",
	dcreate: "dcreate",

	poll: "poll",
	quizUsers: "quizUsers",
	pollIds: "pids",
	states: "states",

 	A: {
		start: 'start',
		quiz: 'quiz',     //
		list: 'list',     // load quizzes
		insert: 'insert', // create new quiz
		update: 'update', // update quiz
		stopolls: 'stopolls', // stop all polls
		pollsUsers: 'polls-users', // get all users of polls (pollIds, quizId, states)

		poll: 'poll',     // submit poll results
		quizUsers: 'quizUsers', // load quiz's users
		deleteq: "delq",
	},

	Qtype: {
		single: 's',
		multiple: 'm',
		text: 't',
		num: 'n',
		rank5: 'r5',
		rank10: 'r10',
		multiR5: 'mr5',
		multiR10: 'mr10',

		/** for DatasetCombo */
		options: () => {
			return [
				{n: L('Single Option'),  v: 's'},
				{n: L('Multiple Check'), v: 'm'},
				{n: L('Free Text'),      v: 't'},
				{n: L('Number Only'),    v: 'n'},
				{n: L('5 Stars'),        v: 'r5'},
				{n: L('10 Stars'),       v: 'r10'},
				{n: L('Multi-5 Stars'),  v: 'mr5'},
				{n: L('Multi-10 Stars'), v: 'mr10'}
			]
		},

		encode: (n) => {
			let opts = QuizProtocol.Qtype.options();
			for (let i = 0; i < opts.length; i++)
				if (opts[i].n === n)
					return opts[i].v;
		},

		agridContextMenu: () => {
			return [
				{ name: L('Single Option'),
				  action: p => {
					  p.node['qtype'] = 's';
					  p.node['expectings'] = p.node['expectings'] || 'A. \nB. \nC. \nD. ';
				} },
				{ name: L('Multiple Check'),
				  action: p => {
					  p.node['qtype'] = 'm';
					  p.node['expectings'] = p.node['expectings'] || 'A. \nB. \nC. \nD. ';
				} },
				{n: L('Free Text'),
				  action: p => {
					  p.node['qtype'] = 't';
				} },
				{n: L('Number Only'),
				  action: p => {
					  p.node['qtype'] = 'n';
					  p.node['expectings'] = p.node['expectings'] || '0';
				} },
				{n: L('5 Stars'),
				  action: p => {
					  p.node['qtype'] = 'r5';
				} },
				{n: L('10 Stars'),
				  action: p => {
					  p.node['qtype'] = 'r10';
				} },
				{n: L('Multi-5 Stars'),
				  action: p => {
					  p.node['qtype'] = 'mr5';
					  p.node['expectings'] = p.node['expectings'] || 'A. \nB. \nC. \nD. ';
				} },
				{n: L('Multi-10 Stars'),
				  action: p => {
					  p.node['qtype'] = 'mr10';
					  p.node['expectings'] = p.node['expectings'] || 'A. \nB. \nC. \nD. ';
				} },
			]
		},

		decode: (v) => {
			let opts = QuizProtocol.Qtype.options();
			for (let i = 0; i < opts.length; i++)
				if (opts[i].v === v)
					return opts[i].n
			return v; // failed
		},

		agRenderer: (p) => {
			// return '**' + p.value + '**';
			return QuizProtocol.Qtype.decode(p.value);
		},

	},

	PollDetailType: 'io.odysz.jquiz.PollDetail',
}

/**
 */
export const CenterProtocol = {
	// Prameter names
	pollId: "pollId",

	myClasses: "classes",
	myConnects: "connects",
	myPolls: "polls",
	myTaskIds: "my-taskIds",
	pollQuestions: "questions",
	pollResults: "poll-results",
	pollState: "poll-state",
	pollIssuer: "poll-issuer",

	A: {
		getClasses: "classes",
		getStatus: "status",
		loadPoll: "load-poll",
		myPolls: "mypolls",
		submitPoll: "submit-poll"
	},

	ConnectMsg: {
		hi: "hi",
	},

	PollState: {
		wait: "wait",
		done: "done",
		polling: "ping",
		stop: "stop",
	}
}

export class CenterResp extends AnsonResp {

	constructor (body) {
		let respObj = body.length ? body[0] : body;
		super(respObj);
		this.data = respObj.data;
		this.m = respObj.m;
		this.map = respObj.map;
  		this.port = respObj.serv;
		this.seq = respObj.seq;
	}

	polls () {
		let polls = this.data && this.data.props && this.data.props.polls;
		let {cols, rows} = AnsonResp.rs2arr(polls);
		return {cols, rows};
	}

	connects () {
		let conns = this.data && this.data.props && this.data.props.connects;
		let cols, rows;
		if (conns) {
			cols = conns.length ? [] : conns.colnames;
			rows = conns.length ? [] : conns.results;
		}
		return {cols, rows};
	}

	my () {
		let { cols, rows } = this.polls();
		let myTaskIds = this.myTaskIds();
		let my = {tasks: myTaskIds.size, polls: rows};
		let conns = this.connects();
		my.connects = conns.rows;
		return my;
	}

	/**convert response's data.props.polls to quiz' questions */
	carouselQuiz() {
		let {rows, cols} = AnsonResp.rs2arr(this.data.props.polls);
		let poll = rows[0];

		let questions = AnsonResp.rs2arr(this.data.props.questions);
		return { poll, questions: questions.rows };
	}

	/**convert response's data.props.myTaskIds to set */
	myTaskIds() {
		let {rows, cols} = AnsonResp.rs2arr(this.data.props[CenterProtocol.myTaskIds]);
		let res = new Set();
		if (rows)
			rows.forEach( (r, x) => {
				res.add(r[cols[0]])
			} );
		return res;
	}
}

Protocol.registerBody('io.oz.ever.conn.n.NorthResp', (jsonBd) => {
	return new NorthResp(jsonBd);
});

Protocol.registerBody('io.odysz.jquiz.QuizResp', (jsonBd) => {
	return new QuizResp(jsonBd);
});

Protocol.registerBody('io.oz.ever.conn.c.CenterResp', (jsonBd) => {
	return new CenterResp(jsonBd);
});
