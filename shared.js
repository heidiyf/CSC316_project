/* shared.js — Utilities, theme, data loading, perspective toggle
 * CSC316 Final Project  —  single-page scroll layout
 *
 * Loads olympics_dataset.csv ONCE and calls each visualization's
 * render function. Must be loaded LAST in index.html.
 *
 * Load order:
 *   d3 → sportpark.js → viz1_dominance.js → viz2_swimming.js
 *        → viz3_diving.js → viz4_goldrace.js → shared.js
 *
 * Expected DOM IDs (single-page layout):
 *   #viz1  #yearSlider  #swimYearLabel  #gapText  #swimUSA  #swimCHN
 *   #divingFlow  #rivalYearSlider  #rivalYearLabel  #raceModeSummary
 *   .gold-filter-btn  #viz4  #tooltip
 *   Perspective toggle: .perspective-btn  #heroTitle  #heroIntro  #heroHook
 *   #themeChip0  #themeChip1  #rivalryTitle  #rivalryCopy
 *   #dominanceTitle  #swimmingTitle  #divingTitle  #goldTitle
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

// ---------------------------
// Data load
// ---------------------------

Promise.all([
  d3.csv('olympics_dataset.csv', d3.autoType)
]).then(([data]) => {
  // normalize medal field
  data.forEach(d => {
    d.Medal = (d.Medal === null || d.Medal === undefined) ? 'No medal' : d.Medal;
  });

  // sport park map (handled by sportpark.js)
  if (typeof renderSportPark === 'function') renderSportPark(data);
  renderDominance(data);
  renderSwimmingPools(data);
  renderDivingFlow(data);
  renderGoldRace(data);
}).catch(err => {
  console.error('[shared.js] Failed to load data:', err);
});

// ---------------------------
// Accordion — Swimming / Diving
// ---------------------------
(function initAccordion() {
  const tabs = document.querySelectorAll('.acc-tab[data-panel]');
  if (!tabs.length) return;

  function openPanel(panelId) {
    tabs.forEach(t => {
      const isTarget = t.dataset.panel === panelId;
      t.classList.toggle('is-active', isTarget);
      t.setAttribute('aria-selected', String(isTarget));
      const panel = document.getElementById(t.dataset.panel);
      if (panel) panel.classList.toggle('is-open', isTarget);
    });
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => openPanel(tab.dataset.panel));
  });

  // Scroll-nav links with data-open-panel (e.g. "Swimming" / "Diving" nav anchors)
  document.querySelectorAll('a[data-open-panel]').forEach(link => {
    link.addEventListener('click', () => {
      openPanel(link.dataset.openPanel);
    });
  });
})();


// Switches hero copy + viz titles between USA / China viewpoint
// ---------------------------
(function initPerspectiveToggle() {
  const btns = document.querySelectorAll('.perspective-btn');
  if (!btns.length) return;
  let current = 'usa';

  // copy maps — keyed by perspective
  const COPY = {
    usa: {
      heroTitle:    'USA vs China on the Olympic Stage',
      heroIntro:    'This story follows the shift from long US control to a rivalry that becomes measurable across overall medal scale, historical medal count, swimming pressure, and diving strength.',
      heroHook:     'One country sets the Olympic standard. The other rises fast enough to turn the story into a direct US-China contest.',
      chip0:        'Historical Dominator',
      chip1:        'Rising Challenger',
      rivalryTitle: 'Where the rivalry becomes visible',
      rivalryCopy:  'The United States carries the broader medal machine and deep swimming history. China is especially forceful in diving and increasingly credible in the pool — turning the medal race into direct sport-by-sport pressure.',
      dominanceTitle: 'Medals — USA dominance, and who\'s closest each year',
      swimmingTitle:  'Swimming lanes — China catching up in the pool',
      divingTitle:    'Diving — medal flow as a wave (CHN above water, USA below)',
      goldTitle:      'Medal race scale (USA vs CHN)',
    },
    china: {
      heroTitle:    'China vs USA on the Olympic Stage',
      heroIntro:    "This story follows China's remarkable rise from emerging competitor to Olympic powerhouse, challenging America's long-standing dominance across medal counts, swimming excellence, and diving supremacy.",
      heroHook:     "One country challenges the status quo. The other must defend its position as the rivalry intensifies across every Olympic stage.",
      chip0:        'Rising Powerhouse',
      chip1:        'Defending Champion',
      rivalryTitle: 'Where China\'s rise becomes unmistakable',
      rivalryCopy:  'China\'s surge in diving is unmatched, and its growing presence in the pool signals a broader shift. The medal race now runs through every sport where the two nations directly clash.',
      dominanceTitle: 'Medals — China\'s rise, closing on the leader',
      swimmingTitle:  'Swimming lanes — China\'s progress in the pool',
      divingTitle:    'Diving — China\'s dominance above the waterline',
      goldTitle:      'Medal race scale (CHN vs USA)',
    },
  };

  function applyPerspective(p) {
    const c = COPY[p];
    // helper: set textContent if element exists
    const set = (id, text) => { const el = document.getElementById(id); if (el) el.textContent = text; };
    set('heroTitle',       c.heroTitle);
    set('heroIntro',       c.heroIntro);
    set('heroHook',        c.heroHook);
    set('themeChip0',      c.chip0);
    set('themeChip1',      c.chip1);
    set('rivalryTitle',    c.rivalryTitle);
    set('rivalryCopy',     c.rivalryCopy);
    set('dominanceTitle',  c.dominanceTitle);
    set('swimmingTitle',   c.swimmingTitle);
    set('divingTitle',     c.divingTitle);
    set('goldTitle',       c.goldTitle);
  }

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      const p = btn.dataset.perspective;
      if (p === current) return;
      current = p;
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      applyPerspective(p);
    });
  });
})();