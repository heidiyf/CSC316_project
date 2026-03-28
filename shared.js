/* shared.js — Utilities, theme, data loading, perspective toggle
 * CSC316 Final Project  —  single-page scroll layout
 *
 * Loads data/olympics_dataset.csv ONCE and calls each visualization's
 * render function. Must be loaded LAST in index.html.
 *
 * Load order:
 *   d3 → sportpark.js → viz1_dominance.js → viz2_swimming.js
 *        → viz3_diving.js → viz4_goldrace.js → shared.js
 *
 * Expected DOM IDs (single-page layout):
 *   #viz1  #yearSlider  #swimYearLabel  #gapText  #swimUSA  #swimCHN
 *   #divingFlow  #shootingViz  #rivalYearSlider  #rivalYearLabel  #raceModeSummary
 *   .gold-filter-btn  #viz4  #tooltip
 *   Perspective toggle: .perspective-btn  #heroTitle  #heroIntro  #heroHook
 *   #themeChip0  #themeChip1  #rivalryTitle  #rivalryCopy
 *   #dominanceTitle  #swimmingTitle  #divingTitle  #goldTitle
 */

// ---------------------------
// Theme
// ---------------------------
const COLORS = {
  usa: getCssVar('--usa', '#1a6cff'),
  chn: getCssVar('--chn', '#e62020'),
  gold: getCssVar('--gold', '#f0c040'),
  silver: getCssVar('--silver', '#c8c8c8'),
  bronze: getCssVar('--bronze', '#d4874a'),
  ink: getCssVar('--ink', '#e8f0ff'),
  muted: getCssVar('--muted', '#7a93b8'),
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
  d3.csv('data/olympics_dataset.csv', d3.autoType)
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
  if (typeof window.renderShootingGame === "function") window.renderShootingGame(data);
  if (typeof window.renderGoldRace === "function") window.renderGoldRace(data);
}).catch(err => {
  console.error('[shared.js] Failed to load data:', err);
});

// Accordion and perspective toggle are handled inline in index.html
