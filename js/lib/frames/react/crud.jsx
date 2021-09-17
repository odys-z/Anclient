import React from 'react';
import { withStyles } from "@material-ui/core/styles";
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

class RolesComp extends CrudComp {
	render() {
		return (<>Roles</>);
	}
}
const Roles = withStyles(styles)(RolesComp);

class UserInfoComp extends CrudComp {
	render() {
		return (<>User Info</>);
	}
}
const UserInfo = withStyles(styles)(UserInfoComp);

export { CrudComp, Home, HomeComp, Domain, DomainComp, Roles, RolesComp, UserInfo, UserInfoComp }
