// ************** Generate the tree diagram	 *****************
var margin = {top: 20, right: 120, bottom: 20, left: 120},
	width = 960 - margin.right - margin.left,
	height = 500 - margin.top - margin.bottom;
	
var i = 0;

var tree = d3.layout.tree()
	.size([height, width]);

var diagonal = d3.svg.diagonal()
	.projection(function(d) { return [d.y, d.x]; });

var svg = d3.select("body").append("svg")
	.attr("width", width + margin.right + margin.left)
	.attr("height", height + margin.top + margin.bottom)
  .append("g")
	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Add the clipping path
svg.append("svg:clipPath").attr("id", "clipper")
	.append("svg:rect")
	.attr("id", "clip-rect");

var layout_root = svg
	.append("svg:g")
	.attr("class", "container")
	.attr("transform", "translate(0,0)");

// set the clipping path
var animate_group = layout_root.append("svg:g")
	.attr("clip-path", "url(#clipper)");

// load the external data
d3.json("treeData.json", function(error, treeData) {
  root = treeData[0];
  update(root);
});


function update(source) {

  // Compute the new tree layout.
  var nodes = tree.nodes(root).reverse(),
	  links = tree.links(nodes);

  // Normalize for fixed-depth.
  nodes.forEach(function(d) { d.y = d.depth * 180; });

  // Declare the nodes…
  var node = svg.selectAll("g.node")
	  .data(nodes, function(d) { return d.id || (d.id = ++i); });

  // Enter the nodes.
  var nodeEnter = node.enter().append("g")
	  .attr("class", "node")
	  .attr("transform", function(d) { 
		  return "translate(" + d.y + "," + d.x + ")"; });

  nodeEnter.append("circle")
	  .attr("r", 10);

  nodeEnter.append("text")
	  .attr("x", function(d) { 
		  return d.children || d._children ? 5 : -5; })
	  .attr("dy", ".35em")
	  .attr("text-anchor", function(d) { 
		  return d.children || d._children ? "end" : "start"; })
	  .text(function(d) { return d.name; })
	  .style("fill-opacity", 1)
	  .style("fill", "#303")

  nodeEnter.append("text")
  	  .attr("x", function(d) { 
		  return d.children || d._children ? -20 : 20; })
	  .attr("dy", ".35em")
	  .attr("text-anchor", function(d) { 
		  return d.children || d._children ? "end" : "start"; })
	  .text(function(d) { return d.value; })
	  .style("fill-opacity", 1);

  // Declare the links…
  var link = svg.selectAll("path.link")
	  .data(links, function(d) { return d.target.id; });

  // Enter the links.
  var linkEnter = link.enter().insert("path", "g")
	  .attr("class", "link")
	  .attr("d", diagonal);

  linkEnter.transition()
	  .style("stroke", "#ff9")
	  .duration(1000)
	  .delay(function(d) {return 500 * d.target.level; });

  // Get the nodes chain
  var path_nodes = [];
  path_nodes.push(root);
  var children = root;
  while ("children" in children) {
  	children = children.children;
  	path_nodes.push(children);
  }

  // Get the matched links
  var matched_links = [];
  ui.linkGroup.selectAll('path.link')
  	  .filter(function(d,i) {
  	  	return _.any(children, function(c) {
  	  		return c === d.target;
  	  	});
  	  })
  	  .each(function(d) {
  	  	matched_links.push(d);
  	  });

  animate_chain(matched_links);
}

function animate_chain(links) {
	var link_renderer = d3.svg.diagonal()
		.projection(function(d) {
			return [d.y, d.x];
		});

	// Links
	ui.animate_group.selectAll("path.selected")
		.data([])
		.exit().remove();

	ui.animate_group
		.selectAll("path.selected")
		.data(links)
		.enter().append("svg:path")
		.attr("class", "selected")
		.attr("d", link_renderer);

	// Animate the clipping path
	var overlay_box = ui.svg.node().getBBox();

	ui.svg.select("#clip-rect")
		.attr("x", overlay_box.x + overlay_box.width)
		.attr("y", overlay_box.y)
		.attr("width", 0)
		.attr("height", overlay_box.height)
		.transition().duration(500)
		.attr("x", overlay_box.x)
		.attr("width", overlay_box.width);
}
