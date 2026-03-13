/* viz1_dominance.js
 * Fixes: labels behind bars (transparent WebGL canvas), dynamic color key,
 *        CHN pink silver, dimmed country opacity ~0.22, 2D legend updates too
 */

function renderDominance(rawData) {
  const container = document.getElementById('viz1');
  if (!container) return;
  if (container._cleanupAll) container._cleanupAll();
  container.innerHTML = '';
  container.style.position = 'relative';
  container.style.background = '#fff8ec'; // cream so transparent WebGL looks right

  /* ── card ────────────────────────────────────────────────── */
  const card = container.closest('.viz-card,.card,section') || container.parentElement;
  if (card) {
    card.style.background = 'linear-gradient(160deg,#fffdf7 0%,#fff9ee 60%,#fef4e0 100%)';
    card.style.border      = '1.5px solid rgba(190,145,60,.22)';
    card.style.boxShadow   = '0 12px 48px rgba(160,110,30,.12)';
  }

  /* ── data ────────────────────────────────────────────────── */
  const YEARS  = [1984,1988,1992,1996,2000,2004,2008,2012,2016,2020,2024];
  const SPORTS = ['Swimming','Athletics','Gymnastics','Diving','Shooting',
                  'Weightlifting','Table Tennis','Boxing','Badminton','Wrestling'];
  const SPORT_SHORT = ['Swim','Athl.','Gymn.','Diving','Shoot.',
                       'Wlift.','Tbl.T.','Boxing','Badm.','Wrest.'];
  const SPORT_LOOKUP = {
    'Swimming':'Swimming','Athletics':'Athletics',
    'Artistic Gymnastics':'Gymnastics','Gymnastics':'Gymnastics',
    'Diving':'Diving','Shooting':'Shooting','Weightlifting':'Weightlifting',
    'Table Tennis':'Table Tennis','Boxing':'Boxing',
    'Badminton':'Badminton','Wrestling':'Wrestling'
  };
  const NS=SPORTS.length, NY=YEARS.length;

  const grid={};
  YEARS.forEach(y=>{grid[y]={};SPORTS.forEach(s=>{grid[y][s]={USA:{G:0,S:0,B:0},CHN:{G:0,S:0,B:0}};});});
  const seen=new Set();
  for(const d of rawData){
    if(d.Season!=='Summer'||!['USA','CHN'].includes(d.NOC)||!['Gold','Silver','Bronze'].includes(d.Medal)) continue;
    const k=`${d.Year}|${d.NOC}|${d.Sport}|${d.Event}|${d.Medal}`;
    if(seen.has(k)) continue; seen.add(k);
    const yr=+d.Year; if(!YEARS.includes(yr)) continue;
    const sl=SPORT_LOOKUP[d.Sport]; if(!sl) continue;
    grid[yr][sl][d.NOC][d.Medal[0]]++;
  }
  let maxVal=1;
  YEARS.forEach(y=>SPORTS.forEach(s=>['USA','CHN'].forEach(n=>{
    const t=grid[y][s][n].G+grid[y][s][n].S+grid[y][s][n].B; if(t>maxVal)maxVal=t;
  })));

  /* ── colours — defined once, used everywhere ─────────────── */
  const COL3D = {
    USA:{ G:0xc89010, S:0x2a6fd4, B:0x1040a8 },
    CHN:{ G:0xd4a000, S:0xd460a0, B:0x8a0808 }  // CHN silver = pink
  };
  const COL2D = {
    USA:{ G:'#c89010', S:'#2a6fd4', B:'#1040a8' },
    CHN:{ G:'#d4a000', S:'#d460a0', B:'#8a0808' }
  };
  // Legend content per perspective
  const LEGEND_HTML = {
    usa: `<div style="font-weight:700;font-size:10px;letter-spacing:.06em;color:#7a4a10;margin-bottom:4px">🇺🇸 USA MEDAL COLOURS</div>
<div><span style="display:inline-block;width:11px;height:11px;background:#c89010;border-radius:2px;vertical-align:middle;margin-right:5px"></span>Gold</div>
<div><span style="display:inline-block;width:11px;height:11px;background:#2a6fd4;border-radius:2px;vertical-align:middle;margin-right:5px"></span>Silver</div>
<div><span style="display:inline-block;width:11px;height:11px;background:#1040a8;border-radius:2px;vertical-align:middle;margin-right:5px"></span>Bronze</div>`,
    china: `<div style="font-weight:700;font-size:10px;letter-spacing:.06em;color:#8a1a1a;margin-bottom:4px">🇨🇳 CHINA MEDAL COLOURS</div>
<div><span style="display:inline-block;width:11px;height:11px;background:#d4a000;border-radius:2px;vertical-align:middle;margin-right:5px"></span>Gold</div>
<div><span style="display:inline-block;width:11px;height:11px;background:#d460a0;border-radius:2px;vertical-align:middle;margin-right:5px"></span>Silver</div>
<div><span style="display:inline-block;width:11px;height:11px;background:#8a0808;border-radius:2px;vertical-align:middle;margin-right:5px"></span>Bronze</div>`
  };

  /* ── state ───────────────────────────────────────────────── */
  let mode3d=true, perspective='usa', filterYear='all', autoRotate=true;

  /* ── toolbar ──────────────────────────────────────────────── */
  const PILL = 'appearance:none;cursor:pointer;font-family:Lora,serif;font-size:12px;border-radius:20px;padding:5px 13px;transition:all .18s;border:1.5px solid rgba(150,100,30,.3);background:rgba(200,150,50,.08);color:#5a3210;';
  const PILL_A = 'appearance:none;cursor:pointer;font-family:Lora,serif;font-size:12px;border-radius:20px;padding:5px 13px;transition:all .18s;border:1.5px solid rgba(150,90,10,.65);background:rgba(200,140,30,.22);color:#2a0e00;font-weight:700;';

  const ctrlDiv=document.getElementById('viz1Controls');
  if(ctrlDiv){
    ctrlDiv.innerHTML='';
    ctrlDiv.style.cssText='display:flex;align-items:center;flex-wrap:wrap;gap:7px;padding:6px 0 10px;';
    const rotBtn=document.createElement('button'); rotBtn.id='v3dRotBtn'; rotBtn.textContent='⟳ Rotate View'; rotBtn.style.cssText=PILL_A; ctrlDiv.appendChild(rotBtn);
    const rstBtn=document.createElement('button'); rstBtn.id='v3dResetBtn'; rstBtn.textContent='⊙ Reset view'; rstBtn.style.cssText=PILL; ctrlDiv.appendChild(rstBtn);
    const sep=document.createElement('span'); sep.textContent='FILTER BY YEAR:'; sep.style.cssText='color:#8a5a20;font-size:12px;font-family:Lora,serif;font-weight:600;margin-left:4px;'; ctrlDiv.appendChild(sep);
    ['all',...YEARS].forEach(yr=>{
      const b=document.createElement('button'); b.textContent=yr==='all'?'All':yr; b.dataset.year=String(yr);
      b.style.cssText=yr==='all'?PILL_A:PILL; ctrlDiv.appendChild(b);
    });
    ctrlDiv.addEventListener('click',e=>{
      const p=e.target.closest('[data-year]'); if(!p) return;
      filterYear=p.dataset.year;
      ctrlDiv.querySelectorAll('[data-year]').forEach(b=>{b.style.cssText=b.dataset.year===filterYear?PILL_A:PILL;});
      applyYearFilter();
    });
  }

  /* ── floating mode button ────────────────────────────────── */
  const modeBtn=document.createElement('button');
  modeBtn.id='viz1ModeBtn';
  modeBtn.innerHTML='<span style="font-size:19px">📊</span><div style="font-size:10px;font-weight:700;letter-spacing:.05em;font-family:Lora,serif;margin-top:2px">2D View</div>';
  Object.assign(modeBtn.style,{position:'absolute',top:'10px',right:'10px',zIndex:'40',width:'68px',height:'58px',
    borderRadius:'13px',border:'1.5px solid rgba(170,120,30,.45)',cursor:'pointer',display:'flex',
    flexDirection:'column',alignItems:'center',justifyContent:'center',
    background:'linear-gradient(145deg,rgba(255,245,200,.95),rgba(255,225,140,.85))',color:'#5a3208',
    boxShadow:'0 4px 16px rgba(160,110,20,.22)',transition:'all .18s'});
  container.appendChild(modeBtn);

  /* ═══════════════════════════════════════════════════════════
     3-D MODE
  ═══════════════════════════════════════════════════════════ */
  let usaGroups=[], chnGroups=[], sph, syncCamera, renderer3d, legendEl=null, labelCvs=null, _cleanup3dFn=null;

  function build3D(){
    if(typeof THREE==='undefined'){console.error('Three.js not loaded');return;}
    container.style.height='545px';

    /* ── label canvas BELOW the WebGL canvas so bars are always on top ── */
    labelCvs=document.createElement('canvas');
    labelCvs.style.cssText='position:absolute;top:0;left:0;z-index:15;pointer-events:none;';
    labelCvs.width=container.clientWidth; labelCvs.height=480;
    container.insertBefore(labelCvs,modeBtn);
    const lctx=labelCvs.getContext('2d');

    /* ── WebGL renderer: alpha:true so it composites OVER the label canvas ── */
    renderer3d=new THREE.WebGLRenderer({antialias:true,alpha:true});
    renderer3d.setSize(container.clientWidth,480);
    renderer3d.setPixelRatio(Math.min(window.devicePixelRatio,2));
    renderer3d.shadowMap.enabled=true; renderer3d.shadowMap.type=THREE.PCFSoftShadowMap;
    renderer3d.toneMapping=THREE.ACESFilmicToneMapping; renderer3d.toneMappingExposure=1.05;
    renderer3d.setClearColor(0x000000,0); // transparent clear
    renderer3d.domElement.style.position='absolute';
    renderer3d.domElement.style.top='0'; renderer3d.domElement.style.left='0';
    renderer3d.domElement.style.zIndex='8'; // WebGL below label canvas
    renderer3d._running=true;
    container.insertBefore(renderer3d.domElement,modeBtn);

    const scene=new THREE.Scene();
    scene.background=null; // transparent
    scene.fog=new THREE.FogExp2(0xfff8ec,0.009);
    const W=container.clientWidth, H=480;
    const camera=new THREE.PerspectiveCamera(42,W/H,0.1,400);

    /* lights */
    scene.add(new THREE.AmbientLight(0xfff0d0,5.5));
    const sun=new THREE.DirectionalLight(0xffe8c0,4.0);
    sun.position.set(-22,42,28); sun.castShadow=true;
    sun.shadow.mapSize.width=2048; sun.shadow.mapSize.height=2048;
    sun.shadow.camera.left=-58; sun.shadow.camera.right=58;
    sun.shadow.camera.top=58;   sun.shadow.camera.bottom=-58;
    sun.shadow.camera.far=180;  sun.shadow.bias=-0.001;
    scene.add(sun);
    const fill=new THREE.DirectionalLight(0xffd0a0,1.8); fill.position.set(28,28,-18); scene.add(fill);
    const rim=new THREE.PointLight(0xffe0b0,2.2,82); rim.position.set(0,38,0); scene.add(rim);

    /* floor */
    const floor=new THREE.Mesh(new THREE.PlaneGeometry(105,82),
      new THREE.MeshStandardMaterial({color:0xfdecc8,roughness:.85,metalness:0}));
    floor.rotation.x=-Math.PI/2; floor.receiveShadow=true; scene.add(floor);
    const gridH=new THREE.GridHelper(105,42,0xe2c89a,0xecd8b0); gridH.position.y=0.02; scene.add(gridH);

    /* bars */
    const SS=4.1,YS=3.9,BW=1.12,PO=0.66;
    const sx=-(NS-1)*SS/2, sz=-(NY-1)*YS/2;
    const barsRoot=new THREE.Group(); scene.add(barsRoot);
    const allGrps=[], rayMesh=[], geoCache=new Map();
    usaGroups=[]; chnGroups=[];

    function boxG(h){const k=h.toFixed(3);if(!geoCache.has(k))geoCache.set(k,new THREE.BoxGeometry(BW,h,BW));return geoCache.get(k);}
    const eMatUSA=new THREE.LineBasicMaterial({color:0x1a3888,transparent:true,opacity:.18});
    const eMatCHN=new THREE.LineBasicMaterial({color:0x7a0808,transparent:true,opacity:.18});

    function buildBar(cx,cz,counts,isUSA,yi,si){
      const SC=18/maxVal,G=counts.G*SC,S=counts.S*SC,B=counts.B*SC;
      if(G+S+B<0.01) return null;
      const grp=new THREE.Group(); grp.position.set(cx,0,cz); grp.scale.y=0; grp._entry=yi*.12+si*.015;
      allGrps.push(grp); (isUSA?usaGroups:chnGroups).push(grp);
      const noc=isUSA?'USA':'CHN'; let yb=0;
      for(const [h,medal] of [[B,'B'],[S,'S'],[G,'G']]){
        if(h<.005){yb+=h;continue;}
        const geo=boxG(h);
        const mat=new THREE.MeshStandardMaterial({color:COL3D[noc][medal],roughness:.22,metalness:.80,
          emissive:0x000000,emissiveIntensity:.08,transparent:true,opacity:1});
        const mesh=new THREE.Mesh(geo,mat); mesh.position.y=yb+h/2; mesh.castShadow=true; mesh.receiveShadow=true;
        mesh._meta={noc,year:YEARS[yi],sport:SPORTS[si],G:counts.G,S:counts.S,B:counts.B,total:counts.G+counts.S+counts.B};
        grp.add(mesh); rayMesh.push(mesh);
        const el=new THREE.LineSegments(new THREE.EdgesGeometry(geo),isUSA?eMatUSA:eMatCHN);
        el.position.y=yb+h/2; grp.add(el); yb+=h;
      }
      return grp;
    }
    YEARS.forEach((yr,yi)=>SPORTS.forEach((sp,si)=>{
      const cx=sx+si*SS,cz=sz+yi*YS;
      const ub=buildBar(cx-PO,cz,grid[yr][sp].USA,true, yi,si);
      const cb=buildBar(cx+PO,cz,grid[yr][sp].CHN,false,yi,si);
      if(ub) barsRoot.add(ub); if(cb) barsRoot.add(cb);
    }));

    /* ── dynamic legend card ── */
    legendEl=document.createElement('div');
    legendEl.style.cssText='position:absolute;top:8px;left:10px;z-index:20;pointer-events:none;'+
      'background:rgba(255,248,235,.94);border:1px solid rgba(180,130,40,.28);border-radius:10px;'+
      'padding:8px 12px;font-family:Lora,serif;font-size:11.5px;color:#3a1e06;line-height:1.9;'+
      'box-shadow:0 2px 8px rgba(160,110,20,.12);min-width:130px;';
    legendEl.innerHTML=LEGEND_HTML[perspective];
    container.insertBefore(legendEl,modeBtn);

    /* ── projected label drawing (on canvas BELOW WebGL) ── */
    function drawLabels(){
      lctx.clearRect(0,0,labelCvs.width,labelCvs.height);
      const cw=labelCvs.width, ch=labelCvs.height;

      function drawTag(text,px,py,opts={}){
        const {align='center',color='#5a2e08',size=11,bg=true}=opts;
        lctx.save();
        lctx.font=`bold ${size}px "Lora",Georgia,serif`;
        lctx.textAlign=align; lctx.textBaseline='middle';
        const tw=lctx.measureText(text).width;
        const ox=align==='right'?-tw/2:align==='left'?tw/2:0;
        if(bg){
          // subtle pill background so text pops over the floor
          lctx.fillStyle='rgba(255,248,228,0.72)';
          lctx.beginPath();
          lctx.roundRect(px+ox-tw/2-4,py-8,tw+8,16,4);
          lctx.fill();
        }
        lctx.fillStyle=color;
        lctx.shadowColor='rgba(255,248,220,0.95)';
        lctx.shadowBlur=4;
        lctx.fillText(text,px,py);
        lctx.restore();
      }

      // Sport names — projected from front edge of each column
      SPORTS.forEach((sp,si)=>{
        const v=new THREE.Vector3(sx+si*SS, 0.05, sz-YS*1.1).project(camera);
        const px=(v.x+1)/2*cw, py=(-v.y+1)/2*ch;
        if(v.z>1||px<-20||px>cw+20||py<0||py>ch+10) return;
        drawTag(SPORT_SHORT[si],px,py,{color:'#6a3808'});
      });

      // Year labels — projected from left edge of each row
      YEARS.forEach((yr,yi)=>{
        const v=new THREE.Vector3(sx-SS*1.2, 0.05, sz+yi*YS).project(camera);
        const px=(v.x+1)/2*cw, py=(-v.y+1)/2*ch;
        if(v.z>1||px<-30||px>cw+30||py<0||py>ch) return;
        drawTag(String(yr),px,py,{color:'#8a4c18',size:10.5,align:'right'});
      });
    }

    /* orbit */
    sph={theta:.24,phi:.74,r:56};
    const TARGET=new THREE.Vector3(0,4,0);
    syncCamera=()=>{
      const sinP=Math.sin(sph.phi);
      camera.position.set(TARGET.x+sph.r*sinP*Math.sin(sph.theta),TARGET.y+sph.r*Math.cos(sph.phi),TARGET.z+sph.r*sinP*Math.cos(sph.theta));
      camera.lookAt(TARGET);
    };
    syncCamera();

    let isDragging=false,lmx=0,lmy=0;
    const cvs=renderer3d.domElement; cvs.style.cursor='grab';
    cvs.addEventListener('mousedown',e=>{isDragging=true;autoRotate=false;lmx=e.clientX;lmy=e.clientY;cvs.style.cursor='grabbing';});
    const _mm=e=>{if(!isDragging)return;sph.theta-=(e.clientX-lmx)*.007;sph.phi=Math.max(.18,Math.min(1.42,sph.phi+(e.clientY-lmy)*.006));lmx=e.clientX;lmy=e.clientY;syncCamera();};
    const _mu=()=>{isDragging=false;cvs.style.cursor='grab';};
    window.addEventListener('mousemove',_mm); window.addEventListener('mouseup',_mu);
    cvs.addEventListener('wheel',e=>{e.preventDefault();sph.r=Math.max(14,Math.min(110,sph.r+e.deltaY*.05));syncCamera();},{passive:false});

    /* raycaster */
    const ray=new THREE.Raycaster(),m2=new THREE.Vector2();let hov=null;
    cvs.addEventListener('mousemove',e=>{
      if(isDragging) return;
      const rc=cvs.getBoundingClientRect();
      m2.x=((e.clientX-rc.left)/rc.width)*2-1; m2.y=-((e.clientY-rc.top)/rc.height)*2+1;
      ray.setFromCamera(m2,camera);
      const hits=ray.intersectObjects(rayMesh);
      const tt=document.getElementById('tooltip');
      if(hits.length){
        const mesh=hits[0].object,meta=mesh._meta;
        if(mesh!==hov){hov=mesh;if(tt&&meta){const flag=meta.noc==='USA'?'🇺🇸':'🇨🇳';
          tt.innerHTML=`<div><b>${flag} ${meta.noc} · ${meta.sport} · ${meta.year}</b></div>
            <div class="k">🥇 Gold:<b>${meta.G}</b> &nbsp;🥈 Silver:<b>${meta.S}</b> &nbsp;🥉 Bronze:<b>${meta.B}</b></div>
            <div>Total event medals: <b>${meta.total}</b></div>`;
          tt.style.opacity='1';}}
        if(tt){tt.style.left=e.clientX+'px';tt.style.top=e.clientY+'px';}
        cvs.style.cursor='pointer';
      } else {
        if(hov){hov=null;const tt=document.getElementById('tooltip');if(tt)tt.style.opacity='0';cvs.style.cursor='grab';}
      }
    });
    cvs.addEventListener('mouseleave',()=>{hov=null;const tt=document.getElementById('tooltip');if(tt)tt.style.opacity='0';});

    /* year filter */
    function applyYearFilter3D(){
      barsRoot.children.forEach(g=>{const yr=g.children[0]?._meta?.year;if(!yr)return;g.visible=(filterYear==='all')||(yr===+filterYear);});
      if(filterYear==='all'){TARGET.set(0,4,0);sph.phi=.74;sph.r=56;}
      else{const yi=YEARS.indexOf(+filterYear);TARGET.set(0,5,sz+yi*YS);sph.phi=.58;sph.r=34;}
      syncCamera();
    }

    /* perspective spotlight — dim to 0.22, not invisible */
    function applyPerspective3D(p){
      perspective=p;
      if(legendEl) legendEl.innerHTML=LEGEND_HTML[p==='china'?'china':'usa'];
      const focus=p==='china'?chnGroups:usaGroups;
      const dim  =p==='china'?usaGroups :chnGroups;
      focus.forEach(g=>g.children.forEach(c=>{if(c.material){c.material.transparent=true;c.material.opacity=1;}}));
      dim.forEach(g=>g.children.forEach(c=>{if(c.material){c.material.transparent=true;c.material.opacity=.22;}}));
    }

    const rb=document.getElementById('v3dRotBtn'),rstb=document.getElementById('v3dResetBtn');
    if(rb)   rb.onclick=()=>{autoRotate=!autoRotate;rb.style.cssText=autoRotate?PILL_A:PILL;};
    if(rstb) rstb.onclick=()=>{sph.theta=.24;sph.phi=.74;sph.r=56;TARGET.set(0,4,0);syncCamera();};

    let t=0;
    function easeOutBack(x){return 1+2.70158*Math.pow(x-1,3)+1.70158*Math.pow(x-1,2);}
    function loop(){
      if(!renderer3d._running) return;
      requestAnimationFrame(loop); t+=.016;
      allGrps.forEach(g=>{if(g.scale.y<.9999){const p=Math.min(1,Math.max(0,t-g._entry)/.48);g.scale.y=easeOutBack(p);}});
      if(autoRotate&&!isDragging){sph.theta+=.0020;syncCamera();}
      rim.intensity=2.2+Math.sin(t*.6)*.18;
      renderer3d.render(scene,camera);
      drawLabels(); // drawn BEFORE bars visually because labelCvs is z-index 6, WebGL canvas is z-index 10
    }
    loop();

    const _r3=()=>{const w=container.clientWidth;renderer3d.setSize(w,480);camera.aspect=w/480;camera.updateProjectionMatrix();labelCvs.width=w;labelCvs.height=480;};
    window.addEventListener('resize',_r3);
    container._applyPerspective3D=applyPerspective3D;
    container._applyYearFilter3D=applyYearFilter3D;
    _cleanup3dFn=()=>{
      renderer3d._running=false;
      window.removeEventListener('mousemove',_mm);window.removeEventListener('mouseup',_mu);window.removeEventListener('resize',_r3);
      if(renderer3d.domElement.parentNode) renderer3d.domElement.remove();
      if(legendEl&&legendEl.parentNode) legendEl.remove();
      if(labelCvs&&labelCvs.parentNode) labelCvs.remove();
      renderer3d.dispose(); geoCache.forEach(g=>g.dispose());
    };
    applyPerspective3D(perspective);
  }

  /* ═══════════════════════════════════════════════════════════
     2-D MODE
  ═══════════════════════════════════════════════════════════ */
  function build2D(){
    container.style.height='auto';
    // Move modeBtn to flow below chart
    modeBtn.style.position='static'; modeBtn.style.margin='10px auto 0'; modeBtn.style.display='flex';
    const wrap=document.createElement('div'); wrap.id='viz1_2d';
    container.insertBefore(wrap,container.firstChild);

    const visYears=filterYear==='all'?YEARS:YEARS.filter(y=>y===+filterYear);
    const W=container.clientWidth||1100, H=440;
    const mg={top:42,right:30,bottom:62,left:64};
    const w=W-mg.left-mg.right, h=H-mg.top-mg.bottom;

    const svg=d3.select('#viz1_2d').append('svg').attr('width',W).attr('height',H);
    svg.append('rect').attr('width',W).attr('height',H).attr('fill','#fff8ec').attr('rx',8);
    const g=svg.append('g').attr('transform',`translate(${mg.left},${mg.top})`);

    const rows=[];
    visYears.forEach(yr=>['USA','CHN'].forEach(noc=>{
      let G=0,S=0,B=0;
      SPORTS.forEach(sp=>{G+=grid[yr][sp][noc].G;S+=grid[yr][sp][noc].S;B+=grid[yr][sp][noc].B;});
      rows.push({yr,noc,G,S,B,total:G+S+B});
    }));

    const xO=d3.scaleBand().domain(visYears.map(String)).range([0,w]).padding(.24);
    const xI=d3.scaleBand().domain(['USA','CHN']).range([0,xO.bandwidth()]).padding(.1);
    const yMax=d3.max(rows,d=>d.total)||1;
    const y=d3.scaleLinear().domain([0,yMax*1.12]).nice().range([h,0]);

    g.append('g').attr('opacity',.1).call(d3.axisLeft(y).ticks(6).tickSize(-w).tickFormat('')).call(gg=>gg.selectAll('.domain').remove());

    visYears.forEach(yr=>{
      ['USA','CHN'].forEach(noc=>{
        const row=rows.find(r=>r.yr===yr&&r.noc===noc); if(!row) return;
        const isActive=perspective==='usa'?noc==='USA':noc==='CHN';
        const gx=xO(String(yr))+xI(noc), bw=xI.bandwidth(); let yb=h;
        ['B','S','G'].forEach(m=>{
          const val=row[m]; if(!val) return;
          const bh=h-y(val);
          g.append('rect').attr('x',gx).attr('y',yb-bh).attr('width',bw).attr('height',bh)
            .attr('fill',COL2D[noc][m]).attr('opacity',isActive?.92:.25).attr('rx',m==='G'?3:0)
            .on('mouseover',ev=>{
              const tt=document.getElementById('tooltip'); if(!tt) return;
              const flag=noc==='USA'?'🇺🇸':'🇨🇳';
              tt.innerHTML = `
              <div><b>${flag} ${noc} — ${yr}</b></div>
              <div class="k">🥇 Gold: <b>${row.G}</b> &nbsp;&nbsp;🥈 Silver: <b>${row.S}</b> &nbsp;&nbsp;🥉 Bronze: <b>${row.B}</b></div>
              <div>Total medals: <b>${row.total}</b></div>
              `;
              tt.style.opacity='1';tt.style.left=ev.clientX+'px';tt.style.top=ev.clientY+'px';
            })
            .on('mousemove',ev=>{const tt=document.getElementById('tooltip');if(tt){tt.style.left=ev.clientX+'px';tt.style.top=ev.clientY+'px';}})
            .on('mouseleave',()=>{const tt=document.getElementById('tooltip');if(tt)tt.style.opacity='0';});
          yb-=bh;
        });
      });
    });

    // axes
    g.append('g').attr('transform',`translate(0,${h})`).call(d3.axisBottom(xO)).call(gg=>{gg.selectAll('text').attr('fill','#5a3010').attr('font-size',12).attr('font-family','Lora,serif');gg.selectAll('line,path').attr('stroke','rgba(150,100,30,.25)');});
    visYears.forEach(yr=>['USA','CHN'].forEach(noc=>{
      const cx=xO(String(yr))+xI(noc)+xI.bandwidth()/2;
      g.append('text').attr('x',cx).attr('y',h+38).attr('text-anchor','middle')
        .attr('fill',noc==='USA'?'rgba(20,70,180,.72)':'rgba(180,20,20,.72)')
        .attr('font-size',9).attr('font-weight',700).attr('font-family','Lora,serif').text(noc);
    }));
    g.append('g').call(d3.axisLeft(y).ticks(6)).call(gg=>{gg.selectAll('text').attr('fill','#5a3010').attr('font-size',12);gg.selectAll('line,path').attr('stroke','rgba(150,100,30,.2)');gg.selectAll('.domain').remove();});
    g.append('text').attr('transform','rotate(-90)').attr('y',-52).attr('x',-h/2).attr('text-anchor','middle').attr('fill','#8a5a20').attr('font-size',11).attr('font-family','Lora,serif').text('Total Olympic medals in the 10 most competitive sports');

    // dynamic legend per perspective
    const isCHN = perspective==='china';
    const legData = isCHN
      ? [{c:'#d4a000',l:'Gold'},{c:'#d460a0',l:'Silver'},{c:'#8a0808',l:'Bronze'}]
      : [{c:'#c89010',l:'Gold'},{c:'#2a6fd4',l:'Silver'},{c:'#1040a8',l:'Bronze'}];
    const legLbl = isCHN ? '🇨🇳 China' : '🇺🇸 USA';
    const leg=g.append('g').attr('transform',`translate(${w-200},4)`);
    leg.append('rect').attr('x',-10).attr('y',-6).attr('width',196).attr('height',28).attr('fill','rgba(255,248,220,.9)').attr('rx',6).attr('stroke','rgba(180,130,40,.2)').attr('stroke-width',.8);
    leg.append('text').attr('x',-4).attr('y',9).attr('fill','#6a3a10').attr('font-size',10).attr('font-weight',700).attr('font-family','Lora,serif').text(legLbl+' →');
    legData.forEach((it,i)=>{
      leg.append('rect').attr('x',50+i*46).attr('y',1).attr('width',10).attr('height',10).attr('fill',it.c).attr('rx',2);
      leg.append('text').attr('x',63+i*46).attr('y',10).attr('fill','#5a3010').attr('font-size',10).attr('font-family','Lora,serif').text(it.l);
    });
  }

  /* ── shared ──────────────────────────────────────────────── */
  const PILL_A_STR = PILL_A; // capture for use in closures
  function applyYearFilter(){
    if(mode3d&&container._applyYearFilter3D) container._applyYearFilter3D();
    else{d3.select('#viz1_2d').remove();build2D();}
  }

  modeBtn.addEventListener('click',()=>{
    mode3d=!mode3d;
    if(mode3d){
      Object.assign(modeBtn.style,{position:'absolute',top:'10px',right:'10px',margin:'0',display:'flex'});
      modeBtn.innerHTML='<span style="font-size:19px">📊</span><div style="font-size:10px;font-weight:700;letter-spacing:.05em;font-family:Lora,serif;margin-top:2px">2D View</div>';
      d3.select('#viz1_2d').remove();
      if(_cleanup3dFn){_cleanup3dFn();_cleanup3dFn=null;}
      build3D();
    } else {
      modeBtn.innerHTML='<span style="font-size:19px">🧊</span><div style="font-size:10px;font-weight:700;letter-spacing:.05em;font-family:Lora,serif;margin-top:2px">3D View</div>';
      if(_cleanup3dFn){_cleanup3dFn();_cleanup3dFn=null;}
      build2D();
    }
    const rb=document.getElementById('v3dRotBtn'),rstb=document.getElementById('v3dResetBtn');
    if(rb)   rb.style.display=mode3d?'':'none';
    if(rstb) rstb.style.display=mode3d?'':'none';
  });

  const _onP=e=>{
    perspective=e.detail.perspective;
    if(mode3d&&container._applyPerspective3D) container._applyPerspective3D(perspective);
    else if(!mode3d){d3.select('#viz1_2d').remove();build2D();}
  };
  window.addEventListener('perspectiveChange',_onP);

  container._cleanupAll=()=>{
    window.removeEventListener('perspectiveChange',_onP);
    if(_cleanup3dFn) _cleanup3dFn();
    if(card){card.style.background='';card.style.border='';card.style.boxShadow='';}
  };

  build3D();
}