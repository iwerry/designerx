#!/usr/bin/env node
/** DesignerX Native Motion — original code © 2026 Daniel Rodrigues */
import fs from 'node:fs'; import path from 'node:path'; import {fileURLToPath} from 'node:url';
export function inspectMotion(source){
 const findings=[];const add=(id,severity,message,action)=>findings.push({id,severity,message,action});
 const css=(source.match(/<style[^>]*>([\s\S]*?)<\/style>/gi)||[]).join('\n')+source;
 const anim=(css.match(/animation\s*:/g)||[]).length;
 if(anim && !/prefers-reduced-motion/i.test(css))add('DXM01','high','Animations without reduced-motion treatment','Add a prefers-reduced-motion media query.');
 if(/animation\s*:[^;}]*infinite/i.test(css))add('DXM02','low','Infinite animation detected','Verify it has purpose and pauses when offscreen.');
 if(/transition\s*:\s*all\b/i.test(css))add('DXM03','medium','Unbounded transition: all','List only animated properties to avoid layout cost.');
 if(/will-change\s*:\s*transform/i.test(css))add('DXM04','low','Persistent will-change hint','Apply sparingly and measure layer memory.');
 if(/scroll-behavior\s*:\s*smooth/i.test(css)&&!/prefers-reduced-motion/i.test(css))add('DXM05','medium','Smooth scroll without opt-out','Disable smooth scroll for reduced motion.');
 return {engine:'DesignerX Native Motion',author:'Daniel Rodrigues',animationsDetected:anim,findings,scope:'Static motion checks, not a frame-time benchmark.'};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const f=path.resolve(process.argv[2]||'index.html');if(!fs.existsSync(f)){console.error('File not found');process.exitCode=2;}else{const r=inspectMotion(fs.readFileSync(f,'utf8'));console.log(JSON.stringify(r,null,2));if(r.findings.some(x=>x.severity==='high'))process.exitCode=1;}
}
