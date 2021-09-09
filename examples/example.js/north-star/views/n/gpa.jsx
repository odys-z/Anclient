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
	L, isEmpty, Protocol,
	AnContext, DatasetCombo, ConfirmDialog, RecordForm,
	jsample, Overlay, AnGridsheet, AnIndicatorRenderer
} from 'anclient';
const { JsampleIcons } = jsample;

const styles = (theme) => ({
	root: {
	},
	actionButton: {
	}
});

/**
 * For ag-grid practice, go
 * https://stackblitz.com/edit/ag-grid-react-hello-world-8lxdjj?file=index.js
 * For public results, go
 * https://ag-grid-react-hello-world-8lxdjj.stackblitz.io
 */
class GPAsheetComp extends CrudCompW {
	state = {
		dirty: false,
	};

	constructor (props) {
		super(props);

		this.tier = new GPATier(this);
	}

	componentDidMount() {
		console.log(this.props.uri);

		this.tier.setContext(this.context);
		this.tier.records(this.bindSheet);
	}

	toAdd(e) {
		console.log(e);
	}

	bindSheet(gpaResp) {
		let resp = new GPAResp(gpResp.body);
		let { kids, rows } = GPAResp.GPAs(resp);

		let cols = [
			{ field: 'date', label: L('Date'), wrapText: false, editable: false },
		];

		kids.forEach( (k, x) => {
			cols.push(
				{ field: k.id, label: k.name, width: 120,
				  cellEditor: 'anNumberEdit',
				  cellEditorParams: {min: 0, max: 10},
			 	  cellRenderer: AnIndicatorRenderer } );
		});

		this.setState( { cols, rows, kids } );
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

		debugger
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

		let title = props.title ? props.title : '';
		let msg = props.msg;
		let displayCancel = props.cancel === false ? 'none' : 'block';
		let txtCancel = props.cancel === 'string' ? props.cancel : L('Close');
		let txtSave = L('Publish');


		let usrs = this.state.quizUsers;
		usrs = usrs && (usrs.length > 0 || usrs.size > 0);

		return (
		  <><div className="ag-theme-alpine" style={{height: "100%", width: "100%", margin: "auto"}}>
				<AnGridsheet
					rows={this.state.rows}
					columns={this.columns}
					components={
						anNumberEdit: AnNumericEdit
					}
					contextMenu={{
						name: L('Show Chart [TODO]'),
						action: p => { console.log(p); }
					}}
				/>

				<div style={{textAlign: 'center', background: '#f8f8f8'}}>
					<Button variant="outlined"
						className={classes.usersButton}
						color={ usrs ? 'primary' : 'secondary'}
						onClick={this.toAdd}
						endIcon={<JsampleIcons.Add />}
					>{L('Add Row')}
					</Button>
					<Button onClick={this.toSave} color="primary">
						{txtSave}
					</Button>
					<Button display={displayCancel} onClick={this.onCancel} color="primary" autoFocus>
						{txtCancel}
					</Button>
				</div>
			</div>
			{this.confirm}
		  </>);
	}
}
QuizsheetComp.contextType = AnContext;

const Quizsheet = withStyles(styles)(QuizsheetComp);
export { Quizsheet, QuizsheetComp };

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

		let req = client.userReq(this.uri, this.port,
					new GPAReq( this.uri, conds )
					.A(UserstReq.A.records) );

		client.commit(req, resp, this.errCtx);
	}

	insertRow() {
		if (!this.client) return;
		let client = this.client;
		let that = this;
		let { uri, kids } = opts;

		let req = client.userReq(uri, this.port,
						new GPAReq( uri, { gpa, date, kid } )
						.A(GPAReq.A.gpa) );

		client.commit(req, onOk, this.errCtx);
	}

	updateCell(opts, onOk) {
		if (!this.client) return;
		let client = this.client;
		let that = this;
		let { uri, date, kid, gpa } = opts;

		let req = client.userReq(uri, this.port,
						new GPAReq( uri, { gpa, date, kid } )
						.A(GPAReq.A.gpa) );

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
				new UserstReq( uri, { deletings: [...ids] } )
				.A(UserstReq.A.del) );

			client.commit(req, onOk, this.errCtx);
		}
	}
}

class GPAReq extends AnsonBody {
	static type = 'io....GPAReq';
	static __init__ = function () {
		// Design Note:
		// can we use dynamic Protocol?
		Protocol.registerBody(UserstReq.type, (jsonBd) => {
			return new UserstReq(jsonBd);
		});
		return undefined;
	}();

	static A = {
		gpa: 'r/gpa',
		update: 'u',
		insert: 'c',
		del: 'd',
	};

	constructor(opts) {
		super();
	}
}

class GPAResp extends AnsonResp {
	constructor() {
		super();
	}

	static GPAs(body) {
		let gpas = AnsonResp.rs2arr(body.gpas());
		let kids = AnsonResp.rs2arr(body.kids());
		return {kids: kids.rows, rows: gpas.rows};
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
