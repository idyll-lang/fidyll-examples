
const React = require('react');
const D3Component = require('idyll-d3-component');
const d3 = Object.assign({}, require("d3"), require("d3-transition"), require("d3-selection"));

const { domain, grid1d, width, height, margin, drawDataPoints, drawBinDensity, drawBinTicks, drawDomainLine } = require('./observable-utils');

const kdeBinned = (el, points, gridType, binOffset, steps = 10) => {

  points = points.map(p => p + binOffset);

  const step = (domain[1] - domain[0]) / steps;
  const grid = grid1d(points, steps, domain, 0, gridType === 'Linear');

  // scales
  const xscale = d3.scaleLinear().domain(domain).range([0, width]);
  const yscale = d3.scaleLinear().domain([0, 2]).range([height, 0]);

  // container
  const svg = d3.select(el)
    .html('')
    .append('svg')
    .attr('viewBox', `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`) // Matt - changed to use viewBox instead of explicit width/height
    .attr('width', '100%')
    .attr('height', 'auto')
    .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    drawDataPoints(svg, points, xscale)
    if (gridType !== 'None') {
      drawBinDensity(svg, grid, step, 0, xscale, yscale);
      drawBinTicks(svg, step, xscale, yscale);
    }
    drawDomainLine(svg);
}

class KDEBinned extends D3Component {
  initialize(node, props) {
      if (!node) {
        return;
      }
      const el = this.el = node;

      kdeBinned(el, props.points, props.binMethod, props.offset, props.steps);
  }

  update(props) {
    console.log('binMethod', props.binMethod);
    kdeBinned(this.el, props.points, props.binMethod, props.offset, props.steps);
  }
}

module.exports = KDEBinned;
