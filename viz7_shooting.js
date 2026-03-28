/* viz7_shooting.js — Shooting replay + perspective duel */
(function () {
  const COLORS = {
    usa: getCssVar('--usa', '#3b82f6'),
    chn: getCssVar('--chn', '#ef4444'),
    gold: getCssVar('--gold', '#f0c040'),
    silver: getCssVar('--silver', '#d9e0eb'),
    bronze: getCssVar('--bronze', '#cf8a4c'),
  };

  const tooltip = d3.select('#tooltip');
  const MEDALS = ['Gold', 'Silver', 'Bronze'];
  const MEDAL_COLORS = {
    Gold: '#d6b36a',
    Silver: '#bcc2cb',
    Bronze: '#a56a47',
  };
  const MEDAL_RING_FILLS = {
    Gold: '#8f7440',
    Silver: '#68666d',
    Bronze: '#533f3f',
  };
  const TARGET_LAYOUT = {
    USA: { x: 326, y: 358, gunX: 66, gunY: 506, fireX: 198, fireY: 508, gunFlip: 1 },
    CHN: { x: 794, y: 358, gunX: 1054, gunY: 506, fireX: 922, fireY: 508, gunFlip: -1 },
  };
  const RING_RADIUS = {
    Gold: 24,
    Silver: 50,
    Bronze: 78,
  };
  const DUEL_RING_RADIUS = {
    Gold: 42,
    Silver: 82,
    Bronze: 124,
  };
  const DUEL_RING_SCORE = {
    Gold: 10,
    Silver: 6,
    Bronze: 3,
    Miss: 0,
  };
  const DUEL_SCORE_BANDS = {
    USA: { min: 35, max: 50 },
    CHN: { min: 41, max: 50 },
  };
  const DUEL_AI_PLANS = {
    USA: [
      ['Gold', 'Gold', 'Gold', 'Gold', 'Gold'],
      ['Gold', 'Gold', 'Gold', 'Bronze', 'Bronze'],
      ['Gold', 'Gold', 'Gold', 'Silver', 'Bronze'],
      ['Gold', 'Gold', 'Gold', 'Gold', 'Miss'],
      ['Gold', 'Gold', 'Gold', 'Silver', 'Silver'],
      ['Gold', 'Gold', 'Gold', 'Gold', 'Bronze'],
      ['Gold', 'Gold', 'Gold', 'Gold', 'Silver'],
    ],
    CHN: [
      ['Gold', 'Gold', 'Gold', 'Gold', 'Gold'],
      ['Gold', 'Gold', 'Gold', 'Silver', 'Silver'],
      ['Gold', 'Gold', 'Gold', 'Gold', 'Bronze'],
      ['Gold', 'Gold', 'Gold', 'Gold', 'Silver'],
    ],
  };
  const DUEL_HUMAN_SPREAD = 28;
  const DUEL_SWAY_X = 74;
  const DUEL_SWAY_Y = 58;
  const DUEL_SWAY_RADIUS = DUEL_RING_RADIUS.Bronze + 54;
  const BULLET_W = 62;
  const BULLET_H = 20;
  const SHOT_STAGGER_MS = 120;
  const BULLET_TRAVEL_MS = 700;
  const CRATER_HOLD_MS = 1350;
  const DUEL_MAX_SHOTS = 5;
  const DUEL_TARGET = { x: 560, y: 276 };
  const DUEL_FIRE_POS = {
    USA: { gunX: 86, gunY: 404, fireX: 210, fireY: 418, flip: 1 },
    CHN: { gunX: 1034, gunY: 404, fireX: 910, fireY: 418, flip: -1 },
  };
  const DUEL_AI_DELAY_MS = 620;
  const DUEL_BULLET_TRAVEL_MS = 320;
  const SOUND_LIBRARY = {
    shot: { src: 'sound/gunshot.mov', volume: 0.44, poolSize: 6 },
    win: { src: 'sound/Victory Sound Effect.mp3', volume: 0.62, poolSize: 2 },
    draw: { src: 'sound/Tie Game Horns Sound Effect.mp3', volume: 0.58, poolSize: 2 },
    lose: { src: 'sound/Lose sound effects.mp3', volume: 0.62, poolSize: 2 },
  };
  const soundPools = new Map();
  let soundsPrimed = false;

  function getCssVar(name, fallback) {
    const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return value || fallback;
  }

  function createSoundNode(src, volume) {
    const audio = new Audio(src);
    audio.preload = 'auto';
    audio.volume = volume;
    audio.playsInline = true;
    return audio;
  }

  function getSoundPool(name) {
    if (soundPools.has(name)) return soundPools.get(name);
    const config = SOUND_LIBRARY[name];
    if (!config) return [];
    const pool = Array.from({ length: config.poolSize }, () => createSoundNode(config.src, config.volume));
    soundPools.set(name, pool);
    return pool;
  }

  function primeSounds() {
    if (soundsPrimed) return;
    soundsPrimed = true;
    Object.keys(SOUND_LIBRARY).forEach(name => {
      const sample = getSoundPool(name)[0];
      if (!sample) return;
      sample.muted = true;
      try {
        const maybePromise = sample.play();
        if (maybePromise && typeof maybePromise.then === 'function') {
          maybePromise
            .then(() => {
              sample.pause();
              sample.currentTime = 0;
              sample.muted = false;
            })
            .catch(() => {
              sample.muted = false;
            });
        } else {
          sample.pause();
          sample.currentTime = 0;
          sample.muted = false;
        }
      } catch (_error) {
        sample.muted = false;
      }
    });
  }

  function playSound(name) {
    const config = SOUND_LIBRARY[name];
    if (!config) return;
    const pool = getSoundPool(name);
    const audio = pool.find(node => node.paused || node.ended) || pool[0];
    if (!audio) return;
    try {
      audio.pause();
      audio.currentTime = 0;
      audio.volume = config.volume;
      const maybePromise = audio.play();
      if (maybePromise && typeof maybePromise.catch === 'function') {
        maybePromise.catch(() => {});
      }
    } catch (_error) {
      // Ignore unsupported/blocked playback so the interaction still completes.
    }
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

  function escapeHtml(value) {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function shortEventLabel(eventName) {
    return String(eventName || '')
      .replace(/^Shooting\s*/i, '')
      .replace(/^Women's\s+/i, 'W ')
      .replace(/^Men's\s+/i, 'M ')
      .replace(/Mixed Team/gi, 'Mixed')
      .replace(/Three Positions/gi, '3 Pos')
      .replace(/Rapid-Fire/gi, 'Rapid')
      .replace(/metres?/gi, 'm')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function ensureStyles() {
    if (document.getElementById('shooting-viz-style')) return;
    const style = document.createElement('style');
    style.id = 'shooting-viz-style';
    style.textContent = `
      .shoot-shell{position:relative;display:grid;gap:16px}
      .shoot-toolbar{display:flex;justify-content:space-between;gap:16px;align-items:flex-start;flex-wrap:wrap}
      .shoot-toolbar-left{display:grid;gap:12px;flex:1;min-width:280px}
      .shoot-slider-row{display:flex;align-items:center;gap:12px;flex-wrap:wrap}
      .shoot-playback-stack{display:grid;gap:10px;justify-items:end;min-width:300px}
      .shoot-playback{justify-content:flex-end}
      .shoot-game-row{display:flex;justify-content:flex-end;width:100%}
      .shoot-speed-group{display:inline-flex;align-items:center;gap:10px;padding-left:4px}
      .shoot-speed-label{font-family:'Playfair Display',Georgia,serif;font-size:17px;font-weight:700;color:var(--muted);white-space:nowrap}
      .shoot-game-btn{position:relative;overflow:hidden;min-width:min(100%,320px);justify-content:center;background:linear-gradient(135deg,rgba(31,99,222,.98),rgba(11,43,118,.98));border:1px solid rgba(143,205,255,.62);color:#f3f9ff;box-shadow:0 0 0 1px rgba(163,217,255,.18) inset,0 16px 30px rgba(18,63,150,.28),0 0 28px rgba(68,149,255,.24);animation:shootGamePulse 2.1s ease-in-out infinite}
      .shoot-game-btn::before{content:"";position:absolute;inset:-2px auto -2px -38%;width:34%;background:linear-gradient(90deg,rgba(255,255,255,0),rgba(255,255,255,.34),rgba(255,255,255,0));transform:skewX(-22deg);animation:shootGameShine 2.8s linear infinite}
      .shoot-game-btn:hover{transform:translateY(-1px);box-shadow:0 0 0 1px rgba(163,217,255,.2) inset,0 20px 34px rgba(18,63,150,.34),0 0 34px rgba(95,170,255,.3)}
      @keyframes shootGameShine{
        0%{left:-38%}
        58%,100%{left:126%}
      }
      @keyframes shootGamePulse{
        0%,100%{box-shadow:0 0 0 1px rgba(163,217,255,.18) inset,0 16px 30px rgba(18,63,150,.28),0 0 28px rgba(68,149,255,.24)}
        50%{box-shadow:0 0 0 1px rgba(187,231,255,.24) inset,0 20px 36px rgba(18,63,150,.34),0 0 40px rgba(99,182,255,.34)}
      }
      .shoot-kicker{display:inline-flex;align-items:center;padding:7px 12px;border-radius:999px;background:var(--accent-08);border:1px solid var(--accent-18);color:var(--accent-light);font-size:11px;font-weight:800;letter-spacing:.14em;text-transform:uppercase}
      .shoot-year-pill{display:inline-flex;align-items:center;justify-content:center;min-width:78px;padding:7px 14px;border-radius:12px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);font-family:'Playfair Display',Georgia,serif;font-size:24px;font-weight:800;color:var(--ink)}
      .shoot-summary-pill{display:inline-flex;align-items:center;gap:8px;padding:10px 14px;border-radius:14px;background:var(--accent-06);border:1px solid var(--accent-12);font-size:12px;color:var(--muted);line-height:1.5}
      .shoot-stage-frame{position:relative;border-radius:26px;background:radial-gradient(circle at 50% 0%,rgba(255,255,255,.09),transparent 45%),linear-gradient(180deg,rgba(9,18,35,.96),rgba(4,10,22,.98));border:1px solid rgba(255,255,255,.08);overflow:hidden;box-shadow:inset 0 1px 0 rgba(255,255,255,.06),0 24px 40px rgba(0,0,0,.24)}
      .shoot-stage-frame svg{display:block;width:100%;height:auto}
      .shoot-sound-modal{position:absolute;inset:0;z-index:24;display:grid;place-items:center;padding:22px;border-radius:24px;background:rgba(3,10,24,0.74);backdrop-filter:blur(10px)}
      .shoot-sound-modal[hidden]{display:none !important}
      .shoot-sound-card{width:min(100%,460px);display:grid;gap:12px;padding:22px 22px 18px;border-radius:22px;background:linear-gradient(180deg,rgba(9,23,52,0.97),rgba(5,14,32,0.98));border:1px solid rgba(117,164,255,0.24);box-shadow:0 24px 60px rgba(0,0,0,0.38),inset 0 1px 0 rgba(255,255,255,0.08)}
      .shoot-sound-kicker{font-size:10px;font-weight:900;letter-spacing:.2em;text-transform:uppercase;color:#9dc4ff}
      .shoot-sound-title{font-family:'Playfair Display',Georgia,serif;font-size:23px;line-height:1.15;font-weight:800;color:#f7fbff}
      .shoot-sound-copy{font-size:14px;line-height:1.7;color:#c7d8f0}
      .shoot-sound-actions{display:flex;justify-content:flex-end}
      .shoot-inspector{display:grid;gap:6px;padding:14px 16px;border-radius:18px;background:var(--accent-06);border:1px solid var(--accent-12)}
      .shoot-inspector-title{font-size:15px;font-weight:800;color:var(--ink)}
      .shoot-inspector-copy{font-size:13px;line-height:1.65;color:var(--muted)}
      .shoot-inspector-copy strong{color:var(--ink)}
      .shoot-view{display:grid;gap:16px}
      .shoot-view[hidden]{display:none !important}
      .shoot-duel-shell{display:grid;gap:8px;margin-top:2px}
      .shoot-duel-top{display:flex;justify-content:space-between;gap:14px;align-items:flex-start;flex-wrap:wrap}
      .shoot-duel-copy{display:grid;gap:4px;max-width:52ch}
      .shoot-duel-title{font-family:'Playfair Display',Georgia,serif;font-size:19px;font-weight:800;color:var(--ink)}
      .shoot-duel-note{font-size:11px;line-height:1.5;color:var(--muted)}
      .shoot-duel-hud{display:grid;grid-template-columns:minmax(0,1fr) 58px minmax(0,1fr);gap:10px;align-items:stretch}
      .shoot-duel-card{padding:10px 14px;border-radius:16px;background:rgba(6,16,31,0.84);border:1px solid rgba(255,255,255,0.08)}
      .shoot-duel-card.is-turn{border-color:var(--accent-35);box-shadow:0 0 0 1px var(--accent-20) inset}
      .shoot-duel-card.is-human{border-left:3px solid rgba(255,255,255,0.2)}
      .shoot-duel-kicker{font-size:10px;font-weight:900;letter-spacing:.18em;text-transform:uppercase;color:#a9bfdc}
      .shoot-duel-name{margin-top:6px;font-family:'Playfair Display',Georgia,serif;font-size:22px;font-weight:800;color:var(--ink)}
      .shoot-duel-sub{margin-top:2px;font-size:11px;color:var(--muted)}
      .shoot-duel-score{margin-top:8px;font-size:24px;font-family:'Playfair Display',Georgia,serif;font-weight:800;color:#f7fbff}
      .shoot-duel-mid{display:flex;align-items:center;justify-content:center;font-family:'Playfair Display',Georgia,serif;font-size:22px;font-weight:800;color:#7e95b6;min-width:58px}
      .shoot-duel-controls{display:flex;gap:10px;flex-wrap:wrap;align-items:center}
      .shoot-duel-status{display:inline-flex;align-items:center;gap:8px;padding:7px 10px;border-radius:12px;background:var(--accent-06);border:1px solid var(--accent-12);font-size:11px;line-height:1.4;color:var(--muted)}
      .shoot-duel-stage{position:relative;border-radius:18px;background:radial-gradient(circle at 50% 0%,rgba(255,255,255,.08),transparent 45%),linear-gradient(180deg,rgba(9,18,35,.96),rgba(4,10,22,.98));border:1px solid rgba(255,255,255,.08);overflow:hidden;box-shadow:inset 0 1px 0 rgba(255,255,255,.05),0 20px 34px rgba(0,0,0,.22)}
      .shoot-duel-stage svg{display:block;width:100%;height:auto}
      .shoot-duel-foot{display:grid;gap:3px;padding:8px 10px;border-radius:14px;background:var(--accent-06);border:1px solid var(--accent-12)}
      .shoot-duel-foot-title{font-size:13px;font-weight:800;color:var(--ink)}
      .shoot-duel-foot-copy{font-size:11px;line-height:1.45;color:var(--muted)}
      .shoot-duel-target{cursor:crosshair}
      .shoot-duel-target.is-waiting{cursor:not-allowed}
      .shoot-duel-target.is-ready .duel-target-ring{filter:drop-shadow(0 0 14px rgba(255,255,255,0.06))}
      .shoot-duel-target.is-ready .duel-target-core{filter:drop-shadow(0 0 16px rgba(214,179,106,0.22))}
      @media(max-width:640px){
        .shoot-slider-row{align-items:flex-start}
        .shoot-playback-stack{justify-items:start}
        .shoot-playback{justify-content:flex-start}
        .shoot-game-row{justify-content:flex-start}
        .shoot-speed-group{padding-left:0}
        .shoot-duel-hud{grid-template-columns:1fr}
        .shoot-duel-mid{min-height:38px}
      }
    `;
    document.head.appendChild(style);
  }

  function prepareRows(data) {
    const medalRows = data.filter(d =>
      d.Season === 'Summer' &&
      d.Sport === 'Shooting' &&
      (d.NOC === 'USA' || d.NOC === 'CHN') &&
      (d.Medal === 'Gold' || d.Medal === 'Silver' || d.Medal === 'Bronze') &&
      +d.Year >= 1984
    );

    const dedup = new Map();
    medalRows.forEach(d => {
      const key = `${d.Year}|${d.NOC}|${d.Sport}|${d.Event}|${d.Medal}`;
      if (!dedup.has(key)) dedup.set(key, d);
    });

    return Array.from(dedup.values())
      .map(d => ({
        ...d,
        Year: +d.Year,
        key: `${d.Year}|${d.NOC}|${d.Event}|${d.Medal}`,
        shortEvent: shortEventLabel(d.Event),
      }))
      .sort((a, b) =>
        d3.ascending(a.Year, b.Year) ||
        d3.ascending(a.NOC, b.NOC) ||
        d3.ascending(MEDALS.indexOf(a.Medal), MEDALS.indexOf(b.Medal)) ||
        d3.ascending(a.Event, b.Event)
      );
  }

  function countMedals(rows, noc) {
    const counts = { Gold: 0, Silver: 0, Bronze: 0 };
    rows.forEach(d => {
      if (d.NOC !== noc) return;
      counts[d.Medal] += 1;
    });
    return counts;
  }

  function totalCount(counts) {
    return counts.Gold + counts.Silver + counts.Bronze;
  }

  function impactPoint(shot, shotIndex, shotCount, perspective) {
    const target = TARGET_LAYOUT[shot.NOC];
    const focusShift = perspective === 'china' ? 18 : -18;
    const centerX = target.x + (shot.NOC === 'USA' ? -focusShift : focusShift);
    const centerY = target.y;
    const radius = RING_RADIUS[shot.Medal];
    const span = shotCount <= 1 ? 0 : Math.min(170, 34 * (shotCount - 1));
    const start = -90 - span / 2;
    const angleDeg = shotCount <= 1 ? -90 : start + (span / (shotCount - 1)) * shotIndex;
    const angle = angleDeg * (Math.PI / 180);
    return {
      x: centerX + Math.cos(angle) * radius,
      y: centerY + Math.sin(angle) * radius,
    };
  }

  function medalForDistance(distance) {
    if (distance <= RING_RADIUS.Gold) return 'Gold';
    if (distance <= RING_RADIUS.Silver) return 'Silver';
    if (distance <= RING_RADIUS.Bronze) return 'Bronze';
    return 'Miss';
  }

  function duelMedalForDistance(distance) {
    if (distance <= DUEL_RING_RADIUS.Gold) return 'Gold';
    if (distance <= DUEL_RING_RADIUS.Silver) return 'Silver';
    if (distance <= DUEL_RING_RADIUS.Bronze) return 'Bronze';
    return 'Miss';
  }

  function randomInRange(min, max) {
    return min + Math.random() * (max - min);
  }

    function shuffleCopy(values) {
      const copy = values.slice();
      for (let i = copy.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
      return copy;
    }

    function planScore(plan) {
      return plan.reduce((sum, medal) => sum + (DUEL_RING_SCORE[medal] || 0), 0);
    }

  function renderShootingGame(data) {
    const host = d3.select('#shootingViz');
    if (!host.node()) return;

    ensureStyles();
    host.selectAll('*').remove();

    const rows = prepareRows(data);
    const years = d3.sort(Array.from(new Set(rows.map(d => d.Year))));
    if (!years.length) {
      host.append('div')
        .attr('class', 'shoot-inspector')
        .html('<div class="shoot-inspector-title">No shooting data available.</div><div class="shoot-inspector-copy">The dataset does not contain USA/CHN Summer shooting medals for this view.</div>');
      return;
    }

    const rowsByYear = d3.group(rows, d => d.Year);

    host.html(`
      <div class="shoot-shell">
        <div id="shootSoundPrompt" class="shoot-sound-modal" hidden>
          <div class="shoot-sound-card" role="dialog" aria-modal="true" aria-labelledby="shootSoundPromptTitle">
            <div class="shoot-sound-kicker">Sound Reminder</div>
            <div id="shootSoundPromptTitle" class="shoot-sound-title">This shooting section uses audio.</div>
            <div class="shoot-sound-copy">If you're muted, please turn the volume up a bit here. If your volume is too high, please lower it before playing.</div>
            <div class="shoot-sound-actions">
              <button id="shootDismissSoundPromptBtn" class="race-btn" type="button">Okay, continue</button>
            </div>
          </div>
        </div>
        <div id="shootReplayView" class="shoot-view">
          <div class="shoot-toolbar">
            <div class="shoot-toolbar-left">
              <div class="shoot-slider-row">
                <span class="shoot-kicker">Round Year</span>
                <input id="shootYearSlider" type="range" />
                <span id="shootYearValue" class="shoot-year-pill">-</span>
              </div>
              <div id="shootYearSummary" class="shoot-summary-pill">Loading shooting replay...</div>
            </div>
            <div class="shoot-playback-stack">
              <div class="race-playback shoot-playback">
                <button id="shootPlayPauseBtn" class="race-btn" type="button">Play</button>
                <button id="shootRestartBtn" class="race-btn secondary" type="button">Restart</button>
                <div class="shoot-speed-group">
                  <span class="shoot-speed-label">Speed:</span>
                  <select id="shootSpeedSelect" class="race-speed" aria-label="Shooting autoplay speed">
                    <option value="1200">Slow</option>
                    <option value="850" selected>Normal</option>
                    <option value="550">Fast</option>
                  </select>
                </div>
              </div>
              <div class="shoot-game-row">
                <button id="shootEnterGameBtn" class="race-btn shoot-game-btn" type="button">Play a Shooting Game vs AI</button>
              </div>
            </div>
          </div>
          <div class="shoot-stage-frame">
            <svg id="shootStageSvg" viewBox="0 0 1120 640" aria-label="USA and China shooting medal replay"></svg>
          </div>
        </div>
        <div id="shootGameView" class="shoot-view" hidden>
          <div class="shoot-duel-shell">
            <div class="shoot-duel-top">
              <div class="shoot-duel-copy">
                <div class="shoot-duel-title">Perspective Duel</div>
                <div id="shootDuelNote" class="shoot-duel-note">Your current perspective becomes the human player and the other side is AI.</div>
              </div>
              <div class="shoot-duel-controls">
                <button id="shootBackToReplayBtn" class="race-btn secondary" type="button">Back to Replay</button>
                <button id="shootDuelStartBtn" class="race-btn" type="button">Play Again</button>
                <button id="shootDuelResetBtn" class="race-btn secondary" type="button">Reset duel</button>
              </div>
            </div>
            <div id="shootDuelStatus" class="shoot-duel-status">Waiting to start the duel.</div>
            <div class="shoot-duel-stage">
              <svg id="shootDuelSvg" viewBox="0 0 1120 540" aria-label="Perspective shooting duel game"></svg>
            </div>
            <div class="shoot-duel-foot">
              <div id="shootDuelInfoTitle" class="shoot-duel-foot-title"></div>
              <div id="shootDuelInfoBody" class="shoot-duel-foot-copy"></div>
            </div>
          </div>
        </div>
      </div>
    `);

    const yearSlider = host.select('#shootYearSlider').node();
    const yearValue = host.select('#shootYearValue');
    const yearSummary = host.select('#shootYearSummary');
    const soundPrompt = host.select('#shootSoundPrompt').node();
    const dismissSoundPromptBtn = host.select('#shootDismissSoundPromptBtn').node();
    const svg = host.select('#shootStageSvg');
    const playPauseBtn = host.select('#shootPlayPauseBtn').node();
    const restartBtn = host.select('#shootRestartBtn').node();
    const enterGameBtn = host.select('#shootEnterGameBtn').node();
    const speedSelect = host.select('#shootSpeedSelect').node();
    const replayView = host.select('#shootReplayView').node();
    const gameView = host.select('#shootGameView').node();
    const backToReplayBtn = host.select('#shootBackToReplayBtn').node();
    const duelStartBtn = host.select('#shootDuelStartBtn').node();
    const duelResetBtn = host.select('#shootDuelResetBtn').node();
    const duelStatus = host.select('#shootDuelStatus');
    const duelNote = host.select('#shootDuelNote');
    const duelInfoTitle = host.select('#shootDuelInfoTitle');
    const duelInfoBody = host.select('#shootDuelInfoBody');
    const duelSvg = host.select('#shootDuelSvg');

    let currentYearIndex = years.length - 1;
    let perspective = document.body.dataset.perspective || 'usa';
    let isAutoplay = false;
    let autoplayTimer = null;
    let autoplayDelay = +speedSelect.value;
    let renderNonce = 0;
    let duelState = null;
    let duelAiTimer = null;
    let duelAimFrame = 0;
    let duelAimPoint = { x: DUEL_TARGET.x, y: DUEL_TARGET.y };
    let shootMode = 'replay';
    let soundPromptDismissed = false;

    function showSoundPrompt() {
      if (!soundPrompt || soundPromptDismissed) return;
      soundPrompt.hidden = false;
    }

    function dismissSoundPrompt() {
      if (!soundPrompt) return;
      soundPrompt.hidden = true;
      soundPromptDismissed = true;
    }

    yearSlider.min = 0;
    yearSlider.max = Math.max(0, years.length - 1);
    yearSlider.step = 1;
    yearSlider.value = currentYearIndex;

    function currentYear() {
      return years[currentYearIndex] ?? years[years.length - 1];
    }

    function rowsForYearIndex(yearIndex) {
      return (rowsByYear.get(years[yearIndex]) || []).slice();
    }

    function cumulativeCountsThrough(yearIndex, noc) {
      const counts = { Gold: 0, Silver: 0, Bronze: 0 };
      rows.forEach(d => {
        if (d.NOC !== noc) return;
        if (d.Year > years[yearIndex]) return;
        counts[d.Medal] += 1;
      });
      return counts;
    }

    function clearAutoplayTimer() {
      if (autoplayTimer) clearTimeout(autoplayTimer);
      autoplayTimer = null;
    }

    function clearDuelAiTimer() {
      if (duelAiTimer) clearTimeout(duelAiTimer);
      duelAiTimer = null;
    }

    function clearDuelAimFrame() {
      if (duelAimFrame) cancelAnimationFrame(duelAimFrame);
      duelAimFrame = 0;
    }

    function stopAutoplay() {
      isAutoplay = false;
      clearAutoplayTimer();
      playPauseBtn.textContent = 'Play';
    }

    function setShootMode(mode) {
      shootMode = mode === 'duel' ? 'duel' : 'replay';
      replayView.hidden = shootMode !== 'replay';
      gameView.hidden = shootMode !== 'duel';
      if (shootMode === 'duel') {
        stopAutoplay();
      } else {
        clearDuelAimFrame();
      }
    }

    function duelPlayers() {
      const human = perspective === 'china' ? 'CHN' : 'USA';
      const ai = human === 'USA' ? 'CHN' : 'USA';
      return { human, ai };
    }

    function duelWinnerText() {
      if (!duelState) return '';
      const humanScore = duelState.players[duelState.human].score;
      const aiScore = duelState.players[duelState.ai].score;
      if (humanScore === aiScore) return 'The duel is tied.';
      return humanScore > aiScore ? `${duelState.human} wins the duel.` : `${duelState.ai} wins the duel.`;
    }

    function updateDuelHud() {
      if (!duelState) return;
      const humanPlayer = duelState.players[duelState.human];
      const aiPlayer = duelState.players[duelState.ai];
      const totalShotsTaken = humanPlayer.shots.length + aiPlayer.shots.length;

      duelStartBtn.textContent = duelState.started || totalShotsTaken || duelState.over ? 'Play Again 🎯' : 'Start Duel 🎯';

      if (duelState.over) {
        duelStatus.text(duelWinnerText());
      } else if (!duelState.started) {
        duelStatus.text(`Press ${duelStartBtn.textContent} to play as ${duelState.human}.`);
      } else if (duelState.turn === duelState.human) {
        duelStatus.text(`${duelState.human} turn. Time the moving sight and click the shared target.`);
      } else {
        duelStatus.text(`${duelState.ai} is lining up a shot...`);
      }
    }

    function updateDuelCopy() {
      const { human, ai } = duelPlayers();
      duelNote.text(`Current perspective makes ${human} the human player and ${ai} the AI opponent. Aim sway and shot spread are active, so timing matters.`);
    }

    function duelShotSummary(shot) {
      if (!shot) return 'No shots yet.';
      return `${shot.noc} hit ${shot.medal} for ${shot.score} points.`;
    }

    function playDuelOutcomeSound() {
      if (!duelState) return;
      const humanScore = duelState.players[duelState.human].score;
      const aiScore = duelState.players[duelState.ai].score;
      if (humanScore === aiScore) {
        playSound('draw');
      } else if (humanScore > aiScore) {
        playSound('win');
      } else {
        playSound('lose');
      }
    }

    function updateDuelInfo(lastShot) {
      if (!duelState) return;
      if (duelState.over) {
        duelInfoTitle.text('Duel complete');
        duelInfoBody.text(`${duelWinnerText()} Final score: ${duelState.human} ${duelState.players[duelState.human].score} · ${duelState.ai} ${duelState.players[duelState.ai].score}.`);
        return;
      }
      duelInfoTitle.text('One-target challenge');
      duelInfoBody.text(`${duelShotSummary(lastShot)} Wait for the moving sight to drift where you want, then fire.`);
    }

    function currentHumanAimPoint() {
      if (!duelState) return { x: DUEL_TARGET.x, y: DUEL_TARGET.y };
      const phase = performance.now() * 0.00285 + duelState.players[duelState.human].shots.length * 1.12;
      const x = DUEL_TARGET.x + Math.sin(phase * 1.32) * DUEL_SWAY_X + Math.cos(phase * 0.86) * 20;
      const y = DUEL_TARGET.y + Math.cos(phase * 1.08) * DUEL_SWAY_Y + Math.sin(phase * 1.94) * 16;
      const dx = x - DUEL_TARGET.x;
      const dy = y - DUEL_TARGET.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance <= DUEL_SWAY_RADIUS) return { x, y };
      const ratio = DUEL_SWAY_RADIUS / distance;
      return {
        x: DUEL_TARGET.x + dx * ratio,
        y: DUEL_TARGET.y + dy * ratio,
      };
    }

    function createHumanShot(noc, aim = duelAimPoint || currentHumanAimPoint()) {
      const spreadX = randomInRange(-DUEL_HUMAN_SPREAD, DUEL_HUMAN_SPREAD);
      const spreadY = randomInRange(-DUEL_HUMAN_SPREAD, DUEL_HUMAN_SPREAD);
      const dx = aim.x + spreadX - DUEL_TARGET.x;
      const dy = aim.y + spreadY - DUEL_TARGET.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const maxRadius = DUEL_RING_RADIUS.Bronze + 44;
      const ratio = distance > maxRadius ? maxRadius / distance : 1;
      const x = DUEL_TARGET.x + dx * ratio;
      const y = DUEL_TARGET.y + dy * ratio;
      return createDuelShot(noc, x, y, 'human');
    }

    function syncDuelAimMotion() {
      clearDuelAimFrame();
      if (!duelState || shootMode !== 'duel' || !duelState.started || duelState.over || duelState.turn !== duelState.human) return;

      const tick = () => {
        if (!duelState || shootMode !== 'duel' || !duelState.started || duelState.over || duelState.turn !== duelState.human) {
          duelAimFrame = 0;
          return;
        }
        const sight = duelSvg.select('.duel-human-sight');
        if (sight.empty()) {
          duelAimFrame = 0;
          return;
        }
        const aim = currentHumanAimPoint();
        duelAimPoint = aim;
        sight.attr('transform', `translate(${aim.x},${aim.y})`);
        duelAimFrame = requestAnimationFrame(tick);
      };

      duelAimFrame = requestAnimationFrame(tick);
    }

    function createDuelShot(noc, x, y, source) {
      const dx = x - DUEL_TARGET.x;
      const dy = y - DUEL_TARGET.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const medal = duelMedalForDistance(distance);
      return {
        noc,
        x,
        y,
        dx,
        dy,
        distance,
        medal,
        score: DUEL_RING_SCORE[medal],
        source,
      };
    }

    function pointForAiMedal(medal) {
      let radius;
      if (medal === 'Gold') {
        radius = randomInRange(2, DUEL_RING_RADIUS.Gold - 7);
      } else if (medal === 'Silver') {
        radius = randomInRange(DUEL_RING_RADIUS.Gold + 4, DUEL_RING_RADIUS.Silver - 8);
      } else if (medal === 'Bronze') {
        radius = randomInRange(DUEL_RING_RADIUS.Silver + 4, DUEL_RING_RADIUS.Bronze - 10);
      } else {
        radius = randomInRange(DUEL_RING_RADIUS.Bronze + 6, DUEL_RING_RADIUS.Bronze + 28);
      }
      const angle = randomInRange(0, Math.PI * 2);
      return {
        x: DUEL_TARGET.x + Math.cos(angle) * radius,
        y: DUEL_TARGET.y + Math.sin(angle) * radius,
      };
    }

    function chooseAiPlan(noc) {
      const options = DUEL_AI_PLANS[noc] || DUEL_AI_PLANS.USA;
      const band = DUEL_SCORE_BANDS[noc] || DUEL_SCORE_BANDS.USA;
      const inBand = options.filter(plan => {
        const total = planScore(plan);
        return total >= band.min && total <= band.max;
      });
      const pool = inBand.length ? inBand : options;
      return shuffleCopy(pool[Math.floor(Math.random() * pool.length)]);
    }

    function createAiShot(noc) {
      const shotIndex = duelState.players[noc].shots.length;
      const medal = duelState.aiPlan?.[shotIndex] || 'Silver';
      const { x, y } = pointForAiMedal(medal);
      return createDuelShot(noc, x, y, 'ai');
    }

    function drawDuelShotAnimation(shot, onComplete) {
      const fire = DUEL_FIRE_POS[shot.noc];
      const bulletLayer = duelSvg.select('.duel-bullet-layer');
      const markLayer = duelSvg.select('.duel-mark-layer');
      const traceLayer = duelSvg.select('.duel-trace-layer');
      const dx = shot.x - fire.fireX;
      const dy = shot.y - fire.fireY;
      const angle = Math.atan2(dy, dx) * (180 / Math.PI);

      const trace = traceLayer.append('line')
        .attr('x1', fire.fireX)
        .attr('y1', fire.fireY)
        .attr('x2', fire.fireX)
        .attr('y2', fire.fireY)
        .attr('stroke', shot.noc === 'USA' ? 'rgba(86,152,255,0.24)' : 'rgba(240,112,112,0.24)')
        .attr('stroke-width', 2)
        .attr('stroke-linecap', 'round');

      const bullet = bulletLayer.append('g')
        .attr('transform', `translate(${fire.fireX},${fire.fireY}) rotate(${angle})`)
        .attr('opacity', 1);

      bullet.append('image')
        .attr('href', 'image/bullet.png')
        .attr('x', -BULLET_W + 4)
        .attr('y', -BULLET_H / 2)
        .attr('width', BULLET_W)
        .attr('height', BULLET_H)
        .attr('preserveAspectRatio', 'xMidYMid meet');

      playSound('shot');

      bullet.transition()
        .duration(DUEL_BULLET_TRAVEL_MS)
        .ease(d3.easeCubicIn)
        .attr('transform', `translate(${shot.x},${shot.y}) rotate(${angle})`)
        .on('end', function () {
          d3.select(this).remove();
          trace.transition().duration(240).attr('opacity', 0).remove();

          const mark = markLayer.append('g')
            .attr('transform', `translate(${shot.x},${shot.y})`);

          mark.append('circle')
            .attr('r', 8)
            .attr('fill', 'rgba(6,10,19,0.88)');

          mark.append('circle')
            .attr('r', 10)
            .attr('fill', 'none')
            .attr('stroke', shot.noc === 'USA' ? COLORS.usa : COLORS.chn)
            .attr('stroke-width', 2.2)
            .attr('opacity', 0.9);

          if (onComplete) onComplete();
        });

      trace.transition()
        .duration(DUEL_BULLET_TRAVEL_MS)
        .ease(d3.easeCubicIn)
        .attr('x2', shot.x)
        .attr('y2', shot.y);
    }

    function endDuelIfNeeded() {
      if (!duelState) return false;
      const humanDone = duelState.players[duelState.human].shots.length >= DUEL_MAX_SHOTS;
      const aiDone = duelState.players[duelState.ai].shots.length >= DUEL_MAX_SHOTS;
      if (humanDone && aiDone) {
        duelState.over = true;
        duelState.turn = null;
        clearDuelAiTimer();
        playDuelOutcomeSound();
        return true;
      }
      return false;
    }

    function applyDuelShot(shot) {
      const player = duelState.players[shot.noc];
      player.shots.push(shot);
      player.score += shot.score;
      duelState.lastShot = shot;
      const isOver = endDuelIfNeeded();
      if (!isOver) {
        duelState.turn = shot.noc === duelState.human ? duelState.ai : duelState.human;
      }
      updateDuelHud();
      updateDuelInfo(shot);
      clearDuelAimFrame();
      duelSvg.select('.duel-human-sight').remove();
      drawDuelShotAnimation(shot, () => {
        renderDuelBoard();
        if (!isOver && duelState.turn === duelState.ai) queueAiShot();
      });
    }

    function queueAiShot() {
      clearDuelAiTimer();
      if (!duelState || duelState.over || duelState.turn !== duelState.ai) return;
      duelAiTimer = setTimeout(() => {
        const shot = createAiShot(duelState.ai);
        applyDuelShot(shot);
      }, DUEL_AI_DELAY_MS);
    }

    function renderDuelBoard(skipShot = null) {
      clearDuelAimFrame();
      duelSvg.selectAll('*').remove();

      const W = 1120;
      const H = 540;
      const human = duelState ? duelState.human : duelPlayers().human;
      const ai = duelState ? duelState.ai : duelPlayers().ai;
      const humanPlayer = duelState ? duelState.players[human] : { shots: [], score: 0 };
      const aiPlayer = duelState ? duelState.players[ai] : { shots: [], score: 0 };

      const defs = duelSvg.append('defs');
      const bg = defs.append('linearGradient')
        .attr('id', 'duelBg')
        .attr('x1', '0%').attr('y1', '0%')
        .attr('x2', '0%').attr('y2', '100%');
      bg.append('stop').attr('offset', '0%').attr('stop-color', '#0b1529');
      bg.append('stop').attr('offset', '100%').attr('stop-color', '#07101d');

      duelSvg.append('rect')
        .attr('width', W)
        .attr('height', H)
        .attr('fill', 'url(#duelBg)');

      duelSvg.append('circle')
        .attr('cx', DUEL_TARGET.x)
        .attr('cy', 78)
        .attr('r', 126)
        .attr('fill', perspective === 'china' ? COLORS.chn : COLORS.usa)
        .attr('opacity', 0.08)
        .style('filter', 'blur(28px)');

      duelSvg.append('text')
        .attr('x', 72)
        .attr('y', 32)
        .attr('fill', 'rgba(248,251,255,0.92)')
        .attr('font-size', 20)
        .attr('font-family', 'Playfair Display, Georgia, serif')
        .attr('font-weight', 800)
        .text('One Target Duel');

      duelSvg.append('text')
        .attr('x', 72)
        .attr('y', 52)
        .attr('fill', 'rgba(201,215,238,0.74)')
        .attr('font-size', 11)
        .attr('font-family', 'Lora, Georgia, serif')
        .text(`${human} is you · ${ai} is AI · the sight drifts on purpose, so click when its timing feels right`);

      function drawStageScoreCard(x, y, noc, role, player, isTurn, align = 'start') {
        const width = 184;
        const height = 160;
        const accent = noc === 'USA' ? COLORS.usa : COLORS.chn;
        const anchor = align === 'end' ? x - width : x;
        const card = duelSvg.append('g')
          .attr('transform', `translate(${anchor},${y})`);
        const rounds = Array.from({ length: DUEL_MAX_SHOTS }, (_, index) => player.shots[index] || null);

        card.append('rect')
          .attr('width', width)
          .attr('height', height)
          .attr('rx', 16)
          .attr('fill', 'rgba(6,16,31,0.9)')
          .attr('stroke', isTurn ? accent : 'rgba(255,255,255,0.08)')
          .attr('stroke-width', isTurn ? 2 : 1.1);

        card.append('rect')
          .attr('x', align === 'end' ? width - 4 : 0)
          .attr('width', 4)
          .attr('height', height)
          .attr('rx', 4)
          .attr('fill', isTurn ? accent : 'rgba(255,255,255,0.18)')
          .attr('opacity', 0.95);

        card.append('text')
          .attr('x', align === 'end' ? width - 18 : 18)
          .attr('y', 24)
          .attr('text-anchor', align === 'end' ? 'end' : 'start')
          .attr('fill', '#a9bfdc')
          .attr('font-size', 10)
          .attr('font-family', 'DM Sans, sans-serif')
          .attr('font-weight', 900)
          .attr('letter-spacing', '0.18em')
          .text(role.toUpperCase());

        card.append('text')
          .attr('x', align === 'end' ? width - 18 : 18)
          .attr('y', 50)
          .attr('text-anchor', align === 'end' ? 'end' : 'start')
          .attr('fill', '#f7fbff')
          .attr('font-size', 24)
          .attr('font-family', 'Playfair Display, Georgia, serif')
          .attr('font-weight', 800)
          .text(noc);

        card.append('text')
          .attr('x', align === 'end' ? width - 18 : 18)
          .attr('y', 70)
          .attr('text-anchor', align === 'end' ? 'end' : 'start')
          .attr('fill', 'rgba(201,215,238,0.78)')
          .attr('font-size', 10)
          .attr('font-family', 'Lora, Georgia, serif')
          .text(`${player.shots.length}/${DUEL_MAX_SHOTS} shots`);

        card.append('text')
          .attr('x', align === 'end' ? width - 18 : 18)
          .attr('y', 96)
          .attr('text-anchor', align === 'end' ? 'end' : 'start')
          .attr('fill', '#f7fbff')
          .attr('font-size', 26)
          .attr('font-family', 'Playfair Display, Georgia, serif')
          .attr('font-weight', 800)
          .text(player.score);

        rounds.forEach((shot, index) => {
          const row = card.append('g')
            .attr('transform', `translate(${16},${108 + index * 10})`);

          row.append('text')
            .attr('x', 0)
            .attr('y', 0)
            .attr('fill', 'rgba(201,215,238,0.68)')
            .attr('font-size', 8.5)
            .attr('font-family', 'DM Sans, sans-serif')
            .attr('font-weight', 700)
            .text(`R${index + 1}`);

          if (shot) {
            row.append('circle')
              .attr('cx', 26)
              .attr('cy', -3)
              .attr('r', 3)
              .attr('fill', MEDAL_COLORS[shot.medal] || 'rgba(201,215,238,0.38)');

            row.append('text')
              .attr('x', 36)
              .attr('y', 0)
              .attr('fill', '#dce7f6')
              .attr('font-size', 8.5)
              .attr('font-family', 'DM Sans, sans-serif')
              .attr('font-weight', 700)
              .text(`${shot.medal === 'Miss' ? 'Miss' : shot.medal[0]} ${shot.score}`);
          } else {
            row.append('text')
              .attr('x', 36)
              .attr('y', 0)
              .attr('fill', 'rgba(201,215,238,0.42)')
              .attr('font-size', 8.5)
              .attr('font-family', 'DM Sans, sans-serif')
              .attr('font-weight', 700)
              .text('Pending');
          }
        });
      }

      drawStageScoreCard(94, 134, human, 'You', humanPlayer, duelState && duelState.turn === human && !duelState.over, 'start');
      drawStageScoreCard(W - 94, 134, ai, 'AI', aiPlayer, duelState && duelState.turn === ai && !duelState.over, 'end');

      const targetG = duelSvg.append('g')
        .attr('class', `shoot-duel-target${duelState && duelState.turn === human && !duelState.over ? ' is-ready' : ' is-waiting'}`)
        .attr('transform', `translate(${DUEL_TARGET.x},${DUEL_TARGET.y})`);

      targetG.append('ellipse')
        .attr('cx', 0)
        .attr('cy', 184)
        .attr('rx', 160)
        .attr('ry', 30)
        .attr('fill', 'rgba(0,0,0,0.28)');

      targetG.append('circle')
        .attr('class', 'duel-target-ring')
        .attr('r', DUEL_RING_RADIUS.Bronze)
        .attr('fill', MEDAL_RING_FILLS.Bronze)
        .attr('stroke', MEDAL_COLORS.Bronze)
        .attr('stroke-width', 2.6);

      targetG.append('circle')
        .attr('class', 'duel-target-ring')
        .attr('r', DUEL_RING_RADIUS.Silver)
        .attr('fill', MEDAL_RING_FILLS.Silver)
        .attr('stroke', MEDAL_COLORS.Silver)
        .attr('stroke-width', 2.6);

      targetG.append('circle')
        .attr('class', 'duel-target-core')
        .attr('r', DUEL_RING_RADIUS.Gold)
        .attr('fill', MEDAL_RING_FILLS.Gold)
        .attr('stroke', MEDAL_COLORS.Gold)
        .attr('stroke-width', 2.6);

      targetG.append('circle')
        .attr('r', 8)
        .attr('fill', 'rgba(255,255,255,0.86)');

      targetG.on('click', function (event) {
        if (!duelState || !duelState.started || duelState.over || duelState.turn !== human) return;
        const [px, py] = d3.pointer(event, duelSvg.node());
        const dx = px - DUEL_TARGET.x;
        const dy = py - DUEL_TARGET.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance > DUEL_RING_RADIUS.Bronze + 56) return;
        applyDuelShot(createHumanShot(human, duelAimPoint));
      });

      const markLayer = duelSvg.append('g')
        .attr('class', 'duel-mark-layer')
        .attr('pointer-events', 'none');
      duelSvg.append('g').attr('class', 'duel-trace-layer');
      duelSvg.append('g').attr('class', 'duel-bullet-layer');

      if (duelState) {
        [human, ai].forEach(noc => {
          duelState.players[noc].shots.forEach(shot => {
            if (shot === skipShot) return;
            const mark = markLayer.append('g')
              .attr('transform', `translate(${shot.x},${shot.y})`);

            mark.append('circle')
              .attr('r', 8)
              .attr('fill', 'rgba(6,10,19,0.88)');

            mark.append('circle')
              .attr('r', 10)
              .attr('fill', 'none')
              .attr('stroke', shot.noc === 'USA' ? COLORS.usa : COLORS.chn)
              .attr('stroke-width', 2.2)
              .attr('opacity', 0.9);
          });
        });
      }

      if (duelState && duelState.started && !duelState.over && duelState.turn === human) {
        const aim = currentHumanAimPoint();
        duelAimPoint = aim;
        const sight = duelSvg.append('g')
          .attr('class', 'duel-human-sight')
          .attr('transform', `translate(${aim.x},${aim.y})`)
          .attr('pointer-events', 'none');

        sight.append('circle')
          .attr('r', 14)
          .attr('fill', 'none')
          .attr('stroke', 'rgba(255,255,255,0.82)')
          .attr('stroke-width', 1.3);

        sight.append('circle')
          .attr('r', 4)
          .attr('fill', 'rgba(255,255,255,0.9)');

        sight.append('line')
          .attr('x1', -20)
          .attr('x2', -8)
          .attr('y1', 0)
          .attr('y2', 0)
          .attr('stroke', 'rgba(255,255,255,0.72)')
          .attr('stroke-width', 1.2);

        sight.append('line')
          .attr('x1', 8)
          .attr('x2', 20)
          .attr('y1', 0)
          .attr('y2', 0)
          .attr('stroke', 'rgba(255,255,255,0.72)')
          .attr('stroke-width', 1.2);

        sight.append('line')
          .attr('x1', 0)
          .attr('x2', 0)
          .attr('y1', -20)
          .attr('y2', -8)
          .attr('stroke', 'rgba(255,255,255,0.72)')
          .attr('stroke-width', 1.2);

        sight.append('line')
          .attr('x1', 0)
          .attr('x2', 0)
          .attr('y1', 8)
          .attr('y2', 20)
          .attr('stroke', 'rgba(255,255,255,0.72)')
          .attr('stroke-width', 1.2);
      }

      const gunW = 176;
      const gunH = 106;
      [human, ai].forEach(noc => {
        const fire = DUEL_FIRE_POS[noc];
        duelSvg.append('image')
          .attr('href', 'image/gun.png')
          .attr('width', gunW)
          .attr('height', gunH)
          .attr('preserveAspectRatio', 'xMidYMid meet')
          .attr('opacity', duelState && duelState.turn === noc && !duelState.over ? 1 : 0.82)
          .attr('transform', `translate(${fire.gunX},${fire.gunY}) scale(${fire.flip},1)`);
      });

      syncDuelAimMotion();
    }

    function resetDuelState(autostart = false) {
      clearDuelAiTimer();
      clearDuelAimFrame();
      duelAimPoint = { x: DUEL_TARGET.x, y: DUEL_TARGET.y };
      const { human, ai } = duelPlayers();
      duelState = {
        human,
        ai,
        aiPlan: chooseAiPlan(ai),
        started: autostart,
        over: false,
        turn: autostart ? human : null,
        lastShot: null,
        players: {
          [human]: { shots: [], score: 0 },
          [ai]: { shots: [], score: 0 },
        },
      };
      updateDuelCopy();
      updateDuelHud();
      updateDuelInfo(null);
      renderDuelBoard();
    }

    function startDuel() {
      setShootMode('duel');
      resetDuelState(true);
    }

    function stepDelay(frame) {
      if (!frame.shots.length) return autoplayDelay;
      return Math.max(autoplayDelay, frame.shots.length * SHOT_STAGGER_MS + BULLET_TRAVEL_MS + CRATER_HOLD_MS);
    }

    function frameForIndex(yearIndex) {
      const year = years[yearIndex];
      const shots = rowsForYearIndex(yearIndex).sort((a, b) =>
        d3.ascending(a.NOC, b.NOC) ||
        d3.ascending(MEDALS.indexOf(a.Medal), MEDALS.indexOf(b.Medal)) ||
        d3.ascending(a.Event, b.Event)
      );

      const grouped = d3.group(shots, d => `${d.NOC}|${d.Medal}`);
      const counters = new Map();
      const shotsWithImpact = shots.map(shot => {
        const key = `${shot.NOC}|${shot.Medal}`;
        const used = counters.get(key) || 0;
        const total = (grouped.get(key) || []).length;
        counters.set(key, used + 1);
        return {
          ...shot,
          impact: impactPoint(shot, used, total, perspective),
        };
      });

      return {
        year,
        shots: shotsWithImpact,
        usaCurrent: countMedals(shotsWithImpact, 'USA'),
        chnCurrent: countMedals(shotsWithImpact, 'CHN'),
        usaCumulative: cumulativeCountsThrough(yearIndex, 'USA'),
        chnCumulative: cumulativeCountsThrough(yearIndex, 'CHN'),
      };
    }

    function drawTarget(scene, noc, perspectiveNow) {
      const focusNoc = perspectiveNow === 'china' ? 'CHN' : 'USA';
      const base = TARGET_LAYOUT[noc];
      const isFocus = noc === focusNoc;
      const scale = isFocus ? 1.04 : 0.97;
      const g = scene.append('g')
        .attr('transform', `translate(${base.x},${base.y}) scale(${scale})`);

      g.append('ellipse')
        .attr('cx', 0)
        .attr('cy', 118)
        .attr('rx', 110)
        .attr('ry', 18)
        .attr('fill', 'rgba(0,0,0,0.32)');

      g.append('circle')
        .attr('r', 96)
        .attr('fill', 'rgba(255,255,255,0.08)')
        .attr('opacity', isFocus ? 0.16 : 0.1)
        .style('filter', 'blur(12px)');

      g.append('circle')
        .attr('r', 82)
        .attr('fill', MEDAL_RING_FILLS.Bronze)
        .attr('stroke', MEDAL_COLORS.Bronze)
        .attr('stroke-width', 2.2)
        .attr('opacity', 0.96);

      g.append('circle')
        .attr('r', 54)
        .attr('fill', MEDAL_RING_FILLS.Silver)
        .attr('stroke', MEDAL_COLORS.Silver)
        .attr('stroke-width', 2.2)
        .attr('opacity', 0.98);

      g.append('circle')
        .attr('r', 28)
        .attr('fill', MEDAL_RING_FILLS.Gold)
        .attr('stroke', MEDAL_COLORS.Gold)
        .attr('stroke-width', 2.2)
        .attr('opacity', 1);

      g.append('circle')
        .attr('r', 6)
        .attr('fill', 'rgba(255,255,255,0.82)');

      g.append('text')
        .attr('x', 0)
        .attr('y', -128)
        .attr('text-anchor', 'middle')
        .attr('fill', '#f7fbff')
        .attr('font-size', 18)
        .attr('font-family', 'Playfair Display, Georgia, serif')
        .attr('font-weight', 800)
        .text(noc);
    }

    function drawCounter(scene, noc, counts, perspectiveNow) {
      const target = TARGET_LAYOUT[noc];
      const focusNoc = perspectiveNow === 'china' ? 'CHN' : 'USA';
      const card = scene.append('g')
        .attr('transform', `translate(${target.x - 118},${88})`);
      const total = totalCount(counts);

      card.append('rect')
        .attr('width', 236)
        .attr('height', 104)
        .attr('rx', 18)
        .attr('fill', 'rgba(6,16,31,0.84)')
        .attr('stroke', noc === focusNoc ? 'rgba(255,255,255,0.16)' : 'rgba(255,255,255,0.08)')
        .attr('stroke-width', noc === focusNoc ? 2 : 1.3);

      card.append('text')
        .attr('x', 18)
        .attr('y', 26)
        .attr('fill', '#a9bfdc')
        .attr('font-size', 10)
        .attr('font-family', 'DM Sans, sans-serif')
        .attr('font-weight', 900)
        .attr('letter-spacing', '0.18em')
        .text(noc);

      card.append('text')
        .attr('x', 18)
        .attr('y', 58)
        .attr('fill', '#f7fbff')
        .attr('font-size', 30)
        .attr('font-family', 'Playfair Display, Georgia, serif')
        .attr('font-weight', 800)
        .text(total);

      MEDALS.forEach((medal, index) => {
        const chip = card.append('g')
          .attr('transform', `translate(${18 + index * 70},${80})`);

        chip.append('circle')
          .attr('r', 5)
          .attr('fill', MEDAL_COLORS[medal]);

        chip.append('text')
          .attr('x', 11)
          .attr('y', 4)
          .attr('fill', '#bfd0e6')
          .attr('font-size', 11)
          .attr('font-family', 'DM Sans, sans-serif')
          .attr('font-weight', 700)
          .text(`${medal[0]} ${counts[medal]}`);
      });
    }

    function drawStaticScene(frame) {
      svg.selectAll('*').remove();

      const W = 1120;
      const H = 640;
      const vanishX = perspective === 'china' ? 768 : 352;
      const rangeColor = perspective === 'china' ? COLORS.chn : COLORS.usa;

      const defs = svg.append('defs');
      const bg = defs.append('linearGradient')
        .attr('id', 'shootReplayBg')
        .attr('x1', '0%').attr('y1', '0%')
        .attr('x2', '0%').attr('y2', '100%');
      bg.append('stop').attr('offset', '0%').attr('stop-color', perspective === 'china' ? '#22080b' : '#081425');
      bg.append('stop').attr('offset', '52%').attr('stop-color', perspective === 'china' ? '#101522' : '#102544');
      bg.append('stop').attr('offset', '100%').attr('stop-color', perspective === 'china' ? '#1a130d' : '#102033');

      svg.append('rect')
        .attr('width', W)
        .attr('height', H)
        .attr('fill', 'url(#shootReplayBg)');

      svg.append('circle')
        .attr('cx', perspective === 'china' ? 904 : 216)
        .attr('cy', 116)
        .attr('r', 170)
        .attr('fill', rangeColor)
        .attr('opacity', 0.12)
        .style('filter', 'blur(34px)');

      svg.append('polygon')
        .attr('points', `126,602 994,602 854,218 266,218`)
        .attr('fill', 'rgba(255,255,255,0.03)')
        .attr('stroke', 'rgba(255,255,255,0.05)');

      d3.range(0, 6).forEach(i => {
        const x0 = 142 + i * 164;
        svg.append('line')
          .attr('x1', x0)
          .attr('y1', 602)
          .attr('x2', vanishX)
          .attr('y2', 154)
          .attr('stroke', 'rgba(255,255,255,0.08)')
          .attr('stroke-width', 1.2);
      });

      d3.range(0, 5).forEach(i => {
        const y = 232 + i * 76;
        const inset = 190 + i * 18;
        svg.append('line')
          .attr('x1', inset)
          .attr('y1', y)
          .attr('x2', W - inset)
          .attr('y2', y)
          .attr('stroke', 'rgba(255,255,255,0.05)')
          .attr('stroke-width', 1.2);
      });

      svg.append('text')
        .attr('x', 74)
        .attr('y', 58)
        .attr('fill', 'rgba(248,251,255,0.92)')
        .attr('font-size', 24)
        .attr('font-family', 'Playfair Display, Georgia, serif')
        .attr('font-weight', 800)
        .text('Shooting Replay');

      svg.append('text')
        .attr('x', 74)
        .attr('y', 86)
        .attr('fill', 'rgba(201,215,238,0.74)')
        .attr('font-size', 13)
        .attr('font-family', 'Lora, Georgia, serif')
        .text('Each medal becomes a bullet impact on the target ring for that medal value.');

      const scene = svg.append('g');

      drawCounter(scene, 'USA', frame.usaCumulative, perspective);
      drawCounter(scene, 'CHN', frame.chnCumulative, perspective);
      drawTarget(scene, 'USA', perspective);
      drawTarget(scene, 'CHN', perspective);

      const gunW = 164;
      const gunH = 98;

      ['USA', 'CHN'].forEach(noc => {
        const layout = TARGET_LAYOUT[noc];
        scene.append('image')
          .attr('href', 'image/gun.png')
          .attr('width', gunW)
          .attr('height', gunH)
          .attr('preserveAspectRatio', 'xMidYMid meet')
          .attr('opacity', 0.97)
          .attr('transform', `translate(${layout.gunX},${layout.gunY}) scale(${layout.gunFlip},1)`);
      });

      const craterLayer = scene.append('g').attr('class', 'shoot-crater-layer');
      const bulletLayer = scene.append('g').attr('class', 'shoot-bullet-layer');
      return { craterLayer, bulletLayer };
    }

    function animateFrame(frame, nonce = renderNonce) {
      const layers = drawStaticScene(frame);

      if (!frame.shots.length) return;

      frame.shots.forEach((shot, index) => {
        const muzzle = TARGET_LAYOUT[shot.NOC];
        const dx = shot.impact.x - muzzle.fireX;
        const dy = shot.impact.y - muzzle.fireY;
        const angle = Math.atan2(dy, dx) * (180 / Math.PI);
        const bullet = layers.bulletLayer.append('g')
          .attr('transform', `translate(${muzzle.fireX},${muzzle.fireY}) rotate(${angle})`)
          .attr('opacity', 0);

        bullet.append('image')
          .attr('href', 'image/bullet.png')
          .attr('x', -BULLET_W + 4)
          .attr('y', -BULLET_H / 2)
          .attr('width', BULLET_W)
          .attr('height', BULLET_H)
          .attr('preserveAspectRatio', 'xMidYMid meet');

        bullet.transition()
          .delay(index * SHOT_STAGGER_MS)
          .duration(90)
          .attr('opacity', 1)
          .on('start', function () {
            if (nonce !== renderNonce) return;
            playSound('shot');
          })
          .transition()
          .duration(BULLET_TRAVEL_MS)
          .ease(d3.easeCubicIn)
          .attr('transform', `translate(${shot.impact.x},${shot.impact.y}) rotate(${angle})`)
          .on('end', function () {
            if (nonce !== renderNonce) return;
            d3.select(this).remove();

            const crater = layers.craterLayer.append('g')
              .attr('transform', `translate(${shot.impact.x},${shot.impact.y})`)
              .attr('opacity', 0)
              .on('mouseenter', event => {
                showTooltip(
                  `<div><b>${escapeHtml(shot.shortEvent)}</b></div><div class="k">${shot.Year} · ${shot.NOC} · ${shot.Medal}</div>`,
                  event
                );
              })
              .on('mousemove', moveTooltip)
              .on('mouseleave', hideTooltip);

            crater.append('circle')
              .attr('r', 7)
              .attr('fill', 'rgba(4,7,15,0.88)');

            crater.append('circle')
              .attr('r', 10)
              .attr('fill', 'none')
              .attr('stroke', MEDAL_COLORS[shot.Medal] || '#fff')
              .attr('stroke-width', 1.8)
              .attr('opacity', 0.86);

            crater.append('circle')
              .attr('r', 3)
              .attr('fill', 'rgba(255,255,255,0.06)');

            crater.transition()
              .duration(120)
              .attr('opacity', 1)
              .transition()
              .delay(CRATER_HOLD_MS)
              .duration(420)
              .attr('opacity', 0)
              .remove();
          });
      });
    }

    function renderReplayFrame(frame, shouldAnimate = false) {
      renderNonce += 1;
      const nonce = renderNonce;
      if (shouldAnimate) {
        animateFrame(frame, nonce);
      } else {
        drawStaticScene(frame);
      }
    }

    function updateText(frame) {
      yearValue.text(frame.year);
      yearSummary.html(
        `${frame.year} · USA ${totalCount(frame.usaCurrent)} hit${totalCount(frame.usaCurrent) === 1 ? '' : 's'} this year · ` +
        `CHN ${totalCount(frame.chnCurrent)} hit${totalCount(frame.chnCurrent) === 1 ? '' : 's'} this year · ` +
        `cumulative totals update above each target`
      );
    }

    function renderYear(yearIndex, shouldAnimate = false) {
      currentYearIndex = Math.max(0, Math.min(years.length - 1, yearIndex));
      yearSlider.value = currentYearIndex;
      const frame = frameForIndex(currentYearIndex);
      updateText(frame);
      renderReplayFrame(frame, shouldAnimate);
      return frame;
    }

    function queueNext(frame) {
      clearAutoplayTimer();
      if (!isAutoplay) return;
      autoplayTimer = setTimeout(() => {
        if (currentYearIndex >= years.length - 1) {
          stopAutoplay();
          return;
        }
        const nextFrame = renderYear(currentYearIndex + 1, true);
        queueNext(nextFrame);
      }, stepDelay(frame));
    }

    function startAutoplay() {
      isAutoplay = true;
      playPauseBtn.textContent = 'Pause';
      const frame = renderYear(currentYearIndex, true);
      queueNext(frame);
    }

    yearSlider.addEventListener('input', () => {
      stopAutoplay();
      renderYear(+yearSlider.value);
    });

    playPauseBtn.addEventListener('click', () => {
      primeSounds();
      if (isAutoplay) {
        stopAutoplay();
      } else {
        startAutoplay();
      }
    });

    restartBtn.addEventListener('click', () => {
      primeSounds();
      currentYearIndex = 0;
      yearSlider.value = 0;
      startAutoplay();
    });

    speedSelect.addEventListener('change', () => {
      autoplayDelay = +speedSelect.value;
      if (isAutoplay) {
        clearAutoplayTimer();
        const frame = frameForIndex(currentYearIndex);
        queueNext(frame);
      }
    });

    enterGameBtn.addEventListener('click', () => {
      primeSounds();
      startDuel();
    });

    backToReplayBtn.addEventListener('click', () => {
      clearDuelAiTimer();
      clearDuelAimFrame();
      setShootMode('replay');
      resetDuelState(false);
    });

    duelStartBtn.addEventListener('click', () => {
      primeSounds();
      startDuel();
    });

    duelResetBtn.addEventListener('click', () => {
      primeSounds();
      resetDuelState(true);
    });

    dismissSoundPromptBtn?.addEventListener('click', dismissSoundPrompt);

    if (host.node().__shootingPerspectiveHandler) {
      window.removeEventListener('perspectiveChange', host.node().__shootingPerspectiveHandler);
    }

    const perspectiveHandler = event => {
      const wasDuelMode = shootMode === 'duel';
      perspective = event?.detail?.perspective || document.body.dataset.perspective || 'usa';
      const shouldAnimateReplay = isAutoplay && !wasDuelMode;
      const frame = renderYear(currentYearIndex, shouldAnimateReplay);
      if (shouldAnimateReplay) queueNext(frame);
      resetDuelState(wasDuelMode);
      if (wasDuelMode) {
        setShootMode('duel');
      }
    };
    host.node().__shootingPerspectiveHandler = perspectiveHandler;
    window.addEventListener('perspectiveChange', perspectiveHandler);

    const shootingSection = document.getElementById('shootingCard');
    if (shootingSection && soundPrompt) {
      const soundPromptObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting || soundPromptDismissed) return;
          showSoundPrompt();
          soundPromptObserver.disconnect();
        });
      }, { threshold: 0.35 });
      soundPromptObserver.observe(shootingSection);
    }

    renderYear(currentYearIndex, false);
    setShootMode('replay');
    resetDuelState(false);
  }

  window.renderShootingGame = renderShootingGame;
})();
