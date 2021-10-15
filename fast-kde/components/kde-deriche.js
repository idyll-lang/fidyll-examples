

const React = require('react');
const D3Component = require('idyll-d3-component');
const d3 = Object.assign({}, require("d3"), require("d3-transition"), require("d3-selection"));

const { domain, grid1d, derichePrep, dericheConv, width, height, margin, drawBinDensity, drawBinAxis, drawDataPoints, drawPointDensities } = require('./observable-utils');

function kdeDeriche(el, points, bandwidth, mode, steps = 10) {
  const code = {'Causal': 1, 'Anticausal': -1}[mode] || 0;
  const step = (domain[1] - domain[0]) / steps;
  const data = grid1d(points, steps, domain, 0, false);
  const prep = derichePrep(bandwidth / step, 4);
  const grid = dericheConv(prep, data, steps, code);

  // scales
  const xscale = d3.scaleLinear().domain([0, 1]).range([0, width]);
  const yscale = d3.scaleLinear().domain([0, 0.2]).range([height, 0]);

  // container
  const svg = d3.select(el)
    .html('')
    .append('svg')
    .attr('viewBox', `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`) // Matt - changed to use viewBox instead of explicit width/height
    .attr('width', '100%')
    .attr('height', 'auto')
    .style('overflow', 'visible')
    .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

  if (mode !== 'None') {
    drawBinDensity(svg, grid, step, 0, xscale, yscale);
  }
  drawBinAxis(svg, step, xscale, yscale);
  drawDataPoints(svg, points, xscale);
  drawPointDensities(svg, points, bandwidth, 800, xscale, [0, 0.005]);

  if (mode === 'Mix') {
    svg.selectAll('rect')
      .filter((d, i) => i < (steps / 2 - 1))
      .attr('fill', '#aaa');
  }
}

class KDEDeriche extends D3Component {
  initialize(node, props) {
      if (!node) {
        return;
      }
      const el = this.el = node;


      kdeDeriche(el, props.points, props.bandwidth, props.mode, props.steps);
  }

  update(props) {
    kdeDeriche(this.el, props.points, props.bandwidth, props.mode, props.steps);
  }
}

module.exports = KDEDeriche;
