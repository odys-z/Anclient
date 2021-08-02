import React from 'react';
import d3 from 'd3';
import rd3 from 'react-d3-library';
const RD3Component = rd3.Component;

class Histgram extends React.component {
	state = {
		d3: '',
	}

	constructor(props) {
		super(props);

		// in case testing
		if (document) {
			let data = [ 5.1, 1, 4.9, 2, 8.6, 3, 6.2, 4, 5.1, 5, 7.1];
			let bins = d3.bin().thresholds(40)(data);

			let node = document.createElement('div');
			this.state.d3 = node;
			this.state.svg = d3
					.select(node)
					.append(svg)
						.attr("width", 100)
						.attr("height", 100);
			svg.append('g')
					.attr("fill", "#eef")
				.selectAll("rect")
				.data(bins)
				.join("rect")
					.attr("x", d => x(d.x0) + 1)
					.attr("width", d => Math.max(0, x(d.x1) - x(d.x0) - 1))
					.attr("y", d => y(d.length))
					.attr("height", d => y(0) - y(d.length));;
		}
	}

	componentDidMount: function() {
		// this.setState({d3: node});
	},

	render () {
	  return (
		<div>
			<RD3Component data={this.state.d3} />
		</div>);
	}
}
