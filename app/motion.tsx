'use client';
import { useEffect,useState } from 'react';
export function MotionLayer({routeKey}:{routeKey:string}) {
 useEffect(()=>{
  const root=document.documentElement,preference=window.matchMedia('(prefers-reduced-motion: reduce)');let observer:IntersectionObserver|undefined,frame=0;
  const apply=()=>{frame=0;const y=window.scrollY;root.style.setProperty('--page-progress',String(Math.min(1,Math.max(0,y/Math.max(1,root.scrollHeight-window.innerHeight)))));root.style.setProperty('--hero-drift',`${Math.min(y*.09,65)}px`);const scrolled=root.classList.contains('page-scrolled');if(!scrolled&&y>80)root.classList.add('page-scrolled');else if(scrolled&&y<20)root.classList.remove('page-scrolled');};
  const scroll=()=>{if(!frame)frame=requestAnimationFrame(apply);};
  const setup=()=>{observer?.disconnect();root.classList.remove('motion-ready');if(preference.matches)return;if('IntersectionObserver' in window){root.classList.add('motion-ready');observer=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){entry.target.classList.add('in-view');observer?.unobserve(entry.target);}},{threshold:.06,rootMargin:'0px 0px 25px 0px'});document.querySelectorAll('[data-reveal]').forEach(el=>observer?.observe(el));}scroll();};
  setup();preference.addEventListener('change',setup);window.addEventListener('scroll',scroll,{passive:true});window.addEventListener('resize',scroll);
  return()=>{observer?.disconnect();cancelAnimationFrame(frame);preference.removeEventListener('change',setup);window.removeEventListener('scroll',scroll);window.removeEventListener('resize',scroll);root.classList.remove('motion-ready','page-scrolled');root.style.removeProperty('--hero-drift');root.style.removeProperty('--page-progress');};
 },[routeKey]);return <div className="reading-progress" aria-hidden="true"/>;
}

export function MotionToggle(){const [off,setOff]=useState(false);useEffect(()=>{try{const disabled=localStorage.getItem('be3a-motion-off')==='true';setOff(disabled);document.documentElement.classList.toggle('motion-disabled',disabled);}catch{}},[]);function toggle(){const next=!off;setOff(next);document.documentElement.classList.toggle('motion-disabled',next);try{localStorage.setItem('be3a-motion-off',String(next));}catch{}}return <button className="motion-toggle" aria-pressed={off} onClick={toggle}>{off?'تشغيل الحركة':'إيقاف الحركة'}</button>;}
