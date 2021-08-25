import React from 'react';
import { withStyles } from "@material-ui/core/styles";
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';

import {L} from '../../utils/langstr';
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
			<Box p={3}>
			  {this.props.children}
			</Box>
		</div>
	  );
	}
}

class TabsComp extends React.Component {
	state = {
		px: 0, // panel index
		panels: [<div>Panels[0]</div>, <div>Panels[1]</div>, <div>Panels[2]</div>]
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
		let that = this;
		if (this.props.panels) {
			return (
			<div className={classes.root}>
			  <AppBar position="static">
				<Tabs value={this.state.px}
					  onChange={this.handleChange} >
						{this.props.panels.filter(p => !!p.title).map( (p, x) => {
				  			return (<Tab key={x} value={x} label={p.title} className={classes.tab} />);
						})}
				</Tabs>
			  </AppBar>
				{this.props.panels.filter(p => !!p.title).map( (p, x) => {
					return (<TabPanel key={x} px={this.state.px} pid={x} children={p.panel} />);
				} ) }
			</div> );
		}
		else return demo(classes);

		function demo(classes) {
			return ( <div className={classes.root}>
			  <AppBar position="static">
				<Tabs value={that.state.px}
					  onChange={that.handleChange} >
				  <Tab value={0} label={L('panels[0].title')} className={classes.tab} />
				  <Tab value={1} label={L('panels[1].title')} className={classes.tab} />
				  <Tab value={2} label={L('panels[2].title')} className={classes.tab} />
				</Tabs>
			  </AppBar>
				<TabPanel px={that.state.px} pid={0} children={that.state.panels[0]} />
				<TabPanel px={that.state.px} pid={1} children={that.state.panels[1]} />
				<TabPanel px={that.state.px} pid={2} children={that.state.panels[2]} />
			</div> );
		}
	}
}
TabsComp.contextType = AnContext;

const AnTabs = withStyles(styles)(TabsComp);
export {AnTabs, TabsComp};
