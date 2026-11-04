'use strict';
// Motion uses native CSS + one requestAnimationFrame loop that sleeps at rest.
document.getElementById('year').textContent=new Date().getFullYear();
(()=>{
 const root=document.documentElement;
 const preference=window.matchMedia('(prefers-reduced-motion: reduce)');
 const scene=document.querySelector('.art');
 const progress=document.createElement('div');
 progress.className='motion-progress';progress.setAttribute('aria-hidden','true');document.body.append(progress);
 let frame=0,sceneVisible=true,pageVisible=!document.hidden,dirty=true;
 let current={x:0,y:0,tilt:0},target={x:0,y:0,tilt:0},pointer={x:0,y:0},lastTime=0;
 const targets=[...document.querySelectorAll('.art,section .section-top,section .service,section .projects-box,section .step,.about>div,.contact')];
 if('IntersectionObserver' in window){
  const reveal=new IntersectionObserver(entries=>{
   entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');reveal.unobserve(entry.target)}});
  },{threshold:0,rootMargin:'0px 0px -32px 0px'});
  targets.forEach(el=>{el.classList.add('scroll-reveal');if(el.matches('.service,.step'))el.style.setProperty('--reveal-delay',(Array.from(el.parentElement.children).indexOf(el)*100)+'ms');reveal.observe(el)});
  root.classList.add('motion-ready');
  new IntersectionObserver(entries=>{sceneVisible=entries[0].isIntersecting;scene.classList.toggle('motion-sleep',!sceneVisible);if(sceneVisible){dirty=true;queue()}}).observe(scene);
  const sleep=new IntersectionObserver(entries=>entries.forEach(entry=>entry.target.classList.toggle('motion-sleep',!entry.isIntersecting)));
  document.querySelectorAll('.project-symbol,.contact').forEach(el=>sleep.observe(el));
 }
 function queue(){if(!frame&&pageVisible&&!preference.matches)frame=requestAnimationFrame(tick)}
 function tick(time){
  frame=0;if(!pageVisible||preference.matches)return;
  const factor=1-Math.exp(-Math.min(time-(lastTime||time-16),50)/100);lastTime=time;
  if(dirty){
   const max=root.scrollHeight-innerHeight;progress.style.transform='scaleX('+Math.max(0,Math.min(1,max>0?scrollY/max:0))+')';
   if(sceneVisible){const rect=scene.getBoundingClientRect();const travel=Math.max(-1,Math.min(1,(innerHeight*.5-rect.top-rect.height*.5)/innerHeight));target={x:pointer.x*15,y:travel*24+pointer.y*10,tilt:travel*3+pointer.x*4}}
   dirty=false;
  }
  let moving=false;
  if(sceneVisible){for(const key of ['x','y','tilt']){current[key]+=(target[key]-current[key])*factor;if(Math.abs(target[key]-current[key])>.015)moving=true}
   scene.style.setProperty('--scene-x',current.x.toFixed(3)+'px');scene.style.setProperty('--scene-y',current.y.toFixed(3)+'px');scene.style.setProperty('--scene-tilt',current.tilt.toFixed(3)+'deg');
  }
  if(moving)queue();else lastTime=0;
 }
 function changed(){dirty=true;queue()}
 function resetPointer(){pointer={x:0,y:0};changed()}
 function movePointer(e){if(preference.matches)return;const rect=scene.getBoundingClientRect();pointer={x:(e.clientX-rect.left)/rect.width-.5,y:(e.clientY-rect.top)/rect.height-.5};changed()}
 scene.addEventListener('pointermove',e=>{if(e.pointerType==='mouse')movePointer(e)},{passive:true});
 scene.addEventListener('pointerdown',movePointer,{passive:true});
 ['pointerleave','pointerup','pointercancel'].forEach(event=>scene.addEventListener(event,resetPointer,{passive:true}));
 window.addEventListener('scroll',changed,{passive:true});window.addEventListener('resize',changed,{passive:true});
 document.addEventListener('visibilitychange',()=>{pageVisible=!document.hidden;root.classList.toggle('page-asleep',!pageVisible);if(!pageVisible){cancelAnimationFrame(frame);frame=0;lastTime=0}else changed()});
 function applyPreference(){root.classList.toggle('motion-off',preference.matches);if(preference.matches){cancelAnimationFrame(frame);frame=0;scene.style.removeProperty('--scene-x');scene.style.removeProperty('--scene-y');scene.style.removeProperty('--scene-tilt')}else changed()}
 preference.addEventListener('change',applyPreference);applyPreference();
})();
