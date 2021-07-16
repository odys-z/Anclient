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

	render() {
		return (<>Base CrudComp Page</>);
	}
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
