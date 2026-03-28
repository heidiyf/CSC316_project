/**
 * sportpark.js — Olympic Sports Park Interactive Map
 * CSC316 Final Project
 *
 * ── DUAL MODE ────────────────────────────────────────────────────
 *
 * EMBEDDED (inside the main project index.html):
 *   shared.js loads the CSV and calls  window.renderSportPark(data)
 *   The map renders inside  #homeSportField  — no other setup needed.
 *
 * STANDALONE (sportpark own index.html):
 *   If #homeSportField is NOT in the DOM, this file self-boots:
 *   it builds its own page, loads the CSV, and renders everything.
 *   index.html just needs:
 *     <script src="https://d3js.org/d3.v7.min.js"></script>
 *     <script src="sportpark.js"></script>
 *
 * In both modes, also needs: image/sports-park.png + data/olympics_dataset.csv
 * ─────────────────────────────────────────────────────────────────
 */

(function () {
  'use strict';

  /* ═══════════════════════════════════════════════════════════════
     CONSTANTS
  ═══════════════════════════════════════════════════════════════ */
  const CSV_PATH = 'data/olympics_dataset.csv';
  const IMG_PATH = 'image/sports-park.png';
  const IMG_W    = 1536;
  const IMG_H    = 1024;

  /* ── Official sport URLs ──────────────────────────────────────*/
  const SPORT_URLS = {
    '3x3 Basketball':        'https://la28.org/en/games-plan/olympics/3x3-basketball.html',
    'Archery':               'https://la28.org/en/games-plan/olympics/archery.html',
    'Artistic Gymnastics':   'https://la28.org/en/games-plan/olympics/artistic-gymnastics.html',
    'Artistic Swimming':     'https://la28.org/en/games-plan/olympics/artistic-swimming.html',
    'Athletics':             'https://la28.org/en/games-plan/olympics/athletics.html',
    'Badminton':             'https://la28.org/en/games-plan/olympics/badminton.html',
    'Baseball':              'https://la28.org/en/games-plan/olympics/baseball.html',
    'Baseball/Softball':     'https://la28.org/en/LA28_Sports_Program.html',
    'Basketball':            'https://la28.org/en/games-plan/olympics/basketball.html',
    'Beach Volleyball':      'https://la28.org/en/games-plan/olympics/beach-volleyball.html',
    'Boxing':                'https://la28.org/en/games-plan/olympics/boxing.html',
    'Breaking':              'https://en.wikipedia.org/wiki/Breakdancing_at_the_2024_Summer_Olympics',
    'Canoe Slalom':          'https://la28.org/en/games-plan/olympics/canoe-slalom.html',
    'Canoe Sprint':          'https://la28.org/en/games-plan/olympics/canoe-sprint.html',
    'Canoeing':              'https://en.wikipedia.org/wiki/Canoeing_at_the_Summer_Olympics',
    'Cricket':               'https://la28.org/en/games-plan/olympics/cricket.html',
    'Cycling':               'https://en.wikipedia.org/wiki/Cycling_at_the_Summer_Olympics',
    'Cycling BMX Freestyle': 'https://la28.org/en/games-plan/olympics/bmx-freestyle.html',
    'Cycling BMX Racing':    'https://la28.org/en/games-plan/olympics/bmx-racing.html',
    'Cycling Mountain Bike': 'https://la28.org/en/games-plan/olympics/mountain-bike.html',
    'Cycling Road':          'https://la28.org/en/games-plan/olympics/cycling-road.html',
    'Cycling Track':         'https://la28.org/en/games-plan/olympics/cycling-track.html',
    'Diving':                'https://la28.org/en/games-plan/olympics/diving.html',
    'Equestrian':            'https://la28.org/en/games-plan/olympics/equestrian.html',
    'Equestrianism':         'https://en.wikipedia.org/wiki/Equestrian_events_at_the_Summer_Olympics',
    'Fencing':               'https://la28.org/en/games-plan/olympics/fencing.html',
    'Football':              'https://la28.org/en/games-plan/olympics/football--soccer.html',
    'Golf':                  'https://la28.org/en/games-plan/olympics/golf.html',
    'Gymnastics':            'https://en.wikipedia.org/wiki/Gymnastics_at_the_Summer_Olympics',
    'Handball':              'https://la28.org/en/games-plan/olympics/handball.html',
    'Hockey':                'https://la28.org/en/games-plan/olympics/hockey.html',
    'Judo':                  'https://la28.org/en/games-plan/olympics/judo.html',
    'Karate':                'https://en.wikipedia.org/wiki/Karate_at_the_2020_Summer_Olympics',
    'Lacrosse':              'https://la28.org/en/games-plan/olympics/lacrosse.html',
    'Marathon Swimming':     'https://la28.org/en/games-plan/olympics/open-water-swimming.html',
    'Modern Pentathlon':     'https://la28.org/en/games-plan/olympics/modern-pentathlon.html',
    'Rhythmic Gymnastics':   'https://la28.org/en/games-plan/olympics/rhythmic-gymnastics.html',
    'Rowing':                'https://la28.org/en/games-plan/olympics/rowing.html',
    'Rugby Sevens':          'https://la28.org/en/games-plan/olympics/rugby-sevens.html',
    'Rugby':                 'https://en.wikipedia.org/wiki/Rugby_union_at_the_Summer_Olympics',
    'Sailing':               'https://la28.org/en/games-plan/olympics/sailing.html',
    'Shooting':              'https://la28.org/en/games-plan/olympics/shooting.html',
    'Skateboarding':         'https://la28.org/en/games-plan/olympics/skateboarding.html',
    'Softball':              'https://la28.org/en/games-plan/olympics/softball.html',
    'Sport Climbing':        'https://la28.org/en/games-plan/olympics/sport-climbing.html',
    'Surfing':               'https://la28.org/en/games-plan/olympics/surfing.html',
    'Swimming':              'https://la28.org/en/games-plan/olympics/swimming.html',
    'Synchronized Swimming': 'https://la28.org/en/games-plan/olympics/artistic-swimming.html',
    'Table Tennis':          'https://la28.org/en/games-plan/olympics/table-tennis.html',
    'Taekwondo':             'https://la28.org/en/games-plan/olympics/taekwondo.html',
    'Tennis':                'https://la28.org/en/games-plan/olympics/tennis.html',
    'Trampoline Gymnastics': 'https://la28.org/en/games-plan/olympics/trampoline-gymnastics.html',
    'Trampolining':          'https://la28.org/en/games-plan/olympics/trampoline-gymnastics.html',
    'Triathlon':             'https://la28.org/en/games-plan/olympics/triathlon.html',
    'Volleyball':            'https://la28.org/en/games-plan/olympics/volleyball.html',
    'Water Polo':            'https://la28.org/en/games-plan/olympics/water-polo.html',
    'Weightlifting':         'https://la28.org/en/games-plan/olympics/weightlifting.html',
    'Wrestling':             'https://la28.org/en/games-plan/olympics/wrestling.html',
    // Historical / niche
    'Aeronautics':     'https://en.wikipedia.org/wiki/Aeronautics',
    'Alpinism':        'https://en.wikipedia.org/wiki/Alpinism',
    'Art Competitions':'https://en.wikipedia.org/wiki/Art_competitions_at_the_Summer_Olympics',
    'Basque Pelota':   'https://en.wikipedia.org/wiki/Basque_pelota',
    'Croquet':         'https://en.wikipedia.org/wiki/Croquet',
    'Figure Skating':  'https://en.wikipedia.org/wiki/Figure_skating',
    'Ice Hockey':      'https://en.wikipedia.org/wiki/Ice_hockey',
    'Jeu De Paume':    'https://en.wikipedia.org/wiki/Jeu_de_paume',
    'Motorboating':    'https://en.wikipedia.org/wiki/Motorboating_at_the_1908_Summer_Olympics',
    'Polo':            'https://en.wikipedia.org/wiki/Polo_at_the_Summer_Olympics',
    'Racquets':        'https://en.wikipedia.org/wiki/Racquets',
    'Roque':           'https://en.wikipedia.org/wiki/Roque',
    'Tug-Of-War':      'https://en.wikipedia.org/wiki/Tug_of_war',
    '3x3 Basketball, Basketball':          'https://la28.org/en/games-plan/olympics/3x3-basketball.html',
    'Cycling Road, Cycling Mountain Bike': 'https://la28.org/en/games-plan/olympics/mountain-bike.html',
    'Cycling Road, Cycling Track':         'https://la28.org/en/games-plan/olympics/cycling-road.html',
    'Cycling Road, Triathlon':             'https://la28.org/en/games-plan/olympics/triathlon.html',
    'Marathon Swimming, Swimming':         'https://la28.org/en/games-plan/olympics/swimming.html',
  };
  function getSportUrl(sport) {
    return SPORT_URLS[sport]
      || `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(sport + ' olympic sport')}`;
  }

  /* ── Sport emoji icons ───────────────────────────────────────*/
  const SPORT_ICONS = {
    // Athletics
    'Athletics':'🏃','Modern Pentathlon':'🏇','Triathlon':'🏊',
    // Precision
    'Archery':'🏹','Shooting':'🎯',
    // Indoor
    'Badminton':'🏸','Table Tennis':'🏓','Weightlifting':'🏋️','Fencing':'🤺',
    'Gymnastics':'🤸',
    // Aquatics
    'Swimming':'🏊','Diving':'🤿','Water Polo':'🤽',
    'Artistic Swimming':'💃','Synchronized Swimming':'💃','Marathon Swimming':'🌊',
    'Marathon Swimming, Swimming':'🌊',
    // Combat
    'Boxing':'🥊','Wrestling':'🤼','Judo':'🥋','Taekwondo':'🥋','Karate':'🥋',
    'Tug-Of-War':'💪','Basque Pelota':'🎾',
    // Extreme / other
    'Skateboarding':'🛹','Sport Climbing':'🧗','Surfing':'🏄','Breaking':'🕺',
    'Aeronautics':'✈️','Alpinism':'🏔️','Art Competitions':'🎨',
    'Motorboating':'🚤','Polo':'🏇','Croquet':'🎯',
    'Figure Skating':'⛸️','Ice Hockey':'🏒','Jeu De Paume':'🎾',
    'Racquets':'🎾','Roque':'🎯',
    // Ball sports
    'Football':'⚽','Basketball':'🏀','3x3 Basketball':'🏀',
    '3x3 Basketball, Basketball':'🏀',
    'Volleyball':'🏐','Beach Volleyball':'🏐','Handball':'🤾',
    'Hockey':'🏑','Rugby Sevens':'🏉','Rugby':'🏉',
    'Baseball':'⚾','Softball':'🥎','Baseball/Softball':'⚾',
    'Tennis':'🎾','Cricket':'🏏','Lacrosse':'🥍','Golf':'⛳',
    // Gymnastics
    'Artistic Gymnastics':'🤸','Rhythmic Gymnastics':'🎀',
    'Trampoline Gymnastics':'🤸','Trampolining':'🤸',
    // Equestrian
    'Equestrian':'🏇','Equestrianism':'🏇',
    // Cycling
    'Cycling':'🚴','Cycling Road':'🚴','Cycling Track':'🚴',
    'Cycling BMX Racing':'🚵','Cycling BMX Freestyle':'🚵',
    'Cycling Mountain Bike':'🚵',
    'Cycling Road, Cycling Mountain Bike':'🚵',
    'Cycling Road, Cycling Track':'🚴',
    'Cycling Road, Triathlon':'🏊',
    // Water sports
    'Rowing':'🚣','Canoeing':'🛶','Canoe Slalom':'🛶',
    'Canoe Sprint':'🛶','Sailing':'⛵',
  };

  /* ── Venue icon emojis ───────────────────────────────────────*/
  const VENUE_ICONS = {
    athletics:'🏃', archery:'🏹', indoor:'🏸', aquatics:'🏊',
    combat:'🥊', extreme:'🛹', ballsports:'⚽', gymnastics:'🤸',
    equestrian:'🏇', cycling:'🚴', watersports:'🚣',
  };

  /* ── Venue definitions (x,y in 1536×1024 viewBox coords) ─────*/
  const VENUES = [
    { id:'athletics',  label:'Athletics Stadium',       venue:'Track & Field Oval',
      color:'#b91c1c', accent:'#f87171', x:248,  y:220,
      desc:'Sprint, jump, throw — the original Olympic stage',
      sports:['Athletics','Modern Pentathlon','Triathlon'] },
    { id:'archery',    label:'Precision Range',         venue:'Archery & Shooting Range',
      color:'#92400e', accent:'#fbbf24', x:695,  y:148,
      desc:'Steady nerves and perfect aim at the target range',
      sports:['Archery','Shooting'] },
    { id:'indoor',     label:'Multi-Sport Hall',        venue:'Indoor Arena',
      color:'#1e3a8a', accent:'#60a5fa', x:1090, y:240,
      desc:'The dome hosts racket sports, combat and heavy lifting',
      sports:['Badminton','Table Tennis','Weightlifting','Fencing','Gymnastics'] },
    { id:'aquatics',   label:'Aquatics Centre',         venue:'Swimming Pool',
      color:'#0369a1', accent:'#38bdf8', x:258,  y:456,
      desc:'Where USA and China clash hardest in recent Games',
      sports:['Swimming','Diving','Water Polo','Artistic Swimming',
              'Synchronized Swimming','Marathon Swimming','Marathon Swimming, Swimming'] },
    { id:'combat',     label:'Combat Arena Pavilion',   venue:'Boxing Ring & Combat Hall',
      color:'#5b21b6', accent:'#c084fc', x:700,  y:490,
      desc:'Raw one-on-one competition under the pavilion roof',
      sports:['Boxing','Wrestling','Judo','Taekwondo','Karate','Tug-Of-War','Basque Pelota'] },
    { id:'extreme',    label:'Skate & Climb Park',      venue:'Extreme & Other Sports',
      color:'#374151', accent:'#9ca3af', x:570,  y:650,
      desc:'Urban action sports — ramps, rails and rock walls',
      sports:['Skateboarding','Sport Climbing','Surfing','Breaking',
              'Art Competitions','Aeronautics','Alpinism','Croquet',
              'Jeu De Paume','Motorboating','Racquets','Roque',
              'Figure Skating','Ice Hockey','Polo'] },
    { id:'ballsports', label:'Multi-Court Zone',        venue:'Ball Sports Complex',
      color:'#065f46', accent:'#34d399', x:1060, y:430,
      desc:'Every ball sport from football to golf',
      sports:['Football','Basketball','3x3 Basketball','3x3 Basketball, Basketball',
              'Volleyball','Beach Volleyball','Handball','Hockey',
              'Rugby Sevens','Rugby','Baseball','Softball','Baseball/Softball',
              'Tennis','Cricket','Lacrosse','Golf'] },
    { id:'gymnastics', label:'Gymnastics Hall',         venue:'Gymnastics Floor',
      color:'#9d174d', accent:'#f472b6', x:430,  y:720,
      desc:'Grace and power on every piece of apparatus',
      sports:['Artistic Gymnastics','Rhythmic Gymnastics',
              'Trampoline Gymnastics','Trampolining'] },
    { id:'equestrian', label:'Equestrian Arena',        venue:'Sand Arena',
      color:'#78350f', accent:'#fcd34d', x:990,  y:625,
      desc:'Horse and rider in perfect harmony on the sand',
      sports:['Equestrian','Equestrianism'] },
    { id:'cycling',    label:'Cycling Circuit',         venue:'Road & Track Cycling',
      color:'#14532d', accent:'#4ade80', x:760,  y:920,
      desc:'Speed on every surface — road, track, mountain and dirt',
      sports:['Cycling','Cycling Road','Cycling Track','Cycling BMX Racing',
              'Cycling BMX Freestyle','Cycling Mountain Bike',
              'Cycling Road, Cycling Mountain Bike',
              'Cycling Road, Cycling Track','Cycling Road, Triathlon'] },
    { id:'watersports',label:'Water Sports Lake',       venue:'Open Water & Lake',
      color:'#164e63', accent:'#22d3ee', x:155,  y:875,
      desc:'Open water racing — paddles, oars and sails',
      sports:['Rowing','Canoeing','Canoe Slalom','Canoe Sprint','Sailing'] },
  ];

  /* ── NOC → Country ──────────────────────────────────────────*/
  const NOC_NAMES = {
    USA:'United States', CHN:'China', URS:'Soviet Union', GBR:'Great Britain',
    GER:'Germany', ITA:'Italy', FRA:'France', AUS:'Australia', NOR:'Norway',
    HUN:'Hungary', DEN:'Denmark', SWE:'Sweden', FIN:'Finland', NED:'Netherlands',
    KOR:'South Korea', CUB:'Cuba', RUS:'Russia', JPN:'Japan', ESP:'Spain',
    BRA:'Brazil', ROM:'Romania', EUN:'Unified Team', BUL:'Bulgaria', POL:'Poland',
    CAN:'Canada', NZL:'New Zealand', KEN:'Kenya', ETH:'Ethiopia', TCH:'Czechoslovakia',
    YUG:'Yugoslavia', GRE:'Greece', LAT:'Latvia', ROC:'ROC (Russia)',
    SUI:'Switzerland', GDR:'East Germany', ROU:'Romania',
  };
  const nocLabel = n => NOC_NAMES[n] || n;
  const spFmt   = n => d3.format(',')(n);

  /* ═══════════════════════════════════════════════════════════════
     STYLES
     injectMapStyles  — only map/panel CSS (used in both modes)
     injectPageStyles — full standalone page CSS (standalone only)
  ═══════════════════════════════════════════════════════════════ */
  function injectMapStyles() {
    if (document.getElementById('sp-map-styles')) return;
    const s = document.createElement('style');
    s.id = 'sp-map-styles';
    s.textContent = `
/* ── park box ── */
.sp-park-box {
  position: relative; width: 100%;
  border-radius: 22px; overflow: hidden;
  box-shadow: 0 24px 60px rgba(0,0,0,.22);
}
.sp-park-box img {
  display: block; width: 100%; height: auto;
  border-radius: 22px;
  user-select: none; -webkit-user-drag: none;
}
.sp-svg-layer {
  position: absolute; inset: 0;
  width: 100%; height: 100%;
  pointer-events: none;
}
.sp-svg-layer .sp-venue-dot { pointer-events: all; cursor: pointer; }

/* dimming overlay when panel is open */
.sp-park-box.panel-open::before {
  content: ""; position: absolute; inset: 0;
  background: rgba(0,0,0,.2); pointer-events: none;
  z-index: 5; border-radius: 22px 0 0 22px;
}

/* ── pulse animations ── */
@keyframes sp-pulse-a {
  0%   { r: 22px; opacity: .3; }
  70%  { r: 40px; opacity: .04; }
  100% { r: 46px; opacity: 0; }
}
@keyframes sp-pulse-b {
  0%   { r: 15px; opacity: .22; }
  70%  { r: 28px; opacity: .04; }
  100% { r: 32px; opacity: 0; }
}
.sp-ring-a { animation: sp-pulse-a 2.7s ease-out infinite; }
.sp-ring-b { animation: sp-pulse-b 2.7s ease-out .6s infinite; }

/* staggered per-dot delays */
.sp-venue-dot:nth-child(2)  .sp-ring-a{animation-delay:.25s}  .sp-venue-dot:nth-child(2)  .sp-ring-b{animation-delay:.85s}
.sp-venue-dot:nth-child(3)  .sp-ring-a{animation-delay:.5s}   .sp-venue-dot:nth-child(3)  .sp-ring-b{animation-delay:1.1s}
.sp-venue-dot:nth-child(4)  .sp-ring-a{animation-delay:.75s}  .sp-venue-dot:nth-child(4)  .sp-ring-b{animation-delay:1.35s}
.sp-venue-dot:nth-child(5)  .sp-ring-a{animation-delay:1.0s}  .sp-venue-dot:nth-child(5)  .sp-ring-b{animation-delay:1.6s}
.sp-venue-dot:nth-child(6)  .sp-ring-a{animation-delay:1.25s} .sp-venue-dot:nth-child(6)  .sp-ring-b{animation-delay:1.85s}
.sp-venue-dot:nth-child(7)  .sp-ring-a{animation-delay:1.5s}  .sp-venue-dot:nth-child(7)  .sp-ring-b{animation-delay:2.1s}
.sp-venue-dot:nth-child(8)  .sp-ring-a{animation-delay:1.75s} .sp-venue-dot:nth-child(8)  .sp-ring-b{animation-delay:2.35s}
.sp-venue-dot:nth-child(9)  .sp-ring-a{animation-delay:2.0s}  .sp-venue-dot:nth-child(9)  .sp-ring-b{animation-delay:2.6s}
.sp-venue-dot:nth-child(10) .sp-ring-a{animation-delay:2.25s} .sp-venue-dot:nth-child(10) .sp-ring-b{animation-delay:2.85s}
.sp-venue-dot:nth-child(11) .sp-ring-a{animation-delay:2.5s}  .sp-venue-dot:nth-child(11) .sp-ring-b{animation-delay:3.1s}

.sp-dot-core { transition: r .18s ease, stroke-width .18s ease; }
.sp-venue-dot:hover .sp-dot-core { r: 14px; }
.sp-venue-dot.is-active .sp-dot-core { r: 15px; stroke-width: 3.5px !important; }

.sp-dot-label {
  font-family: "Manrope",system-ui,sans-serif;
  font-size: 11px; font-weight: 900; letter-spacing: .04em;
  pointer-events: none;
  paint-order: stroke fill;
  stroke: rgba(0,0,0,.78); stroke-width: 3px; stroke-linejoin: round;
}

/* ── SIDE PANEL ── */
.sp-panel {
  position: absolute; top: 0; right: 0; bottom: 0;
  width: 318px;
  background: rgba(255,255,255,.88);
  backdrop-filter: blur(28px) saturate(2);
  -webkit-backdrop-filter: blur(28px) saturate(2);
  border-left: 1px solid rgba(255,255,255,.55);
  border-radius: 0 22px 22px 0;
  display: flex; flex-direction: column;
  transform: translateX(106%);
  transition: transform .35s cubic-bezier(.22,1,.36,1);
  z-index: 20; overflow: hidden;
  box-shadow: -16px 0 48px rgba(0,0,0,.24);
}
.sp-panel.is-open { transform: translateX(0); }

.sp-ph {
  padding: 16px 16px 13px; color: #fff;
  position: relative; flex-shrink: 0;
}
.sp-ph-close {
  position: absolute; top: 12px; right: 12px;
  width: 28px; height: 28px; border-radius: 999px;
  background: rgba(255,255,255,.2); border: none;
  color: #fff; font-size: 14px; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: background .15s;
}
.sp-ph-close:hover { background: rgba(255,255,255,.38); }
.sp-ph-tag  { font-size: 10px; font-weight: 900; letter-spacing: .16em; text-transform: uppercase; opacity: .72; margin-bottom: 5px; }
.sp-ph-name { font-family: "Bebas Neue","Arial Narrow",sans-serif; font-size: 30px; line-height: .96; letter-spacing: .02em; margin: 0 30px 4px 0; }
.sp-ph-desc { font-size: 12px; opacity: .78; line-height: 1.45; }

.sp-pb {
  flex: 1; overflow-y: auto;
  padding: 14px 15px 12px;
  display: flex; flex-direction: column; gap: 13px;
  scroll-behavior: smooth;
}
.sp-pb::-webkit-scrollbar { width: 4px; }
.sp-pb::-webkit-scrollbar-thumb { background: rgba(0,0,0,.14); border-radius: 4px; }

.sp-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.sp-stat  { background: rgba(0,0,0,.045); border-radius: 10px; padding: 10px 12px; text-align: center; }
.sp-stat-n{ font-size: 22px; font-weight: 900; color: #111; }
.sp-stat-l{ font-size: 10px; color: #888; text-transform: uppercase; letter-spacing: .07em; }
.sp-divider { height: 1px; background: rgba(0,0,0,.07); flex-shrink: 0; }

.sp-pills-head { font-size: 10px; font-weight: 900; letter-spacing: .12em; text-transform: uppercase; color: #888; margin-bottom: 7px; }
.sp-pills { display: flex; flex-wrap: wrap; gap: 6px; }
.sp-pill {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 6px 11px; border-radius: 999px;
  border: 1.5px solid rgba(0,0,0,.1); background: #fff;
  font-size: 11px; font-weight: 700; color: #1a1a2e;
  cursor: pointer; user-select: none;
  transition: background .14s, color .14s, transform .12s, box-shadow .14s;
  box-shadow: 0 2px 6px rgba(0,0,0,.06); line-height: 1.3;
}
.sp-pill:hover { background: #f0f4ff; transform: translateY(-1px); }
.sp-pill.is-active {
  color: #fff; border-color: transparent;
  transform: translateY(-1px); box-shadow: 0 4px 14px rgba(0,0,0,.2);
}
.sp-pill-icon { font-size: 14px; line-height: 1; flex-shrink: 0; }

.sp-card {
  background: #fff; border-radius: 14px;
  overflow: hidden; box-shadow: 0 4px 18px rgba(0,0,0,.1);
  animation: sp-card-in .22s ease;
}
@keyframes sp-card-in {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
.sp-card-head {
  padding: 11px 14px 10px; color: #fff;
  display: flex; align-items: flex-start; justify-content: space-between; gap: 8px;
}
.sp-card-sport { font-size: 16px; font-weight: 900; line-height: 1.2; }
.sp-card-link {
  font-size: 11px; opacity: .84; white-space: nowrap;
  display: flex; align-items: center; gap: 3px;
  color: #fff; text-decoration: none; flex-shrink: 0; margin-top: 2px;
}
.sp-card-link:hover { opacity: 1; text-decoration: underline; }
.sp-medal-rows { padding: 2px 14px 10px; display: flex; flex-direction: column; }
.sp-medal-row  { display: flex; align-items: center; gap: 10px; padding: 9px 0; border-bottom: 1px solid rgba(0,0,0,.05); }
.sp-medal-row:last-child { border-bottom: none; }
.sp-m-emoji { font-size: 20px; line-height: 1; flex-shrink: 0; }
.sp-m-info  { flex: 1; min-width: 0; }
.sp-m-type  { font-size: 10px; color: #aaa; text-transform: uppercase; letter-spacing: .07em; }
.sp-m-ctry  { font-size: 13px; font-weight: 800; color: #111; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.sp-m-n        { font-size: 24px; font-weight: 900; flex-shrink: 0; }
.sp-m-n.gold   { color: #b8860b; }
.sp-m-n.silver { color: #777; }
.sp-m-n.bronze { color: #a0642a; }
.sp-card-note  { padding: 0 14px 12px; font-size: 10px; color: #ccc; letter-spacing: .04em; }

.sp-hist-pills { display: flex; flex-wrap: wrap; gap: 5px; margin-top: 5px; }
.sp-hist-pill {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 4px 9px; border-radius: 999px;
  background: rgba(0,0,0,.04); border: 1px solid rgba(0,0,0,.07);
  font-size: 10px; font-weight: 600; color: #888;
  text-decoration: none; transition: background .13s;
}
.sp-hist-pill:hover { background: rgba(0,0,0,.09); color: #555; }
    `;
    document.head.appendChild(s);
  }

  function injectPageStyles() {
    if (document.getElementById('sp-page-styles')) return;
    const s = document.createElement('style');
    s.id = 'sp-page-styles';
    s.textContent = `
*, *::before, *::after { box-sizing: border-box; }
body {
  margin: 0;
  background: #0f172a;
  font-family: "Manrope","Inter",system-ui,sans-serif;
  color: #1a1a2e;
  min-height: 100vh;
  display: flex; flex-direction: column; align-items: center;
  padding: 32px 16px 64px;
}
#sp-header {
  width: 100%; max-width: 1100px; margin-bottom: 20px;
  display: flex; flex-direction: column; gap: 5px;
}
.sp-eyebrow { font-size: 11px; font-weight: 900; letter-spacing: .18em; text-transform: uppercase; color: #60a5fa; }
#sp-header h1 {
  margin: 0;
  font-family: "Bebas Neue","Arial Narrow",sans-serif;
  font-size: clamp(28px,5vw,52px); letter-spacing: .04em; color: #f1f5f9; line-height: 1;
}
#sp-header p { margin: 4px 0 0; font-size: 13px; color: #94a3b8; max-width: 60ch; line-height: 1.65; }
#sp-sport-count {
  display: inline-flex; align-items: center;
  padding: 5px 12px; border-radius: 999px;
  background: rgba(255,255,255,.07); color: #cbd5e1;
  font-size: 11px; font-weight: 800; letter-spacing: .1em; text-transform: uppercase;
  align-self: flex-start; margin-top: 6px;
}
#sp-loading {
  color: #475569; font-size: 14px; margin-top: 40px;
  display: flex; align-items: center; gap: 10px;
}
#sp-loading::before {
  content: ""; width: 18px; height: 18px;
  border: 2.5px solid #1e293b; border-top-color: #60a5fa;
  border-radius: 50%; animation: sp-spin .8s linear infinite; flex-shrink: 0;
}
@keyframes sp-spin { to { transform: rotate(360deg); } }
#sp-outer { width: 100%; max-width: 1100px; }
.sp-park-box { box-shadow: 0 32px 80px rgba(0,0,0,.5) !important; }
    `;
    document.head.appendChild(s);
  }

  /* ═══════════════════════════════════════════════════════════════
     COMPUTE MEDAL DATA
  ═══════════════════════════════════════════════════════════════ */
  function computeMedals(rows) {
    const sportMedals   = {};
    const sportRowCount = {};

    // De-duplicate to event-level: one row per (Year, NOC, Sport, Event, Medal)
    const seen = new Set();
    rows.forEach(d => {
      if (d.Season !== 'Summer') return;
      const sport = String(d.Sport  || '').trim();
      const medal = String(d.Medal  || '').trim();
      const noc   = String(d.NOC    || '').trim();
      const event = String(d.Event  || '').trim();
      const year  = String(d.Year   || '').trim();
      if (!sport || !['Gold','Silver','Bronze'].includes(medal)) return;

      // event-level dedup key
      const key = `${year}|${noc}|${sport}|${event}|${medal}`;
      if (seen.has(key)) return;
      seen.add(key);

      if (!sportMedals[sport]) sportMedals[sport] = {};
      if (!sportMedals[sport][noc]) sportMedals[sport][noc] = {Gold:0,Silver:0,Bronze:0};
      sportMedals[sport][noc][medal]++;
      sportRowCount[sport] = (sportRowCount[sport] || 0) + 1;
    });
    return { sportMedals, sportRowCount };
  }

  /* ═══════════════════════════════════════════════════════════════
     BUILD MAP  (shared by both modes — container is the target div)
  ═══════════════════════════════════════════════════════════════ */
  function buildMap(container, sportMedals, sportRowCount) {

    function topFor(sport, medal) {
      const m = sportMedals[sport];
      if (!m) return null;
      let best = null, bestN = 0;
      for (const [noc, c] of Object.entries(m)) {
        if (c[medal] > bestN) { bestN = c[medal]; best = {noc, n:bestN}; }
      }
      return best;
    }

    function sportCardHtml(sport, venueColor) {
      const g = topFor(sport,'Gold');
      const s = topFor(sport,'Silver');
      const b = topFor(sport,'Bronze');
      const total = sportRowCount[sport] || 0;
      const url   = getSportUrl(sport);
      const row = (emoji, type, leader, cls) => leader ? `
        <div class="sp-medal-row">
          <div class="sp-m-emoji">${emoji}</div>
          <div class="sp-m-info">
            <div class="sp-m-type">Most ${type}</div>
            <div class="sp-m-ctry">${nocLabel(leader.noc)}</div>
          </div>
          <div class="sp-m-n ${cls}">${spFmt(leader.n)}</div>
        </div>` : '';
      return `<div class="sp-card">
        <div class="sp-card-head" style="background:${venueColor}">
          <div class="sp-card-sport">${sport}</div>
          <a class="sp-card-link" href="${url}" target="_blank" rel="noopener noreferrer">Official page →</a>
        </div>
        <div class="sp-medal-rows">
          ${row('🥇','Gold',  g,'gold')}
          ${row('🥈','Silver',s,'silver')}
          ${row('🥉','Bronze',b,'bronze')}
        </div>
        <div class="sp-card-note">${spFmt(total)} event medals in dataset</div>
      </div>`;
    }

    // enrich venues
    VENUES.forEach(v => {
      v._known   = v.sports.filter(s =>  sportRowCount[s] > 0);
      v._unknown = v.sports.filter(s => !sportRowCount[s]);
      const agg = {};
      v._known.forEach(sport => {
        Object.entries(sportMedals[sport] || {}).forEach(([noc, c]) => {
          if (!agg[noc]) agg[noc] = {Gold:0,Silver:0,Bronze:0};
          agg[noc].Gold   += c.Gold;
          agg[noc].Silver += c.Silver;
          agg[noc].Bronze += c.Bronze;
        });
      });
      v._agg = agg;
      v.totalMedals = Object.values(agg).reduce((s,c)=>s+c.Gold+c.Silver+c.Bronze, 0);
    });

    // ── DOM ──────────────────────────────────────────────────────
    container.innerHTML = '';
    container.style.position = 'relative';

    const box = document.createElement('div');
    box.className = 'sp-park-box';

    const img = document.createElement('img');
    img.src = IMG_PATH; img.alt = 'Olympic Sports Park map';
    box.appendChild(img);

    const svgNS = 'http://www.w3.org/2000/svg';
    const svgEl = document.createElementNS(svgNS, 'svg');
    svgEl.setAttribute('viewBox', `0 0 ${IMG_W} ${IMG_H}`);
    svgEl.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    svgEl.classList.add('sp-svg-layer');
    box.appendChild(svgEl);

    const panel = document.createElement('div');
    panel.className = 'sp-panel';
    panel.innerHTML = `
      <div class="sp-ph" id="sp-ph">
        <button class="sp-ph-close" id="sp-close">✕</button>
        <div class="sp-ph-tag"  id="sp-tag"></div>
        <div class="sp-ph-name" id="sp-name"></div>
        <div class="sp-ph-desc" id="sp-desc"></div>
      </div>
      <div class="sp-pb" id="sp-body"></div>
    `;
    box.appendChild(panel);
    container.appendChild(box);

    // ── D3 dots ──────────────────────────────────────────────────
    const svg  = d3.select(svgEl);
    const defs = svg.append('defs');
    const gf   = defs.append('filter').attr('id','sp-glow').attr('x','-60%').attr('y','-60%').attr('width','220%').attr('height','220%');
    gf.append('feGaussianBlur').attr('in','SourceGraphic').attr('stdDeviation','4').attr('result','b');
    const fm = gf.append('feMerge');
    fm.append('feMergeNode').attr('in','b');
    fm.append('feMergeNode').attr('in','SourceGraphic');

    const dots = svg.selectAll('.sp-venue-dot')
      .data(VENUES).join('g')
      .attr('class','sp-venue-dot')
      .attr('transform', d => `translate(${d.x},${d.y})`);

    dots.append('circle').attr('class','sp-ring-a').attr('r',22).attr('fill',d=>d.accent).attr('opacity',.28);
    dots.append('circle').attr('class','sp-ring-b').attr('r',15).attr('fill',d=>d.accent).attr('opacity',.22);
    dots.append('circle').attr('r',17).attr('fill','rgba(0,0,0,.3)').attr('opacity',.6).attr('transform','translate(0,2.5)').attr('pointer-events','none');
    dots.append('circle').attr('r',16).attr('fill',d=>d.color).attr('opacity',.3).attr('pointer-events','none');
    dots.append('circle').attr('class','sp-dot-core').attr('r',11).attr('fill',d=>d.color).attr('stroke','#fff').attr('stroke-width',2.5).attr('filter','url(#sp-glow)');
    dots.append('circle').attr('r',3.5).attr('fill','#fff').attr('opacity',.95).attr('pointer-events','none');
    dots.append('text').attr('class','sp-dot-label').attr('x',0).attr('y',-20).attr('text-anchor','middle').attr('fill',d=>d.accent).text(d=>d.venue);

    // ── panel logic ──────────────────────────────────────────────
    const phEl   = document.getElementById('sp-ph');
    const tagEl  = document.getElementById('sp-tag');
    const nameEl = document.getElementById('sp-name');
    const descEl = document.getElementById('sp-desc');
    const bodyEl = document.getElementById('sp-body');
    let activeVenueId = null;

    function openPanel(venue) {
      activeVenueId = venue.id;
      phEl.style.background = venue.color;
      tagEl.textContent  = venue.venue;
      nameEl.textContent = `${VENUE_ICONS[venue.id] || '🏟️'} ${venue.label}`;
      descEl.textContent = venue.desc;

      const pillsHtml = venue._known.map(sport => `
        <button class="sp-pill" data-sport="${sport.replace(/"/g,'&quot;')}">
          <span class="sp-pill-icon">${SPORT_ICONS[sport] || '🏅'}</span>${sport}
        </button>`).join('');

      const histHtml = venue._unknown.length ? `
        <div>
          <div class="sp-pills-head" style="margin-top:4px">Historical (no medal data)</div>
          <div class="sp-hist-pills">
            ${venue._unknown.map(s=>`<a class="sp-hist-pill" href="${getSportUrl(s)}" target="_blank" rel="noopener noreferrer">${s} ↗</a>`).join('')}
          </div>
        </div>` : '';

      bodyEl.innerHTML = `
        <div class="sp-stats">
          <div class="sp-stat"><div class="sp-stat-n">${spFmt(venue.totalMedals)}</div><div class="sp-stat-l">Medals</div></div>
          <div class="sp-stat"><div class="sp-stat-n">${venue._known.length}</div><div class="sp-stat-l">Sport${venue._known.length!==1?'s':''}</div></div>
        </div>
        <div class="sp-divider"></div>
        <div>
          <div class="sp-pills-head">Tap a sport to see medal leaders</div>
          <div class="sp-pills">${pillsHtml}</div>
          ${histHtml}
        </div>
        <div class="sp-divider" id="sp-card-div" style="display:none"></div>
        <div id="sp-card-area"></div>
      `;

      bodyEl.querySelectorAll('.sp-pill[data-sport]').forEach(btn => {
        btn.addEventListener('click', () => {
          const sport   = btn.dataset.sport;
          const already = btn.classList.contains('is-active');
          bodyEl.querySelectorAll('.sp-pill').forEach(p => {
            p.classList.remove('is-active'); p.style.background = p.style.color = '';
          });
          const cardArea = document.getElementById('sp-card-area');
          const cardDiv  = document.getElementById('sp-card-div');
          if (already) {
            cardArea.innerHTML = '';
            if (cardDiv) cardDiv.style.display = 'none';
            return;
          }
          btn.classList.add('is-active');
          btn.style.background = venue.accent;
          btn.style.color = '#fff';
          if (cardDiv) cardDiv.style.display = '';
          cardArea.innerHTML = sportCardHtml(sport, venue.color);
          setTimeout(() => cardArea.scrollIntoView({behavior:'smooth',block:'nearest'}), 80);
        });
      });

      panel.classList.add('is-open');
      box.classList.add('panel-open');
      dots.classed('is-active', d => d.id === venue.id);
    }

    function closePanel() {
      activeVenueId = null;
      panel.classList.remove('is-open');
      box.classList.remove('panel-open');
      dots.classed('is-active', false);
    }

    dots.on('click', (event, d) => {
      event.stopPropagation();
      if (activeVenueId === d.id) closePanel(); else openPanel(d);
    });
    document.getElementById('sp-close').addEventListener('click', closePanel);
    box.addEventListener('click', e => {
      if (!panel.contains(e.target) && !e.target.closest('.sp-venue-dot')) closePanel();
    });
  }

  /* ═══════════════════════════════════════════════════════════════
     EMBEDDED MODE  —  called by shared.js with pre-loaded data
     Renders into #homeSportField (or any element passed)
  ═══════════════════════════════════════════════════════════════ */
  window.renderSportPark = function (data) {
    injectMapStyles();

    const container = document.getElementById('homeSportField');
    if (!container) {
      console.warn('[sportpark.js] #homeSportField not found — nothing to render into.');
      return;
    }

    // update the sport count badge already in the HTML
    const countEl = document.getElementById('homeSportCount');
    if (countEl) {
      const unique = new Set(
        data.filter(d => d.Season === 'Summer' && d.Sport)
            .map(d => String(d.Sport).trim())
            .filter(s => !s.includes(','))   // exclude combined entries like "Cycling Road, Cycling Track"
      );
      countEl.textContent = `${unique.size} sports`;
    }

    // remove bubble-chart aspect-ratio sizing
    container.style.aspectRatio  = 'unset';
    container.style.width        = '100%';
    container.style.maxWidth     = '100%';

    const { sportMedals, sportRowCount } = computeMedals(data);
    buildMap(container, sportMedals, sportRowCount);
  };

  /* ═══════════════════════════════════════════════════════════════
     STANDALONE MODE  —  self-boots when #homeSportField is absent
  ═══════════════════════════════════════════════════════════════ */
  function standaloneBoot() {
    // Only run if there is no host element (pure standalone page)
    if (document.getElementById('homeSportField')) return;

    injectMapStyles();
    injectPageStyles();

    // build page skeleton
    const header = document.createElement('div');
    header.id = 'sp-header';
    header.innerHTML = `
      <div class="sp-eyebrow">CSC316 · Olympic Data Story</div>
      <h1>Olympic Sports Park</h1>
      <p>Click any glowing venue dot to explore its sports.
         Select a sport pill to see medal leaders and an official link.</p>
      <div id="sp-sport-count">Loading…</div>
    `;
    document.body.appendChild(header);

    const loadingEl = document.createElement('div');
    loadingEl.id = 'sp-loading';
    loadingEl.textContent = 'Loading medal data…';
    document.body.appendChild(loadingEl);

    const outer = document.createElement('div');
    outer.id = 'sp-outer';
    outer.style.display = 'none';
    document.body.appendChild(outer);

    d3.csv(CSV_PATH, d3.autoType)
      .then(rows => {
        loadingEl.remove();
        outer.style.display = '';

        const badge = document.getElementById('sp-sport-count');
        if (badge) {
          const unique = new Set(
            rows.filter(d => d.Season === 'Summer' && d.Sport)
                .map(d => String(d.Sport).trim())
                .filter(s => !s.includes(','))
          );
          badge.textContent = `${unique.size} summer sports`;
        }

        const { sportMedals, sportRowCount } = computeMedals(rows);
        buildMap(outer, sportMedals, sportRowCount);
      })
      .catch(err => {
        loadingEl.innerHTML = `⚠ <strong>Could not load ${CSV_PATH}</strong> — make sure it is in the same folder.`;
        console.error('[sportpark.js]', err);
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', standaloneBoot);
  } else {
    standaloneBoot();
  }

})();
