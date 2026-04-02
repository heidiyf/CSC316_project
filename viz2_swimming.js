/* viz2_swimming.js — v6
   Pool  = 8 lanes, all expand simultaneously from both ends
   ONE swimmer.gif per lane — animated, loops until midline
   Medal dots accumulate behind the swimmer
   Lanes 4 & 5 fill first (weighted seeding mirrors real Olympics)
   Per-stroke images in the description card
*/
(function () {

  /* ═══════════════════════════════════════════════
     CSS
  ═══════════════════════════════════════════════ */
  (function injectCSS() {
    if (document.getElementById('_s6css')) return;
    const s = document.createElement('style'); s.id = '_s6css';
    s.textContent = `
      .s6-host svg{border-radius:18px;box-shadow:0 0 28px rgba(0,160,255,.22),0 0 70px rgba(0,100,200,.1);display:block;width:100%}
      @keyframes wvA{0%,100%{transform:translateX(0)}50%{transform:translateX(-55px) scaleY(1.07)}}
      @keyframes wvB{0%,100%{transform:translateX(0)}50%{transform:translateX(48px) scaleY(.95)}}
      @keyframes wvC{0%,100%{transform:translateX(0)}50%{transform:translateX(-28px) scaleY(1.04)}}
      .wA{animation:wvA 5.4s ease-in-out infinite}
      .wB{animation:wvB 7.1s ease-in-out infinite}
      .wC{animation:wvC 9.2s ease-in-out infinite}

      /* pills */
      .s6-prow{display:flex;align-items:center;flex-wrap:wrap;gap:7px;margin:9px 0 9px}
      .s6-plbl{font-size:11px;font-weight:800;letter-spacing:.13em;text-transform:uppercase;color:rgba(120,160,255,.38);flex-shrink:0;margin-right:2px}
      .s6-pill{appearance:none;border:1px solid rgba(100,160,255,.17);background:rgba(10,24,58,.5);color:#94a3b8;padding:5px 13px;border-radius:999px;font-size:12px;font-weight:700;cursor:pointer;transition:all .2s;font-family:'Lora',Georgia,serif}
      .s6-pill:hover{color:#e2e8f0;border-color:rgba(100,160,255,.36);background:rgba(26,108,255,.1)}
      .s6-pill.on{background:rgba(26,108,255,.22);border-color:rgba(26,108,255,.58);color:#bfdbfe;box-shadow:0 0 12px rgba(26,108,255,.18)}
      body[data-perspective="china"] .s6-pill.on{background:rgba(220,32,32,.22);border-color:rgba(220,32,32,.58);color:#fecaca;box-shadow:0 0 12px rgba(220,32,32,.18)}

      /* playback */
      .s6-ctrl{display:flex;align-items:center;gap:9px;flex-wrap:wrap;margin-bottom:11px}
      .s6-btn{appearance:none;border:1px solid rgba(100,160,255,.2);background:rgba(10,24,58,.6);color:#94a3b8;padding:7px 15px;border-radius:999px;font-size:12px;font-weight:700;cursor:pointer;transition:all .2s;font-family:'Lora',Georgia,serif}
      .s6-btn:hover{color:#e2e8f0;border-color:rgba(100,160,255,.4)}
      .s6-btn.on{background:rgba(26,108,255,.2);border-color:rgba(26,108,255,.48);color:#93c5fd}
      body[data-perspective="china"] .s6-btn.on{background:rgba(220,32,32,.2);border-color:rgba(220,32,32,.48);color:#fca5a5}
      .s6-spd{appearance:none;background:rgba(10,24,58,.7);border:1px solid rgba(100,160,255,.17);color:#94a3b8;padding:5px 11px;border-radius:999px;font-size:12px;font-weight:600;cursor:pointer;font-family:'Lora',Georgia,serif}

      /* stat cards — square shape, perspective-aware spotlight */
      .s6-srow{display:flex;gap:12px;flex-wrap:wrap;margin-bottom:12px;align-items:flex-start}
      .s6-card{border-radius:14px;padding:14px 16px;flex:0 0 160px;width:160px;height:160px;box-sizing:border-box;background:rgba(8,18,42,.92);border:1.5px solid rgba(59,130,246,.2);transition:box-shadow .25s,border-color .25s;display:flex;flex-direction:column;justify-content:space-between}
      .s6-card.u{border-color:rgba(59,130,246,.26)}
      .s6-card.c{border-color:rgba(239,68,68,.26)}
      .s6-card.u.sp{box-shadow:0 0 0 2px rgba(59,130,246,.65),0 6px 20px rgba(26,108,255,.2);border-color:rgba(59,130,246,.7)}
      .s6-card.c.sp{box-shadow:0 0 0 2px rgba(239,68,68,.65),0 6px 20px rgba(220,32,32,.2);border-color:rgba(239,68,68,.7)}
      .s6-clbl{font-size:9px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:#475569;margin-bottom:2px}
      .s6-cum{font-size:10px;font-weight:700;padding:2px 8px;border-radius:999px;display:inline-block;margin-bottom:4px}
      .s6-cum.u{background:rgba(59,130,246,.13);color:#93c5fd}
      .s6-cum.c{background:rgba(239,68,68,.13);color:#fca5a5}
      .s6-tot{font-size:30px;font-weight:900;line-height:1;margin:2px 0 4px}
      .s6-tot.u{color:#60a5fa}
      .s6-tot.c{color:#f87171}
      .s6-brk{display:flex;gap:9px}
      .s6-m span:first-child{font-size:9px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;color:#64748b;display:block;text-align:center}
      .s6-m span:last-child{font-size:14px;font-weight:800;display:block;text-align:center}

      /* stroke info card — warm white, same height as stat cards, dark text */
      .s6-info{flex:1;min-width:200px;height:160px;box-sizing:border-box;border-radius:14px;overflow:hidden;display:flex;flex-direction:column;background:#fdf6ee !important;border:1.5px solid #e8d9c4;box-shadow:0 4px 18px rgba(0,0,0,.18)}
      .s6-info-body{padding:10px 18px 12px;display:flex;flex-direction:column;justify-content:center;gap:4px;height:100%}
      .s6-info-title{font-size:13px;font-weight:900;color:#1a2332 !important;margin:0 0 2px;line-height:1.2}
      .s6-info-text{font-size:11.5px;line-height:1.45;color:#2d3f52 !important;margin:0}
      .s6-info-link{display:inline-flex;align-items:center;gap:4px;padding:5px 12px;border-radius:999px;border:1.5px solid #2563eb;background:rgba(37,99,235,.1);color:#1d4ed8 !important;font-size:11px;font-weight:700;text-decoration:none;width:fit-content;transition:all .18s;flex-shrink:0}
      .s6-info-link:hover{background:rgba(37,99,235,.2)}

      /* paris finals — perspective-aware full card background + border */
      .s6-fc{border-radius:18px;padding:14px 14px 12px;background:linear-gradient(160deg,rgba(13,30,51,.97),rgba(7,16,31,.99));border:1px solid rgba(59,130,246,.36);box-shadow:0 12px 30px rgba(2,8,23,.42);transition:background .4s,border-color .4s}
      body[data-perspective="china"] .s6-fc{background:linear-gradient(160deg,rgba(50,8,8,.97),rgba(30,4,4,.99));border-color:rgba(239,68,68,.45)}
      .s6-fplay{appearance:none;border-radius:999px;border:1px solid rgba(59,130,246,.36);background:rgba(29,78,216,.18);color:#bfdbfe;cursor:pointer;padding:7px 14px;font-size:12px;font-weight:700;transition:all .2s}
      body[data-perspective="china"] .s6-fplay{border-color:rgba(239,68,68,.4);background:rgba(185,28,28,.2);color:#fecaca}
      .s6-fplay:hover{transform:translateY(-1px);opacity:.85}

      /* athlete hover popup — interactive so cursor can move to the link */
      #_s6atip{position:fixed;pointer-events:auto;z-index:10000;opacity:0;transform:translateY(6px);transition:opacity .15s,transform .15s}
      #_s6atip.on{opacity:1;transform:none}
      #_s6atip .at-box{background:#0d1e33;border-radius:14px;padding:12px 16px;min-width:170px;box-shadow:0 8px 32px rgba(0,0,0,.6),0 0 0 1px rgba(255,255,255,.08);display:flex;flex-direction:column;align-items:center;gap:9px}
      #_s6atip .at-name{font-size:13px;font-weight:800;color:#f1f5f9;text-align:center}
      #_s6atip .at-link{font-size:11.5px;font-weight:700;color:#93c5fd;text-decoration:none;border:1px solid rgba(59,130,246,.35);padding:5px 14px;border-radius:999px;background:rgba(59,130,246,.12);transition:background .15s}
      #_s6atip .at-link:hover{background:rgba(59,130,246,.28);color:#bfdbfe}
      #_s6atip .at-arr{position:absolute;bottom:-6px;left:50%;transform:translateX(-50%);border:5px solid transparent;border-top-color:#0d1e33;border-bottom:0}

      /* slider */
      #yearSlider{accent-color:#3b82f6}
      body[data-perspective="china"] #yearSlider{accent-color:#ef4444}

      /* tooltip */
      #_s6tip{position:fixed;pointer-events:none;z-index:9999;opacity:0;transform:translateY(5px);transition:opacity .13s,transform .13s}
      #_s6tip.on{opacity:1;transform:none}
      #_s6tip .ti{background:#0d1e33;border-radius:11px;padding:9px 13px;min-width:160px;box-shadow:0 8px 30px rgba(0,0,0,.55),0 0 0 1px rgba(255,255,255,.07)}
      #_s6tip .tr{display:flex;align-items:center;gap:7px;margin-bottom:4px}
      #_s6tip .td{width:9px;height:9px;border-radius:50%}
      #_s6tip .tm{font-size:10px;font-weight:800;letter-spacing:.05em;text-transform:uppercase}
      #_s6tip .tn{margin-left:auto;font-size:10px;font-weight:800;padding:2px 6px;border-radius:20px;color:#fff}
      #_s6tip .tname{font-size:13px;font-weight:700;color:#e2e8f0;margin-bottom:2px}
      #_s6tip .tevt{font-size:11px;color:#94a3b8}
      #_s6tip .arr{position:absolute;bottom:-6px;left:50%;transform:translateX(-50%);border:5px solid transparent;border-top-color:#0d1e33;border-bottom:0}

      /* paris finals grid */
      .s6-fg{display:grid;grid-template-columns:repeat(auto-fit,minmax(272px,1fr));gap:14px}
      .s6-ftb{display:flex;flex-wrap:wrap;align-items:center;gap:9px;margin:0 0 14px}
      .s6-ftop{display:flex;align-items:center;justify-content:space-between;gap:9px;margin-bottom:9px}
      .s6-fkicker{display:inline-flex;align-items:center;padding:4px 9px;border-radius:999px;font-size:11px;font-weight:800;letter-spacing:.07em;text-transform:uppercase;background:rgba(148,163,184,.13);color:#cbd5e1}
      .s6-fgap{display:inline-flex;align-items:center;padding:4px 9px;border-radius:999px;font-size:11px;font-weight:800;letter-spacing:.07em;text-transform:uppercase;background:rgba(34,197,94,.13);color:#86efac}
      .s6-fevt{margin:0 0 5px;font-size:17px;color:#f8fafc}
      .s6-fcopy{margin:0 0 11px;font-size:13px;color:#cbd5e1}
      .s6-fstage svg{display:block;width:100%;height:auto;margin-bottom:9px}
      .s6-ftimes{display:grid;gap:5px}
      .s6-frow{display:grid;grid-template-columns:auto minmax(0,1fr) auto;align-items:center;gap:7px;font-size:13px;color:#cbd5e1}
      .s6-frow.w{font-weight:800;color:#f8fafc}
      .s6-fnoc{padding:3px 7px;border-radius:999px;font-size:11px;font-weight:800}
      .s6-fname{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
      .s6-ftime{font-variant-numeric:tabular-nums;font-weight:800}
      .swim-story-break{margin-top:26px;padding-top:20px;border-top:1px solid rgba(148,163,184,.2)}
      .swim-story-break h2{margin:0 0 7px;font-size:21px}
    `;
    document.head.appendChild(s);
  })();

  /* ═══════════════════════════════════════════════
     TOOLTIP
  ═══════════════════════════════════════════════ */
  const TIP = (() => {
    let el = null;
    const NB = { USA: '#1a3fa8', CHN: '#9b1c1c' };
    function ensure() {
      if (el) return el;
      el = document.createElement('div'); el.id = '_s6tip';
      el.innerHTML = `<div class="ti"><div class="tr"><span class="td" id="_s6td"></span><span class="tm" id="_s6tm"></span><span class="tn" id="_s6tn"></span></div><div class="tname" id="_s6tnm"></div><div class="tevt" id="_s6tev"></div></div><div class="arr"></div>`;
      document.body.appendChild(el); return el;
    }
    function pos(e) {
      const t = ensure(), tw = t.offsetWidth || 195, th = t.offsetHeight || 72;
      let x = e.clientX - tw / 2, y = e.clientY - th - 13;
      x = Math.max(6, Math.min(x, innerWidth - tw - 6));
      if (y < 6) y = e.clientY + 16;
      t.style.left = x + 'px'; t.style.top = y + 'px';
    }
    function show(e, d) {
      const t = ensure();
      document.getElementById('_s6td').style.background = MC[d.medal] || '#ccc';
      document.getElementById('_s6tm').textContent = d.medal;
      document.getElementById('_s6tm').style.color = MC[d.medal] || '#ccc';
      document.getElementById('_s6tn').textContent = d.noc;
      document.getElementById('_s6tn').style.background = NB[d.noc] || '#334';
      document.getElementById('_s6tnm').textContent = d.name;
      document.getElementById('_s6tev').textContent = String(d.event).replace(/^Swimming\s*/i, '');
      pos(e); t.classList.add('on');
    }
    function move(e) { if (el?.classList.contains('on')) pos(e); }
    function hide() { el?.classList.remove('on'); }
    return { show, move, hide };
  })();

  /* ═══════════════════════════════════════════════
     COLORS
  ═══════════════════════════════════════════════ */
  function cv(n, fb) { return getComputedStyle(document.documentElement).getPropertyValue(n).trim() || fb; }
  const GOLD = cv('--gold', '#f0c040'), SILVER = cv('--silver', '#c8c8c8'), BRONZE = cv('--bronze', '#d4874a');
  const MC = { Gold: GOLD, Silver: SILVER, Bronze: BRONZE };
  const MEDAL_ORDER = ['Gold', 'Silver', 'Bronze'];
  const RANK = { Gold: 0, Silver: 1, Bronze: 2 };

  /* ── Lane seeding weights (8 lanes, lanes 4&5 get the most) ── */
  const LANE_W = [1.0, 1.0, 1.15, 1.4, 1.4, 1.15, 1.0, 1.0]; // sum = 10.1

  /* ═══════════════════════════════════════════════
     STROKE DEFINITIONS with per-image filenames
  ═══════════════════════════════════════════════ */
  const STROKES = [
    { id:'all',          icon:'🏊', label:'All',          img:'all.png',
      title:'Olympic Swimming',
      desc:'Swimming is one of the most popular Olympic sports, where athletes race in a pool using different strokes to achieve the fastest time over various distances.',
      usa:'USA is the most decorated swimming nation in Olympic history — dominant in every era from 1904 through Paris 2024.',
      chn:'China went from zero medals in 1984 to genuine multi-stroke contender by 2020 — one of the fastest rises ever.',
      link:'https://www.nbcolympics.com/news/swimming-101-four-strokes', lt:'Swimming 101' },
    { id:'freestyle',    icon:'💨', label:'Freestyle',     img:'freestyle.png',
      title:'Freestyle',
      desc:'Freestyle is the fastest swimming stroke, usually performed as the front crawl, where swimmers alternate arm strokes while kicking continuously.',
      usa:'From Weissmuller to Phelps to Dressel — USA\'s freestyle dominance spans 120 years across every distance.',
      chn:'Zhanle Pan shattered the 100m world record in Paris 2024, signaling China\'s growing freestyle ambition.',
      link:'https://www.nbcolympics.com/news/swimming-101-four-strokes', lt:'Swimming 101' },
    { id:'backstroke',   icon:'🔄', label:'Backstroke',    img:'backstroke.png',
      title:'Backstroke',
      desc:'Backstroke is swum on the swimmer\'s back, with alternating arm movements and a flutter kick while facing upward.',
      usa:'Aaron Peirsol and Natalie Coughlin headlined USA\'s golden backstroke era. Elite coverage in every Games.',
      chn:'Xu Jiayu\'s 100m backstroke gold at Paris 2024 was China\'s first-ever major Olympic backstroke title.',
      link:'https://www.nbcolympics.com/news/swimming-101-four-strokes', lt:'Swimming 101' },
    { id:'breaststroke', icon:'🐸', label:'Breaststroke',  img:'breaststroke.png',
      title:'Breaststroke',
      desc:'Breaststroke uses a frog-like kick and simultaneous arm movements, making it the slowest but one of the most technical strokes.',
      usa:'The oldest stroke — USA has mastered its precise timing and dominated the 100m and 200m across all eras.',
      chn:'Qin Haiyang swept three World Championship golds in 2023. China\'s breaststroke is rising fast.',
      link:'https://www.nbcolympics.com/news/swimming-101-four-strokes', lt:'Swimming 101' },
    { id:'butterfly',    icon:'🦋', label:'Butterfly',     img:'butterfly.png',
      title:'Butterfly',
      desc:'Butterfly is a powerful stroke where both arms move together over the water while the body performs a dolphin kick.',
      usa:'Michael Phelps won Olympic 100m butterfly gold four times — no stroke is more tied to USA\'s Olympic identity.',
      chn:'Zhang Yufei\'s silver in Paris 100m butterfly signals China\'s serious entry into this showpiece event.',
      link:'https://www.nbcolympics.com/news/swimming-101-four-strokes', lt:'Swimming 101' },
    { id:'medley',       icon:'🎯', label:'Medley',        img:'medley.png',
      title:'Individual Medley',
      desc:'Medley events combine all four strokes in one race, requiring swimmers to complete butterfly, backstroke, breaststroke, and freestyle in a specific order.',
      usa:'Phelps won the 200m IM four consecutive times. USA has owned this complete-swimmer test in every era.',
      chn:'Lin Li\'s IM gold at Barcelona 1992 was a landmark. A new generation is closing the gap.',
      link:'https://www.nbcolympics.com/news/swimming-101-four-strokes', lt:'Swimming 101' },
    { id:'relay',        icon:'🤝', label:'Relay',         img:'relay.png',
      title:'Team Relays',
      desc:'Relay races involve a team of four swimmers, each swimming one portion of the race before passing the turn to the next teammate.',
      usa:'USA relay teams are legendary — multiple world records and century-long dominance in freestyle and medley.',
      chn:'China\'s mixed 4×100m medley relay directly challenged USA at recent Games — a rivalry to watch in 2028.',
      link:'https://www.nbcolympics.com/news/swimming-101-four-strokes', lt:'Swimming 101' },
  ];

  /* ═══════════════════════════════════════════════
     DATA HELPERS
  ═══════════════════════════════════════════════ */
  function strokeOf(ev) {
    const e = String(ev).toLowerCase();
    if (/relay/.test(e))                            return 'relay';
    if (/butterfly/.test(e))                        return 'butterfly';
    if (/backstroke/.test(e))                       return 'backstroke';
    if (/breaststroke/.test(e))                     return 'breaststroke';
    if (/individual medley|medley/.test(e))         return 'medley';
    if (/freestyle|crawl/.test(e))                  return 'freestyle';
    return 'other';
  }
  function dedupeRelays(rows) {
    const seen = new Set();
    return rows.filter(d => { const k=`${d.Year}|${d.Event}|${d.Medal}|${d.NOC}`; if(seen.has(k))return false; seen.add(k); return true; });
  }
  function fStroke(rows, id) { return id === 'all' ? rows : rows.filter(d => strokeOf(d.Event) === id); }
  function mCount(rows) { const o={Gold:0,Silver:0,Bronze:0}; rows.forEach(d=>{if(d.Medal in o)o[d.Medal]++;}); return o; }

  /* ═══════════════════════════════════════════════
     LANE DISTRIBUTION
     Weighted deficit algorithm → lanes 4&5 always heaviest
     Gold medals assigned first (fastest lanes fill fastest)
  ═══════════════════════════════════════════════ */
  function distributeLanes(medals, nLanes) {
    const wTotal = LANE_W.reduce((a,b)=>a+b,0);
    const targets = LANE_W.map(w => w / wTotal * medals.length);
    const lanes = Array.from({length:nLanes}, () => []);
    // Gold first → they land in fastest (highest-weight) lanes
    const sorted = medals.slice().sort((a,b)=>(RANK[a.Medal]??9)-(RANK[b.Medal]??9));
    sorted.forEach(m => {
      let best=0, bestD=-Infinity;
      for (let l=0; l<nLanes; l++) {
        const d = targets[l] - lanes[l].length;
        if (d > bestD) { bestD=d; best=l; }
      }
      lanes[best].push(m);
    });
    return lanes;
  }

  /* ═══════════════════════════════════════════════
     STAR HELPER
  ═══════════════════════════════════════════════ */
  function star(cx,cy,oR,iR,n){
    const pts=[],step=Math.PI/n;
    for(let i=0;i<2*n;i++){
      const r=i%2===0?oR:iR,a=-Math.PI/2+i*step;
      pts.push([cx+r*Math.cos(a),cy+r*Math.sin(a)]);
    }
    return pts.map(p=>p.join(',')).join(' ');
  }

  /* ═══════════════════════════════════════════════
     POOL FRAME — drawn once
  ═══════════════════════════════════════════════ */
  function buildFrame(svg, L) {
    const {W,DK,NL,LH,PX,PY,PW,PH,MID} = L;
    const defs = svg.append('defs');
    const wg=defs.append('linearGradient').attr('id','_s6wg').attr('x1','0%').attr('y1','0%').attr('x2','100%').attr('y2','100%');
    wg.append('stop').attr('offset','0%').attr('stop-color','#0a3d6b');
    wg.append('stop').attr('offset','55%').attr('stop-color','#0d5fa0');
    wg.append('stop').attr('offset','100%').attr('stop-color','#0e7490');
    const dL=defs.append('linearGradient').attr('id','_s6dL').attr('x1','0%').attr('y1','0%').attr('x2','100%').attr('y2','0%');
    dL.append('stop').attr('offset','0%').attr('stop-color','#0f2540');
    dL.append('stop').attr('offset','100%').attr('stop-color','#0c1e38');
    const dR=defs.append('linearGradient').attr('id','_s6dR').attr('x1','0%').attr('y1','0%').attr('x2','100%').attr('y2','0%');
    dR.append('stop').attr('offset','0%').attr('stop-color','#250f0f');
    dR.append('stop').attr('offset','100%').attr('stop-color','#2e1010');
    defs.append('clipPath').attr('id','_s6cp').append('rect').attr('x',PX).attr('y',PY).attr('width',PW).attr('height',PH).attr('rx',14);
    defs.append('clipPath').attr('id','_s6mcp').append('rect').attr('x',PX+2).attr('y',PY+2).attr('width',PW-4).attr('height',PH-4).attr('rx',12);

    const g=svg.append('g');
    // Deck panels
    g.append('rect').attr('x',2).attr('y',PY).attr('width',DK-4).attr('height',PH).attr('rx',9)
      .attr('fill','url(#_s6dL)').attr('stroke','rgba(59,130,246,.28)').attr('stroke-width',1);
    g.append('rect').attr('x',PX+PW+2).attr('y',PY).attr('width',DK-4).attr('height',PH).attr('rx',9)
      .attr('fill','url(#_s6dR)').attr('stroke','rgba(239,68,68,.28)').attr('stroke-width',1);
    // Water
    g.append('rect').attr('x',PX).attr('y',PY).attr('width',PW).attr('height',PH).attr('rx',14)
      .attr('fill','url(#_s6wg)');
    // Animated waves
    const wc=g.append('g').attr('clip-path','url(#_s6cp)');
    [[4,2.2,8,.07,'wA'],[3,3.5,14,.06,'wB'],[5,1.8,6,.05,'wC']].forEach(([amp,freq,vert,op,cls])=>{
      const pts=[];
      for(let x=-40;x<=PW+40;x+=6){
        const y=vert+Math.sin((x/PW)*Math.PI*2*freq)*amp;
        pts.push(x===-40?`M ${PX+x} ${PY+y}`:`L ${PX+x} ${PY+y}`);
      }
      pts.push(`L ${PX+PW+40} ${PY+PH} L ${PX-40} ${PY+PH} Z`);
      wc.append('path').attr('class',cls).attr('d',pts.join(' ')).attr('fill',`rgba(100,210,255,${op})`);
    });
    // Lane ropes — white dashed lines (distinct from medal dots)
    for(let j=0;j<=NL;j++){
      const ry=PY+j*LH;
      g.append('line')
        .attr('x1',PX+2).attr('x2',PX+PW-2)
        .attr('y1',ry).attr('y2',ry)
        .attr('stroke','rgba(255,255,255,0.55)')
        .attr('stroke-width',1.5)
        .attr('stroke-dasharray','7,5');
    }
    // Centre divider
    g.append('line').attr('x1',MID).attr('x2',MID).attr('y1',PY).attr('y2',PY+PH)
      .attr('stroke','rgba(255,255,255,.34)').attr('stroke-width',2.5).attr('stroke-dasharray','9,6');
    g.append('rect').attr('x',MID-19).attr('y',PY+PH/2-10).attr('width',38).attr('height',20).attr('rx',10)
      .attr('fill','#080f20').attr('stroke','rgba(255,255,255,.13)').attr('stroke-width',1);
    g.append('text').attr('x',MID).attr('y',PY+PH/2+5).attr('text-anchor','middle')
      .attr('fill','rgba(255,255,255,.38)').attr('font-size',9).attr('font-weight',800).attr('letter-spacing','2px').text('MID');
    // Lane number tabs
    [[4,'#0f2540','rgba(59,130,246,.38)','#93c5fd'],[PX+PW+2,'#250f0f','rgba(239,68,68,.38)','#fca5a5']].forEach(([bx,bg,bc,tc])=>{
      d3.range(NL).forEach(i=>{
        const cy=PY+i*LH+LH/2;
        g.append('rect').attr('x',bx).attr('y',cy-9).attr('width',DK-8).attr('height',18).attr('rx',9)
          .attr('fill',bg).attr('stroke',bc).attr('stroke-width',1);
        g.append('text').attr('x',bx+(DK-8)/2).attr('y',cy+5).attr('text-anchor','middle')
          .attr('fill',tc).attr('font-weight',800).attr('font-size',11).text(String(i+1));
      });
    });
    // USA header — flag then label
    const ufw=30,ufh=18;
    const ufg=g.append('g').attr('transform',`translate(4,${PY-40})`).attr('opacity',.95);
    ufg.append('rect').attr('width',ufw).attr('height',ufh).attr('rx',3).attr('fill','#fff').attr('stroke','rgba(0,0,0,.3)');
    for(let i=0;i<6;i++) ufg.append('rect').attr('x',0).attr('y',i*ufh/6).attr('width',ufw).attr('height',ufh/12).attr('fill','#b22234').attr('opacity',.9);
    ufg.append('rect').attr('x',0).attr('y',0).attr('width',ufw*.45).attr('height',ufh*.55).attr('fill','#3c3b6e');
    d3.range(4).flatMap(ix=>d3.range(3).map(iy=>({ix,iy}))).forEach(({ix,iy})=>
      ufg.append('circle').attr('cx',3.5+ix*4.5).attr('cy',3.2+iy*4.2).attr('r',.8).attr('fill','#fff').attr('opacity',.9));
    g.append('text').attr('x',4+ufw+7).attr('y',PY-25).attr('dominant-baseline','middle')
      .attr('fill','#60a5fa').attr('font-size',13).attr('font-weight',800).text('USA  ▶');
    g.append('text').attr('x',6).attr('y',PY-8)
      .attr('fill','rgba(148,163,184,.45)').attr('font-size',10).attr('letter-spacing','2px').text('LEFT START');
    // CHN header — label then flag
    const cfw=30,cfh=18,cfx=W-4-cfw;
    const cfg=g.append('g').attr('transform',`translate(${cfx},${PY-40})`).attr('opacity',.95);
    cfg.append('rect').attr('width',cfw).attr('height',cfh).attr('rx',3).attr('fill','#de2910').attr('stroke','rgba(0,0,0,.3)');
    cfg.append('polygon').attr('points',star(7.5,6.2,4.1,1.7,5)).attr('fill','#ffde00');
    [{x:13.5,y:3,r:1.4},{x:15.5,y:5.2,r:1.4},{x:15,y:7.8,r:1.4},{x:13,y:9.8,r:1.4}]
      .forEach(s=>cfg.append('polygon').attr('points',star(s.x,s.y,s.r,s.r*.45,5)).attr('fill','#ffde00').attr('opacity',.95));
    g.append('text').attr('x',cfx-7).attr('y',PY-25).attr('text-anchor','end').attr('dominant-baseline','middle')
      .attr('fill','#f87171').attr('font-size',13).attr('font-weight',800).text('◀  CHN');
    g.append('text').attr('x',W-6).attr('y',PY-8).attr('text-anchor','end')
      .attr('fill','rgba(148,163,184,.45)').attr('font-size',10).attr('letter-spacing','2px').text('RIGHT START');
    // Medal legend
    const leg=g.append('g').attr('transform',`translate(${MID-72},${PY-38})`);
    leg.append('rect').attr('x',-8).attr('y',-8).attr('width',152).attr('height',25).attr('rx',8)
      .attr('fill','rgba(8,16,36,.8)').attr('stroke','rgba(255,255,255,.07)').attr('stroke-width',1);
    [{k:'Gold',l:'Gold'},{k:'Silver',l:'Silver'},{k:'Bronze',l:'Bronze'}].forEach((it,i)=>{
      leg.append('circle').attr('cx',i*50+6).attr('cy',4.5).attr('r',5.5).attr('fill',MC[it.k]).attr('stroke','rgba(0,0,0,.5)').attr('stroke-width',1);
      leg.append('text').attr('x',i*50+14).attr('y',9).attr('fill','#7a93b8').attr('font-size',10.5).attr('font-weight',700).text(it.l);
    });
  }

  /* ═══════════════════════════════════════════════
     UPDATE POOL
     Weighted simultaneous fill — all lanes progress together.
     Center lanes (4&5) are "fastest" and fill proportionally more.
     When a lane hits cap it freezes; its future share redistributes
     to remaining active lanes, cascading outward (3&6, then 2&7, then 1&8).
     Dot size is always fixed — no shrinking ever.
  ═══════════════════════════════════════════════ */
  function updatePool(svg, cumUSA, cumCHN, yrUSA, yrCHN, L) {
    const {PX,PY,PW,MID,NL,LH} = L;
    svg.select('g._med').remove();
    const gM = svg.append('g').attr('class','_med').attr('clip-path','url(#_s6mcp)');

    const SH = LH - 4;
    const SW = SH * 3.8;
    const HALFH = SH / 2;
    const HALFW = SW / 2;

    const DOT_R  = 2.88;  // 3.2 * 0.9
    const DOT_SP = 8.0;
    const halfW  = MID - PX - 8;
    const LANE_CAP = Math.floor((halfW - SW - 10) / DOT_SP);

    // Speed weights: centre lanes swim faster (higher weight = more medals per round)
    // Indices 0-7 correspond to lanes 1-8
    const LANE_W8 = [0.75, 0.88, 1.10, 1.40, 1.40, 1.10, 0.88, 0.75];
    const W_TOTAL = LANE_W8.reduce((a,b)=>a+b, 0);

    // Weighted deficit distribution with per-lane cap.
    // Deficit algorithm: each medal goes to the active lane with greatest
    // (proportional_target - current_count). When a lane hits LANE_CAP it's
    // excluded from future placements, so its share cascades to others naturally.
    function distributeWeighted(medals) {
      const lanes  = Array.from({length: NL}, () => []);
      // Gold first → gold medals settle in the fastest (highest-weight) lanes
      const sorted = medals.slice().sort((a,b) => (RANK[a.Medal]??9) - (RANK[b.Medal]??9));

      sorted.forEach((m, idx) => {
        const placed = idx + 1; // total medals assigned so far after this one
        // Proportional targets based on full weight array
        const targets = LANE_W8.map(w => (w / W_TOTAL) * placed);

        let best = -1, bestDef = -Infinity;
        for (let l = 0; l < NL; l++) {
          if (lanes[l].length >= LANE_CAP) continue; // this lane is at the midline, skip
          const def = targets[l] - lanes[l].length;
          if (def > bestDef) { bestDef = def; best = l; }
        }
        if (best >= 0) lanes[best].push(m);
        // else all lanes full → silently drop (no shrinking)
      });
      return lanes;
    }

    const yrKey  = d => `${d.Name}|${d.Event}|${d.Medal}`;
    const usaSet = new Set(yrUSA.map(yrKey));
    const chnSet = new Set(yrCHN.map(yrKey));

    function renderSide(cumMedals, yrSet, flipX, gifFile, alwaysShowSwimmer) {
      const lanes  = cumMedals.length > 0 ? distributeWeighted(cumMedals) : Array.from({length: NL}, () => []);
      const wallX  = flipX ? PX + PW - 4 : PX + 4;
      const dir    = flipX ? -1 : 1;

      lanes.forEach((laneMedals, laneIdx) => {
        const hasAny = laneMedals.length > 0;
        if (!hasAny && !alwaysShowSwimmer) return;
        const cy       = PY + laneIdx * LH + LH / 2;
        const dotCount = laneMedals.length;
        const atCap    = dotCount >= LANE_CAP;

        // Fixed-size medal dots
        laneMedals.forEach((d, i) => {
          const dotX   = wallX + dir * (DOT_R + i * DOT_SP);
          const isCurr = yrSet.has(yrKey(d));
          gM.append('circle')
            .attr('cx', dotX).attr('cy', cy).attr('r', DOT_R)
            .attr('fill', MC[d.Medal])
            .attr('opacity', isCurr ? 1.0 : 0.72)
            .attr('stroke', 'rgba(0,0,0,.18)').attr('stroke-width', .4)
            .style('cursor', 'pointer')
            .on('mouseenter', e => TIP.show(e, {name:d.Name,event:d.Event,medal:d.Medal,noc:d.NOC}))
            .on('mousemove',  e => TIP.move(e))
            .on('mouseleave', () => TIP.hide());
          if (isCurr) {
            gM.append('circle')
              .attr('cx', dotX).attr('cy', cy).attr('r', DOT_R + 1.8)
              .attr('fill','none').attr('stroke', MC[d.Medal]).attr('stroke-width',1).attr('opacity',.65);
          }
        });

        // Swimmer at frontier — at wall (start) when no medals yet, dims when at cap
        const leadX   = wallX + dir * (DOT_R + dotCount * DOT_SP + HALFW + 4);
        const startX  = wallX + dir * HALFW;  // right at the wall when 0 medals
        const rawX    = hasAny ? leadX : startX;
        const clamped = flipX
          ? Math.max(MID + HALFW + 2, rawX)
          : Math.min(MID - HALFW - 2, rawX);
        gM.append('g').attr('opacity', atCap ? 0.45 : 1)
          .attr('transform', `translate(${clamped},${cy})`)
          .append('image')
            .attr('href', gifFile + '?t=' + Date.now())
            .attr('x', -HALFW).attr('y', -HALFH)
            .attr('width', SW).attr('height', SH)
            .attr('preserveAspectRatio','xMidYMid meet');
      });
    }

    renderSide(cumUSA, usaSet, false, 'image/swimmer_USA_.gif', false);
    renderSide(cumCHN, chnSet, true,  'image/swimmer_CHN_.gif', true);
  }

  /* ═══════════════════════════════════════════════
     MAIN ENTRY
  ═══════════════════════════════════════════════ */
  function renderSwimmingPools(allData) {
    const cardEl  = document.getElementById('swimmingCard');
    const cardInner = cardEl && (cardEl.querySelector('.card.card-aqua') || cardEl.querySelector('.card'));
    if (!cardInner) { console.warn('swim: card not found'); return; }

    // Hide legacy elements
    ['swimUSALabel','swimCHNLabel','swimCHN','swimCompareBar'].forEach(id => {
      const el = document.getElementById(id); if (el) el.style.display = 'none';
    });

    // Pre-process rows
    const rawRows = allData.filter(d => d.Sport==='Swimming' && d.Medal!=='No medal' && (d.NOC==='USA'||d.NOC==='CHN'));
    const allRows = dedupeRelays(rawRows);
    const years   = d3.sort([...new Set(allRows.map(d=>+d.Year))]);

    // State
    let idx = years.length - 1;
    let stroke = 'all';
    let perspective = document.body.dataset.perspective || 'usa';
    let isPlaying = false;
    let timer = null;

    // ── Year slider ──
    const ctrlEl = cardInner.querySelector('.controls');
    if (ctrlEl) ctrlEl.innerHTML = `
      <span class="control-label">YEAR:</span>
      <input id="yearSlider" type="range" min="0" max="${years.length-1}" step="1" value="${idx}" style="width:240px;"/>
      <span id="swimYearLabel" class="year-badge">${years[idx]}</span>`;
    const slider  = document.getElementById('yearSlider');
    const yearLbl = document.getElementById('swimYearLabel');

    // ── Stroke pills + playback ──
    document.getElementById('_s6pills')?.remove();
    const pillRow = document.createElement('div'); pillRow.id = '_s6pills';
    pillRow.innerHTML = `
      <div class="s6-prow">
        <span class="s6-plbl">Stroke</span>
        ${STROKES.map(s=>`<button class="s6-pill${s.id==='all'?' on':''}" data-stroke="${s.id}" type="button">${s.icon} ${s.label}</button>`).join('')}
      </div>
      <div class="s6-ctrl">
        <button id="_s6play" class="s6-btn on" type="button">⏸ Pause</button>
        <button id="_s6rst"  class="s6-btn"    type="button">⟳ Restart</button>
        <label style="font-size:12px;color:#64748b;font-weight:600">Speed:
          <select id="_s6spd" class="s6-spd">
            <option value="1400">Slow</option>
            <option value="900" selected>Normal</option>
            <option value="500">Fast</option>
          </select>
        </label>
      </div>`;
    const gapEl = document.getElementById('gapText');
    if (gapEl) gapEl.insertAdjacentElement('beforebegin', pillRow);
    else ctrlEl ? ctrlEl.insertAdjacentElement('afterend', pillRow) : cardInner.prepend(pillRow);

    // ── Stat cards + stroke info ──
    document.getElementById('_s6stats')?.remove();
    const statsRow = document.createElement('div'); statsRow.id = '_s6stats'; statsRow.className = 's6-srow';
    statsRow.innerHTML = `
      <div class="s6-card u" id="_s6su">
        <div class="s6-clbl">USA IN <span id="_s6yu">—</span></div>
        <div class="s6-cum u">🇺🇸 <span id="_s6cu">0</span> cumulative</div>
        <div class="s6-tot u" id="_s6tu">0</div>
        <div class="s6-brk" id="_s6bu"></div>
      </div>
      <div class="s6-card c" id="_s6sc">
        <div class="s6-clbl">CHN IN <span id="_s6yc">—</span></div>
        <div class="s6-cum c">🇨🇳 <span id="_s6cc">0</span> cumulative</div>
        <div class="s6-tot c" id="_s6tc">0</div>
        <div class="s6-brk" id="_s6bc"></div>
      </div>
      <div class="s6-info" id="_s6info">
        <div class="s6-info-body">
          <p class="s6-info-title" id="_s6it">Olympic Swimming</p>
          <p class="s6-info-text"  id="_s6ix">—</p>
          <a class="s6-info-link"  id="_s6il" href="https://www.nbcolympics.com/news/swimming-101-four-strokes" target="_blank" rel="noopener">🔗 Swimming 101</a>
        </div>
      </div>`;
    if (gapEl) gapEl.replaceWith(statsRow);
    else pillRow.insertAdjacentElement('afterend', statsRow);

    function bHTML(mc) {
      return MEDAL_ORDER.map(m =>
        `<div class="s6-m"><span>${m}</span><span style="color:${MC[m]}">${mc[m]}</span></div>`
      ).join('');
    }

    // ── Pool SVG ──
    const hostEl = document.getElementById('swimUSA');
    hostEl.innerHTML = ''; hostEl.classList.add('s6-host');
    const DK=70, NL=8, LH=36, PAD_T=52, PAD_B=18;
    const PH=NL*LH, H=PAD_T+PH+PAD_B;
    const W=Math.max(680, Math.floor(hostEl.getBoundingClientRect().width||900));
    const PX=DK, PY=PAD_T, PW=W-DK*2, MID=PX+PW/2;
    const LAY={W,DK,NL,LH,PX,PY,PW,PH,MID};
    const svg=d3.select(hostEl).append('svg').attr('viewBox',`0 0 ${W} ${H}`).attr('width',W).attr('height',H);
    buildFrame(svg, LAY);

    // ── Master update ──
    function update() {
      const year = years[idx] ?? years[years.length-1];
      if (slider) slider.value = idx;
      if (yearLbl) yearLbl.textContent = year;

      const filtered = fStroke(allRows, stroke);
      const cumUSA = filtered.filter(d => +d.Year<=year && d.NOC==='USA');
      const cumCHN = filtered.filter(d => +d.Year<=year && d.NOC==='CHN');
      const yrUSA  = filtered.filter(d => +d.Year===year && d.NOC==='USA');
      const yrCHN  = filtered.filter(d => +d.Year===year && d.NOC==='CHN');

      updatePool(svg, cumUSA, cumCHN, yrUSA, yrCHN, LAY);

      // Stat cards
      document.getElementById('_s6yu').textContent = year;
      document.getElementById('_s6yc').textContent = year;
      document.getElementById('_s6cu').textContent = cumUSA.length;
      document.getElementById('_s6cc').textContent = cumCHN.length;
      document.getElementById('_s6tu').textContent = yrUSA.length;
      document.getElementById('_s6tc').textContent = yrCHN.length;
      document.getElementById('_s6bu').innerHTML = bHTML(mCount(yrUSA));
      document.getElementById('_s6bc').innerHTML = bHTML(mCount(yrCHN));
      document.getElementById('_s6su').classList.toggle('sp', perspective==='usa');
      document.getElementById('_s6sc').classList.toggle('sp', perspective==='china');

      // Stroke info box — text only, no images
      const def = STROKES.find(s => s.id===stroke) || STROKES[0];
      document.getElementById('_s6it').textContent  = `${def.icon} ${def.title}`;
      document.getElementById('_s6ix').textContent  = def.desc;
      const link = document.getElementById('_s6il');
      link.href = def.link;
      link.textContent = `🔗 ${def.lt}`;
    }

    // Pill clicks
    pillRow.querySelectorAll('.s6-pill').forEach(btn => btn.addEventListener('click', () => {
      stroke = btn.dataset.stroke;
      pillRow.querySelectorAll('.s6-pill').forEach(b=>b.classList.remove('on'));
      btn.classList.add('on');
      update();
    }));

    // Playback
    function startAuto() {
      if (timer) clearInterval(timer);
      const spd = parseInt(document.getElementById('_s6spd')?.value||900,10);
      timer = setInterval(()=>{ idx=(idx+1)%years.length; TIP.hide(); update(); }, spd);
      isPlaying = true;
      const btn = document.getElementById('_s6play');
      if (btn) { btn.textContent='⏸ Pause'; btn.classList.add('on'); }
    }
    function stopAuto() {
      if (timer) clearInterval(timer); timer=null; isPlaying=false;
      const btn = document.getElementById('_s6play');
      if (btn) { btn.textContent='▶ Play loop'; btn.classList.remove('on'); }
    }
    document.getElementById('_s6play')?.addEventListener('click', ()=>isPlaying?stopAuto():startAuto());
    document.getElementById('_s6rst')?.addEventListener('click',  ()=>{ idx=0; update(); if(isPlaying){stopAuto();startAuto();} });
    document.getElementById('_s6spd')?.addEventListener('change', ()=>{ if(isPlaying){stopAuto();startAuto();} });
    if (slider) slider.oninput = ()=>{ idx=parseInt(slider.value,10); TIP.hide(); update(); };

    // Perspective listener
    window.addEventListener('perspectiveChange', e=>{
      perspective = e.detail?.perspective || 'usa';
      update();
      // Re-render Paris to ensure CSS perspective classes apply cleanly
      renderParis(false);
    });

    update();
    startAuto();
    setupParisFinals();
  }

  /* ═══════════════════════════════════════════════
     ATHLETE POPUP
  ═══════════════════════════════════════════════ */
  const ATHLETE_URLS = {
    'Jiayu Xu':    'https://www.olympics.com/en/athletes/jiayu-xu',
    'Ryan Murphy': 'https://www.olympics.com/en/athletes/ryan-murphy',
    'Haiyang Qin': 'https://www.olympics.com/en/athletes/haiyang-qin',
    'Nic Fink':    'https://www.olympics.com/en/athletes/nic-fink',
    'Zhanle Pan':  'https://www.olympics.com/en/athletes/zhanle-pan',
    'Jack Alexy':  'https://www.olympics.com/en/athletes/jack-alexy',
    'Yufei Zhang': 'https://www.olympics.com/en/athletes/yufei-zhang',
    'Torri Huske': 'https://www.olympics.com/en/athletes/torri-huske',
  };

  const ATIP = (() => {
    let el = null, hideTimer = null;
    function ensure() {
      if (el) return el;
      el = document.createElement('div'); el.id = '_s6atip';
      el.innerHTML = `<div class="at-box"><div class="at-name" id="_s6aname"></div><a class="at-link" id="_s6alink" href="#" target="_blank" rel="noopener">🔗 View Profile</a></div><div class="at-arr"></div>`;
      document.body.appendChild(el);
      // Keep popup visible when cursor moves onto it
      el.addEventListener('mouseenter', () => { if(hideTimer){clearTimeout(hideTimer);hideTimer=null;} });
      el.addEventListener('mouseleave', () => scheduleHide());
      return el;
    }
    function scheduleHide() {
      if (hideTimer) clearTimeout(hideTimer);
      hideTimer = setTimeout(() => { el?.classList.remove('on'); hideTimer=null; }, 120);
    }
    function pos(e) {
      const t = ensure(), tw = t.offsetWidth || 170, th = t.offsetHeight || 80;
      let x = e.clientX - tw / 2, y = e.clientY - th - 14;
      x = Math.max(6, Math.min(x, innerWidth - tw - 6));
      if (y < 6) y = e.clientY + 18;
      t.style.left = x + 'px'; t.style.top = y + 'px';
    }
    function show(e, name) {
      if (hideTimer) { clearTimeout(hideTimer); hideTimer=null; }
      const t = ensure();
      document.getElementById('_s6aname').textContent = name;
      document.getElementById('_s6alink').href = ATHLETE_URLS[name] || '#';
      pos(e); t.classList.add('on');
    }
    function move(e) { if (el?.classList.contains('on')) pos(e); }
    function hide() { scheduleHide(); }
    return { show, move, hide };
  })();

  /* ═══════════════════════════════════════════════
     PARIS 2024 FINALS
  ═══════════════════════════════════════════════ */
  const pt = v => { const t=String(v??'').trim(); if(!t)return NaN; if(!t.includes(':'))return+t; const[a,b]=t.split(':'); return+a*60+(+b); };
  const ft = v => isFinite(v)?v.toFixed(2):'—';

  const PARIS=[
    {event:"Men's 100m Backstroke",   swimmers:[{noc:'CHN',name:'Jiayu Xu',rawTime:'52.32'},{noc:'USA',name:'Ryan Murphy',rawTime:'52.39'}]},
    {event:"Men's 100m Breaststroke", swimmers:[{noc:'USA',name:'Nic Fink',rawTime:'59.05'},{noc:'CHN',name:'Haiyang Qin',rawTime:'59.50'}]},
    {event:"Men's 100m Freestyle",    swimmers:[{noc:'CHN',name:'Zhanle Pan',rawTime:'46.40'},{noc:'USA',name:'Jack Alexy',rawTime:'47.96'}]},
    {event:"Women's 100m Butterfly",  swimmers:[{noc:'USA',name:'Torri Huske',rawTime:'55.59'},{noc:'CHN',name:'Yufei Zhang',rawTime:'56.21'}]},
  ].map(m=>({...m,swimmers:m.swimmers.map(s=>({...s,time:pt(s.rawTime),timeLabel:ft(pt(s.rawTime))}))}));

  const finalResult = m=>{ const o=m.swimmers.slice().sort((a,b)=>a.time-b.time); return{winner:o[0],loser:o[1],gap:Math.max(0,(o[1]?.time??0)-(o[0]?.time??0))}; };
  const gapTag = g=>g<=0.1?'Photo finish':g<=0.5?'Tight finish':'Clear lead';

  function setupParisFinals() {
    const host=document.getElementById('parisFinalsHeadToHead'); if(!host)return;
    const ctrl=document.getElementById('parisFinalsControls');
    if(ctrl){
      ctrl.className='s6-ftb'; ctrl.innerHTML='';
      const lbl = document.createElement('span');
      lbl.style.cssText = 'font-size:12px;color:rgba(148,163,184,.6);font-weight:600;letter-spacing:.05em;';
      lbl.textContent = 'Press ▶ Play on each card to animate individually';
      ctrl.appendChild(lbl);
    }
    renderParis(false);
  }

  function _unused_setupParisFinals_backup() {
    const host=document.getElementById('parisFinalsHeadToHead'); if(!host)return;
    const ctrl=document.getElementById('parisFinalsControls');
    if(ctrl){
      ctrl.className='s6-ftb'; ctrl.innerHTML='';
      const subtitleEl = ctrl.closest('section,div')?.querySelector('p,small,.subtitle');
      if (subtitleEl && subtitleEl.textContent.includes('touched first')) {
        subtitleEl.textContent = 'Here are some highlights of the competitive matches between the USA and China.';
      }
      const btn=document.createElement('button'); btn.type='button';
      btn.className='s6-fplay'; btn.textContent='Play races';
      btn.addEventListener('click',()=>renderParis(true)); ctrl.appendChild(btn);
    }
    // Also patch any subtitle near the section
    document.querySelectorAll('p,small').forEach(el => {
      if (el.textContent.includes('These direct USA') || el.textContent.includes('Lower time wins')) {
        el.textContent = 'Here are some highlights of the competitive matches between the USA and China.';
      }
    });
    renderParis(false);
  }

  function renderParis(animate) {
    const host=document.getElementById('parisFinalsHeadToHead'); if(!host)return;
    host.innerHTML='';
    const grid=document.createElement('div'); grid.className='s6-fg'; host.appendChild(grid);
    const maxG=d3.max(PARIS,m=>finalResult(m).gap)||1;
    PARIS.forEach(match=>{
      const res=finalResult(match), byN=new Map(match.swimmers.map(s=>[s.noc,s]));
      const order=['CHN','USA'].filter(n=>byN.has(n));
      const card=document.createElement('article'); card.className='s6-fc';

      // ── Header row (kicker + gap + individual play btn) ──
      const topDiv=document.createElement('div'); topDiv.className='s6-ftop';
      topDiv.innerHTML=`<span class="s6-fkicker">Paris 2024 final</span><span class="s6-fgap">${gapTag(res.gap)}</span>`;
      const playBtn=document.createElement('button'); playBtn.type='button';
      playBtn.className='s6-fplay'; playBtn.textContent='▶ Play';
      playBtn.style.cssText='margin-left:auto;font-size:11px;padding:5px 12px;';
      topDiv.appendChild(playBtn);
      card.appendChild(topDiv);

      // ── Event title + copy ──
      const evtH=document.createElement('h4'); evtH.className='s6-fevt'; evtH.textContent=match.event; card.appendChild(evtH);
      const copyP=document.createElement('p'); copyP.className='s6-fcopy';
      copyP.innerHTML=`<b>${res.winner.name}</b> (${res.winner.noc}) touched first by ${res.gap.toFixed(2)}s.`; card.appendChild(copyP);

      // ── Race stage ──
      const stageDiv=document.createElement('div'); stageDiv.className='s6-fstage'; card.appendChild(stageDiv);

      // ── Athlete time rows ──
      const timesDiv=document.createElement('div'); timesDiv.className='s6-ftimes';
      order.forEach(noc=>{
        const s=byN.get(noc),isW=s.noc===res.winner.noc;
        const ps=noc==='USA'?'background:rgba(59,130,246,.17);color:#bfdbfe':'background:rgba(239,68,68,.17);color:#fecaca';
        const row=document.createElement('div'); row.className='s6-frow'+(isW?' w':'');
        row.innerHTML=`<span class="s6-fnoc" style="${ps}">${noc}</span><span class="s6-fname s6-athlete" style="cursor:pointer;text-decoration:underline dotted;text-underline-offset:3px" data-name="${s.name}">${s.name}</span><span class="s6-ftime">${s.timeLabel}</span>`;
        timesDiv.appendChild(row);
        const nameEl=row.querySelector('.s6-athlete');
        nameEl.addEventListener('mouseenter',e=>ATIP.show(e,s.name));
        nameEl.addEventListener('mousemove',e=>ATIP.move(e));
        nameEl.addEventListener('mouseleave',()=>ATIP.hide());
      });
      card.appendChild(timesDiv);

      // ── Per-card play/replay button logic ──
      playBtn.addEventListener('click',()=>{
        stageDiv.innerHTML='';
        drawH2H(stageDiv,match,maxG,true);
        playBtn.textContent='↺ Replay';
      });

      grid.appendChild(card);
      drawH2H(stageDiv,match,maxG,animate);
    });
  }

  function drawH2H(container,match,maxG,animate){
    if(!container)return;
    const res=finalResult(match); if(!res.winner||!res.loser)return;
    const byN=new Map(match.swimmers.map(s=>[s.noc,s]));
    const lns=['CHN','USA'].filter(n=>byN.has(n));
    const W2=430,H2=148,pX=88,pY=18,pW=W2-pX-14,pH=82,lH=pH/Math.max(2,lns.length);
    const fX=pX+pW-22,sX=pX+22;
    const gS=d3.scaleLinear().domain([0,Math.max(maxG,.05)]).range([0,pW*.42]);
    const dS=d3.scaleLinear().domain([0,Math.max(maxG,.05)]).range([0,700]);
    const fByN=new Map([[res.winner.noc,fX],[res.loser.noc,fX-gS(res.gap)]]);
    const svg=d3.select(container).append('svg').attr('viewBox',`0 0 ${W2} ${H2}`);
    const defs=svg.append('defs');
    const gid=`_s6h_${match.event.replace(/\W+/g,'_')}`;
    const gr=defs.append('linearGradient').attr('id',gid).attr('x1','0%').attr('y1','0%').attr('x2','100%').attr('y2','100%');
    gr.append('stop').attr('offset','0%').attr('stop-color','#0f4977');
    gr.append('stop').attr('offset','100%').attr('stop-color','#0b7fb1');
    svg.append('rect').attr('x',pX).attr('y',pY).attr('width',pW).attr('height',pH).attr('rx',18).attr('fill',`url(#${gid})`).attr('stroke','rgba(125,211,252,.5)').attr('stroke-width',2);
    lns.forEach((noc,i)=>{
      const s=byN.get(noc),y=pY+lH*(i+.5),color=noc==='USA'?'#60a5fa':'#f87171';
      const mX=fByN.get(noc)??sX,isW=noc===res.winner.noc;
      const dur=1650+dS(Math.max(0,s.time-res.winner.time));
      svg.append('rect').attr('x',pX+4).attr('y',pY+lH*i+2).attr('width',pW-8).attr('height',lH-4).attr('rx',12).attr('fill','rgba(255,255,255,.09)');
      svg.append('line').attr('x1',pX+8).attr('x2',pX+pW-8).attr('y1',y).attr('y2',y).attr('stroke','rgba(255,255,255,.38)').attr('stroke-width',1.2).attr('stroke-dasharray','6,6');
      svg.append('rect').attr('x',10).attr('y',y-10).attr('width',57).attr('height',21).attr('rx',10).attr('fill',color).attr('opacity',.15);
      svg.append('text').attr('x',38).attr('y',y+4).attr('text-anchor','middle').attr('font-size',11).attr('font-weight',800).attr('fill',color).text(noc);
      const sw=lH-8;
      const gSw=svg.append('g').attr('transform',animate?`translate(${sX},${y})`:`translate(${mX},${y})`);
      const raceSH = lH - 6, raceSW = raceSH * 3.8;
      gSw.append('image')
        .attr('href', (noc === 'USA' ? 'image/swimmer_USA_.gif' : 'image/swimmer_CHN_.gif') + '?t=' + Date.now())
        .attr('x', -raceSW/2).attr('y', -raceSH/2)
        .attr('width', raceSW).attr('height', raceSH)
        .attr('preserveAspectRatio','xMidYMid meet')
        .attr('transform', noc !== 'USA' ? 'scale(-1, 1)' : null);
      gSw.append('text').attr('x',mX>fX-36?-raceSW/2-4:raceSW/2+4).attr('y',-raceSH/2-2).attr('text-anchor',mX>fX-36?'end':'start').attr('font-size',11).attr('font-weight',800).attr('fill','#e2e8f0').text(s.timeLabel);
      if(animate) gSw.transition().delay(i*160).duration(dur).ease(d3.easeCubicInOut)
        .attrTween('transform',()=>{const ix=d3.interpolateNumber(sX,mX); return t=>`translate(${ix(t)},${y+Math.sin(t*Math.PI*5)*1.6})`;});
    });
    svg.append('text').attr('x',pX+4).attr('y',pY-6).attr('font-size',10).attr('font-weight',800).attr('letter-spacing','1.5px').attr('fill','#7a93b8').text('START');
    svg.append('text').attr('x',fX).attr('y',pY-6).attr('text-anchor','end').attr('font-size',10).attr('font-weight',800).attr('letter-spacing','1.5px').attr('fill','#7a93b8').text('FINISH');
    d3.range(5).forEach(i=>svg.append('rect').attr('x',fX+4+i*4).attr('y',pY+4).attr('width',2).attr('height',pH-8).attr('fill',i%2===0?'rgba(226,232,240,.8)':'rgba(15,23,42,.92)'));
    const lX=fByN.get(res.loser.noc)??fX,wX=fByN.get(res.winner.noc)??fX,gY=pY+pH+14;
    svg.append('line').attr('x1',lX).attr('x2',wX).attr('y1',gY).attr('y2',gY).attr('stroke','rgba(226,232,240,.55)').attr('stroke-width',1.5);
    [[lX],[wX]].forEach(([px])=>svg.append('line').attr('x1',px).attr('x2',px).attr('y1',gY-5).attr('y2',gY+5).attr('stroke','rgba(226,232,240,.55)').attr('stroke-width',1.5));
    svg.append('text').attr('x',(lX+wX)/2).attr('y',gY-7).attr('text-anchor','middle').attr('font-size',11).attr('font-weight',800).attr('fill','#e2e8f0').text(`${res.gap.toFixed(2)}s gap`);
  }

  window.renderSwimmingPools = renderSwimmingPools;

})();
