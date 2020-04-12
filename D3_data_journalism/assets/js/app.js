/***********************************************************
 * Author: Maverick Sanchez
 * For UCI Homework # 16 - D3 Challenge
 * *********************************************************
 */

/***********************************************************
 * Set up chart sizes
 * *********************************************************
 */
let svgWidth = 960;
let svgHeight = 700;

let margin = {
    top: 20,
    right: 40,
    bottom: 60,
    left:80
};

let width = svgWidth - margin.left - margin.right;
let height = svgHeight - margin.top - margin.bottom;

let svg = d3
    .select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

let chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

/***********************************************************
 * INitial axes values
 * *********************************************************
 */
let chosenXAxis = "poverty"; //age, income
let chosenYAxis = "obesity"; //smokes, healthcare

/***********************************************************
 * Functions used to refresh charts
 * *********************************************************
 */

 // Function 1: Our x-scaler
function xScale(journalData, chosenXAxis) {
    let xLinearScale = d3.scaleLinear()
        .domain(d3.extent(journalData, data => data[chosenXAxis]))
        .range([0, width]);
    return xLinearScale;
}
// Function 2: Our Y-scaler
function yScale(journalData, chosenYAxis) {
    let yLinearScale = d3.scaleLinear()
        .domain(d3.extent(journalData, data => data[chosenYAxis]))
        .range([height-20, 0]);
    return yLinearScale;
}

// Function 3: Updating circles nodes using switch case based on selected axis
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {
    let labelX, labelY;
    switch (chosenXAxis){
        case "income": labelX = "Household Income"; break;
        case "age": labelX = "Age"; break;
        default: labelX = "poverty"; 
    }

    switch (chosenYAxis) {
        case "smokes": labelY = "Smokes"; break;
        case "healthcare": labelY = "Healthcare"; break;
        default: labelY = "Obese";
    }

    // Tooltip
    let tool_tip = d3.tip()
        .attr("class", "d3-tip")
        .offset([-8, 0])
        .html(function (d) {
            return (`<b>${d.state}</b><br>${labelX} ${d[chosenXAxis]}<br>${labelY} ${d[chosenYAxis]}`);
        });

    circlesGroup.call(tool_tip);

    circlesGroup.on('mouseover', function (data) {
        tool_tip.show(data, this);
        d3.select(this).attr("stroke", "black");
    })
        .on('mouseout', function (data) {
            tool_tip.hide(data);
            d3.select(this).attr("stroke", "none");
        });    
    return circlesGroup;
}

// Function 4: Re-rendering our circle nodes by updating the x,y via transformation
function renderCircles(circlesGroup, newXScale, newYScale, chosenXAxis, chosenYAxis) {
    circlesGroup.transition()
        .duration(600)
        .attr("transform", d => "translate(" + newXScale(d[chosenXAxis]) + "," + newYScale(d[chosenYAxis]) + ")");
    return circlesGroup;
}

// Function 5: Refresh x-axis labels using transition
function renderXAxes(newXScale, xAxis) {
    let bottomAxis = d3.axisBottom(newXScale);
    xAxis.transition()
    .duration(600)
    .call(bottomAxis);
    return xAxis;
}

// Function 6: Refresh y-axis labels using transition
function renderYAxes(newYScale, yAxis) {
    let leftAxis = d3.axisLeft(newYScale);
    yAxis.transition()
        .duration(600)
        .call(leftAxis);
    return yAxis;
}

/***********************************************************
 * Read our CSV data and generate the scatter plot
 * *********************************************************
 */

d3.csv("assets/data/data.csv").then(function (journalData, err) {
    if (err) throw err;

    // Data cleaning
    journalData.forEach(data => {
        data.healthcare = + data.healthcare;
        data.poverty = + data.poverty;
        data.obesity = + data.obesity;
        data.smokes = + data.smokes;
        data.income = + data.income;
        data.age = + data.age;
        data.id = + data.id;
    })

    //Initialize the scalers and append axes
    let xLinearScale = xScale(journalData, chosenXAxis);
    let yLinearScale = yScale(journalData, chosenYAxis);
    let colorScale = d3.scaleOrdinal(d3.schemeCategory10);
    let bottomAxis = d3.axisBottom(xLinearScale);
    let leftAxis = d3.axisLeft(yLinearScale);

    let xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${height-20})`)
        .call(bottomAxis);

    let yAxis = chartGroup.append("g").call(leftAxis);

    // Declare our circles group as nodes so we can bind the circle and text together
    let circlesGroup = chartGroup.append("g")
        .attr("class", "nodes")
        .selectAll("circle")
        .data(journalData)
        .enter()
        .append("g")
        .attr("transform", function (data, index) {
            return "translate(" + xLinearScale(data[chosenXAxis]) + "," + yLinearScale(data[chosenYAxis]) + ")";
        });

    // Append our circles
    circlesGroup.append("circle")
        .attr("r", 12)
        .style("fill", data => colorScale(data.id))
        .style("opacity", 0.8);
        ;

    // Append our text (used a circle text class for formatting, dy for positioning of the text relative to the circle)
    circlesGroup.append("text")
        .attr("class", "circleText")
        .attr("text-anchor", "middle")
        .attr("dy", ".35em")
        .text(data => data.abbr);
        
    // Define 2 axes groups for X and Y values
    let labelsXGroup = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + margin.top -20})`);
    
    let povertyXLabel = labelsXGroup.append("text")
        .attr("x", 0)
        .attr("y", 15)
        .attr("value", "poverty") 
        .classed("active", true)
        .text("In Poverty (%)");
    
    let ageXLabel = labelsXGroup.append("text")
        .attr("x", 0)
        .attr("y", 35)
        .attr("value", "age") 
        .classed("inactive", true)
        .text("Age (Median)");

    let incomeXLabel = labelsXGroup.append("text")
        .attr("x", 0)
        .attr("y", 55)
        .attr("value", "income") 
        .classed("inactive", true)
        .text("Household Income (Median)");

    let labelsYGroup = chartGroup.append("g")
        .attr("transform", "rotate(-90)");

    let obeseYLabel = labelsYGroup.append("text")    
        .attr("y", -5 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .attr("value", "obesity")
        .classed("active", true)
        .text("Obesity (%)");

    let smokesLabel = labelsYGroup.append("text")
        .attr("y", 15 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .attr("value", "smokes")
        .classed("inactive", true)
        .text("Smokes (%)");

    let healthcareLabel = labelsYGroup.append("text")
        .attr("y", 35 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .attr("value", "healthcare")
        .classed("inactive", true)
        .text("Lack of Healthcare (%)");

    circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

/***********************************************************
 * Tie click events to the labels
 * *********************************************************
 */

labelsXGroup.selectAll("text")
        .on("click", function () {
            let valueX = d3.select(this).attr("value");
            if (valueX !== chosenXAxis) {
                chosenXAxis = valueX;
                xLinearScale = xScale(journalData, chosenXAxis);
                yLinearScale = yScale(journalData, chosenYAxis);

                // Update x axes
                xAxis = renderXAxes(xLinearScale, xAxis);
                
                // Update circle nodes with new x values
                circlesGroup = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);

                // Update tooltips with new info
                circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

                // Initialize everything to inactive - only activate if selected
                povertyXLabel.attr("class", "inactive");
                incomeXLabel.attr("class", "inactive");
                ageXLabel.attr("class", "inactive");
                if (chosenXAxis === "poverty") { povertyXLabel.attr("class", "active"); };
                if (chosenXAxis === "income") { incomeXLabel.attr("class", "active")};
                if (chosenXAxis === "age") { ageXLabel.attr("class", "active")};

            }
        });
    
labelsYGroup.selectAll("text")
        .on("click", function () {
            // get value of selection
            let valueY = d3.select(this).attr("value");
            if (valueY !== chosenYAxis) {

                chosenYAxis = valueY;

                // Update scales for new data
                xLinearScale = xScale(journalData, chosenYAxis);
                yLinearScale = yScale(journalData, chosenYAxis);

                // Update y axis with transition
                yAxis = renderYAxes(yLinearScale, yAxis);

                // Update nodes with new y values
                circlesGroup = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenYAxis, chosenYAxis);

                // Update tooltips with new info
                circlesGroup = updateToolTip(chosenYAxis, chosenYAxis, circlesGroup);

                // Initialize everything to inactive - only activate if selected
                obeseYLabel.attr("class", "inactive");
                healthcareLabel.attr("class", "inactive");
                smokesLabel.attr("class", "inactive");
                if (chosenYAxis === "obese") { obeseYLabel.attr("class", "active") };
                if (chosenYAxis === "healthcare") { healthcareLabel.attr("class", "active") };
                if (chosenYAxis === "smokes") { smokesLabel.attr("class", "active") };

            }
        });

}).catch(function (error) {
    console.log(error);
});
