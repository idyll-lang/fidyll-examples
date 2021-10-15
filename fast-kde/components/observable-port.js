


// main.variable(observer("bandwidth")).define("bandwidth", ["Generators", "viewof bandwidth"], (G, _) => G.input(_));
//   main.variable(observer()).define(["kdeIntro","points","bandwidth"], function(kdeIntro,points,bandwidth){return(
// kdeIntro(points, bandwidth)
// )});
//   main.variable(observer("kdeIntro")).define("kdeIntro", ["d3","height","domain","width","steps","html","margin","drawDataPoints","kde","drawPointDensities","drawDomainLine"], function(d3,height,domain,width,steps,html,margin,drawDataPoints,kde,drawPointDensities,drawDomainLine){return(

// )});
//   main.variable(observer()).define(["md"], function(md){return(
// md`<hr/>
// ## Binning`
// )});
//   main.variable(observer("viewof gridType")).define("viewof gridType", ["Inputs"], function(Inputs){return(
// Inputs.select(['Simple', 'Linear'], {value: 'Simple', label: 'Bin Type'})
// )});
//   main.variable(observer("gridType")).define("gridType", ["Generators", "viewof gridType"], (G, _) => G.input(_));
//   main.variable(observer("viewof binOffset")).define("viewof binOffset", ["Inputs"], function(Inputs){return(
// Inputs.range([0, 0.1], {step: 0.001, value: 0, label: 'Point Offset'})
// )});
//   main.variable(observer("binOffset")).define("binOffset", ["Generators", "viewof binOffset"], (G, _) => G.input(_));
//   main.variable(observer()).define(["kdeBinned","points","binOffset","gridType"], function(kdeBinned,points,binOffset,gridType){return(
// kdeBinned(points.map(p => p + binOffset), gridType, 10)
// )});
//   main.variable(observer("kdeBinned")).define("kdeBinned", ["domain","grid1d","d3","width","height","html","margin","drawDataPoints","drawBinDensity","drawBinTicks","drawDomainLine"], function(domain,grid1d,d3,width,height,html,margin,drawDataPoints,drawBinDensity,drawBinTicks,drawDomainLine){return(
// function kdeBinned(points, gridType, steps = 10) {
//   const step = (domain[1] - domain[0]) / steps;
//   const grid = grid1d(points, steps, domain, 0, gridType === 'Linear');

//   // scales
//   const xscale = d3.scaleLinear().domain(domain).range([0, width]);
//   const yscale = d3.scaleLinear().domain([0, 2]).range([height, 0]);

//   // container
//   const dom = html`<svg></svg>`;
//   const svg = d3.select(dom)
//       .attr('width', width + margin.left + margin.right)
//       .attr('height', height + margin.top + margin.bottom)
//     .append('g')
//       .attr('transform', `translate(${margin.left}, ${margin.top})`);

//   drawDataPoints(svg, points, xscale)
//   if (gridType !== 'None') {
//     drawBinDensity(svg, grid, step, 0, xscale, yscale);
//     drawBinTicks(svg, step, xscale, yscale);
//   }
//   drawDomainLine(svg);

//   return dom;
// }
// )});
//   main.variable(observer()).define(["md"], function(md){return(
// md`<hr/>
// ## Box Filter`
// )});
//   main.variable(observer("viewof boxBandwidth")).define("viewof boxBandwidth", ["Inputs"], function(Inputs){return(
// Inputs.range([0.05, 0.31], {step: 0.01, value: 0.15, label: 'Bandwidth'})
// )});
//   main.variable(observer("boxBandwidth")).define("boxBandwidth", ["Generators", "viewof boxBandwidth"], (G, _) => G.input(_));
//   main.variable(observer("viewof boxIter")).define("viewof boxIter", ["Inputs"], function(Inputs){return(
// Inputs.range([1, 3], {step: 1, value: 1, label: 'Box Iteration'})
// )});
//   main.variable(observer("boxIter")).define("boxIter", ["Generators", "viewof boxIter"], (G, _) => G.input(_));
//   main.variable(observer("viewof boxIndex")).define("viewof boxIndex", ["Inputs"], function(Inputs){return(
// Inputs.range([-2, 13], {step: 1, value: 0, label: 'Box Index'})
// )});
//   main.variable(observer("boxIndex")).define("boxIndex", ["Generators", "viewof boxIndex"], (G, _) => G.input(_));
//   main.variable(observer()).define(["kdeBox","points","boxBandwidth","boxIndex","boxIter"], function(kdeBox,points,boxBandwidth,boxIndex,boxIter){return(
// kdeBox(points, boxBandwidth, boxIndex, boxIter)
// )});
//   main.variable(observer("kdeBox")).define("kdeBox", ["domain","grid1d","boxFilter","scaleGrid","d3","width","height","html","margin","drawBoxSubplot"], function(domain,grid1d,boxFilter,scaleGrid,d3,width,height,html,margin,drawBoxSubplot){return(
// function kdeBox(points, bandwidth, boxIndex, boxIter, steps = 10) {
//   const K = 3;
//   const step = (domain[1] - domain[0]) / steps;
//   const sd = bandwidth / step;
//   const l = Math.sqrt((12 / K) * sd * sd + 1);
//   const r = Math.floor(0.5 * l);
//   const d = 2 * r + 1;

//   const grid1 = grid1d(points, steps + 2 * r, domain, r, false);
//   const grid2 = grid1.map(x => 0);
//   const n = grid1.length;
//   const cutoff = boxIndex < -1 ? 0 : (boxIndex + 1 + r);

//   const box = boxIndex < -1 ? null : {
//     index: boxIndex,
//     weights: Array.from({ length: d }, d => 1)
//   };

//   if (boxIter === 1) {
//     boxFilter(grid1, grid2, n, r, cutoff);
//     scaleGrid(grid2, 1 / d);
//   } else if (boxIter === 2) {
//     boxFilter(grid1, grid2, n, r);
//     boxFilter(grid2, grid1, n, r, cutoff);
//     scaleGrid(grid2, 1 / d);
//     scaleGrid(grid1, 1 / (d * d));
//   } else if (boxIter === 3) {
//     boxFilter(grid1, grid2, n, r);
//     boxFilter(grid2, grid1, n, r);
//     boxFilter(grid1, grid2, n, r, cutoff);
//     scaleGrid(grid2, 1 / (d * d * d));
//     scaleGrid(grid1, 1 / (d * d));
//   }

//   // scales
//   const xscale = d3.scaleLinear().domain([0, 1]).range([0, width]);
//   const yscale1 = d3.scaleLinear().domain([0, 2]).range([height/2 - 20, -20]);
//   const yscale2 = d3.scaleLinear().domain([0, 2]).range([height, height/2]);

//   // container
//   const dom = html`<svg></svg>`;
//   const svg = d3.select(dom)
//       .attr('width', width + margin.left + margin.right)
//       .attr('height', height + margin.top + margin.bottom)
//     .append('g')
//       .attr('transform', `translate(${margin.left}, ${margin.top})`);

//   drawBoxSubplot(svg, grid2, step, r, xscale, yscale2, boxIter % 2 ? null : box);
//   drawBoxSubplot(svg, grid1, step, r, xscale, yscale1, boxIter % 2 ? box : null);

//   return dom;
// }
// )});
//   main.variable(observer()).define(["md"], function(md){return(
// md`<hr/>
// ## Quantization Error`
// )});
//   main.variable(observer("viewof qerBandwidth")).define("viewof qerBandwidth", ["Inputs"], function(Inputs){return(
// Inputs.range([0.05, 0.30], {step: 0.01, value: 0.15, label: 'Bandwidth'})
// )});
//   main.variable(observer("qerBandwidth")).define("qerBandwidth", ["Generators", "viewof qerBandwidth"], (G, _) => G.input(_));
//   main.variable(observer()).define(["kdeBoxQuantization","points","qerBandwidth"], function(kdeBoxQuantization,points,qerBandwidth){return(
// kdeBoxQuantization(points, qerBandwidth, 4)
// )});
//   main.variable(observer("kdeBoxQuantization")).define("kdeBoxQuantization", ["domain","extBoxAlpha","grid1d","d3","width","height","html","margin","drawReferenceDensity","drawBoxFilter","drawBinAxis","drawLabel"], function(domain,extBoxAlpha,grid1d,d3,width,height,html,margin,drawReferenceDensity,drawBoxFilter,drawBinAxis,drawLabel){return(
// function kdeBoxQuantization(points, bandwidth, boxIndex, steps = 10) {
//   const K = 3;
//   const step = (domain[1] - domain[0]) / steps;
//   const sd = bandwidth / step;
//   const s2 = sd * sd;

//   const l = Math.sqrt((12 / K) * s2 + 1);
//   const rbox = Math.floor(0.5 * l);
//   const rebx = Math.floor(0.5 * l - 0.5);

//   const d = 2 * rebx + 1;
//   const a = extBoxAlpha(K, rebx, s2);
//   const c1 = a / (d + 2 * a);
//   const c2 = (1 - a) / (d + 2 * a);
//   const cs = c1 + c2;
//   const ch = 1.25;

//   const grid1 = grid1d(points, steps, domain, rebx, false);
//   const grid2 = grid1d(points, steps, domain, rbox, false);
//   const n = grid1.length;
//   const cutoff = boxIndex < -1 ? 0 : (boxIndex + 1 + rebx);

//   const box = boxIndex < -1 ? null : {
//     index: boxIndex,
//     weights: Array.from({length: 2 * rbox + 1}, _ => ch)
//   };
//   const ebx = boxIndex < -1 ? null : {
//     index: boxIndex,
//     weights: [ch * c1 / cs, ...Array.from({length: d}, _ => ch), ch * c1 / cs]
//   };

//   // scales
//   const xscale = d3.scaleLinear().domain([0, 1]).range([0, width]);
//   const yrange1 = [height, height / 2];
//   const yrange2 = [height / 2 - 20, -20];
//   const yscale1 = d3.scaleLinear().domain([0, 2]).range(yrange1);
//   const yscale2 = d3.scaleLinear().domain([0, 2]).range(yrange2);

//   // container
//   const dom = html`<svg></svg>`;
//   const svg = d3.select(dom)
//       .attr('width', width + margin.left + margin.right)
//       .attr('height', height + margin.top + margin.bottom)
//     .append('g')
//       .attr('transform', `translate(${margin.left}, ${margin.top})`);

//   drawReferenceDensity(svg, 0.45, bandwidth, 800, xscale, yrange1);
//   drawReferenceDensity(svg, 0.45, bandwidth, 800, xscale, yrange2);
//   drawBoxFilter(svg, step, xscale, yscale2, box);
//   drawBinAxis(svg, step, xscale, yscale2);
//   drawBoxFilter(svg, step, xscale, yscale1, ebx);
//   drawBinAxis(svg, step, xscale, yscale1);
//   drawLabel(svg, `σ = ${bandwidth.toFixed(2)}`);

//   return dom;
// }
// )});
//   main.variable(observer()).define(["md"], function(md){return(
// md`<hr/>
// ## Extended Box Filter`
// )});
//   main.variable(observer("viewof ebxBandwidth")).define("viewof ebxBandwidth", ["Inputs"], function(Inputs){return(
// Inputs.range([0.05, 0.31], {step: 0.01, value: 0.15, label: 'Bandwidth'})
// )});
//   main.variable(observer("ebxBandwidth")).define("ebxBandwidth", ["Generators", "viewof ebxBandwidth"], (G, _) => G.input(_));
//   main.variable(observer("viewof ebxIter")).define("viewof ebxIter", ["Inputs"], function(Inputs){return(
// Inputs.range([1, 3], {step: 1, value: 1, label: 'Box Iteration'})
// )});
//   main.variable(observer("ebxIter")).define("ebxIter", ["Generators", "viewof ebxIter"], (G, _) => G.input(_));
//   main.variable(observer("viewof ebxIndex")).define("viewof ebxIndex", ["Inputs"], function(Inputs){return(
// Inputs.range([-2, 10], {step: 1, value: 0, label: 'Box Index'})
// )});
//   main.variable(observer("ebxIndex")).define("ebxIndex", ["Generators", "viewof ebxIndex"], (G, _) => G.input(_));
//   main.variable(observer()).define(["kdeExtBox","points","ebxBandwidth","ebxIndex","ebxIter"], function(kdeExtBox,points,ebxBandwidth,ebxIndex,ebxIter){return(
// kdeExtBox(points, ebxBandwidth, ebxIndex, ebxIter, 10)
// )});
//   main.variable(observer("kdeExtBox")).define("kdeExtBox", ["domain","grid1d","extBoxFilter","d3","width","height","html","margin","drawBoxSubplot"], function(domain,grid1d,extBoxFilter,d3,width,height,html,margin,drawBoxSubplot){return(
// function kdeExtBox(points, bandwidth, boxIndex, boxIter, steps = 10) {
//   const K = 3;
//   const step = (domain[1] - domain[0]) / steps;
//   const sd = bandwidth / step;
//   const s2 = sd * sd;
//   const r = Math.floor(0.5 * Math.sqrt((12 / K) * s2 + 1) - 0.5);
//   const d = 2 * r + 1;
//   const a = d * (r * (r + 1) - 3 * s2 / K) /
//             (6 * (s2 / K - (r + 1) * (r + 1)));
//   const c1 = a / (d + 2 * a);
//   const c2 = (1 - a) / (d + 2 * a);
//   const cs = c1 + c2;

//   const grid1 = grid1d(points, steps + 2*r, domain, r, false);
//   const grid2 = grid1.map(x => 0);
//   const n = grid1.length;
//   const cutoff = boxIndex < -1 ? 0 : (boxIndex + 1 + r);

//   const box = boxIndex < -1 ? null : {
//     index: boxIndex,
//     weights: [c1 / cs, ...Array.from({length: d}, d => 1), c1 / cs]
//   };

//   if (boxIter === 1) {
//     extBoxFilter(grid1, grid2, n, r, c1, c2, cutoff);
//   } else if (boxIter === 2) {
//     extBoxFilter(grid1, grid2, n, r, c1, c2);
//     extBoxFilter(grid2, grid1, n, r, c1, c2, cutoff);
//   } else if (boxIter === 3) {
//     extBoxFilter(grid1, grid2, n, r, c1, c2);
//     extBoxFilter(grid2, grid1, n, r, c1, c2);
//     extBoxFilter(grid1, grid2, n, r, c1, c2, cutoff);
//   }

//   // scales
//   const xscale = d3.scaleLinear().domain([0, 1]).range([0, width]);
//   const yscale1 = d3.scaleLinear().domain([0, 2]).range([height, height/2]);
//   const yscale2 = d3.scaleLinear().domain([0, 2]).range([height/2 - 20, -20]);

//   // container
//   const dom = html`<svg></svg>`;
//   const svg = d3.select(dom)
//       .attr('width', width + margin.left + margin.right)
//       .attr('height', height + margin.top + margin.bottom)
//     .append('g')
//       .attr('transform', `translate(${margin.left}, ${margin.top})`);

//   drawBoxSubplot(svg, grid2, step, r, xscale, yscale2, boxIter % 2 ? null : box);
//   drawBoxSubplot(svg, grid1, step, r, xscale, yscale1, boxIter % 2 ? box : null);

//   return dom;
// }
// )});
//   main.variable(observer()).define(["md"], function(md){return(
// md`<hr/>
// ## Deriche Approximation`
// )});
//   main.variable(observer("viewof derMode")).define("viewof derMode", ["Inputs"], function(Inputs){return(
// Inputs.select(['Causal', 'Anticausal', 'Both'], {value: 'Causal', label: 'Filters'})
// )});
//   main.variable(observer("derMode")).define("derMode", ["Generators", "viewof derMode"], (G, _) => G.input(_));
//   main.variable(observer("viewof derBandwidth")).define("viewof derBandwidth", ["Inputs"], function(Inputs){return(
// Inputs.range([0.05, 0.31], {step: 0.01, value: 0.15, label: 'Bandwidth'})
// )});
//   main.variable(observer("derBandwidth")).define("derBandwidth", ["Generators", "viewof derBandwidth"], (G, _) => G.input(_));
//   main.variable(observer()).define(["kdeDeriche","derBandwidth","derMode"], function(kdeDeriche,derBandwidth,derMode){return(
// kdeDeriche([0.476], derBandwidth, derMode, 20)
// )});
//   main.variable(observer()).define(["kdeDeriche","derBandwidth","derMode"], function(kdeDeriche,derBandwidth,derMode){return(
// kdeDeriche([0.25, 0.75], derBandwidth, derMode, 20)
// )});
//   main.variable(observer("kdeDeriche")).define("kdeDeriche", ["domain","grid1d","derichePrep","dericheConv","d3","width","height","html","margin","drawBinDensity","drawBinAxis","drawDataPoints","drawPointDensities"], function(domain,grid1d,derichePrep,dericheConv,d3,width,height,html,margin,drawBinDensity,drawBinAxis,drawDataPoints,drawPointDensities){return(
// function kdeDeriche(points, bandwidth, mode, steps) {
//   const code = {'Causal': 1, 'Anticausal': -1}[mode] || 0;
//   const step = (domain[1] - domain[0]) / steps;
//   const data = grid1d(points, steps, domain, 0, false);
//   const prep = derichePrep(bandwidth / step, 4);
//   const grid = dericheConv(prep, data, steps, code);

//   // scales
//   const xscale = d3.scaleLinear().domain([0, 1]).range([0, width]);
//   const yscale = d3.scaleLinear().domain([0, 0.2]).range([height, 0]);

//   // container
//   const dom = html`<svg></svg>`;
//   const svg = d3.select(dom)
//       .attr('width', width + margin.left + margin.right)
//       .attr('height', height + margin.top + margin.bottom)
//     .append('g')
//       .attr('transform', `translate(${margin.left}, ${margin.top})`);

//   if (mode !== 'None') {
//     drawBinDensity(svg, grid, step, 0, xscale, yscale);
//   }
//   drawBinAxis(svg, step, xscale, yscale);
//   drawDataPoints(svg, points, xscale);
//   drawPointDensities(svg, points, bandwidth, 800, xscale, [0, 0.005]);

//   if (mode === 'Mix') {
//     svg.selectAll('rect')
//       .filter((d, i) => i < (steps / 2 - 1))
//       .attr('fill', '#aaa');
//   }

//   return dom;
// }
// )});
//   main.variable(observer()).define(["md"], function(md){return(
// md`<hr/>
// ## Shared Parameters`
// )});
//   main.variable(observer("domain")).define("domain", function(){return(
// [0, 1]
// )});
//   main.variable(observer("points")).define("points", function(){return(
// [0.18, 0.52, 0.57, 0.68]
// )});
//   main.variable(observer("width")).define("width", function(){return(
// 800
// )});
//   main.variable(observer("height")).define("height", function(){return(
// 200
// )});
//   main.variable(observer("steps")).define("steps", function(){return(
// 800
// )});
//   main.variable(observer("margin")).define("margin", function(){return(
// { top: 5, left: 81, right: 81, bottom: 40 }
// )});
//   main.variable(observer("pointOffset")).define("pointOffset", function(){return(
// 20
// )});
//   main.variable(observer("pointRadius")).define("pointRadius", function(){return(
// 5
// )});
//   main.variable(observer("axisColor")).define("axisColor", function(){return(
// '#000'
// )});
//   main.variable(observer("axisStrokeWidth")).define("axisStrokeWidth", function(){return(
// 1
// )});
//   main.variable(observer()).define(["md"], function(md){return(
// md`<hr/>
// ## Appendix`
// )});



