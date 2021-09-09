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
      // .selectAll('image')
      .selectAll('circle')
      .data(currentMembers)
      .enter()
      // .append('image')
      .append('circle')
      .attr('cx', d => width / 2 + Math.random() * width / 3 * Math.cos(Math.random() * 2 * Math.PI - Math.PI))
      .attr('cy', d => height / 2 + Math.random() * height / 3 * Math.sin(Math.random() * 2 * Math.PI - Math.PI))
      // .attr('height', 15)
      // .attr('href', d => `static/images/members/${pad(d.icpsr, 6)}.jpg`)
      .style('opacity', 0.6)
      .style('fill', '#333')
      .attr('r', 5);
      // .transition()
      // .delay((d, i) => i * 20)
      // .duration(750)
      // .attr('r', 5)

    this.xScale = d3.scaleLinear().domain([-1, 1]).range([0, width]);
    this.yScale = d3.scaleLinear().domain([-1, 1]).range([height, 0]);

    console.log('setting', 'dim', props.dimensions);
    this.setDimensions(props.dimensions, false);
    console.log('setting', 'color', props.highlightParty);
    this.setColors(props.highlightParty, false);
  }

  setDimensions(dimensions, transition) {
    let selection = transition ? this.circles.transition() : this.circles;
    if (dimensions === 1) {
      console.log('has one dimension');
      selection
        .attr('cx', d => {
          return this.xScale(d.nominate_dim1);
        })
        .attr('cy', d => {
          return height / 2 + height / 10 * (Math.random() - 0.5)
        })
    }

    else if (dimensions === 0) {
      this.circles
      selection
      .attr('cx', d => width / 2 + Math.random() * width / 3 * Math.cos(Math.random() * 2 * Math.PI - Math.PI))
      .attr('cy', d => height / 2 + Math.random() * height / 3 * Math.sin(Math.random() * 2 * Math.PI - Math.PI))
    }
    else if (dimensions === 2) {
      this.circles
        selection
        .attr('cx', d => {
          return this.xScale(d.nominate_dim1);
        })
        .attr('cy', d => {
          return this.yScale(d.nominate_dim2);
        })
    }

  }

  setColors(highlightParty, transition) {
    let selection = transition ? this.circles.transition() : this.circles;
    if (highlightParty) {
      selection
        .style('fill', d => {
          return PARTY_COLORS[d.party_code];
        })
        .style('opacity', 0.6)
    } else {
      selection
        .style('fill', '#333')
        .style('opacity', 0.6)
    }
  }

  update(props, oldProps) {

    if (props.highlightParty !== oldProps.highlightParty && props.dimensions !== oldProps.dimensions) {
      this.setColors(props.highlightParty, false);
      this.setDimensions(props.dimensions, true);
    } else {
      if (props.highlightParty !== oldProps.highlightParty) {
        this.setColors(props.highlightParty, true);
      }

      if (props.dimensions !== oldProps.dimensions) {
        console.log('updating w dim', props.dimensions)
        this.setDimensions(props.dimensions, true);
      }
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