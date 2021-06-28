import React from 'react';
import { withStyles } from "@material-ui/core/styles";
import { AnContext, AnError } from '../../lib/frames/react/an-react.jsx'

const style = (theme) => {

}

class CRUD extends React.Component {

	render() {
		return (<>Base CRUD Page</>);
	}
}
CRUD.contextType = AnContext;

// class HomeComp extends CRUD {
// 	render() {
// 		return (<>Base CRUD Page</>);
// 	}
// }
// // const Home = withStyles(styles)(HomeComp);
//
// class DomainComp extends CRUD {
// 	render() {
// 		return (<>Base CRUD Page</>);
// 	}
// }
// // const Domain = withStyles(styles)(DomainComp);
//
// class RoleComp extends CRUD {
// 	render() {
// 		return (<>Base CRUD Page</>);
// 	}
// }
// // const Role = withStyles(styles)(RoleComp);
//
// class UserInfoComp extends CRUD {
// 	render() {
// 		return (<>Base CRUD Page</>);
// 	}
// }
// // const UserInfo = withStyles(styles)(UserInfoComp);

// export { Home, HomeComp, Domain, DomainComp, Role, RoleComp, UserInfo, UserInfoComp }
export {CRUD}
