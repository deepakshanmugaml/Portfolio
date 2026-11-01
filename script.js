
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

// Mini platformer: three short stages, patrol enemies, and a boss.
(() => {
  const launch = document.querySelector('#game-mode-launch');
  const panel = document.querySelector('#platformer-panel');
  const hero = document.querySelector('.hero');
  const signalArt = hero?.querySelector('.signal-art');
  const canvas = document.querySelector('#platformer-canvas');
  const platformerScreen = panel?.querySelector('.platformer-screen');
  if (!launch || !panel || !hero || !signalArt || !canvas || !platformerScreen) return;
  const ctx = canvas.getContext('2d');
  const play = document.querySelector('#platformer-play');
  const restart = document.querySelector('#platformer-restart');
  const soundButton = document.querySelector('#platformer-sound');
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
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  let audioContext = null;
  let soundEnabled = true;
  const kinds = ['PLASMA', 'BOUNCE', 'BURST'];
  const levels = [
    { name:'The Approach', platforms:[[0,530,800,70],[210,430,150,20],[430,350,160,20],[620,470,180,20]], lights:[[270,390],[500,310],[680,430]], enemies:[[370,482,0.45],[710,422,0.32]], exit:760 },
    { name:'Signal Run', platforms:[[0,530,800,70],[150,420,170,20],[365,320,150,20],[590,420,210,20]], lights:[[220,380],[430,280],[680,380]], enemies:[[320,482,0.38],[560,372,0.3]], exit:760 },
    { name:'Core Chamber', platforms:[[0,530,800,70],[145,425,155,20],[355,335,160,20],[570,425,230,20]], lights:[[220,385],[430,295],[680,385]], boss:[650,465] }
  ];
  const state = { level:0, running:false, over:false, unlocked:false, lights:[], enemies:[], bullets:[], boss:null, last:0, player:{x:45,y:470,w:24,h:36,vx:0,vy:0,onGround:false} };
  const updateSoundButton = () => {
    soundButton.textContent = soundEnabled ? 'SFX ON' : 'SFX OFF';
    soundButton.setAttribute('aria-pressed', String(soundEnabled));
    soundButton.setAttribute('aria-label', `Sound effects ${soundEnabled ? 'on' : 'off'}`);
  };
  const tone = (frequency, duration, { waveform = 'square', endFrequency = frequency, delay = 0, volume = 0.035 } = {}) => {
    if (!soundEnabled || !audioContext || audioContext.state !== 'running') return;
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const startTime = audioContext.currentTime + delay;
    oscillator.type = waveform;
    oscillator.frequency.setValueAtTime(frequency, startTime);
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(1, endFrequency), startTime + duration);
    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.exponentialRampToValueAtTime(volume, startTime + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
    oscillator.connect(gain);
    gain.connect(audioContext.destination);
    oscillator.start(startTime);
    oscillator.stop(startTime + duration + 0.01);
  };
  const playSound = (name) => {
    if (!soundEnabled) return;
    const sounds = {
      jump: () => tone(320, 0.12, { endFrequency: 620 }),
      start: () => {
        tone(440, 0.09, { waveform: 'sine', volume: 0.025 });
        tone(660, 0.12, { waveform: 'sine', delay: 0.08, volume: 0.03 });
      },
      pause: () => tone(420, 0.12, { waveform: 'sine', endFrequency: 280, volume: 0.025 }),
      collect: () => {
        tone(660, 0.12, { waveform: 'sine', volume: 0.045 });
        tone(990, 0.16, { waveform: 'sine', delay: 0.08, volume: 0.04 });
      },
      stomp: () => tone(190, 0.13, { endFrequency: 75, volume: 0.05 }),
      damage: () => tone(260, 0.3, { endFrequency: 55, waveform: 'sawtooth', volume: 0.04 }),
      fire: () => tone(540, 0.11, { endFrequency: 180, volume: 0.025 }),
      bossHit: () => {
        tone(240, 0.16, { endFrequency: 90, waveform: 'sawtooth', volume: 0.045 });
        tone(680, 0.1, { endFrequency: 330, delay: 0.025, volume: 0.025 });
      },
      levelComplete: () => {
        tone(523, 0.15, { waveform: 'sine', volume: 0.04 });
        tone(659, 0.15, { waveform: 'sine', delay: 0.12, volume: 0.04 });
        tone(784, 0.24, { waveform: 'sine', delay: 0.24, volume: 0.045 });
      },
      victory: () => {
        tone(523, 0.18, { waveform: 'sine', volume: 0.04 });
        tone(659, 0.18, { waveform: 'sine', delay: 0.14, volume: 0.04 });
        tone(784, 0.18, { waveform: 'sine', delay: 0.28, volume: 0.04 });
        tone(1047, 0.38, { waveform: 'sine', delay: 0.42, volume: 0.045 });
      }
    };
    sounds[name]?.();
  };
  const enableAudio = (onReady) => {
    if (!AudioContext) {
      soundButton.disabled = true;
      soundButton.textContent = 'SFX N/A';
      soundButton.setAttribute('aria-label', 'Sound effects unavailable in this browser');
      return;
    }
    if (!audioContext) audioContext = new AudioContext();
    if (audioContext.state === 'running') {
      onReady();
      return;
    }
    audioContext.resume().then(onReady).catch(() => {
      soundEnabled = false;
      soundButton.disabled = true;
      soundButton.textContent = 'SFX N/A';
      soundButton.setAttribute('aria-pressed', 'false');
      soundButton.setAttribute('aria-label', 'Sound effects unavailable; audio could not start');
    });
  };
  soundButton.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    updateSoundButton();
    if (soundEnabled) enableAudio(() => playSound('collect'));
  });
  const showPanel = () => {
    const isOpen = panel.hidden;
    panel.hidden = !isOpen;
    hero.classList.toggle('game-mode-active', isOpen);
    launch.setAttribute('aria-expanded', String(isOpen));
    if (isOpen) {
      signalArt.removeAttribute('aria-hidden');
      signalArt.append(platformerScreen);
      state.unlocked = false;
      loadLevel(0);
    } else {
      stop();
      keys.clear();
      panel.insertBefore(platformerScreen, panel.querySelector('.platformer-actions'));
      signalArt.setAttribute('aria-hidden', 'true');
    }
  };
  const hideOverlay = () => { overlay.hidden = true; overlay.classList.remove('is-visible'); };
  const showOverlay = (kicker,title,message,button='CONTINUE') => { overlayKicker.textContent=kicker; overlayTitle.textContent=title; overlayMessage.textContent=message; again.textContent=button; overlay.hidden=false; requestAnimationFrame(()=>overlay.classList.add('is-visible')); };
  const updateHud = () => { const level=levels[state.level]; levelKicker.textContent=`LEVEL ${state.level+1} / 3`; countOutput.textContent=`${3-state.lights.filter(Boolean).length} / 3`; weaponStatus.hidden=!state.unlocked; fireHint.hidden=!state.unlocked; fireButton.hidden=!state.unlocked; bossLabel.hidden=state.level!==2; bossHealth.hidden=state.level!==2; if(state.level===2 && state.boss) bossHealth.textContent=`${state.boss.hp} / 4`; bulletKind.textContent=state.bullets.length ? state.bullets[state.bullets.length-1].kind : 'RANDOM ROUND'; }
  const loadLevel = (index) => { state.level=index; state.running=false; state.over=false; state.bullets=[]; state.lights=levels[index].lights.map(()=>true); state.enemies=(levels[index].enemies||[]).map(([x,y,s])=>({x,y,w:25,h:28,vx:s*60,base:x,min:x-38,max:x+38,alive:true})); state.boss=levels[index].boss?{x:levels[index].boss[0],y:levels[index].boss[1],w:58,h:58,hp:4,dir:1}:null; Object.assign(state.player,{x:36,y:460,vx:0,vy:0}); hideOverlay(); updateHud(); draw(); };
  const start = () => { enableAudio(() => playSound('start')); state.running=true; state.over=false; canvas.focus(); play.textContent='PAUSE'; hideOverlay(); state.last=performance.now(); requestAnimationFrame(loop); };
  const stop = (gameOver=false) => { state.running=false; state.over=gameOver; play.textContent='PLAY'; };
  const complete = () => { stop(); playSound(state.level===2 ? 'victory' : 'levelComplete'); if(state.level===1) state.unlocked=true; updateHud(); if(state.level===2) showOverlay('MISSION COMPLETE','Core defeated','The signal is stable. You cleared all three stages.','NEW RUN'); else showOverlay('LEVEL COMPLETE',state.level===1?'Gun unlocked':'Stage cleared',state.level===1?'F / X now fires random rounds. Enter the core chamber.':'All three lights collected. Head for the exit.','NEXT LEVEL'); };
  const gameOver = () => { stop(true); playSound('damage'); showOverlay('GAME OVER','Run interrupted','A patrol caught you. Jump on heads to stomp them, then try again.','RETRY LEVEL'); };
  const fire = () => { if(!state.running || !state.unlocked || state.level!==2) return; const kind=kinds[Math.floor(Math.random()*kinds.length)]; state.bullets.push({x:state.player.x+state.player.w,y:state.player.y+15,vx:360,vy:kind==='BURST'?-50:0,r:5,kind}); playSound('fire'); updateHud(); };
  const pressed = (...names) => names.some(name=>keys.has(name));
  const hit = (a,b) => a.x < b.x+b.w && a.x+a.w > b.x && a.y < b.y+b.h && a.y+a.h > b.y;
  const update = (dt) => { const p=state.player; const left=pressed('ArrowLeft','a'), right=pressed('ArrowRight','d'); p.vx=(right-left)*180; if(pressed('ArrowUp','w',' ') && p.onGround){p.vy=-380;p.onGround=false;playSound('jump');} p.vy+=900*dt; p.x+=p.vx*dt; p.y+=p.vy*dt; p.onGround=false; for(const ground of levels[state.level].platforms){ if(p.x+p.w>ground[0]&&p.x<ground[0]+ground[2]&&p.y+p.h>=ground[1]&&p.y+p.h<=ground[1]+35&&p.vy>=0){p.y=ground[1]-p.h;p.vy=0;p.onGround=true;} } p.x=Math.max(0,Math.min(776,p.x)); if(p.y>620){p.x=36;p.y=460;p.vy=0;} for(const e of state.enemies){if(!e.alive)continue;e.x+=e.vx*dt;if(e.x<e.min||e.x>e.max)e.vx*=-1;const wasAbove=p.vy>0&&p.y+p.h-e.y<18;if(hit(p,e)){if(wasAbove){e.alive=false;p.vy=-245;playSound('stomp');}else{gameOver();return;}}} for(const l of state.lights.map((alive,i)=>alive?levels[state.level].lights[i]:null)){if(l&&Math.hypot(p.x-l[0],p.y-l[1])<36){state.lights[levels[state.level].lights.indexOf(l)]=false;playSound('collect');updateHud();}} if(state.level===2&&state.boss){const b=state.boss;b.x+=b.dir*35*dt;if(b.x<610||b.x>725)b.dir*=-1;for(const shot of state.bullets){shot.x+=shot.vx*dt;shot.y+=shot.vy*dt;shot.vy+=40*dt;if(hit({x:shot.x-shot.r,y:shot.y-shot.r,w:shot.r*2,h:shot.r*2},b)){b.hp--;shot.x=1000;playSound('bossHit');updateHud();if(b.hp<=0){state.boss=null;complete();return;}}}}else state.bullets.forEach(s=>{s.x+=s.vx*dt;s.y+=s.vy*dt;}); state.bullets=state.bullets.filter(s=>s.x<820&&s.y<600); if(state.lights.every(v=>!v)&&p.x>levels[state.level].exit-35){complete();return;} };
  const palettes = [
    { sky:'#102b4b', horizon:'#46728a', ground:'#17364a', peak:'#19394b', glow:'#64f0d8' },
    { sky:'#302b4d', horizon:'#82719c', ground:'#332f4a', peak:'#393855', glow:'#ffc879' },
    { sky:'#201c3b', horizon:'#684e78', ground:'#282443', peak:'#302542', glow:'#ff937a' }
  ];
  const pixelSprite = (rows, colors, x, y, pixelSize) => {
    rows.forEach((row, rowIndex) => {
      [...row].forEach((pixel, columnIndex) => {
        if (colors[pixel]) {
          ctx.fillStyle = colors[pixel];
          ctx.fillRect(Math.round(x + columnIndex * pixelSize), Math.round(y + rowIndex * pixelSize), pixelSize, pixelSize);
        }
      });
    });
  };
  const drawGlow = (x, y, radius, color) => {
    const glow = ctx.createRadialGradient(x, y, 0, x, y, radius);
    glow.addColorStop(0, color);
    glow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
  };
  const drawBackdrop = (palette, time) => {
    const sky = ctx.createLinearGradient(0, 0, 0, 600);
    sky.addColorStop(0, palette.sky);
    sky.addColorStop(0.7, palette.horizon);
    sky.addColorStop(1, '#101a2d');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, 800, 600);

    drawGlow(625, 150, 150, `${palette.glow}22`);
    const moonGlow = ctx.createRadialGradient(625, 150, 5, 625, 150, 82);
    moonGlow.addColorStop(0, 'rgba(247,238,218,.88)');
    moonGlow.addColorStop(0.12, 'rgba(247,238,218,.22)');
    moonGlow.addColorStop(1, 'rgba(247,238,218,0)');
    ctx.fillStyle = moonGlow;
    ctx.fillRect(535, 60, 180, 180);
    ctx.fillStyle = 'rgba(247,238,218,.84)';
    ctx.beginPath();
    ctx.arc(625, 150, 20, 0, Math.PI * 2);
    ctx.fill();

    for (let i = 0; i < 54; i += 1) {
      const x = (i * 137 + 31) % 800;
      const y = (i * 71 + 19) % 265;
      const size = i % 9 === 0 ? 2 : 1;
      ctx.globalAlpha = 0.35 + ((Math.sin(time * 1.4 + i) + 1) * 0.2);
      ctx.fillStyle = i % 4 === 0 ? palette.glow : '#e5e9f4';
      ctx.fillRect(x, y, size, size);
    }
    ctx.globalAlpha = 1;

    for (let layer = 0; layer < 3; layer += 1) {
      const baseline = 345 + layer * 63;
      ctx.beginPath();
      ctx.moveTo(0, 600);
      ctx.lineTo(0, baseline);
      for (let x = 0; x <= 800; x += 100) {
        const peak = baseline - 30 - ((x * (layer + 3) + 71) % 76);
        ctx.lineTo(x + 50, peak);
        ctx.lineTo(x + 100, baseline);
      }
      ctx.lineTo(800, 600);
      ctx.closePath();
      ctx.fillStyle = layer === 0 ? 'rgba(113,145,164,.18)' : layer === 1 ? `${palette.peak}bb` : palette.ground;
      ctx.fill();
    }

    const mist = ctx.createLinearGradient(0, 350, 0, 560);
    mist.addColorStop(0, 'rgba(210,222,228,.08)');
    mist.addColorStop(1, 'rgba(210,222,228,0)');
    ctx.fillStyle = mist;
    ctx.fillRect(0, 350, 800, 210);

    ctx.strokeStyle = 'rgba(205,225,230,.055)';
    ctx.lineWidth = 1;
    for (let x = 0; x < 800; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 600);
      ctx.stroke();
    }
  };
  const drawPlatform = ([x, y, width, height]) => {
    ctx.fillStyle = 'rgba(5,12,25,.35)';
    ctx.fillRect(x, y + height, width, 9);
    ctx.fillStyle = '#12243a';
    ctx.fillRect(x, y, width, height);
    ctx.fillStyle = '#527b88';
    ctx.fillRect(x, y, width, 4);
    ctx.fillStyle = '#315166';
    ctx.fillRect(x, y + 4, width, 4);
    ctx.fillStyle = 'rgba(190,220,218,.22)';
    for (let tile = x + 12; tile < x + width - 8; tile += 32) {
      ctx.fillRect(tile, y + 11, 12, 2);
      ctx.fillStyle = 'rgba(8,20,35,.55)';
      ctx.fillRect(tile + 17, y + 19, 7, 2);
      ctx.fillStyle = 'rgba(190,220,218,.22)';
    }
    ctx.fillStyle = 'rgba(130,174,183,.22)';
    ctx.fillRect(x + 5, y + height - 4, width - 10, 2);
  };
  const draw = (frameTime = 0) => {
    const level = levels[state.level];
    const palette = palettes[state.level];
    const time = frameTime * 0.001;
    ctx.clearRect(0, 0, 800, 600);
    drawBackdrop(palette, time);

    level.platforms.forEach(drawPlatform);

    state.lights.forEach((alive, index) => {
      if (!alive) return;
      const [x, y] = level.lights[index];
      const pulse = 1 + Math.sin(time * 4 + index) * 0.12;
      drawGlow(x, y, 34 * pulse, `${palette.glow}48`);
      pixelSprite(
        ['..ww..', '.wccw.', 'wcCCcw', 'wcCCcw', '.wccw.', '..ww..'],
        { w:'#dffbf5', c:palette.glow, C:'#fff2c6' },
        Math.round(x - 12), Math.round(y - 12), 4
      );
    });

    state.enemies.forEach((enemy) => {
      if (!enemy.alive) return;
      const x = Math.round(enemy.x);
      const y = Math.round(enemy.y);
      ctx.fillStyle = 'rgba(5,12,25,.45)';
      ctx.fillRect(x - 3, y + enemy.h, enemy.w + 6, 4);
      pixelSprite(
        ['..rrrr.', '.rrrrrr', 'rrrrrrrr', 'rrErrErr', 'rrrrrrrr', '.rrrrrr', '..rr.rr.'],
        { r:'#b95760', E:'#f5d39a' },
        x - 1, y, 4
      );
      ctx.fillStyle = '#ffb2a1';
      ctx.fillRect(x + 5, y + 5, 4, 2);
    });

    if (state.boss) {
      const boss = state.boss;
      const x = Math.round(boss.x);
      const y = Math.round(boss.y);
      drawGlow(x + 29, y + 30, 78, 'rgba(255,111,125,.22)');
      ctx.fillStyle = 'rgba(5,12,25,.55)';
      ctx.fillRect(x - 7, y + 56, 72, 8);
      pixelSprite(
        ['...dddd...', '..dddddd..', '.ddrrrrdd.', 'ddrrrrrrdd', 'drrcddcrrd', 'drrcddcrrd', 'ddrrrrrrdd', '.ddrrrrdd.', '..dd..dd..', '.dd....dd.'],
        { r:'#d76570', d:'#713f60', c:'#ffd39b' },
        x, y, 6
      );
      ctx.fillStyle = '#fff1cb';
      ctx.fillRect(x + 18, y + 24, 6, 6);
      ctx.fillRect(x + 36, y + 24, 6, 6);
      ctx.fillStyle = '#ff937a';
      ctx.fillRect(x + 24, y + 42, 12, 4);
    }

    const player = state.player;
    const playerX = Math.round(player.x);
    const playerY = Math.round(player.y);
    ctx.fillStyle = 'rgba(5,12,25,.48)';
    ctx.fillRect(playerX - 4, playerY + player.h, player.w + 8, 4);
    pixelSprite(
      ['..HHHH..', '.HHHHHH.', '.SSSSSS.', '.SEES.S.', '..SSSS..', '.MMMMMM.', '.MMMMMM.', '..MMMM..', '..MMMM..', '..M..M..', '..M..M..', '.BB..BB.'],
      { H:'#1b4456', S:'#f2c99a', E:'#14243a', M:'#4ed7c1', B:'#203e60' },
      playerX, playerY, 3
    );
    ctx.fillStyle = '#fff0cf';
    ctx.fillRect(playerX + 5, playerY + 9, 3, 2);

    state.bullets.forEach((shot) => {
      drawGlow(shot.x, shot.y, 22, 'rgba(255,204,117,.42)');
      ctx.fillStyle = '#fff0bd';
      ctx.fillRect(Math.round(shot.x - shot.r), Math.round(shot.y - shot.r), shot.r * 2, shot.r * 2);
    });

    ctx.fillStyle = 'rgba(7,19,33,.64)';
    ctx.fillRect(12, 12, 212, 26);
    ctx.fillRect(568, 12, 220, 26);
    ctx.fillStyle = '#d7e5ef';
    ctx.font = '12px DM Mono, monospace';
    ctx.fillText(level.name, 22, 30);
    ctx.textAlign = 'right';
    ctx.fillStyle = palette.glow;
    ctx.fillText(state.lights.every((collected) => !collected) ? 'EXIT →' : 'COLLECT THE LIGHTS', 778, 30);
    ctx.textAlign = 'left';
  };
  const loop = (time) => { if(!state.running)return; const dt=Math.min((time-state.last)/1000,0.035);state.last=time;update(dt);draw(time);if(state.running)requestAnimationFrame(loop); };
  launch.addEventListener('click',showPanel); play.addEventListener('click',()=>{if(state.running){stop();playSound('pause');}else start();}); restart.addEventListener('click',()=>loadLevel(state.level)); again.addEventListener('click',()=>{ if(state.over){loadLevel(state.level);start();} else if(state.level<2){loadLevel(state.level+1);start();} else {state.unlocked=false;loadLevel(0);start();} });
  window.addEventListener('keydown',e=>{
    if (panel.hidden) return;
    const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    if(['ArrowLeft','ArrowRight','ArrowUp',' ','a','d','w','f','x','r'].includes(key)){
      e.preventDefault();
      keys.add(key);
    }
    if((key==='f'||key==='x')&&state.unlocked)fire();
    if(key==='r')loadLevel(state.level);
  });
  window.addEventListener('keyup',e=>keys.delete(e.key.length === 1 ? e.key.toLowerCase() : e.key));
  document.querySelectorAll('[data-platformer-control]').forEach(button=>{
    const control=button.dataset.platformerControl;
    const key={left:'ArrowLeft',right:'ArrowRight',jump:'ArrowUp'}[control];
    button.addEventListener('pointerdown',e=>{
      e.preventDefault();
      button.classList.add('is-pressed');
      if(control==='fire')fire();
      else keys.add(key);
    });
    ['pointerup','pointercancel','pointerleave'].forEach(type=>button.addEventListener(type,()=>{
      button.classList.remove('is-pressed');
      if(key)keys.delete(key);
    }));
  });
  loadLevel(0);
})();
