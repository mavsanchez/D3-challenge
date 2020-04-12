// Step 1: Set up our chart
//= ================================
let svgWidth = 960;
let svgHeight = 500;

let margin = {
    top: 20,
    right: 40,
    bottom: 60,
    left: 50
};

let width = svgWidth - margin.left - margin.right;
let height = svgHeight - margin.top - margin.bottom;

// Step 2: Create an SVG wrapper,
// append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
// =================================
let svg = d3
    .select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

let chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Step 3:
// Import data from the donuts.csv file
// =================================
d3.csv("assets/data/data.csv").then(function (journalData) {
    let y_data = journalData.map(row => parseInt(row.healthcare));
    let x_data = journalData.map(row => parseInt(row.poverty) );
    let labels_id = journalData.map(row => parseInt(row.id));
    let labels = journalData.map(row => row.abbr);
    
    console.log("x",x_data);
    console.log("y",y_data);
    console.log(labels);
    // Step 4: Parse the data
    // Format the data and convert to numerical and date x_data
    // =================================
    // Create a function to parse date and time
    let parseTime = d3.timeParse("%d-%b");

//     // Format the data
//     journalData.forEach(function (data) {
//         data.date = parseTime(data.date);
//         data.morning = +data.morning;
//         data.evening = +data.evening;
//     });
// id,state,abbr,poverty,povertyMoe,age,ageMoe,income,incomeMoe,healthcare,healthcareLow,healthcareHigh,obesity,obesityLow,obesityHigh,smokes,smokesLow,smokesHigh,-0.385218228
//     // Step 5: Create Scales
//     //= ============================================
    let xScale = d3.scaleLinear()
        // .domain([d3.min(x_data)-1, d3.max(x_data)])
        .domain(d3.extent(x_data))
        .range([0, width]);

    let yScale = d3.scaleLinear()
        .domain([d3.min(y_data), d3.max(y_data)])
        .range([height, 0]);

    let rScale = d3.scaleLinear()
        .domain([d3.min(x_data), d3.max(x_data)])
        .range([10, 20]);

    let opacity = d3.scaleLinear()
        .domain([d3.min(x_data), d3.max(x_data)])
        .range([.2, 1]);

    let colorScale = d3.scaleOrdinal(d3.schemeCategory10);
//     let yLinearScale2 = d3.scaleLinear()
//         .domain([0, d3.max(journalData, d => d.evening)])
//         .range([height, 0]);

//     // Step 6: Create Axes
//     // =============================================
    // let bottomAxis = d3.axisBottom(xTimeScale).tickFormat(d3.timeFormat("%d-%b"));
    let bottomAxis = d3.axisBottom(xScale);
    let leftAxis = d3.axisLeft(yScale);
//     let rightAxis = d3.axisRight(yLinearScale2);


//     // Step 7: Append the axes to the chartGroup
//     // ==============================================
//     // Add bottomAxis
    chartGroup.append("g").attr("transform", `translate(0, ${height})`).call(bottomAxis);

//     // Add leftAxis to the left side of the display
    chartGroup.append("g").call(leftAxis);

//     // Add rightAxis to the right side of the display
    // chartGroup.append("g").attr("transform", `translate(${width}, 0)`).call(rightAxis);


//     // Step 8: Set up two line generators and append two SVG paths
//     // ==============================================
//     // Line generators for each line
//     let line1 = d3
//         .line()
//         .x(d => xTimeScale(d.date))
//         .y(d => yLinearScale1(d.morning));

//     let line2 = d3
//         .line()
//         .x(d => xTimeScale(d.date))
//         .y(d => yLinearScale2(d.evening));


//     // Append a path for line1
//     chartGroup.append("path")
//         .data([journalData])
//         .attr("d", line1)
//         .classed("line green", true);

//     // Append a path for line2
//     chartGroup.append("path")
//         .data([journalData])
//         .attr("d", line2)
//         .classed("line orange", true);

    // Tooltip
    let tool_tip = d3.tip()
        .attr("class", "d3-tip")
        .offset([-8, 0])
        .html((data, index) => `${labels[index]}`);

    svg.call(tool_tip);


    let circlesGroup = chartGroup.selectAll("circle").data(x_data)
    
    circlesGroup.enter()
        .append("circle")
        .attr("cx", (data, index) => xScale(y_data[index]))
        .attr("cy", data => yScale(data))
        .attr("opacity", (data, index) => opacity(data))
        .attr("r", 12)
        .style("fill", (data, index) => colorScale(labels_id[index]))
        ;

    circlesGroup
        .enter()
        .append("text")
        .attr("x", (data, index) => xScale(y_data[index]))
        .attr("y", data => yScale(data)+4.5)
        .attr("text-anchor", "middle")
        .attr("class", "circleText")
        .text((data, index) => `${labels[index]}`)
        .on('mouseover', tool_tip.show)
        .on('mouseout', tool_tip.hide);


    // Create axes labels
    chartGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height) + (height/4) )
        .attr("dy", "1em")
        .attr("class", "axisText")
        .text("Lacks healthcare (%)");
    chartGroup.append("text")
        .attr("transform", `translate(${width / 3}, ${height + margin.top + 30})`)
        .attr("class", "axisText")
        .text("In Poverty (%)");

}).catch(function (error) {
    console.log(error);
});
