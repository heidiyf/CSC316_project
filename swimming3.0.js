/* swimming.js  — fixed edition
   Changes from swimming3_0.js:
     1. Removed all CSS entrance animations on swimmer icons (was causing opacity:0 bug)
     2. Fixed swimmer overflow: icons now wrap within pool bounds
     3. USA / CHN toggle — shows one pool at a time
     4. Kept full medal-color swimmer silhouettes (gold/silver/bronze body color)

   Requires D3 v7 loaded globally.

   Expected DOM IDs:
     #yearSlider  #swimYearLabel  #gapText
     #swimUSALabel  #swimCHNLabel
     #swimUSA  #swimCHN
     #swimCompareBar  (optional — auto-created if missing)
     #swimToggle      (optional — auto-created if missing)

   Expected data fields: Year, Sport, Medal, NOC, Name, Event
*/

(function () {

  /* ─── CSS injected once ─────────────────────────────────────── */
  (function injectCSS() {
    if (document.getElementById('_swimCSS')) return;
    const style = document.createElement('style');
    style.id = '_swimCSS';
    style.textContent = `
      .swim-section {
        background: #07101f;
        border-radius: 18px;
        padding: 24px 20px 20px;
        box-shadow: 0 0 60px rgba(0,120,255,0.12);
      }
      .swim-pool-host svg {
        border-radius: 20px;
        box-shadow: 0 0 30px rgba(0,160,255,0.25), 0 0 80px rgba(0,100,200,0.12);
        display: block;
      }

      /* Wave animations */
      @keyframes waveA { 0%,100%{transform:translateX(0) scaleY(1)} 50%{transform:translateX(-60px) scaleY(1.08)} }
      @keyframes waveB { 0%,100%{transform:translateX(0) scaleY(1)} 50%{transform:translateX(50px) scaleY(0.94)} }
      @keyframes waveC { 0%,100%{transform:translateX(0) scaleY(1)} 50%{transform:translateX(-30px) scaleY(1.04)} }
      .wave-a { animation: waveA 5.4s ease-in-out infinite; }
      .wave-b { animation: waveB 7.1s ease-in-out infinite; }
      .wave-c { animation: waveC 9.2s ease-in-out infinite; }

      /* Toggle buttons */
      #swimToggle {
        display: flex;
        gap: 10px;
        margin: 10px 0 14px;
      }
      .swim-toggle-btn {
        padding: 7px 24px;
        border-radius: 20px;
        border: 2px solid transparent;
        font-size: 14px;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.2s;
        background: #0d1e33;
        color: #94a3b8;
        letter-spacing: 0.05em;
      }
      .swim-toggle-btn.active-usa {
        background: #1a3fa8;
        color: #fff;
        border-color: #3b82f6;
        box-shadow: 0 0 14px rgba(59,130,246,0.5);
      }
      .swim-toggle-btn.active-chn {
        background: #7f1d1d;
        color: #fff;
        border-color: #ef4444;
        box-shadow: 0 0 14px rgba(239,68,68,0.45);
      }

      /* Comparison bar */
      #swimCompareBar { margin: 10px 0; padding: 0 4px; }
      .swim-bar-wrap { display:flex; align-items:center; gap:10px; height:36px; }
      .swim-bar-track {
        flex:1; height:22px; background:#0d1e33; border-radius:12px;
        overflow:hidden; position:relative; border:1px solid rgba(255,255,255,0.08);
      }
      .swim-bar-usa {
        position:absolute; right:50%; top:0; bottom:0;
        background: linear-gradient(90deg,#1a56db,#3b82f6);
        border-radius:12px 0 0 12px;
        transition: width 0.4s cubic-bezier(.4,0,.2,1);
        box-shadow: 2px 0 12px rgba(59,130,246,0.5);
      }
      .swim-bar-chn {
        position:absolute; left:50%; top:0; bottom:0;
        background: linear-gradient(90deg,#ef4444,#b91c1c);
        border-radius:0 12px 12px 0;
        transition: width 0.4s cubic-bezier(.4,0,.2,1);
        box-shadow: -2px 0 12px rgba(239,68,68,0.5);
      }
      .swim-bar-center {
        position:absolute; left:50%; top:0; bottom:0; width:2px;
        transform:translateX(-50%); background:rgba(255,255,255,0.25);
      }
      .swim-bar-label {
        font-size:12px; font-weight:700; color:#94a3b8;
        width:52px; white-space:nowrap; flex-shrink:0;
      }
      .swim-bar-label.right { text-align:right; }
      #yearSlider { accent-color: #3b82f6; }

      /* Tooltip */
      #_swimTooltip {
        position:fixed; pointer-events:none; z-index:9999;
        opacity:0; transform:translateY(6px);
        transition: opacity 0.15s ease, transform 0.15s ease;
      }
      #_swimTooltip.visible { opacity:1; transform:translateY(0); }
      #_swimTooltip .tip-inner {
        background:#0d1e33; border-radius:12px; padding:10px 14px 11px;
        min-width:180px; max-width:260px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.07);
      }
      #_swimTooltip .tip-header {
        display:flex; align-items:center; gap:8px;
        margin-bottom:7px; padding-bottom:7px;
        border-bottom:1px solid rgba(255,255,255,0.07);
      }
      #_swimTooltip .tip-medal-dot {
        width:12px; height:12px; border-radius:50%; flex-shrink:0;
        border:1.5px solid rgba(0,0,0,0.45);
      }
      #_swimTooltip .tip-medal-label {
        font-size:11px; font-weight:800; letter-spacing:0.06em; text-transform:uppercase;
      }
      #_swimTooltip .tip-noc-badge {
        margin-left:auto; font-size:10px; font-weight:800; letter-spacing:0.08em;
        padding:2px 7px; border-radius:20px; color:#fff; opacity:0.9;
      }
      #_swimTooltip .tip-name { font-size:13px; font-weight:700; color:#e2e8f0; margin-bottom:4px; }
      #_swimTooltip .tip-event { font-size:11px; color:#94a3b8; }
      #_swimTooltip .tip-arrow {
        position:absolute; bottom:-6px; left:50%; transform:translateX(-50%);
        width:0; height:0;
        border-left:7px solid transparent; border-right:7px solid transparent;
        border-top:7px solid #0d1e33;
      }
    `;
    document.head.appendChild(style);
  })();

  /* ─── Tooltip ────────────────────────────────────────────────── */
  const Tooltip = (function () {
    let el = null;
    const NOC_BG = { USA: '#1a3fa8', CHN: '#9b1c1c' };

    function ensure() {
      if (el) return el;
      el = document.createElement('div');
      el.id = '_swimTooltip';
      el.innerHTML = `
        <div class="tip-inner">
          <div class="tip-header">
            <span class="tip-medal-dot"  id="_tipDot"></span>
            <span class="tip-medal-label" id="_tipMedal"></span>
            <span class="tip-noc-badge"  id="_tipNOC"></span>
          </div>
          <div class="tip-name"  id="_tipName"></div>
          <div class="tip-event" id="_tipEvent"></div>
        </div>
        <div class="tip-arrow"></div>`;
      document.body.appendChild(el);
      window.addEventListener('scroll', hide, { passive: true });
      return el;
    }

    function position(evt) {
      const tip = ensure();
      const tw = tip.offsetWidth || 220, th = tip.offsetHeight || 80;
      let x = evt.clientX - tw / 2, y = evt.clientY - th - 14;
      x = Math.max(8, Math.min(x, window.innerWidth - tw - 8));
      if (y < 8) y = evt.clientY + 20;
      tip.style.left = x + 'px';
      tip.style.top  = y + 'px';
    }

    function show(evt, { name, event, medal, noc }) {
      const tip = ensure();
      document.getElementById('_tipDot').style.background   = MEDAL_COLOR[medal] || '#ccc';
      document.getElementById('_tipMedal').textContent      = medal;
      document.getElementById('_tipMedal').style.color      = MEDAL_COLOR[medal] || '#ccc';
      document.getElementById('_tipNOC').textContent        = noc;
      document.getElementById('_tipNOC').style.background   = NOC_BG[noc] || '#334';
      document.getElementById('_tipName').textContent       = name;
      document.getElementById('_tipEvent').textContent      = String(event).replace(/^Swimming\s*/i, '');
      position(evt);
      tip.classList.add('visible');
    }

    function move(evt) { if (el && el.classList.contains('visible')) position(evt); }
    function hide()    { if (el) el.classList.remove('visible'); }

    return { show, move, hide };
  })();

  /* ─── Colours ────────────────────────────────────────────────── */
  function getCssVar(name, fallback) {
    const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return v || fallback;
  }

  const COLORS = {
    gold:   getCssVar('--gold',   '#f5c518'),
    silver: getCssVar('--silver', '#c0c0c0'),
    bronze: getCssVar('--bronze', '#cd7f32'),
    ink:    getCssVar('--ink',    '#e2e8f0'),
    muted:  getCssVar('--muted',  '#94a3b8'),
  };

  const MEDAL_ORDER = ['Gold', 'Silver', 'Bronze'];
  const MEDAL_COLOR = { Gold: COLORS.gold, Silver: COLORS.silver, Bronze: COLORS.bronze };

  function safeNode(id) {
    const el = document.querySelector(id);
    return el ? d3.select(el) : null;
  }

  function hashString(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return (h >>> 0);
  }

  /* ─── Swimmer icon — NO animation, full medal-color body ─────── */
  function appendSwimmerIcon(parent, cx, cy, medal) {
    const mc = MEDAL_COLOR[medal] || '#ccc';

    const g = parent.append('g')
      .attr('transform', `translate(${cx},${cy})`);

    // Head
    g.append('circle')
      .attr('cx', 0).attr('cy', -4).attr('r', 3)
      .attr('fill', mc)
      .attr('stroke', 'rgba(0,0,0,0.55)').attr('stroke-width', 0.7);

    // Body
    g.append('ellipse')
      .attr('cx', 4.5).attr('cy', 0).attr('rx', 6.5).attr('ry', 2.2)
      .attr('fill', mc)
      .attr('stroke', 'rgba(0,0,0,0.55)').attr('stroke-width', 0.7);

    // Arm (reaching forward)
    g.append('line')
      .attr('x1', -0.5).attr('y1', 0).attr('x2', -6).attr('y2', -2.5)
      .attr('stroke', mc).attr('stroke-width', 1.8).attr('stroke-linecap', 'round');

    // Kick legs
    g.append('line')
      .attr('x1', 10.5).attr('y1', 0).attr('x2', 14).attr('y2', -3)
      .attr('stroke', mc).attr('stroke-width', 1.6).attr('stroke-linecap', 'round');
    g.append('line')
      .attr('x1', 10.5).attr('y1', 0).attr('x2', 14).attr('y2', 2.5)
      .attr('stroke', mc).attr('stroke-width', 1.6).attr('stroke-linecap', 'round');

    return g;
  }

  /* ─── Comparison bar ─────────────────────────────────────────── */
  function ensureCompareBar() {
    let bar = document.getElementById('swimCompareBar');
    if (!bar) {
      const usaEl = document.getElementById('swimUSA');
      if (usaEl && usaEl.parentNode) {
        bar = document.createElement('div');
        bar.id = 'swimCompareBar';
        usaEl.parentNode.insertBefore(bar, usaEl.nextSibling);
      }
    }
    if (!bar) return null;
    if (!bar.querySelector('.swim-bar-wrap')) {
      bar.innerHTML = `
        <div class="swim-bar-wrap">
          <div class="swim-bar-label right" id="_barUSALabel">🇺🇸 0</div>
          <div class="swim-bar-track">
            <div class="swim-bar-usa" id="_barUSA" style="width:0"></div>
            <div class="swim-bar-chn" id="_barCHN" style="width:0"></div>
            <div class="swim-bar-center"></div>
          </div>
          <div class="swim-bar-label" id="_barCHNLabel">🇨🇳 0</div>
        </div>`;
    }
    return bar;
  }

  function updateCompareBar(usaCount, chnCount) {
    const bU = document.getElementById('_barUSA');
    const bC = document.getElementById('_barCHN');
    const lU = document.getElementById('_barUSALabel');
    const lC = document.getElementById('_barCHNLabel');
    if (!bU || !bC) return;
    const total = usaCount + chnCount || 1;
    bU.style.width = (usaCount / total * 50) + '%';
    bC.style.width = (chnCount / total * 50) + '%';
    if (lU) lU.textContent = `🇺🇸 ${usaCount}`;
    if (lC) lC.textContent = `🇨🇳 ${chnCount}`;
  }

  /* ─── Toggle UI ──────────────────────────────────────────────── */
  function ensureToggle(onSwitch) {
    let wrap = document.getElementById('swimToggle');
    if (!wrap) {
      // Insert before #swimUSA
      const anchor = document.getElementById('swimUSA');
      if (!anchor || !anchor.parentNode) return null;
      wrap = document.createElement('div');
      wrap.id = 'swimToggle';
      anchor.parentNode.insertBefore(wrap, anchor);
    }
    wrap.innerHTML = `
      <button class="swim-toggle-btn active-usa" id="_btnUSA" data-noc="USA">🇺🇸 USA</button>
      <button class="swim-toggle-btn"            id="_btnCHN" data-noc="CHN">🇨🇳 CHN</button>`;

    wrap.addEventListener('click', (e) => {
      const btn = e.target.closest('.swim-toggle-btn');
      if (!btn) return;
      const noc = btn.dataset.noc;
      document.getElementById('_btnUSA').className = 'swim-toggle-btn' + (noc === 'USA' ? ' active-usa' : '');
      document.getElementById('_btnCHN').className = 'swim-toggle-btn' + (noc === 'CHN' ? ' active-chn' : '');
      onSwitch(noc);
    });

    return wrap;
  }

  /* ─── Main entry ─────────────────────────────────────────────── */
  function renderSwimmingPools(data) {
    const hostUSA   = safeNode('#swimUSA');
    const hostCHN   = safeNode('#swimCHN');
    const slider    = document.getElementById('yearSlider');
    const yearLabel = document.getElementById('swimYearLabel');
    const gapText   = document.getElementById('gapText');
    const usaLabel  = document.getElementById('swimUSALabel');
    const chnLabel  = document.getElementById('swimCHNLabel');

    if (!hostUSA || !hostCHN || !slider || !yearLabel || !gapText || !usaLabel || !chnLabel) {
      console.warn('Swimming visualization: missing required DOM elements.');
      return;
    }

    [hostUSA, hostCHN].forEach(h => h.classed('swim-pool-host', true));
    hostUSA.selectAll('*').remove();
    hostCHN.selectAll('*').remove();

    const swimRows = data.filter(d =>
      d.Sport === 'Swimming' && d.Medal !== 'No medal' &&
      (d.NOC === 'USA' || d.NOC === 'CHN')
    );
    const years = d3.sort(Array.from(new Set(swimRows.map(d => +d.Year))));

    if (!years.length) {
      gapText.textContent = 'No swimming data found.';
      return;
    }

    slider.min   = 0;
    slider.max   = years.length - 1;
    slider.step  = 1;
    slider.value = years.length - 1;

    ensureCompareBar();

    const W = Math.max(900, Math.floor(hostUSA.node().getBoundingClientRect().width || 1200));
    const H = 260;

    // Build both SVGs up front
    const svgUSA = hostUSA.append('svg').attr('width', W).attr('height', H);
    const svgCHN = hostCHN.append('svg').attr('width', W).attr('height', H);

    drawPoolFrame(svgUSA, { noc: 'USA', W, H });
    drawPoolFrame(svgCHN, { noc: 'CHN', W, H });

    // Default: show USA, hide CHN
    let activeNOC = 'USA';
    hostUSA.style('display', null);
    hostCHN.style('display', 'none');

    ensureToggle((noc) => {
      activeNOC = noc;
      hostUSA.style('display', noc === 'USA' ? null : 'none');
      hostCHN.style('display', noc === 'CHN' ? null : 'none');
      updateLabels(noc);
    });

    function updateLabels(noc) {
      const y = years[+slider.value] ?? years[years.length - 1];
      const usa = swimRows.filter(d => +d.Year === y && d.NOC === 'USA');
      const chn = swimRows.filter(d => +d.Year === y && d.NOC === 'CHN');
      const usaCount = usa.length, chnCount = chn.length;
      const gap = usaCount - chnCount;
      const leader = gap === 0 ? 'Tied' : (gap > 0 ? 'USA' : 'CHN');
      gapText.textContent = `Gap (Swimming medals) in ${y}: ${
        leader === 'Tied' ? 'tied' : (leader + ' leads by ' + Math.abs(gap))}.`;
      usaLabel.textContent = `USA • Swimming medals: ${usaCount}`;
      chnLabel.textContent = `CHN • Swimming medals: ${chnCount}`;
      updateCompareBar(usaCount, chnCount);

      // Show the label for the currently active NOC more prominently
      if (usaLabel) usaLabel.style.display = (noc === 'USA') ? '' : 'none';
      if (chnLabel) chnLabel.style.display = (noc === 'CHN') ? '' : 'none';
    }

    function update() {
      const y = years[+slider.value] ?? years[years.length - 1];
      yearLabel.textContent = y;

      const usa = swimRows.filter(d => +d.Year === y && d.NOC === 'USA');
      const chn = swimRows.filter(d => +d.Year === y && d.NOC === 'CHN');

      drawPoolMedals(svgUSA, usa);
      drawPoolMedals(svgCHN, chn);
      updateLabels(activeNOC);
    }

    slider.oninput = () => { Tooltip.hide(); update(); };
    update();
  }

  /* ─── Pool frame ─────────────────────────────────────────────── */
  function drawPoolFrame(svg, { noc, W, H }) {
    W = W || +svg.attr('width');
    H = H || +svg.attr('height');

    const defs = svg.append('defs');

    const waterGradId = `waterGrad_${noc}`;
    const wg = defs.append('linearGradient').attr('id', waterGradId)
      .attr('x1','0%').attr('y1','0%').attr('x2','100%').attr('y2','100%');
    wg.append('stop').attr('offset','0%').attr('stop-color','#0a3d6b');
    wg.append('stop').attr('offset','50%').attr('stop-color','#0d5fa0');
    wg.append('stop').attr('offset','100%').attr('stop-color','#0e7490');

    const deckGradId = `deckGrad_${noc}`;
    const dg = defs.append('linearGradient').attr('id', deckGradId)
      .attr('x1','0%').attr('y1','0%').attr('x2','0%').attr('y2','100%');
    dg.append('stop').attr('offset','0%').attr('stop-color','#1e3a5f');
    dg.append('stop').attr('offset','100%').attr('stop-color','#0f2540');

    const filterId = `poolGlow_${noc}`;
    const filt = defs.append('filter').attr('id', filterId)
      .attr('x','-20%').attr('y','-20%').attr('width','140%').attr('height','140%');
    filt.append('feGaussianBlur').attr('in','SourceGraphic').attr('stdDeviation','6').attr('result','blur');
    const fm = filt.append('feMerge');
    fm.append('feMergeNode').attr('in','blur');
    fm.append('feMergeNode').attr('in','SourceGraphic');

    const deckW = 86, startW = 16;
    const poolX = deckW + startW, poolY = 22;
    const poolW = W - poolX - 14, poolH = H - poolY - 24;

    const clipId = `poolClip_${noc}`;
    defs.append('clipPath').attr('id', clipId)
      .append('rect').attr('x',poolX).attr('y',poolY)
      .attr('width',poolW).attr('height',poolH).attr('rx',16);

    const g = svg.append('g');
    g.append('rect').attr('width',W).attr('height',H).attr('fill','#060f1c');

    g.append('rect').attr('x',8).attr('y',poolY)
      .attr('width',deckW).attr('height',poolH).attr('rx',12)
      .attr('fill',`url(#${deckGradId})`).attr('stroke','rgba(100,160,255,0.15)').attr('stroke-width',1);

    g.append('rect').attr('x',8+deckW).attr('y',poolY)
      .attr('width',startW).attr('height',poolH)
      .attr('fill','#0a1f38').attr('stroke','rgba(0,100,200,0.2)').attr('stroke-width',1);

    g.append('rect').attr('x',poolX).attr('y',poolY)
      .attr('width',poolW).attr('height',poolH).attr('rx',16)
      .attr('fill',`url(#${waterGradId})`).attr('filter',`url(#${filterId})`);

    // Animated waves
    const waveGroup = g.append('g').attr('clip-path',`url(#${clipId})`);
    function wavePath(amp, freq, vert) {
      const pts = [];
      for (let x = -40; x <= poolW+40; x += 6) {
        const y = vert + Math.sin((x/poolW)*Math.PI*2*freq)*amp;
        pts.push(x===-40 ? `M ${poolX+x} ${poolY+y}` : `L ${poolX+x} ${poolY+y}`);
      }
      pts.push(`L ${poolX+poolW+40} ${poolY+poolH} L ${poolX-40} ${poolY+poolH} Z`);
      return pts.join(' ');
    }
    [
      { cls:'wave-a', amp:4, freq:2.2, vert:8,  op:0.07 },
      { cls:'wave-b', amp:3, freq:3.5, vert:14, op:0.06 },
      { cls:'wave-c', amp:5, freq:1.8, vert:6,  op:0.05 },
    ].forEach(wc => {
      waveGroup.append('path').attr('class',wc.cls)
        .attr('d',wavePath(wc.amp,wc.freq,wc.vert))
        .attr('fill',`rgba(100,210,255,${wc.op})`).attr('stroke','none');
    });

    // Lane ropes
    const lanes = 8, laneH = poolH / lanes;
    const ropeColors = ['#ff5a45','#f5c518','#3b82f6'];
    for (let j = 0; j <= lanes; j++) {
      const yy = poolY + j * laneH;
      g.selectAll(`.rope-${noc}-${j}`)
        .data(d3.range(0, Math.floor(poolW/13))).enter()
        .append('circle')
        .attr('cx', d => poolX + 7 + d*13).attr('cy', yy).attr('r', 2.6)
        .attr('fill', d => ropeColors[d % ropeColors.length]).attr('opacity', 0.6);
    }

    // Lane number tabs
    const laneCenters = d3.range(1, lanes+1).map(i => poolY + (i-0.5)*laneH);
    laneCenters.forEach((cy, i) => {
      const tab = g.append('g');
      tab.append('rect').attr('x',20).attr('y',cy-10).attr('width',58).attr('height',20).attr('rx',10)
        .attr('fill','#0f2540').attr('stroke','rgba(59,130,246,0.4)').attr('stroke-width',1);
      tab.append('rect').attr('x',20).attr('y',cy-10).attr('width',58).attr('height',7).attr('rx',10)
        .attr('fill','#d64035').attr('opacity',0.8);
      tab.append('text').attr('x',48).attr('y',cy+5).attr('text-anchor','middle')
        .attr('fill',COLORS.ink).attr('font-weight',800).attr('font-size',12).text(String(i+1));
    });

    // START label
    g.append('text').attr('x',26).attr('y',poolY+poolH/2)
      .attr('transform',`rotate(-90,${26},${poolY+poolH/2})`)
      .attr('fill','rgba(255,255,255,0.6)').attr('font-weight',800)
      .attr('letter-spacing','3px').attr('font-size',13).text('START');

    // Flag
    drawFlag(g, { noc, x:14, y:poolY+8, w:36, h:23, opacity:0.95 });

    // Legend
    const legend = g.append('g').attr('transform',`translate(${poolX+poolW-125},${poolY-2})`);
    [{ k:'Gold',label:'G' },{ k:'Silver',label:'S' },{ k:'Bronze',label:'B' }].forEach((it,idx) => {
      const gg = legend.append('g').attr('transform',`translate(${idx*38},0)`);
      gg.append('circle').attr('cx',0).attr('cy',0).attr('r',6.5)
        .attr('fill',MEDAL_COLOR[it.k]).attr('stroke','rgba(0,0,0,0.5)');
      gg.append('text').attr('x',10).attr('y',4)
        .attr('fill',COLORS.muted).attr('font-size',12).attr('font-weight',700).text(it.label);
    });

    // Edge glow
    const glowId = `edgeGlow_${noc}`;
    const eg = defs.append('radialGradient').attr('id',glowId).attr('cx','50%').attr('cy','50%').attr('r','50%');
    eg.append('stop').attr('offset','60%').attr('stop-color','transparent');
    eg.append('stop').attr('offset','100%').attr('stop-color','rgba(0,140,255,0.18)');
    g.append('rect').attr('x',poolX).attr('y',poolY).attr('width',poolW).attr('height',poolH)
      .attr('rx',16).attr('fill',`url(#${glowId})`).attr('pointer-events','none');

    // Clip for medals so they don't overflow the pool
    const medClipId = `medalClip_${noc}`;
    defs.append('clipPath').attr('id', medClipId)
      .append('rect').attr('x',poolX).attr('y',poolY)
      .attr('width',poolW).attr('height',poolH);

    svg.node().__pool = { poolX, poolY, poolW, poolH, lanes, laneH, medClipId };
  }

  /* ─── Medal swimmers — NO animation, grid layout to prevent overflow ── */
  function drawPoolMedals(svg, medals) {
    const layout = svg.node().__pool;
    if (!layout) return;
    const { poolX, poolY, poolW, poolH, lanes, laneH, medClipId } = layout;

    let gMedals = svg.select('g.medals');
    if (gMedals.empty()) {
      gMedals = svg.append('g')
        .attr('class', 'medals')
        .attr('clip-path', `url(#${medClipId})`);
    }
    gMedals.selectAll('*').remove();  // instant redraw — no animation delay issues

    const lanePrefs = {
      Gold:   [3,4,2,5,1,6,0,7],
      Silver: [3,4,2,5,1,6,0,7],
      Bronze: [1,6,2,5,0,7,3,4],
    };

    const byMedal = d3.group(
      medals.filter(d => ['Gold','Silver','Bronze'].includes(d.Medal)),
      d => d.Medal
    );

    const assigned = [];
    MEDAL_ORDER.forEach(medal => {
      const pref = lanePrefs[medal];
      const arr  = (byMedal.get(medal) || []).slice().sort((a, b) => {
        const ah = hashString(`${a.Name}|${a.Event}|${a.Year}|${a.Medal}`);
        const bh = hashString(`${b.Name}|${b.Event}|${b.Year}|${b.Medal}`);
        return ah !== bh ? ah - bh : a.Event.localeCompare(b.Event);
      });
      arr.forEach((d, i) => assigned.push({ ...d, __lane: pref[i % 8] + 1 }));
    });

    const byLane    = d3.group(assigned, d => d.__lane);
    const medalRank = { Gold: 0, Silver: 1, Bronze: 2 };

    // Layout constants — icon spans roughly x: -6..14, so width ~20px
    const ICON_W   = 20;   // icon width for spacing
    const COL_STEP = 19;   // horizontal step between icons
    const maxPerRow = Math.max(1, Math.floor((poolW - 30) / COL_STEP));
    const startX    = poolX + 18;

    for (let lane = 1; lane <= lanes; lane++) {
      const arr = (byLane.get(lane) || []).slice().sort((a, b) =>
        (medalRank[a.Medal] ?? 9) - (medalRank[b.Medal] ?? 9)
      );

      // How many rows fit in this lane?
      // laneH is typically poolH/8 ≈ 26px. Each row needs ~10px. Max 2 rows.
      const rowCount  = Math.min(2, Math.ceil(arr.length / maxPerRow) || 1);
      const rowStep   = laneH / (rowCount + 1);  // evenly space rows inside lane

      arr.forEach((d, i) => {
        const col = i % maxPerRow;
        const row = Math.floor(i / maxPerRow);
        const cx  = startX + col * COL_STEP;
        const cy  = poolY + (lane - 1) * laneH + rowStep * (row + 1);

        const payload = { name: d.Name, event: d.Event, medal: d.Medal, noc: d.NOC };
        const icon = appendSwimmerIcon(gMedals, cx, cy, d.Medal);
        icon.style('cursor', 'pointer')
          .on('mouseenter', (evt) => Tooltip.show(evt, payload))
          .on('mousemove',  (evt) => Tooltip.move(evt))
          .on('mouseleave', ()    => Tooltip.hide());
      });
    }
  }

  /* ─── Flag ───────────────────────────────────────────────────── */
  function drawFlag(g, { noc, x, y, w, h, opacity = 1 }) {
    if (noc === 'USA') {
      const gg = g.append('g').attr('transform',`translate(${x},${y})`).attr('opacity',opacity);
      gg.append('rect').attr('width',w).attr('height',h).attr('rx',3)
        .attr('fill','#fff').attr('stroke','rgba(0,0,0,0.3)');
      for (let i = 0; i < 6; i++)
        gg.append('rect').attr('x',0).attr('y',(i*h)/6).attr('width',w).attr('height',h/12)
          .attr('fill','#b22234').attr('opacity',0.9);
      gg.append('rect').attr('x',0).attr('y',0).attr('width',w*0.45).attr('height',h*0.55).attr('fill','#3c3b6e');
      d3.range(0,4).flatMap(ix => d3.range(0,3).map(iy => ({ix,iy}))).forEach(({ix,iy}) =>
        gg.append('circle').attr('cx',3.5+ix*4.5).attr('cy',3.2+iy*4.2).attr('r',0.8)
          .attr('fill','#fff').attr('opacity',0.9));
    } else if (noc === 'CHN') {
      const gg = g.append('g').attr('transform',`translate(${x},${y})`).attr('opacity',opacity);
      gg.append('rect').attr('width',w).attr('height',h).attr('rx',3)
        .attr('fill','#de2910').attr('stroke','rgba(0,0,0,0.3)');
      gg.append('polygon').attr('points',starPoints(7.5,6.2,4.1,1.7,5)).attr('fill','#ffde00');
      [{x:13.5,y:3.0,r:1.4},{x:15.5,y:5.2,r:1.4},{x:15.0,y:7.8,r:1.4},{x:13.0,y:9.8,r:1.4}]
        .forEach(s => gg.append('polygon')
          .attr('points',starPoints(s.x,s.y,s.r,s.r*0.45,5)).attr('fill','#ffde00').attr('opacity',0.95));
    }
  }

  function starPoints(cx, cy, outerR, innerR, num) {
    const pts = [];
    const step = Math.PI / num;
    for (let i = 0; i < 2*num; i++) {
      const r = i%2===0 ? outerR : innerR;
      const a = -Math.PI/2 + i*step;
      pts.push([cx + r*Math.cos(a), cy + r*Math.sin(a)]);
    }
    return pts.map(p => p.join(',')).join(' ');
  }

  window.renderSwimmingPools = renderSwimmingPools;
})();