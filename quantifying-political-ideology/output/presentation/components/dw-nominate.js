const React = require('react');
const D3Component = require('idyll-d3-component');
const d3 = require('d3');


const width = 600;
const height = 360;

const PARTY_COLORS = {
  100: '#0000CC',
  200: '#CC0000',
  328: '#00CC00',
}

const pad = (str, len) => {
  str = '' + str;
  if (str.length >= len) {
    return str;
  }
  return `${'0'.repeat(len - str.length)}${str}`;
}

class CustomD3Component extends D3Component {
  initialize(node, props) {

    const svg = (this.svg = d3.select(node).append('svg').attr('viewBox', `0 0 ${width} ${height}`).style('width', '100%').style('height', 'auto')).style('overflow', 'visible');

    const membersWithHistory = props.data.members;
    const currentMembers = membersWithHistory.filter(d => d.congress === 117);
    
    this.circles = svg
      .selectAll('image')
      .data(currentMembers)
      .enter()
      .append('image')
      .attr('x', d => width / 2 + Math.random() * width / 3 * Math.cos(Math.random() * 2 * Math.PI - Math.PI))
      .attr('y', d => height / 2 + Math.random() * height / 3 * Math.sin(Math.random() * 2 * Math.PI - Math.PI))
      .attr('width', 15)
      .attr('height', 15)
      .attr('href', d => `static/images/members/${pad(d.icpsr, 6)}.jpg`)
      // .attr('opacity', 0.6)
      // .attr('fill', '#33')

    this.xScale = d3.scaleLinear().domain([-1, 1]).range([0, width]);
    this.yScale = d3.scaleLinear().domain([-1, 1]).range([height, 0]);

    console.log('setting', 'dim', props.dimensions);
    this.setDimensions(props.dimensions);
    console.log('setting', 'color', props.highlightParty);
    this.setColors(props.highlightParty);
  }

  setDimensions(dimensions, transition) {
    let selection = transition ? this.circles.transition() : this.circles;
    if (dimensions === 1) {
      console.log('has one dimension');
      selection
        .attr('x', d => {
          return this.xScale(d.nominate_dim1);
        })
        .attr('y', d => {
          return height / 2 + height / 10 * (Math.random() - 0.5)
        })
    }

    else if (dimensions === 0) {
      this.circles
      selection
      .attr('x', d => width / 2 + Math.random() * width / 3 * Math.cos(Math.random() * 2 * Math.PI - Math.PI))
      .attr('y', d => height / 2 + Math.random() * height / 3 * Math.sin(Math.random() * 2 * Math.PI - Math.PI))
    }
    else if (dimensions === 2) {
      this.circles
        selection
        .attr('x', d => {
          return this.xScale(d.nominate_dim1);
        })
        .attr('y', d => {
          return this.yScale(d.nominate_dim2);
        })
    }

  }

  setColors(highlightParty, transition) {
    let selection = transition ? this.circles.transition() : this.circles;
    if (highlightParty) {
      selection
        .attr('fill', d => {
          return PARTY_COLORS[d.party_code];
        })
    } else {
      selection
        .attr('fill', '#333')
    }
  }

  update(props, oldProps) {

    if (props.highlightParty !== oldProps.highlightParty) {
      this.setColors(props.highlightParty, true);
    }

    if (props.dimensions !== oldProps.dimensions) {
      console.log('updating w dim', props.dimensions)
      this.setDimensions(props.dimensions, true);
    } 

    // this.svg
    //   .selectAll('circle')
    //   .transition()
    //   .duration(750)
    //   .attr('cx', Math.random() * size)
    //   .attr('cy', Math.random() * size);
  }
}

module.exports = CustomD3Component;
