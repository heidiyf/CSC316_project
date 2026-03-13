/* viz3_diving.js — Diving medal flow wave chart
 * CSC316 Final Project
 * Features:
 *  - Decorative diving platform on the left edge
 *  - Custom animated GIF cursor: diving.gif above waterline,
 *    diving_underwater.gif below waterline
 * Requires: COLORS, MEDAL_COLOR, MEDAL_ORDER, fmt, safeNode,
 *           showTooltip, moveTooltip, hideTooltip, hashString
 * DOM IDs:  #divingFlow
 */

function renderDivingFlow(data) {
  const host = safeNode('#divingFlow');
  if (!host) return;
  host.selectAll('*').remove();

  const rows = data.filter(d =>
    d.Sport === 'Diving' && d.Medal !== 'No medal' &&
    (d.NOC === 'USA' || d.NOC === 'CHN')
  );
  const years = d3.sort(Array.from(new Set(rows.map(d => d.Year))));

  const byYearTeam = d3.rollup(rows, v => v.length, d => d.Year, d => d.NOC);
  const series = years.map(y => {
    const m = byYearTeam.get(y) || new Map();
    return { Year: y, CHN: m.get('CHN') || 0, USA: m.get('USA') || 0 };
  });

  /* ── Layout ───────────────────────────────────────────────────── */
  const PLATFORM_MARGIN = 88;   // extra left space for the platform
  const W = 1180;
  const H = 520;
  const margin = { top: 28, right: 24, bottom: 44, left: 64 + PLATFORM_MARGIN };
  const width  = W - margin.left - margin.right;
  const height = H - margin.top  - margin.bottom;

  const svg = host.append('svg')
    .attr('width',  W)
    .attr('height', H)
    .style('overflow', 'visible');

  const g = svg.append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  /* ── Scales ───────────────────────────────────────────────────── */
  const x = d3.scaleLinear()
    .domain(d3.extent(series, d => d.Year))
    .range([0, width]);

  const maxCount = d3.max(series, d => Math.max(d.CHN, d.USA)) || 1;
  const y = d3.scaleLinear()
    .domain([-(maxCount * 1.35), maxCount * 1.35])
    .nice()
    .range([height, 0]);

  const waterlineY = y(0);           // SVG y coord inside g
  const waterlineY_abs = margin.top + waterlineY;  // SVG y coord absolute

  /* ── Grid ─────────────────────────────────────────────────────── */
  g.append('g')
    .attr('opacity', 0.14)
    .call(d3.axisLeft(y).ticks(10).tickSize(-width).tickFormat(''))
    .selectAll('.domain').remove();

  /* ── Waterline ────────────────────────────────────────────────── */
  // glowing water surface line
  const defs = svg.append('defs');

  const waterGlow = defs.append('filter').attr('id','waterGlow');
  waterGlow.append('feGaussianBlur').attr('in','SourceGraphic').attr('stdDeviation','3').attr('result','blur');
  const feMerge = waterGlow.append('feMerge');
  feMerge.append('feMergeNode').attr('in','blur');
  feMerge.append('feMergeNode').attr('in','SourceGraphic');

  // subtle water surface gradient fill below the line
  const waterGradId = 'waterSurfaceGrad';
  const wGrad = defs.append('linearGradient')
    .attr('id', waterGradId)
    .attr('x1','0%').attr('y1','0%').attr('x2','0%').attr('y2','100%');
  wGrad.append('stop').attr('offset','0%').attr('stop-color','#1a6cff').attr('stop-opacity','0.12');
  wGrad.append('stop').attr('offset','100%').attr('stop-color','#1a6cff').attr('stop-opacity','0');

  g.append('rect')
    .attr('x', 0).attr('y', waterlineY)
    .attr('width', width).attr('height', height - waterlineY)
    .attr('fill', `url(#${waterGradId})`)
    .attr('pointer-events','none');

  g.append('line')
    .attr('x1', 0).attr('x2', width)
    .attr('y1', waterlineY).attr('y2', waterlineY)
    .attr('stroke', '#3ab8ff')
    .attr('stroke-width', 2.5)
    .attr('opacity', 0.7)
    .attr('filter', 'url(#waterGlow)');

  // waterline label
  g.append('text')
    .attr('x', -6).attr('y', waterlineY + 4)
    .attr('text-anchor', 'end')
    .attr('fill', '#3ab8ff')
    .attr('font-size', 9)
    .attr('font-weight', 800)
    .attr('letter-spacing', '.1em')
    .attr('opacity', .7)
    .text('SURFACE');

  /* ── Areas ────────────────────────────────────────────────────── */
  const areaCHN = d3.area()
    .x(d => x(d.Year)).y0(waterlineY).y1(d => y(d.CHN)).curve(d3.curveBasis);
  const areaUSA = d3.area()
    .x(d => x(d.Year)).y0(waterlineY).y1(d => y(-d.USA)).curve(d3.curveBasis);

  // glow filters for areas
  ['chn','usa'].forEach(t => {
    const f = defs.append('filter').attr('id', `areaGlow_${t}`);
    f.append('feGaussianBlur').attr('in','SourceGraphic').attr('stdDeviation','8').attr('result','b');
    const m = f.append('feMerge');
    m.append('feMergeNode').attr('in','b');
    m.append('feMergeNode').attr('in','SourceGraphic');
  });

  g.append('path').datum(series)
    .attr('d', areaCHN)
    .attr('fill', COLORS.chn)
    .attr('opacity', 0.35)
    .attr('filter','url(#areaGlow_chn)');

  g.append('path').datum(series)
    .attr('d', areaUSA)
    .attr('fill', COLORS.usa)
    .attr('opacity', 0.35)
    .attr('filter','url(#areaGlow_usa)');

  // solid inner area (no glow — sharper)
  g.append('path').datum(series).attr('d', areaCHN).attr('fill', COLORS.chn).attr('opacity', 0.25);
  g.append('path').datum(series).attr('d', areaUSA).attr('fill', COLORS.usa).attr('opacity', 0.25);

  /* ── Axes ─────────────────────────────────────────────────────── */
  g.append('g')
    .attr('transform', `translate(0,${height})`)
    .call(d3.axisBottom(x).ticks(12).tickFormat(d3.format('d')));

  g.append('g')
    .call(d3.axisLeft(y).ticks(10).tickFormat(d => Math.abs(d)))
    .call(gg => gg.selectAll('.domain').remove());

  svg.selectAll('text')
    .style('fill','#7a93b8')
    .style('font-family',"'DM Sans',sans-serif");
  svg.selectAll('line,path.domain')
    .style('stroke','rgba(100,160,255,.2)');

  g.append('text')
    .attr('x',0).attr('y',-10)
    .attr('fill', COLORS.muted).attr('font-size',11)
    .text('Medals / year (Diving) — CHN above waterline · USA below (mirrored)');

  /* ── CHN / USA labels ─────────────────────────────────────────── */
  g.append('text')
    .attr('x', width/2).attr('y', 28)
    .attr('text-anchor','middle')
    .attr('fill', COLORS.chn).attr('font-weight',900).attr('font-size',28)
    .attr('opacity',.55)
    .style('font-family',"'Syne','Bebas Neue',sans-serif")
    .text('CHN');

  g.append('text')
    .attr('x', width/2).attr('y', height - 10)
    .attr('text-anchor','middle')
    .attr('fill', COLORS.usa).attr('font-weight',900).attr('font-size',28)
    .attr('opacity',.55)
    .style('font-family',"'Syne','Bebas Neue',sans-serif")
    .text('USA');

  /* ── Medal dots ───────────────────────────────────────────────── */
  const medalSortKey = m => ({ Gold:0, Silver:1, Bronze:2 }[m] ?? 9);
  const byYearTeamMedals = d3.group(rows, d => d.Year, d => d.NOC);

  const dots = [];
  for (const y0 of years) {
    const byTeam = byYearTeamMedals.get(y0);
    if (!byTeam) continue;
    ['CHN','USA'].forEach(team => {
      const arr = (byTeam.get(team)||[]).slice()
        .sort((a,b) => medalSortKey(a.Medal) - medalSortKey(b.Medal));
      const sign = team === 'CHN' ? 1 : -1;
      arr.forEach((d,i) => {
        const jitter = ((hashString(`${d.Name}|${d.Event}|${i}`) % 11) - 5) * 0.9;
        dots.push({
          Year: y0, team, medal: d.Medal,
          cx: x(y0) + jitter,
          cy: y(sign * (i+1)),
          event: d.Event,
        });
      });
    });
  }

  g.append('g')
    .selectAll('circle')
    .data(dots)
    .enter().append('circle')
    .attr('cx', d => d.cx).attr('cy', d => d.cy)
    .attr('r', 6.2)
    .attr('fill', d => MEDAL_COLOR[d.medal] || '#ccc')
    .attr('stroke', 'rgba(255,255,255,0.85)').attr('stroke-width', 1.8)
    .attr('opacity', 0.95)
    .on('mousemove', (event, d) => {
      showTooltip(`<div><b>${d.Year}</b> — ${d.team}</div><div class="k">${d.medal} · ${escapeHtml(d.event)}</div>`, event);
      moveTooltip(event);
      cursorEl.style.opacity = '0.6';
    })
    .on('mouseleave', () => { hideTooltip(); cursorEl.style.opacity = '0.82'; });

  /* splash + dive trajectory removed */

  /* ═══════════════════════════════════════════════════════════════
     DIVING PLATFORM  (left side of chart)
  ═══════════════════════════════════════════════════════════════ */
  // All coords are in SVG space (absolute, not inside g)
  const platX  = margin.left - PLATFORM_MARGIN + 6;  // left anchor of tower
  const platW  = 30;                                   // tower width
  const baseY  = margin.top + waterlineY;              // waterline in SVG
  const LEVELS = [
    { h: 120, boardLen: 70, label: '10m' },
    { h:  72, boardLen: 52, label:  '7m' },
    { h:  36, boardLen: 40, label:  '3m' },
  ];

  const platG = svg.append('g').attr('class','diving-platform');

  // Pool edge / water at the base
  platG.append('rect')
    .attr('x', platX - 10)
    .attr('y', baseY)
    .attr('width', PLATFORM_MARGIN + 24)
    .attr('height', 8)
    .attr('rx', 3)
    .attr('fill','#1a4a80')
    .attr('opacity', .7);

  // Ripple lines in pool
  [18, 32, 46].forEach((rx, i) => {
    platG.append('ellipse')
      .attr('cx', platX + platW/2 + 14).attr('cy', baseY + 4)
      .attr('rx', rx).attr('ry', 4)
      .attr('fill','none')
      .attr('stroke','#3ab8ff').attr('stroke-width', 1.2)
      .attr('opacity', 0.18 - i * 0.04);
  });

  // Tower main body — gradient
  const towerGradId = 'towerGrad';
  defs.append('linearGradient').attr('id', towerGradId)
    .attr('x1','0%').attr('y1','0%').attr('x2','100%').attr('y2','0%')
    .call(lg => {
      lg.append('stop').attr('offset','0%').attr('stop-color','#1a3a6a').attr('stop-opacity','1');
      lg.append('stop').attr('offset','100%').attr('stop-color','#2860a8').attr('stop-opacity','1');
    });

  const towerTop = baseY - LEVELS[0].h;
  platG.append('rect')
    .attr('x', platX).attr('y', towerTop)
    .attr('width', platW).attr('height', LEVELS[0].h)
    .attr('rx', 4)
    .attr('fill', `url(#${towerGradId})`)
    .attr('stroke','rgba(100,160,255,.25)').attr('stroke-width',1);

  // Tower rivets / panel lines
  [0.3, 0.55, 0.75].forEach(frac => {
    platG.append('line')
      .attr('x1', platX + 4).attr('x2', platX + platW - 4)
      .attr('y1', towerTop + LEVELS[0].h * frac)
      .attr('y2', towerTop + LEVELS[0].h * frac)
      .attr('stroke','rgba(100,160,255,.18)').attr('stroke-width',1);
  });

  // Ladder on left side of tower
  const ladderX = platX - 8;
  const rungCount = 12;
  platG.append('line')
    .attr('x1', ladderX).attr('x2', ladderX)
    .attr('y1', towerTop).attr('y2', baseY)
    .attr('stroke','rgba(100,160,255,.3)').attr('stroke-width',1.5);
  platG.append('line')
    .attr('x1', ladderX + 8).attr('x2', ladderX + 8)
    .attr('y1', towerTop).attr('y2', baseY)
    .attr('stroke','rgba(100,160,255,.3)').attr('stroke-width',1.5);
  d3.range(rungCount).forEach(i => {
    const ry = towerTop + (i / rungCount) * LEVELS[0].h;
    platG.append('line')
      .attr('x1', ladderX).attr('x2', ladderX + 8)
      .attr('y1', ry).attr('y2', ry)
      .attr('stroke','rgba(100,160,255,.25)').attr('stroke-width',1);
  });

  // Diving boards at each level
  LEVELS.forEach((lv, idx) => {
    const boardY = baseY - lv.h;
    const boardRight = platX + platW + lv.boardLen;

    // platform floor at this level
    platG.append('rect')
      .attr('x', platX).attr('y', boardY - 6)
      .attr('width', platW).attr('height', 6)
      .attr('fill','#3060b0').attr('opacity',.9);

    // board
    platG.append('rect')
      .attr('x', platX + platW).attr('y', boardY - 5)
      .attr('width', lv.boardLen).attr('height', 5)
      .attr('rx', 2)
      .attr('fill', idx === 0 ? '#e0e8ff' : '#c0d0f0')
      .attr('opacity', idx === 0 ? .95 : .7)
      .attr('stroke','rgba(255,255,255,.3)').attr('stroke-width',.5);

    // Board grip lines
    const gripCount = Math.floor(lv.boardLen / 8);
    d3.range(gripCount).forEach(gi => {
      platG.append('line')
        .attr('x1', platX + platW + 4 + gi * 8)
        .attr('x2', platX + platW + 4 + gi * 8)
        .attr('y1', boardY - 4).attr('y2', boardY - 1)
        .attr('stroke','rgba(100,160,255,.4)').attr('stroke-width',.8);
    });

    // Board support triangle under top board only
    if (idx === 0) {
      platG.append('polygon')
        .attr('points', [
          [platX + platW, boardY - 5],
          [platX + platW + 24, boardY - 5],
          [platX + platW, boardY + 8],
        ].map(p => p.join(',')).join(' '))
        .attr('fill','#2050a0').attr('opacity',.6);
    }

    // Height label
    platG.append('text')
      .attr('x', platX + platW/2).attr('y', boardY - 9)
      .attr('text-anchor','middle')
      .attr('fill','rgba(160,200,255,.7)')
      .attr('font-size', 9).attr('font-weight', 800)
      .attr('letter-spacing','.06em')
      .style('font-family',"'DM Sans',sans-serif")
      .text(lv.label);
  });

  // Diver silhouette on top board
  const diverBoardY = baseY - LEVELS[0].h - 5;
  const diverBoardX = platX + platW + LEVELS[0].boardLen - 10;
  const diverG = platG.append('g')
    .attr('transform', `translate(${diverBoardX}, ${diverBoardY})`)
    .attr('opacity', 0.88);

  // Standing diver — arms raised
  // Head
  diverG.append('circle').attr('cx',0).attr('cy',-22).attr('r',6)
    .attr('fill','#e8c090').attr('stroke','rgba(255,255,255,.4)').attr('stroke-width',.8);
  // Swimsuit body
  diverG.append('rect').attr('x',-5).attr('y',-16).attr('width',10).attr('height',14)
    .attr('rx',3).attr('fill','#e62020').attr('opacity',.9);
  // Arms raised above head
  diverG.append('line').attr('x1',-5).attr('y1',-14).attr('x2',-12).attr('y2',-28)
    .attr('stroke','#e8c090').attr('stroke-width',3).attr('stroke-linecap','round');
  diverG.append('line').attr('x1', 5).attr('y1',-14).attr('x2', 12).attr('y2',-28)
    .attr('stroke','#e8c090').attr('stroke-width',3).attr('stroke-linecap','round');
  // (hands-together circle removed — looked like a second head)
  // Legs
  diverG.append('line').attr('x1',-3).attr('y1',-2).attr('x2',-4).attr('y2',10)
    .attr('stroke','#e8c090').attr('stroke-width',3.5).attr('stroke-linecap','round');
  diverG.append('line').attr('x1', 3).attr('y1',-2).attr('x2', 4).attr('y2',10)
    .attr('stroke','#e8c090').attr('stroke-width',3.5).attr('stroke-linecap','round');

  // "DIVE" annotation arrow pointing to the diver
  platG.append('path')
    .attr('d', `M ${diverBoardX - 30} ${diverBoardY - 18} Q ${diverBoardX - 20} ${diverBoardY - 26} ${diverBoardX - 8} ${diverBoardY - 25}`)
    .attr('fill','none').attr('stroke','rgba(160,200,255,.45)').attr('stroke-width',1.2)
    .attr('marker-end','url(#arrowhead)');

  defs.append('marker')
    .attr('id','arrowhead').attr('viewBox','0 0 10 10')
    .attr('refX',9).attr('refY',5)
    .attr('markerWidth',6).attr('markerHeight',6)
    .attr('orient','auto')
    .append('path').attr('d','M 0 2 L 10 5 L 0 8 z')
    .attr('fill','rgba(160,200,255,.5)');

  platG.append('text')
    .attr('x', diverBoardX - 36).attr('y', diverBoardY - 22)
    .attr('text-anchor','end')
    .attr('fill','rgba(160,200,255,.55)')
    .attr('font-size',9).attr('font-weight',800).attr('letter-spacing','.12em')
    .style('font-family',"'DM Sans',sans-serif")
    .text('READY');

  /* ═══════════════════════════════════════════════════════════════
     CUSTOM GIF CURSOR
     - above waterline: diving.gif  (diver in air)
     - below waterline: diving_underwater.gif (diver underwater)
  ═══════════════════════════════════════════════════════════════ */
  const hostNode = host.node();

  // Remove any old cursor element
  const oldCursor = document.getElementById('dive-cursor-el');
  if (oldCursor) oldCursor.remove();

  const GIF_SIZE = 160; // bigger so the animation reads clearly

  const cursorEl = document.createElement('div');
  cursorEl.id = 'dive-cursor-el';
  cursorEl.style.cssText = [
    'position:fixed',
    'pointer-events:none',
    'z-index:9999',
    `width:${GIF_SIZE}px`,
    `height:${GIF_SIZE}px`,
    'transform:translate(-50%,-60%)',
    'display:none',
    'filter:drop-shadow(0 6px 20px rgba(26,108,255,.55))',
  ].join(';');

  const SRC_ABOVE = 'diving.gif';
  const SRC_BELOW = 'diving_underwater.gif';
  const baseImgStyle = `width:${GIF_SIZE}px;height:${GIF_SIZE}px;object-fit:contain;position:absolute;top:0;left:0;`;

  const imgAbove = document.createElement('img');
  imgAbove.src = SRC_ABOVE;
  imgAbove.style.cssText = baseImgStyle + 'opacity:1;';

  const imgBelow = document.createElement('img');
  imgBelow.src = SRC_BELOW;
  imgBelow.style.cssText = baseImgStyle + 'opacity:0;';

  cursorEl.appendChild(imgAbove);
  cursorEl.appendChild(imgBelow);
  document.body.appendChild(cursorEl);

  /* ── Force GIF loop ────────────────────────────────────────────
     Browsers stop GIFs after their built-in loop count (often 1).
     We restart each GIF by blanking then restoring .src on a timer
     that matches each animation's approximate cycle length.
     We skip the reset while the image is hidden (opacity 0) so the
     animation always starts fresh when it becomes visible.
  ──────────────────────────────────────────────────────────────── */
  function makeLooper(img, src, cycleMs) {
    let id = null;
    function restart() {
      img.src = '';
      requestAnimationFrame(() => { img.src = src; });
    }
    function start() {
      if (id) return;
      restart(); // start immediately from frame 1
      id = setInterval(restart, cycleMs);
    }
    function stop() {
      clearInterval(id);
      id = null;
    }
    return { start, stop };
  }

  // Tune these ms values to match the visual length of each GIF
  const looperAbove = makeLooper(imgAbove, SRC_ABOVE, 1600);
  const looperBelow = makeLooper(imgBelow, SRC_BELOW, 1200);

  // Start both loopers immediately so they're warm when cursor enters
  looperAbove.start();
  looperBelow.start();

  // Hide default cursor over the SVG
  svg.style('cursor', 'none');

  const svgNode = svg.node();
  let lastAbove = true; // track which GIF is currently shown

  function showAbove() {
    if (lastAbove) return;
    lastAbove = true;
    imgAbove.style.opacity = '1';
    imgBelow.style.opacity = '0';
  }
  function showBelow() {
    if (!lastAbove) return;
    lastAbove = false;
    imgAbove.style.opacity = '0';
    imgBelow.style.opacity = '1';
  }

  function onDiveMouseMove(e) {
    const rect = svgNode.getBoundingClientRect();
    // Waterline position in viewport coords
    const waterlineY_vp = rect.top + (waterlineY_abs / H) * rect.height;

    cursorEl.style.left    = e.clientX + 'px';
    cursorEl.style.top     = e.clientY + 'px';
    cursorEl.style.display = 'block';

    if (e.clientY <= waterlineY_vp) showAbove();
    else                            showBelow();
  }

  function onDiveMouseLeave() {
    cursorEl.style.display = 'none';
  }

  function onDiveMouseEnter() {
    svg.style('cursor', 'none');
    cursorEl.style.display = 'block';
  }

  svgNode.addEventListener('mousemove',  onDiveMouseMove);
  svgNode.addEventListener('mouseleave', onDiveMouseLeave);
  svgNode.addEventListener('mouseenter', onDiveMouseEnter);

  // Clean up on re-render
  svgNode._diveCleanup = () => {
    looperAbove.stop();
    looperBelow.stop();
    svgNode.removeEventListener('mousemove',  onDiveMouseMove);
    svgNode.removeEventListener('mouseleave', onDiveMouseLeave);
    svgNode.removeEventListener('mouseenter', onDiveMouseEnter);
    cursorEl.remove();
  };
}

function escapeHtml(s) {
  return String(s)
    .replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
}