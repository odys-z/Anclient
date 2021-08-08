import React from 'react';
import { withStyles } from "@material-ui/core/styles";
import withWidth from "@material-ui/core/withWidth";
import PropTypes from "prop-types";

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
	state = {};

	render() {
		return (<>Base CrudComp Page</>);
	}
}
CrudComp.contextType = AnContext;

// CrudComp.propTypes = {
// 	uri: PropTypes.string.isRequired
// };

/**
 * <pre>CrudCompW.prototype.media = {
    isXs: false,
    isSm: false,
    isMd: false,
    isLg: false,
    isXl: false,
   };</pre>
 * So this can be used like super.media
 */
class CrudCompW extends React.Component {
	constructor(props) {
		super(props);

		let {width} = props;
		let media = {};

		if (width === 'lg') {
			media.isLg = true;
			media.isMd = true;
			media.isSm = true;
			media.isXs = true;
		}
		else if (width === 'xl') {
			media.isXl = true;
			media.isLg = true;
			media.isMd = true;
			media.isSm = true;
			media.isXs = true;
		}
		else if (width === 'sm') {
			media.isSm = true;
			media.isXs = true;
		}
		else if (width === 'xs')
			media.isXs = true;
		else {
			media.isMd = true;
			media.isSm = true;
			media.isXs = true;
		}

		CrudCompW.prototype.media = media;
	}
}
CrudCompW.contextType = AnContext;

CrudCompW.propTypes = {
	width: PropTypes.oneOf(["lg", "md", "sm", "xl", "xs"]).isRequired,
	/* TODO doc Design Notes:
	 * Main CRUD page doesn't need this check. Those common used wigdets need this.
	 * uri: PropTypes.string.isRequired
	 */
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
	CrudComp, CrudCompW,
	Home, HomeComp,
	Domain, DomainComp,
	Roles, RolesComp,
	Users, UsersComp,
	UserInfo, UserInfoComp,
	Orgs, OrgsComp,
	CheapFlow, CheapFlowComp,
}
