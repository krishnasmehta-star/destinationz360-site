/* DESTINATIONZ 360 · stepout-v2.js
   Transcribed verbatim from the Zubilant v9 Step Outside block, which is
   inline on every Zubilant page. Krishna, 17 Sep: "Hero and footer be the
   same as Zubilant, same effects, animations, flow." One shared file here
   instead of nineteen inline copies, because duplicated builders drift.
   The only change is the revealed artwork: D360's own field-trip
   photograph rather than Zubilant's whale. */
/* STEP OUTSIDE v2 — fluid reveal. A low-res "ink" canvas accumulates the
   pointer trail; each frame it is re-drawn blurred, faded and drifting
   upward (ink dissipating in water), then drained to true zero. The reveal
   layer (whale photo + the wordmark re-set as a teal hollow outline at the
   exact DOM glyph positions) is composited through the trail (source-in)
   with two breathing echo passes for the liquid edge.
   No libraries · pauses off-screen · reduced-motion gets a static reveal ·
   ambient current on touch devices only. */
(function(){
  var sec=document.getElementById('stepout'); if(!sec) return;
  var cv=sec.querySelector('.so-reveal'); if(!cv) return;
  var ctx=cv.getContext('2d'); if(!ctx) return;
  var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  var TOUCH=(navigator.maxTouchPoints>0)||(window.matchMedia&&matchMedia('(hover: none)').matches);

  var art=new Image(); art.src='j-valley-of-flowers-hemkund-trek.webp';
  var artCv=document.createElement('canvas'), artCtx=artCv.getContext('2d');
  var trail=document.createElement('canvas'), tctx=trail.getContext('2d');
  var canFilter = typeof tctx.filter!=='undefined';
  var W=0,H=0,tw=0,th=0,DS=0.22, ready=false;

  function paintArt(){
    if(!(art.complete&&art.naturalWidth)) return;
    artCtx.clearRect(0,0,W,H);
    var s=Math.max(W/art.naturalWidth,H/art.naturalHeight),
        dw=art.naturalWidth*s, dh=art.naturalHeight*s;
    artCtx.drawImage(art,(W-dw)/2,(H-dh)/2,dw,dh);
    var r0=sec.getBoundingClientRect(), dpr=W/r0.width;
    artCtx.strokeStyle='#7FC4CA';
    artCtx.lineJoin='round'; artCtx.miterLimit=2;
    artCtx.shadowColor='rgba(0,39,43,.5)';
    sec.querySelectorAll('.so-word').forEach(function(w){
      var cs=getComputedStyle(w), r=w.getBoundingClientRect();
      var txt=w.textContent.toUpperCase();
      var fs=parseFloat(cs.fontSize)*dpr;
      artCtx.font=cs.fontWeight+' '+fs+'px '+cs.fontFamily;
      if('letterSpacing' in artCtx) artCtx.letterSpacing=((parseFloat(cs.letterSpacing)||0)*dpr)+'px';
      var m=artCtx.measureText(txt);
      var asc=(m.fontBoundingBoxAscent!==undefined)?m.fontBoundingBoxAscent:fs*0.8;
      var desc=(m.fontBoundingBoxDescent!==undefined)?m.fontBoundingBoxDescent:fs*0.2;
      var half=((r.height*dpr)-(asc+desc))/2;
      var x=(r.left-r0.left)*dpr + ((r.width*dpr)-m.width)/2;
      var y=(r.top-r0.top)*dpr + half + asc;
      artCtx.lineWidth=Math.max(2,fs*0.016);
      artCtx.shadowBlur=fs*0.07;
      artCtx.strokeText(txt,x,y);
    });
    artCtx.shadowColor='transparent'; artCtx.shadowBlur=0;
    ready=true;
    if(reduce) staticFrame();
  }
  function size(){
    var r=sec.getBoundingClientRect();
    var dpr=Math.min(window.devicePixelRatio||1,1.5);
    W=cv.width=Math.max(2,Math.round(r.width*dpr));
    H=cv.height=Math.max(2,Math.round(r.height*dpr));
    cv.style.width=r.width+'px'; cv.style.height=r.height+'px';
    tw=trail.width=Math.max(2,Math.round(W*DS));
    th=trail.height=Math.max(2,Math.round(H*DS));
    artCv.width=W; artCv.height=H;
    paintArt();
  }
  art.onload=size;
  if(document.fonts&&document.fonts.ready) document.fonts.ready.then(paintArt);
  size(); addEventListener('resize',size);

  var px=-1,py=-1,hx,hy,hasPointer=false,idleMs=99999;
  sec.addEventListener('pointermove',function(e){
    var r=cv.getBoundingClientRect();
    px=(e.clientX-r.left)/r.width; py=(e.clientY-r.top)/r.height;
    hasPointer=true; idleMs=0;
  },{passive:true});
  sec.addEventListener('pointerleave',function(){hasPointer=false; hx=hy=undefined;},{passive:true});

  function blob(x,y,rad,a){
    var g=tctx.createRadialGradient(x,y,0,x,y,rad);
    g.addColorStop(0,'rgba(255,255,255,'+a+')');
    g.addColorStop(.6,'rgba(255,255,255,'+(a*.45)+')');
    g.addColorStop(1,'rgba(255,255,255,0)');
    tctx.fillStyle=g; tctx.beginPath(); tctx.arc(x,y,rad,0,6.2832); tctx.fill();
  }

  function staticFrame(){
    ctx.clearRect(0,0,W,H);
    tctx.clearRect(0,0,tw,th);
    blob(tw*.5,th*.52,th*.42,.9); blob(tw*.32,th*.4,th*.25,.7); blob(tw*.68,th*.6,th*.25,.7);
    ctx.drawImage(trail,0,0,W,H);
    ctx.globalCompositeOperation='source-in';
    ctx.drawImage(artCv,0,0);
    ctx.globalCompositeOperation='source-over';
  }

  var amb=Math.random()*80, wob=0, running=false, rafId=0, last=0;

  function frame(now){
    if(!running) return;
    var dt=Math.min(48,now-last||16); last=now; idleMs+=dt;

    tctx.globalCompositeOperation='copy';
    if(canFilter) tctx.filter='blur(2.2px)';
    tctx.globalAlpha=0.968;
    var g=1.007;
    tctx.drawImage(trail,(tw-tw*g)/2,(th-th*g)/2-0.55,tw*g,th*g);
    tctx.globalAlpha=1; if(canFilter) tctx.filter='none';
    tctx.globalCompositeOperation='destination-out';
    tctx.fillStyle='rgba(0,0,0,0.02)';
    tctx.fillRect(0,0,tw,th);
    tctx.globalCompositeOperation='source-over';

    if(TOUCH && idleMs>2400){
      amb+=dt*0.00042;
      var ax=0.5+0.36*Math.sin(amb*1.7)+0.10*Math.sin(amb*3.9+0.7);
      var ay=0.46+0.27*Math.sin(amb*2.3+1.4)+0.09*Math.cos(amb*5.1);
      blob(ax*tw,ay*th,th*0.17,0.42);
    }

    if(hasPointer&&px>=0){
      var bx=px*tw, by=py*th;
      if(hx!==undefined){
        var d=Math.hypot(bx-hx,by-hy), n=Math.min(14,Math.ceil(d/(th*0.02))||1);
        for(var i=1;i<=n;i++) blob(hx+(bx-hx)*i/n, hy+(by-hy)*i/n, th*0.19, 0.62);
      } else blob(bx,by,th*0.19,0.62);
      hx=bx; hy=by;
    }

    wob+=dt*0.0011;
    ctx.clearRect(0,0,W,H);
    ctx.drawImage(trail,0,0,W,H);
    ctx.globalAlpha=0.32;
    ctx.drawImage(trail, Math.sin(wob*2.1)*W*0.007, Math.cos(wob*1.3)*H*0.004, W,H);
    ctx.drawImage(trail, -Math.sin(wob*1.7+1)*W*0.007, -Math.cos(wob*2.6)*H*0.004, W,H);
    ctx.globalAlpha=1;
    ctx.globalCompositeOperation='source-in';
    ctx.drawImage(artCv,0,0);
    ctx.globalCompositeOperation='source-over';

    rafId=requestAnimationFrame(frame);
  }

  if(reduce){ if(ready) staticFrame(); return; }

  if('IntersectionObserver' in window){
    new IntersectionObserver(function(en){
      var vis=en[0].isIntersecting;
      if(vis&&!running){running=true;last=0;rafId=requestAnimationFrame(frame);}
      else if(!vis&&running){running=false;cancelAnimationFrame(rafId);}
    },{threshold:0.05}).observe(sec);
  } else { running=true; rafId=requestAnimationFrame(frame); }
})();
