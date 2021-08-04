import React from 'react';
import { withStyles } from "@material-ui/core/styles";

import { L } from '../utils/langstr';
import { AnContext, AnError } from './reactext.jsx'

const styles = (theme) => ( {
	root: {
		"& :hover": {
			backgroundColor: '#777'
		}
	}
} );

/**Common base class of function pages.
 * To popup modal dialog, see
 * https://codesandbox.io/s/gracious-bogdan-z1xsd?file=/src/App.js
 */
class CrudComp extends React.Component {
	state = {
		isXs: false;
		isSm: false;
		isMd: false;
		isLg: false;
		isXl: false;
	};

	constructor(props) {
		super(props);

		let {width} = props;
		if (width === 'lg') {
			this.state.isLg = true;
			this.state.isMd = true;
			this.state.isSm = true;
			this.state.isXs = true;
		}
		else if (width === 'xl') {
			this.state.isXl = true;
			this.state.isLg = true;
			this.state.isMd = true;
			this.state.isSm = true;
			this.state.isXs = true;
		}
		else if (width === 'sm') {
			this.state.isSm = true;
			this.state.isXs = true;
		}
		else if (width === 'xs')
			this.state.isXs = true;
		else {
			this.stae.isMd = true;
			this.state.isSm = true;
			this.state.isXs = true;
		}
	}

	render() {
		return (<>Base CrudComp Page</>);
	}
}
CrudComp.contextType = AnContext;

CrudComp.propTypes = {
	width: PropTypes.oneOf(["lg", "md", "sm", "xl", "xs"]).isRequired
};

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
		return (<>Cheap Flow</>);
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
