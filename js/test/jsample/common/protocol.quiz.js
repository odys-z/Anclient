import { Protocol, AnsonResp } from 'anclient';
// NOTE for test, user this:
// import { Protocol, AnsonResp } from '../../../lib/protocol.js';

export const quiz_a = {
	start: 'start',
	quiz: 'quiz',     //
	list: 'list',     // load quizzes
	insert: 'insert', // create new quiz
	update: 'update', // update quiz

	poll: 'poll',     // submit poll results
}

export class QuizReq {
	constructor () { }

	/** {@link Quiz} use a simple array for question array. This is error prone
	 * to implement protocol. This method helps convert it to array of n-v pairs.
	 */
	static questionToNvs (quests, cols =
		["qid", "question", "answers", "qtype", "answer", "quizId", "qorder", "shortDesc", "hints", "extra"]) {

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

		let rs = respObj.data && respObj.data.props && respObj.data.props.rs && respObj.data.props.rs[0];
		if (rs) {
			this.cols = rs.length ? [] : rs.colnames;
			this.rows = rs.length ? [] : rs.results;
		}

		this.qs = respObj.data && respObj.data.props && respObj.data.props.questions || {};
	}

	/**
	 * @return {array} [ {qid, owner, title, tags, quizinfo, oper, optime} ]
	 */
	quizzes() {
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
	 * title: quiz title
	 * quizId:
	 * quizinfo:
	 * questions: [ {qid, qorder, qtype, shortdesc, question, answer, hints, extra, additional} ]
	 * }
	 */
	questions() {
		this.quizzes();
		let {title, qid, quizinfo} = this.qz && this.qz.length ? this.qz[0] : {};
		let questions = QuizResp.toArrByOrder(
            [ "QID", "QUESTION", "ANSWERS", "QTYPE", "ANSWER", "QORDER", "SHORTDESC", "HINTS", "EXTRA"],
			this.qs.results, this.qs.colnames);
		if (questions)
			questions.forEach( (q, x) => {
				// replaceAll is not available for test
				q.answers = q.answers ? q.answers.split('\\n').join('\n') : '';
			} );
		return {title, quizId: qid, quizinfo, questions};
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

Protocol.registerBody('io.odysz.jquiz.QuizResp', (jsonBd) => {
	return new QuizResp(jsonBd);
});

export const center_a = {
	getClasses: "classes",
	getStatus: "status",
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

		this.date = respObj.data;
		// let polls = respObj.data && respObj.data.props && respObj.data.props.polls;
		// if (polls) {
		// 	this.cols = rs.length ? [] : rs.colnames;
		// 	this.rows = rs.length ? [] : rs.results;
		// }

		// this.qs = respObj.data && respObj.data.props && respObj.data.props.questions || {};
	}

	polls () {
		let polls = this.data && this.data.props && this.data.props.polls;
		let cols, rows;
		if (polls) {
			cols = polls.length ? [] : polls.colnames;
			rows = polls.length ? [] : polls.results;
		}
		return {cols, rows};
	}

	my () {
		let { cols, rows } = this.polls();
		let my = {tasks: rows.length, polls: rows};
		let conns = this.connects();
		// {col, rows} = conns;
		my.connects = conns.rows;
		return my;
	}
}
