/* viz5_forgottenSports.js
 * Forgotten Summer Olympic Sports
 * Layout: full-width card (like viz4). On hover, a second illustration
 * card slides in alongside it — two cards side by side.
 */
(function () {

  /* ═══════════════════════════════════
     SPORT DATA
  ═══════════════════════════════════ */
  const SPORTS = [
    {
      title: 'Tug of War', years: '1900 – 1920', emoji: '🪢',
      accent: '#c084fc', accentDim: 'rgba(192,132,252,.18)',
      bg: 'linear-gradient(155deg,#12052a 0%,#1e0845 55%,#2a0d5e 100%)',
      illBg: 'linear-gradient(155deg,#0d0320 0%,#180840 100%)',
      fact: 'Contested at every Olympiad from 1900 to 1920, tug of war pitted teams of 6–8 pulling a rope until it moved 6 feet — or 5 minutes elapsed. Great Britain dominated with 5 total medals. In 1904, the USA swept all three medals; in 1908, three British teams filled the entire podium.',
      detail: 'Teams represented clubs, not nations — meaning one country could win multiple medals in a single Games. The City of London Police team won gold at London 1908.',
      highlight: 'Great Britain: 5 medals (2G 2S 1B)', lastSeen: 'Antwerp 1920',
      whyGone: 'The IOC streamlined the programme after 1920 — tug of war and several other sports were removed to manage the growing number of events and participants.',
      wikiUrl: 'https://en.wikipedia.org/wiki/Tug_of_war_at_the_Summer_Olympics',
      illTitle: 'Olympic Tug of War — Stockholm 1912',
      illCaption: 'Two national teams battle on the competition field',
      illSvg: `<svg viewBox="0 0 420 280" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="tg_sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#0a021e"/><stop offset="100%" stop-color="#1a0640"/></linearGradient>
          <linearGradient id="tg_gr" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#1e4a10"/><stop offset="100%" stop-color="#0d2808"/></linearGradient>
        </defs>
        <!-- BG sky -->
        <rect width="420" height="280" fill="url(#tg_sky)"/>
        <!-- Header band -->
        <rect width="420" height="32" fill="rgba(0,0,0,.45)"/>
        <text x="210" y="14" text-anchor="middle" fill="#c084fc" font-size="11" font-weight="700" font-family="sans-serif" letter-spacing="1.5">STOCKHOLM OLYMPICS 1912</text>
        <text x="210" y="27" text-anchor="middle" fill="rgba(192,132,252,.5)" font-size="9" font-family="sans-serif">Olympic Tug of War · 8 members per team</text>
        <!-- crowd silhouettes far back -->
        ${Array.from({length:26},(_,i)=>`<ellipse cx="${8+i*16}" cy="68" rx="6" ry="${10+Math.sin(i*0.9)*3}" fill="rgba(80,40,160,.22)"/>`).join('')}
        <!-- ground -->
        <rect x="0" y="170" width="420" height="110" fill="url(#tg_gr)"/>
        <line x1="0" y1="170" x2="420" y2="170" stroke="#3a6a20" stroke-width="2.5"/>
        ${[180,192,206].map(y=>`<line x1="0" y1="${y}" x2="420" y2="${y}" stroke="rgba(40,80,20,.5)" stroke-width="1"/>`).join('')}
        <!-- rope across full width -->
        <path d="M18 152 Q210 147 402 152" fill="none" stroke="#d4aa30" stroke-width="8" stroke-linecap="round"/>
        <path d="M18 152 Q210 147 402 152" fill="none" stroke="#f5e080" stroke-width="2.5" stroke-dasharray="9,14" opacity=".7"/>
        <!-- center marker pole + flag -->
        <rect x="208" y="124" width="5" height="36" fill="#e8e0c0" rx="1"/>
        <polygon points="213,124 230,131 213,138" fill="#e62020"/>
        <text x="213" y="120" fill="rgba(255,200,100,.5)" font-size="7" font-family="sans-serif">MIDLINE</text>
        <!-- GBR team (left, blue kits) — 8 figures -->
        ${[30,52,74,96,118,140,162,184].map((x,i)=>`<g transform="translate(${x},152)">
          <circle cy="-26" r="9" fill="${i%2===0?'#e8c090':'#d4a870'}"/>
          <rect x="-6" y="-17" width="12" height="18" rx="2" fill="#1a3080"/>
          <line x1="-6" y1="-12" x2="-16" y2="-4" stroke="#e8c090" stroke-width="3" stroke-linecap="round"/>
          <line x1="-3" y1="1" x2="-4" y2="18" stroke="#c8a060" stroke-width="3.5" stroke-linecap="round"/>
          <line x1="3" y1="1" x2="4" y2="18" stroke="#c8a060" stroke-width="3.5" stroke-linecap="round"/>
        </g>`).join('')}
        <!-- GBR label -->
        <rect x="6" y="172" width="32" height="14" rx="4" fill="rgba(26,48,128,.7)"/>
        <text x="22" y="183" text-anchor="middle" fill="#93c5fd" font-size="8" font-weight="700" font-family="sans-serif">GBR</text>
        <!-- USA team (right, red kits) — 8 figures -->
        ${[236,258,280,302,324,346,368,390].map((x,i)=>`<g transform="translate(${x},152)">
          <circle cy="-26" r="9" fill="${i%2===0?'#f0cca0':'#e0b888'}"/>
          <rect x="-6" y="-17" width="12" height="18" rx="2" fill="#8a1818"/>
          <line x1="6" y1="-12" x2="16" y2="-4" stroke="#f0cca0" stroke-width="3" stroke-linecap="round"/>
          <line x1="-3" y1="1" x2="-4" y2="18" stroke="#c8a060" stroke-width="3.5" stroke-linecap="round"/>
          <line x1="3" y1="1" x2="4" y2="18" stroke="#c8a060" stroke-width="3.5" stroke-linecap="round"/>
        </g>`).join('')}
        <!-- USA label -->
        <rect x="382" y="172" width="32" height="14" rx="4" fill="rgba(138,24,24,.7)"/>
        <text x="398" y="183" text-anchor="middle" fill="#fca5a5" font-size="8" font-weight="700" font-family="sans-serif">USA</text>
        <!-- Bottom info bar -->
        <rect x="0" y="248" width="420" height="32" fill="rgba(0,0,0,.55)"/>
        <text x="14" y="261" fill="#c084fc" font-size="9" font-weight="700" font-family="sans-serif">🏆 Great Britain: 2 Gold · 2 Silver · 1 Bronze</text>
        <text x="14" y="274" fill="rgba(192,132,252,.5)" font-size="8" font-family="sans-serif">Source: Wikipedia · Tug of war at the Summer Olympics</text>
      </svg>`,
    },
    {
      title: 'Art Competitions', years: '1912 – 1948', emoji: '🎨',
      accent: '#fbbf24', accentDim: 'rgba(251,191,36,.18)',
      bg: 'linear-gradient(155deg,#1a0800 0%,#301200 55%,#3d1a00 100%)',
      illBg: 'linear-gradient(155deg,#150600 0%,#281000 100%)',
      fact: 'Pierre de Coubertin believed art was inseparable from athletics. Medals were awarded for works inspired by sport across five categories: architecture, literature, music, painting, and sculpture — initially dubbed the "Pentathlon of the Muses."',
      detail: 'Exactly 147 medals were awarded across seven Games (1912–1948). IOC founder Coubertin himself secretly entered in 1912 under a pseudonym — and won gold in literature.',
      highlight: '147 medals across 7 Games', lastSeen: 'London 1948',
      whyGone: 'A 1949 IOC ruling found that most entrants were professional artists, contradicting the amateur-only rule. Art exhibitions replaced competitions from 1956 onward.',
      wikiUrl: 'https://en.wikipedia.org/wiki/Art_competitions_at_the_Summer_Olympics',
      illTitle: 'Olympic Art Competition — Berlin 1936',
      illCaption: 'Judging panel evaluates sport-themed paintings and sculptures',
      illSvg: `<svg viewBox="0 0 420 280" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="art_bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#150600"/><stop offset="100%" stop-color="#2a1200"/></linearGradient>
          <linearGradient id="art_wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#1e0e04"/><stop offset="100%" stop-color="#140800"/></linearGradient>
          <linearGradient id="art_frame" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#c8881a"/><stop offset="100%" stop-color="#8b5e10"/></linearGradient>
        </defs>
        <rect width="420" height="280" fill="url(#art_bg)"/>
        <!-- Header band -->
        <rect width="420" height="32" fill="rgba(0,0,0,.5)"/>
        <text x="210" y="14" text-anchor="middle" fill="#fbbf24" font-size="11" font-weight="700" font-family="sans-serif" letter-spacing="1.5">OLYMPIC ART COMPETITION · 1912–1948</text>
        <text x="210" y="27" text-anchor="middle" fill="rgba(251,191,36,.5)" font-size="9" font-family="sans-serif">Architecture · Painting · Sculpture · Music · Literature</text>
        <!-- Gallery wall -->
        <rect x="0" y="32" width="420" height="188" fill="url(#art_wall)"/>
        <!-- Wainscoting rail -->
        <rect x="0" y="196" width="420" height="5" fill="#5a3a14" opacity=".8"/>
        <!-- Floor -->
        <rect x="0" y="201" width="420" height="47" fill="#0d0600"/>
        ${[0,60,120,180,240,300,360].map(x=>`<line x1="${x}" y1="201" x2="${x+30}" y2="248" stroke="#1a0c02" stroke-width="1" opacity=".35"/>`).join('')}
        <!-- CENTER painting — gold medal, Berlin 1936 -->
        <rect x="148" y="44" width="124" height="96" rx="3" fill="url(#art_frame)" stroke="#f0b030" stroke-width="3"/>
        <rect x="155" y="51" width="110" height="82" rx="1" fill="#fefaf0"/>
        <!-- Athlete figure painted inside canvas -->
        <ellipse cx="210" cy="76" rx="12" ry="14" fill="#c8946a"/>
        <line x1="210" y1="90" x2="210" y2="110" stroke="#7a3a18" stroke-width="4"/>
        <line x1="210" y1="97" x2="194" y2="90" stroke="#7a3a18" stroke-width="3"/>
        <line x1="210" y1="97" x2="230" y2="83" stroke="#7a3a18" stroke-width="3"/>
        <circle cx="234" cy="80" r="4" fill="#b8783a"/>
        <line x1="210" y1="110" x2="203" y2="124" stroke="#7a3a18" stroke-width="3"/>
        <line x1="210" y1="110" x2="217" y2="124" stroke="#7a3a18" stroke-width="3"/>
        <!-- Gold medal label on frame -->
        <rect x="170" y="142" width="80" height="14" rx="3" fill="#8b5e10"/>
        <text x="210" y="152" text-anchor="middle" fill="#ffe090" font-size="8" font-weight="700" font-family="sans-serif">GOLD · BERLIN 1936</text>
        <!-- LEFT painting (silver) -->
        <rect x="40" y="52" width="88" height="72" rx="2" fill="url(#art_frame)" stroke="#c0881a" stroke-width="2"/>
        <rect x="46" y="58" width="76" height="60" rx="1" fill="#fdf8ee"/>
        <ellipse cx="84" cy="78" rx="9" ry="11" fill="#c8946a"/>
        <line x1="84" y1="89" x2="84" y2="108" stroke="#7a3a18" stroke-width="3"/>
        <rect x="56" y="126" width="56" height="12" rx="2" fill="rgba(192,136,26,.4)"/>
        <text x="84" y="135" text-anchor="middle" fill="#ffd080" font-size="7.5" font-weight="700" font-family="sans-serif">SILVER</text>
        <!-- RIGHT painting (bronze) -->
        <rect x="292" y="52" width="88" height="72" rx="2" fill="url(#art_frame)" stroke="#c0881a" stroke-width="2"/>
        <rect x="298" y="58" width="76" height="60" rx="1" fill="#fdf8ee"/>
        <ellipse cx="336" cy="78" rx="9" ry="11" fill="#c8946a"/>
        <line x1="336" y1="89" x2="336" y2="108" stroke="#7a3a18" stroke-width="3"/>
        <rect x="308" y="126" width="56" height="12" rx="2" fill="rgba(192,136,26,.3)"/>
        <text x="336" y="135" text-anchor="middle" fill="#ffb060" font-size="7.5" font-weight="700" font-family="sans-serif">BRONZE</text>
        <!-- Judges at table (below wainscoting, on floor) -->
        ${[80,150,220,290,360].map((x,i)=>`<g transform="translate(${x},208)">
          <circle cy="0" r="8" fill="${['#e8c090','#c8986c','#d4a870','#e0b888','#c8906a'][i]}"/>
          <rect x="-7" y="7" width="14" height="15" rx="2" fill="#2a1800"/>
        </g>`).join('')}
        <!-- Judging table surface -->
        <rect x="40" y="218" width="340" height="7" rx="3" fill="#4a2c10"/>
        <!-- Score card -->
        <rect x="186" y="206" width="48" height="18" rx="3" fill="#f5c518"/>
        <text x="210" y="219" text-anchor="middle" fill="#1a0800" font-size="12" font-weight="900" font-family="sans-serif">9.8</text>
        <!-- Olympic rings with light pill so black ring shows -->
        <rect x="336" y="36" width="76" height="18" rx="5" fill="rgba(255,255,255,.14)"/>
        ${[{c:'#0085C7',dx:0,dy:0},{c:'#F4C300',dx:15,dy:5},{c:'#000000',dx:30,dy:0},{c:'#009F6B',dx:45,dy:5},{c:'#DF0024',dx:60,dy:0}].map(({c,dx,dy})=>`<circle cx="${344+dx}" cy="${44+dy}" r="7" fill="none" stroke="${c}" stroke-width="2.5"/>`).join('')}
        <!-- Bottom info bar -->
        <rect x="0" y="248" width="420" height="32" fill="rgba(0,0,0,.6)"/>
        <text x="14" y="261" fill="#fbbf24" font-size="9" font-weight="700" font-family="sans-serif">🎨 147 medals awarded · 23 nations · 7 Olympic Games</text>
        <text x="14" y="274" fill="rgba(251,191,36,.45)" font-size="8" font-family="sans-serif">Coubertin won gold in literature 1912 under a pseudonym</text>
      </svg>`,
    },
    {
      title: 'Motor Boating', years: '1908 only', emoji: '🚤',
      accent: '#38bdf8', accentDim: 'rgba(56,189,248,.18)',
      bg: 'linear-gradient(155deg,#001525 0%,#002a42 55%,#003a58 100%)',
      illBg: 'linear-gradient(155deg,#000e1a 0%,#001e35 100%)',
      fact: 'Three motorboat racing events were held on Southampton Water on 28–29 August 1908. In each event, multiple boats started but only one finished — severe gale conditions forced most competitors to retire or lose control.',
      detail: 'The winning boat in Classes B and C was the same vessel: Gyrinus, a Thornycroft-designed semi-planing hull crewed by Isaac Thomas Thornycroft. It is one of the earliest purpose-built racing hulls in history.',
      highlight: 'Only 2 nations competed (GBR & FRA)', lastSeen: 'London 1908',
      whyGone: 'After the Games, the IOC ruled that the Olympics was not intended for motorised competition.',
      wikiUrl: 'https://en.wikipedia.org/wiki/Water_motorsports_at_the_1908_Summer_Olympics',
      illTitle: 'Water Motorsports — Southampton Water, 1908',
      illCaption: 'Gyrinus wins Classes B & C in severe gale conditions',
      illSvg: `<svg viewBox="0 0 420 280" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="mb_sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#000e1a"/><stop offset="55%" stop-color="#001e35"/><stop offset="100%" stop-color="#00304e"/></linearGradient>
          <linearGradient id="mb_sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#003a58"/><stop offset="100%" stop-color="#001428"/></linearGradient>
        </defs>
        <rect width="420" height="280" fill="url(#mb_sky)"/>
        <!-- Header band -->
        <rect width="420" height="32" fill="rgba(0,0,0,.5)"/>
        <text x="210" y="14" text-anchor="middle" fill="#38bdf8" font-size="11" font-weight="700" font-family="sans-serif" letter-spacing="1.5">SOUTHAMPTON WATER · LONDON 1908</text>
        <text x="210" y="27" text-anchor="middle" fill="rgba(56,189,248,.5)" font-size="9" font-family="sans-serif">Water Motorsports · Class A · B · C · 40 nautical mile course</text>
        <!-- Stormy sky -->
        ${Array.from({length:5},(_,i)=>`<path d="M${i*90} 60 Q${i*90+45} 48 ${i*90+90} 55" fill="none" stroke="rgba(100,140,180,.15)" stroke-width="${6+i}" stroke-linecap="round"/>`).join('')}
        <!-- Coastline silhouette -->
        <path d="M0 122 Q55 110 120 115 Q180 120 250 112 Q320 105 420 118 L420 130 L0 130Z" fill="#001828" opacity=".9"/>
        <!-- Sea -->
        <rect x="0" y="128" width="420" height="120" fill="url(#mb_sea)"/>
        <!-- Storm waves -->
        ${[138,152,166,180,196,212].map((y,i)=>`<path d="M0 ${y} Q${60+i*5} ${y-10} ${120+i*8} ${y} Q${200+i*6} ${y+8} ${280+i*7} ${y} Q${350+i*4} ${y-7} 420 ${y}" fill="none" stroke="rgba(56,189,248,${0.07+i*0.018})" stroke-width="${1+i*0.25}"/>`).join('')}
        <!-- GYRINUS — lead boat, detailed -->
        <g transform="translate(195,162)">
          <!-- hull body -->
          <path d="M-85 8 L85 8 L105 20 L-90 20Z" fill="#8090a0" stroke="#a0b4c8" stroke-width="1.5"/>
          <path d="M85 8 L108 14 L105 20 L85 20Z" fill="#607080"/>
          <!-- deck -->
          <path d="M-83 8 L83 8 L83 1 L-76 1Z" fill="#90a4b8" stroke="#b0c8dc" stroke-width="1"/>
          <!-- engine housing -->
          <rect x="-38" y="-7" width="76" height="11" rx="3" fill="#506070"/>
          <!-- smokestack -->
          <rect x="8" y="-30" width="11" height="25" rx="2" fill="#3a3a3a"/>
          <ellipse cx="13" cy="-30" rx="7" ry="4" fill="#555"/>
          <!-- smoke puffs blowing left (gale!) -->
          <ellipse cx="-10" cy="-40" rx="12" ry="8" fill="#888" opacity=".45"/>
          <ellipse cx="-28" cy="-50" rx="15" ry="9" fill="#999" opacity=".3"/>
          <ellipse cx="-48" cy="-58" rx="18" ry="10" fill="#aaa" opacity=".18"/>
          <!-- GBR flag -->
          <line x1="-65" y1="1" x2="-65" y2="-22" stroke="#ccc" stroke-width="1.5"/>
          <rect x="-65" y="-22" width="18" height="12" fill="#012169"/>
          <line x1="-65" y1="-22" x2="-47" y2="-10" stroke="#fff" stroke-width="1.5"/>
          <line x1="-47" y1="-22" x2="-65" y2="-10" stroke="#fff" stroke-width="1.5"/>
          <line x1="-56" y1="-22" x2="-56" y2="-10" stroke="#fff" stroke-width="2"/>
          <line x1="-65" y1="-16" x2="-47" y2="-16" stroke="#fff" stroke-width="2"/>
          <!-- bow wave -->
          <path d="M105 16 Q130 5 144 18 Q132 26 105 22Z" fill="rgba(255,255,255,.55)"/>
          <path d="M-90 16 Q-112 8 -126 20 Q-112 28 -90 22Z" fill="rgba(255,255,255,.3)"/>
          <!-- wake -->
          <path d="M-128 26 Q-50 20 10 23 Q60 20 130 22" fill="none" stroke="rgba(255,255,255,.38)" stroke-width="2" stroke-dasharray="8,4"/>
          <!-- crew silhouettes -->
          <circle cx="-50" cy="-3" r="6" fill="#d4c090"/>
          <circle cx="-30" cy="-3" r="6" fill="#c4b080"/>
        </g>
        <!-- Boat label -->
        <rect x="76" y="186" width="88" height="13" rx="4" fill="rgba(0,30,60,.75)"/>
        <text x="120" y="195" text-anchor="middle" fill="#7dd3fc" font-size="8" font-weight="700" font-family="sans-serif">GYRINUS (GBR) · WINNER</text>
        <!-- Second smaller boat in background -->
        <g transform="translate(340,188) scale(.58)">
          <path d="M-75 8 L75 8 L90 18 L-78 18Z" fill="#506070" stroke="#708090" stroke-width="1"/>
          <path d="M-73 8 L73 8 L73 2 L-68 2Z" fill="#607888"/>
          <rect x="-28" y="-5" width="56" height="9" rx="2" fill="#405060"/>
          <circle cx="20" cy="-10" r="5" fill="#777" opacity=".5"/>
        </g>
        <!-- Storm indicator -->
        <text x="380" y="140" text-anchor="end" fill="rgba(56,189,248,.5)" font-size="9" font-weight="700" font-family="sans-serif">⛈ GALE FORCE</text>
        <!-- Bottom info bar -->
        <rect x="0" y="248" width="420" height="32" fill="rgba(0,0,0,.65)"/>
        <text x="14" y="261" fill="#38bdf8" font-size="9" font-weight="700" font-family="sans-serif">🚤 Only 1 boat finished each race · 2 nations: GBR (13 crew) · FRA (4 crew)</text>
        <text x="14" y="274" fill="rgba(56,189,248,.45)" font-size="8" font-family="sans-serif">IOC ruled: Olympics not intended for motorised competition · never held again</text>
      </svg>`,
    },
    {
      title: 'Polo', years: '1900, 1908, 1920, 1924, 1936', emoji: '🏇',
      accent: '#fca5a5', accentDim: 'rgba(252,165,165,.18)',
      bg: 'linear-gradient(155deg,#180000 0%,#2e0808 55%,#3d1010 100%)',
      illBg: 'linear-gradient(155deg,#100000 0%,#240606 100%)',
      fact: 'Polo appeared at five Games: 1900, 1908, 1920, 1924, and 1936. Great Britain led the all-time medal table with 6 total medals. Argentina won gold at both 1924 Paris and 1936 Berlin, defeating Great Britain 11–0 in the Berlin final.',
      detail: 'The sport declined due to logistical and financial difficulties — each player required multiple horses, making international competition extremely costly. The IOC recognised polo as a sport again in 1996.',
      highlight: 'Argentina defeated GBR 11–0 in 1936', lastSeen: 'Berlin 1936',
      whyGone: 'The logistical and financial burden of competing with horses made it impossible to sustain as a global Olympic sport after World War II.',
      wikiUrl: 'https://en.wikipedia.org/wiki/Polo_at_the_Summer_Olympics',
      illTitle: 'Olympic Polo — Berlin 1936 Final',
      illCaption: 'Argentina vs Great Britain — ARG won 11–0',
      illSvg: `<svg viewBox="0 0 420 280" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="polo_bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#0e0000"/><stop offset="100%" stop-color="#1e0606"/></linearGradient>
          <linearGradient id="polo_field" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#1e4a0a"/><stop offset="100%" stop-color="#0d2805"/></linearGradient>
        </defs>
        <rect width="420" height="280" fill="url(#polo_bg)"/>
        <!-- Header band -->
        <rect width="420" height="32" fill="rgba(0,0,0,.5)"/>
        <text x="210" y="14" text-anchor="middle" fill="#fca5a5" font-size="11" font-weight="700" font-family="sans-serif" letter-spacing="1.5">OLYMPIC POLO FINAL · BERLIN 1936</text>
        <text x="210" y="27" text-anchor="middle" fill="rgba(252,165,165,.5)" font-size="9" font-family="sans-serif">Argentina vs Great Britain · Played at Maifeld, Berlin</text>
        <!-- Crowd silhouettes -->
        ${Array.from({length:38},(_,i)=>`<ellipse cx="${5+i*11}" cy="47" rx="5" ry="${9+Math.sin(i*0.7)*2}" fill="rgba(140,40,40,.22)"/>`).join('')}
        <rect x="0" y="52" width="420" height="4" fill="#3a1010" opacity=".5"/>
        <!-- Field -->
        <rect x="0" y="56" width="420" height="160" fill="url(#polo_field)"/>
        <!-- Field lines -->
        <line x1="0" y1="56" x2="420" y2="56" stroke="#3a7a20" stroke-width="2"/>
        ${[100,160,216].map(y=>`<line x1="20" y1="${y}" x2="400" y2="${y}" stroke="rgba(30,70,15,.5)" stroke-width="1"/>`).join('')}
        <line x1="210" y1="56" x2="210" y2="216" stroke="#2a5a18" stroke-width="1.5" stroke-dasharray="10,8" opacity=".45"/>
        <!-- Goal posts far end -->
        <line x1="185" y1="56" x2="185" y2="82" stroke="#ddd8b8" stroke-width="3"/>
        <line x1="235" y1="56" x2="235" y2="82" stroke="#ddd8b8" stroke-width="3"/>
        <line x1="187" y1="82" x2="233" y2="82" stroke="#ddd8b8" stroke-width="1.5" opacity=".6"/>
        <!-- ARGENTINA HORSE (large, center-right) -->
        <g transform="translate(248,155)">
          <ellipse cx="0" cy="0" rx="52" ry="22" fill="#6b3e20"/>
          <ellipse cx="46" cy="-7" rx="20" ry="13" fill="#6b3e20"/>
          <ellipse cx="59" cy="-13" rx="8" ry="10" fill="#5a3010"/>
          <path d="M55 -23 L60 -31 L66 -23Z" fill="#5a3010"/>
          <circle cx="63" cy="-15" r="2" fill="#1a0800"/>
          <line x1="-28" y1="20" x2="-36" y2="44" stroke="#5a3010" stroke-width="6" stroke-linecap="round"/>
          <line x1="-10" y1="21" x2="-6" y2="46" stroke="#5a3010" stroke-width="6" stroke-linecap="round"/>
          <line x1="16" y1="21" x2="24" y2="44" stroke="#5a3010" stroke-width="6" stroke-linecap="round"/>
          <line x1="32" y1="20" x2="46" y2="42" stroke="#5a3010" stroke-width="6" stroke-linecap="round"/>
          <path d="M-52 -3 Q-72 -14 -67 -27 Q-58 -35 -54 -20" fill="none" stroke="#5a3010" stroke-width="4" stroke-linecap="round"/>
          <ellipse cx="-10" cy="-17" rx="18" ry="9" fill="#3a2810" opacity=".85"/>
          <!-- Rider -->
          <circle cx="-8" cy="-41" r="11" fill="#e8c090"/>
          <rect x="-16" y="-31" width="14" height="18" rx="3" fill="#74acdf"/>
          <line x1="-1" y1="-26" x2="18" y2="-16" stroke="#e8c090" stroke-width="4" stroke-linecap="round"/>
          <line x1="18" y1="-16" x2="46" y2="10" stroke="#c8a060" stroke-width="3"/>
          <rect x="38" y="6" width="15" height="6" rx="2" fill="#8b5e3c"/>
          <ellipse cx="-8" cy="-50" rx="11" ry="6" fill="#74acdf"/>
        </g>
        <!-- ARG label -->
        <rect x="280" y="202" width="36" height="14" rx="4" fill="rgba(116,172,223,.25)"/>
        <text x="298" y="212" text-anchor="middle" fill="#74acdf" font-size="8" font-weight="700" font-family="sans-serif">ARG</text>
        <!-- GBR HORSE (left, smaller) -->
        <g transform="translate(110,168) scale(.7)">
          <ellipse cx="0" cy="0" rx="50" ry="21" fill="#8b6040"/>
          <ellipse cx="44" cy="-7" rx="19" ry="12" fill="#8b6040"/>
          <ellipse cx="57" cy="-12" rx="8" ry="9" fill="#7a4e2e"/>
          <line x1="-26" y1="19" x2="-34" y2="42" stroke="#7a4e2e" stroke-width="6" stroke-linecap="round"/>
          <line x1="-8" y1="20" x2="-4" y2="44" stroke="#7a4e2e" stroke-width="6" stroke-linecap="round"/>
          <line x1="15" y1="20" x2="22" y2="42" stroke="#7a4e2e" stroke-width="6" stroke-linecap="round"/>
          <line x1="30" y1="19" x2="44" y2="40" stroke="#7a4e2e" stroke-width="6" stroke-linecap="round"/>
          <circle cx="-8" cy="-38" r="10" fill="#d4a870"/>
          <rect x="-15" y="-29" width="13" height="17" rx="2" fill="#c8102e"/>
          <ellipse cx="-8" cy="-47" rx="10" ry="6" fill="#c8102e"/>
        </g>
        <!-- GBR label -->
        <rect x="78" y="202" width="36" height="14" rx="4" fill="rgba(200,16,46,.22)"/>
        <text x="96" y="212" text-anchor="middle" fill="#fca5a5" font-size="8" font-weight="700" font-family="sans-serif">GBR</text>
        <!-- Ball -->
        <circle cx="300" cy="208" r="6" fill="#fff" stroke="#ddd" stroke-width="1.5"/>
        <!-- Bottom info bar -->
        <rect x="0" y="248" width="420" height="32" fill="rgba(0,0,0,.65)"/>
        <text x="210" y="261" text-anchor="middle" fill="#fca5a5" font-size="13" font-weight="900" font-family="sans-serif">ARG 11 — 0 GBR</text>
        <text x="210" y="274" text-anchor="middle" fill="rgba(252,165,165,.45)" font-size="8" font-family="sans-serif">Argentina won gold · 1924 Paris &amp; 1936 Berlin · Great Britain: most medals overall (6)</text>
      </svg>`,
    },
    {
      title: 'Rope Climbing', years: '1896 – 1932', emoji: '🧗',
      accent: '#93c5fd', accentDim: 'rgba(147,197,253,.18)',
      bg: 'linear-gradient(155deg,#000815 0%,#001030 55%,#001840 100%)',
      illBg: 'linear-gradient(155deg,#000510 0%,#000e28 100%)',
      fact: 'Rope climbing was held at four Olympic Games: 1896, 1904, 1924, and 1932 — judged on speed and sometimes style. The rope heights varied: 14m at Athens 1896, and between 7.32–8m at later Games.',
      detail: 'USA won gold in 1904 (George Eyser) and 1932 (Raymond Bass). Bedřich Šupčík of Czechoslovakia claimed gold at Paris 1924 with a technique so smooth judges awarded top marks for style.',
      highlight: 'USA: 2 gold medals (1904 & 1932)', lastSeen: 'Los Angeles 1932',
      whyGone: 'Replaced by modern gymnastics apparatus events. Sport climbing returned to the Olympics at Tokyo 2020 — nearly a century later.',
      wikiUrl: 'https://en.wikipedia.org/wiki/Rope_climbing_at_the_Olympics',
      illTitle: 'Olympic Rope Climbing — Los Angeles 1932',
      illCaption: 'Athletes race an 8-metre rope; judged on speed and style',
      illSvg: `<svg viewBox="0 0 420 280" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="rc_bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#000510"/><stop offset="100%" stop-color="#001030"/></linearGradient>
        </defs>
        <rect width="420" height="280" fill="url(#rc_bg)"/>
        <!-- Header band -->
        <rect width="420" height="32" fill="rgba(0,0,0,.5)"/>
        <text x="210" y="14" text-anchor="middle" fill="#93c5fd" font-size="11" font-weight="700" font-family="sans-serif" letter-spacing="1.5">OLYMPIC ROPE CLIMBING · 1896 · 1904 · 1924 · 1932</text>
        <text x="210" y="27" text-anchor="middle" fill="rgba(147,197,253,.5)" font-size="9" font-family="sans-serif">Part of Artistic Gymnastics · Judged on speed &amp; style</text>
        <!-- Ceiling beam -->
        <rect x="52" y="32" width="316" height="14" rx="3" fill="#1a2840" stroke="rgba(147,197,253,.28)" stroke-width="1"/>
        ${Array.from({length:14},(_,i)=>`<line x1="${62+i*22}" y1="32" x2="${62+i*22}" y2="46" stroke="rgba(147,197,253,.14)" stroke-width="1"/>`).join('')}
        <!-- Crowd seated at bottom -->
        ${Array.from({length:22},(_,i)=>`<ellipse cx="${10+i*19}" cy="238" rx="8" ry="${11+Math.sin(i)*2}" fill="rgba(50,70,140,.3)"/>`).join('')}
        <!-- Height scale left side -->
        <line x1="44" y1="46" x2="44" y2="220" stroke="rgba(147,197,253,.2)" stroke-width="1"/>
        <line x1="40" y1="46" x2="48" y2="46" stroke="rgba(147,197,253,.35)" stroke-width="1"/>
        <line x1="40" y1="220" x2="48" y2="220" stroke="rgba(147,197,253,.35)" stroke-width="1"/>
        <text x="38" y="136" text-anchor="middle" fill="rgba(147,197,253,.5)" font-size="9" font-weight="700" font-family="sans-serif" transform="rotate(-90,38,136)">8 METRES</text>
        <!-- ROPE 1 — USA climber at TOP (winner) -->
        <line x1="138" y1="46" x2="138" y2="220" stroke="#b89040" stroke-width="7" stroke-linecap="round"/>
        ${Array.from({length:17},(_,i)=>`<line x1="134" y1="${50+i*10}" x2="142" y2="${57+i*10}" stroke="#906a28" stroke-width="1.8" opacity=".55"/>`).join('')}
        <g transform="translate(138,74)">
          <circle cy="-18" r="9" fill="#e8c090" stroke="#f0d0a0" stroke-width="1"/>
          <rect x="-6" y="-10" width="12" height="16" rx="2" fill="#1a3a8a"/>
          <line x1="-6" y1="-6" x2="-17" y2="-22" stroke="#e8c090" stroke-width="3" stroke-linecap="round"/>
          <line x1="6" y1="-6" x2="17" y2="-22" stroke="#e8c090" stroke-width="3" stroke-linecap="round"/>
          <circle cy="-26" r="4.5" fill="#e8c090"/>
          <line x1="-3" y1="6" x2="-7" y2="20" stroke="#e8c090" stroke-width="3" stroke-linecap="round"/>
          <line x1="3" y1="6" x2="7" y2="20" stroke="#e8c090" stroke-width="3" stroke-linecap="round"/>
          <!-- Gold medal -->
          <circle cx="22" cy="-8" r="9" fill="#f0c040" stroke="#c89820" stroke-width="1.5"/>
          <text x="22" y="-4" text-anchor="middle" fill="#1a0800" font-size="8" font-weight="900" font-family="sans-serif">1st</text>
        </g>
        <rect x="110" y="221" width="56" height="13" rx="4" fill="rgba(26,58,138,.5)"/>
        <text x="138" y="231" text-anchor="middle" fill="#93c5fd" font-size="8" font-weight="700" font-family="sans-serif">USA · GOLD</text>
        <!-- ROPE 2 — CZE climber mid-height -->
        <line x1="210" y1="46" x2="210" y2="220" stroke="#b89040" stroke-width="7" stroke-linecap="round"/>
        ${Array.from({length:17},(_,i)=>`<line x1="206" y1="${50+i*10}" x2="214" y2="${57+i*10}" stroke="#906a28" stroke-width="1.8" opacity=".55"/>`).join('')}
        <g transform="translate(210,140)">
          <circle cy="-18" r="9" fill="#d4a870"/>
          <rect x="-6" y="-10" width="12" height="16" rx="2" fill="#8a2020"/>
          <line x1="-6" y1="-6" x2="-15" y2="-20" stroke="#d4a870" stroke-width="3" stroke-linecap="round"/>
          <line x1="6" y1="-6" x2="15" y2="-20" stroke="#d4a870" stroke-width="3" stroke-linecap="round"/>
          <circle cy="-24" r="4.5" fill="#d4a870"/>
          <line x1="-3" y1="6" x2="-6" y2="20" stroke="#d4a870" stroke-width="3" stroke-linecap="round"/>
          <line x1="3" y1="6" x2="6" y2="20" stroke="#d4a870" stroke-width="3" stroke-linecap="round"/>
        </g>
        <rect x="182" y="221" width="56" height="13" rx="4" fill="rgba(138,32,32,.4)"/>
        <text x="210" y="231" text-anchor="middle" fill="#fca5a5" font-size="8" font-weight="700" font-family="sans-serif">CZE · GOLD 1924</text>
        <!-- ROPE 3 — FRA climber lower -->
        <line x1="282" y1="46" x2="282" y2="220" stroke="#b89040" stroke-width="7" stroke-linecap="round"/>
        ${Array.from({length:17},(_,i)=>`<line x1="278" y1="${50+i*10}" x2="286" y2="${57+i*10}" stroke="#906a28" stroke-width="1.8" opacity=".55"/>`).join('')}
        <g transform="translate(282,185)">
          <circle cy="-18" r="9" fill="#f0cca0"/>
          <rect x="-6" y="-10" width="12" height="16" rx="2" fill="#1a501a"/>
          <line x1="-6" y1="-6" x2="-14" y2="-18" stroke="#f0cca0" stroke-width="3" stroke-linecap="round"/>
          <line x1="6" y1="-6" x2="14" y2="-18" stroke="#f0cca0" stroke-width="3" stroke-linecap="round"/>
          <circle cy="-22" r="4.5" fill="#f0cca0"/>
          <line x1="-3" y1="6" x2="-5" y2="18" stroke="#f0cca0" stroke-width="3" stroke-linecap="round"/>
          <line x1="3" y1="6" x2="5" y2="18" stroke="#f0cca0" stroke-width="3" stroke-linecap="round"/>
        </g>
        <rect x="254" y="221" width="56" height="13" rx="4" fill="rgba(26,80,26,.4)"/>
        <text x="282" y="231" text-anchor="middle" fill="#86efac" font-size="8" font-weight="700" font-family="sans-serif">FRA · SILVER</text>
        <!-- Bottom info bar -->
        <rect x="0" y="248" width="420" height="32" fill="rgba(0,0,0,.65)"/>
        <text x="14" y="261" fill="#93c5fd" font-size="9" font-weight="700" font-family="sans-serif">🧗 USA: 2 Gold (1904 George Eyser · 1932 Raymond Bass)</text>
        <text x="14" y="274" fill="rgba(147,197,253,.45)" font-size="8" font-family="sans-serif">Šupčík (CZE) won Paris 1924 with near-perfect style marks</text>
      </svg>`,
    },
    {
      title: 'Lacrosse', years: '1904, 1908', emoji: '🥍',
      accent: '#6ee7b7', accentDim: 'rgba(110,231,183,.18)',
      bg: 'linear-gradient(155deg,#001008 0%,#002018 55%,#003020 100%)',
      illBg: 'linear-gradient(155deg,#000a05 0%,#001810 100%)',
      fact: 'Lacrosse — originating with Indigenous peoples of North America — was contested at 1904 St. Louis and 1908 London. Canada won gold both times. In 1904, a Mohawk Nation team from the Six Nations Reserve competed as an independent entry and won bronze.',
      detail: 'In 1904, the three competing teams were two Canadian clubs and one US team. The Mohawk players\' names appear in official records: Black Hawk, Black Eagle, Almighty Voice, Flat Iron, and others. Canada also won the 1908 edition against Great Britain.',
      highlight: 'Mohawk Nation competed independently', lastSeen: 'London 1908',
      whyGone: 'Dropped due to lack of global participation — but officially approved to return at Los Angeles 2028 in the lacrosse sixes format.',
      wikiUrl: 'https://en.wikipedia.org/wiki/Lacrosse_at_the_Summer_Olympics',
      illTitle: 'Olympic Lacrosse — St. Louis 1904',
      illCaption: 'Canada vs. Mohawk Nation — the first Olympic lacrosse final',
      illSvg: `<svg viewBox="0 0 420 280" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="lac_bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#000a05"/><stop offset="100%" stop-color="#001a0e"/></linearGradient>
          <linearGradient id="lac_field" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#1a4a10"/><stop offset="100%" stop-color="#0d2808"/></linearGradient>
        </defs>
        <rect width="420" height="280" fill="url(#lac_bg)"/>
        <!-- Header band -->
        <rect width="420" height="32" fill="rgba(0,0,0,.5)"/>
        <text x="210" y="14" text-anchor="middle" fill="#6ee7b7" font-size="11" font-weight="700" font-family="sans-serif" letter-spacing="1.5">OLYMPIC LACROSSE · ST. LOUIS 1904</text>
        <text x="210" y="27" text-anchor="middle" fill="rgba(110,231,183,.5)" font-size="9" font-family="sans-serif">Canada · United States · Mohawk Nation (Six Nations Reserve)</text>
        <!-- Bleacher crowd -->
        ${Array.from({length:32},(_,i)=>`<ellipse cx="${6+i*13}" cy="42" rx="5" ry="${9+Math.sin(i*0.7)*2}" fill="rgba(40,120,60,.2)"/>`).join('')}
        <rect x="0" y="48" width="420" height="3" fill="#3a6a20" opacity=".4"/>
        <!-- Field -->
        <rect x="0" y="51" width="420" height="165" fill="url(#lac_field)"/>
        <line x1="0" y1="51" x2="420" y2="51" stroke="#3a7a20" stroke-width="2"/>
        <!-- Field markings -->
        <ellipse cx="210" cy="134" rx="52" ry="38" fill="none" stroke="rgba(255,255,255,.12)" stroke-width="1.5"/>
        <line x1="210" y1="51" x2="210" y2="216" stroke="rgba(255,255,255,.09)" stroke-width="1.5"/>
        ${[90,145,200,275,330].map(x=>`<line x1="${x}" y1="51" x2="${x}" y2="216" stroke="rgba(255,255,255,.05)" stroke-width="1"/>`).join('')}
        <!-- Goals -->
        <rect x="14" y="114" width="22" height="38" fill="none" stroke="#d8d8b8" stroke-width="2.5"/>
        <rect x="384" y="114" width="22" height="38" fill="none" stroke="#d8d8b8" stroke-width="2.5"/>
        <!-- CANADA player (red kit, large, has ball) -->
        <g transform="translate(244,126)">
          <circle cy="-26" r="10" fill="#e8c090" stroke="#f0d0a0" stroke-width="1"/>
          <rect x="-7" y="-17" width="14" height="21" rx="3" fill="#c8102e"/>
          <line x1="7" y1="-11" x2="40" y2="-26" stroke="#b08840" stroke-width="3" stroke-linecap="round"/>
          <ellipse cx="44" cy="-30" rx="10" ry="7" fill="none" stroke="#6ee7b7" stroke-width="2"/>
          <circle cx="44" cy="-30" r="4" fill="#fff" opacity=".9"/>
          <line x1="-4" y1="4" x2="-11" y2="24" stroke="#e8c090" stroke-width="4" stroke-linecap="round"/>
          <line x1="4" y1="4" x2="13" y2="22" stroke="#e8c090" stroke-width="4" stroke-linecap="round"/>
          <line x1="-7" y1="-11" x2="-20" y2="-4" stroke="#e8c090" stroke-width="3" stroke-linecap="round"/>
        </g>
        <rect x="212" y="156" width="64" height="13" rx="4" fill="rgba(200,16,46,.3)"/>
        <text x="244" y="165" text-anchor="middle" fill="#fca5a5" font-size="8" font-weight="700" font-family="sans-serif">CANADA · GOLD</text>
        <!-- MOHAWK player (dark green kit, defending) -->
        <g transform="translate(174,144)">
          <circle cy="-26" r="10" fill="#d4a870"/>
          <rect x="-7" y="-17" width="14" height="21" rx="3" fill="#2a5a10"/>
          <line x1="-7" y1="-13" x2="-30" y2="-36" stroke="#b08840" stroke-width="3" stroke-linecap="round"/>
          <ellipse cx="-34" cy="-40" rx="9" ry="6" fill="none" stroke="#6ee7b7" stroke-width="1.8"/>
          <line x1="-4" y1="4" x2="-13" y2="22" stroke="#d4a870" stroke-width="4" stroke-linecap="round"/>
          <line x1="4" y1="4" x2="10" y2="24" stroke="#d4a870" stroke-width="4" stroke-linecap="round"/>
          <line x1="7" y1="-11" x2="18" y2="-5" stroke="#d4a870" stroke-width="3" stroke-linecap="round"/>
        </g>
        <rect x="140" y="175" width="68" height="13" rx="4" fill="rgba(42,90,16,.4)"/>
        <text x="174" y="184" text-anchor="middle" fill="#86efac" font-size="8" font-weight="700" font-family="sans-serif">MOHAWK · BRONZE</text>
        <!-- USA player (blue) background -->
        <g transform="translate(310,162) scale(.72)">
          <circle cy="-22" r="10" fill="#d4b080"/>
          <rect x="-7" y="-14" width="14" height="18" rx="2" fill="#1a3a8a"/>
          <line x1="-7" y1="-8" x2="-22" y2="-22" stroke="#b08840" stroke-width="3"/>
          <ellipse cx="-25" cy="-26" rx="8" ry="5" fill="none" stroke="#6ee7b7" stroke-width="1.5"/>
          <line x1="-3" y1="4" x2="-6" y2="18" stroke="#d4b080" stroke-width="3" stroke-linecap="round"/>
          <line x1="3" y1="4" x2="6" y2="18" stroke="#d4b080" stroke-width="3" stroke-linecap="round"/>
        </g>
        <!-- 2028 return badge -->
        <rect x="292" y="54" width="120" height="18" rx="6" fill="rgba(110,231,183,.1)" stroke="rgba(110,231,183,.38)" stroke-width="1"/>
        <text x="352" y="66" text-anchor="middle" fill="#6ee7b7" font-size="8.5" font-weight="700" font-family="sans-serif">↩ Returns LA 2028</text>
        <!-- Bottom info bar -->
        <rect x="0" y="248" width="420" height="32" fill="rgba(0,0,0,.65)"/>
        <text x="14" y="261" fill="#6ee7b7" font-size="9" font-weight="700" font-family="sans-serif">🥍 Canada won gold 1904 &amp; 1908 · 3 teams total competed</text>
        <text x="14" y="274" fill="rgba(110,231,183,.45)" font-size="8" font-family="sans-serif">Mohawk players: Black Hawk · Black Eagle · Almighty Voice · Flat Iron &amp; more</text>
      </svg>`,
    },
  ];

  /* ═══════════════════════════════════
     CSS
  ═══════════════════════════════════ */
  if (!document.getElementById('_fsb2css')) {
    const s = document.createElement('style'); s.id = '_fsb2css';
    s.textContent = `
      #forgottenSportsBook {
        max-width: 100%;
        margin: 0 auto;
        font-family: 'Lora', Georgia, serif;
        padding-bottom: 48px;
      }

      /* ── Outer wrapper: expands from 1 col to 2 on hover ── */
      .fsb2-stage {
        position: relative;
        display: grid;
        grid-template-columns: 1fr 0px;
        gap: 0;
        transition: grid-template-columns .45s cubic-bezier(.34,1.2,.64,1);
        border-radius: 32px;
        overflow: hidden;
      }
      .fsb2-stage:hover {
        grid-template-columns: 1fr 380px;
        gap: 0;
      }

      /* ── MAIN CARD (viz4 shell style) ── */
      .fsb2-main {
        border-radius: 32px;
        background: var(--fsb-bg, linear-gradient(155deg,#0d0320 0%,#1e0845 100%));
        box-shadow: 0 28px 60px rgba(0,0,0,.45), inset 0 1px 0 rgba(255,255,255,.07);
        transition: background .4s ease, border-radius .45s;
        overflow: hidden;
        min-height: 480px;
        display: flex;
        flex-direction: column;
        border: 1px solid rgba(255,255,255,.06);
        position: relative;
        z-index: 1;
      }
      .fsb2-stage:hover .fsb2-main {
        border-radius: 32px 0 0 32px;
      }

      /* top glow bar */
      .fsb2-main::before {
        content: '';
        position: absolute;
        top: 0; left: 0; right: 0; height: 1px;
        background: linear-gradient(90deg, transparent, var(--fsb-accent-dim, rgba(192,132,252,.4)), transparent);
      }

      /* ── header ── */
      .fsb2-header {
        display: flex; align-items: center; justify-content: space-between;
        padding: 12px 28px 10px;
        background: rgba(16,30,65,.78);
        border-bottom: 1px solid rgba(255,255,255,.09);
      }
      .fsb2-rings { display: flex; align-items: center; }
      .fsb2-page-label {
        font-size: 10px; font-weight: 700; letter-spacing: .2em;
        text-transform: uppercase; color: rgba(255,255,255,.35);
      }
      .fsb2-hover-cue {
        font-size: 10px; font-weight: 700; letter-spacing: .12em;
        text-transform: uppercase; color: var(--fsb-accent, #c084fc);
        opacity: .5;
        animation: fsbCuePulse 2.4s ease-in-out infinite;
        transition: opacity .3s;
      }
      .fsb2-stage:hover .fsb2-hover-cue { opacity: 0; }
      @keyframes fsbCuePulse {
        0%,100% { opacity: .35; }
        50%      { opacity: .7; }
      }

      /* ── body ── */
      .fsb2-body {
        flex: 1;
        display: grid;
        grid-template-columns: 100px 1fr;
        gap: 0 24px;
        padding: 32px 36px 24px;
        align-items: start;
        min-width: 0;
      }
      .fsb2-emoji-col {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding-top: 6px;
        flex-shrink: 0;
      }
      .fsb2-emoji {
        font-size: 64px; line-height: 1;
        filter: drop-shadow(0 4px 18px rgba(0,0,0,.6));
      }
      .fsb2-text-col {
        display: flex; flex-direction: column; gap: 12px;
        min-width: 0; overflow: hidden;
      }
      .fsb2-title {
        font-family: 'Playfair Display', Georgia, serif;
        font-size: 38px; font-weight: 900; line-height: 1.1;
        color: #fff; margin: 0;
        text-shadow: 0 2px 20px rgba(0,0,0,.5);
        word-wrap: break-word;
      }
      .fsb2-fact {
        font-size: 15px; line-height: 1.75;
        color: rgba(255,255,255,.85); margin: 0;
      }
      .fsb2-detail {
        font-size: 13px; line-height: 1.65;
        color: rgba(255,255,255,.48); margin: 0;
        font-style: italic;
      }
      .fsb2-why {
        font-size: 12px; line-height: 1.55;
        color: rgba(255,255,255,.32); margin: 0;
      }

      /* ── footer ── */
      .fsb2-footer {
        display: flex; gap: 10px; flex-wrap: wrap;
        padding: 16px 40px 20px;
        background: rgba(0,0,0,.25);
        border-top: 1px solid rgba(255,255,255,.06);
      }
      .fsb2-tag {
        display: inline-flex; align-items: center; gap: 7px;
        padding: 6px 15px; border-radius: 999px;
        font-size: 12px; font-weight: 700;
        background: rgba(255,255,255,.08); color: rgba(255,255,255,.7);
        border: 1px solid rgba(255,255,255,.12);
      }
      .fsb2-wiki-link:hover {
        background: rgba(255,255,255,.14) !important;
        color: rgba(255,255,255,.9) !important;
        transform: translateY(-1px);
      }
      .fsb2-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }

      /* ── ILLUSTRATION CARD (slides in) ── */
      .fsb2-ill-wrap {
        overflow: hidden;
        border-radius: 0 32px 32px 0;
        opacity: 0;
        transform: translateX(20px);
        transition: opacity .35s .1s ease, transform .4s .08s cubic-bezier(.34,1.2,.64,1);
        background: var(--fsb-ill-bg, linear-gradient(155deg,#0d0320 0%,#180840 100%));
        border: 1px solid rgba(255,255,255,.06);
        border-left: none;
        display: flex;
        flex-direction: column;
        min-height: 480px;
      }
      .fsb2-stage:hover .fsb2-ill-wrap {
        opacity: 1;
        transform: translateX(0);
      }
      .fsb2-ill-header {
        padding: 18px 22px 12px;
        background: rgba(0,0,0,.3);
        border-bottom: 1px solid rgba(255,255,255,.06);
      }
      .fsb2-ill-title {
        font-size: 11px; font-weight: 800; letter-spacing: .12em;
        text-transform: uppercase; color: var(--fsb-accent, #c084fc);
        margin: 0 0 2px;
      }
      .fsb2-ill-caption {
        font-size: 10px; color: rgba(255,255,255,.35);
        font-style: italic; margin: 0;
      }
      .fsb2-ill-svg-wrap {
        flex: 1; padding: 18px 16px;
        display: flex; align-items: center; justify-content: center;
      }
      .fsb2-ill-svg-wrap svg {
        width: 100%; height: auto;
        border-radius: 12px;
        box-shadow: 0 6px 28px rgba(0,0,0,.55);
      }
      .fsb2-ill-footer {
        padding: 12px 22px 16px;
        background: rgba(0,0,0,.25);
        border-top: 1px solid rgba(255,255,255,.06);
        font-size: 9px; font-weight: 800; letter-spacing: .15em;
        text-transform: uppercase; color: rgba(255,255,255,.25);
        text-align: center;
      }

      /* ── Navigation ── */
      .fsb2-nav {
        display: flex; align-items: center; gap: 18px;
        margin-top: 24px; justify-content: center; flex-wrap: wrap;
      }
      .fsb2-btn {
        appearance: none;
        border: 1px solid rgba(100,160,255,.25);
        background: rgba(10,24,58,.7); color: #94a3b8;
        padding: 12px 30px; border-radius: 999px;
        font-family: 'Lora', Georgia, serif;
        font-size: 14px; font-weight: 700; cursor: pointer;
        transition: all .2s;
      }
      .fsb2-btn:hover:not(:disabled) {
        color: #e2e8f0; border-color: rgba(100,160,255,.5);
        background: rgba(26,108,255,.15); transform: translateY(-1px);
      }
      .fsb2-btn:disabled { opacity: .3; cursor: default; }
      .fsb2-counter {
        font-family: 'Playfair Display', serif;
        font-size: 17px; font-weight: 700;
        color: rgba(180,210,255,.55); min-width: 68px; text-align: center;
      }
      .fsb2-dots { display: flex; gap: 9px; margin-top: 14px; justify-content: center; }
      .fsb2-dot {
        width: 10px; height: 10px; border-radius: 50%;
        background: rgba(100,160,255,.18); border: 1px solid rgba(100,160,255,.28);
        cursor: pointer; transition: all .25s;
      }
      .fsb2-dot.on {
        background: rgba(100,160,255,.8); border-color: rgba(100,160,255,.9);
        transform: scale(1.4);
      }
    `;
    document.head.appendChild(s);
  }

  /* ═══════════════════════════════════
     RENDER
  ═══════════════════════════════════ */
  const host = document.getElementById('forgottenSportsBook');
  if (!host) return;

  let _ringIdx = 0;
  function buildRingsSVG() {
    const uid = ++_ringIdx;
    return `<svg viewBox="-34 -12 68 33" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="display:block;width:88px;height:auto">
   <defs>
      <clipPath id="interlace${uid}">
         <path d="M -11,-11 h 22 v 22 h -22 z M 11,-1.5 a 10.5,10.5 0 0,0 0,21 v -3 a 7.5,7.5 0 1,1 0,-15 M -11,1.5 a 7.5,7.5 0 1,1 0,15 v 3 a 10.5,10.5 0 0,0 0,-21 z" clip-rule="evenodd"/>
      </clipPath>
      <clipPath id="interlace_ff${uid}">
         <path d="M 0,0 l -12,12 h 12 z"/>
      </clipPath>
      <g id="ring${uid}">
         <circle r="9" clip-path="url(#interlace${uid})"/>
         <circle r="9" clip-path="url(#interlace_ff${uid})"/>
         <path d="M 0,-9 a 9,9 0 0,1 9,9" transform="rotate(45)"/>
      </g>
   </defs>
   <g fill="none" stroke-width="2">
      <g stroke="#0085c7" transform="translate(-22,0)">
         <use href="#ring${uid}"/>
         <path d="M 0,-9 a 9,9 0 0,0 0,18"/>
      </g>
      <use href="#ring${uid}" stroke="black"/>
      <g stroke="#df0024" transform="translate(22,0)">
         <use href="#ring${uid}"/>
         <path d="M 0,-9 a 9,9 0 0,1 0,18"/>
      </g>
      <use href="#ring${uid}" stroke="#f4c300" transform="translate(-11,9) rotate(180)"/>
      <use href="#ring${uid}" stroke="#009f3d" transform="translate(11,9) rotate(180)"/>
   </g>
</svg>`;
  }

  function buildStage(sport, idx) {
    const stage = document.createElement('div');
    stage.className = 'fsb2-stage';
    stage.style.setProperty('--fsb-bg',      sport.bg);
    stage.style.setProperty('--fsb-ill-bg',  sport.illBg);
    stage.style.setProperty('--fsb-accent',  sport.accent);
    stage.style.setProperty('--fsb-accent-dim', sport.accentDim);

    const rings = buildRingsSVG();

    stage.innerHTML = `
      <!-- MAIN CARD -->
      <div class="fsb2-main">
        <div class="fsb2-header">
          <div class="fsb2-rings">${rings}</div>
          <span class="fsb2-page-label">Forgotten Sport · ${idx + 1} of ${SPORTS.length}</span>
          <span class="fsb2-hover-cue">Hover for illustration →</span>
        </div>
        <div class="fsb2-body">
          <div class="fsb2-emoji-col">
            <span class="fsb2-emoji">${sport.emoji}</span>
          </div>
          <div class="fsb2-text-col">
            <h3 class="fsb2-title" style="color:#fff">${sport.title}</h3>
            <div style="font-size:12px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:${sport.accent};opacity:.75;margin-top:-6px">📅 ${sport.years}</div>
            <p class="fsb2-fact">${sport.fact}</p>
            <p class="fsb2-detail">${sport.detail}</p>
            <p class="fsb2-why">❌ Why removed: ${sport.whyGone}</p>
          </div>
        </div>
        <div class="fsb2-footer">
          <span class="fsb2-tag"><span class="fsb2-dot" style="background:${sport.accent}"></span>${sport.highlight}</span>
          <span class="fsb2-tag">🏛️ Last seen: ${sport.lastSeen}</span>
          <a class="fsb2-tag fsb2-wiki-link" href="${sport.wikiUrl}" target="_blank" rel="noopener" style="text-decoration:none;border-color:rgba(255,255,255,.18);color:rgba(255,255,255,.55);cursor:pointer;transition:all .2s;">📖 Wikipedia source</a>
        </div>
      </div>
      <!-- ILLUSTRATION CARD -->
      <div class="fsb2-ill-wrap">
        <div class="fsb2-ill-header">
          <p class="fsb2-ill-title">${sport.illTitle}</p>
          <p class="fsb2-ill-caption">${sport.illCaption}</p>
        </div>
        <div class="fsb2-ill-svg-wrap">${sport.illSvg}</div>
        <div class="fsb2-ill-footer">Original illustration · Olympic archive</div>
      </div>`;

    return stage;
  }

  const wrapper = document.createElement('div');

  const stages = SPORTS.map((s, i) => {
    const st = buildStage(s, i);
    st.style.display = 'none';
    wrapper.appendChild(st);
    return st;
  });

  /* ── HORIZONTAL TIMELINE ── */
  const tlStyle = document.createElement('style');
  tlStyle.textContent = `
    .fsb2-timeline-wrap {
      margin: 20px 0 6px;
      padding: 16px 20px 12px;
      background: rgba(6,12,28,.9);
      border: 1px solid rgba(100,160,255,.12);
      border-radius: 20px;
    }
    .fsb2-tl-header {
      display: flex; align-items: baseline; gap: 14px; margin-bottom: 10px;
    }
    .fsb2-tl-title {
      font-size: 9px; font-weight: 800; letter-spacing: .2em;
      text-transform: uppercase; color: rgba(100,160,255,.4);
    }
    .fsb2-tl-source {
      font-size: 9px; color: rgba(100,160,255,.22); font-style: italic;
      margin-left: auto;
    }
    .fsb2-tl-svg { display: block; width: 100%; cursor: default; }
    .fsb2-tl-svg text { font-family: 'DM Sans', sans-serif; }
    .fsb2-tl-bar { cursor: pointer; }
    .fsb2-tl-bar:hover .tl-hit { fill: rgba(255,255,255,.04); }
  `;
  document.head.appendChild(tlStyle);

  const YEAR_MIN = 1896, YEAR_MAX = 1952;

  // Each sport: its own dedicated row — no row-sharing, no label collision
  // Label placement: ABOVE the bar on the same row, then bar, then axis below
  const SPORT_RANGES = [
    { start: 1900, end: 1920 },  // 0 Tug of War
    { start: 1912, end: 1948 },  // 1 Art Competitions
    { start: 1908, end: 1908 },  // 2 Motor Boating
    { start: 1900, end: 1936 },  // 3 Polo
    { start: 1896, end: 1932 },  // 4 Rope Climbing
    { start: 1904, end: 1908 },  // 5 Lacrosse
  ];

  const N = SPORTS.length;
  const ROW_H    = 8;   // bar height
  const ROW_SLOT = 18;  // tighter vertical slot per sport
  const PAD_TOP  = 6;
  const PAD_L    = 140; const PAD_R = 10;  // wide left column for full sport names
  const AXIS_PAD = 22;
  const TL_H     = PAD_TOP + N * ROW_SLOT + AXIS_PAD + 6;
  const AXIS_Y   = PAD_TOP + N * ROW_SLOT;

  const tlWrap = document.createElement('div');
  tlWrap.className = 'fsb2-timeline-wrap';
  tlWrap.innerHTML = `
    <div class="fsb2-tl-header">
      <span class="fsb2-tl-title">Olympic Timeline — click any row to navigate</span>
      <span class="fsb2-tl-source">Source: IOC Historical Records · Olympedia.org · Olympic Studies Centre</span>
    </div>`;

  const svgNS = 'http://www.w3.org/2000/svg';
  const tlSvg = document.createElementNS(svgNS, 'svg');
  tlSvg.setAttribute('class', 'fsb2-tl-svg');
  tlSvg.setAttribute('viewBox', `0 0 900 ${TL_H}`);
  tlSvg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

  const TRACK_W = 900 - PAD_L - PAD_R;

  function yearToX(y) {
    return PAD_L + ((y - YEAR_MIN) / (YEAR_MAX - YEAR_MIN)) * TRACK_W;
  }

  // ── axis line ──
  const axisLine = document.createElementNS(svgNS, 'line');
  axisLine.setAttribute('x1', PAD_L); axisLine.setAttribute('x2', PAD_L + TRACK_W);
  axisLine.setAttribute('y1', AXIS_Y); axisLine.setAttribute('y2', AXIS_Y);
  axisLine.setAttribute('stroke', 'rgba(100,160,255,.14)');
  axisLine.setAttribute('stroke-width', '1');
  tlSvg.appendChild(axisLine);

  // ── year ticks and labels ──
  for (let y = YEAR_MIN; y <= YEAR_MAX; y += 4) {
    const x = yearToX(y);
    const isWar = y === 1916 || y === 1940 || y === 1944;
    const showLabel = (y % 8 === 0) || y === YEAR_MIN || y === YEAR_MAX;

    // vertical grid line (very subtle)
    const grid = document.createElementNS(svgNS, 'line');
    grid.setAttribute('x1', x); grid.setAttribute('x2', x);
    grid.setAttribute('y1', PAD_TOP); grid.setAttribute('y2', AXIS_Y);
    grid.setAttribute('stroke', isWar ? 'rgba(239,68,68,.06)' : 'rgba(100,160,255,.04)');
    grid.setAttribute('stroke-width', '1');
    tlSvg.appendChild(grid);

    // tick
    const tick = document.createElementNS(svgNS, 'line');
    tick.setAttribute('x1', x); tick.setAttribute('x2', x);
    tick.setAttribute('y1', AXIS_Y); tick.setAttribute('y2', AXIS_Y + 4);
    tick.setAttribute('stroke', isWar ? 'rgba(239,68,68,.3)' : 'rgba(100,160,255,.22)');
    tick.setAttribute('stroke-width', '1');
    tlSvg.appendChild(tick);

    if (showLabel) {
      const lbl = document.createElementNS(svgNS, 'text');
      lbl.setAttribute('x', x);
      lbl.setAttribute('y', AXIS_Y + 15);
      lbl.setAttribute('text-anchor', 'middle');
      lbl.setAttribute('fill', isWar ? 'rgba(239,68,68,.45)' : 'rgba(148,163,184,.55)');
      lbl.setAttribute('font-size', '9');
      lbl.setAttribute('font-weight', '600');
      lbl.textContent = y;
      tlSvg.appendChild(lbl);
    }

    // war labels (inline at axis level)
    if (y === 1916 || y === 1940) {
      const tag = document.createElementNS(svgNS, 'text');
      tag.setAttribute('x', yearToX(y + 2));
      tag.setAttribute('y', AXIS_Y - 3);
      tag.setAttribute('text-anchor', 'middle');
      tag.setAttribute('fill', 'rgba(239,68,68,.38)');
      tag.setAttribute('font-size', '7.5');
      tag.setAttribute('font-style', 'italic');
      tag.textContent = y === 1916 ? 'WWI' : 'WWII';
      tlSvg.appendChild(tag);
    }
  }

  // ── sport rows (one per sport, top-to-bottom) ──
  const tlBarEls = [];

  SPORTS.forEach((sport, i) => {
    const range = SPORT_RANGES[i];
    const x1    = yearToX(range.start);
    const x2    = yearToX(range.end === range.start ? range.end + 3 : range.end);
    const barW  = Math.max(x2 - x1, 12);
    const rowTop = PAD_TOP + i * ROW_SLOT;
    const barY   = rowTop + (ROW_SLOT - ROW_H) / 2;  // vertically centered in slot

    const g = document.createElementNS(svgNS, 'g');
    g.setAttribute('class', 'fsb2-tl-bar');
    g.setAttribute('opacity', '0.38');

    // invisible full-row hit area
    const hit = document.createElementNS(svgNS, 'rect');
    hit.setAttribute('class', 'tl-hit');
    hit.setAttribute('x', '0'); hit.setAttribute('y', rowTop);
    hit.setAttribute('width', '900'); hit.setAttribute('height', ROW_SLOT - 2);
    hit.setAttribute('rx', '4'); hit.setAttribute('fill', 'transparent');
    g.appendChild(hit);

    // sport label — LEFT of the track (fixed column)
    const nameLbl = document.createElementNS(svgNS, 'text');
    nameLbl.setAttribute('x', PAD_L - 4);
    nameLbl.setAttribute('y', barY + ROW_H / 2 + 3.5);
    nameLbl.setAttribute('text-anchor', 'end');
    nameLbl.setAttribute('fill', sport.accent);
    nameLbl.setAttribute('font-size', '9');
    nameLbl.setAttribute('font-weight', '800');
    nameLbl.setAttribute('letter-spacing', '.04em');
    nameLbl.textContent = sport.title;
    g.appendChild(nameLbl);

    // thin background track (full width, very dim)
    const bgTrack = document.createElementNS(svgNS, 'rect');
    bgTrack.setAttribute('x', PAD_L); bgTrack.setAttribute('y', barY);
    bgTrack.setAttribute('width', TRACK_W); bgTrack.setAttribute('height', ROW_H);
    bgTrack.setAttribute('rx', '4');
    bgTrack.setAttribute('fill', `${sport.accent}18`);
    g.appendChild(bgTrack);

    // active colored bar
    const bar = document.createElementNS(svgNS, 'rect');
    bar.setAttribute('x', x1); bar.setAttribute('y', barY);
    bar.setAttribute('width', barW); bar.setAttribute('height', ROW_H);
    bar.setAttribute('rx', '4');
    bar.setAttribute('fill', sport.accent);
    g.appendChild(bar);

    // start + end dots
    [x1, x2].forEach(cx => {
      const dot = document.createElementNS(svgNS, 'circle');
      dot.setAttribute('cx', cx); dot.setAttribute('cy', barY + ROW_H / 2);
      dot.setAttribute('r', '4'); dot.setAttribute('fill', sport.accent);
      dot.setAttribute('stroke', 'rgba(6,12,28,.8)'); dot.setAttribute('stroke-width', '1.5');
      g.appendChild(dot);
    });

    // years label — INSIDE or just after bar
    const yearsLbl = document.createElementNS(svgNS, 'text');
    const midX = (x1 + x2) / 2;
    const afterX = x2 + 7;
    // if bar wide enough for interior label, put it inside, else after
    const insideOk = barW > 60;
    yearsLbl.setAttribute('x', insideOk ? midX : afterX);
    yearsLbl.setAttribute('y', barY + ROW_H / 2 + 3.5);
    yearsLbl.setAttribute('text-anchor', insideOk ? 'middle' : 'start');
    yearsLbl.setAttribute('fill', insideOk ? 'rgba(0,0,0,.65)' : `${sport.accent}cc`);
    yearsLbl.setAttribute('font-size', '7.5');
    yearsLbl.setAttribute('font-weight', '800');
    yearsLbl.setAttribute('letter-spacing', '.04em');
    yearsLbl.textContent = range.start === range.end
      ? `${range.start}`
      : `${range.start} – ${range.end}`;
    g.appendChild(yearsLbl);

    g.addEventListener('click', () => goTo(i));
    tlSvg.appendChild(g);
    tlBarEls.push(g);
  });

  // active marker line (dashed vertical, moves to active sport)
  const activeMarker = document.createElementNS(svgNS, 'line');
  activeMarker.setAttribute('y1', PAD_TOP);
  activeMarker.setAttribute('y2', AXIS_Y + 4);
  activeMarker.setAttribute('stroke', '#fff');
  activeMarker.setAttribute('stroke-width', '1.5');
  activeMarker.setAttribute('stroke-dasharray', '3,3');
  activeMarker.setAttribute('opacity', '.25');
  tlSvg.appendChild(activeMarker);

  tlWrap.appendChild(tlSvg);


  // dots + nav
  const dotsEl = document.createElement('div'); dotsEl.className = 'fsb2-dots';
  dotsEl.style.display = 'none'; // hide dots — timeline replaces them

  const nav = document.createElement('div'); nav.className = 'fsb2-nav';
  const prev = document.createElement('button'); prev.className = 'fsb2-btn'; prev.innerHTML = '← Previous';
  const ctr  = document.createElement('div');   ctr.className  = 'fsb2-counter';
  const next = document.createElement('button'); next.className = 'fsb2-btn'; next.innerHTML = 'Next →';
  nav.append(prev, ctr, next);

  host.appendChild(tlWrap);
  host.appendChild(wrapper);
  host.appendChild(nav);

  let cur = 0;

  function goTo(i) {
    if (i === cur) return;
    stages[cur].style.display = 'none';
    cur = i;
    stages[cur].style.display = 'grid';
    updateUI();
  }

  function updateUI() {
    ctr.textContent = `${cur + 1} / ${SPORTS.length}`;
    prev.disabled = cur === 0;
    next.disabled = cur === SPORTS.length - 1;

    // Highlight active bar in timeline
    tlBarEls.forEach((g, i) => {
      const isActive = i === cur;
      g.setAttribute('opacity', isActive ? '1' : '0.32');
      // highlight the bar rect
      const barRect = g.querySelectorAll('rect')[2]; // [0]=hit,[1]=bgTrack,[2]=bar
      if (barRect) {
        barRect.setAttribute('filter', isActive
          ? `drop-shadow(0 0 5px ${SPORTS[i].accent})`
          : 'none');
      }
      // bold the name label when active
      const nameLbl = g.querySelector('text');
      if (nameLbl) {
        nameLbl.setAttribute('font-size', isActive ? '10' : '9');
        nameLbl.setAttribute('opacity', isActive ? '1' : '0.7');
      }
    });

    // Move dashed cursor line to midpoint of active sport's bar
    const range = SPORT_RANGES[cur];
    const x1 = yearToX(range.start);
    const x2 = yearToX(range.end === range.start ? range.end + 3 : range.end);
    const midX = (x1 + x2) / 2;
    activeMarker.setAttribute('x1', midX);
    activeMarker.setAttribute('x2', midX);
  }

  prev.addEventListener('click', () => goTo(cur - 1));
  next.addEventListener('click', () => goTo(cur + 1));
  document.addEventListener('keydown', e => {
    const sec = document.getElementById('forgottenSportsSection')?.getBoundingClientRect();
    if (!sec || sec.top > window.innerHeight || sec.bottom < 0) return;
    if (e.key === 'ArrowRight') goTo(Math.min(cur + 1, SPORTS.length - 1));
    if (e.key === 'ArrowLeft')  goTo(Math.max(cur - 1, 0));
  });

  stages[0].style.display = 'grid';
  updateUI();
})();