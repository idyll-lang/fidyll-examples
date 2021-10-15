
const React = require('react');
const D3Component = require('idyll-d3-component');
const d3 = Object.assign({}, require("d3"), require("d3-transition"), require("d3-selection"));

const { height, domain, width, steps, margin, drawDataPoints, kde, drawPointDensities, drawDomainLine } = require('./observable-utils');

// scales
const ydomain = [0, 0.035];
const yscale = d3.scaleLinear().domain(ydomain).range([height, 0]);
const xscale = d3.scaleLinear().domain(domain).range([0, width]);

// shapes
const area = d3.area()
  .x((d, i) => xscale(domain[0] + (domain[1] - domain[0]) * i / steps))
  .y0(height)
  .y1(d => yscale(d));

const kdeIntro = (el, props) => {

  const { points, bandwidth, showDensities, showKernels } = props;

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

  drawDataPoints(svg, points, xscale);

  if (showDensities) {
    // total density
    svg.selectAll('path.total')
      .data([kde.kdeCDF1d(points, [0, 1], steps, bandwidth)])
      .join('path')
      .attr('d', d => area(d))
      .attr('fill', '#ddd');

  }
  if (showKernels) {
    drawPointDensities(svg, points, bandwidth, 800, xscale, ydomain);
  }

  drawDomainLine(svg);
}

class KDEIntro extends D3Component {
  initialize(node, props) {
      if (!node) {
        return;
      }
      const el = this.el = node;

      kdeIntro(el, props);
  }

  update(props) {
    kdeIntro(this.el, props);
  }
}

module.exports = KDEIntro;
