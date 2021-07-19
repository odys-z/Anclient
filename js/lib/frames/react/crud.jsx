import React from 'react';
import { withStyles } from "@material-ui/core/styles";

import { L } from '../../../lib/frames/react/utils/langstr';
import { AnContext, AnError } from './reactext.jsx'

const styles = (theme) => ( {
	root: {
		"& :hover": {
			backgroundColor: '#777'
		}
	}
} );

class CrudComp extends React.Component {
	state = {
	};
	// https://codesandbox.io/s/gracious-bogdan-z1xsd?file=/src/App.js
	/*
import React from "react";
import ConfirmDialogComp from "./dlg";
import "./styles.css";

class App extends React.Component {
  state = {
    elements: [
      <div style={{ marginTop: "10px" }}>
        <input type="file" />
        <select id="cars" name="carlist" form="carform">
          <option value="volvo">Volvo</option>
          <option value="saab">Saab</option>
          <option value="opel">Opel</option>
          <option value="audi">Audi</option>
        </select>
      </div>
    ]
  };

  addUser = () => {
    this.setState({
      elements: [...this.state.elements,
        <ConfirmDialogComp onOk={this.onClose} title={'A'} />,
        <ConfirmDialogComp onOk={this.onClose} title={'B'} />]
    });
  };

  onClose = () => {
    this.setState({
      elements: this.state.elements.splice(0, this.state.elements.length - 1)
    })
  }

  render() {
    return (
      <div className="App">
        <h3>Append a React component in another on button click</h3>
        {this.state.elements}

        <button onClick={this.addUser} style={{ marginTop: "10px" }}>
          Add Dialog
        </button>
      </div>
    );
  }
}

export default App;


import React from 'react';
import { withStyles } from "@material-ui/core/styles";
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogTitle from '@material-ui/core/DialogTitle';



const styles = theme => ({
});

class ConfirmDialogComp extends React.Component {
	state = {
		closed: false,
	};

	constructor (props = {}) {
		super(props);
		this.toOk = this.toOk.bind(this);
	}

	toOk(e) {
		this.setState({closed: true});
		if (typeof this.props.onOk === 'function')
			this.props.onOk(e.currentTarget);
	}

	render () {
		let props = this.props;
		let txtOk = props.ok || props.OK ? props.ok || props.OK : "OK";


		const { classes } = this.props;

		return (
			<Dialog className={classes.root}
				open={true}
				fullScreen={!!this.props.fullScreen}
				onClose={this.handleClose}
				aria-labelledby="alert-dialog-title"
				aria-describedby="alert-dialog-description" >

				<DialogTitle id="alert-dialog-title">
				  {this.props.title}
        </DialogTitle>
				<DialogActions>
				  <Button onClick={this.toOk} color="primary">
						{txtOk}
				  </Button>
				</DialogActions>
			</Dialog>
		);
	}
}
export default withStyles(styles)(ConfirmDialogComp);
export {ConfirmDialogComp};

*/
	forms = new Set();

	showForm(details) {
		this.forms.add(details);
	}

	closeForm(details) {
		this.forms.delete(details);
	}

	showForms() {
		return this.forms.forEach((f) => {
			return <div>fffffffffffff</div>;
		});
	}

	render() {
		return (<>Base CrudComp Page</>);
	}
}
CrudComp.contextType = AnContext;

class CrudFormComp extends React.Component {
}
CrudComp.contextType = AnContext;

class HomeComp extends CrudComp {
	render() {
		return (<>Home</>);
	}
}
const Home = withStyles(styles)(HomeComp);

class DomainComp extends CrudComp {
	render() {
		return (<>Domain</>);
	}
}
const Domain = withStyles(styles)(DomainComp);

class OrgsComp extends CrudComp {
	render() {
		return (<>Orgs</>);
	}
}
const Orgs = withStyles(styles)(OrgsComp);

class RolesComp extends CrudComp {
	render() {
		return (<>Roles</>);
	}
}
const Roles = withStyles(styles)(RolesComp);

class UsersComp extends CrudComp {
	render() {
		return (<>Users</>);
	}
}
const Users = withStyles(styles)(UsersComp);

class UserInfoComp extends CrudComp {
	render() {
		return (<>User Info</>);
	}
}
const UserInfo = withStyles(styles)(UserInfoComp);

class CheapFlowComp extends CrudComp {
	render() {
		return (<>User Info</>);
	}
}
const CheapFlow = withStyles(styles)(CheapFlowComp);

export {
	CrudComp,
	Home, HomeComp,
	Domain, DomainComp,
	Roles, RolesComp,
	Users, UsersComp,
	UserInfo, UserInfoComp,
	Orgs, OrgsComp,
	CheapFlow, CheapFlowComp,
}
