
const title = document.querySelector('#job-title');
const date = document.querySelector('#job-date');
const points = document.querySelector('#job-points');
document.querySelectorAll('.tab').forEach((tab) => {
  tab.addEventListener('click', () => {
    const job = jobs[tab.dataset.job];
    document.querySelectorAll('.tab').forEach((item) => { item.classList.remove('active'); item.setAttribute('aria-selected', 'false'); });
    tab.classList.add('active'); tab.setAttribute('aria-selected', 'true');
    title.innerHTML = `${job.title} <span>@ ${job.company}</span>`;
    date.textContent = job.date;
    points.innerHTML = job.points.map((point) => `<li>${point}</li>`).join('');
  });
});

document.querySelector('.menu-button').addEventListener('click', () => {
  document.querySelector('.top-nav').classList.toggle('mobile-open');
});

const signalArt = document.querySelector('.signal-art');
const portraitCanvas = document.querySelector('.portrait-canvas');

if (signalArt && portraitCanvas) {
  const context = portraitCanvas.getContext('2d');
  const portraitImage = new Image();
  const particles = [];
  const pointer = { x: 0, y: 0, active: false };
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let canvasWidth = 0;
  let canvasHeight = 0;

  const fitCanvas = () => {
    canvasWidth = signalArt.clientWidth;
    canvasHeight = signalArt.clientHeight;
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    portraitCanvas.width = Math.round(canvasWidth * pixelRatio);
    portraitCanvas.height = Math.round(canvasHeight * pixelRatio);
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  };

  const createParticles = () => {
    const sampleCanvas = document.createElement('canvas');
    const sampleSize = 160;
    sampleCanvas.width = sampleSize;
    sampleCanvas.height = sampleSize;
    const sampleContext = sampleCanvas.getContext('2d', { willReadFrequently: true });
    sampleContext.drawImage(portraitImage, 6, 5, 148, 148);
    const pixels = sampleContext.getImageData(0, 0, sampleSize, sampleSize).data;

    particles.length = 0;
    for (let y = 0; y < sampleSize; y += 2) {
      for (let x = 0; x < sampleSize; x += 2) {
        const pixelIndex = (y * sampleSize + x) * 4;
        const alpha = pixels[pixelIndex + 3];
        if (alpha < 48) continue;

        const brightness = (pixels[pixelIndex] + pixels[pixelIndex + 1] + pixels[pixelIndex + 2]) / 765;
        particles.push({
          homeX: (x / sampleSize) * canvasWidth,
          homeY: (y / sampleSize) * canvasHeight,
          x: (x / sampleSize) * canvasWidth,
          y: (y / sampleSize) * canvasHeight,
          alpha: (alpha / 255) * (0.2 + brightness * 0.7),
          phase: (x * 0.21) + (y * 0.13),
        });
      }
    }
  };

  const draw = (time) => {
    context.clearRect(0, 0, canvasWidth, canvasHeight);
    const animationTime = time * 0.001;

    particles.forEach((particle) => {
      let targetX = particle.homeX;
      let targetY = particle.homeY;
      const distanceX = particle.homeX - pointer.x;
      const distanceY = particle.homeY - pointer.y;
      const distance = Math.hypot(distanceX, distanceY);

      if (pointer.active && !reducedMotion && distance < 92) {
        const force = (1 - distance / 92) ** 2;
        targetX += (distanceX / Math.max(distance, 1)) * force * 22;
        targetY += (distanceY / Math.max(distance, 1)) * force * 22;
        targetY += Math.sin(animationTime * 7 + particle.phase) * force * 3;
      }

      particle.x += (targetX - particle.x) * 0.18;
      particle.y += (targetY - particle.y) * 0.18;
      context.fillStyle = `rgba(100, 240, 216, ${particle.alpha})`;
      context.fillRect(Math.round(particle.x), Math.round(particle.y), 1.3, 1.3);
    });

    if (pointer.active) {
      context.save();
      context.strokeStyle = 'rgba(238, 246, 255, 0.92)';
      context.lineWidth = 1.2;
      context.beginPath();
      context.moveTo(pointer.x - 9, pointer.y);
      context.lineTo(pointer.x + 9, pointer.y);
      context.moveTo(pointer.x, pointer.y - 9);
      context.lineTo(pointer.x, pointer.y + 9);
      context.stroke();
      context.restore();
    }

    requestAnimationFrame(draw);
  };

  const updatePointer = (event) => {
    const bounds = signalArt.getBoundingClientRect();
    pointer.x = ((event.clientX - bounds.left) / bounds.width) * canvasWidth;
    pointer.y = ((event.clientY - bounds.top) / bounds.height) * canvasHeight;
    pointer.active = true;
  };

  portraitImage.addEventListener('load', () => {
    fitCanvas();
    createParticles();
    if (particles.length) signalArt.classList.add('canvas-ready');
    requestAnimationFrame(draw);
  });

  signalArt.addEventListener('pointermove', updatePointer);
  signalArt.addEventListener('pointerleave', () => { pointer.active = false; });
  window.addEventListener('resize', () => {
    fitCanvas();
    createParticles();
  });
  portraitImage.src = 'assets/astra-portrait-transparent.png';
}

if (window.lucide) lucide.createIcons();

/*
Small playable portfolio demo removed.
Small playable portfolio demo: three short stages, patrol enemies, and a boss.
(() => {
  const launch = document.querySelector('#game-mode-launch');
  const panel = document.querySelector('#platformer-panel');
  const hero = document.querySelector('.hero');
  const canvas = document.querySelector('#platformer-canvas');
  if (!launch || !panel || !hero || !canvas) return;
  const ctx = canvas.getContext('2d');
  const play = document.querySelector('#platformer-play');
  const restart = document.querySelector('#platformer-restart');
  const again = document.querySelector('#platformer-again');
  const overlay = document.querySelector('#platformer-overlay');
  const overlayKicker = document.querySelector('#platformer-overlay-kicker');
  const overlayTitle = document.querySelector('#platformer-overlay-title');
  const overlayMessage = document.querySelector('#platformer-overlay-message');
  const levelKicker = document.querySelector('#level-kicker');
  const countOutput = document.querySelector('#collectible-count');
  const weaponStatus = document.querySelector('#weapon-status');
  const bulletKind = document.querySelector('#bullet-kind');
  const bossLabel = document.querySelector('#boss-health-label');
  const bossHealth = document.querySelector('#boss-health');
  const fireHint = document.querySelector('#fire-hint');
  const fireButton = document.querySelector('[data-platformer-control="fire"]');
  const keys = new Set();
  const kinds = ['PLASMA', 'BOUNCE', 'BURST'];
  const levels = [
    { name:'The Approach', platforms:[[0,530,800,70],[210,430,150,20],[430,350,160,20],[620,470,180,20]], lights:[[270,390],[500,310],[680,430]], enemies:[[370,482,0.45],[710,422,0.32]], exit:760 },
    { name:'Signal Run', platforms:[[0,530,800,70],[150,420,170,20],[365,320,150,20],[590,420,210,20]], lights:[[220,380],[430,280],[680,380]], enemies:[[320,482,0.38],[560,372,0.3]], exit:760 },
    { name:'Core Chamber', platforms:[[0,530,800,70],[145,425,155,20],[355,335,160,20],[570,425,230,20]], lights:[[220,385],[430,295],[680,385]], boss:[650,465] }
  ];
  const state = { level:0, running:false, over:false, unlocked:false, lights:[], enemies:[], bullets:[], boss:null, last:0, player:{x:45,y:470,w:24,h:36,vx:0,vy:0,onGround:false} };
  const showPanel = () => { panel.hidden = false; hero.classList.add('game-mode-active'); launch.setAttribute('aria-expanded','true'); loadLevel(0); };
  const hideOverlay = () => { overlay.hidden = true; overlay.classList.remove('is-visible'); };
  const showOverlay = (kicker,title,message,button='CONTINUE') => { overlayKicker.textContent=kicker; overlayTitle.textContent=title; overlayMessage.textContent=message; again.textContent=button; overlay.hidden=false; requestAnimationFrame(()=>overlay.classList.add('is-visible')); };
  const updateHud = () => { const level=levels[state.level]; levelKicker.textContent=`LEVEL ${state.level+1} / 3`; countOutput.textContent=`${3-state.lights.filter(Boolean).length} / 3`; weaponStatus.hidden=!state.unlocked; fireHint.hidden=!state.unlocked; fireButton.hidden=!state.unlocked; bossLabel.hidden=state.level!==2; bossHealth.hidden=state.level!==2; if(state.level===2 && state.boss) bossHealth.textContent=`${state.boss.hp} / 4`; bulletKind.textContent=state.bullets.length ? state.bullets[state.bullets.length-1].kind : 'RANDOM ROUND'; }
  const loadLevel = (index) => { state.level=index; state.running=false; state.over=false; state.bullets=[]; state.lights=levels[index].lights.map(()=>true); state.enemies=(levels[index].enemies||[]).map(([x,y,s])=>({x,y,w:25,h:28,vx:s*60,base:x,min:x-38,max:x+38,alive:true})); state.boss=levels[index].boss?{x:levels[index].boss[0],y:levels[index].boss[1],w:58,h:58,hp:4,dir:1}:null; Object.assign(state.player,{x:36,y:460,vx:0,vy:0}); hideOverlay(); updateHud(); draw(); };
  const start = () => { state.running=true; state.over=false; canvas.focus(); play.textContent='PAUSE'; hideOverlay(); state.last=performance.now(); requestAnimationFrame(loop); };
  const stop = (gameOver=false) => { state.running=false; state.over=gameOver; play.textContent='PLAY'; };
  const complete = () => { stop(); if(state.level===1) state.unlocked=true; updateHud(); if(state.level===2) showOverlay('MISSION COMPLETE','Core defeated','The signal is stable. You cleared all three stages.','NEW RUN'); else showOverlay('LEVEL COMPLETE',state.level===1?'Gun unlocked':'Stage cleared',state.level===1?'F / X now fires random rounds. Enter the core chamber.':'All three lights collected. Head for the exit.','NEXT LEVEL'); };
  const gameOver = () => { stop(true); showOverlay('GAME OVER','Run interrupted','A patrol caught you. Jump on heads to stomp them, then try again.','RETRY LEVEL'); };
  const fire = () => { if(!state.running || !state.unlocked || state.level!==2) return; const kind=kinds[Math.floor(Math.random()*kinds.length)]; state.bullets.push({x:state.player.x+state.player.w,y:state.player.y+15,vx:360,vy:kind==='BURST'?-50:0,r:5,kind}); updateHud(); };
  const pressed = (...names) => names.some(name=>keys.has(name));
  const hit = (a,b) => a.x < b.x+b.w && a.x+a.w > b.x && a.y < b.y+b.h && a.y+a.h > b.y;
  const update = (dt) => { const p=state.player; const left=pressed('ArrowLeft','a'), right=pressed('ArrowRight','d'); p.vx=(right-left)*180; if(pressed('ArrowUp','w',' ') && p.onGround){p.vy=-380;p.onGround=false;} p.vy+=900*dt; p.x+=p.vx*dt; p.y+=p.vy*dt; p.onGround=false; for(const ground of levels[state.level].platforms){ if(p.x+p.w>ground[0]&&p.x<ground[0]+ground[2]&&p.y+p.h>=ground[1]&&p.y+p.h<=ground[1]+35&&p.vy>=0){p.y=ground[1]-p.h;p.vy=0;p.onGround=true;} } p.x=Math.max(0,Math.min(776,p.x)); if(p.y>620){p.x=36;p.y=460;p.vy=0;} for(const e of state.enemies){if(!e.alive)continue;e.x+=e.vx*dt;if(e.x<e.min||e.x>e.max)e.vx*=-1;const wasAbove=p.vy>0&&p.y+p.h-e.y<18;if(hit(p,e)){if(wasAbove){e.alive=false;p.vy=-245;}else{gameOver();return;}}} for(const l of state.lights.map((alive,i)=>alive?levels[state.level].lights[i]:null)){if(l&&Math.hypot(p.x-l[0],p.y-l[1])<36){state.lights[levels[state.level].lights.indexOf(l)]=false;updateHud();}} if(state.level===2&&state.boss){const b=state.boss;b.x+=b.dir*35*dt;if(b.x<610||b.x>725)b.dir*=-1;for(const shot of state.bullets){shot.x+=shot.vx*dt;shot.y+=shot.vy*dt;shot.vy+=40*dt;if(hit({x:shot.x-shot.r,y:shot.y-shot.r,w:shot.r*2,h:shot.r*2},b)){b.hp--;shot.x=1000;updateHud();if(b.hp<=0){state.boss=null;complete();return;}}}}else state.bullets.forEach(s=>{s.x+=s.vx*dt;s.y+=s.vy*dt;}); state.bullets=state.bullets.filter(s=>s.x<820&&s.y<600); if(state.lights.every(v=>!v)&&p.x>levels[state.level].exit-35){complete();return;} };
  const draw = () => { const level=levels[state.level]; ctx.clearRect(0,0,800,600); const grad=ctx.createLinearGradient(0,0,0,600);grad.addColorStop(0,'#102b4b');grad.addColorStop(1,'#071321');ctx.fillStyle=grad;ctx.fillRect(0,0,800,600);ctx.fillStyle='rgba(100,240,216,.12)';for(let x=0;x<800;x+=40)ctx.fillRect(x,0,1,600);ctx.fillStyle='#29486b';level.platforms.forEach(g=>ctx.fillRect(g[0],g[1],g[2],g[3]));ctx.fillStyle='#64f0d8';state.lights.forEach((alive,i)=>{if(alive){const l=level.lights[i];ctx.beginPath();ctx.arc(l[0],l[1],8,0,Math.PI*2);ctx.fill();}});ctx.fillStyle='#ff937a';state.enemies.forEach(e=>{if(e.alive)ctx.fillRect(e.x,e.y,e.w,e.h);});if(state.boss){ctx.fillStyle='#ff937a';ctx.beginPath();ctx.arc(state.boss.x+29,state.boss.y+29,29,0,Math.PI*2);ctx.fill();ctx.fillStyle='#071321';ctx.fillRect(state.boss.x+17,state.boss.y+22,8,8);ctx.fillRect(state.boss.x+34,state.boss.y+22,8,8);}ctx.fillStyle='#e8f2ff';ctx.fillRect(state.player.x,state.player.y,state.player.w,state.player.h);ctx.fillStyle='#ffcc75';state.bullets.forEach(s=>{ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,Math.PI*2);ctx.fill();});ctx.fillStyle='#9eafc7';ctx.font='12px DM Mono, monospace';ctx.fillText(level.name,20,28);ctx.fillText(state.lights.every(v=>!v)?'EXIT →':'COLLECT THE LIGHTS',620,28); };
  const loop = (time) => { if(!state.running)return; const dt=Math.min((time-state.last)/1000,0.035);state.last=time;update(dt);draw();if(state.running)requestAnimationFrame(loop); };
  launch.addEventListener('click',showPanel); play.addEventListener('click',()=>state.running?stop():start()); restart.addEventListener('click',()=>loadLevel(state.level)); again.addEventListener('click',()=>{ if(state.over){loadLevel(state.level);start();} else if(state.level<2){loadLevel(state.level+1);start();} else {state.unlocked=false;loadLevel(0);start();} });
  window.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','ArrowUp',' ','a','d','w','f','x','r'].includes(e.key)){e.preventDefault();keys.add(e.key);}if((e.key==='f'||e.key==='x')&&state.unlocked)fire();if(e.key==='r')loadLevel(state.level);}); window.addEventListener('keyup',e=>keys.delete(e.key)); document.querySelectorAll('[data-platformer-control]').forEach(button=>{const control=button.dataset.platformerControl;const key={left:'ArrowLeft',right:'ArrowRight',jump:'ArrowUp'}[control];button.addEventListener('pointerdown',e=>{e.preventDefault();button.classList.add('is-pressed');if(control==='fire')fire();else keys.add(key);});['pointerup','pointercancel','pointerleave'].forEach(type=>button.addEventListener(type,()=>{button.classList.remove('is-pressed');if(key)keys.delete(key);}));});
  loadLevel(0);
})();
*/
