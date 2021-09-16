
import React from 'react';
import { withStyles } from "@material-ui/core/styles";
import PropTypes from 'prop-types';

import * as d3 from 'd3';

import {
	L, Langstrs,
    AnClient, SessionClient, Protocol,
    AnContext, AnError, CrudComp, AnReactExt
} from '@anclient/anreact';

const styles = (theme) => ( { } );

// group,variable,value
const tempHeats = [
['A', 'v1', 30], ['A', 'v2', 95], ['A', 'v3', 22], ['A', 'v7', 88], ['A', 'v9', 99], ['A', 'v10', 66],
['B', 'v1', 87], ['B', 'v5', 84], ['B', 'v6', 91], ['B', 'v7', 82],
['C', 'v1', 16], ['C', 'v2', 97], ['C', 'v3', 98], ['D', 'v1', 35],
['E', 'v2', 80],
['F', 'v3', 8], ['F', 'v8', 46], ['F', 'v9', 46],
['G', 'v8', 54], ['G', 'v9', 38], ['G', 'v10', 93],
['H', 'v1', 39], ['H', 'v2', 26],
['I', 'v9', 57], ['I', 'v10', 32], ['I', 'v4', 20],
['J', 'v1', 19], ['J', 'v2', 85], ['J', 'v3', 53],
];

class HeatgridComp extends React.Component {
	state = {
		d3: '',
	}

	constructor(props) {
		super(props);
	}

	componentDidMount() {
		console.log(this.props.uri);
		this.initTest(tempHeats);
	}

	// https://www.d3-graph-gallery.com/graph/heatmap_basic.html
	initTest(data) {
		// set the dimensions and margins of the graph

		let margin = Object.assign({top: 10, right: 30, bottom: 30, left: 40}, this.props.margin);
		let width = this.props.size.width - margin.left - margin.right;
		let height = this.props.size.height - margin.top - margin.bottom;

		// append the svg object to the body of the page
		const svg = d3.select("#heat")
		.append("svg")
		  .attr("width", width + margin.left + margin.right)
		  .attr("height", height + margin.top + margin.bottom)
		.append("g")
		  .attr("transform", `translate(${margin.left},${margin.top})`);

		// Labels of row and columns
		const myGroups = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"]
		const myVars = ["v1", "v2", "v3", "v4", "v5", "v6", "v7", "v8", "v9", "v10"]

		// Build X scales and axis:
		const x = d3.scaleBand()
		  .range([ 0, width ])
		  .domain(myGroups)
		  .padding(0.11);
		svg.append("g")
		  .attr("transform", `translate(0, ${height})`)
		  .call(d3.axisBottom(x))

		// Build X scales and axis:
		const y = d3.scaleBand()
		  .range([ height, 0 ])
		  .domain(myVars)
		  .padding(0.1);
		svg.append("g")
		  .call(d3.axisLeft(y));

		// Build color scale
		const myColor = d3.scaleLinear()
		  .range(["red", "#69b3a2"])
		  .domain([1,100])

		svg.selectAll()
		  .data(data, function(d) {return d[0]+':'+d[1];})
		  .join("rect")
		  .attr("x", function(d) { return x(d[0]) })
		  .attr("y", function(d) { return y(d[1]) })
		  .attr("width", x.bandwidth() )
		  .attr("height", y.bandwidth() )
		  .attr("rx", 0.12 * x.bandwidth() )
		  .style("fill", function(d) { return myColor(d[2])} )

		svg.append("text")
			.attr("fill", "#f00d") //set the fill here
			.attr("font-size", "1.6em")
			.attr("transform", 'translate(60, 360) rotate(-45)')
			.text(L('Fake data, events calendar should look like this'));
	}

	render() {
		return <div id='heat' />;
	}
}
HeatgridComp.contextType = AnContext;

HeatgridComp.propTypes = {
	uri: PropTypes.string.isRequired,
	stateHook: PropTypes.object,
	size: PropTypes.object.isRequired,
	margin: PropTypes.object
}

const Heatgrid = withStyles(styles)(HeatgridComp);
export { Heatgrid, HeatgridComp }
