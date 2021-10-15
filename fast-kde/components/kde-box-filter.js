
const React = require('react');
const D3Component = require('idyll-d3-component');
const d3 = Object.assign({}, require("d3"), require("d3-transition"), require("d3-selection"));

const { domain, grid1d, boxFilter, scaleGrid, width, height,  margin, drawBoxSubplot } = require('./observable-utils');

const kdeBox = (el, points, bandwidth, boxIndex, boxIter, steps = 10) => {
  const K = 3;
  const step = (domain[1] - domain[0]) / steps;
  const sd = bandwidth / step;
  const l = Math.sqrt((12 / K) * sd * sd + 1);
  const r = Math.floor(0.5 * l);
  const d = 2 * r + 1;

  const grid1 = grid1d(points, steps + 2 * r, domain, r, false);
  const grid2 = grid1.map(x => 0);
  const n = grid1.length;
  const cutoff = boxIndex < -1 ? 0 : (boxIndex + 1 + r);

  const box = boxIndex < -1 ? null : {
    index: boxIndex,
    weights: Array.from({ length: d }, d => 1)
  };

  if (boxIter === 1) {
    boxFilter(grid1, grid2, n, r, cutoff);
    scaleGrid(grid2, 1 / d);
  } else if (boxIter === 2) {
    boxFilter(grid1, grid2, n, r);
    boxFilter(grid2, grid1, n, r, cutoff);
    scaleGrid(grid2, 1 / d);
    scaleGrid(grid1, 1 / (d * d));
  } else if (boxIter === 3) {
    boxFilter(grid1, grid2, n, r);
    boxFilter(grid2, grid1, n, r);
    boxFilter(grid1, grid2, n, r, cutoff);
    scaleGrid(grid2, 1 / (d * d * d));
    scaleGrid(grid1, 1 / (d * d));
  }

  // scales
  const xscale = d3.scaleLinear().domain([0, 1]).range([0, width]);
  const yscale1 = d3.scaleLinear().domain([0, 2]).range([height/2 - 20, -20]);
  const yscale2 = d3.scaleLinear().domain([0, 2]).range([height, height/2]);

  // container
  const svg = d3.select(el)
  .html('')
  .append('svg')
  .attr('viewBox', `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`) // Matt - changed to use viewBox instead of explicit width/height
  .attr('width', '100%')
  .attr('height', 'auto')
    .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

  drawBoxSubplot(svg, grid2, step, r, xscale, yscale2, boxIter % 2 ? null : box);
  drawBoxSubplot(svg, grid1, step, r, xscale, yscale1, boxIter % 2 ? box : null);

}

class KDEBoxed extends D3Component {
  initialize(node, props) {
      if (!node) {
        return;
      }
      const el = this.el = node;


      kdeBox(el, props.points, +props.bandwidth, +props.boxIndex, +props.boxIter, props.steps);
  }

  update(props) {
    kdeBox(this.el, props.points, +props.bandwidth, +props.boxIndex, +props.boxIter, props.steps);
  }
}

module.exports = KDEBoxed;
