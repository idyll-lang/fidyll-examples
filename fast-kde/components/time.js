

const React = require('react');
const D3Component = require('idyll-d3-component');
const d3 = Object.assign({}, require("d3"), require("d3-transition"), require("d3-selection"));

const sizeX = 600;
const sizeY = 400;

class TimeVisualizer extends D3Component {
  initialize(node, props) {
    if (!node) {
      return;
    }
    const el = node;
    const data = props.data[props.dataset];
    const bins = +props.bins;
    const grid = props.binMethod;


    /**
     * Start Jeff's Code
     */
    const methods = ['Box', 'ExtBox', 'Deriche', 'Direct'];
    const width = 800;
    const height = 200;
    const margin = { top: 2, left: 50, right: 110, bottom: 50 };
    const titleSize = 11;
    const titleWeight = 600;

    function prep(data) {
      return Array.from(
        d3.group(data, d => d.method),
        ([method, points]) => ({ method, points })
      );
    }

    const xscale = d3.scaleLog()
      .domain([100, 1e7])
      .range([0, width]);
    const yscale = d3.scaleLog()
      .domain([0.005, 500])
      .range([height, 0]);
    const cscale = d3.scaleOrdinal()
      .domain(methods)
      .range(['#e15759', '#555555', '#4e79a7', '#54a24b']);

    const line = d3.line()
      .x(d => xscale(d.size))
      .y(d => yscale(d.time));

    // clear any prior content
    el.innerHTML = '';

    // container svg
    const svg = d3.select(el)
      .append('svg')
        .style('margin-top', `${80 - margin.top}px`)
        .attr('viewBox', `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`) // Matt - changed to use viewBox instead of explicit width/height
        .attr('width', '100%')
        .attr('height', 'auto')
      .append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // x-grid
    svg.append('g')
    .call(
      d3.axisBottom(xscale)
        .tickSize(height)
        .tickFormat(d => '')
    )
    .call(g => g.select('.domain').remove())
    .call(g => g.selectAll('.tick line').attr('stroke', '#ddd'))

    // y-grid
    svg.append('g')
      .call(
        d3.axisRight(yscale)
          .ticks(4)
          .tickSize(width)
          .tickFormat(d => '')
      )
      .call(g => g.select('.domain').remove())
      .call(g => g.selectAll('.tick line')
        .attr('stroke-width', 1)
        .attr('stroke', '#ddd'));

    const fmt = d3.format('.0s');

    // x-axis
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xscale)
        .tickFormat(d => Number.isInteger(Math.log10(d)) ? fmt(d) : ''))
      .call(g => g.selectAll('.domain')
        .attr('stroke-width', 1)
        .attr('stroke', '#888'))
      .call(g => g.selectAll('.tick line')
        .attr('stroke-width', 1)
        .attr('stroke', '#888'));

    // x-axis title
    svg.append('text')
      .attr('transform', `translate(${width / 2}, ${height + 34})`)
      .attr('text-anchor', 'middle')
      .attr('font-family', 'Avenir Next')
      .attr('font-size', titleSize)
      .attr('font-weight', titleWeight)
      .text('Number of Data Points');

    // y-axis
    svg.append('g')
      .attr('transform', `translate(${width},0)`)
      .call(
        d3.axisRight(yscale).ticks(4).tickFormat(d => d + '')
      )
      .call(g => g.selectAll('.domain')
        .attr('stroke-width', 1)
        .attr('stroke', '#888'))
      .call(g => g.selectAll('.tick line')
        .attr('stroke-width', 1)
        .attr('stroke', '#888'));

    // y-axis title
    svg.append('text')
      .attr('transform', `translate(${width + 34}, ${height / 2}) rotate(90)`)
      .attr('text-anchor', 'middle')
      .attr('font-family', 'Avenir Next')
      .attr('font-size', titleSize)
      .attr('font-weight', titleWeight)
      .text('Time (ms)');

    // color legend
    const legend = svg.append('g')
      .attr('transform', `translate(${width + 60}, 0)`);

    legend.append('text')
      .attr('x', 0)
      .attr('y', 6)
      .attr('font-family', 'Avenir Next')
      .attr('font-size', titleSize)
      .attr('font-weight', titleWeight)
      .text('Method');

    const entries = legend.selectAll('g')
      .data(methods)
      .join('g')
      .attr('transform', (d, i) => `translate(0,${12 + i * 14})`);

    entries.append('line')
      .attr('x1', 0)
      .attr('x2', 10)
      .attr('y1', 6)
      .attr('y2', 6)
      .attr('stroke-width', 2)
      .attr('stroke', d => cscale(d));

    entries.append('text')
      .attr('x', 12)
      .attr('y', 9)
      .attr('font-family', 'Avenir Next')
      .attr('font-size', 10)
      .attr('font-weight', 400)
      .text(d => d);

    console.log('PREP', prep(data));

    // line series
    const paths = svg.selectAll('path.series')
      .data(prep(data), d => d.method)
      .join('path')
      .attr('d', d => line(d.points))
      .attr('stroke', d => cscale(d.method))
      .attr('stroke-width', 2)
      .attr('fill', 'none');

    this.update = (_props, _oldProps) => { // Matt - changed this function signature slightly to work with Idyll
      const bins = _props.bins;
      const grid = _props.binMethod;
      const data = _props.data[props.dataset];

      paths
        .data(prep(data, bins), d => d.method)
        .transition()
        .duration(1500)
        .attr('d', d => line(d.points));
    }
  }
  /**
   * End Jeff's code
   */
}

module.exports = TimeVisualizer;
