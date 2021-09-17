import React from 'react';
import { withStyles } from "@material-ui/core/styles";
import clsx from 'clsx';
import Grid from '@material-ui/core/Grid';
import Drawer from '@material-ui/core/Drawer';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Box from '@material-ui/core/Box';
import Card from '@material-ui/core/Card';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import DialogActions from '@material-ui/core/DialogActions';
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
	Drafts, Inbox, Send, ExpandLess, ExpandMore, Sms, Menu, School
} from '@material-ui/icons';

import { MemoryRouter as Router } from 'react-router';
import { Link as RouterLink } from 'react-router-dom';
import Link from '@material-ui/core/Link';
import { Route } from 'react-router-dom'

import { Protocol } from '@anclient/semantier';

	import { AnContext } from './reactext';
	import { ConfirmDialog } from './widgets/messagebox';
	import { MyIcon } from './widgets/my-icon';
	import { MyInfo } from './widgets/my-info';
	import { L, Langstrs } from '../utils/langstr';
	import { parseMenus } from '../utils/helpers';

import {
	Home, Domain, Roles, UserInfo, Orgs, Users, CheapFlow
} from './crud.jsx'


const _icons = {
	'expand': <ExpandMore />,
	'collapse': <ExpandLess />,
	'menu-lv0': <Send />,
	'menu-lv1': <Drafts />,
	'menu-leaf': <Sms />,
	'deflt': <Inbox />,
}

export function uri(comp, uri) {
	if (comp.Naked)
		comp.Naked.prototype.uri = uri;
	else
		comp.prototype.uri = uri;
	return comp;
}
/**
 * Map of uri to UI components.
 * CrudComp.Uri will wrapp the component with propterty "uri", which will be
 * used as func-uri for determine conn-id in the future (v1.2?)
 *
 * If key-uri !== arg-uri, jserv won't find the correct connId
 */
const _comps = { }

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
	loginfo: {
		textAlign: 'end',
		color: 'wheat',
		"& :hover": {
			backgroundColor: 'Indigo'
		}
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
	welcome: {
		padding: theme.spacing(2),
		width: 340,
		"& svg": {
			margin: 24,
		},
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
		window: undefined,
		welcome: true,
		sysName: 'Anreact Sample',
		skMenu: undefined, // e.g. 'sys.menu.jserv-sample';
		// {funcId, funcName,url, css: {icon}, fullpath, parentId, sibling, children: [] }
		sysMenu: { },

		cruds: [{'/': Home}],
		paths: [],

		menuTitle: 'Sys Menu',
		showMenu: false,
		expandings: new Set(),
	};

	static extendLinks(links) {
		links.forEach( (l, x) => {
			_comps[l.path] = uri(l.comp, l.path);
		});
	}

	constructor(props) {
		super(props);
		this.state.window = props.window;

		this.state.sysName = props.sys || props.sysName || props.name || this.state.sysName;
		this.state.skMenu = props.menu;
		this.state.menuTitle = props.menuTitle || 'Sys Menu';

		this.showMenu = this.showMenu.bind(this);
		this.hideMenu = this.hideMenu.bind(this);
		this.toExpandItem = this.toExpandItem.bind(this);
		this.menuItems = this.menuItems.bind(this);

		this.toLogout = this.toLogout.bind(this);
	}

	componentDidMount() {
		// load menu
		let that = this;
		this.context.anReact.loadMenu(
			this.state.skMenu,
			(dsResp) => {
				let {menu, paths} = parseMenus(dsResp.Body().forest);
				that.state.sysMenu = menu;
				that.state.cruds = paths;
			}, this.context.error );
	}

	showMenu() {
		this.setState({ showMenu: true });
	}

	hideMenu() {
		this.setState({ showMenu: false });
	}

	toLogout() {
		// Notify children? - not so simple for each target CrudComp needs to be notified.

		let that = this;
		this.confirmLogout =
		<ConfirmDialog ok={L('Good Bye')} title={L('Info')} // cancel={false}
			open={true}
			onOk={() => {
				that.confirmLogout = undefined;
				that.props.onLogout();
			}}
			msg={L('Logging out?')} />

		this.setState({});
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
		let that = this;

		let m = this.state.sysMenu;
		let expandItem = this.toExpandItem;
		let mtree = buildMenu(m, classes);
		return mtree;

		function buildMenu(menu) {
			if (Array.isArray(menu)) {
				return menu.map( (i, x) => {
						return buildMenu(i);
					} );
			}
			else {
				let open = that.state.expandings.has(menu.funcId);
				if ( menu.children && menu.children.length > 0 )
				  return (
				  <div key={menu.funcId}>
					<ListItem button onClick={expandItem} iid={menu.funcId}>
						<ListItemIcon>{icon(menu.css)}</ListItemIcon>
						<ListItemText primary={menu.funcName} />
						{ open ? icon('expand') : icon('collapse') }
					</ListItem>
					<Collapse in={open} timeout="auto" unmountOnExit>
						<List component="div" disablePadding>
							{buildMenu(menu.children)}
						</List>
					</Collapse>
				  </div>);
				else
				  return (menu && menu.funcId ?
					<div key={menu.funcId}>
						<Link component={RouterLink} to={menu.url}>
							<ListItem button className={classes.nested} onClick={
								e => {
									if (that.state.welcome)
										that.setState( {welcome: false} );
								} } >
							<ListItemIcon>{icon(menu.css)}</ListItemIcon>
							<ListItemText primary={menu.funcName} />
							</ListItem>
						</Link>
					</div> : '');
			}
		}

		function icon(icon) {
			// shall we use theme here?
			return _icons[icon || 'deflt'];
		}
	}

	route() {
		return this.state.cruds
			.map( (c, x) =>
				(<Route exact path={c.path} key={x} component={_comps[c.path]} {...c.params}/>)
			);
	}

	render() {
    	const { classes } = this.props;
		let claz = Object.assign({}, classes);

		let open = this.state.showMenu;

		return (
		  <div className={claz.root}>
			<AppBar
				position="fixed"
				className={clsx(claz.appBar, {
					[claz.appBarShift]: open,
				})}
			>
			<Toolbar>
				<Grid container spacing={1} >
				<Grid item sm={5}>
				<Box flexWrap="nowrap" display="flex" >
					<IconButton
						color="inherit"
						aria-label="open drawer"
						onClick={this.showMenu}
						edge="start"
						autoFocus
						className={clsx(claz.menuButton, open && claz.hide)}
					>
					<Menu />
					</IconButton>
					<Typography variant="h5" noWrap >{this.state.sysName}</Typography>
				</Box>
				</Grid>

				<Grid item sm={7}>
					<DialogActions className={claz.loginfo} >
						<MyIcon onClick={() => this.setState({ showMine: true })} />
						<Button onClick={this.toLogout}  color='inherit' >
							{L('Logout')}
						</Button>
					</DialogActions>
				</Grid>
				</Grid>
			</Toolbar>
			</AppBar>
			<Router>
			  <React.Fragment><Drawer
					className={claz.drawer}
					variant="persistent"
					anchor="left"
					open={open}
					classes={{paper: claz.drawerPaper}}
				>
				<div className={claz.drawerHeader}>
					<IconButton onClick={this.hideMenu}>
						<ListItemText>{this.state.menuTitle}</ListItemText>
						{claz.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
					</IconButton>
				</div>
				<Divider />
				<List>
					{this.menuItems(claz)}
				</List>
			  </Drawer></React.Fragment>
			  <main onClick={this.hideMenu}
				className={clsx(claz.content, {
					[claz.contentShift]: open,
				})}
			  >
				<div className={claz.drawerHeader} />
				{this.state.welcome ?
					<Card >
						<Typography gutterBottom variant='h4'>Welcome!</Typography>
						<Paper elevation={4} style={{ margin: 24 }} className={classes.welcome}>
							<Menu color='primary'/>
							<Box component='span' display='inline'>Please click menu to start.</Box>
						</Paper>
						<Paper elevation={4} style={{ margin: 24 }} className={classes.welcome}>
							<School color='primary'/>
							<Box component='span' display='inline'>External Link:
								<Link style={{ marginLeft: 4 }}  href="https://odys-z.github.io/Anclient" >AnReact Docs</Link>
							</Box>
						</Paper>
					</Card> :
					<div className="content">
					{this.route()}
				</div>}
			  </main>
			</Router>

			{this.state.showMine && <MyInfo
				panels={this.props.myInfo}
				onClose={() => this.setState({ showMine: false })} />}
			{this.confirmLogout}
		  </div>);
	}
}
SysComp.contextType = AnContext;

SysComp.extendLinks([
	{path: '/home', comp: Home},
	{path: '/views/sys/domain/domain.html', comp: Domain},
	{path: '/views/sys/role/roles.html', comp: Roles},
	{path: '/views/sys/org/orgs.html', comp: Orgs},
	{path: '/views/sys/org/users.html', comp: Users},
	{path: '/views/sys/workflow/workflows.html', comp: CheapFlow},
	{path: '/views/sys/user/users-1.1.html', comp: Users},
	{path: '/sys/error', comp: Error}
]);

const Sys = withStyles(styles)(SysComp);
export { Sys, SysComp };