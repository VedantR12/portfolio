window.addEventListener('load', () => {
  gsap.registerPlugin(ScrollTrigger);

  /* ══ CURSOR ══ */
  const cur = document.getElementById('cur');
  const cr  = document.getElementById('cur-r');
  let mx=0, my=0, rx=0, ry=0;
  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    cur.style.left = mx + 'px'; cur.style.top = my + 'px';
  });
  (function tick() {
    rx += (mx-rx)*.1; ry += (my-ry)*.1;
    cr.style.left = rx+'px'; cr.style.top = ry+'px';
    requestAnimationFrame(tick);
  })();

  /* ══ MOBILE NAV ══ */
  document.getElementById('menu-icon').addEventListener('click', () => {
    const nl = document.getElementById('nav-links');
    nl.style.cssText = nl.style.display === 'flex' ? ''
      : 'display:flex;flex-direction:column;position:fixed;top:60px;left:0;width:100%;background:#060608;padding:28px;gap:20px;z-index:999;border-bottom:1px solid rgba(255,255,255,.07);';
  });
  document.querySelectorAll('.n-links a').forEach(a =>
    a.addEventListener('click', () => document.getElementById('nav-links').style.display = 'none')
  );

  /* ══ CANVAS ORBS ══ */
  const canvas = document.getElementById('gc');
  const ctx = canvas.getContext('2d');
  let W, H;
  function sz() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
  sz(); window.addEventListener('resize', sz);

  const ORBS = [
    {bx:.15,by:.25,r:.32,c:'#C8FF00',a:.22},
    {bx:.78,by:.18,r:.28,c:'#2979FF',a:.18},
    {bx:.82,by:.72,r:.35,c:'#9B5CF6',a:.20},
    {bx:.10,by:.78,r:.26,c:'#FF2D78',a:.16},
    {bx:.50,by:.50,r:.22,c:'#00E5FF',a:.14},
    {bx:.62,by:.32,r:.18,c:'#FF6B2B',a:.12},
  ].map(o => ({...o, t: Math.random()*Math.PI*2}));

  let mox=W/2, moy=H/2;
  document.addEventListener('mousemove', e => { mox=e.clientX; moy=e.clientY; });

  (function drawOrbs() {
    ctx.clearRect(0,0,W,H);
    ORBS.forEach(o => {
      o.t += .004;
      let tx = (o.bx + Math.sin(o.t)*.12)*W;
      let ty = (o.by + Math.cos(o.t*.7)*.10)*H;
      const r = o.r*Math.min(W,H);
      const dx=tx-mox, dy=ty-moy, dist=Math.sqrt(dx*dx+dy*dy);
      if (dist < r*1.5 && dist > 0) {
        const f = (r*1.5-dist)/(r*1.5)*55;
        tx += dx/dist*f; ty += dy/dist*f;
      }
      const g = ctx.createRadialGradient(tx,ty,0,tx,ty,r);
      const a1 = Math.round(o.a*255).toString(16).padStart(2,'0');
      const a2 = Math.round(o.a*.35*255).toString(16).padStart(2,'0');
      g.addColorStop(0, o.c+a1); g.addColorStop(.55, o.c+a2); g.addColorStop(1, o.c+'00');
      ctx.beginPath(); ctx.arc(tx,ty,r,0,Math.PI*2); ctx.fillStyle=g; ctx.fill();
    });
    requestAnimationFrame(drawOrbs);
  })();

  /* ══ HERO ENTRANCE ══ */
  gsap.set('#hphoto', {scale:.75, opacity:0});
  gsap.set('#hstats',  {opacity:0, y:40});

  gsap.timeline({defaults:{ease:'power4.out'}})
    .from('#hn1',        {y:120, opacity:0, duration:1.1}, 0.05)
    .from('#hn2',        {y:120, opacity:0, duration:1.1}, 0.22)
    .from('#hrole',      {y: 30, opacity:0, duration:.8},  0.48)
    .from('.hero-avail', {y:-20, opacity:0, duration:.6},  0.55)
    .from('.hero-scroll',{opacity:0,        duration:.6},  1.25);

  /* ══════════════════════════════════════════════════
     HERO PIN + SPLIT SCROLL
     GSAP pin:true handles ALL the scroll space.
     No CSS sticky, no manual wrapper heights.
     end:"+=500%" = 5 viewports of scroll distance.
  ══════════════════════════════════════════════════ */
  gsap.timeline({
    scrollTrigger: {
      trigger:       '#hero',
      pin:           true,
      start:         'top top',
      end:           '+=500%',
      scrub:         1.2,
      anticipatePin: 1,
    }
  })
  /* 0–40%  name splits */
  .to('#hn1',    {y:'-55vh', ease:'none'},          0)
  .to('#hn2',    {y: '55vh', ease:'none'},           0)
  .to('#hrole',  {opacity:0, y:-20, ease:'none', duration:.15}, 0)
  /* 10–70% photo fades in */
  .to('#hphoto', {opacity:1, scale:1, ease:'none'},  .10)
  /* 60–80% stats rise */
  .to('#hstats', {opacity:1, y:0, ease:'none', duration:.20}, .60);

  /* ══ REVEAL HELPER ══ */
  function reveal(sel, from, opts={}) {
    const to = {};
    Object.keys(from).forEach(k => to[k] = k==='scale'?1:0);
    to.opacity=1; to.duration=opts.d||.9; to.ease=opts.ease||'power3.out'; to.delay=opts.delay||0;
    to.scrollTrigger = {trigger:sel, start:'top '+(opts.start||'88%'), toggleActions:'play none none reverse'};
    gsap.fromTo(sel, {...from, opacity:0}, to);
  }

  /* ══ ABOUT ══ */
  reveal('#abl', {x:-70}, {d:1});
  reveal('#abr', {x: 70}, {d:1});
  document.querySelectorAll('.ab-card').forEach((c,i) => reveal(c, {y:40}, {d:.65, delay:i*.08}));

  /* ══ PROJECT TITLE ══ */
  reveal('#pht', {y:50});

  /* ══════════════════════════════════════════════════
     PROJECTS HORIZONTAL SCROLL
     GSAP pins #ps, translates #pt left.
     end is calculated from actual track width so
     there's no blank space or premature ending.
  ══════════════════════════════════════════════════ */
  requestAnimationFrame(() => requestAnimationFrame(() => {
    const ptrack  = document.getElementById('pt');
    const ptOuter = document.querySelector('.pt-outer');
    const totalW  = ptrack.scrollWidth - ptOuter.clientWidth;

    gsap.to(ptrack, {
      x: -totalW,
      ease: 'none',
      scrollTrigger: {
        trigger:           '#ps',
        pin:               true,
        start:             'top top',
        end:               () => '+=' + Math.round(totalW * 1.5),
        scrub:             1,
        anticipatePin:     1,
        invalidateOnRefresh: true,
        onUpdate(self) {
          const idx = Math.min(Math.round(self.progress*4), 4);
          const el  = document.getElementById('pcnt');
          if (el) el.textContent = String(idx+1).padStart(2,'0')+' — 05';
        }
      }
    });
  }));

  /* ══ SKILLS ══ */
  document.querySelectorAll('.sk-b').forEach((b,i) => reveal(b, {y:50}, {d:.7, delay:i*.07}));

  /* ══ EDUCATION ══ */
  reveal('#ec1', {x:-60}, {d:.9});
  reveal('#ec2', {x: 60}, {d:.9});

  /* ══ CONTACT ══ */
  reveal('#cwrap', {y:70}, {d:1});
});