import React, { ReactNode } from 'react';
import withStyles from "@material-ui/core/styles/withStyles";
import withWidth from '@material-ui/core/withWidth';
import { Theme } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Box from '@material-ui/core/Box';

import { L } from '../../utils/langstr';
import { AnContext } from '../reactext';
import { invalidStyles, ClassNames } from '../anreact';
import { Comprops, CrudCompW } from '../crud';

const styles = (theme: Theme) => (Object.assign(
	invalidStyles, {
    root: {
        flexGrow: 1,
        backgroundColor: theme.palette.background.paper,
    },
    tab: {
        '& :hover': { backgroundColor: '#55f' }
    }}
));

interface TabPanelProps extends Comprops {
    /** Panel id */
    pid: number;
    /** Current panel index (private member set by parent) */
    px : number;
};

class TabPanelComp extends CrudCompW<TabPanelProps> {
	state = {}
    title: string;
    panel: ReactNode;

	constructor (props: TabPanelProps) {
		super(props);
	}

	render () {
	  return (
		<div hidden={this.props.pid !== this.props.px}
			key={`p-${this.props.pid}`}
			{...this.props.args}
		>
			<Box p={3}>
			  {this.props.children}
			</Box>
		</div>
	  );
	}
}
const TabPanel = withStyles<any, any, TabPanelProps>(styles)(withWidth()(TabPanelComp));

interface TabsProps extends Comprops {
    panels: Array<TabPanelComp>;
}

class TabsComp extends CrudCompW<TabsProps> {
	state = {
		px: 0, // panel index
		panels: [<div>Panels[0]</div>, <div>Panels[1]</div>, <div>Panels[2]</div>]
	};

    dynatabs: { label: string; }[];

	constructor (props: TabPanelProps) {
		super(props);
		this.dynatabs = [
			{label: L('Basic')},
			{label: L('Contact')},
			{label: L('Security')},
		]

		this.handleChange = this.handleChange.bind(this);
	}

	handleChange (e: React.ChangeEvent<any>, v: number) {
		e.stopPropagation();
		this.setState({ px: v });
	};

	render() {
		const {classes} = this.props;
		let that = this;
		if (this.props.panels) {
			return (
			<div className={classes?.root}>
			  <AppBar position="static">
				<Tabs value={this.state.px}
					  onChange={this.handleChange} >
					{this.props.panels.filter(p => !!p.title).map( (p, x) => {
				 		return (<Tab key={x} value={x} label={p.title} className={classes?.tab} />);
					})}
				</Tabs>
			  </AppBar>
			  {this.props.panels.filter(p => !!p.title).map( (p, x) => {
					return (<TabPanel key={x} px={this.state.px} pid={x} children={p.panel} />);
			  } ) }
			</div> );
		}
		else return demo(classes);

		function demo(classes: ClassNames | undefined) {
			return ( <div className={classes?.root}>
			  <AppBar position="static">
				<Tabs value={that.state.px}
					  onChange={that.handleChange} >
				  <Tab value={0} label={L('panels[0].title')} className={classes?.tab} />
				  <Tab value={1} label={L('panels[1].title')} className={classes?.tab} />
				  <Tab value={2} label={L('panels[2].title')} className={classes?.tab} />
				</Tabs>
			  </AppBar>
				<TabPanel px={that.state.px} pid={0} key={0} children={that.state.panels[0]} />
				<TabPanel px={that.state.px} pid={1} key={1} children={that.state.panels[1]} />
				<TabPanel px={that.state.px} pid={2} key={2} children={that.state.panels[2]} />
			</div> );
		}
	}
}
TabsComp.contextType = AnContext;

const AnTabs = withStyles<any, any, TabsProps>(styles)(withWidth()(TabsComp));
export {AnTabs, TabsComp, TabsProps, TabPanelComp as TabPanel, TabPanelProps};
