/* viz6_trivia.js
 * 75 Olympic trivia questions — 10 randomly selected each session
 * Source: Today.com · Sarah Lemire · "75 Olympic Trivia Questions That Bring Home the Gold" (Feb 2026)
 *
 * Data format (space-efficient flat array):
 *   [ question, correct_answer, wrong1, wrong2, wrong3, emoji_category ]
 */
(function () {

  // ── All 75 Q&A pairs ──────────────────────────────────────────────────────
  // Each entry: [question, correct_answer, wrong1, wrong2, wrong3, emoji]
  const ALL = [
    // History & Host Cities
    ['Where were the first ancient Olympic Games hosted in 776 BC?','Olympia, Greece','Athens, Greece','Sparta, Greece','Corinth, Greece','🏛️'],
    ['The first modern-day Olympic Games were held in 1896 in what Greek city?','Athens','Olympia','Sparta','Thessaloniki','🏛️'],
    ['What was the first U.S. city and state to host the Olympics?','St. Louis, Missouri','Chicago, Illinois','New York, New York','Boston, Massachusetts','🗺️'],
    ['Which country was the first to host the Summer and Winter Games in the same year?','France (1924)','Switzerland (1928)','United States (1932)','Germany (1936)','🌍'],
    ['Where were the first Olympic Winter Games held in 1924?','Chamonix, France','Oslo, Norway','Innsbruck, Austria','Lake Placid, USA','❄️'],
    ['Which country has hosted the Summer Olympic Games the most?','The United States','Great Britain','France','Australia','🗺️'],
    ['How many countries have hosted the Summer Olympic Games?','20','15','25','30','🌍'],
    ['Prior to Milan-Cortina 2026, how many cities had hosted the Winter Olympics?','21','18','24','16','❄️'],
    ['Including the 2026 Winter Games, how many Olympic Games have been hosted in Italy?','Four','Two','Three','Five','🇮🇹'],
    ['The 2028 Summer Games will be in Los Angeles. Where will the 2032 Olympics be hosted?','Brisbane, Australia','Tokyo, Japan','Paris, France','Cape Town, South Africa','🌏'],
    ['Where will the 2028 Summer Olympic Games take place?','Los Angeles','New York','Chicago','San Francisco','🌆'],
    ['Los Angeles has hosted the Olympics twice. Which two years?','1932 and 1984','1924 and 1956','1936 and 1972','1948 and 1980','📅'],
    ['According to Guinness World Records, which Olympics drew the largest TV audience in history?','Beijing 2008 Summer Games','London 2012 Summer Games','Sydney 2000 Summer Games','Atlanta 1996 Summer Games','📺'],
    ['What international city holds the record for the hottest Olympic Games in history?','Tokyo','Atlanta','Athens','Los Angeles','🌡️'],
    // Athletes & Records
    ['With 28 medals, who is the most decorated Olympian of all time?','Michael Phelps','Larisa Latynina','Usain Bolt','Simone Biles','🏊'],
    ['With 18 medals, who is the most decorated female Olympian of all time?','Soviet gymnast Larisa Latynina','Birgit Fischer','Jenny Thompson','Dara Torres','🤸'],
    ['Which athlete holds the longest-standing Olympic record in history?','Bob Beamon for his 1968 long jump','Carl Lewis for his 1984 sprint','Jesse Owens for his 1936 relay','Nadia Comaneci for her 1976 gymnastics','📏'],
    ['Who is the only person to ever win gold medals in different sports at the Summer and Winter Olympics?','Eddie Eagan (bobsled and boxing)','Eric Heiden (speed skating and cycling)','Jim Thorpe (decathlon and pentathlon)','Rafer Johnson (decathlon and rowing)','🏅'],
    ['What female athlete holds the record for the most gold medals won in a single Olympics?','German swimmer Kristin Otto','Janet Evans','Natalie Coughlin','Katie Ledecky','🥇'],
    ['Who is the youngest female athlete to win an individual Olympic medal?','Inge Sorensen, 12 (breaststroke, 1936)','Fu Mingxia, 13 (diving, 1992)','Nadia Comaneci, 14 (gymnastics, 1976)','Marjorie Gestring, 13 (diving, 1936)','🧒'],
    ['Who is the youngest male athlete to win an individual Olympic medal?','Nils Skoglund, 14 (diving, 1920)','Peter Pan, 13 (gymnastics, 1952)','Klaus Zerta, 13 (rowing, 1960)','Dae-Hoon Lee, 15 (taekwondo, 2004)','🧒'],
    ['Who is the oldest male athlete to win an Olympic gold medal?','Oscar Swahn, 72 (shooting, 1920)','Francis Bare, 68 (shooting, 1904)','Josh Millner, 61 (shooting, 1908)','John Quincy Adams Ward, 59 (art, 1932)','👴'],
    ['Who is the oldest female athlete to win an Olympic gold medal?','Eliza Pollock, 63 (archery, 1904)','Sybil Newall, 53 (archery, 1908)','Charlotte Cooper, 38 (tennis, 1908)','Lida Peyton Scott, 47 (art, 1936)','👵'],
    ['What Canadian equestrian holds the record for most Olympic appearances?','Ian Millar with 10','Eric Lamaze with 8','Gail Greenough with 6','Mac Cone with 7','🏇'],
    ['This Jamaican athlete holds the record for being the fastest man in history.','Usain Bolt','Asafa Powell','Yohan Blake','Frankie Fredericks','⚡'],
    // Gymnastics
    ['At 14, what Romanian gymnast scored seven perfect 10.0\'s at the 1976 Olympics?','Nadia Comaneci','Olga Korbut','Larisa Latynina','Mary Lou Retton','🤸'],
    ['With seven Olympic medals and 30 World Championship medals, who is one of the most decorated gymnasts of all time?','Simone Biles','Larisa Latynina','Nadia Comaneci','Shannon Miller','🤸'],
    ['Which U.S. gymnast memorably injured her ankle vaulting but still won gold for Team USA in 1996?','Kerri Strug','Shannon Miller','Dominique Dawes','Mary Lou Retton','🩹'],
    ['Known as "America\'s sweetheart," this gymnast took home five medals at the 1984 LA Summer Games.','Mary-Lou Retton','Simone Biles','Gabby Douglas','Nastia Liukin','🤸'],
    // Swimming
    ['After winning five Olympic gold medals, swimmer Johnny Weissmuller starred as what iconic character?','Tarzan','Superman','Robin Hood','Zorro','🎬'],
    ['At 15, what iconic swimmer debuted at London 2012 and has won 14 Olympic medals?','Katie Ledecky','Natalie Coughlin','Missy Franklin','Rebecca Adlington','🏊'],
    ['This American diver won double gold medals in diving at the 1984 Los Angeles Games.','Greg Louganis','Bob Webster','Bob Clotworthy','Sammy Lee','🤿'],
    // Track & Field
    ['This athlete won four gold medals in Berlin 1936 and helped set a new world relay record.','Jesse Owens','Carl Lewis','Harold Abrahams','Ralph Metcalfe','🏃'],
    ['Twin brothers Pavol and Peter Hochschorner of Slovakia won three consecutive gold medals (2000–2008) in what sport?','Canoeing','Rowing','Kayaking','Sailing','🛶'],
    // Figure Skating / Winter
    ['What is the oldest Winter Olympic sport?','Figure skating','Ice hockey','Ski jumping','Speed skating','⛸️'],
    ['Which Winter Games hosted the historic "Miracle on Ice" hockey game in 1980?','Lake Placid','Innsbruck','Sarajevo','Calgary','🏒'],
    ['A hare, polar bear and snow leopard were all mascots at which Winter Olympic Games?','Sochi 2014','Vancouver 2010','Turin 2006','Salt Lake City 2002','🐻'],
    ['Known for his backflip on ice, what figure skater won gold at Lake Placid 1980?','Scott Hamilton','Brian Boitano','John Curry','Robin Cousins','⛸️'],
    ['What figure skater is the most decorated in U.S. history?','Michelle Kwan','Tara Lipinski','Dorothy Hamill','Kristi Yamaguchi','⛸️'],
    ['In 1988, a four-man bobsleigh team from this tropical country debuted at Calgary.','Jamaica','Brazil','Cuba','Trinidad and Tobago','🛷'],
    ['What do Johnny Weir, Brian Boitano and Nathan Chen have in common?','They have all medaled in men\'s figure skating','They all won Olympic gold','They all trained in Colorado','They all competed at the same Olympics','⛸️'],
    ['Earning 15 Olympic medals, Marit Bjørgen is the most decorated Winter Olympian. In what sport?','Cross-country skiing','Biathlon','Speed skating','Alpine skiing','⛷️'],
    ['Who is the oldest woman to ever win an Alpine skiing medal?','Lindsey Vonn','Mikaela Shiffrin','Picabo Street','Annemarie Moser-Pröll','⛷️'],
    ['What sport challenges athletes to climb a mountain on skis, then descend?','Ski mountaineering (skimo)','Alpine skiing','Nordic combined','Biathlon','⛷️'],
    // Politics & History
    ['Which U.S. president opened the 1984 Olympics in Los Angeles?','Ronald Reagan','Jimmy Carter','George H.W. Bush','Gerald Ford','🇺🇸'],
    ['What year did the U.S. boycott the Summer Olympics in Moscow?','1980','1984','1976','1972','🚫'],
    ['In July of 1996, what renowned athlete lit the Olympic torch for the Atlanta Summer Olympics?','Muhammad Ali','Jesse Owens','Carl Lewis','Evander Holyfield','🔥'],
    ['Which modern Olympics were the first to use the Olympic Torch Relay?','Berlin 1936 Games','London 1908 Games','Paris 1924 Games','Amsterdam 1928 Games','🔥'],
    ['Which Olympic Games were the first to be televised?','Berlin 1936','London 1948','Helsinki 1952','Melbourne 1956','📺'],
    // Women in the Olympics
    ['What year were women first permitted to compete in the Olympic Games?','1900','1896','1924','1912','♀️'],
    ['What five sports were women allowed in during the 1900 Paris Olympics?','Tennis, sailing, croquet, golf and equestrianism','Swimming, cycling, archery, tennis and rowing','Athletics, gymnastics, fencing, shooting and golf','Croquet, lawn tennis, golf, polo and cycling','♀️'],
    ['Who was the first female Olympian to win a gold medal?','Hélène de Pourtalès for sailing','Charlotte Cooper for tennis','Margaret Abbott for golf','Ray Ewry for track','♀️'],
    ['Who was the first female American to win a gold medal at the games?','Margaret Abbott for golf','Ray Ewry','Charlotte Cooper','Alice Milliat','🇺🇸'],
    // Olympic Facts & Symbols
    ['What are the five colors of the Olympic Rings?','Blue, yellow, black, green and red','Blue, white, red, gold and green','Red, yellow, blue, orange and black','Green, blue, purple, gold and white','⭕'],
    ['What are the five rings intended to represent?','The five parts of the world','The five original Olympic sports','The five founding nations','The five Olympic values','🌍'],
    ['True or false: In Ancient Greek times, Olympic athletes competed naked.','True','False','Only in running events','Only in wrestling','🏛️'],
    ['During Olympic opening ceremonies, the processional of athletes behind their flags is known as what?','The Parade of Nations','The Opening March','The Flag Ceremony','The Athletes\' Procession','🏳️'],
    ['How many sports were represented in the 2024 Summer Olympic Games?','32','28','36','40','🎽'],
    ['The 2026 Winter Olympics will take place in which two Italian cities?','Milan and Cortina d\'Ampezzo','Rome and Turin','Venice and Trieste','Florence and Bologna','🇮🇹'],
    // Basketball
    ['How many gold medals has Team USA won in basketball?','27 (men 17, women 10)','20 (men 13, women 7)','32 (men 18, women 14)','24 (men 14, women 10)','🏀'],
    ['Which University of Connecticut basketball coach led the U.S. women\'s team to gold in 2012 and 2016?','Geno Auriemma','Pat Summitt','Tara VanDerveer','Cheryl Reeve','🏀'],
    // Tennis
    ['How many Olympic medals has tennis player Venus Williams won?','Five','Three','Four','Six','🎾'],
    ['How many Olympic medals has tennis player Serena Williams won?','Four','Three','Five','Six','🎾'],
    // Celebrity & Pop Culture
    ['What "Beetlejuice" actor competed in the 1999 U.S. Olympic archery trials, narrowly missing Team USA?','Geena Davis','Sigourney Weaver','Jamie Lee Curtis','Brooke Shields','🎬'],
    ['In 2016, mother-and-son duo Nino Salukvadze and Tsotne Machavariani competed together in what sport?','Shooting','Judo','Archery','Fencing','🎯'],
    ['The first Great Britain diver to win four Olympic medals, Tom Daley is also known for what hobby?','Knitting','Painting','Cooking','Chess','🧶'],
    ['Nicknamed "Wiggo," this British cyclist won both the Tour de France and Olympic gold in 2012.','Bradley Wiggins','Chris Froome','Mark Cavendish','Geraint Thomas','🚴'],
    // Snowboarding
    ['Who holds the record for most Olympic gold medals by a snowboarder?','Shaun White','Chloe Kim','Ayumu Hirano','Ross Powers','🏂'],
    // "Twizzling"
    ['"Twizzling" is the signature technical skill in what Olympic sport?','Ice dancing','Rhythmic gymnastics','Figure skating singles','Synchronized swimming','💃'],
    // Forgotten / Fun
    ['An Olympic sport through 1920, what game involves two teams pulling on a rope?','Tug-of-war','Rowing','Wrestling','Pulling sprint','🪢'],
    ['What sport will make its debut at the Los Angeles 2028 Games, originally a recreational sport for WWII soldiers?','Flag football','Beach volleyball','Breakdancing','Padel','🏈'],
    ['Skateboarding made its Olympic debut at which Games?','Tokyo 2020 (held in 2021)','Paris 2024','Rio 2016','London 2012','🛹'],
    ['Jagger Eaton took home bronze at Tokyo 2020 in what sport?','Skateboarding','BMX freestyle','Breaking','Surfing','🛹'],
    ['Which country has won the most Olympic gold medals overall?','The United States','Russia','China','Germany','🥇'],
  ];

  // ── Pick 10 random questions each session ─────────────────────────────────
  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // Convert flat array entry to question object with shuffled options
  function toQuestion(row) {
    const [q, correct, w1, w2, w3, emoji] = row;
    // Build options array and shuffle it, tracking where correct answer lands
    const opts = shuffle([correct, w1, w2, w3]);
    return {
      q, emoji,
      options: opts,
      answer: opts.indexOf(correct),
      fact: `✅ The correct answer is: ${correct}`,
    };
  }

  function getRandomQuestions(n = 10) {
    return shuffle(ALL).slice(0, n).map(toQuestion);
  }

  /* ── CSS ─────────────────────────────────────────────────────────────────── */
  const styleEl = document.createElement('style');
  styleEl.textContent = `
    #olympicsTrivia {
      max-width: 100%;
      margin: 0;
      font-family: 'Lora', Georgia, serif;
    }
    .qt-shell {
      position: relative; overflow: hidden;
      padding: 28px 32px 32px;
      border-radius: 32px;
      background: linear-gradient(180deg, rgba(8,10,21,.94) 0%, rgba(28,20,30,.82) 100%);
      box-shadow: 0 28px 60px rgba(0,0,0,.36), inset 0 1px 0 rgba(255,255,255,.08);
    }
    .qt-shell::before {
      content: ''; position: absolute; inset: 0; pointer-events: none; opacity: .85;
      background:
        radial-gradient(circle at 50% 18%, rgba(117,164,255,.2), transparent 30%),
        radial-gradient(circle at 18% 78%, rgba(59,130,246,.22), transparent 28%),
        radial-gradient(circle at 82% 74%, rgba(239,68,68,.18), transparent 28%);
    }
    .qt-inner {
      position: relative; z-index: 1;
      width: 100%;
    }
    .qt-scorebar {
      display: flex; align-items: center; gap: 14px;
      padding: 16px 24px;
      background: rgba(30,24,10,.75);
      border-radius: 16px;
      border: 1px solid rgba(200,200,200,.2);
      margin-bottom: 20px;
    }
    .qt-score-label { font-size: 11px; font-weight: 700; letter-spacing: .15em; text-transform: uppercase; color: rgba(200,200,200,.5); }
    .qt-score-val { font-family: 'Playfair Display', serif; font-size: 22px; font-weight: 900; color: #c8c8c8; }
    .qt-progress-bar { height: 5px; background: rgba(200,200,200,.12); border-radius: 999px; overflow: hidden; flex: 1; margin: 0 16px; }
    .qt-progress-fill { height: 100%; background: linear-gradient(90deg,#c8c8c8,#e8e8e8); border-radius: 999px; transition: width .5s ease; }
    .qt-card {
      background: linear-gradient(155deg, rgba(16,18,22,.96) 0%, rgba(12,13,16,.98) 100%);
      border: 1px solid rgba(200,200,200,.18);
      border-radius: 24px;
      padding: 36px 44px 32px;
      box-shadow: 0 12px 40px rgba(0,0,0,.45), inset 0 1px 0 rgba(200,200,200,.08);
    }
    .qt-qnum { font-size: 10px; font-weight: 800; letter-spacing: .2em; text-transform: uppercase; color: rgba(200,200,200,.5); margin-bottom: 10px; }
    .qt-emoji { font-size: 46px; line-height: 1; margin-bottom: 12px; display: block; }
    .qt-question { font-family: 'Playfair Display', Georgia, serif; font-size: 24px; font-weight: 800; color: #f1f5f9; line-height: 1.4; margin: 0 0 26px; }
    .qt-options { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 22px; }
    @media (max-width: 600px) { .qt-options { grid-template-columns: 1fr; } }
    .qt-opt {
      appearance: none; border: 1.5px solid rgba(200,200,200,.18); background: rgba(22,24,28,.7); color: #e8d8a0;
      padding: 16px 22px; border-radius: 14px; font-family: 'Lora', Georgia, serif; font-size: 15px;
      font-weight: 600; cursor: pointer; text-align: left; transition: all .2s; line-height: 1.4;
      display: flex; align-items: center; gap: 12px;
    }
    .qt-opt:hover:not(:disabled) { border-color: rgba(200,200,200,.5); background: rgba(200,200,200,.12); color: #fff8e0; transform: translateY(-2px); }
    .qt-opt .qt-opt-letter { width: 28px; height: 28px; border-radius: 50%; background: rgba(200,200,200,.12); border: 1px solid rgba(200,200,200,.25); display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 900; flex-shrink: 0; color: #c8c8c8; transition: all .2s; }
    .qt-opt.correct { border-color: rgba(34,197,94,.6); background: rgba(34,197,94,.15); color: #bbf7d0; }
    .qt-opt.correct .qt-opt-letter { background: rgba(34,197,94,.25); border-color: rgba(34,197,94,.5); color: #86efac; }
    .qt-opt.wrong { border-color: rgba(239,68,68,.5); background: rgba(239,68,68,.12); color: #fecaca; opacity: .7; }
    .qt-opt.wrong .qt-opt-letter { background: rgba(239,68,68,.2); border-color: rgba(239,68,68,.4); color: #f87171; }
    .qt-opt:disabled { cursor: default; }
    .qt-feedback { border-radius: 12px; padding: 13px 17px; font-size: 13.5px; line-height: 1.55; margin-bottom: 16px; display: none; }
    .qt-feedback.correct { background: rgba(34,197,94,.12); border: 1px solid rgba(34,197,94,.28); color: #bbf7d0; display: block; }
    .qt-feedback.wrong { background: rgba(239,68,68,.1); border: 1px solid rgba(239,68,68,.25); color: #fecaca; display: block; }
    .qt-feedback strong { display: block; margin-bottom: 4px; font-size: 14px; }
    .qt-next { appearance: none; border: 1px solid rgba(200,200,200,.35); background: rgba(200,200,200,.14); color: #c8c8c8; padding: 12px 32px; border-radius: 999px; font-family: 'Lora', Georgia, serif; font-size: 14px; font-weight: 700; cursor: pointer; transition: all .22s; display: none; }
    .qt-next.visible { display: inline-flex; align-items: center; gap: 7px; }
    .qt-next:hover { background: rgba(200,200,200,.24); transform: translateY(-1px); }
    .qt-results { text-align: center; padding: 36px 24px; }
    .qt-results-trophy { font-size: 64px; line-height: 1; margin-bottom: 14px; }
    .qt-results-score { font-family: 'Playfair Display', serif; font-size: 52px; font-weight: 900; color: #c8c8c8; line-height: 1; margin-bottom: 6px; }
    .qt-results-label { font-size: 14px; color: rgba(148,163,184,.7); margin-bottom: 22px; }
    .qt-results-msg { font-size: 17px; line-height: 1.6; color: #e2e8f0; max-width: 420px; margin: 0 auto 26px; }
    .qt-restart { appearance: none; border: 1.5px solid rgba(200,200,200,.4); background: rgba(200,200,200,.12); color: #c8c8c8; padding: 13px 32px; border-radius: 999px; font-family: 'Lora', Georgia, serif; font-size: 15px; font-weight: 700; cursor: pointer; transition: all .22s; }
    .qt-restart:hover { background: rgba(200,200,200,.22); transform: translateY(-2px); }
    .qt-source { font-size: 10px; color: rgba(148,163,184,.3); text-align: center; margin-top: 14px; font-style: italic; }
  `;
  document.head.appendChild(styleEl);

  const host = document.getElementById('olympicsTrivia');
  if (!host) return;

  const LETTERS = ['A', 'B', 'C', 'D'];

  function resultMessage(score, total) {
    const pct = score / total;
    if (pct === 1)   return { trophy: '🥇', msg: 'Perfect score! You\'re a true Olympic champion. Even Michael Phelps would be impressed.' };
    if (pct >= 0.8)  return { trophy: '🥈', msg: 'Olympic-level knowledge! You clearly follow the Games closely.' };
    if (pct >= 0.6)  return { trophy: '🥉', msg: 'Bronze-medal effort! You know the big names and key moments.' };
    if (pct >= 0.4)  return { trophy: '🎽', msg: 'Solid start — scroll back up through the visualizations for a refresher!' };
    return { trophy: '📚', msg: 'Time to hit the books — the Olympics have a rich history worth exploring!' };
  }

  function render() {
    const QUESTIONS = getRandomQuestions(10);
    let qIdx = 0, score = 0;
    host.innerHTML = '';

    const shell = document.createElement('div');
    shell.className = 'qt-shell';
    const inner = document.createElement('div');
    inner.className = 'qt-inner';
    shell.appendChild(inner);
    host.appendChild(shell);

    // Score bar
    const scorebar = document.createElement('div');
    scorebar.className = 'qt-scorebar';
    scorebar.innerHTML = `
      <div><div class="qt-score-label">Score</div><div class="qt-score-val" id="qt-score-display">0 / 10</div></div>
      <div class="qt-progress-bar"><div class="qt-progress-fill" id="qt-prog" style="width:0%"></div></div>
      <div><div class="qt-score-label">Question</div><div class="qt-score-val" id="qt-qnum-display">1 / 10</div></div>`;
    inner.appendChild(scorebar);

    const card = document.createElement('div');
    card.className = 'qt-card';
    inner.appendChild(card);

    const src = document.createElement('p');
    src.className = 'qt-source';
    src.textContent = 'Source: Today.com · Sarah Lemire · "75 Olympic Trivia Questions That Bring Home the Gold" (Feb 2026) · 10 random questions per session';
    inner.appendChild(src);

    function showQuestion(i) {
      const q = QUESTIONS[i];
      card.innerHTML = `
        <div class="qt-qnum">Question ${i + 1} of 10</div>
        <span class="qt-emoji">${q.emoji}</span>
        <p class="qt-question">${q.q}</p>
        <div class="qt-options">
          ${q.options.map((opt, oi) =>
            `<button class="qt-opt" data-idx="${oi}" type="button">
              <span class="qt-opt-letter">${LETTERS[oi]}</span>
              <span>${opt}</span>
            </button>`
          ).join('')}
        </div>
        <div class="qt-feedback" id="qt-fb"></div>
        <button class="qt-next" id="qt-next" type="button">
          ${i < 9 ? 'Next Question →' : 'See Results 🏆'}
        </button>`;

      card.querySelectorAll('.qt-opt').forEach(btn => {
        btn.addEventListener('click', () => {
          if (card.querySelector('.qt-opt.correct')) return;
          const chosen = parseInt(btn.dataset.idx, 10);
          const isRight = chosen === q.answer;
          if (isRight) score++;

          card.querySelectorAll('.qt-opt').forEach(b => {
            b.disabled = true;
            const bi = parseInt(b.dataset.idx, 10);
            if (bi === q.answer) b.classList.add('correct');
            else if (bi === chosen && !isRight) b.classList.add('wrong');
          });

          const fb = document.getElementById('qt-fb');
          if (isRight) {
            fb.className = 'qt-feedback correct';
            fb.innerHTML = `<strong>✅ Correct!</strong>${q.fact.replace('✅ The correct answer is: ', '')}`;
          } else {
            fb.className = 'qt-feedback wrong';
            fb.innerHTML = `<strong>❌ Not quite!</strong>${q.fact}`;
          }

          document.getElementById('qt-score-display').textContent = `${score} / 10`;
          document.getElementById('qt-prog').style.width = `${((i + 1) / 10) * 100}%`;
          document.getElementById('qt-qnum-display').textContent = `${i + 1} / 10`;
          document.getElementById('qt-next').classList.add('visible');
        });
      });

      document.getElementById('qt-next').addEventListener('click', () => {
        if (qIdx < 9) { qIdx++; showQuestion(qIdx); }
        else showResults();
      });
    }

    function showResults() {
      const { trophy, msg } = resultMessage(score, 10);
      card.innerHTML = `
        <div class="qt-results">
          <div class="qt-results-trophy">${trophy}</div>
          <div class="qt-results-score">${score}/10</div>
          <div class="qt-results-label">correct answers</div>
          <p class="qt-results-msg">${msg}</p>
          <button class="qt-restart" id="qt-restart" type="button">🔄 New Random Quiz</button>
        </div>`;
      document.getElementById('qt-prog').style.width = '100%';
      document.getElementById('qt-restart').addEventListener('click', render);
    }

    showQuestion(0);
  }

  render();
})();