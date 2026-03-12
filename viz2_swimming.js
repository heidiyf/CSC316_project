/* viz2_swimming.js — Swimming pool lanes visualization
 * CSC316 Final Project
 * Requires: COLORS, fmt, safeNode, showTooltip, moveTooltip, hideTooltip
 * DOM IDs:  #swimUSA  #swimCHN  #yearSlider  #swimYearLabel
 *           #gapText  #swimUSALabel  #swimCHNLabel
 */

// 2) Swimming lanes pools (athlete-medals)
// ---------------------------
function renderSwimmingPools(data) {
  const hostUSA = safeNode('#swimUSA');
  const hostCHN = safeNode('#swimCHN');
  const slider = document.getElementById('yearSlider');
  const yearLabel = document.getElementById('swimYearLabel');
  const gapText = document.getElementById('gapText');
  const usaLabel = document.getElementById('swimUSALabel');
  const chnLabel = document.getElementById('swimCHNLabel');

  if (!hostUSA || !hostCHN || !slider || !yearLabel || !gapText || !usaLabel || !chnLabel) return;

  hostUSA.selectAll('*').remove();
  hostCHN.selectAll('*').remove();

  const swimRows = data.filter(d => d.Sport === 'Swimming' && d.Medal !== 'No medal' && (d.NOC === 'USA' || d.NOC === 'CHN'));
  const years = d3.sort(Array.from(new Set(swimRows.map(d => d.Year))));

  // slider: use index
  slider.min = 0;
  slider.max = Math.max(0, years.length - 1);
  slider.step = 1;
  slider.value = years.length - 1;

  const containerWidth = Math.max(900, Math.floor(hostUSA.node().getBoundingClientRect().width || 1200));
  const W = containerWidth;
  const H = 250;

  const svgUSA = hostUSA.append('svg').attr('width', W).attr('height', H);
  const svgCHN = hostCHN.append('svg').attr('width', W).attr('height', H);

  drawPoolFrame(svgUSA, { noc: 'USA' });
  drawPoolFrame(svgCHN, { noc: 'CHN' });

  function update() {
    const y = years[+slider.value] ?? years[years.length - 1];
    yearLabel.textContent = y;

    const usa = swimRows.filter(d => d.Year === y && d.NOC === 'USA');
    const chn = swimRows.filter(d => d.Year === y && d.NOC === 'CHN');

    const usaCount = usa.length;
    const chnCount = chn.length;

    const gap = usaCount - chnCount;
    const leader = gap === 0 ? 'Tied' : (gap > 0 ? 'USA' : 'CHN');
    const absGap = Math.abs(gap);

    gapText.textContent = `Gap (Swimming medals) in ${y}: ${leader === 'Tied' ? 'tied' : (leader + ' leads by ' + absGap)}.`;
    usaLabel.textContent = `USA • Swimming medals: ${usaCount}`;
    chnLabel.textContent = `CHN • Swimming medals: ${chnCount}`;

    drawPoolMedals(svgUSA, usa, { noc: 'USA' });
    drawPoolMedals(svgCHN, chn, { noc: 'CHN' });
  }

  slider.addEventListener('input', update);
  update();
}

function drawPoolFrame(svg, { noc }) {
  const W = +svg.attr('width');
  const H = +svg.attr('height');

  const g = svg.append('g');

  const deckW = 86;
  const startW = 16;
  const poolX = deckW + startW;
  const poolY = 20;
  const poolW = W - poolX - 12;
  const poolH = H - poolY - 22;

  // deck panel
  g.append('rect')
    .attr('x', 8).attr('y', poolY)
    .attr('width', deckW).attr('height', poolH)
    .attr('rx', 14).attr('ry', 14)
    .attr('fill', '#2a78c9')
    .attr('opacity', 0.95);

  // start strip
  g.append('rect')
    .attr('x', 8 + deckW).attr('y', poolY)
    .attr('width', startW).attr('height', poolH)
    .attr('fill', '#0f4a83')
    .attr('opacity', 0.95);

  // pool body (gradient)
  const defs = svg.append('defs');
  const gradId = `poolGrad_${noc}`;
  const grad = defs.append('linearGradient')
    .attr('id', gradId)
    .attr('x1', '0%').attr('y1', '0%')
    .attr('x2', '100%').attr('y2', '0%');
  grad.append('stop').attr('offset', '0%').attr('stop-color', '#bfe8ff');
  grad.append('stop').attr('offset', '100%').attr('stop-color', '#a8ddff');

  g.append('rect')
    .attr('x', poolX).attr('y', poolY)
    .attr('width', poolW).attr('height', poolH)
    .attr('rx', 18).attr('ry', 18)
    .attr('fill', `url(#${gradId})`)
    .attr('stroke', '#8fd0ff')
    .attr('stroke-width', 2);

  // subtle water shimmer
  for (let i = 0; i < 10; i++) {
    g.append('path')
      .attr('d', `M ${poolX + 30 + i * 50} ${poolY + 18} c 22 10 42 10 64 0`)
      .attr('fill', 'none')
      .attr('stroke', 'rgba(255,255,255,0.25)')
      .attr('stroke-width', 2)
      .attr('opacity', 0.35);
  }

  // lane ropes (8 lanes => 9 rope lines including edges)
  const lanes = 8;
  const laneH = poolH / lanes;
  const ropeColors = ['#ff4b3a', '#f0c419', '#2f7de1'];

  for (let j = 0; j <= lanes; j++) {
    const yy = poolY + j * laneH;
    const dots = d3.range(0, Math.floor(poolW / 14));
    g.selectAll(`.rope-${noc}-${j}`)
      .data(dots)
      .enter()
      .append('circle')
      .attr('cx', d => poolX + 8 + d * 14)
      .attr('cy', yy)
      .attr('r', 2.3)
      .attr('fill', d => ropeColors[d % ropeColors.length])
      .attr('opacity', 0.75);
  }

  // lane numbers + blocks
  const laneCenters = d3.range(1, lanes + 1).map(i => poolY + (i - 0.5) * laneH);

  // START label
  g.append('text')
    .attr('x', 26)
    .attr('y', poolY + poolH / 2)
    .attr('transform', `rotate(-90, ${26}, ${poolY + poolH / 2})`)
    .attr('fill', 'white')
    .attr('font-weight', 800)
    .attr('letter-spacing', '3px')
    .attr('font-size', 14)
    .text('START');

  // flag (small, not blocking)
  drawFlag(g, { noc, x: 14, y: poolY + 8, w: 34, h: 22, opacity: 0.95 });

  laneCenters.forEach((cy, i) => {
    // block base
    g.append('rect')
      .attr('x', 20)
      .attr('y', cy - 10)
      .attr('width', 58)
      .attr('height', 20)
      .attr('rx', 10)
      .attr('fill', '#ffffff')
      .attr('opacity', 0.95);

    // red cap
    g.append('rect')
      .attr('x', 20)
      .attr('y', cy - 10)
      .attr('width', 58)
      .attr('height', 8)
      .attr('rx', 10)
      .attr('fill', '#d64035')
      .attr('opacity', 0.95);

    g.append('text')
      .attr('x', 48)
      .attr('y', cy + 5)
      .attr('text-anchor', 'middle')
      .attr('fill', '#222')
      .attr('font-weight', 800)
      .attr('font-size', 12)
      .text(String(i + 1));
  });

  // legend (G/S/B)
  const legend = g.append('g').attr('transform', `translate(${poolX + poolW - 120}, ${poolY - 2})`);
  const items = [
    { k: 'G', medal: 'Gold' },
    { k: 'S', medal: 'Silver' },
    { k: 'B', medal: 'Bronze' },
  ];
  items.forEach((it, idx) => {
    const gg = legend.append('g').attr('transform', `translate(${idx * 36},0)`);
    gg.append('circle').attr('cx', 0).attr('cy', 0).attr('r', 6).attr('fill', MEDAL_COLOR[it.medal]).attr('stroke', 'rgba(0,0,0,0.45)');
    gg.append('text').attr('x', 10).attr('y', 4).attr('fill', COLORS.muted).attr('font-size', 12).text(it.k);
  });

  // store layout in svg for medal placement
  svg.node().__pool = { poolX, poolY, poolW, poolH, lanes, laneH };
}

function drawPoolMedals(svg, medals, { noc }) {
  const layout = svg.node().__pool;
  if (!layout) return;

  const { poolX, poolY, poolW, poolH, lanes, laneH } = layout;

  // group existing
  let gMedals = svg.select('g.medals');
  if (gMedals.empty()) gMedals = svg.append('g').attr('class', 'medals');

  const lanePrefs = {
    Gold:   [3, 4, 2, 5, 1, 6, 0, 7],
    Silver: [3, 4, 2, 5, 1, 6, 0, 7],
    Bronze: [1, 6, 2, 5, 0, 7, 3, 4]
  };

  // Center-lane emphasis rule:
  // cycle each medal type through its preferred lane order using lane = pref[i % 8].
  const byMedal = d3.group(
    medals.filter(d => d.Medal === 'Gold' || d.Medal === 'Silver' || d.Medal === 'Bronze'),
    d => d.Medal
  );
  const assigned = [];
  MEDAL_ORDER.forEach(medal => {
    const pref = lanePrefs[medal];
    const arr = (byMedal.get(medal) || []).slice().sort((a, b) => {
      const ah = hashString(`${a.Name}|${a.Event}|${a.Year}|${a.Medal}`);
      const bh = hashString(`${b.Name}|${b.Event}|${b.Year}|${b.Medal}`);
      if (ah !== bh) return ah - bh;
      if (a.Event !== b.Event) return String(a.Event).localeCompare(String(b.Event));
      return String(a.Name).localeCompare(String(b.Name));
    });
    arr.forEach((d, i) => {
      const lane = pref[i % 8] + 1; // pref is 0-indexed
      assigned.push({ ...d, __lane: lane });
    });
  });

  // within each lane, keep G->S->B and deterministic tie-breakers
  const byLane = d3.group(assigned, d => d.__lane);
  const medalRank = { Gold: 0, Silver: 1, Bronze: 2 };

  const dots = [];
  for (let lane = 1; lane <= lanes; lane++) {
    const arr = (byLane.get(lane) || []).slice().sort((a, b) => {
      const mr = (medalRank[a.Medal] ?? 9) - (medalRank[b.Medal] ?? 9);
      if (mr !== 0) return mr;
      const ah = hashString(`${a.Name}|${a.Event}|${a.Year}|${a.Medal}`);
      const bh = hashString(`${b.Name}|${b.Event}|${b.Year}|${b.Medal}`);
      if (ah !== bh) return ah - bh;
      return String(a.Name).localeCompare(String(b.Name));
    });

    // strict grid: same y per lane center, same x step across lanes
    const colStep = 16;
    const startX = poolX + 24;

    arr.forEach((d, i) => {
      const cx = startX + i * colStep;

      const laneCenterY = poolY + (lane - 0.5) * laneH;
      const cy = laneCenterY;

      dots.push({
        key: `${d.Year}-${d.Name}-${d.Event}-${d.Medal}-${i}`,
        cx,
        cy,
        medal: d.Medal,
        title: `${d.Medal} — ${d.Event}`
      });
    });
  }

  const sel = gMedals.selectAll('circle.medalDot')
    .data(dots, d => d.key);

  sel.exit().transition().duration(220).attr('opacity', 0).remove();

  sel.enter().append('circle')
    .attr('class', 'medalDot')
    .attr('cx', d => d.cx)
    .attr('cy', d => d.cy)
    .attr('r', 0)
    .attr('fill', d => MEDAL_COLOR[d.medal] || '#ccc')
    .attr('stroke', 'rgba(0,0,0,0.55)')
    .attr('stroke-width', 1)
    .attr('opacity', 0.95)
    .transition().duration(260)
    .attr('r', 7.2);

  sel.transition().duration(260)
    .attr('cx', d => d.cx)
    .attr('cy', d => d.cy)
    .attr('fill', d => MEDAL_COLOR[d.medal] || '#ccc');
}

function drawFlag(g, { noc, x, y, w, h, opacity = 1 }) {
  // Minimal inline flags (good enough for prototype)
  if (noc === 'USA') {
    const gg = g.append('g').attr('transform', `translate(${x},${y})`).attr('opacity', opacity);
    gg.append('rect').attr('width', w).attr('height', h).attr('rx', 3).attr('fill', '#fff').attr('stroke', 'rgba(0,0,0,0.25)');
    // red stripes
    const stripes = 6;
    for (let i = 0; i < stripes; i++) {
      gg.append('rect')
        .attr('x', 0)
        .attr('y', (i * h) / stripes)
        .attr('width', w)
        .attr('height', h / (stripes * 2))
        .attr('fill', '#b22234')
        .attr('opacity', 0.9);
    }
    // blue canton
    gg.append('rect').attr('x', 0).attr('y', 0).attr('width', w * 0.45).attr('height', h * 0.55).attr('fill', '#3c3b6e');
    // stars as dots
    const sx = d3.range(0, 4);
    const sy = d3.range(0, 3);
    gg.selectAll('.s')
      .data(sx.flatMap(ix => sy.map(iy => ({ ix, iy }))))
      .enter().append('circle')
      .attr('cx', d => 3.5 + d.ix * 4.5)
      .attr('cy', d => 3.2 + d.iy * 4.2)
      .attr('r', 0.8)
      .attr('fill', '#fff')
      .attr('opacity', 0.9);
  } else if (noc === 'CHN') {
    const gg = g.append('g').attr('transform', `translate(${x},${y})`).attr('opacity', opacity);
    gg.append('rect').attr('width', w).attr('height', h).attr('rx', 3).attr('fill', '#de2910').attr('stroke', 'rgba(0,0,0,0.25)');
    // big star
    gg.append('polygon')
      .attr('points', starPoints(7.5, 6.2, 4.1, 1.7, 5))
      .attr('fill', '#ffde00');
    // small stars
    const stars = [
      { x: 13.5, y: 3.0, r: 1.4 },
      { x: 15.5, y: 5.2, r: 1.4 },
      { x: 15.0, y: 7.8, r: 1.4 },
      { x: 13.0, y: 9.8, r: 1.4 },
    ];
    stars.forEach(s => {
      gg.append('polygon')
        .attr('points', starPoints(s.x, s.y, s.r, s.r * 0.45, 5))
        .attr('fill', '#ffde00')
        .attr('opacity', 0.95);
    });
  }
}

function starPoints(cx, cy, outerR, innerR, num) {
  const pts = [];
  const step = Math.PI / num;
  for (let i = 0; i < 2 * num; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const a = -Math.PI / 2 + i * step;
    pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
  }
  return pts.map(p => p.join(',')).join(' ');
}

