import React from 'react';
import { Sys } from '../../lib/frames/react/sys.jsx'

class App extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		return (<SysComp />);
	}
}

export {App}
