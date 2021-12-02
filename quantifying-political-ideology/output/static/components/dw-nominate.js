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

    const svg = (this.svg = d3.select(node).append('svg').attr('viewBox', `0 0 ${width} ${height}`).style('width', '100%').style('height', '100%')).style('overflow', 'visible');

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
    this.yScale = d3.scaleLinear().domain([-1, 1]).range([7 * height / 8 - 10, 0]);

    this.economicAxis = svg.append('g').style('opacity', 0.0);
    this.socialAxis = svg.append('g').style('opacity', 0.0);

    this.economicAxis.append('line')
      .attr('x1',  30)
      .attr('x2', width)
      .attr('y1', 7 * height / 8)
      .attr('y2', 7 * height / 8)
      .style('strokeWidth', 5)
      .style('stroke', '#ccc');

    this.economicAxis.append('text')
      .attr('x', width / 2)
      .attr('y', 7 * height / 8 + 16)
      .style('font-size', '10px')
      .style('fill', '#999')
      .style('font-weight', 'bold')
      .style('text-transform', 'uppercase')
      .attr('text-anchor', 'middle')
      .text('Economic');

    this.economicAxis.append('text')
      .attr('x', 30)
      .attr('y', 7 * height / 8 + 16)
      .style('font-size', '10px')
      .style('fill', '#ccc')
      .style('font-weight', 'bold')
      .style('text-transform', 'uppercase')
      .attr('text-anchor', 'start')
      .text('Liberal');

    this.economicAxis.append('text')
      .attr('x', width)
      .attr('y', 7 * height / 8 + 16)
      .style('font-size', '10px')
      .style('fill', '#ccc')
      .style('font-weight', 'bold')
      .style('text-transform', 'uppercase')
      .attr('text-anchor', 'end')
      .text('Conservative');


    this.socialAxis.append('line')
      .attr('x1', 30)
      .attr('x2', 30)
      .attr('y1', height / 8)
      .attr('y2', 7 * height / 8)
      .style('strokeWidth', 5)
      .style('stroke', '#ccc');


    this.socialAxis.append('text')
      .attr('x', 15)
      .attr('y', height / 8 + ((7 * height / 8) - height / 8) / 2)
      .attr('text-anchor', 'end')
      .attr('transform', `rotate(-90, ${15}, ${height / 8 + ((7 * height / 8) - height / 8) / 2})`)
      .style('font-size', '10px')
      .style('fill', '#999')
      .style('font-weight', 'bold')
      .style('text-transform', 'uppercase')
      .text('Social');

    this.socialAxis.append('text')
      .attr('x', 15)
      .attr('y', height / 8)
      .attr('text-anchor', 'end')
      .attr('transform', `rotate(-90, ${15}, ${height / 8})`)
      .style('font-size', '10px')
      .style('fill', '#ccc')
      .style('font-weight', 'bold')
      .style('text-transform', 'uppercase')
      .text('Conservative');

    this.socialAxis.append('text')
      .attr('x', 15)
      .attr('y', 6 * height / 8)
      .attr('transform', `rotate(-90, ${15}, ${6 * height / 8})`)
      .style('font-size', '10px')
      .style('fill', '#ccc')
      .style('font-weight', 'bold')
      .style('text-transform', 'uppercase')
      .attr('text-anchor', 'end')
      .text('Liberal');


    this.setDimensions(props.dimensions, false);
    this.setColors(props.highlightParty, false);
    this.setEconomicAxis(props.showEconomicAxis);
    this.setSocialAxis(props.showSocialAxis);
  }

  setDimensions(dimensions, transition) {
    let selection = transition ? this.circles.transition() : this.circles;
    if (dimensions === 1) {
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

  setSocialAxis(enabled) {
    if (enabled) {
      this.socialAxis.style('opacity', 1)
    } else {
      this.socialAxis.style('opacity', 0)
    }
  }

  setEconomicAxis(enabled) {
    if (enabled) {
      this.economicAxis.style('opacity', 1)
    } else {
      this.economicAxis.style('opacity', 0)
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
        this.setDimensions(props.dimensions, true);
      }
    }
    if (props.showSocialAxis !== oldProps.showSocialAxis) {
      this.setSocialAxis(props.showSocialAxis);
    }
    if (props.showEconomicAxis !== oldProps.showEconomicAxis) {
      this.setEconomicAxis(props.showEconomicAxis);
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
