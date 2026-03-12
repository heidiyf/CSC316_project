/* viz4_goldrace.js — Three medal-race balance scales (🥇 Gold · 🥈 Silver · 🥉 Bronze)
 * CSC316 Final Project
 *
 * Shows Gold / Silver / Bronze as three side-by-side seesaws, each tilting
 * toward the cumulative leader up to the selected year.
 *
 * Auto-play: IntersectionObserver starts the slider on scroll-into-view.
 * User drag on slider immediately pauses auto-play.
 *
 * Requires: COLORS, fmt, safeNode, showTooltip, moveTooltip, hideTooltip
 * DOM IDs:  #viz4  #rivalYearSlider  #rivalYearLabel  #raceModeSummary  #goldCard
 */

function renderGoldRace(data) {
  const host      = safeNode('#viz4');
  const slider    = document.getElementById('rivalYearSlider');
  const yearLabel = document.getElementById('rivalYearLabel');
  const summary   = document.getElementById('raceModeSummary');
  if (!host || !slider || !yearLabel) return;

  host.selectAll('*').remove();

  /* ── Data ──────────────────────────────────────────────────── */
  const medalRows = data.filter(d =>
    d.Season === 'Summer' &&
    (d.NOC === 'USA' || d.NOC === 'CHN') &&
    ['Gold','Silver','Bronze'].includes(d.Medal)
  );
  const dedup = new Map();
  for (const d of medalRows) {
    const k = `${d.Year}|${d.NOC}|${d.Sport}|${d.Event}|${d.Medal}`;
    if (!dedup.has(k)) dedup.set(k, d);
  }
  const eventRows = Array.from(dedup.values());
  const years = d3.sort(Array.from(new Set(eventRows.map(d => d.Year))));

  const MEDALS  = ['Gold','Silver','Bronze'];
  const M_EMOJI = { Gold:'🥇', Silver:'🥈', Bronze:'🥉' };
  const M_COLOR = {
    Gold:   { arm:'#b8860b', fill:'#d4af37', dark:'#7a5900' },
    Silver: { arm:'#7a7a7a', fill:'#c0c0c0', dark:'#4a4a4a' },
    Bronze: { arm:'#9a5c22', fill:'#c27a35', dark:'#5e3210' },
  };

  const series = {};
  MEDALS.forEach(medal => {
    const byYearNoc = d3.rollup(
      eventRows.filter(d => d.Medal === medal),
      v => v.length, d => d.Year, d => d.NOC
    );
    series[medal] = years.map(y => {
      const m = byYearNoc.get(y) || new Map();
      return { Year:y, USA:m.get('USA')||0, CHN:m.get('CHN')||0 };
    });
  });

  const cumUpTo = (medal, idx, key) =>
    d3.sum(series[medal].slice(0, idx + 1), d => d[key]);

  /* ── Slider ─────────────────────────────────────────────────── */
  slider.min   = 0;
  slider.max   = Math.max(0, years.length - 1);
  slider.step  = 1;
  slider.value = years.length - 1;

  /* ── SVG dimensions ─────────────────────────────────────────── */
  const W          = 1180;
  const SCALE_H    = 290;    // area for 3 seesaws
  const TIMELINE_H = 164;
  const TOTAL_H    = SCALE_H + TIMELINE_H + 10;

  const svg = host.append('svg')
    .attr('width', W).attr('height', TOTAL_H);

  const scalesG   = svg.append('g');
  const timelineG = svg.append('g').attr('transform', `translate(0,${SCALE_H})`);

  /* ── Per-seesaw geometry ────────────────────────────────────── */
  const CXS     = [W / 6, W / 2, W * 5 / 6];  // column centers
  const PIVOT_Y = 132;
  const ARM     = 132;   // half beam length
  const WX      = 116;   // weight center x offset from pivot
  const WW      = 104;   // weight card width
  const WH      = 68;    // weight card height

  /* ── Build seesaws ──────────────────────────────────────────── */
  const seesawGroups = MEDALS.map((medal, i) => {
    const cx  = CXS[i];
    const col = M_COLOR[medal];
    const g   = scalesG.append('g');

    // Medal title
    g.append('text')
      .attr('x', cx).attr('y', 24)
      .attr('text-anchor','middle')
      .attr('font-family','"Manrope",system-ui,sans-serif')
      .attr('font-size', 19).attr('font-weight', 900)
      .attr('fill', col.fill)
      .text(`${M_EMOJI[medal]}  ${medal}`);

    // Fulcrum base plate
    g.append('rect')
      .attr('x', cx - 52).attr('y', PIVOT_Y + 58)
      .attr('width', 104).attr('height', 11)
      .attr('rx', 5).attr('fill','rgba(0,0,0,.11)');

    // Fulcrum triangle
    g.append('polygon')
      .attr('points',`${cx-38},${PIVOT_Y+58} ${cx+38},${PIVOT_Y+58} ${cx},${PIVOT_Y+14}`)
      .attr('fill','rgba(0,0,0,.14)');

    /* ── beam group — rotates on each update ── */
    const beamG = g.append('g')
      .attr('transform', `translate(${cx},${PIVOT_Y})`);

    // beam arm
    beamG.append('line')
      .attr('x1',-ARM).attr('y1',0)
      .attr('x2', ARM).attr('y2',0)
      .attr('stroke', col.arm).attr('stroke-width', 9)
      .attr('stroke-linecap','round');

    // pivot ball
    beamG.append('circle')
      .attr('r', 10).attr('fill', col.dark)
      .attr('stroke','#fff').attr('stroke-width', 2);

    // hanging strings
    [-WX, WX].forEach(sx => {
      beamG.append('line')
        .attr('x1', sx).attr('x2', sx)
        .attr('y1', 0).attr('y2', 32)
        .attr('stroke', col.arm).attr('stroke-width', 2.2);
    });

    /* ── weight cards ── */
    function makeWeight(xOff, teamColor, flag, teamName) {
      const wg = beamG.append('g').attr('transform', `translate(${xOff},32)`);
      wg.append('rect')
        .attr('x',-WW/2).attr('y',0)
        .attr('width',WW).attr('height',WH)
        .attr('rx',13).attr('fill',teamColor).attr('opacity',.96);
      // flag + label
      wg.append('text')
        .attr('class','lbl').attr('x',0).attr('y',20)
        .attr('text-anchor','middle')
        .attr('font-family','"Manrope",system-ui,sans-serif')
        .attr('font-size',11).attr('font-weight',900)
        .attr('fill','rgba(255,255,255,.78)')
        .attr('letter-spacing','.08em')
        .text(`${flag} ${teamName}`);
      // count
      wg.append('text')
        .attr('class','cnt').attr('x',0).attr('y',55)
        .attr('text-anchor','middle')
        .attr('font-family','"Manrope",system-ui,sans-serif')
        .attr('font-size',28).attr('font-weight',900)
        .attr('fill','#fff');
      return wg;
    }
    const wUSA = makeWeight(-WX, COLORS.usa, '🇺🇸', 'USA');
    const wCHN = makeWeight( WX, COLORS.chn, '🇨🇳', 'CHN');

    // leader text below fulcrum
    const leaderLbl = g.append('text')
      .attr('x', cx).attr('y', SCALE_H - 10)
      .attr('text-anchor','middle')
      .attr('font-family','"Manrope",system-ui,sans-serif')
      .attr('font-size', 12).attr('font-weight', 900)
      .attr('fill', col.fill);

    return { medal, col, beamG, wUSA, wCHN, leaderLbl, cx };
  });

  /* ── Timeline ────────────────────────────────────────────────── */
  const mX   = 56;
  const tW   = W - mX * 2;
  const baseY= TIMELINE_H - 72;

  const x = d3.scaleLinear()
    .domain(d3.extent(years)).range([mX, mX + tW]);

  timelineG.append('g')
    .attr('transform', `translate(0,${TIMELINE_H - 38})`)
    .call(d3.axisBottom(x).ticks(12).tickFormat(d3.format('d')));

  timelineG.append('line')
    .attr('x1', mX).attr('x2', mX + tW)
    .attr('y1', baseY).attr('y2', baseY)
    .attr('stroke','rgba(0,0,0,.16)').attr('stroke-width', 6)
    .attr('stroke-linecap','round');

  /* each year stitch: tricolor donut (gold / silver / bronze sectors) */
  const SR  = 11;
  const arc = d3.arc().innerRadius(SR - 4).outerRadius(SR);
  const SEC = (2 * Math.PI) / 3;   // 120° per medal type

  const stitchG = timelineG.selectAll('g.stitch')
    .data(years.map(y => ({ Year:y })))
    .join('g').attr('class','stitch')
    .attr('transform', d => `translate(${x(d.Year)},${baseY})`)
    .on('mousemove', (event, d) => {
      const si = years.indexOf(d.Year);
      const lines = MEDALS.map(m => {
        const r = series[m][si] || {};
        return `<div>${M_EMOJI[m]} <span style="color:#1f4ed8">USA ${r.USA||0}</span> · <span style="color:#d32f2f">CHN ${r.CHN||0}</span></div>`;
      });
      showTooltip(`<div><b>${d.Year}</b></div>${lines.join('')}`, event);
      moveTooltip(event);
    })
    .on('mouseleave', hideTooltip);

  stitchG.append('circle').attr('r', SR + 1)
    .attr('fill','#fff').attr('stroke','rgba(0,0,0,.2)').attr('stroke-width',1.5);

  MEDALS.forEach((medal, mi) => {
    const mKey = medal.toLowerCase();
    stitchG.append('path').attr('class', `arc-${mKey}-usa`);
    stitchG.append('path').attr('class', `arc-${mKey}-chn`);
  });

  // selected year ring
  const selMark = timelineG.append('circle')
    .attr('r', SR + 7).attr('fill','none')
    .attr('stroke','rgba(0,0,0,.5)').attr('stroke-width', 2.2)
    .attr('opacity', 0);

  /* ── Update function ─────────────────────────────────────────── */
  function update() {
    const idx  = +slider.value;
    const ySel = years[idx] ?? years[years.length - 1];
    yearLabel.textContent = ySel;

    /* update each seesaw */
    seesawGroups.forEach(({ medal, beamG, wUSA, wCHN, leaderLbl, cx }) => {
      const usaCum = cumUpTo(medal, idx, 'USA');
      const chnCum = cumUpTo(medal, idx, 'CHN');
      const total  = usaCum + chnCum;
      const diff   = usaCum - chnCum;

      // tilt angle: +12° max; positive diff = USA heavier = left side down
      const angle  = total === 0 ? 0 : 12 * (diff / total);

      beamG.transition().duration(280)
        .attr('transform', `translate(${cx},${PIVOT_Y}) rotate(${-angle})`);

      wUSA.select('text.cnt').text(fmt(usaCum));
      wCHN.select('text.cnt').text(fmt(chnCum));

      if (diff === 0) {
        leaderLbl.text('⚖ Tied');
      } else {
        const who = diff > 0 ? '🇺🇸 USA' : '🇨🇳 CHN';
        leaderLbl.text(`${who} leads  +${fmt(Math.abs(diff))}`);
      }
    });

    /* update stitches */
    stitchG.each(function(d) {
      const g   = d3.select(this);
      const si  = years.indexOf(d.Year);
      g.attr('opacity', d.Year > ySel ? 0.2 : 1);

      MEDALS.forEach((medal, mi) => {
        const r    = series[medal][si] || { USA:0, CHN:0 };
        const sum  = r.USA + r.CHN;
        const usaP = sum === 0 ? 0.5 : r.USA / sum;
        const off  = -Math.PI / 2 + mi * SEC;
        const mKey = medal.toLowerCase();

        g.select(`.arc-${mKey}-usa`)
          .attr('d', arc({ startAngle: off, endAngle: off + usaP * SEC }))
          .attr('fill', COLORS.usa);

        g.select(`.arc-${mKey}-chn`)
          .attr('d', arc({ startAngle: off + usaP * SEC, endAngle: off + SEC }))
          .attr('fill', COLORS.chn);
      });
    });

    selMark.attr('cx', x(ySel)).attr('cy', baseY).attr('opacity', 1);

    if (summary) {
      const parts = MEDALS.map(m => {
        const u = cumUpTo(m, idx, 'USA');
        const c = cumUpTo(m, idx, 'CHN');
        const lead = u > c ? '🇺🇸 USA' : u < c ? '🇨🇳 CHN' : 'Tied';
        return `${M_EMOJI[m]} ${lead}`;
      });
      summary.textContent = `Up to ${ySel} — ${parts.join('  ·  ')}`;
    }
  }

  /* ── Auto-play via IntersectionObserver ──────────────────────── */
  let timer      = null;
  let playing    = false;
  let userPaused = false;  // true once user grabs slider

  function play() {
    if (playing) return;
    playing = true;
    timer = setInterval(() => {
      const next = +slider.value + 1;
      if (next > years.length - 1) { pause(); return; }
      slider.value = next;
      update();
    }, 640);
  }

  function pause() {
    playing = false;
    clearInterval(timer);
    timer = null;
  }

  // user interaction → stop auto-play permanently for this session
  slider.addEventListener('mousedown',  () => { userPaused = true; pause(); });
  slider.addEventListener('touchstart', () => { userPaused = true; pause(); }, { passive:true });
  slider.addEventListener('input', update);

  // observe the goldCard section
  const section = document.getElementById('goldCard');
  if (section && typeof IntersectionObserver !== 'undefined') {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting && !userPaused) {
          // reset and start from beginning
          slider.value = 0;
          update();
          setTimeout(play, 480);
        } else if (!e.isIntersecting) {
          pause();
        }
      });
    }, { threshold: 0.32 });
    io.observe(section);
  }

  update();
}