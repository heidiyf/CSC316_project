/* swimming.js  — fixed edition
   Changes from swimming3_0.js:
     1. Removed all CSS entrance animations on swimmer icons (was causing opacity:0 bug)
     2. Fixed swimmer overflow: icons now wrap within pool bounds
     3. Kept full medal-color swimmer silhouettes (gold/silver/bronze body color)

   Requires D3 v7 loaded globally.

   Expected DOM IDs:
     #yearSlider  #swimYearLabel  #gapText
     #swimUSALabel  #swimCHNLabel
     #swimUSA  #swimCHN
     #swimCompareBar  (optional — auto-created if missing)

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

      .swim-finals-grid {
        display:grid;
        grid-template-columns:repeat(auto-fit, minmax(280px, 1fr));
        gap:16px;
      }
      .swim-final-card {
        border-radius:20px;
        padding:16px 16px 14px;
        background:linear-gradient(180deg, rgba(13,30,51,0.96) 0%, rgba(7,16,31,0.98) 100%);
        border:1px solid rgba(59,130,246,0.22);
        box-shadow:0 14px 34px rgba(2,8,23,0.45);
      }
      .swim-finals-toolbar {
        display:flex;
        flex-wrap:wrap;
        align-items:center;
        gap:10px;
        margin:0 0 16px;
      }
      .swim-finals-toolbar-label {
        font-size:12px;
        font-weight:800;
        letter-spacing:0.08em;
        text-transform:uppercase;
        color:#cbd5e1;
        margin-right:2px;
      }
      .swim-finals-action {
        appearance:none;
        border-radius:999px;
        border:1px solid rgba(148,163,184,0.16);
        background:rgba(15,23,42,0.88);
        color:#cbd5e1;
        cursor:pointer;
        padding:8px 12px;
        font-size:12px;
        font-weight:700;
        transition:transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease, color 0.18s ease, border-color 0.18s ease;
        box-shadow:0 8px 18px rgba(2,8,23,0.22);
      }
      .swim-finals-action:hover {
        transform:translateY(-1px);
      }
      .swim-finals-action {
        background:rgba(29,78,216,0.14);
        border-color:rgba(59,130,246,0.22);
        color:#bfdbfe;
        box-shadow:0 12px 24px rgba(2,8,23,0.26);
      }
      .swim-final-top {
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:10px;
        margin-bottom:10px;
      }
      .swim-final-kicker,
      .swim-final-gap-tag {
        display:inline-flex;
        align-items:center;
        padding:5px 10px;
        border-radius:999px;
        font-size:11px;
        font-weight:800;
        letter-spacing:0.08em;
        text-transform:uppercase;
      }
      .swim-final-kicker {
        background:rgba(148,163,184,0.14);
        color:#cbd5e1;
      }
      .swim-final-gap-tag {
        background:rgba(34,197,94,0.14);
        color:#86efac;
      }
      .swim-final-event {
        margin:0 0 6px;
        font-size:18px;
        line-height:1.2;
        color:#f8fafc;
      }
      .swim-final-copy {
        margin:0 0 12px;
        font-size:13px;
        line-height:1.5;
        color:#cbd5e1;
      }
      .swim-final-stage {
        width:100%;
        margin-bottom:10px;
      }
      .swim-final-stage svg {
        display:block;
        width:100%;
        height:auto;
      }
      .swim-final-times {
        display:grid;
        gap:6px;
      }
      .swim-final-time-row {
        display:grid;
        grid-template-columns:auto minmax(0, 1fr) auto;
        align-items:center;
        gap:8px;
        font-size:13px;
        color:#cbd5e1;
      }
      .swim-final-time-row.is-winner {
        font-weight:800;
        color:#f8fafc;
      }
      .swim-final-noc {
        padding:4px 8px;
        border-radius:999px;
        font-size:11px;
        font-weight:800;
        letter-spacing:0.08em;
        text-transform:uppercase;
      }
      .swim-final-name {
        min-width:0;
        overflow:hidden;
        text-overflow:ellipsis;
        white-space:nowrap;
      }
      .swim-final-time {
        font-variant-numeric:tabular-nums;
        font-weight:800;
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

  function parseSwimTime(value) {
    const text = String(value ?? '').trim();
    if (!text) return NaN;
    if (!text.includes(':')) return Number(text);

    const parts = text.split(':');
    if (parts.length !== 2) return Number(text.replace(':', '.'));

    const left = Number(parts[0]);
    const right = parts[1];

    if (right.includes('.')) {
      return left * 60 + Number(right);
    }

    return Number(`${left}.${right}`);
  }

  function formatSwimTime(value) {
    return Number.isFinite(value) ? value.toFixed(2) : '—';
  }

  const PARIS_2024_SWIM_FINALS = [
    {
      event: "Men's 100m Backstroke",
      swimmers: [
        { noc: 'CHN', name: 'Jiayu Xu', rawTime: '52:32' },
        { noc: 'USA', name: 'Ryan Murphy', rawTime: '52:39' },
      ],
    },
    {
      event: "Men's 100m Breaststroke",
      swimmers: [
        { noc: 'USA', name: 'Nic Fink', rawTime: '59:05' },
        { noc: 'CHN', name: 'Haiyang Qin', rawTime: '59.50' },
      ],
    },
    {
      event: "Men's 100m Freestyle",
      swimmers: [
        { noc: 'CHN', name: 'Zhanle Pan', rawTime: '46.40' },
        { noc: 'USA', name: 'Jack Alexy', rawTime: '47.96' },
      ],
    },
    {
      event: "Women's 100m Butterfly",
      swimmers: [
        { noc: 'USA', name: 'Torri Huske', rawTime: '55.59' },
        { noc: 'CHN', name: 'Yufei Zhang', rawTime: '56.21' },
      ],
    },
  ].map(match => ({
    ...match,
    swimmers: match.swimmers.map(swimmer => {
      const time = parseSwimTime(swimmer.rawTime);
      return {
        ...swimmer,
        time,
        timeLabel: formatSwimTime(time),
      };
    }),
  }));

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
    const anchor = document.getElementById('swimUSALabel') || document.getElementById('swimUSA');
    if (!bar) {
      if (anchor && anchor.parentNode) {
        bar = document.createElement('div');
        bar.id = 'swimCompareBar';
        anchor.parentNode.insertBefore(bar, anchor);
      }
    }
    if (!bar) return null;
    if (anchor && bar !== anchor.previousElementSibling) {
      anchor.parentNode.insertBefore(bar, anchor);
    }
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
    document.getElementById('swimToggle')?.remove();
    renderParisFinalsHeadToHead();

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

    const compareBar = ensureCompareBar();

    const W = Math.max(900, Math.floor(hostUSA.node().getBoundingClientRect().width || 1200));
    const H = 260;

    // Build both SVGs up front
    const svgUSA = hostUSA.append('svg').attr('width', W).attr('height', H);
    const svgCHN = hostCHN.append('svg').attr('width', W).attr('height', H);

    drawPoolFrame(svgUSA, { noc: 'USA', W, H });
    drawPoolFrame(svgCHN, { noc: 'CHN', W, H });

    hostUSA.style('display', null);
    hostCHN.style('display', null);
    if (usaLabel) usaLabel.style.display = '';
    if (chnLabel) chnLabel.style.display = '';
    if (compareBar) compareBar.style.display = '';

    function updateLabels() {
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
    }

    function update() {
      const y = years[+slider.value] ?? years[years.length - 1];
      yearLabel.textContent = y;

      const usa = swimRows.filter(d => +d.Year === y && d.NOC === 'USA');
      const chn = swimRows.filter(d => +d.Year === y && d.NOC === 'CHN');

      drawPoolMedals(svgUSA, usa);
      drawPoolMedals(svgCHN, chn);
      updateLabels();
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

    // Keep the flag above the lane-number stack so lane 1 stays visible.
    drawFlag(g, { noc, x: 14, y: Math.max(2, poolY - 18), w: 34, h: 21, opacity: 0.95 });

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

  function getSwimFinalResult(match) {
    const ordered = match.swimmers.slice().sort((a, b) => a.time - b.time);
    return {
      winner: ordered[0],
      loser: ordered[1],
      gap: Math.max(0, (ordered[1]?.time ?? 0) - (ordered[0]?.time ?? 0)),
    };
  }

  function getSwimFinalGapTag(gap) {
    if (gap <= 0.1) return 'Photo finish';
    if (gap <= 0.5) return 'Tight finish';
    return 'Clear lead';
  }

  function ensureSwimFinalControls(host) {
    if (!host) return null;

    let controls = document.getElementById('parisFinalsControls');
    if (!controls) {
      controls = document.createElement('div');
      controls.id = 'parisFinalsControls';
      host.parentNode?.insertBefore(controls, host);
    }
    return controls;
  }

  function buildSwimFinalControls(host) {
    const controls = ensureSwimFinalControls(host);
    if (!controls) return;

    controls.className = 'swim-finals-toolbar';
    controls.innerHTML = '';

    const label = document.createElement('span');
    label.className = 'swim-finals-toolbar-label';
    label.textContent = 'Animation';
    controls.appendChild(label);

    const replayBtn = document.createElement('button');
    replayBtn.type = 'button';
    replayBtn.className = 'swim-finals-action';
    replayBtn.textContent = 'Play races';
    replayBtn.addEventListener('click', () => {
      renderParisFinalsHeadToHead({ animate: true });
    });
    controls.appendChild(replayBtn);
  }

  function appendAnimatedRaceSwimmer(parent, color, isWinner) {
    if (isWinner) {
      parent.append('circle')
        .attr('r', 18)
        .attr('fill', color)
        .attr('opacity', 0.12);
    }

    parent.append('path')
      .attr('d', 'M -56 0 Q -48 -6 -40 0 T -24 0 T -8 0')
      .attr('fill', 'none')
      .attr('stroke', color)
      .attr('stroke-width', 2.2)
      .attr('opacity', 0.28)
      .attr('stroke-linecap', 'round')
      .attr('stroke-dasharray', '8 7');

    const body = parent.append('g');

    body.append('line')
      .attr('x1', -38)
      .attr('y1', 0)
      .attr('x2', 2)
      .attr('y2', 0)
      .attr('stroke', color)
      .attr('stroke-width', 5)
      .attr('stroke-linecap', 'round')
      .attr('opacity', 0.24);

    body.append('line')
      .attr('x1', 4)
      .attr('y1', 0)
      .attr('x2', 22)
      .attr('y2', -8)
      .attr('stroke', color)
      .attr('stroke-width', 2.4)
      .attr('stroke-linecap', 'round');

    const legTop = body.append('line')
      .attr('x1', -10)
      .attr('y1', 0)
      .attr('x2', -24)
      .attr('y2', -4)
      .attr('stroke', color)
      .attr('stroke-width', 2.1)
      .attr('stroke-linecap', 'round');

    const legBottom = body.append('line')
      .attr('x1', -10)
      .attr('y1', 0)
      .attr('x2', -24)
      .attr('y2', 5)
      .attr('stroke', color)
      .attr('stroke-width', 2.1)
      .attr('stroke-linecap', 'round');

    body.append('ellipse')
      .attr('cx', -1)
      .attr('cy', 0)
      .attr('rx', 14)
      .attr('ry', 5.8)
      .attr('fill', color);

    body.append('circle')
      .attr('cx', 12)
      .attr('cy', -4)
      .attr('r', 4.1)
      .attr('fill', color);
  }

  function animateSwimRaceOnce(marker, { startX, endX, y, delayMs = 0, durationMs = 2200 }) {
    marker
      .attr('transform', `translate(${startX},${y})`)
      .transition()
      .delay(delayMs)
      .duration(durationMs)
      .ease(d3.easeCubicInOut)
      .attrTween('transform', () => {
        const ix = d3.interpolateNumber(startX, endX);
        return t => {
          const bob = Math.sin(t * Math.PI * 5) * 1.7;
          return `translate(${ix(t)},${y + bob})`;
        };
      });
  }

  function renderParisFinalsHeadToHead({ animate = false } = {}) {
    const host = document.getElementById('parisFinalsHeadToHead');
    if (!host) return;

    buildSwimFinalControls(host);
    host.innerHTML = '';

    const grid = document.createElement('div');
    grid.className = 'swim-finals-grid';
    host.appendChild(grid);

    const maxGap = d3.max(PARIS_2024_SWIM_FINALS, match => getSwimFinalResult(match).gap) || 1;

    PARIS_2024_SWIM_FINALS.forEach(match => {
      const result = getSwimFinalResult(match);
      const swimmersByNoc = new Map(match.swimmers.map(swimmer => [swimmer.noc, swimmer]));
      const order = ['CHN', 'USA'].filter(noc => swimmersByNoc.has(noc));

      const rowsHtml = order.map(noc => {
        const swimmer = swimmersByNoc.get(noc);
        const isWinner = swimmer.noc === result.winner.noc;
        const pillStyle = swimmer.noc === 'USA'
          ? 'background:rgba(59,130,246,0.18);color:#bfdbfe;'
          : 'background:rgba(239,68,68,0.18);color:#fecaca;';

        return `
          <div class="swim-final-time-row${isWinner ? ' is-winner' : ''}">
            <span class="swim-final-noc" style="${pillStyle}">${swimmer.noc}</span>
            <span class="swim-final-name">${swimmer.name}</span>
            <span class="swim-final-time">${swimmer.timeLabel}</span>
          </div>
        `;
      }).join('');

      const card = document.createElement('article');
      card.className = 'swim-final-card';
      card.innerHTML = `
        <div class="swim-final-top">
          <span class="swim-final-kicker">Paris 2024 final</span>
          <span class="swim-final-gap-tag">${getSwimFinalGapTag(result.gap)}</span>
        </div>
        <h4 class="swim-final-event">${match.event}</h4>
        <p class="swim-final-copy"><b>${result.winner.name}</b> (${result.winner.noc}) touched first by ${result.gap.toFixed(2)}s over ${result.loser.name}.</p>
        <div class="swim-final-stage"></div>
        <div class="swim-final-times">${rowsHtml}</div>
      `;

      grid.appendChild(card);
      drawHeadToHeadFinal(card.querySelector('.swim-final-stage'), match, maxGap, { animate });
    });
  }

  function drawHeadToHeadFinal(container, match, maxGap, { animate = false } = {}) {
    if (!container) return;

    const result = getSwimFinalResult(match);
    if (!result.winner || !result.loser) return;

    const swimmersByNoc = new Map(match.swimmers.map(swimmer => [swimmer.noc, swimmer]));
    const laneNocs = ['CHN', 'USA'].filter(noc => swimmersByNoc.has(noc));
    const W = 430;
    const H = 152;
    const poolX = 88;
    const poolY = 18;
    const poolW = W - poolX - 14;
    const poolH = 84;
    const laneH = poolH / Math.max(2, laneNocs.length || 2);
    const finishX = poolX + poolW - 22;
    const startX = poolX + 22;
    const gapScale = d3.scaleLinear()
      .domain([0, Math.max(maxGap, 0.05)])
      .range([0, poolW * 0.42]);
    const durationScale = d3.scaleLinear()
      .domain([0, Math.max(maxGap, 0.05)])
      .range([0, 700]);

    const finishByNoc = new Map([
      [result.winner.noc, finishX],
      [result.loser.noc, finishX - gapScale(result.gap)],
    ]);

    const svg = d3.select(container)
      .append('svg')
      .attr('viewBox', `0 0 ${W} ${H}`)
      .attr('role', 'img')
      .attr('aria-label', `${match.event}: ${result.winner.name} beat ${result.loser.name} by ${result.gap.toFixed(2)} seconds.`);

    const defs = svg.append('defs');
    const gradientId = `parisFinalPool_${match.event.replace(/\W+/g, '_')}`;
    const gradient = defs.append('linearGradient')
      .attr('id', gradientId)
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '100%')
      .attr('y2', '100%');

    gradient.append('stop').attr('offset', '0%').attr('stop-color', '#0f4977');
    gradient.append('stop').attr('offset', '100%').attr('stop-color', '#0b7fb1');

    svg.append('rect')
      .attr('x', poolX)
      .attr('y', poolY)
      .attr('width', poolW)
      .attr('height', poolH)
      .attr('rx', 18)
      .attr('fill', `url(#${gradientId})`)
      .attr('stroke', 'rgba(125,211,252,0.5)')
      .attr('stroke-width', 2);

    laneNocs.forEach((noc, index) => {
      const swimmer = swimmersByNoc.get(noc);
      const y = poolY + laneH * (index + 0.5);
      const color = noc === 'USA' ? '#60a5fa' : '#f87171';
      const markerX = finishByNoc.get(noc) ?? startX;
      const labelAnchor = markerX > finishX - 36 ? 'end' : 'start';
      const labelX = labelAnchor === 'end' ? -18 : 18;
      const isWinner = noc === result.winner.noc;
      const durationMs = 1650 + durationScale(Math.max(0, swimmer.time - result.winner.time));

      svg.append('rect')
        .attr('x', poolX + 4)
        .attr('y', poolY + laneH * index + 2)
        .attr('width', poolW - 8)
        .attr('height', laneH - 4)
        .attr('rx', 12)
        .attr('fill', 'rgba(255,255,255,0.1)');

      svg.append('line')
        .attr('x1', poolX + 8)
        .attr('x2', poolX + poolW - 8)
        .attr('y1', y)
        .attr('y2', y)
        .attr('stroke', 'rgba(255,255,255,0.45)')
        .attr('stroke-width', 1.2)
        .attr('stroke-dasharray', '6,6');

      const label = svg.append('g');
      label.append('rect')
        .attr('x', 10)
        .attr('y', y - 11)
        .attr('width', 58)
        .attr('height', 22)
        .attr('rx', 11)
        .attr('fill', color)
        .attr('opacity', 0.16);
      label.append('text')
        .attr('x', 39)
        .attr('y', y + 4)
        .attr('text-anchor', 'middle')
        .attr('font-size', 11)
        .attr('font-weight', 800)
        .attr('letter-spacing', '1px')
        .attr('fill', color)
        .text(noc);

      const marker = svg.append('g')
        .attr('transform', `translate(${animate ? startX : markerX},${y})`);

      appendAnimatedRaceSwimmer(marker, color, isWinner);

      marker.append('text')
        .attr('x', labelX)
        .attr('y', -12)
        .attr('text-anchor', labelAnchor)
        .attr('font-size', 12)
        .attr('font-weight', 800)
        .attr('fill', COLORS.ink)
        .text(swimmer.timeLabel);

      if (animate) {
        animateSwimRaceOnce(marker, {
          startX,
          endX: markerX,
          y,
          delayMs: index * 160,
          durationMs,
        });
      }
    });

    svg.append('text')
      .attr('x', poolX + 4)
      .attr('y', poolY - 6)
      .attr('font-size', 10)
      .attr('font-weight', 800)
      .attr('letter-spacing', '1.5px')
      .attr('fill', COLORS.muted)
      .text('START');

    svg.append('text')
      .attr('x', finishX)
      .attr('y', poolY - 6)
      .attr('text-anchor', 'end')
      .attr('font-size', 10)
      .attr('font-weight', 800)
      .attr('letter-spacing', '1.5px')
      .attr('fill', COLORS.muted)
      .text('FINISH');

    d3.range(0, 5).forEach(index => {
      svg.append('rect')
        .attr('x', finishX + 4 + index * 4)
        .attr('y', poolY + 4)
        .attr('width', 2)
        .attr('height', poolH - 8)
        .attr('fill', index % 2 === 0 ? 'rgba(226,232,240,0.8)' : 'rgba(15,23,42,0.92)');
    });

    const loserX = finishByNoc.get(result.loser.noc) ?? finishX;
    const winnerX = finishByNoc.get(result.winner.noc) ?? finishX;
    const gapY = poolY + poolH + 18;

    svg.append('line')
      .attr('x1', loserX)
      .attr('x2', winnerX)
      .attr('y1', gapY)
      .attr('y2', gapY)
      .attr('stroke', 'rgba(226,232,240,0.65)')
      .attr('stroke-width', 1.5);

    svg.append('line')
      .attr('x1', loserX)
      .attr('x2', loserX)
      .attr('y1', gapY - 5)
      .attr('y2', gapY + 5)
      .attr('stroke', 'rgba(226,232,240,0.65)')
      .attr('stroke-width', 1.5);

    svg.append('line')
      .attr('x1', winnerX)
      .attr('x2', winnerX)
      .attr('y1', gapY - 5)
      .attr('y2', gapY + 5)
      .attr('stroke', 'rgba(226,232,240,0.65)')
      .attr('stroke-width', 1.5);

    svg.append('text')
      .attr('x', (loserX + winnerX) / 2)
      .attr('y', gapY - 8)
      .attr('text-anchor', 'middle')
      .attr('font-size', 11)
      .attr('font-weight', 800)
      .attr('fill', COLORS.ink)
      .text(`${result.gap.toFixed(2)}s gap`);
  }

  window.renderSwimmingPools = renderSwimmingPools;
})();