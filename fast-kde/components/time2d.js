

const React = require('react');
const D3Component = require('idyll-d3-component');
const d3 = Object.assign({}, require("d3"), require("d3-transition"), require("d3-selection"));

const sizeX = 600;
const sizeY = 400;

class TimeVisualizer2D extends D3Component {
  initialize(node, props) {
    if (!node) {
      return;
    }
    const el = node;
    const data = props.data[props.dataset];
    const bins = +props.bins;


    /**
     * Start Jeff's Code
     */

    const methods = ['Box', 'ExtBox', 'Deriche'];
    const width = 800;
    const height = 200;
    const margin = { top: 80, left: 50, right: 110, bottom: 50 };
    const titleSize = 11;
    const titleWeight = 600;

    function prep(data, bins) {
      const points =  data.filter(d => d.bins === bins);
      return Array.from(
        d3.group(points, d => d.method),
        ([method, points]) => ({ method, points })
      );
    }

    const xscale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.bandwidth)])
      .range([0, width]);
    const yscale = d3.scaleLog()
      .domain([1, 100])
      .range([height, 0]);
    const cscale = d3.scaleOrdinal()
      .domain(methods)
      .range(['#e15759', '#555555', '#4e79a7']);

    const line = d3.line()
      .x(d => xscale(d.bandwidth))
      .y(d => yscale(d.time));

    // clear any prior content
    el.innerHTML = '';

    // container svg
    const svg = d3.select(el)
      .append('svg')
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
          .ticks(3)
          .tickSize(width)
          .tickFormat(d => '')
      )
      .call(g => g.select('.domain').remove())
      .call(g => g.selectAll('.tick line')
        .attr('stroke-width', 1)
        .attr('stroke', '#ddd'));

    // x-axis
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xscale))
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
      .text('Bandwidth');

    // y-axis
    svg.append('g')
      .attr('transform', `translate(${width},0)`)
      .call(
        d3.axisRight(yscale).ticks(2).tickFormat(d => d + '')
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

    // line series
    const paths = svg.selectAll('path.series')
      .data(prep(data, bins), d => d.method)
      .join('path')
      .attr('d', d => line(d.points))
      .attr('stroke', d => cscale(d.method))
      .attr('stroke-width', 2)
      .attr('fill', 'none');

    this.update = (_props, _oldProps) => { // Matt - changed this function signature slightly to work with Idyll
      const bins = _props.bins;

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

module.exports = TimeVisualizer2D;
