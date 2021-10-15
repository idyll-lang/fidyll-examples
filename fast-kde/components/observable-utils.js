
const kde = require('fast-kde/dist/fast-kde.min.js');
const d3 = Object.assign({}, require("d3"), require("d3-transition"), require("d3-selection"));


function grid1d(points, size, domain, offset = 0, interpolate = true) {
  const [x0, x1] = domain;
  const scaleX = size / (x1 - x0);
  return interpolate
    ? kde.grid1d_linear(points, size, x0, scaleX, offset)
    : kde.grid1d_simple(points, size, x0, scaleX, offset);
}

function derichePrep(sigma) {
  // compute causal filter coefficients
  const a = new Float64Array(5);
  const bc = new Float64Array(4);
  causal_coeff(a, bc, sigma);

  // numerator coefficients of the anticausal filter
  const ba = Float64Array.of(
    0,
    bc[1] - a[1] * bc[0],
    bc[2] - a[2] * bc[0],
    bc[3] - a[3] * bc[0],
    -a[4] * bc[0]
  );

  // impulse response sums
  const accum_denom = 1.0 + a[1] + a[2] + a[3] + a[4];
  const sum_causal = (bc[0] + bc[1] + bc[2] + bc[3]) / accum_denom;
  const sum_anticausal = (ba[1] + ba[2] + ba[3] + ba[4]) / accum_denom;

  // coefficients object
  return {
    sigma,
    K: 4,
    max_iter: Math.ceil(10 * sigma),
    a,
    b_causal: bc,
    b_anticausal: ba,
    sum_causal,
    sum_anticausal
  };
}

function causal_coeff(a_out, b_out, sigma) {
  const K = 4;

  const alpha = Float64Array.of(
    0.84, 1.8675,
    0.84, -1.8675,
    -0.34015, -0.1299,
    -0.34015, 0.1299
  );

  const x1 = Math.exp(-1.783 / sigma);
  const x2 = Math.exp(-1.723 / sigma);
  const y1 = 0.6318 / sigma;
  const y2 = 1.997 / sigma;
  const beta = Float64Array.of(
    -x1 * Math.cos( y1), x1 * Math.sin( y1),
    -x1 * Math.cos(-y1), x1 * Math.sin(-y1),
    -x2 * Math.cos( y2), x2 * Math.sin( y2),
    -x2 * Math.cos(-y2), x2 * Math.sin(-y2)
  );

  const denom = sigma * 2.50662827463100050241576528481104525;

  // Initialize b/a = alpha[0] / (1 + beta[0] z^-1)
  const b = Float64Array.of(alpha[0], alpha[1], 0, 0, 0, 0, 0, 0);
  const a = Float64Array.of(1, 0, beta[0], beta[1], 0, 0, 0, 0, 0, 0);

  let j, k;

  for (k = 2; k < 8; k += 2) {
    // Add kth term, b/a += alpha[k] / (1 + beta[k] z^-1)
    b[k]     = beta[k] * b[k - 2] - beta[k + 1] * b[k - 1];
    b[k + 1] = beta[k] * b[k - 1] + beta[k + 1] * b[k - 2];
    for (j = k - 2; j > 0; j -= 2) {
      b[j]     += beta[k] * b[j - 2] - beta[k + 1] * b[j - 1];
      b[j + 1] += beta[k] * b[j - 1] + beta[k + 1] * b[j - 2];
    }
    for (j = 0; j <= k; j += 2) {
      b[j]     += alpha[k] * a[j]     - alpha[k + 1] * a[j + 1];
      b[j + 1] += alpha[k] * a[j + 1] + alpha[k + 1] * a[j];
    }

    a[k + 2] = beta[k] * a[k]     - beta[k + 1] * a[k + 1];
    a[k + 3] = beta[k] * a[k + 1] + beta[k + 1] * a[k];
    for (j = k; j > 0; j -= 2) {
      a[j]     += beta[k] * a[j - 2] - beta[k + 1] * a[j - 1];
      a[j + 1] += beta[k] * a[j - 1] + beta[k + 1] * a[j - 2];
    }
  }

  for (k = 0; k < K; ++k) {
    j = k << 1;
    b_out[k] = b[j] / denom;
    a_out[k + 1] = a[j + 2];
  }
}


function initZeroPad(dest, src, N, stride, b, p, a, q, sum, h) {
  const stride_N = Math.abs(stride) * N;
  const off = stride < 0 ? stride_N + stride : 0;
  let i, n, m;

  // Compute the first q taps of the impulse response, h_0, ..., h_{q-1}
  for (n = 0; n < q; ++n) {
    h[n] = (n <= p) ? b[n] : 0;
    for (m = 1; m <= q && m <= n; ++m) {
      h[n] -= a[m] * h[n - m];
    }
  }

  // Compute dest_m = sum_{n=1}^m h_{m-n} src_n, m = 0, ..., q-1
  // Note: q == 4
  for (m = 0; m < q; ++m) {
    for (dest[m] = 0, n = 1; n <= m; ++n) {
      i = off + stride * n;
      if (i >= 0 && i < stride_N) {
        dest[m] += h[m - n] * src[i];
      }
    }
  }

  // dest_m = dest_m + h_{n+m} src_{-n}
  const cur = src[off];
  if (cur > 0) {
    for (m = 0; m < q; ++m) {
      dest[m] += h[m] * cur;
    }
  }

  return;
}


function dericheConv(
  c, src, N,
  mode = 0,
  stride = 1,
  y_causal = new Float64Array(N),
  y_anticausal = new Float64Array(N),
  h = new Float64Array(5),
  d = y_causal
) {
  const stride_2 = stride * 2;
  const stride_3 = stride * 3;
  const stride_4 = stride * 4;
  const stride_N = stride * N;
  let i, n;

  // Initialize causal filter on the left boundary.
  initZeroPad(
    y_causal, src, N, stride,
    c.b_causal, 3, c.a, 4, c.sum_causal, h, c.sigma
  );

  // The following filters the interior samples according to the filter
  // order 4. The loop below implements the pseudocode
  // For n = K, ..., N - 1,
  //   y^+(n) = \sum_{k=0}^{K-1} b^+_k src(n - k)
  //          - \sum_{k=1}^K a_k y^+(n - k)
  // Variable i tracks the offset to the nth sample of src, it is
  // updated together with n such that i = stride * n.
  for (n = 4, i = stride_4; n < N; ++n, i += stride) {
    y_causal[n] = c.b_causal[0] * src[i]
      + c.b_causal[1] * src[i - stride]
      + c.b_causal[2] * src[i - stride_2]
      + c.b_causal[3] * src[i - stride_3]
      - c.a[1] * y_causal[n - 1]
      - c.a[2] * y_causal[n - 2]
      - c.a[3] * y_causal[n - 3]
      - c.a[4] * y_causal[n - 4];
  }

  // Initialize anticausal filter on the right boundary.
  initZeroPad(
    y_anticausal, src, N, -stride,
    c.b_anticausal, 4, c.a, 4, c.sum_anticausal, h, c.sigma
  );

  // Similar to the causal filter code above, the following implements
  // the pseudocode
  // For n = K, ..., N - 1,
  //   y^-(n) = \sum_{k=1}^K b^-_k src(N - n - 1 - k)
  //          - \sum_{k=1}^K a_k y^-(n - k)
  // Variable i is updated such that i = stride * (N - n - 1).
  for (n = 4, i = stride_N - stride * 5; n < N; ++n, i -= stride) {
    y_anticausal[n] = c.b_anticausal[1] * src[i + stride]
      + c.b_anticausal[2] * src[i + stride_2]
      + c.b_anticausal[3] * src[i + stride_3]
      + c.b_anticausal[4] * src[i + stride_4]
      - c.a[1] * y_anticausal[n - 1]
      - c.a[2] * y_anticausal[n - 2]
      - c.a[3] * y_anticausal[n - 3]
      - c.a[4] * y_anticausal[n - 4];
  }

  // Sum the causal and anticausal responses to obtain the final result.
  if (mode === 0) {
    for (n = 0, i = 0; n < N; ++n, i += stride) {
      d[i] = y_causal[n] + y_anticausal[N - n - 1];
    }
  } else if (mode > 0) {
    for (n = 0, i = 0; n < N; ++n, i += stride) {
      d[i] = y_causal[n];
    }
  } else if (mode < 0) {
    for (n = 0, i = 0; n < N; ++n, i += stride) {
      d[i] = y_anticausal[N - n - 1];
    }
  }

  return d;
}


function boxFilter(grid, dest, n, r, max = Infinity) {
  // helpful boundaries
  const l = n - r;
  const s = r + 1;

  let a = 0; // accumulator

  // initialize accumulator and window
  for (let i = 0; i < r && i < max; ++i) {
    a += grid[i];
  }

  // handle start boundary values
  for (let i = 0; i < s && i < max; ++i) {
    a += grid[i + r];
		dest[i] = a;
  }

  // set interior values
  for (let i = s; i < l && i < max; ++i) {
    a += grid[i + r] - grid[i - s];
		dest[i] = a;
  }

  // handle end boundary values
  for (let i = l; i < n && i < max; ++i) {
    a -= grid[i - s];
		dest[i] = a;
  }

  for (let i = max; i < n; ++i) {
    dest[i] = 0;
  }
}

function extBoxFilter(src, dest, n, r, c1, c2, max = Infinity) {
  const s = r + 1;
  const l = n - s;

  // initialize accumulator
  let a = 0;
  let i = 0;
  for (; i < s; ++i) {
    a += src[i];
  }
  a = (c1 + c2) * a + c1 * src[s];

  // handle starting boundary values
  dest[0] = a;
  for (i = 1; i < s && i < max; ++i) {
    a += c1 * src[(i + s)] + c2 * src[(i + r)];
    dest[i] = a;
  }

  if (i < max) {
    // transition to interior
    a += c1 * src[(s >> 1)] + c2 * (src[(s + r)] - src[0]);
    dest[s] = a;
  }

  // handle interior values
  for (i = s + 1; i < l && i < max; ++i) {
    a += c1 * (src[i + s] - src[i - s - 1])
      +  c2 * (src[i + r] - src[i - s]);
    dest[i] = a;
  }

  if (i < max) {
    // transition to end boundary
    a += -c1 * src[i - s - 1] + c2 * (src[s] - src[i - s]);
    dest[i] = a;
    i += 1;
  }

  // handle end boundary values
  for (; i < n && i < max; ++i) {
    a -= c1 * src[i - s - 1] + c2 * src[i - s];
    dest[i] = a;
  }

  for (let i = max; i < n; ++i) {
    dest[i] = 0;
  }

  return dest;
}

function extBoxAlpha(K, r, s2) {
  const d = 2 * r + 1;
  return d * (r * (r + 1) - 3 * s2 / K) / (6 * (s2 / K - (r + 1) * (r + 1)));
}


function reifyBox(index, weights) {
  const start = index - Math.floor(weights.length / 2);
  const out = weights.map((weight, i) => ({ index: start + i, weight }));
  out.push({ index: start + weights.length, weight: 0 });
  return out;
}


function scaleGrid(grid, scalar) {
  for (let i = 0; i < grid.length; ++i) {
    grid[i] *= scalar;
  }
}


function drawLabel(svg, text) {
  svg.append('text')
    .attr('font-family', 'Avenir Next')
    .attr('font-size', '18px')
    .attr('font-weight', 400)
    .attr('x', 360)
    .attr('y', height + 35)
    .attr('text-anchor', 'middle')
    .text(text);
}

function drawDomainLine(svg, y = height) {
  svg.append('line')
    .attr('x1', 0)
    .attr('x2', width)
    .attr('y1', y)
    .attr('y2', y)
    .attr('stroke', axisColor)
    .attr('stroke-width', axisStrokeWidth);
}



function drawDataPoints(svg, points, xscale) {
  svg.selectAll('circle')
    .data(points)
    .join('circle')
    .attr('cx', d => xscale(d))
    .attr('cy', height + pointOffset)
    .attr('r', pointRadius);
}

function drawBoxFilter(svg, step, xscale, yscale, box) {
  const boxArea = d3.area()
    .curve(d3.curveStepAfter)
    .x(b => xscale(domain[0] + b.index * step))
    .y0(b => yscale(b.weight))
    .y1(yscale(0));

  const boxData = [ reifyBox(box.index, box.weights) ];

  // box filter
  svg.selectAll('path.box')
    .data(boxData)
    .join('path')
    .attr('d', b => boxArea(b))
    .attr('fill', 'steelblue')
    .attr('fill-opacity', 0.1)
    .attr('stroke', 'steelblue');
}


function drawBinTicks(svg, step, xscale, yscale) {
  svg.selectAll('line.grid')
    .data(d3.range(0, 1 + step, step))
    .join('line')
    .attr('x1', d => xscale(d) | 0)
    .attr('x2', d => xscale(d) | 0)
    .attr('y1', yscale(0))
    .attr('y2', yscale(0) + 10)
    .attr('stroke', axisColor)
    .attr('stroke-width', axisStrokeWidth);
}



function drawBinAxis(svg, step, xscale, yscale) {
  drawBinTicks(svg, step, xscale, yscale);
  drawDomainLine(svg, yscale(0));
}


function drawBinDensity(svg, grid, step, offset, xscale, yscale) {
  svg.selectAll('rect.bin')
    .data(grid)
    .join('rect')
    .attr('x', (d, i) => 1 + (xscale(domain[0] + (i - offset) * step) | 0))
    .attr('width', ((width / (grid.length - 2 * offset)) | 0) - 1)
    .attr('y', d => yscale(d))
    .attr('height', d => yscale(0) - yscale(d))
    .attr('fill', '#ddd');
}


function drawBoxSubplot(svg, grid, step, offset, xscale, yscale, box) {
  drawBinDensity(svg, grid, step, offset, xscale, yscale);
  if (box) drawBoxFilter(svg, step, xscale, yscale, box);
  drawBinAxis(svg, step, xscale, yscale);
}

function drawPointDensities(svg, points, bandwidth, steps, xscale, ydomain) {
  const yscale = d3.scaleLinear().domain(ydomain).range([height, 0]);
  const domain = xscale.domain();
  // shapes
  const line = d3.line()
    .x((d, i) => xscale(domain[0] + (domain[1] - domain[0]) * i / steps))
    .y(d => yscale(d));

  svg.selectAll('path.point')
    .data(points.map(p => kde.kdeCDF1d([p], [0, 1], steps, bandwidth)))
    .join('path')
    .attr('d', d => line(d))
    .attr('fill', 'none')
    .attr('stroke', '#646')
    .attr('stroke-width', axisStrokeWidth);
}

function drawReferenceDensity(svg, point, bandwidth, steps, xscale, yrange) {
  const domain = xscale.domain();
  const density = kde.kdeCDF1d([point], [0, 1], steps, bandwidth);
  const dscale = d3.scaleLinear().domain([0, 1.6 * d3.max(density)]).range(yrange);
  const area = d3.area()
    .x((d, i) => xscale(domain[0] + (domain[1] - domain[0]) * i / steps))
    .y0(dscale(0))
    .y1(d => dscale(d));

  // total density
  svg.selectAll('path.total')
    .data([density])
    .join('path')
    .attr('d', d => area(d))
    .attr('fill', '#ddd');
}

const domain =  [0, 1];
const points = [0.18, 0.52, 0.57, 0.68];
const width = 800;
const height = 200;
const steps = 800;
const margin = {top: 5, left: 81, right: 81, bottom: 40};
const pointOffset = 20;
const pointRadius = 5;
const axisColor = "#000";
const axisStrokeWidth = 1;


export {
  domain,
  points,
  width,
  height,
  steps,
  margin,
  pointOffset,
  pointRadius,
  axisColor,
  axisStrokeWidth,
  kde,
  grid1d,
  derichePrep,
  causal_coeff,
  initZeroPad,
  dericheConv,
  boxFilter,
  extBoxFilter,
  extBoxAlpha,
  reifyBox,
  scaleGrid,
  drawLabel,
  drawDomainLine,
  drawDataPoints,
  drawBoxFilter,
  drawBinTicks,
  drawBinAxis,
  drawBinDensity,
  drawBoxSubplot,
  drawPointDensities,
  drawReferenceDensity
}