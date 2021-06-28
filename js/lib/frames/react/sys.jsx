import React from 'react';
import { withStyles } from "@material-ui/core/styles";
import clsx from 'clsx';
import Drawer from '@material-ui/core/Drawer';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import Collapse from '@material-ui/core/Collapse';

import {
	Drafts, Inbox, Send, ExpandLess, ExpandMore, StarBorder, Sms
} from '@material-ui/icons';

import {
	Home, Domain, Roles, UserInfo
} from ''

const _icons = {
	'expand': <ExpandMore />,
	'collapse': <ExpandLess />,
	'menu-lv0': <Send />,
	'menu-lv1': <Drafts />,
	'menu-leaf': <Sms />,
	'deflt': <Inbox />,
}

const _comps = {
	'/home': <Home />,
	'/sys/domain': <Domain />,
	'/sys/roles': <Roles />,
	'/sys/userinfo': <UserInfo />,
}

const styles = theme => ({
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

class SysComp extends React.Component {
	state = {
		sysName: 'Anclient',
		sysMenu: [{home: 'Home'}],

		userid: '',
		pswd: '',
		username: '',

		expanded: set(),

		hasError: false,
		errHandler: { },
	};

	constructor(props) {
		super(props);
		this.state.sysName = props.sys || props.sysName || props.name;

		this.toExpand = this.toExpand.bind(this);
		this.toCollapse = this.toCollapse.bind(this);
		this.menuItems = this.menuItems.bind(this);

		this.state.errHandler.onError = function() {
			let that = this;
			return (has) => {
				that.setState({hasError: has});
			};
		}.bind(this)();
	}

	toExpand () {
		this.setState({expandMenu: true});
	};

	toCollapse () {
		this.setState({expandMenu: false});
	};

	/**<pre>a_functions
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
	*/
	menuItems() {
		let m = this.state.sysMenu;
		m = {funcId: 'sys',
			funcName: 'Anclient Lv0',
			url: '/',
			css: '{icon: "menu-lv0"}',
			flag: '1',
			fullpath: 'sys',
			parentId: undefind,
			sibling: 1,
			children: [
				{	funcId: 'domain',
					funcName: 'Domain Settings',
					url: '/sys/domain',
					css: '{icon: "menu-lv1"}',
					flag: '1',
					fullpath: 'sys.1 domain',
					parentId: 'sys',
					sibling: 1
				}]
		}

		let css = eval(m.css);
		let open = m.expand;

		return (<>
		<ListItem button onClick={this.onExpand}>
			<ListItemIcon>{icon(css)}</ListItemIcon>
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

		function icon(css) {
			// shall we use theme here?
			if (typeof css === 'string')
				css = eval(css);
			return _icons[css.icon || 'deflt'];
		}

		function subMenus(mitems) {
			return mitems.map( (i, x) =>
			(<div key={`${mitems.funcId}}`}>
				<Link component={RouterLink} to="/stuff">
					<ListItem button className={classes.nested}>
					<ListItemIcon>{icons(mitems.css)}</ListItemIcon>
					<ListItemText primary={mitems.funcName} />
					</ListItem>
				</Link>
			</div>) );
		}
	}

	route() {
		return [{path: 'home', params: {}},
				{path: 'sys/domain', params: {}},
				{path: 'sys/role', params: {}}].map((c, x) => {
			<Route exact path={`/${c.path}`} component={_comps[c.path]} {...c.params}/>
		});
	}

	render() {
    	const { classes } = this.props;
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
					onClick={handleDrawerOpen}
					edge="start"
					className={clsx(classes.menuButton, open && classes.hide)}
				>
				<MenuIcon />
				</IconButton>
				<Typography variant="h6" noWrap>
				Persistent drawer
				</Typography>
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
				<IconButton onClick={this.toCollapse}>
					<ListItemText>{this.state.sysName}</ListItemText>
					{theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
				</IconButton>
			</div>
			<Divider />
			<List>
				{this.menuItems()}
			</List>
			</Drawer></React.Fragment>
			<main onClick={this.toCollapse}
				className={clsx(classes.content, {
					[classes.contentShift]: open,
				})}
			>
				<div className={classes.drawerHeader} />
				<Typography paragraph>CRUD</Typography>
				<div className="content">
					{route()}
					{/*
					<Route exact path="/" component={Home}/>
					<Route path="/stuff" component={Stuff}/>
					<Route path="/contact" component={Contact}/>
					*/}
				</div>
			</main></Router>
		  </div>);
	}
}

const Sys = withStyles(styles)(SysComp);
export { Sys, SysComp };
