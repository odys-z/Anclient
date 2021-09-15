
import React from 'react';
import { withStyles } from "@material-ui/core/styles";
import withWidth from "@material-ui/core/withWidth";
import { Card, TextField, Typography } from '@material-ui/core';

import { AnClient, SessionClient, Protocol, stree_t } from '@anclient/semantier';
import { L, Langstrs,
    AnContext, AnError, CrudCompW, AnReactExt,
    AnTree
} from 'anclient';

const styles = (theme) => ( {
	root: {
	}
} );

class MyClassTreeComp extends CrudCompW {
	state = {
		forest: []
	};

	constructor(props) {
		super(props);
	}

	componentDidMount() {
		console.log(this.props.uri)

		let that = this;
		let sk = 'north.my-class';
		let t = stree_t.sqltree; // loading dataset reshaped to tree
		let ds = {  uri: 'override by sk', sk, t,
					sqlArgs: [this.context.anClient.userInfo.uid],
					// onOk: resp => {that.setState({}); console.log(resp)}
				  };
		this.context.anReact.stree(ds, this.context.error, this);
	}

	render () {
		return (
		<div>
			<Typography>My Classes</Typography>
			<AnTree checkbox forest={this.state.forest}>
			</AnTree>
		</div>);
	}
}
MyClassTreeComp.contextType = AnContext;

const MyClassTree = withWidth()(withStyles(styles)(MyClassTreeComp));
export { MyClassTree, MyClassTreeComp }
