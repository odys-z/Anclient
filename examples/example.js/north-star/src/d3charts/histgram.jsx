import React from 'react';
import d3 from 'd3';
import rd3 from 'react-d3-library';
const RD3Component = rd3.Component;

class Histgram extends React.component {
	state = {
		d3: ''
	}

	componentDidMount: function() {
		node =
		this.setState({d3: node});
	},

	render () {
	  return ( <RD3Component data={this.state.d3} /> );
	}
}
