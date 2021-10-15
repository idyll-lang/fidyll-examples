
const React = require('react');
const D3Component = require('idyll-d3-component');
const d3 = Object.assign({}, require("d3"), require("d3-transition"), require("d3-selection"));

const { domain, extBoxAlpha, grid1d, width, height, margin, drawReferenceDensity, drawBoxFilter, drawBinAxis, drawLabel } = require('./observable-utils');

function kdeBoxQuantization(el, points, bandwidth, boxIndex, steps = 10) {
  const K = 3;
  const step = (domain[1] - domain[0]) / steps;
  const sd = bandwidth / step;
  const s2 = sd * sd;

  const l = Math.sqrt((12 / K) * s2 + 1);
  const rbox = Math.floor(0.5 * l);
  const rebx = Math.floor(0.5 * l - 0.5);

  const d = 2 * rebx + 1;
  const a = extBoxAlpha(K, rebx, s2);
  const c1 = a / (d + 2 * a);
  const c2 = (1 - a) / (d + 2 * a);
  const cs = c1 + c2;
  const ch = 1.25;

  const grid1 = grid1d(points, steps, domain, rebx, false);
  const grid2 = grid1d(points, steps, domain, rbox, false);
  const n = grid1.length;
  const cutoff = boxIndex < -1 ? 0 : (boxIndex + 1 + rebx);

  const box = boxIndex < -1 ? null : {
    index: boxIndex,
    weights: Array.from({length: 2 * rbox + 1}, _ => ch)
  };
  const ebx = boxIndex < -1 ? null : {
    index: boxIndex,
    weights: [ch * c1 / cs, ...Array.from({length: d}, _ => ch), ch * c1 / cs]
  };

  // scales
  const xscale = d3.scaleLinear().domain([0, 1]).range([0, width]);
  const yrange1 = [height, height / 2];
  const yrange2 = [height / 2 - 20, -20];
  const yscale1 = d3.scaleLinear().domain([0, 2]).range(yrange1);
  const yscale2 = d3.scaleLinear().domain([0, 2]).range(yrange2);

  // container
  const svg = d3.select(el)
  .html('')
  .append('svg')
  .attr('viewBox', `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`) // Matt - changed to use viewBox instead of explicit width/height
  .attr('width', '100%')
  .attr('height', 'auto')
    .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

  drawReferenceDensity(svg, 0.45, bandwidth, 800, xscale, yrange1);
  drawReferenceDensity(svg, 0.45, bandwidth, 800, xscale, yrange2);
  drawBoxFilter(svg, step, xscale, yscale2, box);
  drawBinAxis(svg, step, xscale, yscale2);
  drawBoxFilter(svg, step, xscale, yscale1, ebx);
  drawBinAxis(svg, step, xscale, yscale1);
  drawLabel(svg, `σ = ${bandwidth.toFixed(2)}`);
}

class KDEBoxed extends D3Component {
  initialize(node, props) {
      if (!node) {
        return;
      }
      const el = this.el = node;


      kdeBoxQuantization(el, props.points, +props.bandwidth, +props.index, props.steps);
  }

  update(props) {
    kdeBoxQuantization(this.el, props.points, +props.bandwidth, +props.index, props.steps);
  }
}

module.exports = KDEBoxed;
