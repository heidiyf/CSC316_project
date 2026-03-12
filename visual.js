/* Prototype V1 (John) — D3 v7
   Expected DOM IDs:
   #homeScreen .intro-nav-btn #backToMenuBtn #viewToolbarTitle
   #dominanceCard #swimmingCard #divingCard #goldCard
   #status #viz1 #yearSlider #swimYearLabel #gapText #swimUSA #swimCHN #divingFlow
   #rivalYearSlider #rivalYearLabel #raceModeSummary .gold-filter-btn #viz4
*/

// ---------------------------
// Theme
// ---------------------------
const COLORS = {
  usa: getCssVar('--usa', '#1f4ed8'),
  chn: getCssVar('--chn', '#d32f2f'),
  gold: getCssVar('--gold', '#d4af37'),
  silver: getCssVar('--silver', '#b9b9b9'),
  bronze: getCssVar('--bronze', '#c27a35'),
  ink: getCssVar('--ink', '#111'),
  muted: getCssVar('--muted', '#666'),
};

const MEDAL_ORDER = ['Gold', 'Silver', 'Bronze'];
const MEDAL_COLOR = {
  Gold: COLORS.gold,
  Silver: COLORS.silver,
  Bronze: COLORS.bronze,
};

const SPORT_DESCRIPTION_URLS = {
  '3x3 Basketball': 'https://la28.org/en/games-plan/olympics/3x3-basketball.html',
  'Archery': 'https://la28.org/en/games-plan/olympics/archery.html',
  'Artistic Gymnastics': 'https://la28.org/en/games-plan/olympics/artistic-gymnastics.html',
  'Artistic Swimming': 'https://la28.org/en/games-plan/olympics/artistic-swimming.html',
  'Athletics': 'https://la28.org/en/games-plan/olympics/athletics.html',
  'Badminton': 'https://la28.org/en/games-plan/olympics/badminton.html',
  'Baseball': 'https://la28.org/en/games-plan/olympics/baseball.html',
  'Baseball/Softball': 'https://la28.org/en/LA28_Sports_Program.html',
  'Basketball': 'https://la28.org/en/games-plan/olympics/basketball.html',
  'Beach Volleyball': 'https://la28.org/en/games-plan/olympics/beach-volleyball.html',
  'Boxing': 'https://la28.org/en/games-plan/olympics/boxing.html',
  'Canoe Slalom': 'https://la28.org/en/games-plan/olympics/canoe-slalom.html',
  'Canoe Sprint': 'https://la28.org/en/games-plan/olympics/canoe-sprint.html',
  'Cricket': 'https://la28.org/en/games-plan/olympics/cricket.html',
  'Cycling BMX Freestyle': 'https://la28.org/en/games-plan/olympics/bmx-freestyle.html',
  'Cycling BMX Racing': 'https://la28.org/en/games-plan/olympics/bmx-racing.html',
  'Cycling Mountain Bike': 'https://la28.org/en/games-plan/olympics/mountain-bike.html',
  'Cycling Road': 'https://la28.org/en/games-plan/olympics/cycling-road.html',
  'Cycling Track': 'https://la28.org/en/games-plan/olympics/cycling-track.html',
  'Diving': 'https://la28.org/en/games-plan/olympics/diving.html',
  'Equestrian': 'https://la28.org/en/games-plan/olympics/equestrian.html',
  'Fencing': 'https://la28.org/en/games-plan/olympics/fencing.html',
  'Football': 'https://la28.org/en/games-plan/olympics/football--soccer.html',
  'Golf': 'https://la28.org/en/games-plan/olympics/golf.html',
  'Handball': 'https://la28.org/en/games-plan/olympics/handball.html',
  'Hockey': 'https://la28.org/en/games-plan/olympics/hockey.html',
  'Judo': 'https://la28.org/en/games-plan/olympics/judo.html',
  'Lacrosse': 'https://la28.org/en/games-plan/olympics/lacrosse.html',
  'Marathon Swimming': 'https://la28.org/en/games-plan/olympics/open-water-swimming.html',
  'Modern Pentathlon': 'https://la28.org/en/games-plan/olympics/modern-pentathlon.html',
  'Rhythmic Gymnastics': 'https://la28.org/en/games-plan/olympics/rhythmic-gymnastics.html',
  'Rowing': 'https://la28.org/en/games-plan/olympics/rowing.html',
  'Rugby Sevens': 'https://la28.org/en/games-plan/olympics/rugby-sevens.html',
  'Sailing': 'https://la28.org/en/games-plan/olympics/sailing.html',
  'Shooting': 'https://la28.org/en/games-plan/olympics/shooting.html',
  'Skateboarding': 'https://la28.org/en/games-plan/olympics/skateboarding.html',
  'Softball': 'https://la28.org/en/games-plan/olympics/softball.html',
  'Sport Climbing': 'https://la28.org/en/games-plan/olympics/sport-climbing.html',
  'Surfing': 'https://la28.org/en/games-plan/olympics/surfing.html',
  'Swimming': 'https://la28.org/en/games-plan/olympics/swimming.html',
  'Table Tennis': 'https://la28.org/en/games-plan/olympics/table-tennis.html',
  'Taekwondo': 'https://la28.org/en/games-plan/olympics/taekwondo.html',
  'Tennis': 'https://la28.org/en/games-plan/olympics/tennis.html',
  'Trampoline Gymnastics': 'https://la28.org/en/games-plan/olympics/trampoline-gymnastics.html',
  'Triathlon': 'https://la28.org/en/games-plan/olympics/triathlon.html',
  'Volleyball': 'https://la28.org/en/games-plan/olympics/volleyball.html',
  'Water Polo': 'https://la28.org/en/games-plan/olympics/water-polo.html',
  'Weightlifting': 'https://la28.org/en/games-plan/olympics/weightlifting.html',
  'Wrestling': 'https://la28.org/en/games-plan/olympics/wrestling.html',
};

const SPORT_FALLBACK_URLS = {
  'Aeronautics': 'https://en.wikipedia.org/wiki/Aeronautics',
  'Alpinism': 'https://en.wikipedia.org/wiki/Alpinism',
  'Art Competitions': 'https://en.wikipedia.org/wiki/Art_competitions_at_the_Summer_Olympics',
  'Basque Pelota': 'https://en.wikipedia.org/wiki/Basque_pelota',
  'Breaking': 'https://en.wikipedia.org/wiki/Breakdancing',
  'Canoeing': 'https://en.wikipedia.org/wiki/Canoeing_at_the_Summer_Olympics',
  'Croquet': 'https://en.wikipedia.org/wiki/Croquet',
  'Cycling': 'https://en.wikipedia.org/wiki/Cycling_at_the_Summer_Olympics',
  'Equestrianism': 'https://en.wikipedia.org/wiki/Equestrian_events_at_the_Summer_Olympics',
  'Figure Skating': 'https://en.wikipedia.org/wiki/Figure_skating',
  'Gymnastics': 'https://en.wikipedia.org/wiki/Gymnastics',
  'Ice Hockey': 'https://en.wikipedia.org/wiki/Ice_hockey',
  'Jeu De Paume': 'https://en.wikipedia.org/wiki/Jeu_de_paume',
  'Motorboating': 'https://en.wikipedia.org/wiki/Motorboating_at_the_1908_Summer_Olympics',
  'Polo': 'https://en.wikipedia.org/wiki/Polo_at_the_Summer_Olympics',
  'Racquets': 'https://en.wikipedia.org/wiki/Racquets',
  'Roque': 'https://en.wikipedia.org/wiki/Roque',
  'Rugby': 'https://en.wikipedia.org/wiki/Rugby_union_at_the_Summer_Olympics',
  'Synchronized Swimming': 'https://la28.org/en/games-plan/olympics/artistic-swimming.html',
  'Trampolining': 'https://la28.org/en/games-plan/olympics/trampoline-gymnastics.html',
  'Tug-Of-War': 'https://en.wikipedia.org/wiki/Tug_of_war',
};

const tooltip = d3.select('#tooltip');

function getCssVar(name, fallback) {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}

function showTooltip(html, event) {
  tooltip.html(html)
    .style('opacity', 1)
    .style('left', `${event.clientX}px`)
    .style('top', `${event.clientY}px`);
}
function moveTooltip(event) {
  tooltip.style('left', `${event.clientX}px`).style('top', `${event.clientY}px`);
}
function hideTooltip() {
  tooltip.style('opacity', 0);
}

function fmt(n) {
  return d3.format(',')(n);
}

function safeNode(id) {
  const el = document.querySelector(id);
  return el ? d3.select(el) : null;
}

function hashString(str) {
  // simple deterministic hash (32-bit)
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0);
}

function initIntroTransition() {
  const homeScreen = document.getElementById('homeScreen');
  const navButtons = Array.from(document.querySelectorAll('.intro-nav-btn'));
  const backBtn = document.getElementById('backToMenuBtn');
  const toolbarTitle = document.getElementById('viewToolbarTitle');
  const viewCards = Array.from(document.querySelectorAll('.view-card'));
  if (!homeScreen || !navButtons.length || !backBtn || !toolbarTitle || !viewCards.length) {
    return;
  }

  const setActiveCard = (targetId) => {
    let nextCard = null;
    viewCards.forEach(card => {
      const isActive = card.id === targetId;
      card.classList.toggle('is-active', isActive);
      if (isActive) nextCard = card;
    });
    return nextCard;
  };

  const showView = (targetId) => {
    const target = document.getElementById(targetId);
    if (!target) return;
    const activeCard = setActiveCard(targetId);
    if (!activeCard) return;

    document.body.classList.add('view-active');
    toolbarTitle.textContent = activeCard.dataset.viewTitle || 'Visualization';
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      showView(btn.dataset.target);
    });
  });

  backBtn.addEventListener('click', () => {
    viewCards.forEach(card => card.classList.remove('is-active'));
    document.body.classList.remove('view-active');
    toolbarTitle.textContent = 'Visualization';
    homeScreen.scrollIntoView({ behavior: 'auto', block: 'start' });
  });
}

// ---------------------------
// Data load
// ---------------------------
const statusEl = safeNode('#status');
initIntroTransition();

Promise.all([
  d3.csv('data/olympics_dataset_cleaned.csv', d3.autoType)
]).then(([data]) => {
  if (statusEl) statusEl.text(`Loaded olympics_dataset_cleaned.csv — ${fmt(data.length)} rows.`);

  // normalize fields
  data.forEach(d => {
    d.Medal = (d.Medal === null || d.Medal === undefined) ? 'No medal' : d.Medal;
  });

  renderHomeSportCatalog(data);
  renderDominance(data);
  renderSwimmingPools(data);
  // renderDivingFlow(data); // 由 diving.js 独立模块处理
  renderGoldRace(data);
}).catch(err => {
  console.error(err);
  if (statusEl) statusEl.text(`Failed to load data: ${err}`);
});

function renderHomeSportCatalog(data) {
  const fieldEl = document.getElementById('homeSportField');
  if (!fieldEl) return;
  const countEl = document.getElementById('homeSportCount');
  const sportCounts = d3.rollup(
    data
      .filter(d => d.Season === 'Summer' && d.Sport)
      .flatMap(d => String(d.Sport)
        .split(',')
        .map(s => s.trim())
        .filter(Boolean)),
    v => v.length,
    d => d
  );
  const sports = Array.from(sportCounts.keys()).sort((a, b) => d3.ascending(a, b));
  const popularityValues = Array.from(sportCounts.values());
  const bubbleScale = d3.scaleSqrt()
    .domain(d3.extent(popularityValues))
    .range([18, 66]);
  const sportEntries = sports.map((sport, i) => {
    const count = sportCounts.get(sport) || 0;
    const targetRadius = bubbleScale(count);
    return {
      name: sport,
      count,
      tone: i % 4,
      url: getSportDescriptionUrl(sport),
      value: Math.pow(targetRadius, 2),
    };
  });

  if (countEl) {
    countEl.textContent = `${fmt(sports.length)} sports`;
  }

  fieldEl.innerHTML = '';

  const size = 960;
  const palette = ['#204a98', '#6f3653', '#6c6438', '#2d3e5b'];
  const svg = d3.select(fieldEl)
    .append('svg')
    .attr('viewBox', `0 0 ${size} ${size}`)
    .attr('role', 'img')
    .attr('aria-label', 'Summer Olympic sport categories arranged in a circular field');

  const defs = svg.append('defs');

  const bgGradient = defs.append('radialGradient')
    .attr('id', 'sportFieldBg')
    .attr('cx', '50%')
    .attr('cy', '48%')
    .attr('r', '62%');
  bgGradient.append('stop').attr('offset', '0%').attr('stop-color', '#16315d');
  bgGradient.append('stop').attr('offset', '58%').attr('stop-color', '#0f2244');
  bgGradient.append('stop').attr('offset', '100%').attr('stop-color', '#091224');

  const glow = defs.append('filter')
    .attr('id', 'sportFieldGlow')
    .attr('x', '-20%')
    .attr('y', '-20%')
    .attr('width', '140%')
    .attr('height', '140%');
  glow.append('feDropShadow')
    .attr('dx', 0)
    .attr('dy', 22)
    .attr('stdDeviation', 18)
    .attr('flood-color', '#091224')
    .attr('flood-opacity', 0.22);

  const root = d3.hierarchy({
    children: sportEntries,
  }).sum(d => d.value || 0);
  root.sort((a, b) => (b.value || 0) - (a.value || 0));

  d3.pack()
    .size([size - 48, size - 48])
    .padding(8)(root);

  const field = svg.append('g')
    .attr('transform', 'translate(24,24)');

  const center = (size - 48) / 2;
  const radius = (size - 48) / 2;

  field.append('circle')
    .attr('cx', center)
    .attr('cy', center)
    .attr('r', radius)
    .attr('fill', 'url(#sportFieldBg)')
    .attr('filter', 'url(#sportFieldGlow)');

  field.append('circle')
    .attr('cx', center)
    .attr('cy', center)
    .attr('r', radius - 54)
    .attr('fill', 'rgba(255,255,255,0.025)');

  field.append('circle')
    .attr('cx', center)
    .attr('cy', center)
    .attr('r', radius - 132)
    .attr('fill', 'rgba(255,255,255,0.018)');

  const links = field.selectAll('.sport-link')
    .data(root.leaves())
    .join('a')
    .attr('class', 'sport-link')
    .attr('href', d => d.data.url)
    .attr('xlink:href', d => d.data.url)
    .attr('target', '_blank')
    .attr('rel', 'noopener noreferrer')
    .attr('aria-label', d => `${d.data.name}: open sport description in a new tab`);

  const nodes = links.append('g')
    .attr('class', d => `sport-node${d.data.name.length > 18 ? ' sport-node-muted' : ''}`)
    .attr('transform', d => `translate(${d.x},${d.y})`);

  links.append('title').text(d => `${d.data.name}\n${fmt(d.data.count)} Summer rows\nOpen sport description`);

  nodes.append('circle')
    .attr('r', d => d.r)
    .attr('fill', d => palette[d.data.tone]);

  nodes.each(function(d) {
    const group = d3.select(this);
    const r = d.r;
    const text = group.append('text')
      .attr('text-anchor', 'middle')
      .attr('font-size', Math.max(8, Math.min(18, r / 3.1)));

    const lines = wrapSportBubbleLabel(d.data.name, r);
    const lineHeight = Math.max(10, Math.min(18, r / 2.9));
    const startDy = -(lines.length - 1) * lineHeight / 2 + 4;

    lines.forEach((line, i) => {
      text.append('tspan')
        .attr('x', 0)
        .attr('dy', i === 0 ? startDy : lineHeight)
        .text(line);
    });
  });
}

function wrapSportBubbleLabel(label, radius) {
  const clean = String(label).trim();
  const maxChars = Math.max(6, Math.floor(radius / 3.2));
  if (clean.length <= maxChars) return [clean];

  const words = clean.split(/\s+/);
  const lines = [];
  let current = '';

  for (const word of words) {
    const token = word.length > maxChars ? `${word.slice(0, maxChars - 1)}…` : word;
    const candidate = current ? `${current} ${token}` : token;
    if (candidate.length <= maxChars || !current) {
      current = candidate;
    } else {
      lines.push(current);
      current = token;
    }
  }

  if (current) lines.push(current);

  if (lines.length > 3) {
    const mergedTail = lines.slice(2).join(' ');
    lines.splice(2, lines.length - 2, `${mergedTail.slice(0, Math.max(4, maxChars - 1))}…`);
  }

  return lines.slice(0, 3);
}

function getSportDescriptionUrl(sport) {
  return SPORT_DESCRIPTION_URLS[sport]
    || SPORT_FALLBACK_URLS[sport]
    || `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(`${sport} olympic sport`)}`;
}

// ---------------------------
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

// ---------------------------
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

// ---------------------------
// 4) Medal race scale (event-count medals)
// ---------------------------
function renderGoldRace(data) {
  const host = safeNode('#viz4');
  const slider = document.getElementById('rivalYearSlider');
  const yearLabel = document.getElementById('rivalYearLabel');
  const modeSummary = document.getElementById('raceModeSummary');
  const filterButtons = Array.from(document.querySelectorAll('.gold-filter-btn'));
  if (!host || !slider || !yearLabel || !modeSummary || !filterButtons.length) return;

  host.selectAll('*').remove();

  const medalRows = data.filter(d =>
    d.Season === 'Summer' &&
    (d.NOC === 'USA' || d.NOC === 'CHN') &&
    (d.Medal === 'Gold' || d.Medal === 'Silver' || d.Medal === 'Bronze')
  );

  const eventDedup = new Map();
  for (const d of medalRows) {
    const k = `${d.Year}|${d.NOC}|${d.Sport}|${d.Event}|${d.Medal}`;
    if (!eventDedup.has(k)) eventDedup.set(k, d);
  }
  const eventRows = Array.from(eventDedup.values());
  const years = d3.sort(Array.from(new Set(eventRows.map(d => d.Year))));

  const modeMeta = {
    Total: {
      title: 'total medals',
      unit: 'event medals',
      filter: () => true,
    },
    Gold: {
      title: 'gold medals',
      unit: 'gold event medals',
      filter: d => d.Medal === 'Gold',
    },
    Silver: {
      title: 'silver medals',
      unit: 'silver event medals',
      filter: d => d.Medal === 'Silver',
    },
    Bronze: {
      title: 'bronze medals',
      unit: 'bronze event medals',
      filter: d => d.Medal === 'Bronze',
    }
  };

  const seriesByMode = {};
  Object.entries(modeMeta).forEach(([mode, meta]) => {
    const filtered = eventRows.filter(meta.filter);
    const byYearNoc = d3.rollup(filtered, v => v.length, d => d.Year, d => d.NOC);
    seriesByMode[mode] = years.map(y => {
      const m = byYearNoc.get(y) || new Map();
      return {
        Year: y,
        USA: m.get('USA') || 0,
        CHN: m.get('CHN') || 0,
      };
    });
  });
  let currentMode = 'Total';

  // slider index
  slider.min = 0;
  slider.max = Math.max(0, years.length - 1);
  slider.step = 1;
  slider.value = years.length - 1;

  const W = 1180;
  const scaleH = 290;
  const timelineH = 170;

  const svg = host.append('svg')
    .attr('width', W)
    .attr('height', scaleH + timelineH + 26);

  const scaleG = svg.append('g').attr('transform', `translate(0,8)`);
  const timelineG = svg.append('g').attr('transform', `translate(0,${scaleH})`);

  // static baseline for timeline
  const marginX = 54;
  const timelineW = W - marginX * 2;

  const x = d3.scaleLinear().domain(d3.extent(years)).range([marginX, marginX + timelineW]);

  // axis
  timelineG.append('g')
    .attr('transform', `translate(0,${timelineH - 40})`)
    .call(d3.axisBottom(x).ticks(12).tickFormat(d3.format('d')));

  const rowFor = (mode, year) => seriesByMode[mode].find(d => d.Year === year) || { Year: year, USA: 0, CHN: 0 };
  const cumUpTo = (mode, idx, key) => d3.sum(seriesByMode[mode].slice(0, idx + 1), d => d[key]);

  // Groups that update
  const beamG = scaleG.append('g').attr('transform', `translate(${W / 2}, 132)`);
  const labelG = scaleG.append('g').attr('transform', `translate(${W / 2}, 230)`);

  // fulcrum
  beamG.append('polygon')
    .attr('points', `-70,100 70,100 0,0`)
    .attr('fill', 'rgba(0,0,0,0.12)');
  beamG.append('rect')
    .attr('x', -90)
    .attr('y', 100)
    .attr('width', 180)
    .attr('height', 14)
    .attr('rx', 7)
    .attr('fill', 'rgba(0,0,0,0.18)');

  const beam = beamG.append('line')
    .attr('x1', -330).attr('y1', 30)
    .attr('x2', 330).attr('y2', 30)
    .attr('stroke', 'rgba(0,0,0,0.75)')
    .attr('stroke-width', 10)
    .attr('stroke-linecap', 'round');

  const pivot = beamG.append('circle')
    .attr('cx', 0).attr('cy', 30)
    .attr('r', 14)
    .attr('fill', 'rgba(0,0,0,0.75)');

  const hangL = beamG.append('line')
    .attr('stroke', 'rgba(0,0,0,0.5)')
    .attr('stroke-width', 4)
    .attr('x1', -320).attr('x2', -320)
    .attr('y1', 30).attr('y2', 120);

  const hangR = beamG.append('line')
    .attr('stroke', 'rgba(0,0,0,0.5)')
    .attr('stroke-width', 4)
    .attr('x1', 320).attr('x2', 320)
    .attr('y1', 30).attr('y2', 120);

  const weightUSA = beamG.append('g');
  const weightCHN = beamG.append('g');

  // weights (cards)
  function drawWeight(g, color) {
    g.append('rect')
      .attr('x', -80).attr('y', 120)
      .attr('width', 160).attr('height', 78)
      .attr('rx', 18)
      .attr('fill', color)
      .attr('opacity', 0.95);
    g.append('text')
      .attr('class', 'team')
      .attr('x', -56).attr('y', 148)
      .attr('fill', 'white')
      .attr('font-size', 18)
      .attr('font-weight', 800);
    g.append('text')
      .attr('class', 'count')
      .attr('x', -56).attr('y', 184)
      .attr('fill', 'white')
      .attr('font-size', 40)
      .attr('font-weight', 900);
  }
  drawWeight(weightUSA, COLORS.usa);
  drawWeight(weightCHN, COLORS.chn);

  // timeline stitches
  const stitchesG = timelineG.append('g').attr('transform', `translate(0,0)`);
  const baseY = timelineH - 76;

  stitchesG.append('line')
    .attr('x1', marginX)
    .attr('x2', marginX + timelineW)
    .attr('y1', baseY)
    .attr('y2', baseY)
    .attr('stroke', 'rgba(0,0,0,0.22)')
    .attr('stroke-width', 7)
    .attr('stroke-linecap', 'round');

  const stitchR = 12;

  const stitch = stitchesG.selectAll('g.stitch')
    .data(years.map(y => ({ Year: y })))
    .enter()
    .append('g')
    .attr('class', 'stitch')
    .attr('transform', d => `translate(${x(d.Year)},${baseY})`)
    .style('cursor', 'default')
    .on('mousemove', (event, d) => {
      const row = rowFor(currentMode, d.Year);
      const leader = row.USA === row.CHN ? 'Tied' : (row.USA > row.CHN ? 'USA' : 'CHN');
      const gap = Math.abs(row.USA - row.CHN);
      const meta = modeMeta[currentMode];
      const html = `
        <div><b>${d.Year} · ${currentMode.toUpperCase()}</b></div>
        <div><span style="display:inline-block;width:10px;height:10px;border-radius:3px;background:${COLORS.usa};margin-right:6px"></span>
          USA ${meta.title}: ${fmt(row.USA)}</div>
        <div><span style="display:inline-block;width:10px;height:10px;border-radius:3px;background:${COLORS.chn};margin-right:6px"></span>
          CHN ${meta.title}: ${fmt(row.CHN)}</div>
        <div class="k">Leader: <b>${leader}</b>${leader === 'Tied' ? '' : ` · Gap: ${fmt(gap)}`}</div>
      `;
      showTooltip(html, event);
      moveTooltip(event);
    })
    .on('mouseleave', hideTooltip);

  // donut arcs
  const arc = d3.arc().innerRadius(stitchR - 5).outerRadius(stitchR);

  stitch.append('circle')
    .attr('r', stitchR + 1)
    .attr('fill', 'white')
    .attr('stroke', 'rgba(0,0,0,0.28)')
    .attr('stroke-width', 1.5);

  stitch.append('path').attr('class', 'arcUSA');
  stitch.append('path').attr('class', 'arcCHN');

  // knot
  stitch.append('circle')
    .attr('class', 'knot')
    .attr('r', 3.8)
    .attr('fill', 'rgba(0,0,0,0.78)');

  // selected marker
  const selMark = stitchesG.append('circle')
    .attr('r', stitchR + 7)
    .attr('fill', 'none')
    .attr('stroke', 'rgba(0,0,0,0.6)')
    .attr('stroke-width', 2.2)
    .attr('opacity', 0);

  // label text (avoid overlap)
  const headline = labelG.append('text')
    .attr('text-anchor', 'middle')
    .attr('fill', 'rgba(0,0,0,0.78)')
    .attr('font-size', 20)
    .attr('font-weight', 800);

  const subline = labelG.append('text')
    .attr('text-anchor', 'middle')
    .attr('fill', COLORS.muted)
    .attr('font-size', 13)
    .attr('y', 22);

  const applyModeButtons = () => {
    filterButtons.forEach(btn => {
      btn.classList.toggle('is-active', btn.dataset.mode === currentMode);
    });
  };

  function update() {
    const idx = +slider.value;
    const ySel = years[idx] ?? years[years.length - 1];
    const meta = modeMeta[currentMode];
    yearLabel.textContent = ySel;
    modeSummary.textContent = `Showing cumulative ${meta.unit} for USA vs CHN, counted per event.`;

    const usaCum = cumUpTo(currentMode, idx, 'USA');
    const chnCum = cumUpTo(currentMode, idx, 'CHN');
    const total = usaCum + chnCum;
    const diff = usaCum - chnCum;

    const leader = diff === 0 ? 'Tied' : (diff > 0 ? 'USA' : 'CHN');
    const gap = Math.abs(diff);

    // angle scale
    const maxAngle = 10; // degrees
    const share = total === 0 ? 0 : diff / total;
    const angle = maxAngle * share; // positive => USA heavier (tilt down left)

    beamG.transition().duration(320)
      .attr('transform', `translate(${W / 2}, 132) rotate(${-angle})`);

    // weights positions (they rotate with beam group)
    weightUSA.attr('transform', `translate(${-320},0)`);
    weightCHN.attr('transform', `translate(${320},0)`);

    weightUSA.select('text.team').text('USA');
    weightUSA.select('text.count').text(fmt(usaCum));

    weightCHN.select('text.team').text('CHN');
    weightCHN.select('text.count').text(fmt(chnCum));

    headline.text(`${ySel} · ${leader === 'Tied' ? `${meta.title} are tied` : `${leader} leads in cumulative ${meta.title.toUpperCase()}`} ${leader === 'Tied' ? '' : `(gap: ${fmt(gap)})`}`);
    const chnShare = total === 0 ? 0 : (chnCum / total);
    const usaShare = total === 0 ? 0 : (usaCum / total);
    subline.text(`Cumulative ${meta.unit} share — CHN: ${d3.format('.0%')(chnShare)} · USA: ${d3.format('.0%')(usaShare)} · (event-count basis)`);

    // update stitches
    stitch.each(function(d) {
      const g = d3.select(this);
      const row = rowFor(currentMode, d.Year);
      const sum = row.USA + row.CHN;
      const usaP = sum === 0 ? 0.5 : row.USA / sum;
      const chnP = 1 - usaP;

      g.select('path.arcUSA')
        .attr('d', arc({ startAngle: -Math.PI / 2, endAngle: -Math.PI / 2 + usaP * 2 * Math.PI }))
        .attr('fill', COLORS.usa)
        .attr('opacity', 0.95);

      g.select('path.arcCHN')
        .attr('d', arc({ startAngle: -Math.PI / 2 + usaP * 2 * Math.PI, endAngle: 1.5 * Math.PI }))
        .attr('fill', COLORS.chn)
        .attr('opacity', 0.95);

      // knot slides toward the leader side
      const off = (usaP - 0.5) * (stitchR - 3);
      g.select('circle.knot').attr('cx', off).attr('cy', 0);

      // fade future years
      const isFuture = d.Year > ySel;
      g.attr('opacity', isFuture ? 0.25 : 1);
    });

    // selected ring
    const dSel = rows[idx];
    if (dSel) {
      selMark.attr('cx', x(dSel.Year)).attr('cy', baseY).attr('opacity', 1);
    }
  }

  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const nextMode = btn.dataset.mode;
      if (!modeMeta[nextMode] || nextMode === currentMode) return;
      currentMode = nextMode;
      applyModeButtons();
      update();
    });
  });

  applyModeButtons();
  slider.addEventListener('input', update);
  update();
}

// ---------------------------
// Perspective Toggle Feature
// ---------------------------
(function initPerspectiveToggle() {
  const perspectiveBtns = document.querySelectorAll('.perspective-btn');
  let currentPerspective = 'usa'; // default
  
  if (perspectiveBtns.length === 0) return;
  
  perspectiveBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const perspective = btn.dataset.perspective;
      if (perspective === currentPerspective) return;
      
      // Update active state
      perspectiveBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentPerspective = perspective;
      
      // Update content based on perspective
      updatePerspectiveContent(perspective);
    });
  });
  
  function updatePerspectiveContent(perspective) {
    const title = document.querySelector('.home-title');
    const intro = document.querySelector('.home-intro');
    const hook = document.querySelector('.home-hook');
    const themes = document.querySelectorAll('.home-theme-chip');
    
    if (!title || !intro || !hook) return;
    
    if (perspective === 'usa') {
      // USA perspective - focus on defending dominance
      title.textContent = 'USA vs China on the Olympic Stage';
      intro.textContent = 'This story follows the shift from long US control to a rivalry that becomes measurable across overall medal scale, historical medal count, swimming pressure, and diving strength.';
      hook.textContent = 'One country sets the Olympic standard. The other rises fast enough to turn the story into a direct US-China contest.';
      
      if (themes.length >= 2) {
        themes[0].textContent = 'Historical Dominator';
        themes[1].textContent = 'Rising Challenger';
      }
      
      // Update visualization labels if needed
      updateVisualizationLabels('usa');
      
    } else {
      // China perspective - focus on rising challenge
      title.textContent = 'China vs USA on the Olympic Stage';
      intro.textContent = "This story follows China's remarkable rise from emerging competitor to Olympic powerhouse, challenging America's long-standing dominance across medal counts, swimming excellence, and diving supremacy.";
      hook.textContent = "One country challenges the status quo. The other must defend its position as the rivalry intensifies across every Olympic stage.";
      
      if (themes.length >= 2) {
        themes[0].textContent = 'Rising Powerhouse';
        themes[1].textContent = 'Defending Champion';
      }
      
      // Update visualization labels if needed
      updateVisualizationLabels('china');
    }
    
    console.log(`✓ Perspective switched to: ${perspective.toUpperCase()}`);
  }
  
  function updateVisualizationLabels(perspective) {
    // Update view card titles if they exist
    const dominanceCard = document.querySelector('#dominanceCard h2');
    const swimmingCard = document.querySelector('#swimmingCard h2');
    const divingCard = document.querySelector('#divingCard h2');
    const goldCard = document.querySelector('#goldCard h2');
    
    if (perspective === 'usa') {
      if (dominanceCard) {
        dominanceCard.textContent = '1) Medals number — USA dominance, and who\'s closest each year';
      }
      if (swimmingCard) {
        swimmingCard.textContent = '2) Lanes (swimming) — China catching up in the pool';
      }
      if (divingCard) {
        divingCard.textContent = '3) Diving — medal flow as a wave (CHN above water, USA below)';
      }
      if (goldCard) {
        goldCard.textContent = '4) Medal race scale (USA vs CHN)';
      }
    } else {
      if (dominanceCard) {
        dominanceCard.textContent = '1) Medals number — China\'s rise, challenging the leader';
      }
      if (swimmingCard) {
        swimmingCard.textContent = '2) Lanes (swimming) — China\'s progress in the pool';
      }
      if (divingCard) {
        divingCard.textContent = '3) Diving — China\'s strength as a wave (CHN leads above water)';
      }
      if (goldCard) {
        goldCard.textContent = '4) Medal race scale (CHN vs USA)';
      }
    }
  }
})();
