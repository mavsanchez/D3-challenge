// Step 1: Set up our chart
//= ================================
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

// Initial Params
let chosenXAxis = "poverty"; //age, income
let chosenYAxis = "obesity"; //smokes, healthcare

// function used for updating x-scale let upon click on axis label
function xScale(journalData, chosenXAxis) {
    // create scales
    let xLinearScale = d3.scaleLinear()
        .domain(d3.extent(journalData, data => data[chosenXAxis]))
        .range([0, width]);
    return xLinearScale;

}

function yScale(journalData, chosenYAxis) {
    // create scales
    let yLinearScale = d3.scaleLinear()
        .domain(d3.extent(journalData, data => data[chosenYAxis]))
        .range([height-20, 0]);
    return yLinearScale;

}

// function used for updating circles group with new tooltip
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
        // .html(data => `<b>${data.state}</b><br />Poverty: ${data.poverty} <br /> Healthcare: ${data.healthcare}`);
        .html(function (d) {
            return (`<b>${d.state}</b><br>${labelX} ${d[chosenXAxis]} %<br>${labelY} ${d[chosenYAxis]}%`);
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

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, newYScale, chosenXAxis, chosenYAxis) {
    circlesGroup.transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[chosenXAxis]))
        .attr("cy", d => newYScale(d[chosenYAxis]));

    return circlesGroup;
}

// function used for updating xAxis let upon click on axis label
function renderXAxes(newXScale, xAxis) {
    let bottomAxis = d3.axisBottom(newXScale);
    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);
    return xAxis;
}
function renderYAxes(newYScale, yAxis) {
    let leftAxis = d3.axisLeft(newYScale);
    yAxis.transition()
        .duration(1000)
        .call(leftAxis);
    return yAxis;
}


// Step 3:
// Import data from the data.csv file
// =================================
d3.csv("assets/data/data.csv").then(function (journalData, err) {
    if (err) throw err;

    journalData.forEach(data => {
        data.healthcare = + data.healthcare;
        data.poverty = + data.poverty;
        data.obesity = + data.obesity;
        data.smokes = + data.smokes;
        data.income = + data.income;
        data.age = + data.age;
        data.id = + data.id;
    })

    

// id,state,abbr,poverty,povertyMoe,age,ageMoe,income,incomeMoe,healthcare,healthcareLow,healthcareHigh,obesity,obesityLow,obesityHigh,smokes,smokesLow,smokesHigh,-0.385218228
//     // Step 5: Create Scales
//     //= ============================================
    let xLinearScale = xScale(journalData, chosenXAxis);
    let yLinearScale = yScale(journalData, chosenYAxis);


    let colorScale = d3.scaleOrdinal(d3.schemeCategory10);

//     // Step 6: Create initial Axes
    let bottomAxis = d3.axisBottom(xLinearScale);
    let leftAxis = d3.axisLeft(yLinearScale);

//     // Step 7: Append the axes to the chartGroup
    let xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${height-20})`)
        .call(bottomAxis);

    let yAxis = chartGroup.append("g").call(leftAxis);


    let circlesGroup = chartGroup.selectAll("circle")
        .data(journalData)
        .enter()
        .append("circle")
        .attr("cx", data => xLinearScale(data[chosenXAxis]))
        .attr("cy", data => yLinearScale(data[chosenYAxis]))
        .attr("r", 12)
        .style("fill", data => colorScale(data.id))
        ;

    // Create group for  2 x- axis labels
    let labelsXGroup = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + margin.top -20})`);
        // .attr("transform", `translate(${width / 3}, ${height + margin.top + 10})`)
    
    let povertyXLabel = labelsXGroup.append("text")
        .attr("x", 0)
        .attr("y", 15)
        .attr("value", "poverty") // value to grab for event listener
        .classed("active", true)
        .text("In Poverty (%)");
    
    let ageXLabel = labelsXGroup.append("text")
        .attr("x", 0)
        .attr("y", 35)
        .attr("value", "age") // value to grab for event listener
        .classed("inactive", true)
        .text("Age (Median)");

    let incomeXLabel = labelsXGroup.append("text")
        .attr("x", 0)
        .attr("y", 55)
        .attr("value", "income") // value to grab for event listener
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

    // chartGroup
    //     .selectAll("text")
    //     .data(journalData)
    //     .enter()
    //     .append("text")
    //     .attr("x", data => xScale(data.poverty))
    //     .attr("y", data => yScale(data.healthcare))
    //     .attr("text-anchor", "middle")
    //     .attr("class", "circleText")
    //     .text(data => `${data.abbr}`);
        

    // x axis labels event listener
    labelsXGroup.selectAll("text")
        .on("click", function () {
            // get value of selection
            let valueX = d3.select(this).attr("value");
            if (valueX !== chosenXAxis) {

                // replaces chosenXAxis with value
                chosenXAxis = valueX;

                // console.log(chosenXAxis)

                // functions here found above csv import
                // updates x scale for new data
                xLinearScale = xScale(journalData, chosenXAxis);
                yLinearScale = yScale(journalData, chosenYAxis);

                // updates x axis with transition
                xAxis = renderXAxes(xLinearScale, xAxis);
                yAxis = renderYAxes(yLinearScale, yAxis);

                // updates circles with new x values
                circlesGroup = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);

                // updates tooltips with new info
                circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

                // changes classes to change bold text
                
                povertyXLabel.attr("class", "inactive")
                incomeXLabel.attr("class", "inactive")
                ageXLabel.attr("class", "inactive")
                
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

                // replaces chosenYAxis with value
                chosenYAxis = valueY;

                // console.log(chosenYAxis)

                // functions here found above csv import
                // updates x scale for new data
                xLinearScale = xScale(journalData, chosenYAxis);
                yLinearScale = yScale(journalData, chosenYAxis);

                // updates x axis with transition
                xAxis = renderXAxes(xLinearScale, xAxis);
                yAxis = renderYAxes(yLinearScale, yAxis);

                // updates circles with new x values
                circlesGroup = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenYAxis, chosenYAxis);

                // updates tooltips with new info
                circlesGroup = updateToolTip(chosenYAxis, chosenYAxis, circlesGroup);

                // changes classes to change bold text

                obeseYLabel.attr("class", "inactive")
                healthcareLabel.attr("class", "inactive")
                smokesLabel.attr("class", "inactive")

                if (chosenYAxis === "obese") { obeseYLabel.attr("class", "active") };
                if (chosenYAxis === "healthcare") { healthcareLabel.attr("class", "active") };
                if (chosenYAxis === "smokes") { smokesLabel.attr("class", "active") };

            }
        });





}).catch(function (error) {
    console.log(error);
});
