/* viz1_dominance.js — USA Dominance stacked area + closest challenger
 * CSC316 Final Project
 * Requires: COLORS, MEDAL_ORDER, MEDAL_COLOR, fmt, safeNode, showTooltip,
 *           moveTooltip, hideTooltip  (defined in shared.js)
 * DOM IDs:  #viz1  #toggleChallenger
 */

// 1) USA dominance + top challenger (EVENT medals)
//    (derived by de-duplicating athlete rows; team events counted once per event)
// ---------------------------
function renderDominance(data) {
  const host = safeNode('#viz1');
  if (!host) return;
  host.selectAll('*').remove();

  const rows = data.filter(d => d.Season === 'Summer' && d.Medal !== 'No medal');

  // De-duplicate to event-level medals: (Year, NOC, Sport, Event, Medal)
  const dedup = new Map();
  for (const d of rows) {
    if (d.Medal !== 'Gold' && d.Medal !== 'Silver' && d.Medal !== 'Bronze') continue;
    const k = `${d.Year}|${d.NOC}|${d.Sport}|${d.Event}|${d.Medal}`;
    if (!dedup.has(k)) dedup.set(k, d);
  }
  const eventRows = Array.from(dedup.values());

  // NOC -> display name (Team)
  const nocName = new Map();
  for (const d of eventRows) {
    if (!nocName.has(d.NOC)) nocName.set(d.NOC, d.Team);
  }

  const years = d3.sort(Array.from(new Set(eventRows.map(d => d.Year))));

  const byYearUSA = d3.rollup(
    eventRows.filter(d => d.NOC === 'USA'),
    v => ({
      Gold: v.filter(d => d.Medal === 'Gold').length,
      Silver: v.filter(d => d.Medal === 'Silver').length,
      Bronze: v.filter(d => d.Medal === 'Bronze').length,
    }),
    d => d.Year
  );

  // Closest non-USA team (by total event medals that year)
  const byYearChallenger = d3.rollup(
    eventRows.filter(d => d.NOC !== 'USA'),
    v => {
      const byNoc = d3.rollup(v, vv => vv.length, d => d.NOC);
      let bestNoc = null;
      let best = -1;
      for (const [noc, cnt] of byNoc) {
        if (cnt > best) { best = cnt; bestNoc = noc; }
      }
      return {
        noc: bestNoc,
        team: bestNoc ? (nocName.get(bestNoc) || bestNoc) : '—',
        total: best > 0 ? best : 0,
      };
    },
    d => d.Year
  );

  const seriesData = years.map(y => {
    const usa = byYearUSA.get(y) || { Gold: 0, Silver: 0, Bronze: 0 };
    const ch = byYearChallenger.get(y) || { noc: '—', team: '—', total: 0 };
    return {
      Year: y,
      ...usa,
      usaTotal: usa.Gold + usa.Silver + usa.Bronze,
      challengerNOC: ch.noc,
      challengerTeam: ch.team,
      challengerTotal: ch.total,
    };
  });

  const W = 1180;
  const H = 380;
  const margin = { top: 18, right: 28, bottom: 44, left: 58 };
  const width = W - margin.left - margin.right;
  const height = H - margin.top - margin.bottom;

  const svg = host.append('svg')
    .attr('width', W)
    .attr('height', H);

  const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

  const x = d3.scaleLinear()
    .domain(d3.extent(seriesData, d => d.Year))
    .range([0, width]);

  const yMax = d3.max(seriesData, d => Math.max(d.usaTotal, d.challengerTotal)) || 1;
  const y = d3.scaleLinear()
    .domain([0, yMax * 1.12])
    .nice()
    .range([height, 0]);

  // grid
  g.append('g')
    .attr('opacity', 0.25)
    .call(d3.axisLeft(y).ticks(6).tickSize(-width).tickFormat(''))
    .selectAll('.domain').remove();

  // stacked area
  const stack = d3.stack().keys(MEDAL_ORDER);
  const stacked = stack(seriesData);

  const area = d3.area()
    .x(d => x(d.data.Year))
    .y0(d => y(d[0]))
    .y1(d => y(d[1]))
    .curve(d3.curveCatmullRom.alpha(0.5));

  g.selectAll('.layer')
    .data(stacked)
    .join('path')
    .attr('class', 'layer')
    .attr('d', area)
    .attr('fill', d => MEDAL_COLOR[d.key])
    .attr('opacity', 0.85);

  // challenger line
  const line = d3.line()
    .x(d => x(d.Year))
    .y(d => y(d.challengerTotal))
    .curve(d3.curveCatmullRom.alpha(0.5));

  const challengerPath = g.append('path')
    .attr('class', 'challenger')
    .datum(seriesData)
    .attr('fill', 'none')
    .attr('stroke', COLORS.ink)
    .attr('stroke-width', 2)
    .attr('stroke-dasharray', '6,6')
    .attr('opacity', 0.75)
    .attr('d', line);

  // Checkbox (in the legend) toggles whether the closest-challenger line is visible.
  const applyChallengerVisibility = () => {
    const chk = d3.select('#toggleChallenger');
    const show = chk.empty() ? true : !!chk.property('checked');
    challengerPath
      .attr('display', show ? null : 'none')
      .attr('pointer-events', show ? 'stroke' : 'none');
  };
  applyChallengerVisibility();
  d3.select('#toggleChallenger')
    .on('change.challenger', applyChallengerVisibility);

  // axes
  g.append('g')
    .attr('transform', `translate(0,${height})`)
    .call(d3.axisBottom(x).ticks(10).tickFormat(d3.format('d')));

  g.append('g')
    .call(d3.axisLeft(y).ticks(6))
    .call(g => g.selectAll('.domain').remove());

  g.append('text')
    .attr('x', 0)
    .attr('y', -6)
    .attr('fill', COLORS.muted)
    .attr('font-size', 12)
    .text('USA medals (event medals) — stacked by medal type');

  // hover
  const hover = g.append('g').style('pointer-events', 'none');
  const vline = hover.append('line')
    .attr('y1', 0)
    .attr('y2', height)
    .attr('stroke', '#000')
    .attr('stroke-width', 1)
    .attr('opacity', 0.18)
    .attr('display', 'none');

  const overlay = g.append('rect')
    .attr('x', 0).attr('y', 0)
    .attr('width', width).attr('height', height)
    .attr('fill', 'transparent')
    .on('mousemove', (event) => {
      const [mx] = d3.pointer(event);
      const year = Math.round(x.invert(mx));
      // snap to nearest year existing
      const i = d3.bisectCenter(years, year);
      const d = seriesData[i];
      if (!d) return;

      vline.attr('x1', x(d.Year)).attr('x2', x(d.Year)).attr('display', null);

      const showChallenger = (document.getElementById('toggleChallenger')?.checked ?? true);
      const challengerLine = showChallenger
        ? `<div class="k">Closest challenger: <b>${d.challengerTeam}</b> (${fmt(d.challengerTotal)})</div>`
        : ``;

      const html = `
        <div><b>${d.Year}</b></div>
        <div class="k">USA — Gold: ${fmt(d.Gold)} · Silver: ${fmt(d.Silver)} · Bronze: ${fmt(d.Bronze)}</div>
        <div><b>USA total:</b> ${fmt(d.usaTotal)}</div>
        ${challengerLine}
      `;
      showTooltip(html, event);
    })
    .on('mouseleave', () => { vline.attr('display', 'none'); hideTooltip(); });

  // Wire up the checkbox toggle once per render.
}

