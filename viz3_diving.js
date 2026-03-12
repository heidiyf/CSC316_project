/* viz3_diving.js — Diving medal flow wave chart
 * CSC316 Final Project
 * Requires: COLORS, MEDAL_COLOR, MEDAL_ORDER, fmt, safeNode,
 *           showTooltip, moveTooltip, hideTooltip
 * DOM IDs:  #divingFlow
 */

// ---------------------------
// 3) Diving flow (athlete-medals)
// ---------------------------
function renderDivingFlow(data) {
  const host = safeNode('#divingFlow');
  if (!host) return;
  host.selectAll('*').remove();

  const rows = data.filter(d => d.Sport === 'Diving' && d.Medal !== 'No medal' && (d.NOC === 'USA' || d.NOC === 'CHN'));
  const years = d3.sort(Array.from(new Set(rows.map(d => d.Year))));

  const byYearTeam = d3.rollup(rows, v => v.length, d => d.Year, d => d.NOC);

  // build series with zeros where missing
  const series = years.map(y => {
    const m = byYearTeam.get(y) || new Map();
    const chn = m.get('CHN') || 0;
    const usa = m.get('USA') || 0;
    return { Year: y, CHN: chn, USA: usa };
  });

  const W = 1180;
  const H = 480;
  const margin = { top: 20, right: 24, bottom: 44, left: 64 };
  const width = W - margin.left - margin.right;
  const height = H - margin.top - margin.bottom;

  const svg = host.append('svg').attr('width', W).attr('height', H);
  const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

  const x = d3.scaleLinear().domain(d3.extent(series, d => d.Year)).range([0, width]);
  const maxCount = d3.max(series, d => Math.max(d.CHN, d.USA)) || 1;

  const y = d3.scaleLinear()
    .domain([-(maxCount * 1.35), maxCount * 1.35])
    .nice()
    .range([height, 0]);

  // grid
  g.append('g')
    .attr('opacity', 0.25)
    .call(d3.axisLeft(y).ticks(10).tickSize(-width).tickFormat(d => d === 0 ? '0' : ''))
    .selectAll('.domain').remove();

  // waterline
  g.append('line')
    .attr('x1', 0).attr('x2', width)
    .attr('y1', y(0)).attr('y2', y(0))
    .attr('stroke', '#000')
    .attr('stroke-width', 1)
    .attr('opacity', 0.25)
    .attr('stroke-dasharray', '6,6');

  // Areas
  const areaCHN = d3.area()
    .x(d => x(d.Year))
    .y0(y(0))
    .y1(d => y(d.CHN))
    .curve(d3.curveBasis);

  const areaUSA = d3.area()
    .x(d => x(d.Year))
    .y0(y(0))
    .y1(d => y(-d.USA))
    .curve(d3.curveBasis);

  g.append('path').datum(series)
    .attr('d', areaCHN)
    .attr('fill', COLORS.chn)
    .attr('opacity', 0.42);

  g.append('path').datum(series)
    .attr('d', areaUSA)
    .attr('fill', COLORS.usa)
    .attr('opacity', 0.42);

  // axes
  g.append('g')
    .attr('transform', `translate(0,${height})`)
    .call(d3.axisBottom(x).ticks(12).tickFormat(d3.format('d')));

  g.append('g')
    .call(d3.axisLeft(y).ticks(10).tickFormat(d => Math.abs(d)))
    .call(g => g.selectAll('.domain').remove());

  g.append('text')
    .attr('x', 0)
    .attr('y', -6)
    .attr('fill', COLORS.muted)
    .attr('font-size', 12)
    .text('Medals / year (Diving) — CHN above, USA below (mirrored)');

  // Labels
  g.append('text')
    .attr('x', width / 2)
    .attr('y', 22)
    .attr('text-anchor', 'middle')
    .attr('fill', COLORS.chn)
    .attr('font-weight', 800)
    .attr('font-size', 26)
    .text('CHN');

  g.append('text')
    .attr('x', width / 2)
    .attr('y', height - 8)
    .attr('text-anchor', 'middle')
    .attr('fill', COLORS.usa)
    .attr('font-weight', 800)
    .attr('font-size', 26)
    .text('USA');

  // Medal dots — stack each year inside its team side
  const medalRows = rows.slice();

  const medalSortKey = (m) => ({ Gold: 0, Silver: 1, Bronze: 2 }[m] ?? 9);

  const byYearTeamMedals = d3.group(medalRows, d => d.Year, d => d.NOC);

  const dots = [];
  for (const y0 of years) {
    const byTeam = byYearTeamMedals.get(y0);
    if (!byTeam) continue;

    ['CHN', 'USA'].forEach(team => {
      const arr = (byTeam.get(team) || []).slice().sort((a, b) => medalSortKey(a.Medal) - medalSortKey(b.Medal));
      const sign = team === 'CHN' ? 1 : -1;

      arr.forEach((d, i) => {
        const level = i + 1;
        const jitter = ((hashString(`${d.Name}|${d.Event}|${i}`) % 11) - 5) * 0.9;
        const cx = x(y0) + jitter;
        const cy = y(sign * level);
        dots.push({
          Year: y0,
          team,
          medal: d.Medal,
          cx,
          cy,
          event: d.Event,
        });
      });
    });
  }

  g.append('g')
    .selectAll('circle')
    .data(dots)
    .enter()
    .append('circle')
    .attr('cx', d => d.cx)
    .attr('cy', d => d.cy)
    .attr('r', 6.2)
    .attr('fill', d => MEDAL_COLOR[d.medal] || '#ccc')
    .attr('stroke', 'rgba(255,255,255,0.9)')
    .attr('stroke-width', 1.8)
    .attr('opacity', 0.95)
    .on('mousemove', (event, d) => {
      const html = `
        <div><b>${d.Year}</b> — ${d.team}</div>
        <div class="k">${d.medal} · ${escapeHtml(d.event)}</div>
      `;
      showTooltip(html, event);
      moveTooltip(event);
    })
    .on('mouseleave', hideTooltip);

  // Diver decoration (head-down) around 1960
  const diveYear = 1960;
  const diveX = x(diveYear);
  const waterY = y(0);

  const diver = g.append('g').attr('opacity', 0.7);

  // splash (bigger, no annotation)
  const splash = g.append('g').attr('opacity', 0.35);
  [18, 32, 46].forEach(r => {
    splash.append('circle')
      .attr('cx', diveX)
      .attr('cy', waterY)
      .attr('r', r)
      .attr('fill', 'none')
      .attr('stroke', '#5aa8ff')
      .attr('stroke-width', 2);
  });
  // small splash spikes
  const spikes = d3.range(0, 7).map(i => ({ a: -0.9 + i * 0.3 }));
  splash.selectAll('path.sp')
    .data(spikes)
    .enter()
    .append('path')
    .attr('d', d => {
      const x1 = diveX + Math.cos(d.a) * 8;
      const y1 = waterY - 2 + Math.sin(d.a) * 8;
      const x2 = diveX + Math.cos(d.a) * 18;
      const y2 = waterY - 2 + Math.sin(d.a) * 18;
      return `M ${x1} ${y1} L ${x2} ${y2}`;
    })
    .attr('stroke', '#5aa8ff')
    .attr('stroke-width', 2)
    .attr('opacity', 0.9);

  // trajectory
  const tStart = { x: diveX - 95, y: y(14) };
  const tEnd = { x: diveX, y: waterY };
  diver.append('path')
    .attr('d', `M ${tStart.x} ${tStart.y} Q ${diveX - 40} ${y(9)} ${tEnd.x} ${tEnd.y}`)
    .attr('fill', 'none')
    .attr('stroke', 'rgba(120,120,120,0.65)')
    .attr('stroke-width', 3)
    .attr('stroke-dasharray', '7,7');

  // diver body (simple stick silhouette) oriented head-down
  const bodyG = diver.append('g');
  const bodyAngle = -65; // degrees
  const bodyLen = 70;

  bodyG.attr('transform', `translate(${diveX - 38},${y(9)}) rotate(${bodyAngle})`);

  // torso
  bodyG.append('line')
    .attr('x1', 0).attr('y1', 0)
    .attr('x2', 0).attr('y2', bodyLen)
    .attr('stroke', 'rgba(70,70,70,0.75)')
    .attr('stroke-width', 7)
    .attr('stroke-linecap', 'round');

  // arms (streamlined)
  bodyG.append('line')
    .attr('x1', 0).attr('y1', 18)
    .attr('x2', 14).attr('y2', 6)
    .attr('stroke', 'rgba(70,70,70,0.65)')
    .attr('stroke-width', 6)
    .attr('stroke-linecap', 'round');
  bodyG.append('line')
    .attr('x1', 0).attr('y1', 18)
    .attr('x2', -14).attr('y2', 6)
    .attr('stroke', 'rgba(70,70,70,0.65)')
    .attr('stroke-width', 6)
    .attr('stroke-linecap', 'round');

  // legs
  bodyG.append('line')
    .attr('x1', 0).attr('y1', bodyLen - 12)
    .attr('x2', 12).attr('y2', bodyLen + 6)
    .attr('stroke', 'rgba(70,70,70,0.65)')
    .attr('stroke-width', 6)
    .attr('stroke-linecap', 'round');
  bodyG.append('line')
    .attr('x1', 0).attr('y1', bodyLen - 12)
    .attr('x2', -12).attr('y2', bodyLen + 6)
    .attr('stroke', 'rgba(70,70,70,0.65)')
    .attr('stroke-width', 6)
    .attr('stroke-linecap', 'round');

  // head (at bottom, because head-down)
  bodyG.append('circle')
    .attr('cx', 0)
    .attr('cy', bodyLen + 10)
    .attr('r', 9)
    .attr('fill', 'rgba(70,70,70,0.75)');
}

function escapeHtml(s) {
  return String(s)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

