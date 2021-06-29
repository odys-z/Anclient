import React from 'react';
import { withStyles } from "@material-ui/core/styles";
import { AnContext, AnError } from '../../lib/frames/react/an-react.jsx'

const style = (theme) => {

}

class CrudComp extends React.Component {

	render() {
		return (<>Base CrudComp Page</>);
	}
}
CrudComp.contextType = AnContext;

class HomeComp extends CrudComp {
	render() {
		return (<>Base CrudComp Page</>);
	}
}
const Home = withStyles(styles)(HomeComp);

class DomainComp extends CrudComp {
	render() {
		return (<>Base CrudComp Page</>);
	}
}
const Domain = withStyles(styles)(DomainComp);

class RoleComp extends CrudComp {
	render() {
		return (<>Base CrudComp Page</>);
	}
}
const Role = withStyles(styles)(RoleComp);

class UserInfoComp extends CrudComp {
	render() {
		return (<>Base CrudComp Page</>);
	}
}
const UserInfo = withStyles(styles)(UserInfoComp);

export { CrudComp, Home, HomeComp, Domain, DomainComp, Role, RoleComp, UserInfo, UserInfoComp }
