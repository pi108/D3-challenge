
// ==================================================================================================
// CREATE VARIABLES FOR SVG HEIGHT, SVG WIDTH, MARGINS, ACTUAL CHART HEIGHT,  ACTUAL CHART WIDTH
// ==================================================================================================


/* var svgWidth = 840;
var svgHeight = 560; */

var svgWidth = window.innerWidth * 0.6;
var svgHeight = window.innerHeight * 0.6;


var margin = { top: 40, right: 40, bottom: 120, left: 100 };
var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;


console.log (width);
console.log(height);


var svg = d3.select("#scatter").append("svg").attr("width", svgWidth).attr("height", svgHeight);
var chartGroup = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top})`);


// ==================================================================================================
// CREATE VARIABLES FOR DETAILS OF X AND Y AXIS LABEL CHOICES 
// ==================================================================================================



var xlabelchoices = [
  {
    'x': 0,
    'y': 25,
    'value': 'poverty',
    'active': true,
    'inactive': false,
    'text': "Poverty (%)"
  },
  {
    'x': 0,
    'y': 50,
    'value': 'age',
    'active': false,
    'inactive': true,
    'text': "Age (Median)"
  },
  {
    'x': 0,
    'y': 75,
    'value': 'income',
    'active': false,
    'inactive': true,
    'text': "Income (Median)"
  }
];



var ylabelchoices = [
  {
    'y': -margin.left * 0.90, // horizontal position
    'x': -height * 0.50,          // vertical position
    'value': 'obesity',
    'active': true,
    'inactive': false,
    'text': "Obesity (%)"
  },
  {
    'y': -margin.left * 0.65,
    'x': -height * 0.50,
    'value': 'smokes',
    'active': false,
    'inactive': true,
    'text': "Smokes (%)"
  },
  {
    'y': -margin.left * 0.40,
    'x': -height * 0.50,
    'value': 'healthcare',
    'active': false,
    'inactive': true,
    'text': "Lacks Healthcare (%)"
  }
];



// ==================================================================================================
// CREATE VARIABLES FOR LIST OF AVAILABLE X AND Y AXIS LABELS AND ALSO SELECTED X AND Y AXIS LABELS
// ==================================================================================================

var listXAxisLabels = xlabelchoices.map(d => d.value);
var listYAxisLabels = ylabelchoices.map(d => d.value);
// Default choice
var selectedXAxisLabel = listXAxisLabels[0];
var selectedYAxisLabel = listYAxisLabels[0];




// ==================================================================================================
// CREATE A FUNCTION FOR DETERMINING LINEAR SCALE
// ==================================================================================================


var getLinearScale = (data, userSelectedAxisLabel) => {
  var rangearr = [0, width];
  if (userSelectedAxisLabel == selectedYAxisLabel) rangearr = [height, 0];

  var min = d3.min(data, d => d[userSelectedAxisLabel]);
  var max = d3.max(data, d => d[userSelectedAxisLabel]);
  var padd = (max - min) * 0.1;

  var linearScale = d3.scaleLinear()
    .domain([min - padd, max + padd])
    .range(rangearr);

  return linearScale;
}



// ==================================================================================================
// CREATE A FUNCTION FOR CREATING AXES
// ==================================================================================================

var renderAxes = (newScale, newAxis, XorY) => {
  var axis = d3.axisBottom(newScale);
  if (XorY == 'y') axis = d3.axisLeft(newScale);

  newAxis.transition()
    .duration(1000)
    .call(axis);
  return newAxis;
}



// ==================================================================================================
// CREATE A FUNCTION FOR CREATING CIRCLES ON THE SCATTER PLOT
// ==================================================================================================

var renderCircles = (circlesGroup, newScale, userSelectedAxisLabel) => {
  var attstr = "cx";
  if (userSelectedAxisLabel == selectedYAxisLabel) attstr = "cy";

  circlesGroup.transition()
    .duration(1000)
    .attr(attstr, d => newScale(d[userSelectedAxisLabel]));
  return circlesGroup;
}



// ==================================================================================================
// CREATE A FUNCTION FOR UPDATING THE TOOLTIPS 
// ==================================================================================================

var updateToolTip = circlesGroup => {

  var percentstr = "";
  if (selectedXAxisLabel == "poverty") percentstr = "%";

  var toolTip = d3.tip()
    .attr("class", "d3-tip")
    .offset([60, -50])
    .html(d => `${d.state}<br>${selectedXAxisLabel}: ${d[selectedXAxisLabel] + percentstr}<br>${selectedYAxisLabel}: ${d[selectedYAxisLabel]}%`);
 
  circlesGroup.call(toolTip);

  circlesGroup
    .on("mouseover", data => toolTip.show(data))
    .on("mouseout", data => toolTip.hide(data));

  return circlesGroup;
}



// ==================================================================================================
// CREATE A FUNCTION FOR UPDATING THE ABBREVIATIONS INSIDE THE CIRCLES ON THE SCATTER PLOT
// ==================================================================================================


var renderAbbr = (abbrGroup, newScale, userSelectedAxisLabel) => {
  var axis = 'x';
  if (userSelectedAxisLabel == selectedYAxisLabel) axis = 'y';

  abbrGroup.transition()
    .duration(1000)
    .attr(axis, d => newScale(d[userSelectedAxisLabel]));
  return abbrGroup;
}



// ==================================================================================================
// CREATE A FUNCTION FOR UPDATING THE LABELS
// ==================================================================================================

var setLabels = (labelsGroup, d, labels) => {
  var onelabel = labelsGroup.append("text")
    .attr("x", d.x)
    .attr("y", d.y)
    .attr("value", d.value)
    .classed("active", d.active)
    .classed("inactive", d.inactive)
    .text(d.text);
  labels.push(onelabel);
}




// ==================================================================================================
// CREATE A FUNCTION FOR THE STEPS NEEDED WHEN A USER CLICKS ON AN X OR Y AXIS LABEL
// ==================================================================================================

var handleOnClickLabel = (trgt, data, XorY, labels, axis, circlesGroup, abbrGroup) => {
  
  var userSelectedAxisLabel = d3.select(trgt).attr("value");
  var values;
  var previous;

  if (XorY == 'x') {
    values = listXAxisLabels;
    previous = selectedXAxisLabel;
  }
  else {
    values = listYAxisLabels;
    previous = selectedYAxisLabel;
  }

  if (userSelectedAxisLabel !== previous) {
    try {
      var i = values.indexOf(previous);
      labels[i]
        .classed("active", false)
        .classed("inactive", true);

      if (XorY == 'x') {
        selectedXAxisLabel = userSelectedAxisLabel;
      }
      else {
        selectedYAxisLabel = userSelectedAxisLabel;
      }

      linearScale = getLinearScale(data, userSelectedAxisLabel);
      axis = renderAxes(linearScale, axis, XorY);
      circlesGroup = renderCircles(circlesGroup, linearScale, userSelectedAxisLabel);
      circlesGroup = updateToolTip(circlesGroup);
      abbrGroup = renderAbbr(abbrGroup, linearScale, userSelectedAxisLabel);

      i = values.indexOf(userSelectedAxisLabel);
      labels[i]
        .classed("active", true)
        .classed("inactive", false);
    }
    catch (error) {
      return;
    }
  }
}


// ==================================================================================================
// CREATE A FUNCTION TO:
// 1. LOAD THE DATA
// 2. DETERMINE THE SCALE FOR THE X AND Y AXES
// 3. CREATE THE SECTIONS FOR THE X AND Y AXES
// 4. CREATE THE LABELS FOR THE X AND Y AXES
// 5. CREATE THE SECTION FOR THE CIRCLES ON THE SCATTERPLOT
// 6. CREATE THE SECTION FOR THE ABBREVAITIONS INSIDE THE CIRCLES
// 7. DEFINE THE STEPS NEEDED WHEN A USER CLCIKS ON AN X AXIS LABEL
// 8. DEFINE THE STEPS WHEN A USER CLICKS ON A Y AXIS LABEL
// ==================================================================================================


d3.csv("assets/data/data.csv").then((data, err) => {
  if (err) throw err;

  // Data =========================
  data.forEach(d => {
    // X-axis
    d.poverty = +d.poverty;
    d.age = +d.age;
    d.income = +d.income
    // Y-axis
    d.obesity = +d.obesity
    d.smokes = +d.smokes;
    d.healthcare = +d.healthcare
  });

  // X and Y axis =================

  var xLinearScale = getLinearScale(data, selectedXAxisLabel);
  var yLinearScale = getLinearScale(data, selectedYAxisLabel);

  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(xLinearScale));

  var yAxis = chartGroup.append("g")
    .classed("y-axis", true)
    .call(d3.axisLeft(yLinearScale));

  // Labels for X and Y axis  =================

  var xLabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);
  var yLabelsGroup = chartGroup.append("g")
    .attr("transform", "rotate(-90)")

  var xlabels = [];
  var ylabels = [];

  xlabelchoices.forEach(d => setLabels(xLabelsGroup, d, xlabels));
  ylabelchoices.forEach(d => setLabels(yLabelsGroup, d, ylabels));

  // Plotting data  =================

  var circlesGroup = chartGroup.selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[selectedXAxisLabel]))
    .attr("cy", d => yLinearScale(d[selectedYAxisLabel]))
    .attr("r", 16)
    //.attr("fill", "rgba(41,177,177,.6)")
    .attr("fill", "blue")
    .attr("opacity", "1.0");

  circlesGroup = updateToolTip(circlesGroup);

  var abbrGroup = chartGroup.selectAll("text.stateText")
    .data(data)
    .enter()
    .append("text")
    .classed("stateText", true)
    .text(d => d.abbr)
    .attr("x", d => xLinearScale(d[selectedXAxisLabel]))
    .attr("y", d => yLinearScale(d[selectedYAxisLabel]))
    .attr("dy", 5);

  // Event handling ===================

  xLabelsGroup.selectAll("text")
    .on("click", () => {
      handleOnClickLabel(d3.event.target, data, 'x', xlabels, xAxis, circlesGroup, abbrGroup);
    });

  yLabelsGroup.selectAll("text")
    .on("click", () => {
      handleOnClickLabel(d3.event.target, data, 'y', ylabels, yAxis, circlesGroup, abbrGroup);
    });
}).catch(error => {
  console.log(error);
});


// ==================================================================================================
// END OF THE SCRIPT
// ==================================================================================================