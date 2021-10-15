
const React = require('react');
const D3Component = require('idyll-d3-component');
const d3 = Object.assign({}, require("d3"), require("d3-transition"), require("d3-selection"));

const { domain, grid1d, extBoxFilter, width, height, margin, drawBoxSubplot } = require('./observable-utils');

function kdeExtendedBoxFilter(el, points, bandwidth, boxIndex, boxIter, steps = 10) {
  const K = 3;
  const step = (domain[1] - domain[0]) / steps;
  const sd = bandwidth / step;
  const s2 = sd * sd;
  const r = Math.floor(0.5 * Math.sqrt((12 / K) * s2 + 1) - 0.5);
  const d = 2 * r + 1;
  const a = d * (r * (r + 1) - 3 * s2 / K) /
            (6 * (s2 / K - (r + 1) * (r + 1)));
  const c1 = a / (d + 2 * a);
  const c2 = (1 - a) / (d + 2 * a);
  const cs = c1 + c2;

  const grid1 = grid1d(points, steps + 2*r, domain, r, false);
  const grid2 = grid1.map(x => 0);
  const n = grid1.length;
  const cutoff = boxIndex < -1 ? 0 : (boxIndex + 1 + r);

  const box = boxIndex < -1 ? null : {
    index: boxIndex,
    weights: [c1 / cs, ...Array.from({length: d}, d => 1), c1 / cs]
  };

  if (boxIter === 1) {
    extBoxFilter(grid1, grid2, n, r, c1, c2, cutoff);
  } else if (boxIter === 2) {
    extBoxFilter(grid1, grid2, n, r, c1, c2);
    extBoxFilter(grid2, grid1, n, r, c1, c2, cutoff);
  } else if (boxIter === 3) {
    extBoxFilter(grid1, grid2, n, r, c1, c2);
    extBoxFilter(grid2, grid1, n, r, c1, c2);
    extBoxFilter(grid1, grid2, n, r, c1, c2, cutoff);
  }

  // scales
  const xscale = d3.scaleLinear().domain([0, 1]).range([0, width]);
  const yscale1 = d3.scaleLinear().domain([0, 2]).range([height, height/2]);
  const yscale2 = d3.scaleLinear().domain([0, 2]).range([height/2 - 20, -20]);

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


      kdeExtendedBoxFilter(el, props.points, props.bandwidth, props.boxIndex, props.boxIter, props.steps);
  }

  update(props) {
    kdeExtendedBoxFilter(this.el, props.points, props.bandwidth, props.boxIndex, props.boxIter, props.steps);
  }
}

module.exports = KDEBoxed;
