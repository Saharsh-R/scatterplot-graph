import React from 'react';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import Link from '@material-ui/core/Link';
import * as d3 from 'd3';
import d3Tip from "d3-tip";
import { useEffect, useState,useRef } from 'react';
import { Grid } from '@material-ui/core';



function Copyright() {
  return (
    <Typography variant="body2" color="textSecondary" align="center">
      {'Copyright © '}
      <Link color="inherit" target="_blank" href="https://saharsh-r.github.io/">
        Saharsh Rathi
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}


function BarChart({ id, data, width = 800, height = 500 }) {
  const padding = 50;
  var times = data.map(d => {
    let a = d.Seconds
    return new Date(1970, 0, 1, 0, Math.floor(a/60), a % 60)
  });
  
  var years = data.map(d => d.Year);

  const xScale = d3.scaleTime()
  .domain([d3.min(years) - 1, d3.max(years) + 1])
  .range([padding, width -  padding])
  ;

  const yScale = d3.scaleTime()
    .domain(d3.extent(times))
    .range([height - padding , padding])
    ;

  const yAxis = d3.axisLeft(yScale).tickFormat(d3.timeFormat('%M:%S'));
  const xAxis = d3.axisBottom(xScale).tickFormat(d3.format('d'));


  useEffect(() => {

    // const tooltip = d3
    //   .select('#tooltip')
    //   .attr('id', 'tooltip')
    //   .style('opacity', 0);
    var color = d3.scaleOrdinal(d3.schemeSet1);
    var keys = ['Doped', 'Not Doped'];
    var size = 20

    const svg = d3
      .select('#' + id)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
    const legend = svg.append('g').attr('id', 'legend')

    
    

    legend.selectAll("mydots")
      .data(keys)
      .enter()
      .append("rect")
        .attr("x", 600)
        .attr("y", function(d,i){ return 300 + i*(size+5)}) // 100 is where the first dot appears. 25 is the distance between dots
        .attr("width", size)
        .attr("height", size)
        .style("fill", function(d){ return color(d)})

    legend.selectAll("mylabels")
      .data(keys)
      .enter()
      .append("text")
        .attr("x", 600 + size*1.2)
        .attr("y", function(d,i){ return 300 + i*(size+5) + (size/2)}) // 100 is where the first dot appears. 25 is the distance between dots
        .style("fill", function(d){  return color(d)})
        .text(function(d){ return d})
        .attr("text-anchor", "left")
        .style("alignment-baseline", "middle")
    

    var tip = d3Tip()
      .attr('class', 'd3-tip')
      .attr('id', 'tooltip')
      .offset([-10, 0])
      .html(function(i,d) {
        let z = color('Not Doped')
        if (d.URL){
          z = color('Doped')
        }
        
        let ans =  `Name: <span style='color:${z}'>` + d.Name + ", " + d.Nationality+ `</span> <br />Finish Time: <span style='color:${z}'>` +d.Time+`</span> Year: <span style='color:${z}'>`+(d.Year)+"</span>" ;
        if (d.URL){
          ans += "<br />"+d.Doping;
        }
        d3.select('#tooltip').attr('data-year', d.Year);
        return ans
      })
 

    svg
      .selectAll(".dot")
      .append("a")
      .data(data)
      .enter()
      .append("circle")
      .attr("class", "dot")
      .attr("r", 4.5)
      .attr('data-xvalue', d => d.Year)
      .attr('data-yvalue', (d, i )=> times[i])
      .attr("cx", function(d) {
        return xScale(d.Year);
      })
      .attr("cy", function(d, i) {
        return yScale(times[i]);
      })
      .style("fill",  d => color(d.URL == '' ? 'Not Doped': 'Doped'))
      .on('mouseover', tip.show)
      .on('mouseout', tip.hide);
    // important! Tooltip will not work without this.
    svg.call(tip);


    svg.append('g')
      .attr('transform', 'translate('+ padding + ', 0)')
      .attr('id', 'y-axis')
      .call(yAxis);
    svg.append('g')
      .attr('transform', `translate(${0}, ${height - padding})`)
      .attr('id', 'x-axis')
      .call(xAxis);

  }, []);
  

  return <div id={id} style={{position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center'}}> 
  </div>;
}

export default function App() {
  const [dataset, setDataset] = useState([])

  useEffect(() => {
    if (dataset.length == 0){
      fetch("https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json")
        .then(response => response.json())
        .then(data => {
          setDataset(data);
          })
    } 
  }, [dataset])
  
  return (
    <Grid container alignItems = 'center' justify = 'center'  style = {{backgroundColor: 'grey'}}>
      <Grid item >
        <Box  p={4} style={{backgroundColor: '#f5f5f5'}} borderRadius={40}>
          <Typography variant="h4" component="h1" align = 'center' id='title' gutterBottom>
            Doping in Professional Bicycle Racing
          </Typography>
          <Typography variant="h6" component="h2" align = 'center' id='title' gutterBottom>
            35 Fastest times up Alpe d'Huez
          </Typography>
          {dataset.length != 0 && 
            <BarChart id="barchart" data={dataset} />
          }
          <Copyright />
        </Box>
      </Grid>
    </Grid>
    
  );
}
