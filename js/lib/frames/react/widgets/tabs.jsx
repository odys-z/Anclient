import React from 'react';
import { withStyles } from "@material-ui/core/styles";
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';

import {L} from '../utils/langstr';
	import {AnContext} from '../reactext.jsx';

const styles = (theme) => ({
  root: {
	flexGrow: 1,
	backgroundColor: theme.palette.background.paper,
  },
  tab: {
	'& :hover': {
	  backgroundColor: '#55f'
	}
  },
});

class TabPanel extends React.Component {
	state = {}

	constructor (props) {
		super(props);
	}

	render () {
	  return (
		<div hidden={this.props.pid !== this.props.px}
			id={`p-${this.props.pid}`}
			{...this.props.args}
		>
			{this.props.px === this.props.pid && (
			<Box p={3}>
			  <Typography>{this.props.children}</Typography>
			</Box>
			)}
		</div>
	  );
	}
}

class TabsComp extends React.Component {
	state = {
		px: 0, // panel index
	};

	constructor (props = {}) {
		super(props);
		this.dynatabs = [
			{label: L('Basic')},
			{label: L('Contact'), },
			{label: L('Security')},
		]

		this.handleChange = this.handleChange.bind(this);
	}

	handleChange (e, v) {
		e.stopPropagation();
		this.setState({ px: v });
	};

	render() {
		const {classes} = this.props;
	  	return (
		<div className={classes.root}>
		  <AppBar position="static">
			<Tabs value={this.state.px}
				  onChange={this.handleChange} >
			  <Tab value={0} label={L('Basic')} className={classes.tab} />
			  <Tab value={1} label={L('System')} className={classes.tab} />
			  <Tab value={2} label={L('Private')}  className={classes.tab} />
			</Tabs>
		  </AppBar>
		  <TabPanel px={this.state.px} pid={0} children={''} >
			Item One
		  </TabPanel>
		  <TabPanel px={this.state.px} pid={1} children={''} >
			Item Two222
		  </TabPanel>
		  <TabPanel px={this.state.px} pid={2} children={''} >
			Item Three
		  </TabPanel>
		</div>
		);
	}
}
TabsComp.contextType = AnContext;

const AnTabs = withStyles(styles)(TabsComp);
export {AnTabs, TabsComp};
