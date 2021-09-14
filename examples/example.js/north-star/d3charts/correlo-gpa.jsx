
import React from 'react';
import { withStyles } from "@material-ui/core/styles";
import PropTypes from 'prop-types';

import * as d3 from 'd3';

import {
	L, Langstrs,
    AnClient, SessionClient, Protocol,
    AnContext, AnError, CrudComp, AnReactExt
} from 'anclient';

const styles = (theme) => ( { } );

// group,variable,value
// [event, kid, emotion, GPA]
const tempHeats = [
['v1', 'Alice', 30, 5], ['v2', 'Alice', 95, 5], ['v3', 'Alice', 22, 4], ['v7', 'Alice', 88, 4], ['v9', 'Alice', 99, 4], ['v10', 'Alice', 66, 3],
['v1', 'Bob', 87, 5], ['v5', 'Bob', 84, 5], ['v6', 'Bob', 91, 3], ['v7', 'Bob', 82, 4],
['v1', 'Coral', 16], ['v2', 'Coral', 97, 1], ['v3', 'Coral', 98, 1.5],
['v1', 'Doracy', 35], ['v9', 'Doracy', 35],
['v2', 'Emilly', 80],
['v3', 'Franchies', 8], ['v8', 'Franchies', 46], ['v9', 'Franchies', 46],
['v8', 'George', 54], ['v9', 'George', 38, 5], ['v10', 'George', 93],
['v1', 'Helen', 39], ['v2', 'Helen', 26, 1],
['v9', 'Ithen', 57], ['v10', 'Ithen', 32, 2], ['v4', 'Ithen', 20, 5],
['v1', 'James', 19], ['v2', 'James', 85, 1], ['v3', 'James', 53, 4],
];

class CorreloGPAComp extends React.Component {
	state = {
		d3: '',
	}

	constructor(props) {
		super(props);
	}

	componentDidMount() {
		console.log(this.props.uri);
		this.initTest(tempHeats);

		// this.tier.load(this.props.uri, {}, this.initTest);
	}

	// https://www.d3-graph-gallery.com/graph/heatmap_basic.html
	initTest(data) {
		// set the dimensions and margins of the graph

		let margin = Object.assign({top: 10, right: 30, bottom: 30, left: 40}, this.props.margin);
		let width = this.props.size.width - margin.left - margin.right;
		let height = this.props.size.height - margin.top - margin.bottom;
		const [maxv, maxg] = d3.max(data, d => [d[2], d[3] || 3]);

		// append the svg object to the body of the page
		const svg = d3.select("#heat")
		.append("svg")
		  .attr("width", width + margin.left + margin.right)
		  .attr("height", height + margin.top + margin.bottom)
		.append("g")
		  .attr("transform", `translate(${margin.left},${margin.top})`);

		// Labels of row and columns
		const myGroups = ["v1", "v2", "v3", "v4", "v5", "v6", "v7", "v8", "v9", "v10"];
		const myVars = ["Alice", "Bob", "Coral", "Doracy", "Emilly", "Franchies", "George", "Helen", "Ithen", "James"];

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
		  .padding(0.0);
		svg.append("g")
		  .call(d3.axisLeft(y)
			.tickSize(-width, 0)
		);

		svg.selectAll(".tick line")
			.attr("fill", "#4047")
			.attr("stroke-width", "1px")
			.attr("opacity", "0.2")
			;

		// Build color scale
		const myColor = d3.scaleLinear()
		  .range(["red", "#69b3a2"])
		  .domain([1, maxv])

		const myBgColor = d3.scaleLinear()
		  .range(["#770000aa", "#69b3a233"])
		  .domain([0, maxv])

		const tooltip = d3.select("#heat")
			.append("div")
			.style("opacity", 0.)
			.attr("class", "tooltip")
			.style("position", "relative")
			.style("background-color", "white")
			.style("border", "solid grey")
			.style("border-width", "1px")
			.style("border-radius", "5px")
			.style("padding", "12px")
			.style("width", "max-content");

		let mouseover = function(d) {
			tooltip.style("opacity", 1)
				.attr("z-index", 999)
			  .style("top", y(d[1]) - height - margin.top + "px")
		}
		let mousemove = function(event, d) {
			let bg = myBgColor( d[2] );
			tooltip
			  .html(`<h4>${d[1]}/${d[0]}</h4>briefing:<br>Emotion Index: ${d[2]}<br>GPA: ${d[3]}`)
			  .style("left", x(d[0]) + "px")
			  .style("top", y(d[1]) - height - margin.top + "px")
			  .style("background-color", bg);
		}
		let mouseleave = function(d) {
			tooltip
				.attr("z-index", -999)
				.style("opacity", 0.0)
				.style("top", - height - margin.top )
		}

		svg.selectAll()
		.data(data, function(d) { return d[0] + ':' + d[1]; })
		.enter()
		.append("circle")
			.attr("cx", function(d) {
				console.log(d, d[0], x(d[0]));
				return x(d[0]) + x.bandwidth() * 0.5; })
			.attr("cy", function(d) { return y(d[1]) + y.bandwidth() * 0.5 })
			.attr("r", (d) => x.bandwidth() * 0.35 * (+d[3] || 3) / maxg )
			.style("fill", function(d) { return myColor(d[2])} )
		.on("mouseover", mouseover)
		.on("mousemove", mousemove)
		.on("mouseleave", mouseleave)
		.on("click", (e, d) => console.log(e, d))
	}

	render() {
		return <div id='heat' />;
	}
}
CorreloGPAComp.contextType = AnContext;

CorreloGPAComp.propTypes = {
	uri: PropTypes.string.isRequired,
	stateHook: PropTypes.object,
	size: PropTypes.object.isRequired,
	margin: PropTypes.object
}

const CorreloGPA = withStyles(styles)(CorreloGPAComp);
export { CorreloGPA, CorreloGPAComp }
