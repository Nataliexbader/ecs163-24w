let abFilter = 25

const width = window.innerWidth;
const height = window.innerHeight;

let scatterMargin = {top: 30, right: 30, bottom: 10, left: 60},
    scatterWidth = 400 - scatterMargin.left - scatterMargin.right,
    scatterHeight = 300 - scatterMargin.top - scatterMargin.bottom;

let distrMargin = {top: 10, right: 30, bottom: 10, left: 60},
    distrWidth = 400 - distrMargin.left - distrMargin.right,
    distrHeight = 100 - distrMargin.top - distrMargin.bottom;

let teamMargin = {top: 10, right: 30, bottom: 30, left: 60},
    teamWidth = width - teamMargin.left - teamMargin.right,
    teamHeight = 200 - teamMargin.top - teamMargin.bottom;

let streamMargin = {top: 5, right: 30, bottom: 10, left: 60},
    streamWidth = width - streamMargin.left - streamMargin.right,
    streamHeight = height - streamMargin.top - streamMargin.bottom;

let scatterLeft = 0, scatterTop = 0;
let distrLeft = 0, distrTop = scatterTop + scatterHeight + scatterMargin.top + scatterMargin.bottom;
let teamLeft = 0, teamTop = distrTop + distrHeight + distrMargin.top + distrMargin.bottom;

let streamLeft = 50;
let streamTop = teamTop + teamHeight + teamMargin.bottom + 50;

streamHeight = height - streamTop - streamMargin.bottom;
d3.csv("ds_salaries.csv").then(rawData =>{
    console.log("rawData", rawData);
    
    rawData.forEach(function(d){
        d.remote_ratio = Number(d.remote_ratio);
        d.salary_in_usd = Number(d.salary_in_usd);
        d.salary = Number(d.salary);
        d.SO = Number(d.SO);
    });
    

   // rawData = rawData.filter(d=>d.AB>abFilter);
   // rawData = rawData.map(d=>{
                          //return {
                            //  "H_AB":d.H/d.AB,
                            //  "SO_AB":d.SO/d.AB,
                             // "teamID":d.teamID,
                         // };
   // });
   // console.log(rawData);
    
//plot 1
const svg = d3.select("svg");

const g1 = svg.append("g")
    .attr("transform", `translate(${scatterMargin.left}, ${scatterMargin.top})`);

    const ScatterTitle = svg.append("text")
    .attr("x", teamWidth /3.5)  
    .attr("y", scatterMargin.top / 1)  
    .attr("font-size", "20px")
    .attr("text-anchor", "middle")  
    .text("Salary in USD for remote workers");


// X label
g1.append("text")
    .attr("x", scatterWidth / 2)
    .attr("y", scatterHeight + 55)
    .attr("font-size", "20px")
    .attr("text-anchor", "middle")
    .text("salary_in_usd");

// Y label
g1.append("text")
    .attr("x", -(scatterHeight / 2))
    .attr("y", -40)
    .attr("font-size", "20px")
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .text("remote_ratio");

// X ticks
const x1 = d3.scaleLinear()
    .domain([0, d3.max(rawData, d => d.salary_in_usd)])
    .range([0, scatterWidth]);

const xAxisCall = d3.axisBottom(x1)
    .ticks(7);
g1.append("g")
    .attr("transform", `translate(0, ${scatterHeight})`)
    .call(xAxisCall)
    .selectAll("text")
    .attr("y", "10")
    .attr("x", "-5")
    .attr("text-anchor", "end")
    .attr("transform", "rotate(-40)");

// Y ticks
const y1 = d3.scaleLinear()
    .domain([0, d3.max(rawData, d => d.remote_ratio)])
    .range([scatterHeight, 0]);

const yAxisCall = d3.axisLeft(y1)
    .ticks(13);
g1.append("g").call(yAxisCall);

const brush = d3.brush()
    .extent([[0, 0], [scatterWidth, scatterHeight]])
    .on("start brush", brushed)
    .on("end", endbrushed);


g1.append("g")
    .attr("class", "brush")
    .call(d3.brush()
        .extent([[0, 0], [scatterWidth, scatterHeight]]) 
        .on("brush", brushed)
        .on("end", endbrushed));


const circles = g1.selectAll("circle").data(rawData)
    .enter().append("circle")
    .attr("cx", d => x1(d.salary_in_usd))
    .attr("cy", d => y1(d.remote_ratio))
    .attr("r", 5)
    .attr("fill", "purple");

function brushed(event) {
    const selection = event.selection;
    if (selection) {
        const [[x0, y0], [x1, y1]] = selection;

        circles.attr("fill", d => {
            const isInside = x0 <= x1(d.salary_in_usd) && x1(d.salary_in_usd) <= x1 &&
                             y0 <= y1(d.remote_ratio) && y1(d.remote_ratio) <= y1;
            return isInside ? "red" : "purple"; 
        });
    }
}

function endbrushed(event) {
    if (!event.selection) {
        circles.attr("fill", "purple"); 
    }
}


//plot 2
    
    q = rawData.reduce((s, { experience_level }) => (s[experience_level] = (s[experience_level] || 0) + 1, s), {});
    r = Object.keys(q).map((key) => ({ experience_level: key, count: q[key] }));
    console.log(r);


    const Title = svg.append("text")
    .attr("x", teamWidth / 2 + teamMargin.left)
    .attr("y", distrTop + distrHeight + teamMargin.top / 4)
    .attr("font-size", "15px")
    .attr("text-anchor", "middle")
    .text("Salary per Experience Level");
           
    const g3 = svg.append("g")
        .attr("width", teamWidth + teamMargin.left + teamMargin.right)
        .attr("height", teamHeight + teamMargin.top + teamMargin.bottom)
        .attr("transform", `translate(${teamMargin.left}, ${teamTop})`)

    // X label
    g3.append("text")
    .attr("x", teamWidth / 2)
    .attr("y", teamHeight + 50)
    .attr("font-size", "20px")
    .attr("text-anchor", "middle")
    .text("Experience Level")
    

    // Y label
    g3.append("text")
    .attr("x", -(teamHeight / 2))
    .attr("y", -40)
    .attr("font-size", "20px")
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .text("Salary")

    // X ticks
    const x2 = d3.scaleBand()
    .domain(r.map(d => d.experience_level))
    .range([0, teamWidth])
    .paddingInner(0.3)
    .paddingOuter(0.2)

    const xAxisCall2 = d3.axisBottom(x2)
    g3.append("g")
    .attr("transform", `translate(0, ${teamHeight})`)
    .call(xAxisCall2)
    .selectAll("text")
        .attr("y", "10")
        .attr("x", "-5")
        .attr("text-anchor", "end")
        .attr("transform", "rotate(-40)")

    // Y ticks
    const y2 = d3.scaleLinear()
    .domain([0, d3.max(r, d => d.count)])
    .range([teamHeight, 50])

    const yAxisCall2 = d3.axisLeft(y2)
                        .ticks(6)
    g3.append("g").call(yAxisCall2)

    const rects2 = g3.selectAll("rect").data(r)

    rects2.enter().append("rect")
    .attr("y", d => y2(d.count))
    .attr("x", (d) => x2(d.experience_level))    
    .attr("width", x2.bandwidth)
    .attr("height", d => teamHeight - y2(d.count))
    .attr("fill", "pink")




//plot3 - Streamgraph Setup


const margin = {top: 20, right: 20, bottom: 30, left: 50};
const width = 800 - margin.left - margin.right;
const height = 400 - margin.top - margin.bottom;


const streamgraph = svg.append("text")
        .attr("x", streamWidth / 2 + streamMargin.right)
        .attr("y", streamTop + streamMargin.top / 10)
        .attr("font-size", "15px")
        .attr("text-anchor", "middle")
        .text("Salary Per Work Year");

const g4 = svg.append("g")
.attr("width", streamWidth + streamMargin.left + streamMargin.right)
.attr("height", streamHeight + streamMargin.top + streamMargin.bottom - 50)
.attr("transform", `translate(${streamLeft}, ${streamTop})`);


d3.csv("ds_salaries.csv").then(function(data) {
  
  data.forEach(function(d) {
    d.work_year = +d.work_year; 
    d.salary_in_usd = +d.salary_in_usd; 
  });

  const stack = d3.stack()
    .keys(["salary_in_usd"])
    .order(d3.stackOrderNone)
    .offset(d3.stackOffsetWiggle); 

  const layers = stack(data);

  
  const xScale = d3.scaleLinear()
    .domain(d3.extent(data, d => d.work_year))
    .range([0, width]);

  const yScale = d3.scaleLinear()
    .domain([
      d3.min(layers, layer => d3.min(layer, d => d[0])),
      d3.max(layers, layer => d3.max(layer, d => d[1]))
    ])
    .nice()
    .range([height, 0]);


  const area = d3.area()
    .x(d => xScale(d.data.work_year))
    .y0(d => yScale(d[0]))
    .y1(d => yScale(d[1]));

  
  g4.selectAll(".layer")
    .data(layers)
    .enter().append("path")
      .attr("class", "layer")
      .attr("d", area)
      .style("fill", (d, i) => d3.schemeCategory10[i % 10]);
     
  // Add X axis
  g4.append("g")
    .attr("transform", `translate(0,${height})`)
    .text("remote_ratio")
    .call(d3.axisTop(xScale));
    
   
    

  // Add Y axis
  g4.append("g")
    .call(d3.axisLeft(yScale));
   

function endbrushed(event) {
    const selection = event.selection;
    if (!selection) {
        rects2.attr("fill", "pink").attr("stroke", "none");
    } else {
        
        var t = d3.transition().delay(100).duration(1000);
        
       
        rects2.data(r) /e
            .transition(t)
            .attr("x", d => x2(d.experience_level)) 
            .attr("y", d => y2(d.count))
            .attr("width", x2.bandwidth())
            .attr("height", d => teamHeight - y2(d.count))
            .attr("fill", "#6baed6")
            .attr("stroke", "none");
        
      
        brushG.selectAll("path.area").remove(); 

        
        var binsData = binsGenerator(salary_data); 
        brushG.append("path")
            .attr("class", "area")
            .attr("d", Area(binsData))
            .attr("fill", "pink")
            .attr("stroke", "#pink");

        
        var binsData2 = binsGenerator(salary_data2); 
        brushG.append("path")
            .attr("class", "area") 
            .attr("d", Area(binsData2))
            .attr("fill", "pink");
    }
}

g3.append("g")
    .attr("class", "brush")
    .call(d3.brushX()
        .extent([[0, 0], [teamWidth, teamHeight]])
        .on("end", endbrushed));


    

    }).catch(function(error){
        console.log(error);
    });
})
