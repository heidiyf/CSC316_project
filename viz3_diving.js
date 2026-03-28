/* viz3_diving.js — Diving medal flow wave chart
 * CSC316 Final Project
 * Features:
 *  - Decorative diving platform on the left edge
 *  - Custom animated GIF cursor: image/diving.gif above waterline,
 *    image/diving_underwater.gif below waterline
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
     BRUSH + TREND LINE CHART
     Users drag to select a year range on the main chart.
     A line chart below shows CHN vs USA medal counts for that range,
     with the active perspective's line glowing.
  ═══════════════════════════════════════════════════════════════ */

  // ── Inject CSS ──
  if (!document.getElementById('_d3trendcss')) {
    const sc = document.createElement('style'); sc.id = '_d3trendcss';
    sc.textContent = `
      #divingTrend {
        margin-top: 14px;
        border-radius: 16px;
        overflow: hidden;
        background: rgba(4,12,30,.85);
        border: 1px solid rgba(100,160,255,.12);
        transition: border-color .3s;
      }
      #divingTrend.persp-usa  { border-color: rgba(26,108,255,.4); }
      #divingTrend.persp-china { border-color: rgba(230,32,32,.4); }
      .dt-hint {
        text-align: center;
        padding: 22px 0 18px;
        font-family: 'Lora', Georgia, serif;
        font-size: 13px;
        color: rgba(100,160,255,.45);
        letter-spacing: .04em;
      }
    `;
    document.head.appendChild(sc);
  }

  // ── Trend host div ──
  const trendHost = document.getElementById('divingTrend') || (() => {
    const d = document.createElement('div');
    d.id = 'divingTrend';
    host.node().parentNode.insertBefore(d, host.node().nextSibling);
    return d;
  })();

  function getPerspective() {
    return document.body.dataset.perspective || 'usa';
  }

  // ── Brush overlay on main chart ──
  const brushG = g.append('g').attr('class','dive-brush');
  let selectedRange = null; // [yearStart, yearEnd]

  const brush = d3.brushX()
    .extent([[0, 0], [width, height]])
    .on('brush end', function(event) {
      if (!event.selection) {
        selectedRange = null;
        renderHint();
        return;
      }
      const [x0, x1] = event.selection.map(px => x.invert(px));
      selectedRange = [Math.round(x0), Math.round(x1)];
      renderTrend(selectedRange);
    });

  brushG.call(brush);

  // Style the brush overlay
  brushG.select('.overlay')
    .attr('fill', 'transparent')
    .style('cursor','crosshair');
  brushG.select('.selection')
    .attr('fill', 'rgba(100,180,255,.12)')
    .attr('stroke', 'rgba(100,180,255,.55)')
    .attr('stroke-width', 1.5)
    .attr('stroke-dasharray', '5,3')
    .attr('rx', 4);
  brushG.selectAll('.handle')
    .attr('fill', 'rgba(100,180,255,.7)')
    .attr('rx', 3);

  // ── Ghost demo CSS ──
  if (!document.getElementById('_brushdemoCSS')) {
    const sc = document.createElement('style'); sc.id = '_brushdemoCSS';
    sc.textContent = `
      /* Drag-to-select banner */
      .dive-drag-banner {
        display: flex;
        align-items: center;
        gap: 13px;
        margin-bottom: 10px;
        padding: 11px 18px;
        border-radius: 12px;
        background: linear-gradient(90deg, rgba(26,108,255,.12), rgba(26,108,255,.06));
        border: 1px solid rgba(26,108,255,.28);
        cursor: default;
        user-select: none;
      }
      .dive-drag-banner .ddb-icon {
        font-size: 22px;
        flex-shrink: 0;
        animation: ddbBounce 1.6s ease-in-out infinite;
      }
      @keyframes ddbBounce {
        0%,100% { transform: translateX(0); }
        40%      { transform: translateX(9px); }
        70%      { transform: translateX(-3px); }
      }
      .dive-drag-banner .ddb-text {
        font-family: 'Lora', Georgia, serif;
        font-size: 13.5px;
        font-weight: 700;
        color: #93c5fd;
        line-height: 1.4;
      }
      .dive-drag-banner .ddb-sub {
        font-size: 11px;
        font-weight: 400;
        color: rgba(147,197,253,.6);
        margin-top: 1px;
      }
      .dive-drag-banner .ddb-badge {
        margin-left: auto;
        flex-shrink: 0;
        padding: 4px 11px;
        border-radius: 999px;
        background: rgba(26,108,255,.18);
        border: 1px solid rgba(26,108,255,.4);
        font-family: 'Lora', serif;
        font-size: 10px;
        font-weight: 800;
        letter-spacing: .1em;
        text-transform: uppercase;
        color: #7ab4ff;
        animation: ddbPulse 2.2s ease-in-out infinite;
      }
      @keyframes ddbPulse {
        0%,100% { opacity: .7; }
        50%      { opacity: 1; box-shadow: 0 0 10px rgba(26,108,255,.4); }
      }
      /* Ghost brush rect drawn on the SVG */
      .ghost-brush-rect {
        pointer-events: none;
        rx: 4;
      }
    `;
    document.head.appendChild(sc);
  }

  // ── Insert banner above the SVG ──
  const bannerDiv = document.createElement('div');
  bannerDiv.className = 'dive-drag-banner';
  bannerDiv.innerHTML = `
    <span class="ddb-icon">↔</span>
    <div>
      <div class="ddb-text">Drag across the chart to select a year range</div>
      <div class="ddb-sub">A trend line will appear below comparing CHN vs USA medals for that window</div>
    </div>
    <span class="ddb-badge">Try it</span>`;
  host.node().parentNode.insertBefore(bannerDiv, host.node());

  // ── Brush instruction label (below x-axis) ──
  g.append('text')
    .attr('class','brush-hint')
    .attr('x', width / 2).attr('y', height + 38)
    .attr('text-anchor','middle')
    .attr('fill','rgba(100,160,255,.45)')
    .attr('font-size', 11).attr('font-weight', 700)
    .attr('letter-spacing','.06em')
    .style('font-family',"'DM Sans',sans-serif")
    .text('← click and drag any section of the chart to explore →');

  // ── Ghost brush overlay on chart (arrows + shaded hint region) ──
  // Drawn BELOW the real brush so it disappears once user interacts
  const ghostG = g.append('g').attr('class','ghost-hint-g').attr('pointer-events','none');

  // Shaded hint band (1990–2010 — the interesting catchup zone)
  const ghostX0 = x(1990), ghostX1 = x(2012);
  ghostG.append('rect')
    .attr('x', ghostX0).attr('y', 0)
    .attr('width', ghostX1 - ghostX0).attr('height', height)
    .attr('fill', 'rgba(100,180,255,.07)')
    .attr('stroke', 'rgba(100,180,255,.3)')
    .attr('stroke-width', 1.5)
    .attr('stroke-dasharray', '6,4')
    .attr('rx', 4);

  // Left handle nub
  ghostG.append('rect')
    .attr('x', ghostX0 - 3).attr('y', height/2 - 18)
    .attr('width', 6).attr('height', 36).attr('rx', 3)
    .attr('fill', 'rgba(100,180,255,.6)');

  // Right handle nub
  ghostG.append('rect')
    .attr('x', ghostX1 - 3).attr('y', height/2 - 18)
    .attr('width', 6).attr('height', 36).attr('rx', 3)
    .attr('fill', 'rgba(100,180,255,.6)');

  // "Drag here" label — in the underwater region (below waterline) where it's clear
  ghostG.append('text')
    .attr('x', (ghostX0 + ghostX1) / 2).attr('y', waterlineY + 72)
    .attr('text-anchor','middle')
    .attr('fill','rgba(147,197,253,.75)')
    .attr('font-size', 12).attr('font-weight', 800)
    .attr('letter-spacing','.1em')
    .style('font-family',"'DM Sans',sans-serif")
    .text('DRAG HERE');

  ghostG.append('text')
    .attr('x', (ghostX0 + ghostX1) / 2).attr('y', waterlineY + 88)
    .attr('text-anchor','middle')
    .attr('fill','rgba(147,197,253,.45)')
    .attr('font-size', 10).attr('font-weight', 600)
    .style('font-family',"'DM Sans',sans-serif")
    .text('to compare medal trends below');

  // Animate the ghost band: gentle left-right pulse
  (function pulseBand() {
    ghostG.select('rect:first-child')
      .transition().duration(1000).ease(d3.easeSinInOut)
      .attr('fill','rgba(100,180,255,.13)')
      .transition().duration(1000).ease(d3.easeSinInOut)
      .attr('fill','rgba(100,180,255,.05)')
      .on('end', pulseBand);
  })();

  // Hide ghost once user makes a real brush selection
  brush.on('brush.ghost end.ghost', function(event) {
    if (event.selection) {
      ghostG.transition().duration(300).attr('opacity', 0).on('end', () => ghostG.remove());
      bannerDiv.style.animation = 'none';
      bannerDiv.querySelector('.ddb-badge').textContent = 'Selected ✓';
      bannerDiv.querySelector('.ddb-badge').style.background = 'rgba(34,197,94,.18)';
      bannerDiv.querySelector('.ddb-badge').style.borderColor = 'rgba(34,197,94,.4)';
      bannerDiv.querySelector('.ddb-badge').style.color = '#86efac';
    }
  });

  function renderHint() {
    trendHost.innerHTML = `
      <div class="dt-hint" style="padding:26px 0 22px;display:flex;flex-direction:column;align-items:center;gap:8px;">
        <span style="font-size:28px;">↔</span>
        <span style="font-size:13px;color:rgba(147,197,253,.6);font-weight:700;">Drag a year range above to see the medal trend</span>
        <span style="font-size:11px;color:rgba(147,197,253,.35);">Try selecting 1984–2004 or 2000–2024 for the most revealing comparisons</span>
      </div>`;
  }

  function renderTrend(range) {
    if (!range) return;
    const [y0, y1] = range;
    const filtered = series.filter(d => d.Year >= y0 && d.Year <= y1);
    if (filtered.length < 1) { renderHint(); return; }

    trendHost.innerHTML = '';
    trendHost.classList.remove('persp-usa','persp-china');
    const p = getPerspective();
    trendHost.classList.add(p === 'china' ? 'persp-china' : 'persp-usa');

    const TW = trendHost.getBoundingClientRect().width || 900;
    const TH = 180;
    const tm = { top: 28, right: 28, bottom: 38, left: 52 };
    const tw = TW - tm.left - tm.right;
    const th = TH - tm.top - tm.bottom;

    const tSvg = d3.select(trendHost).append('svg')
      .attr('width', TW).attr('height', TH);

    const tg = tSvg.append('g').attr('transform', `translate(${tm.left},${tm.top})`);

    const tDefs = tSvg.append('defs');

    // Scales
    const tx = d3.scaleLinear()
      .domain(d3.extent(filtered, d => d.Year))
      .range([0, tw]);

    const maxY = d3.max(filtered, d => Math.max(d.CHN, d.USA)) || 1;
    const ty = d3.scaleLinear().domain([0, maxY * 1.18]).range([th, 0]).nice();

    // Grid
    tg.append('g').attr('opacity',.1)
      .call(d3.axisLeft(ty).ticks(4).tickSize(-tw).tickFormat(''))
      .call(gg => gg.selectAll('.domain').remove());

    // Glow filters
    ['chn','usa'].forEach(k => {
      const f = tDefs.append('filter').attr('id',`_dtGlow_${k}`).attr('x','-30%').attr('width','160%');
      f.append('feGaussianBlur').attr('in','SourceGraphic').attr('stdDeviation','4').attr('result','b');
      const m = f.append('feMerge');
      m.append('feMergeNode').attr('in','b');
      m.append('feMergeNode').attr('in','SourceGraphic');
    });

    // Shade between curves
    const areaFill = d3.area()
      .x(d => tx(d.Year)).y0(d => ty(d.USA)).y1(d => ty(d.CHN)).curve(d3.curveCatmullRom);
    tg.append('path').datum(filtered)
      .attr('d', areaFill)
      .attr('fill', 'rgba(150,100,255,.06)');

    // Lines
    const lineCHN = d3.line().x(d => tx(d.Year)).y(d => ty(d.CHN)).curve(d3.curveCatmullRom);
    const lineUSA = d3.line().x(d => tx(d.Year)).y(d => ty(d.USA)).curve(d3.curveCatmullRom);

    const chnActive = p === 'china';
    const usaActive = p === 'usa';

    // Draw dimmed line first, then lit line on top
    function drawLine(data, lineGen, color, active, label, side) {
      const path = tg.append('path').datum(data)
        .attr('d', lineGen)
        .attr('fill','none')
        .attr('stroke', color)
        .attr('stroke-width', active ? 3.2 : 1.4)
        .attr('opacity', active ? 1.0 : 0.28)
        .attr('stroke-linejoin','round')
        .attr('stroke-linecap','round');
      if (active) path.attr('filter', `url(#_dtGlow_${label === 'CHN' ? 'chn' : 'usa'})`);

      // Dots
      tg.selectAll(`.dt-dot-${label}`).data(data).enter()
        .append('circle')
        .attr('class',`dt-dot-${label}`)
        .attr('cx', d => tx(d.Year)).attr('cy', d => ty(side === 'chn' ? d.CHN : d.USA))
        .attr('r', active ? 4.5 : 2.5)
        .attr('fill', color)
        .attr('opacity', active ? 1 : 0.25)
        .attr('stroke', active ? 'rgba(255,255,255,.6)' : 'none')
        .attr('stroke-width', 1.2);

      // End label
      const last = data[data.length - 1];
      if (!last) return;
      tg.append('text')
        .attr('x', tx(last.Year) + 8)
        .attr('y', ty(side === 'chn' ? last.CHN : last.USA) + 4)
        .attr('fill', color).attr('font-size', active ? 13 : 10)
        .attr('font-weight', 900).attr('opacity', active ? 1 : 0.35)
        .style('font-family',"'DM Sans',sans-serif")
        .text(label);
    }

    // Draw non-active behind, active on top
    if (chnActive) {
      drawLine(filtered, lineUSA, COLORS.usa, false, 'USA', 'usa');
      drawLine(filtered, lineCHN, COLORS.chn, true,  'CHN', 'chn');
    } else {
      drawLine(filtered, lineCHN, COLORS.chn, false, 'CHN', 'chn');
      drawLine(filtered, lineUSA, COLORS.usa, true,  'USA', 'usa');
    }

    // Axes
    const xAxis = d3.axisBottom(tx).ticks(Math.min(filtered.length, 8)).tickFormat(d3.format('d'));
    tg.append('g').attr('transform',`translate(0,${th})`).call(xAxis)
      .call(gg => { gg.selectAll('text').style('fill','#7a93b8').style('font-family',"'DM Sans',sans-serif"); gg.selectAll('line,path.domain').style('stroke','rgba(100,160,255,.2)'); });

    tg.append('g').call(d3.axisLeft(ty).ticks(4))
      .call(gg => { gg.selectAll('text').style('fill','#7a93b8').style('font-family',"'DM Sans',sans-serif"); gg.selectAll('line,path.domain').style('stroke','rgba(100,160,255,.15)'); gg.selectAll('.domain').remove(); });

    // Chart title
    tg.append('text')
      .attr('x', tw / 2).attr('y', -12)
      .attr('text-anchor','middle')
      .attr('fill','rgba(180,210,255,.55)')
      .attr('font-size', 11).attr('font-weight', 700)
      .attr('letter-spacing','.08em')
      .style('font-family',"'DM Sans',sans-serif")
      .text(`Diving medals per Olympics · ${y0}–${y1} · ${p === 'china' ? 'CHN perspective' : 'USA perspective'}`);
  }

  renderHint();

  // Re-render on perspective change
  window.addEventListener('perspectiveChange', () => {
    if (selectedRange) renderTrend(selectedRange);
    else renderHint();
  });

  /* ==============================================================
     DIVING PLATFORM  (left side of chart)
  ============================================================== */
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
     - above waterline: image/diving.gif  (diver in air)
     - below waterline: image/diving_underwater.gif (diver underwater)
  ═══════════════════════════════════════════════════════════════ */
  const hostNode = host.node();

  // Remove any old cursor element
  const oldCursor = document.getElementById('dive-cursor-el');
  if (oldCursor) oldCursor.remove();

  // Remove any old splash container
  const oldSplash = document.getElementById('dive-splash-container');
  if (oldSplash) oldSplash.remove();

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

  // Create splash container for water splash effects
  const splashContainer = document.createElement('div');
  splashContainer.id = 'dive-splash-container';
  splashContainer.style.cssText = [
    'position:fixed',
    'pointer-events:none',
    'z-index:9998',
    'inset:0',
  ].join(';');
  document.body.appendChild(splashContainer);

  const SRC_ABOVE = 'image/diving.gif';
  const SRC_BELOW = 'image/diving_underwater.gif';
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

  /* ── Water Splash Effect ────────────────────────────────────────
     Creates water droplets that splash when cursor crosses waterline
     Water splash always originates from the waterline (y coordinate)
  ──────────────────────────────────────────────────────────────── */
  function createWaterSplash(x, waterlineY) {
    const splashBubbles = document.createElement('div');
    splashBubbles.style.cssText = 'position:fixed;pointer-events:none;width:0;height:0;';
    splashContainer.appendChild(splashBubbles);

    // Create multiple water droplets radiating from waterline impact point
    const dropletCount = 12;
    const splashRadius = 80;  // increased splash radius
    const maxDropletSize = 16; // increased from 14 (8+6)

    for (let i = 0; i < dropletCount; i++) {
      const angle = (i / dropletCount) * Math.PI * 2;
      const droplet = document.createElement('div');
      const size = 10 + Math.random() * maxDropletSize; // larger droplets

      droplet.style.cssText = `
        position: fixed;
        width: ${size}px;
        height: ${size}px;
        background: radial-gradient(circle at 30% 30%, rgba(58, 184, 255, 0.9), rgba(26, 108, 255, 0.5));
        border-radius: 50%;
        left: ${x}px;
        top: ${waterlineY}px;
        pointer-events: none;
        z-index: 9998;
        box-shadow: 0 2px 12px rgba(26, 108, 255, 0.6);
      `;

      splashBubbles.appendChild(droplet);

      // Animate droplet - horizontal and upward motion from waterline
      const vx = Math.cos(angle) * splashRadius * (0.5 + Math.random() * 0.8);
      const vy = Math.sin(angle) * splashRadius * (0.3 + Math.random() * 0.5) - 30; // stronger upward bias
      const gravity = 0.12;

      const startTime = Date.now();
      const duration = 800 + Math.random() * 500;

      function animateDroplet() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        const currentX = x + vx * progress;
        const currentY = waterlineY + vy * progress + 0.5 * gravity * progress * progress * 200;
        const opacity = Math.max(0, 1 - progress * 1.1);

        droplet.style.left = currentX + 'px';
        droplet.style.top = currentY + 'px';
        droplet.style.opacity = opacity.toString();

        if (progress < 1) {
          requestAnimationFrame(animateDroplet);
        } else {
          droplet.remove();
        }
      }

      animateDroplet();
    }

    // Remove container after animation completes
    setTimeout(() => {
      splashBubbles.remove();
    }, 1400);
  }

  // Add CSS for bubble animation
  if (!document.getElementById('dive-splash-styles')) {
    const style = document.createElement('style');
    style.id = 'dive-splash-styles';
    style.textContent = `
      @keyframes bubbleRise {
        0% {
          transform: translateY(0) scale(1);
          opacity: 0.8;
        }
        100% {
          transform: translateY(-60px) scale(0.3);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
  }

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
  let lastWaterlineY_vp = waterlineY_abs; // store waterline Y coordinate for splash effect

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
    // Trigger water splash when diving down - use waterline Y in viewport coords
    createWaterSplash(cursorEl.offsetLeft, lastWaterlineY_vp);
  }

  function onDiveMouseMove(e) {
    const rect = svgNode.getBoundingClientRect();
    // Waterline position in viewport coords
    const waterlineY_vp = rect.top + (waterlineY_abs / H) * rect.height;
    lastWaterlineY_vp = waterlineY_vp; // Store for use in showBelow

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
    splashContainer.remove();
  };
}

function escapeHtml(s) {
  return String(s)
    .replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
}
