/* viz4_goldrace.js — Medal Race Balance Scale
 * All internals are scoped in an IIFE to avoid
 * conflicts with shared.js globals (COLORS, tooltip, fmt, etc.)
 */
(function () {

  const COLORS = {
    usa: getCssVar('--usa', '#3b82f6'),
    chn: getCssVar('--chn', '#ef4444'),
    gold: getCssVar('--gold', '#e3bf5d'),
    silver: getCssVar('--silver', '#d9e0eb'),
    bronze: getCssVar('--bronze', '#cf8a4c'),
  };
  
  const tooltip = d3.select('#tooltip');
  
  const MODE_META = {
    Total: {
      label: 'Total Race',
      title: 'total medals',
      unit: 'event medals',
      filter: () => true,
      accent: '#dfe8f6',
      accentSoft: '#eef6ff',
      uiInk: '#f7fbff',
      uiMuted: '#cad6e8',
      axis: 'rgba(230,238,249,0.68)',
      ringFill: 'rgba(255,255,255,0.08)',
      ringStroke: 'rgba(219,231,246,0.22)',
      beam: 'url(#beamTotal)',
      card: 'url(#cardTotal)',
      pedestal: 'url(#pedestalTotal)',
      halo: 'url(#haloTotal)',
      className: 'mode-total',
    },
    Gold: {
      label: 'Gold Finish',
      title: 'gold medals',
      unit: 'gold event medals',
      filter: d => d.Medal === 'Gold',
      accent: COLORS.gold,
      accentSoft: '#fff1a8',
      uiInk: '#fff7e2',
      uiMuted: '#f0ddb0',
      axis: 'rgba(255,237,191,0.68)',
      ringFill: 'rgba(255,239,194,0.08)',
      ringStroke: 'rgba(255,228,151,0.22)',
      beam: 'url(#beamGold)',
      card: 'url(#cardGold)',
      pedestal: 'url(#pedestalGold)',
      halo: 'url(#haloGold)',
      className: 'mode-gold',
    },
    Silver: {
      label: 'Silver Finish',
      title: 'silver medals',
      unit: 'silver event medals',
      filter: d => d.Medal === 'Silver',
      accent: COLORS.silver,
      accentSoft: '#f6fbff',
      uiInk: '#f6f9fd',
      uiMuted: '#d5dde8',
      axis: 'rgba(230,238,247,0.66)',
      ringFill: 'rgba(246,251,255,0.08)',
      ringStroke: 'rgba(230,238,247,0.2)',
      beam: 'url(#beamSilver)',
      card: 'url(#cardSilver)',
      pedestal: 'url(#pedestalSilver)',
      halo: 'url(#haloSilver)',
      className: 'mode-silver',
    },
    Bronze: {
      label: 'Bronze Finish',
      title: 'bronze medals',
      unit: 'bronze event medals',
      filter: d => d.Medal === 'Bronze',
      accent: COLORS.bronze,
      accentSoft: '#ffd0ac',
      uiInk: '#fff1e8',
      uiMuted: '#edcbb7',
      axis: 'rgba(255,224,204,0.64)',
      ringFill: 'rgba(255,228,214,0.07)',
      ringStroke: 'rgba(255,205,171,0.2)',
      beam: 'url(#beamBronze)',
      card: 'url(#cardBronze)',
      pedestal: 'url(#pedestalBronze)',
      halo: 'url(#haloBronze)',
      className: 'mode-bronze',
    },
  };
  
  const STORY_MILESTONES = {
    1984: {
      pauseMs: 1500,
      text: '1984: China returns to the Summer Games and the rivalry becomes visible.',
    },
    2008: {
      pauseMs: 1700,
      text: '2008: Beijing turns medal pressure into a direct head-to-head contest.',
    },
    2024: {
      pauseMs: 1700,
      text: '2024: The balance is tight enough that each medal visibly shifts the scale.',
    },
  };
  
  function getCssVar(name, fallback) {
    const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return value || fallback;
  }
  
  function fmt(n) {
    return d3.format(',')(n);
  }
  
  function showTooltip(html, event) {
    tooltip.html(html)
      .style('opacity', 1)
      .style('left', `${event.clientX}px`)
      .style('top', `${event.clientY}px`);
  }
  
  function moveTooltip(event) {
    tooltip
      .style('left', `${event.clientX}px`)
      .style('top', `${event.clientY}px`);
  }
  
  function hideTooltip() {
    tooltip.style('opacity', 0);
  }
  
  function milestoneForYear(year) {
    return STORY_MILESTONES[year] || null;
  }
  
  function storyCaption(meta, year, leader, gap) {
    const milestone = milestoneForYear(year);
    if (milestone) return milestone.text;
    if (leader === 'Tied') return `${year}: USA and China are level in cumulative ${meta.title}.`;
    return `${year}: ${leader} leads by ${fmt(gap)} in cumulative ${meta.title}.`;
  }
  
  
  
  function renderGoldRace(data) {
    const host = d3.select('#viz4');
    const slider = document.getElementById('rivalYearSlider');
    const yearLabel = document.getElementById('rivalYearLabel');
    const headlineText = document.getElementById('raceModeHeadline');
    const sublineText = document.getElementById('raceModeSubline');
    const summary = document.getElementById('raceModeSummary');
    const playPauseBtn = document.getElementById('playPauseBtn');
    const restartBtn = document.getElementById('restartBtn');
    const speedSelect = document.getElementById('speedSelect');
    const playStateText = document.getElementById('playStateText');
    const filterButtons = Array.from(document.querySelectorAll('.gold-filter-btn'));
    if (!host.node() || !slider || !yearLabel || !playPauseBtn || !restartBtn || !speedSelect || !filterButtons.length) {
      return;
    }
  
    host.selectAll('*').remove();
  
    const medalRows = data.filter(d =>
      d.Season === 'Summer' &&
      (d.NOC === 'USA' || d.NOC === 'CHN') &&
      (d.Medal === 'Gold' || d.Medal === 'Silver' || d.Medal === 'Bronze')
    );
  
    const eventDedup = new Map();
    for (const d of medalRows) {
      const key = `${d.Year}|${d.NOC}|${d.Sport}|${d.Event}|${d.Medal}`;
      if (!eventDedup.has(key)) eventDedup.set(key, d);
    }
  
    const eventRows = Array.from(eventDedup.values());
    const years = d3.sort(Array.from(new Set(eventRows.map(d => d.Year))));
    const milestoneYears = new Set(years.filter(year => !!STORY_MILESTONES[year]));
  
    const seriesByMode = {};
    Object.entries(MODE_META).forEach(([mode, meta]) => {
      const filtered = eventRows.filter(meta.filter);
      const byYearNoc = d3.rollup(filtered, v => v.length, d => d.Year, d => d.NOC);
      seriesByMode[mode] = years.map(year => {
        const row = byYearNoc.get(year) || new Map();
        return {
          Year: year,
          USA: row.get('USA') || 0,
          CHN: row.get('CHN') || 0,
        };
      });
    });
  
    let currentMode = 'Total';
    let autoplayTimer = null;
    let autoplayDelay = +speedSelect.value;
    let isAutoplay = true;
  
    slider.min = 0;
    slider.max = Math.max(0, years.length - 1);
    slider.step = 1;
    slider.value = 0;
  
    const W = 1220;
    const scaleH = 360;
    const timelineH = 196;
    const H = scaleH + timelineH + 40;
    const svg = host.append('svg')
      .attr('width', W)
      .attr('height', H)
      .attr('viewBox', `0 0 ${W} ${H}`);
  
    const defs = svg.append('defs');
  
    const makeLinear = (id, stops, x1 = '0%', y1 = '0%', x2 = '100%', y2 = '0%') => {
      const grad = defs.append('linearGradient')
        .attr('id', id)
        .attr('x1', x1)
        .attr('y1', y1)
        .attr('x2', x2)
        .attr('y2', y2);
      stops.forEach(stop => {
        grad.append('stop')
          .attr('offset', stop.offset)
          .attr('stop-color', stop.color)
          .attr('stop-opacity', stop.opacity ?? 1);
      });
    };
  
    const makeRadial = (id, stops) => {
      const grad = defs.append('radialGradient')
        .attr('id', id)
        .attr('cx', '50%')
        .attr('cy', '50%')
        .attr('r', '60%');
      stops.forEach(stop => {
        grad.append('stop')
          .attr('offset', stop.offset)
          .attr('stop-color', stop.color)
          .attr('stop-opacity', stop.opacity ?? 1);
      });
    };
  
    makeLinear('beamTotal', [
      { offset: '0%', color: '#57aaf7' },
      { offset: '36%', color: '#98c6ff' },
      { offset: '52%', color: '#eff4ff' },
      { offset: '68%', color: '#f4bdc5' },
      { offset: '100%', color: '#ef5f6e' },
    ]);
    makeLinear('beamGold', [
      { offset: '0%', color: '#fff1aa' },
      { offset: '45%', color: '#efcb6d' },
      { offset: '100%', color: '#9d650e' },
    ]);
    makeLinear('beamSilver', [
      { offset: '0%', color: '#f7fbff' },
      { offset: '48%', color: '#dbe3ee' },
      { offset: '100%', color: '#8898aa' },
    ]);
    makeLinear('beamBronze', [
      { offset: '0%', color: '#ffd1ab' },
      { offset: '48%', color: '#d79258' },
      { offset: '100%', color: '#834623' },
    ]);
  
    makeLinear('cardTotal', [
      { offset: '0%', color: '#0f1b33' },
      { offset: '40%', color: '#23354e' },
      { offset: '70%', color: '#433445' },
      { offset: '100%', color: '#612532' },
    ], '0%', '0%', '100%', '100%');
    makeLinear('cardGold', [
      { offset: '0%', color: '#332004' },
      { offset: '55%', color: '#8b6116' },
      { offset: '100%', color: '#f0cf75' },
    ], '0%', '0%', '100%', '100%');
    makeLinear('cardSilver', [
      { offset: '0%', color: '#18222f' },
      { offset: '55%', color: '#6c7d92' },
      { offset: '100%', color: '#e1e8f2' },
    ], '0%', '0%', '100%', '100%');
    makeLinear('cardBronze', [
      { offset: '0%', color: '#2d1710' },
      { offset: '55%', color: '#814926' },
      { offset: '100%', color: '#da945c' },
    ], '0%', '0%', '100%', '100%');
  
    makeLinear('pedestalTotal', [
      { offset: '0%', color: '#0a1120' },
      { offset: '45%', color: '#26364a' },
      { offset: '100%', color: '#4b2e39' },
    ], '0%', '0%', '0%', '100%');
    makeLinear('pedestalGold', [
      { offset: '0%', color: '#1c1102' },
      { offset: '100%', color: '#735019' },
    ], '0%', '0%', '0%', '100%');
    makeLinear('pedestalSilver', [
      { offset: '0%', color: '#0d141d' },
      { offset: '100%', color: '#5e7088' },
    ], '0%', '0%', '0%', '100%');
    makeLinear('pedestalBronze', [
      { offset: '0%', color: '#1a0d08' },
      { offset: '100%', color: '#774529' },
    ], '0%', '0%', '0%', '100%');
  
    makeRadial('haloTotal', [
      { offset: '0%', color: '#eef4ff', opacity: 0.28 },
      { offset: '55%', color: '#b6cfff', opacity: 0.12 },
      { offset: '100%', color: '#b6cfff', opacity: 0 },
    ]);
    makeRadial('haloGold', [
      { offset: '0%', color: '#efcb6d', opacity: 0.48 },
      { offset: '55%', color: '#f6df96', opacity: 0.18 },
      { offset: '100%', color: '#f6df96', opacity: 0 },
    ]);
    makeRadial('haloSilver', [
      { offset: '0%', color: '#dbe3ee', opacity: 0.42 },
      { offset: '55%', color: '#eef4fb', opacity: 0.16 },
      { offset: '100%', color: '#eef4fb', opacity: 0 },
    ]);
    makeRadial('haloBronze', [
      { offset: '0%', color: '#d79258', opacity: 0.46 },
      { offset: '55%', color: '#f0b48a', opacity: 0.16 },
      { offset: '100%', color: '#f0b48a', opacity: 0 },
    ]);
    makeRadial('haloUsa', [
      { offset: '0%', color: COLORS.usa, opacity: 0.38 },
      { offset: '55%', color: COLORS.usa, opacity: 0.12 },
      { offset: '100%', color: COLORS.usa, opacity: 0 },
    ]);
    makeRadial('haloChn', [
      { offset: '0%', color: COLORS.chn, opacity: 0.34 },
      { offset: '55%', color: COLORS.chn, opacity: 0.11 },
      { offset: '100%', color: COLORS.chn, opacity: 0 },
    ]);
  
    const shadow = defs.append('filter')
      .attr('id', 'scaleShadow')
      .attr('x', '-20%')
      .attr('y', '-20%')
      .attr('width', '140%')
      .attr('height', '160%');
    shadow.append('feDropShadow')
      .attr('dx', 0)
      .attr('dy', 18)
      .attr('stdDeviation', 20)
      .attr('flood-color', '#000')
      .attr('flood-opacity', 0.26);
  
    const scaleG = svg.append('g').attr('transform', 'translate(0,18)');
    const timelineG = svg.append('g').attr('transform', `translate(0,${scaleH})`);
  
    const marginX = 60;
    const timelineW = W - marginX * 2;
    const baseY = timelineH - 78;
    const stitchR = 13;
    const x = d3.scaleLinear().domain(d3.extent(years)).range([marginX, marginX + timelineW]);
    const rowFor = (mode, year) => seriesByMode[mode].find(d => d.Year === year) || { Year: year, USA: 0, CHN: 0 };
    const cumUpTo = (mode, idx, key) => d3.sum(seriesByMode[mode].slice(0, idx + 1), d => d[key]);
  
    const axisG = timelineG.append('g')
      .attr('transform', `translate(0,${timelineH - 36})`)
      .call(d3.axisBottom(x).ticks(12).tickFormat(d3.format('d')));
  
    const trackBase = timelineG.append('line')
      .attr('x1', marginX)
      .attr('x2', marginX + timelineW)
      .attr('y1', baseY)
      .attr('y2', baseY)
      .attr('stroke-width', 8)
      .attr('stroke-linecap', 'round');
  
    const sceneHaloCenter = scaleG.append('ellipse')
      .attr('cx', W / 2)
      .attr('cy', 142)
      .attr('rx', 410)
      .attr('ry', 150)
      .attr('fill', MODE_META[currentMode].halo)
      .attr('opacity', 0.88);
  
    const sceneHaloUsa = scaleG.append('ellipse')
      .attr('cx', W / 2 - 260)
      .attr('cy', 150)
      .attr('rx', 200)
      .attr('ry', 120)
      .attr('fill', 'url(#haloUsa)')
      .attr('opacity', 0.72);
  
    const sceneHaloChn = scaleG.append('ellipse')
      .attr('cx', W / 2 + 260)
      .attr('cy', 150)
      .attr('rx', 200)
      .attr('ry', 120)
      .attr('fill', 'url(#haloChn)')
      .attr('opacity', 0.68);
  
    scaleG.append('ellipse')
      .attr('cx', W / 2)
      .attr('cy', 282)
      .attr('rx', 402)
      .attr('ry', 36)
      .attr('fill', 'rgba(0,0,0,0.24)');
  
    const beamRoot = scaleG.append('g').attr('transform', `translate(${W / 2}, 144)`);
  
    const pedestalSide = beamRoot.append('polygon')
      .attr('points', '-94,126 94,126 0,10')
      .attr('fill', MODE_META[currentMode].pedestal);
  
    const pedestalTop = beamRoot.append('rect')
      .attr('x', -126)
      .attr('y', 126)
      .attr('width', 252)
      .attr('height', 20)
      .attr('rx', 10)
      .attr('fill', MODE_META[currentMode].pedestal)
      .attr('opacity', 0.95);
  
    const beamGroup = beamRoot.append('g');
  
    beamGroup.append('line')
      .attr('x1', -344)
      .attr('x2', 344)
      .attr('y1', 36)
      .attr('y2', 36)
      .attr('stroke', 'rgba(0,0,0,0.28)')
      .attr('stroke-width', 18)
      .attr('stroke-linecap', 'round');
  
    const beamAccent = beamGroup.append('line')
      .attr('x1', -344)
      .attr('x2', 344)
      .attr('y1', 36)
      .attr('y2', 36)
      .attr('stroke', MODE_META[currentMode].beam)
      .attr('stroke-width', 12)
      .attr('stroke-linecap', 'round');
  
    const pivotGlow = beamGroup.append('circle')
      .attr('cx', 0)
      .attr('cy', 36)
      .attr('r', 26)
      .attr('fill', MODE_META[currentMode].accent)
      .attr('opacity', 0.24);
  
    const pivot = beamGroup.append('circle')
      .attr('cx', 0)
      .attr('cy', 36)
      .attr('r', 14)
      .attr('fill', '#0b111c');
  
    const hangL = beamGroup.append('line')
      .attr('x1', -320)
      .attr('x2', -320)
      .attr('y1', 36)
      .attr('y2', 132)
      .attr('stroke-width', 4);
  
    const hangR = beamGroup.append('line')
      .attr('x1', 320)
      .attr('x2', 320)
      .attr('y1', 36)
      .attr('y2', 132)
      .attr('stroke-width', 4);
  
    const plateL = beamGroup.append('line')
      .attr('x1', -382)
      .attr('x2', -258)
      .attr('y1', 134)
      .attr('y2', 134)
      .attr('stroke-width', 8)
      .attr('stroke-linecap', 'round');
  
    const plateR = beamGroup.append('line')
      .attr('x1', 258)
      .attr('x2', 382)
      .attr('y1', 134)
      .attr('y2', 134)
      .attr('stroke-width', 8)
      .attr('stroke-linecap', 'round');
  
    const weightUSA = beamGroup.append('g').attr('transform', 'translate(-320,0)');
    const weightCHN = beamGroup.append('g').attr('transform', 'translate(320,0)');
  
    function drawWeightCard(g, team, teamColor) {
      g.append('rect')
        .attr('class', 'body')
        .attr('x', -90)
        .attr('y', 134)
        .attr('width', 180)
        .attr('height', 98)
        .attr('rx', 26)
        .attr('fill', MODE_META[currentMode].card)
        .attr('filter', 'url(#scaleShadow)');
  
      g.append('rect')
        .attr('class', 'badge')
        .attr('x', -70)
        .attr('y', 150)
        .attr('width', 56)
        .attr('height', 22)
        .attr('rx', 11)
        .attr('fill', teamColor)
        .attr('opacity', 0.98);
  
      g.append('text')
        .attr('class', 'team')
        .attr('x', -42)
        .attr('y', 165)
        .attr('text-anchor', 'middle')
        .attr('fill', '#fff')
        .attr('font-size', 11)
        .attr('font-weight', 900)
        .attr('letter-spacing', '.14em')
        .text(team);
  
      g.append('text')
        .attr('class', 'label')
        .attr('x', -62)
        .attr('y', 188)
        .attr('fill', MODE_META[currentMode].uiMuted)
        .attr('font-size', 11)
        .attr('font-weight', 800)
        .attr('letter-spacing', '.12em')
        .text('CUMULATIVE');
  
      g.append('text')
        .attr('class', 'count')
        .attr('x', -62)
        .attr('y', 222)
        .attr('fill', MODE_META[currentMode].uiInk)
        .attr('font-size', 42)
        .attr('font-weight', 900);
    }
  
    drawWeightCard(weightUSA, 'USA', COLORS.usa);
    drawWeightCard(weightCHN, 'CHN', COLORS.chn);
  
    const arc = d3.arc().innerRadius(stitchR - 6).outerRadius(stitchR);
    const stitches = timelineG.selectAll('g.stitch')
      .data(years.map(year => ({ Year: year })))
      .enter()
      .append('g')
      .attr('class', 'stitch')
      .attr('transform', d => `translate(${x(d.Year)},${baseY})`)
      .style('cursor', 'pointer')
      .on('mousemove', (event, d) => {
        const row = rowFor(currentMode, d.Year);
        const leader = row.USA === row.CHN ? 'Tied' : (row.USA > row.CHN ? 'USA' : 'China');
        const gap = Math.abs(row.USA - row.CHN);
        const meta = MODE_META[currentMode];
        showTooltip(`
          <div><b>${d.Year} · ${meta.label.toUpperCase()}</b></div>
          <div><span style="display:inline-block;width:10px;height:10px;border-radius:999px;background:${COLORS.usa};margin-right:6px"></span>USA ${meta.title}: ${fmt(row.USA)}</div>
          <div><span style="display:inline-block;width:10px;height:10px;border-radius:999px;background:${COLORS.chn};margin-right:6px"></span>China ${meta.title}: ${fmt(row.CHN)}</div>
          <div class="k">Leader: ${leader}${leader === 'Tied' ? '' : ` · Gap ${fmt(gap)}`}</div>
        `, event);
        moveTooltip(event);
      })
      .on('mouseleave', hideTooltip)
      .on('click', (_, d) => {
        stopAutoplay();
        slider.value = years.indexOf(d.Year);
        update();
      });
  
    stitches.append('circle')
      .attr('class', 'ring')
      .attr('r', stitchR + 1.5);
  
    stitches.append('path').attr('class', 'arcUSA');
    stitches.append('path').attr('class', 'arcCHN');
  
    stitches.append('circle')
      .attr('class', 'knot')
      .attr('r', 4);
  
    const selMark = timelineG.append('circle')
      .attr('r', stitchR + 8)
      .attr('fill', 'none')
      .attr('stroke', MODE_META[currentMode].accent)
      .attr('stroke-width', 3)
      .attr('opacity', 0);
  
    function currentYear() {
      return years[+slider.value] ?? years[0];
    }
  
    function setPlayState(text) {
      if (playStateText) playStateText.textContent = text;
    }
  
    function pauseDelayForYear(year) {
      const milestone = milestoneForYear(year);
      return autoplayDelay + (milestone ? milestone.pauseMs : 0);
    }
  
    function clearAutoplayTimer() {
      if (autoplayTimer) clearTimeout(autoplayTimer);
      autoplayTimer = null;
    }
  
    function queueAutoplay(delay) {
      clearAutoplayTimer();
      if (!isAutoplay) return;
      autoplayTimer = setTimeout(stepAutoplay, delay);
    }
  
    function applyModeTheme() {
      const meta = MODE_META[currentMode];
      Object.values(MODE_META).forEach(mode => {
        document.body.classList.remove(mode.className);
      });
      document.body.classList.add(meta.className);
    }
  
    function applyModeButtons() {
      filterButtons.forEach(btn => {
        const isActive = btn.dataset.mode === currentMode;
        btn.classList.toggle('is-active', isActive);
        btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      });
    }
  
    function update() {
      const idx = +slider.value;
      const selectedYear = years[idx] ?? years[0];
      const meta = MODE_META[currentMode];
      const usaCum = cumUpTo(currentMode, idx, 'USA');
      const chnCum = cumUpTo(currentMode, idx, 'CHN');
      const total = usaCum + chnCum;
      const diff = usaCum - chnCum;
      const leader = diff === 0 ? 'Tied' : (diff > 0 ? 'USA' : 'China');
      const gap = Math.abs(diff);
  
      applyModeTheme();
      yearLabel.textContent = selectedYear;
      if (summary) summary.textContent = storyCaption(meta, selectedYear, leader, gap);
  
      const share = total === 0 ? 0 : diff / total;
      const angle = 10 * share;
      const rivalryGlow = currentMode === 'Total' ? 0.74 : 0.14;
  
      beamGroup.transition().duration(340)
        .attr('transform', `rotate(${-angle})`);
  
      sceneHaloCenter.transition().duration(260).attr('fill', meta.halo).attr('opacity', currentMode === 'Total' ? 0.76 : 0.9);
      sceneHaloUsa.transition().duration(260).attr('opacity', rivalryGlow);
      sceneHaloChn.transition().duration(260).attr('opacity', rivalryGlow);
      pedestalSide.transition().duration(260).attr('fill', meta.pedestal);
      pedestalTop.transition().duration(260).attr('fill', meta.pedestal);
      beamAccent.transition().duration(260).attr('stroke', meta.beam);
      pivotGlow.transition().duration(260).attr('fill', meta.accent);
      selMark.transition().duration(260).attr('stroke', meta.accent);
      hangL.transition().duration(260).attr('stroke', meta.accent).attr('opacity', 0.52);
      hangR.transition().duration(260).attr('stroke', meta.accent).attr('opacity', 0.52);
      plateL.transition().duration(260).attr('stroke', meta.accent).attr('opacity', 0.6);
      plateR.transition().duration(260).attr('stroke', meta.accent).attr('opacity', 0.6);
  
      weightUSA.select('.body').transition().duration(260).attr('fill', meta.card);
      weightCHN.select('.body').transition().duration(260).attr('fill', meta.card);
      weightUSA.select('.label').transition().duration(260).attr('fill', meta.uiMuted);
      weightCHN.select('.label').transition().duration(260).attr('fill', meta.uiMuted);
      weightUSA.select('.count').text(fmt(usaCum)).transition().duration(260).attr('fill', meta.uiInk);
      weightCHN.select('.count').text(fmt(chnCum)).transition().duration(260).attr('fill', meta.uiInk);
  
      if (headlineText) {
        headlineText.textContent = leader === 'Tied'
          ? `${selectedYear} · USA and China are tied in cumulative ${meta.title}`
          : `${selectedYear} · ${leader} leads in cumulative ${meta.title} (gap: ${fmt(gap)})`;
        headlineText.style.color = meta.uiInk;
      }
      if (sublineText) {
        sublineText.textContent = `USA ${fmt(usaCum)} · China ${fmt(chnCum)} · counted on an event-medal basis`;
        sublineText.style.color = meta.uiMuted;
      }
  
      axisG.selectAll('.tick text').attr('fill', meta.axis).attr('font-size', 12);
      axisG.selectAll('.tick line').attr('stroke', meta.ringStroke).attr('opacity', 0.8);
      axisG.select('.domain').attr('stroke', meta.ringStroke).attr('opacity', 0.65);
      trackBase.attr('stroke', meta.ringStroke).attr('opacity', 0.8);
  
      stitches.each(function(d) {
        const g = d3.select(this);
        const row = rowFor(currentMode, d.Year);
        const sum = row.USA + row.CHN;
        const usaP = sum === 0 ? 0.5 : row.USA / sum;
        const isMilestone = milestoneYears.has(d.Year);
  
        g.select('.ring')
          .attr('r', isMilestone ? stitchR + 3 : stitchR + 1.5)
          .attr('fill', meta.ringFill)
          .attr('stroke', isMilestone ? meta.accent : meta.ringStroke)
          .attr('stroke-width', isMilestone ? 2.2 : 1.5);
  
        g.select('.arcUSA')
          .attr('d', arc({ startAngle: -Math.PI / 2, endAngle: -Math.PI / 2 + usaP * 2 * Math.PI }))
          .attr('fill', COLORS.usa);
  
        g.select('.arcCHN')
          .attr('d', arc({ startAngle: -Math.PI / 2 + usaP * 2 * Math.PI, endAngle: 1.5 * Math.PI }))
          .attr('fill', COLORS.chn);
  
        g.select('.knot')
          .attr('cx', (usaP - 0.5) * (stitchR - 3))
          .attr('cy', 0)
          .attr('r', isMilestone ? 5 : 4)
          .attr('fill', meta.accentSoft);
  
        g.attr('opacity', d.Year > selectedYear ? 0.24 : 1);
      });
  
      selMark
        .attr('cx', x(selectedYear))
        .attr('cy', baseY)
        .attr('opacity', 1);
  
      applyModeButtons();
    }
  
    function stepAutoplay() {
      const maxIdx = years.length - 1;
      if (+slider.value >= maxIdx) {
        slider.value = 0;
      } else {
        slider.value = +slider.value + 1;
      }
      update();
      const year = currentYear();
      const milestone = milestoneForYear(year);
      setPlayState(milestone ? `Story pause ${year}` : 'Autoplay on');
      queueAutoplay(pauseDelayForYear(year));
    }
  
    function startAutoplay() {
      clearAutoplayTimer();
      isAutoplay = true;
      playPauseBtn.textContent = 'Pause';
      const year = currentYear();
      const milestone = milestoneForYear(year);
      setPlayState(milestone ? `Story pause ${year}` : 'Autoplay on');
      queueAutoplay(pauseDelayForYear(year));
    }
  
    function stopAutoplay() {
      isAutoplay = false;
      clearAutoplayTimer();
      playPauseBtn.textContent = 'Play';
      setPlayState('Autoplay paused');
    }
  
    filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const nextMode = btn.dataset.mode;
        if (!MODE_META[nextMode] || nextMode === currentMode) return;
        currentMode = nextMode;
        stopAutoplay();
        update();
      });
    });
  
    slider.addEventListener('input', () => {
      stopAutoplay();
      update();
    });
  
    playPauseBtn.addEventListener('click', () => {
      if (isAutoplay) {
        stopAutoplay();
      } else {
        startAutoplay();
      }
    });
  
    restartBtn.addEventListener('click', () => {
      slider.value = 0;
      update();
      startAutoplay();
    });
  
    speedSelect.addEventListener('change', () => {
      autoplayDelay = +speedSelect.value;
      if (isAutoplay) startAutoplay();
    });
  
    applyModeButtons();
    update();
    startAutoplay();
  }
  
    // Expose the entry point for shared.js to call
    window.renderGoldRace = renderGoldRace;
  
  })();