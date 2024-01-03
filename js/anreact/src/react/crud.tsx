import React from 'react';
import { PropTypes, StandardProps, Theme, withStyles } from '@material-ui/core';
import { Breakpoint } from '@material-ui/core/styles/createBreakpoints';

import { AnContext } from './reactext';
import { Media, ClassNames } from './anreact';
import { CRUD, Semantier, SessionInf, UIComponent } from '@anclient/semantier';

interface Comprops extends StandardProps<any, string>, UIComponent {
	/**The matching url in React.Route */
	match?: {path: string};

	/** CRUD */
	crud?: CRUD;

	/**MUI as default */
	color?: PropTypes.Color;

	/** Semantier */
	classes?: ClassNames;
	readonly tier?: Semantier;
	readonly width?: Breakpoint;

	ssInf?: SessionInf;
}

const styles = (theme: Theme) => ( {
	root: {
		"& :hover": {
			backgroundColor: '#777'
		}
	}
} );

/**Common base class of function pages.
 * About URI:
 * 1. Every root CRUD must has a uri.
 * 2. Uri is immediately bridged to Semantier.
 * 3. All data accessing must provid the token.
 * @member uri: string
 */
class CrudComp<T extends Comprops> extends React.Component<T> {
	state = {};
	uri = undefined;

	constructor(props: T) {
		super(props);
		this.uri = props.match && props.match.path || props.uri;
		if (!this.uri && props.match)
			throw Error("Anreact CRUD main components' (url route) must set with a URI path. (Component not created with SysComp & React Router 5.2 ? Or declared uri in subclass?)");
	}

	render() {
		return (<>CrudComp</>);
	}
}
CrudComp.contextType = AnContext;

/**
 * @augments {React.Component<{uri: string}, media: {}>}
 * <pre>CrudCompW.prototype.media = {
    isXs: false,
    isSm: false,
    isMd: false,
    isLg: false,
    isXl: false,
   };</pre>
 * So this can be used like:<pre>super.media</pre>
 * FIXME looks like in chrome responsive device mode simulator, withWidth() can't
 * get "width"?
 */
class CrudCompW<T extends Comprops> extends CrudComp<T> {
	media: Media = {};

	// TODO tasks to refactor. why not ts?
	// TODO CrudCompW now shouldn't be the base of form component, e.g. TRrecordForm.
	constructor(props) {
		super(props);

		let {width} = props;
		CrudCompW.prototype.media = CrudCompW.getMedia(width);
	}

	static getMedia(width: string) {
		let media = {} as Media;

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

		return media;
	}

	/**A simple helper: Array.from(ids)[x]; */
	getByIx(ids: Set<string>, x = 0): string {
		return Array.from(ids)[x];
	}
}
CrudCompW.contextType = AnContext;

class HomeComp extends CrudComp<Comprops> {
	render() {
		return (<>Home Page (wrong role - function configuration?)</>);
	}
}
const Home = withStyles(styles)(HomeComp);

class ErrorPageComp extends CrudComp<Comprops>  {
	render() {
		return (<>Error Page</>);
	}
}
const ErrorPage = withStyles(styles)(ErrorPageComp);


class DomainComp extends CrudComp<Comprops>  {
	render() {
		return (<>Domain</>);
	}
}
const Domain = withStyles(styles)(DomainComp);

class OrgsComp extends CrudComp<Comprops>  {
	render() {
		return (<>Orgs</>);
	}
}
const Orgs = withStyles(styles)(OrgsComp);

class RolesComp extends CrudComp<Comprops>  {
	render() {
		return (<>Roles</>);
	}
}
const Roles = withStyles(styles)(RolesComp);

class UsersComp extends CrudComp<Comprops>  {
	render() {
		return (<>Users</>);
	}
}
const Users = withStyles(styles)(UsersComp);

class UserInfoComp extends CrudComp<Comprops>  {
	render() {
		return (<>User Info</>);
	}
}
const UserInfo = withStyles(styles)(UserInfoComp);

class CheapFlowComp extends CrudComp<Comprops>  {
	render() {
		return (<>Cheap Flow</>);
	}
}
const CheapFlow = withStyles(styles)(CheapFlowComp);

/**
 * To popup modal dialog, see
 * https://codesandbox.io/s/gracious-bogdan-z1xsd?file=/src/App.js
 */
class DetailFormW<T extends Comprops> extends CrudCompW<T> {
	state = {
	};
	media: Media;

	constructor(props: Comprops) {
		super(props);

		let {width} = props;
		let media = CrudCompW.getMedia(width);

		DetailFormW.prototype.media = media;
		DetailFormW.prototype.state = this.state;
	}
}
DetailFormW.contextType = AnContext;

export {
	Comprops, CrudComp,
	CrudCompW, DetailFormW,
	Home, HomeComp,
	ErrorPage, ErrorPageComp,
	Domain, DomainComp,
	Roles, RolesComp,
	Users, UsersComp,
	UserInfo, UserInfoComp,
	Orgs, OrgsComp,
	CheapFlow, CheapFlowComp,
}
