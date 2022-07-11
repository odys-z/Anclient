import React, { Context } from 'react';
import { Theme, withStyles } from "@material-ui/core/styles";
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
import Link from '@material-ui/core/Link';
import {
	Drafts, Inbox, Send, ExpandLess, ExpandMore, Sms, Menu, School, SettingsOutlined, BarChart,
	GroupAdd, MoreHoriz, Description, Ballot, ScreenShareOutlined, FolderSharedOutlined, HowToRegSharp
} from '@material-ui/icons';

import { AnContext, AnContextType } from './reactext';
import { ConfirmDialog } from './widgets/messagebox';
import { MyIcon } from './widgets/my-icon';
import { MyInfo } from './widgets/my-info';
import { L } from '../utils/langstr';

import {
	Home, ErrorPage, Domain, Roles, Orgs, Users, CheapFlow, Comprops, CrudComp, CrudCompW
} from './crud'
// import { ClassNameMap } from '@material-ui/styles';
import { AnReactExt, ClassNames } from './anreact';
import { AnDatasetResp, AnsonMsg } from '@anclient/semantier/protocol';

export interface SysProps extends Comprops {
	/** Dataset (stree) sk of system menu */
	menu: string;
    /**Welcome page formatter */
    welcome?: (
		/** @deprecated not used */
		classes: ClassNames | undefined,
		context: AnContextType, comp: SysComp) => JSX.Element;
    // classes: {[x: string]: string};
    hrefDoc?: string;
    onLogout: () => void;
    myInfo: JSX.Element | ((context: Context<AnContextType>) => JSX.Element | Array<{title: string, panel: JSX.Element}>);
}

const _icons = {
	'expand': <ExpandMore />,
	'collapse': <ExpandLess />,
	'menu-lv0': <Send />,
	'menu-lv1': <Drafts />,
	'menu-leaf': <Sms />,
	'deflt': <Inbox />,

	'sys': <Ballot />,
	'settings': <SettingsOutlined />,
	'users': <GroupAdd />,
	'children': <School />,
	'paper': <Description />,
	'blank': <MoreHoriz />,
	'send': <ScreenShareOutlined />,
	'doc': <FolderSharedOutlined />,
	'chart': <BarChart />,
	'mystudent': <HowToRegSharp />,
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

const styles = (theme: Theme) => ({
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
		textAlign: 'end' as const,
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
	sysName: {
		lineHeight: 2.2
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
	welcomeHead: {
		padding: theme.spacing(1)
	},
	cardText: {
		fontSize: 18,
	}
});

export interface MenuItem {
	/** additonal proterties directly passed on to CRUD page component */
	props: object;

	funcId: string;
	id: string;
	funcName: string;
	url: string;
	css: React.CSSProperties & {icon: string};
	flags: string;
	parentId: string;
	sort: number;
	sibling: number;
	children: undefined | MenuItem[]
}

/**
 * Parse lagacy json format.
 * @return {menu, paths}
 * */
export function parseMenus(json = []): {
	menu: Array<MenuItem>;
	paths: Array<any>}
{
	let paths = []; // {'/home': Home}
	let menu = parse(json);
	return { menu, paths };

	function parse(json) {
		if (Array.isArray(json))
			return json.map( (jn) => { return parse(jn); } );
		else {
			// this is just a lagacy of EasyUI, will be deprecated
			let {funcId, id, funcName, text, url, css, flags, parentId, sort, sibling, children}
				= json.node;

			if (typeof css === 'string')
				try { css = eval('(' + css + ')'); } catch {}

			sibling = sibling || sort;
			funcId = funcId || id;
			funcName = funcName || text;

			if (! url.startsWith('/')) url = '/' + url;
			paths.push({path: url, params: {flags, css}})

			if (children)
				children = parse(children);

			return {funcId, funcName, url, css, flags, parentId, sibling, children};
		}
	}
}

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
class SysComp extends CrudCompW<SysProps> {
	state = {
		window: undefined,
		welcome: true,
		sysName: 'Anreact Sample',
		skMenu: undefined, // e.g. 'sys.menu.jserv-sample';
		// {funcId, funcName,url, css: {icon}, fullpath, parentId, sibling, children: [] }
		sysMenu: [ ] as MenuItem[],

		cruds: [{path: '/', params: undefined, comp: Home}],
		paths: [],

		menuTitle: 'Sys Menu',
		showMenu: false,
		expandings: new Set(),
		showMine: false,
		currentPage: undefined as MenuItem
	};

	anreact: AnReactExt;

	confirmLogout: any;

	static extendLinks(links) {
		links.forEach( (l: { path: string ; comp: CrudComp<Comprops>; }, _x: number) => {
			_comps[l.path] = l.comp; // uri(l.comp, l.path);
		});
	}

	constructor(props: SysProps) {
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

		this.welcomePaper = this.welcomePaper.bind(this);
	}

	welcomePaper(classes = {} as ClassNames) {
		if (typeof this.props.welcome !== 'function') {
			return (
			  <Card >
				<Typography gutterBottom variant='h4'
							className={classes.welcomeHead}
				> Welcome! </Typography>
				<Paper elevation={4} style={{ margin: 24 }}
						className={classes.welcome}>
					<IconButton onClick={this.showMenu} >
						<Menu color='primary'/>
						<Box component='span' display='inline' className={classes.cardText} >
							Please click menu to start.
						</Box>
					</IconButton>
				</Paper>
				<Paper elevation={4} style={{ margin: 24 }} className={classes.welcome}>
					<School color='primary'/>
					<Box component='span' display='inline'>Documents:
						<Link style={{ marginLeft: 4 }} target='_blank'
							href={this.props.hrefDoc || "https://odys-z.github.io/Anclient"} >
							{`${this.state.sysName}`}</Link>
					</Box>
				</Paper>
			  </Card>);
		}
		else {
			return this.props.welcome(classes, this.context as AnContextType, this);
		}
	}

	componentDidMount() {
		const ctx = this.context as unknown as AnContextType;

		// load menu
		this.anreact = ctx.uiHelper;

		let that = this;
		this.anreact.loadMenu(
			this.state.skMenu,
			this.uri,
			(dsResp) => {
				let {menu, paths} = parseMenus((dsResp as AnsonMsg<AnDatasetResp>).Body().forest);
				that.state.sysMenu = menu;
				that.state.cruds = paths;
			} );
	}

	showMenu(e: React.MouseEvent<HTMLElement>) {
		if (e) e.stopPropagation();
		this.setState({ showMenu: true });
	}

	hideMenu() {
		this.setState({ showMenu: false });
	}

	toLogout() {
		let that = this;
		this.confirmLogout =
		<ConfirmDialog ok={L('Good Bye')} title={L('Info')} // cancel={false}
			onOk={() => {
				that.confirmLogout = undefined;
				that.props.onLogout();
			} }
			onCancel={ () => {
				that.confirmLogout = undefined;
				that.setState({});
			} }
			msg={L('Logging out?')} />

		this.setState({});
	}

	toExpandItem(e: React.MouseEvent<HTMLElement>) {
		e.stopPropagation();
		let f = e.currentTarget.getAttribute('data-iid');

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
	menuItems(classes: ClassNames) {
		let that = this;

		let m = this.state.sysMenu;
		let expandItem = this.toExpandItem;
		let mtree = buildMenu(-1, m);
		return mtree;

		function buildMenu( depth: number, menu : MenuItem | MenuItem[] ) {
			if (Array.isArray(menu)) {
				return menu.map( (i, x) => {
						return buildMenu( depth + 1, i );
					} );
			}
			else {
				let open = that.state.expandings.has(menu.funcId);
				if ( menu.children && menu.children.length > 0 )
				  return (
				  <div key={menu.funcId}>
					<ListItem button onClick={expandItem} data-iid={menu.funcId}>
						<ListItemIcon key={menu.funcId}>{icon(depth, menu.css?.icon)}</ListItemIcon>
						<ListItemText primary={L(menu.funcName)} />
						{ open ? icon(0, 'expand') : icon(0, 'collapse') }
					</ListItem>
					<Collapse in={open} timeout="auto" unmountOnExit>
						<List component="div" disablePadding>
							{buildMenu(depth, menu.children)}
						</List>
					</Collapse>
				  </div>);
				else
				  return (menu && menu.funcId ?
					<div key={menu.funcId} >
						<ListItem button className={classes.nested} onClick={
							e => {
								if (that.state.welcome)
									that.setState( {welcome: false} );

								if (that.state.currentPage?.url !== menu.url)
									that.setState( {currentPage: menu} );
							} } >
						<ListItemIcon>{icon(depth, menu.css?.icon)}</ListItemIcon>
						<ListItemText primary={L(menu.funcName)} />
						</ListItem>
					</div> : '');
			}
		}

		function icon(levelIndent: number, icon: string) {
			// return _icons[icon] || _icons['deflt'];
			let indent = []
			for (let i = 0; i < levelIndent; i++)
				indent.push( <div key={i}>{_icons.blank}</div> );
			indent.push( <div key={indent.length}>{_icons[icon] || _icons.deflt}</div> );

			return indent;
		}
	}

	route() {
		const TagName = _comps[this.state.currentPage?.url || '/home'];
		if (TagName)
		  return (
			<TagName
				uri={this.state.currentPage?.url || '/'}
				{...this.state.currentPage.props}
				ssInf={(this.context as AnContextType).anClient?.ssInf} /> );
		else return <Home />;
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
					<Typography variant="h5" className={claz.sysName} noWrap >{L(this.state.sysName)}</Typography>
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
			<Drawer className={claz.drawer}
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
			</Drawer>

			<main onClick={this.hideMenu}
				className={clsx(claz.content, {
					[claz.contentShift]: open,
				})}
			>
				<div className={claz.drawerHeader} />
				{this.state.welcome ?
					this.welcomePaper(classes) :
					<div className="content">
						{this.route()}
					</div>}
			</main>

			{this.state.showMine && <MyInfo
				panels={typeof this.props.myInfo === 'function'
					? this.props.myInfo(this.context as Context<AnContextType>) : this.props.myInfo}
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
	{path: '/v2/users-v2.0', comp: Users},
	{path: '/sys/error', comp: ErrorPage}
]);

const Sys = withStyles<any, any, SysProps>(styles)(SysComp);
export { Sys, SysComp };
