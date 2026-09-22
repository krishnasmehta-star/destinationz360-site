/* ═══════════════════════════════════════════════════════════════
   DESTINATIONZ 360 · d360-v1.js
   Loaded AFTER core-v9.js. Everything shared (nav, ground wash, reveals,
   mega, the in-place programme modal, enquiry validation and delivery) lives
   in core-v9.js, transcribed from the Zubilant v9 system.
   This file adds only what is D360's own:
     1. the programme context pill on contact.html
     2. exact #enquire landing, with the corrective ticks Zubilant needed
     3. the callback-window chips
   ═══════════════════════════════════════════════════════════════ */

/* ── 1 · PROGRAMME CONTEXT PILL ────────────────────────────────
   A coordinator who clicked "Wildlife and conservation" must see that the
   form knows it. Dismissing the pill clears the notes line, the URL param
   and the email subject together, so the inbox never carries a claim the
   visitor took back. Transcribed from Zubilant enquiry r7. */
(function(){
  var f=document.querySelector('form[action="/api/enquiry"]');
  if(!f) return;
  var q; try{ q=new URLSearchParams(location.search); }catch(e){ return; }
  var val=q.get('programme'), key='programme';
  if(!val){ val=q.get('q'); key='q'; }
  if(!val) return;
  val=val.replace(/\s+/g,' ').trim();
  if(!val) return;

  var head=f.closest('.fcard2')||f.parentNode;
  var h=head.querySelector('h2')||head.querySelector('h3');
  var pill=document.createElement('div');
  pill.className='empill';
  pill.style.cssText='display:inline-flex;align-items:center;gap:10px;margin:14px 0 0';
  pill.innerHTML=(key==='programme'?'Programme: <b></b>':'You asked: <b></b>')+
    '<button type="button" aria-label="Remove this programme" style="background:none;border:0;font:inherit;line-height:1;padding:0 2px;cursor:pointer;opacity:.6">&times;</button>';
  pill.querySelector('b').textContent=val;
  if(h&&h.parentNode) h.parentNode.insertBefore(pill,h.nextSibling);
  else f.parentNode.insertBefore(pill,f);

  f.setAttribute('data-journey',val);           /* core-v9 reads this for the subject */

  /* If the page carries a programme <select>, set it rather than writing the
     same fact into the notes twice. The select is inside a .field, so the
     enquiry block already reports it in the email body. */
  var sel=f.querySelector('select[name="programme"]'), matched=false;
  if(sel&&key==='programme'){
    for(var i=0;i<sel.options.length;i++){
      if(sel.options[i].text.toLowerCase()===val.toLowerCase()){ sel.selectedIndex=i; matched=true; break; }
    }
  }
  var notes=f.querySelector('[name="notes"]');
  var line=(key==='programme'?'Programme of interest: ':'Asked about: ')+val;
  if(!matched&&notes&&notes.value.indexOf(line)===-1) notes.value=(line+'\n'+notes.value).trim();

  pill.querySelector('button').addEventListener('click',function(){
    f.removeAttribute('data-journey');
    if(sel&&matched) sel.selectedIndex=0;
    if(notes) notes.value=notes.value.replace(line,'').replace(/^\s*\n/,'');
    try{
      var u=new URL(location.href); u.searchParams.delete(key);
      history.replaceState(null,'',u.pathname+(u.search||'')+u.hash);
    }catch(e){}
    pill.remove();
  });
})();

/* ── 2 · EXACT #enquire LANDING ────────────────────────────────
   scrollIntoView on load is not trustworthy on a GSAP page: sections above
   are still resolving their reveal heights when the browser jumps. Zubilant
   lost a session to this. Re-align on a timer, anchored to the form card,
   and stand down the moment the visitor scrolls for themselves. */
(function(){
  if(location.hash!=='#enquire') return;
  var t=document.getElementById('enquire'); if(!t) return;
  var card=t.querySelector('.fcard2')||t;
  var cancelled=false;
  function stand(){ cancelled=true; }
  ['wheel','touchstart','keydown'].forEach(function(ev){
    addEventListener(ev,stand,{passive:true,once:true});
  });
  function align(){
    if(cancelled) return;
    var r=card.getBoundingClientRect();
    var y=r.top+window.pageYOffset-92;               /* clears the floating nav pill */
    if(Math.abs(window.pageYOffset-y)>4) window.scrollTo(0,y);
  }
  align();
  [120,750,1800,3200].forEach(function(ms){ setTimeout(align,ms); });
})();

/* ── 3 · CALLBACK WINDOW CHIPS ─────────────────────────────────
   Krishna, 11 Sep: ticket size is high, so a callback beats an email reply.
   A school office is reachable in windows, not at random, so the form asks
   for the window rather than making a coordinator type it. */
(function(){
  document.querySelectorAll('.cbrow').forEach(function(row){
    var hid=document.getElementById(row.getAttribute('data-target'));
    row.querySelectorAll('.chip').forEach(function(c){
      c.setAttribute('aria-selected','false');
      c.addEventListener('click',function(){
        var on=c.getAttribute('aria-selected')==='true';
        row.querySelectorAll('.chip').forEach(function(o){o.setAttribute('aria-selected','false');});
        c.setAttribute('aria-selected', on?'false':'true');
        if(hid) hid.value = on?'':c.textContent.trim();
      });
    });
  });
})();
