import React from 'react';
import { withStyles } from "@material-ui/core/styles";
import PropTypes from 'prop-types';

import * as d3 from 'd3';

import {
    an, AnClient, SessionClient, Protocol, L, Langstrs,
    AnContext, AnError, CrudComp, AnReactExt
} from 'anclient';

const styles = (theme) => ( {
	root: {
	}
} );

class HistgramComp extends React.Component {
	state = {
		d3: '',
	}

	constructor(props) {
		super(props);

		this.initTest = this.initTest.bind(this);
	}

	initTest() {
		// in case testing
		if (document) {
			let data = [{ "price": "75.0" }, { "price": "104.0" }, { "price": "369.0" }, { "price": "300.0" },
    					{ "price": "92.0" }, { "price": "64.0" }, { "price": "265.0" }, { "price": "35.0" },
    					{ "price": "287.0" }, { "price": "69.0" }, { "price": "52.0" }, { "price": "23.0" },
    					{ "price": "287.0" }, { "price": "87.0" }, { "price": "114.0" }, { "price": "114.0" },
    					{ "price": "98.0" }, { "price": "137.0" }, { "price": "87.0" }, { "price": "90.0" },
    					{ "price": "63.0" }, { "price": "69.0" }, { "price": "80.0" }, { "price": "113.0" },
					    { "price": "58.0" }, { "price": "115.0" }, { "price": "30.0" }, { "price": "35.0" },
					    { "price": "92.0" }, { "price": "460.0" }, { "price": "74.0" }, { "price": "72.0" },
					    { "price": "63.0" }];

			let margin = {top: 10, right: 30, bottom: 30, left: 40},
				width = 460 - margin.left - margin.right,
				height = 400 - margin.top - margin.bottom;

			let x = d3
				.scaleLinear()
				// .domain([0, 1000])
				// can use this instead of 1000 to have the max of data: d3.max(data, function(d) { return +d.price })
				.domain([0, d3.max(data, function(d) { return +d.price; })])
				.range([0, width]);
			let y = d3.scaleLinear()
				.range([height, 0]);
			let histogram = d3
				.histogram()
				.value(function(d) { return d.price; })   // I need to give the vector of value
				.domain(x.domain())  // then the domain of the graphic
				.thresholds(x.ticks(8)); // then the numbers of bins
			let bins = histogram(data);
			console.log('bins', bins);
			y.domain([0, d3.max(bins, function(d) { return d.length; })]);

			let svg = d3
				.select('#node')
				.append("svg")
				  .attr("width", width + margin.left + margin.right)
				  .attr("height", height + margin.top + margin.bottom)
				.append("g")
				  .attr("transform", `translate(${margin.left}, ${margin.top})`);

			this.state.d3 = node;

			svg.append('g')
				  .attr("transform", `translate(0, ${height})`)
				.call(d3.axisBottom(x));

			svg.append("g")
				.transition()
				.duration(1000)
				.call(d3.axisLeft(y));

			let u = svg.selectAll("rect")
				.data(bins)

			// Manage the existing bars and eventually the new ones:
			u.enter()
				.append("rect") // Add a new rect for each new elements
				.merge(u) // get the already existing elements as well
				.transition() // and apply changes to all of them
				.duration(1000)
				  .attr("x", 1)
				  .attr("transform", function(d) {
					  console.log(d);
					  return `translate(${x(d.x0)}, ${y(d.length)})`; })
				  .attr("width", function(d) {
					  return x(d.x1) - x(d.x0) -1 ; })
				  .attr("height", function(d) {
					  return height - y(d.length); })
				  .style("fill", "#69b3a2")

			u.exit()
				.remove()

			this.setState( {svg} );
		}
	}

	componentDidMount() {
		this.initTest();
	}

	render() {
	  let {classes} = this.props;
	  return (
		<div id='node'>
		</div>);
	}
}
HistgramComp.contextType = AnContext;

const Histgram = withStyles(styles)(HistgramComp);
export { Histgram, HistgramComp }
