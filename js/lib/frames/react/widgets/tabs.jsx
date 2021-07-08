import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';

const styles = (theme) => {
  root: {
	flexGrow: 1,
	backgroundColor: theme.palette.background.paper,
  },
  tab: {
	'& :hover': {
	  backgroundColor: '#55f'
	}
  },
};

class TabPanel() extends React.Component {
	constructor (props) {
		let { children, px, pid, ...args } = props;

		this.setState( {
			children,
			px,
			pid,
			params: args } );
	}

	render () {
	  return (
		<div hidden={this.pid !== this.px}
			id={`p-${this.state.pid}`}
			{...this.state.params}
		>
			{this.state.px === this.state.pid && (
			<Box p={3}>
			  <Typography>{children}</Typography>
			</Box>
			)}
		</div>
	  );
	}
}

export class TabsComp extends React.Component {
	state = {
		ix: 0;
		index: -1;
	};

	constructor (props = {}) {
		super(props);
	}

	handleChange (e, v) => {
		e.stopPropagation();
		this.setState({ index: v });
	};

	labels() {
		return
		this.dynatabs.map( (e, x) => {
			<Tab value={'d-' + x} label={e.label} className={classes.tab} />
		});
	}

	panels() {
		return
		this.dynatabs.map( (e, x) => {
			<TabPanel px={this.state.index} pid={'d-' + x} >
				{e.label}
			<TabPanel>
		});
	}

	render() {
		const {classes} = this.props;
	  	return (
		<div className={classes.root}>
		  <AppBar position="static">
			<Tabs value={this.state.index}
				  onChange={handleChange} >
			  <Tab value="1"
				label="New Arrivals in the Longest Text of Nonfiction"
				className={classes.tab}
			  />
			  <Tab value="2" label="Item Two" className={classes.tab} />
			  <Tab value="3" label="Item Three" className={classes.tab} />
			  {labels}
			</Tabs>
		  </AppBar>
		  <TabPanel px={value} pid="1">
			Item One
		  </TabPanel>
		  <TabPanel px={value} pid="2" >
			Item Two222
		  </TabPanel>
		  <TabPanel px={value} pid="3">
			Item Three
		  </TabPanel>
		  {panels}
		</div>
		);
	}
}
TabsComp.contextType = AnContext;

const Tabs = withStyles(styles)(TabsComp);
export {Tabs, TabsComp};
