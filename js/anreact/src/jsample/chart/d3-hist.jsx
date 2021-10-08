// import React from 'react';
// import { withStyles } from "@material-ui/core/styles";
//
// import d3 from 'd3';
// import rd3 from 'react-d3-library';
// const RD3Component = rd3.Component;
//
// import { Protocol, AnConst, Ansonresp } from '@anclient/semantier';
//
// import { L } from '../../../lib/utils/langstr';
// 	// import { Protocol } from '../../../semantier/protocol';
// 	// import { AnConst } from '../../../lib/utils/consts';
// 	// import { AnsonResp } from '../../../semantier/protocol';
// 	import { JsampleIcons } from '../styles';
// 	import { CrudComp } from '../../../lib/react/crud';
// 	import { AnContext, AnError } from '../../../lib/react/reactext';
// 	import { ConfirmDialog } from '../../../lib/react/widgets/messagebox'
//
// 	import { RoleDetails } from './role-details';
//
// const styles = (theme) => ( {
// 	root: {
// 		"& :hover": {
// 			backgroundColor: '#777'
// 		}
// 	},
// 	container: {
// 		display: 'flex',
// 		// width: '100%',
// 		'& > *': {
// 			margin: theme.spacing(0.5),
// 		}
// 	},
// 	buttons: {
// 		display: 'flex',
// 		justifyContent: "flex-end",
// 		'& > *': {
// 			margin: theme.spacing(0.5),
// 		}
// 	},
// 	button: {
// 		height: '2.4em',
// 		verticalAlign: 'middle',
// 		margin: theme.spacing(1),
// 	}
// } );
//
// class HistogramComp extends CrudComp {
//
// 	state = {
// 		csv: [],
// 		nBins: 20,
// 		div: undefined,
// 	}
//
// 	constructor(props) {
// 		super(props);
//
// 		this.state.div = document ? document.createElement('div');
//
// 		this.updateHist = this.updateHist.bind(this);
// 	}
//
// 	componentDidMount() {
// 		let that = this;
// 		d3.csv("https://raw.githubusercontent.com/holtzy/data_to_viz/master/Example_dataset/1_OneNum.csv",
// 			function(data) {
// 				that.state.csv = data.price;
// 				that.updateHist(data);
// 			});
// 	}
//
// 	updateHist(data) {
// 		loadOneNum(this.state.div, this.state.nBins);
// 	}
//
// 	toZoom(e) {
// 		e.stopPropagation();
// 		let nBins = ( this.state.nBins + 20 ) % 80;
// 		this.state.nBins = nBins;
// 		updateBins(nBins)
// 	}
//
// 	render() {
// 		return (
// 			<RD3Component onClick={this.toZoom} />
// 		);
// 	}
//
// }
//
// function loadOneNum(dom, nBins) {
// 	// let node = document.createElement('div');
// 	let svg = d3.select(dom)
// 		.append("svg")
// 		  .attr("width", width + margin.left + margin.right)
// 		  .attr("height", height + margin.top + margin.bottom)
// 		.append("g")
// 		  .attr("transform",
// 		      "translate(" + margin.left + "," + margin.top + ")");
// 	d3.csv("https://raw.githubusercontent.com/holtzy/data_to_viz/master/Example_dataset/1_OneNum.csv", updateBins);
//
// function(data) {
// 	  // X axis: scale and draw:
// 	  var x = d3.scaleLinear()
// 	      .domain([0, 1000])     // can use this instead of 1000 to have the max of data: d3.max(data, function(d) { return +d.price })
// 	      .range([0, width]);
// 	  svg.append("g")
// 	      .attr("transform", `translate(0, ${height})`)
// 	      .call(d3.axisBottom(x));
//
// 	  // Y axis: initialization
// 	  var y = d3.scaleLinear()
// 	      .range([height, 0]);
// 	  var yAxis = svg.append("g")
//
// 	  // A function that builds the graph for a specific value of bin
// 	  function update(nBin) {
//
// 	    // set the parameters for the histogram
// 	    var histogram = d3.histogram()
// 	        .value(function(d) { return d.price; })   // I need to give the vector of value
// 	        .domain(x.domain())  // then the domain of the graphic
// 	        .thresholds(x.ticks(nBin)); // then the numbers of bins
//
// 	    // And apply this function to data to get the bins
// 	    var bins = histogram(data);
//
// 	    // Y axis: update now that we know the domain
// 	    y.domain([0, d3.max(bins, function(d) { return d.length; })]);   // d3.hist has to be called before the Y axis obviously
// 	    yAxis
// 	        .transition()
// 	        .duration(1000)
// 	        .call(d3.axisLeft(y));
//
// 	    // Join the rect with the bins data
// 	    var u = svg.selectAll("rect")
// 	        .data(bins)
//
// 	    // Manage the existing bars and eventually the new ones:
// 	    u.enter()
// 	        .append("rect") // Add a new rect for each new elements
// 	        .merge(u) // get the already existing elements as well
// 	        .transition() // and apply changes to all of them
// 	        .duration(1000)
// 	          .attr("x", 1)
// 	          .attr("transform", function(d) { return `translate(${x(d.x0)}, ${y(d.length)})`; })
// 	          .attr("width", function(d) { return x(d.x1) - x(d.x0) + 1 ; })
// 	          .attr("height", function(d) { return height - y(d.length); })
// 	          // .style("fill", "#69b3a2")
// 	          // .style("fill", colors[++cx % 3])
// 	          .style("fill", (d) => colors[d.x0 % 3])
//
//
// 	    // If less bar in the new histogram, I delete the ones not in use anymore
// 	    u.exit()
// 	        .remove()
// 	  }
//
//
// 	  // Initialize with 20 bins
// 	  update(nBins)
//
// 	  // Listen to the button -> update if user change it
// 	  // d3.select("#nBin")
// 	  //   .on("input", function() {
// 	  //       update(this.value);
// 	  //     });
// 	} );
// }
