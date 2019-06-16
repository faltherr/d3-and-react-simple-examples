import React, { Component } from "react";
import * as d3 from "d3";

const width = 650;
const height = 400;
const margin = { top: 20, right: 5, bottom: 20, left: 35 };

class Chart extends Component {
  state = {
    bars: []
  };

  static getDerivedStateFromProps(nextProps, prevState) {
    const { data } = nextProps;
    console.log(data)
    if (!data) return {};
    let tempExtent = d3.extent(data, d=>d.high)
    let xScale = d3.scaleTime()
      .domain(d3.extent(data, d=> d.date))
      .range([0, width])
      
    let yScale = d3.scaleLinear()
      .domain([Math.min(tempExtent[0], 0), tempExtent[1]])
      .range([height,0])

    let bars = data.map(el =>{
      return{
        x: xScale(el.date),
        y: yScale(el.high),
        height: yScale(el.low)-yScale(el.high),
        fill: 'black'
      }
    })
    return {bars}
  }

  render() {
    console.log(this.state.bars)
    return (
      <svg width={width} height={height}>
        {this.state.bars.map(bar=>{
          return <rect x={bar.x} y={bar.y} width={2} height={bar.height}/>
        })}
      </svg>
      );
  }
}

export default Chart;
