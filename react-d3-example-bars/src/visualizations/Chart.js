import React, { Component } from "react";
import * as d3 from "d3";

const width = 650;
const height = 400;
const margin = { top: 20, right: 5, bottom: 20, left: 35 };

class Chart extends Component {
  state = {
    bars: [],
    xScale: ''
  };

  xAxis = d3.axisBottom()
  yAxis = d3.axisLeft()
    // .scale(yScale)

  static getDerivedStateFromProps(nextProps, prevState) {
    const { data } = nextProps;
    if (!data) return {};
    let tempExtent = d3.extent(data, d=>d.high)
    let xScale = d3.scaleTime()
      .domain(d3.extent(data, d=> d.date))
      .range([margin.left, width - margin.right])
      
    let yScale = d3.scaleLinear()
      .domain([Math.min(tempExtent[0], 0), tempExtent[1]])
      .range([height - margin.bottom,margin.top])

    let colorScale = d3.scaleSequential()
      .domain(d3.extent(data, d => d.avg).reverse())
      .interpolator(d3.interpolateRdYlBu)

    let bars = data.map(el =>{
      return{
        x: xScale(el.date),
        y: yScale(el.high),
        height: yScale(el.low)-yScale(el.high),
        fill: colorScale(el.avg)
      }
    })
    return {bars, xScale, yScale}
  }

  componentDidMount(){
    // Here we use d3 to render a brush
    this.brush = d3.brushX()
      .extent([[margin.left,margin.top], [width-margin.right, height-margin.top]])
      .on('end', () => {
        if(!d3.event.selection){
          this.props.updateRange([])
          return
        }
        let [ minX,maxX ] = d3.event.selection
        // We use .invert() with a d3 scale because we can give the dom a range and it will return a domain
        let range = [
          this.state.xScale.invert(minX),
          this.state.xScale.invert(maxX)
        ]
        this.props.updateRange(range)
      })


    d3.select(this.refs.brush)
      .call(this.brush)
  }

  componentDidUpdate(){
    // D3 draws our axis
    this.xAxis.scale(this.state.xScale)
    d3.select(this.refs.xAxis).call(this.xAxis)
    this.yAxis.scale(this.state.yScale)
    d3.select(this.refs.yAxis).call(this.yAxis)

    // D3 transitions animating y height and fill
    d3.select(this.refs.bars)
      .selectAll('rect')
      .data(this.state.bars)
      .transition()
      .attr('y', d=> d.y)
      .attr('height', d=> d.height)
      .attr('fill', d=> d.fill)

  }

  render() {
    return (
      <svg width={width} height={height}>
        <g ref="bars">
          {this.state.bars.map((bar,i)=>{
            // return <rect key={i} x={bar.x} y={bar.y} width={2} height={bar.height} fill={bar.fill}/>
            // To animate bars in react we want to make sure that d3 does not control the same things that React does
            // Here we drop y fill and height because our d3 transition calculation will handle this part of the DOM
            return <rect key={i} x={bar.x} width={2}/>
          })}
        </g>

        <g ref='xAxis' transform={`translate(0,${height-margin.bottom})`}/>
        <g ref='yAxis' transform={`translate(${margin.left})`}/>

        {/* Render brush */}
        <g ref='brush'/>

      </svg>
      );
  }
}

export default Chart;
