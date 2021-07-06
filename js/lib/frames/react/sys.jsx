import React from 'react';
import { withStyles } from "@material-ui/core/styles";
import clsx from 'clsx';
import Drawer from '@material-ui/core/Drawer';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Divider from '@material-ui/core/Divider';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import Collapse from '@material-ui/core/Collapse';
import Typography from '@material-ui/core/Typography';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';

import IconButton from '@material-ui/core/IconButton';
import {
	Drafts, Inbox, Send, ExpandLess, ExpandMore, StarBorder, Sms, Menu
} from '@material-ui/icons';

import { MemoryRouter as Router } from 'react-router';
import { Link as RouterLink } from 'react-router-dom';
import Link from '@material-ui/core/Link';
import {Route} from 'react-router-dom'

import {
	Home, Domain, Roles, UserInfo
} from './crud.jsx'

const _icons = {
	'expand': <ExpandMore />,
	'collapse': <ExpandLess />,
	'menu-lv0': <Send />,
	'menu-lv1': <Drafts />,
	'menu-leaf': <Sms />,
	'deflt': <Inbox />,
}

const _comps = {
	'/home': Home,
	'/sys/domain': Domain,
	'/sys/roles': Roles,
	'/sys/userinfo': UserInfo,
	'/sys/error': Error,
}

const drawerWidth = 240;

const styles = theme => ({
	direction: theme.direction || 'ltr',
	root: {
		display: 'flex',
	},
	appBar: {
		transition: theme.transitions.create(['margin', 'width'], {
		easing: theme.transitions.easing.sharp,
		duration: theme.transitions.duration.leavingScreen,
		}),
	},
	appBarShift: {
		width: `calc(100% - ${drawerWidth}px)`,
		marginLeft: drawerWidth,
		transition: theme.transitions.create(['margin', 'width'], {
		easing: theme.transitions.easing.easeOut,
		duration: theme.transitions.duration.enteringScreen,
		}),
	},
	menuButton: {
		marginRight: theme.spacing(2),
	},
	hide: {
		display: 'none',
	},
	drawer: {
		width: drawerWidth,
		flexShrink: 0,
	},
	drawerPaper: {
		width: drawerWidth,
	},
	drawerHeader: {
		display: 'flex',
		alignItems: 'center',
		padding: theme.spacing(0, 1),
		// necessary for content to be below app bar
		...theme.mixins.toolbar,
		justifyContent: 'flex-end',
	},
	content: {
		flexGrow: 1,
		padding: theme.spacing(3),
		transition: theme.transitions.create('margin', {
		easing: theme.transitions.easing.sharp,
		duration: theme.transitions.duration.leavingScreen,
		}),
		marginLeft: -drawerWidth,
	},
	contentShift: {
		transition: theme.transitions.create('margin', {
		easing: theme.transitions.easing.easeOut,
		duration: theme.transitions.duration.enteringScreen,
		}),
		marginLeft: 0,
	},
});

/**
 * <pre>a_functions
 funcId       |funcName           |url                               |css |flags |fullpath         |parentId |sibling |
 -------------|-------------------|----------------------------------|----|------|-----------------|---------|--------|
 sys          |System             |                                  |    |1     |1 sys            |         |1       |
 sys-domain   |Domain Settings    |views/sys/domain/domain.html      |    |1     |1 sys.1 domain   |sys      |1       |
 sys-role     |Role Manage        |views/sys/role/roles.html         |    |1     |1 sys.2 role     |sys      |2       |
 sys-org      |Orgnization Manage |views/sys/org/orgs.html           |    |1     |1 sys.3 org      |sys      |3       |
 sys-uesr     |Uesr Manage        |views/sys/user/users.html         |    |1     |1 sys.4 user     |sys      |4       |
 sys-wf       |Workflow Settings  |views/sys/workflow/workflows.html |    |1     |1 sys.5 wf       |sys      |5       |
 sys-1.1      |System v1.1        |                                  |    |1     |2 sys-1.1        |         |2       |
 sys-uesr-1.1 |Uesr Manage        |views/sys/user/users-1.1.html     |    |1     |2 sys-1.1.4 user |sys-1.1  |4       |</pre>
 * @class SysComp
 */
class SysComp extends React.Component {
	state = {
		sysName: 'Anclient',
		sysMenu: {
			funcId: 'sys',
			funcName: 'Anclient Lv-0',
			url: '/',
			css: {icon: "menu-lv0"},
			flag: '0',
			fullpath: 'sys',
			parentId: undefined,
			sibling: 0,
			children: [
				{	funcId: 'domain',
					funcName: 'Domain Settings',
					url: '/sys/domain',
					css: {icon: "menu-lv1"},
					flag: '0',
					fullpath: 'sys.0 domain',
					parentId: 'sys',
					sibling: 0
				},
				{	funcId: 'roles',
					funcName: 'Sysem Roles',
					url: '/sys/roles',
					css: {icon: "menu-lv1"},
					flag: '0',
					fullpath: 'sys.1 roles',
					parentId: 'sys',
					sibling: 0
				},
			]
		},

		userid: '',
		pswd: '',
		username: '',

		showMenu: false,
		expandings: new Set(),

		hasError: false,
		errHandler: { },
	};

	constructor(props) {
		super(props);
		this.state.sysName = props.sys || props.sysName || props.name;

		this.showMenu = this.showMenu.bind(this);
		this.hideMenu = this.hideMenu.bind(this);
		this.toExpandItem = this.toExpandItem.bind(this);
		this.menuItems = this.menuItems.bind(this);

		this.state.errHandler.onError = function() {
			let that = this;
			return (has) => {
				that.setState({hasError: has});
			};
		}.bind(this)();
	}

	showMenu() {
		this.setState({showMenu: true});
	}

	hideMenu() {
		this.setState({showMenu: false});
	}

	toExpandItem(e) {
		e.stopPropagation();
		let f = e.currentTarget.getAttribute('iid');

		let expandings = this.state.expandings;
		if (expandings.has(f))
			expandings.delete(f);
		else
			expandings.add(f);
		this.setState({expandings});
	};

	/**
	 * @param {object} classes
	 */
	menuItems(classes) {
		let m = this.state.sysMenu;
		let open = this.state.expandings.has(m.funcId);

		return (<>
		<ListItem button onClick={this.toExpandItem} iid={m.funcId}>
			<ListItemIcon>{icon(m.css)}</ListItemIcon>
			<ListItemText primary={m.funcName} />
			{ open ? icon('expand') : icon('collapse') }
		</ListItem>
		{m.children && m.children.length > 0 ?
			(<Collapse in={open} timeout="auto" unmountOnExit>
				<List component="div" disablePadding>
					{subMenus(m.children)}
				</List>
			</Collapse>) : ''
		}
		</>);

		function icon(icon) {
			// shall we use theme here?
			return _icons[icon || 'deflt'];
		}

		function subMenus(mitems) {
			return mitems.map( (func, x) =>
			(<div key={`${func.funcId}}`}>
				<Link component={RouterLink} to={func.url}>
					<ListItem button className={classes.nested}>
					<ListItemIcon>{icon(func.css.icon)}</ListItemIcon>
					<ListItemText primary={func.funcName} />
					</ListItem>
				</Link>
			</div>) );
		}
	}

	route() {
		return [{path: '/home', params: {}},
				{path: '/sys/domain', params: {}},
				{path: '/sys/roles', params: {}},
				{path: '/sys/error', params: {}}]
		.map( (c, x) =>
			(<Route exact path={c.path} key={x} component={_comps[c.path]} {...c.params}/>)
		);
	}

	render() {
    	const { classes } = this.props;
		let open = this.state.showMenu;

		return (
		  <div className={classes.root}>
			<AppBar
				position="fixed"
				className={clsx(classes.appBar, {
					[classes.appBarShift]: open,
				})}
			>
			<Toolbar>
				<IconButton
					color="inherit"
					aria-label="open drawer"
					onClick={this.showMenu}
					edge="start"
					className={clsx(classes.menuButton, open && classes.hide)}
				>
				<Menu />
				</IconButton>
				<Typography variant="h6" noWrap>Anclient</Typography>
			</Toolbar>
			</AppBar>
			<Router><React.Fragment><Drawer
				className={classes.drawer}
				variant="persistent"
				anchor="left"
				open={open}
				classes={{paper: classes.drawerPaper}}
			>
			<div className={classes.drawerHeader}>
				<IconButton onClick={this.hideMenu}>
					<ListItemText>{this.state.sysName}</ListItemText>
					{/*theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />*/}
					{classes.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
				</IconButton>
			</div>
			<Divider />
			<List>
				{this.menuItems(classes)}
			</List>
			</Drawer></React.Fragment>
			<main onClick={this.hideMenu}
				className={clsx(classes.content, {
					[classes.contentShift]: open,
				})}
			>
				<div className={classes.drawerHeader} />
				<Typography paragraph>CrudComp</Typography>
				<div className="content">
					{this.route()}
				</div>
			</main></Router>
		  </div>);
	}

}

const Sys = withStyles(styles)(SysComp);
export { Sys, SysComp };
