import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import PropTypes from "prop-types";

import Typography from '@material-ui/core/Button';
import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';
import Divider from '@material-ui/core/Box';

import { AgGridColumn, AgGridReact } from 'ag-grid-react';

import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';

import {
	L, isEmpty, Protocol, AnsonBody, AnsonResp,
	AnContext, DatasetCombo, ConfirmDialog, CrudComp,
	jsample, Overlay, AnGridsheet //, AnIndicatorRenderer
} from 'anclient';
const { JsampleIcons } = jsample;

import { AnIndicatorRenderer } from '../../lib/react/widgets/ag-gridsheet';

const styles = (theme) => ({
	root: {
		height: "calc(100vh - 16ch)"
	},
	actionButton: {
	}
});

/**
 * Bind gpa recodrs to sheet.
 * First row is gpa average, not editable.
 * input: tire.rows, kids. kids: [{id, name, average}].
 *
 * For ag-grid practice, go
 * https://stackblitz.com/edit/ag-grid-react-hello-world-8lxdjj?file=index.js
 * For public results, go
 * https://ag-grid-react-hello-world-8lxdjj.stackblitz.io
 */
class GPAsheetComp extends CrudComp {
	state = {
		dirty: false,
		cols: [],
		rows: [],
	};

	constructor (props) {
		super(props);

		this.tier = new GPATier(this);

		this.bindSheet = this.bindSheet.bind(this);
		this.toAdd = this.toAdd.bind(this);
		this.alert = this.alert.bind(this);
		this.toSave = this.toSave.bind(this);
	}

	componentDidMount() {
		console.log(this.props.uri);

		this.tier.setContext(this.context);
		this.tier.records(null, this.bindSheet);
	}

	toAdd(e) {
		console.log(e);
	}

	bindSheet(gpaResp) {
		// Why we have to handle data at both side?
		// can date been specified by columens? - won't work is not generated
		let resp = new GPAResp(gpaResp.Body());
		let { kids, cols, rows } = GPAResp.GPAs(resp);

		console.log(kids, cols, rows);
		// let cols = [
		// 	{ field: 'date', label: L('Date'), wrapText: false, editable: false },
		// ];
		let ths = [{ field: 'gday', label: L('DATE'), width: 120, editable: false }];

		let avrow = {gday: ' -- -- '}; // average row
		kids.filter( k => !!k )
			.forEach( (k, x) => {
				ths.push( {
					field: k.kid, label: k.userName, width: 120,
					cellEditor: 'anNumberEdit',
					cellEditorParams: {min: 0, max: 10},
					cellRenderer: AnIndicatorRenderer } );

				avrow[k.kid] = k.avg;
			});

		rows.unshift(kids.rows);

		this.setState( { cols: ths, rows, kids } );
	}

	alert(msg) {
		let that = this;
		this.confirm = (
			<ConfirmDialog title={L('Info')}
				ok={L('Ok')} cancel={false} open
				onClose={() => {that.confirm = undefined;} }
				msg={msg} />);
		this.setState({});
	}

	toSave(e) {
		e.stopPropagation();
		let that = this;

		this.quizHook.collect && this.quizHook.collect(this.state);

		if ( that.state.crud === Protocol.CRUD.c ) {
			this.jquiz.insert(this.props.uri, this.state,
				(resp) => {
					let {quizId, title} = JQuiz.parseResp(resp);
					if (isEmpty(quizId))
						console.error ("Something Wrong!");
					that.state.quiz.qid = quizId;
					that.state.crud = Protocol.CRUD.u;
					that.alert(L("New quiz created!\n\nQuiz Title: {title}", {title}));
				});
		}
		else {
			this.jquiz.update(this.props.uri, this.state,
				(resp) => {
					let {questions} = JQuiz.parseResp(resp);
					that.alert(L("Quiz saved!\n\nQuestions number: {questions}", {questions}));
				});
		}
	}

	render () {
		let props = this.props;
		let {classes} = props;

		// let title = props.title ? props.title : '';
		// let msg = props.msg;
		// let displayCancel = props.cancel === false ? 'none' : 'block';
		// let txtCancel = props.cancel === 'string' ? props.cancel : L('Close');
		// let txtSave = L('Publish');

		return (
		  <Box className={classes.root}>
			<div className="ag-theme-alpine" style={{height: "100%", width: "100%", margin: "auto"}}>
			{this.state.cols && this.state.cols.length &&
				<AnGridsheet
					rows={this.state.rows}
					columns={this.state.cols}
					components={ {
						anNumberEdit: AnNumericEdit
					} }
					contextMenu={{
						name: L('Show Chart [TODO]'),
						action: p => { console.log(p); }
					}}
					rowEditable={AnRowEditableChecker}
			/>}

				<div style={{textAlign: 'center', background: '#f8f8f8'}}>
					<Button variant="outlined"
						className={classes.usersButton}
						color='primary'
						onClick={this.toAdd}
						endIcon={<JsampleIcons.Add />}
					>{L('Add Row')}
					</Button>
				</div>
			</div>
			{this.confirm}
		  </Box>);
	}
}
GPAsheetComp.contextType = AnContext;

const GPAsheet = withStyles(styles)(GPAsheetComp);
export { GPAsheet, GPAsheetComp };

class GPATier {
	port = 'gpatier';
	client = undefined;
	uri = undefined;
	kids = [
		{name: 'Alice Zhou', id: 'alice'},
		{name: 'George Zhang', id: 'george'},
		{name: 'James Hu', id: 'james'},
	];
	rows = [{date: 'yyyy', alice: 3, george: 5, james: 5}];
	ths_ = [];

	constructor(comp) {
		this.uri = comp.uri || comp.props.uri;
	}

	setContext(context) {
		this.client = context.anClient;
		this.errCtx = context.error;
	}

	records(conds, onLoad) {
		if (!this.client) return;

		let client = this.client;
		let that = this;

		let req = client.userReq( this.uri, this.port,
					new GPAReq( this.uri, conds )
					.A(GPAReq.A.gpas) );

		client.commit(req, onLoad, this.errCtx);
	}

	insertRow() {
		if (!this.client) return;
		let client = this.client;
		let that = this;
		let { uri, kids } = opts;

		let req = client.userReq(uri, this.port,
						new GPAReq( uri, { gpa, date, kid } )
						.A(GPAReq.A.insert) );

		client.commit(req, onOk, this.errCtx);
	}

	updateCell(opts, onOk) {
		if (!this.client) return;
		let client = this.client;
		let that = this;
		let { uri, date, kid, gpa } = opts;

		let req = client.userReq(uri, this.port,
						new GPAReq( uri, { gpa, date, kid } )
						.A(GPAReq.A.update) );

		client.commit(req, onOk, this.errCtx);
	}

	/**
	 * @param {Set} ids record id
	 * @param {function} onOk: function(AnsonResp);
	 */
	del(opts, onOk) {
		if (!this.client) return;
		let client = this.client;
		let that = this;
		let { uri, ids } = opts;

		if (ids && ids.size > 0) {
			let req = this.client.userReq(uri, this.port,
				new GPAReq( uri, { deletings: [...ids] } )
				.A(GPAReq.A.del) );

			client.commit(req, onOk, this.errCtx);
		}
	}
}

class GPAResp extends AnsonResp {
	static type = 'io.oz.ever.conn.n.gpa.GPAResp';

	constructor(jsonbd) {
		super(jsonbd);

		this.gpas = jsonbd.gpas;
		this.kids = jsonbd.kids;
		this.cols = jsonbd.cols;
	}

	static GPAs(body) {
		let gpas = AnsonResp.rs2arr(body.gpas);
		let kids = AnsonResp.rs2arr(body.kids);
		return {kids: kids.rows, cols: gpas.cols, rows: gpas.rows};
	}
}

class GPAReq extends AnsonBody {
	static type = 'io.oz.ever.conn.n.gpa.GPAReq';
	static __init__ = function () {
		// Design Note:
		// can we use dynamic Protocol?
		Protocol.registerBody(GPAReq.type, (jsonBd) => {
			return new GPAReq(jsonBd);
		});
		// because resp arrived before register triggered
		Protocol.registerBody(GPAResp.type, (jsonBd) => {
			return new GPAResp(jsonBd);
		});
		return undefined;
	}();

	static A = {
		gpas: 'r/gpas',
		update: 'u',
		insert: 'c',
		del: 'd',
	};

	constructor(opts) {
		super();

		this.type = GPAReq.type;
	}
}

// https://www.ag-grid.com/javascript-data-grid/component-cell-editor/#angular-cell-editing
class AnNumericEdit {
  // gets called once before the renderer is used
  init(params) {
    // create the cell
    this.eInput = document.createElement('input');

    if (this.isCharNumeric(params.charPress)) {
      this.eInput.value = params.charPress;
    } else {
      if (params.value !== undefined && params.value !== null) {
        this.eInput.value = params.value;
      }
    }

    this.eInput.addEventListener('keypress', (event) => {
      if (!this.isKeyPressedNumeric(event)) {
        this.eInput.focus();
        if (event.preventDefault) event.preventDefault();
      } else if (this.isKeyPressedNavigation(event)) {
        event.stopPropagation();
      }
    });

    // only start edit if key pressed is a number, not a letter
    const charPressIsNotANumber =
      params.charPress && '1234567890'.indexOf(params.charPress) < 0;
    this.cancelBeforeStart = charPressIsNotANumber;
  }

  isKeyPressedNavigation(event) {
    return event.keyCode === 39 || event.keyCode === 37;
  }

  // gets called once when grid ready to insert the element
  getGui() {
    return this.eInput;
  }

  // focus and select can be done after the gui is attached
  afterGuiAttached() {
    this.eInput.focus();
  }

  // returns the new value after editing
  isCancelBeforeStart() {
    return this.cancelBeforeStart;
  }

  // example - will reject the number if it contains the value 007
  // - not very practical, but demonstrates the method.
  isCancelAfterEnd() {
    const value = this.getValue();
    return value.indexOf('007') >= 0;
  }

  // returns the new value after editing
  getValue() {
    return this.eInput.value;
  }

  // any cleanup we need to be done here
  destroy() {
    // but this example is simple, no cleanup, we could  even leave this method out as it's optional
  }

  // if true, then this editor will appear in a popup
  isPopup() {
    // and we could leave this method out also, false is the default
    return false;
  }

  getCharCodeFromEvent(event) {
    event = event || window.event;
    return typeof event.which == 'undefined' ? event.keyCode : event.which;
  }

  isCharNumeric(charStr) {
    return !!/\d/.test(charStr);
  }

  isKeyPressedNumeric(event) {
    const charCode = this.getCharCodeFromEvent(event);
    const charStr = String.fromCharCode(charCode);
    return this.isCharNumeric(charStr);
  }
}

function AnRowEditableChecker(p) {
	return p.row > 0;
}
