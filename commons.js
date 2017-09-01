// function defs

var identity = (arg1) => (arg1);
var barName = (data) => ((data.key.length > 25) ? (data.key.slice(0, 25) + "...") : data.key);
var t = d3.transition().duration(750);

//statics
const marginBetweenGroups = 6,
    marginBetweenBars = 3,
    width = 1000,
    barHeight = 20,
    topPadding = 50;

var drawChart = (data, titleX, titleY) => {
    var graphHeight = (barHeight + 5) * data.length;
    var graphWidth = width - 200;
    var height = topPadding + graphHeight;

    var svgEl = d3.select(".svg-chart")
        .attr("width", width)
        .attr("height", height);

    // var barGroup = svgEl.selectAll("g");

    svgEl.selectAll("g").remove();
    svgEl.selectAll("text").remove();
    // barGroup.remove();

    var barGroup = svgEl.selectAll("g")
        .data(data).enter();
    
    barGroup.selectAll("rect").remove();

    var x = d3.scaleLinear()
        .domain([0, d3.max(data.map(b => b.value))])
        .range([0, graphWidth]);

    var y = d3.scaleOrdinal([0, graphHeight], 10)
        .domain(data.map((d) => (d.key)));

    var xAxis = d3.axisBottom()
        .scale(x);

    var yAxis = d3.axisLeft()
        .scale(y);

    var normalize = (a) => (x(a.value));
    
    var barNameEl = barGroup
        .append("text")
        .attr("x", 150)
        .attr("y", (d, i) => ((i * barHeight + topPadding + 5) + (barHeight / 2)))
        .attr("dy", ".35em")
        .attr("text-anchor", "end")
        .attr("style", "font-size: 10px")
        .text(barName);

    var barRectEl = barGroup
        .append("rect")
        .attr("x", 170)
        .attr("y", (d, i) => ((i * barHeight + topPadding + 5)))
        .attr("width", normalize)
        .attr("fill", "#3386FF")
        .attr("height", barHeight - 5);

    svgEl.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(" + 170 + "," + (height - 50) + ")")
        .call(xAxis);

    svgEl.append("text")
        .attr("y", 25)
        .attr("x", 170)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text(titleY);

    svgEl.append("text")
        .attr("y", height - 20)
        .attr("x", width - 10)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text(titleX);

}

var drawMultiChart = (datum, titleX, titleY) => {

    var margin = {
            top: 40,
            right: 20,
            bottom: 30,
            left: 170
        };

    var groupCount = datum.length;
    var groupHeight = marginBetweenGroups + (5 * (barHeight + marginBetweenBars));
    var graphHeight = groupCount * groupHeight + 150 ;
    var height = margin.top + margin.bottom + graphHeight;

    var svg = d3.select(".svg-chart-2")
        .attr("width", width)
        .attr("height", height-80);

    svg.selectAll("g").remove();
    svg.selectAll("text").remove();

    var g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
    var graphWidth = width - 200;

    var maxX = d3.max(datum.map(arr => d3.max(arr.value.map(el => el.count))));
    var allDests = [...new Set(datum.map(el => el.value.map(el2 => el2.dest)).reduce((arr, els) => arr.concat(els)))].sort(d3.ascending);
    console.log("allDests:", allDests);

    var y0 = d3.scaleBand()
        .rangeRound([0, height])
        .paddingInner(0.1);

    var y1 = d3.scaleBand()
        .padding(0.05);

    console.log("maxX: ", maxX, graphWidth);

    var x = d3.scaleLinear()
        .range([0, graphWidth])
        .domain([0, maxX]);

    var xAxis = d3.axisBottom()
        .scale(x);

    var z = d3.scaleSequential()
        .domain([0, allDests.length])
        .interpolator(d3.interpolateRainbow);

    var colorMap = {};
    allDests.forEach(dest => {
        colorMap[dest] = z((allDests.length - 1) - allDests.indexOf(dest))
    });

    console.log("colorMap:", colorMap);
    // y0.domain(datum.map((d) => (d.key)));

    var group0 = g
        .selectAll("g")
        .data(datum, d => d)

    var group1 = group0.enter()
        .append("g")
        .attr("transform", (d, i) => "translate(0," + i * (groupHeight + marginBetweenGroups) + ")")

    var texts = group1.append("text")
        .attr("x", -5)
        .attr("y", 2.7 * (barHeight + marginBetweenBars))
        .attr("style", "font-size: 10px")
        .style("text-anchor", "end")
        .text(barName);

    var rects = group1.selectAll("rect")
        .data((d) => d.value);

    rects.attr("class", "update")
        .attr("y", 0)
        .style("fill-opacity", 1)
        .transition(t)
        .attr("x", function(d, i) { return i * 32; });

    rects.enter().append("rect")
        .attr("x", 0)
        .attr("y", (d, index) => (index * (barHeight + marginBetweenBars)))
        .attr("width", (el) => x(el.count?el.count:0))
        .attr("height", barHeight)
        .attr("fill", (d) => colorMap[d.dest])

    var titleYEl = svg.append("text")
        .attr("y", 3)
        .attr("x", 170)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text(titleY);

    var titleXEl = svg.append("text")
        .attr("y", height-100)
        .attr("x", width-100)
        .attr("dy", ".71em")
        .style("text-anchor", "start")
        .text(titleX);

    var xAxisEl = svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(" + 170 + "," + (graphHeight-50) + ")")
        .call(xAxis);

    var legend = svg.append("g")
        .selectAll("g")
        .data(allDests)
            
    var legendColors = legend
        .enter()
        .append("rect")
        .attr("width", 15)
        .attr("height", 15)
        .attr("x",750)
        .attr("y",(d, index) =>( 50 + index * 20))
        .attr("fill", (d) => colorMap[d])
        
    var legendText = legend.enter()
        .append("text")
        .attr("x",770)
        .attr("y",(d, index) =>( 64 + index * 20))
        .text(d=>d)

}

var drawChart1 = (inputData, selectedYear) => {
    console.log("redraw chart");

    var yearSpecificData = inputData
        .map(d => ({
            year: d["Year"],
            origin: d["Origin"],
            count: Number(d["Total Population"])
        }))
        .filter(a => (a.year === selectedYear));

    var data = d3.nest()
        .key((d) => (d.origin))
        .rollup((countries) =>
            (d3.sum(countries,
                (d) => (d.count)))
        )
        .entries(yearSpecificData);

    drawChart(data, "# Refugees", "# Origin Country");
};

var drawChart2 = (inputData, selectedYear) => {

    var mappedData = inputData.map(d => ({
            year: d["Year"],
            origin: d["Origin"],
            dest: d["Country / territory of asylum/residence"],
            count: Number(d["Refugees (incl. refugee-like situations)"])
        })).filter(a => (a.year === selectedYear))
        .sort((a, b) => (a.origin - b.origin));

    var nest1 = d3.nest()
        .key(d => d.origin)
        .rollup(function(leaves) {
            return leaves
                .sort((a, b) => (b.count - a.count))
                .slice(0, 5);
        })
        .entries(mappedData)
        .slice(0,5);

    nest1.sort((a,b)=> d3.ascending(a.key, b.key));
    console.log("nest1: ", nest1, selectedYear);
    
    drawMultiChart(nest1, "# Refugees", "# Origin Country");
};

d3.csv("/data.csv", function(data) {

    var years = d3.map(data, a => a["Year"])
        .keys()
        .map(a => ({
            value: a
        }));

    var selectedYear = years[0].value;

    // Year Dropdown
    var yearDropDown = d3.select("#year-dropdown")
        .append("select")
        .attr("name", "year-list");

    var options = yearDropDown.selectAll("option")
        .data(years)
        .enter()
        .append("option");

    options.text((d) => (d.value))
        .attr("value", (d) => (d.value));

    var menuChanged = function() {
        selectedYear = d3.event.target.value;
        drawChart1(data, selectedYear);
        drawChart2(data, selectedYear);
        console.log("selectedYear Changed: ", selectedYear);
    };
    yearDropDown.on("change", menuChanged);

    drawChart1(data, selectedYear);
    drawChart2(data, selectedYear);
});