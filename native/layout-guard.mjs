#!/usr/bin/env node
/** DesignerX Native Layout Guard © 2026 Daniel Rodrigues.
 * Static layout-risk detector. For actual overlap, pair with browser geometry tests.
 */
import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';
export function inspectLayout(source){
 const findings=[];const add=(id,severity,message,action)=>findings.push({id,severity,message,action});
 const css=(source.match(/<style[^>]*>([\s\S]*?)<\/style>/gi)||[]).join('\n');
 const rules=[...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map(m=>({selector:m[1].trim(),declarations:m[2]}));
 const hero=rules.filter(x=>/(?:header|#top|h1|\.sub|\.hint|\.cta)/.test(x.selector));
 const abs=hero.filter(x=>/position\s*:\s*absolute/.test(x.declarations));
 if(abs.some(x=>/\.hint/.test(x.selector))&&/Move your cursor over the grid/i.test(source))
  add('DXL101','medium','Legacy cursor hint overlaps hero CTA in compact viewports','Remove hint when WebGL interaction is absent.');
 if(/<canvas\s+id=["']gl["']/.test(source)&&/\.hero-grid/.test(css))
  add('DXL102','high','CSS grid and WebGL canvas coexist','Remove unused canvas and JS rendering.');
 if(/h1\s*\{[^}]*font\s*:[^;]*\b1[2-9]vw\b/.test(css)&&!/@media\s*\(max-width/i.test(css))
  add('DXL103','medium','Oversized viewport-based title without responsive override','Use clamp and mobile-safe breakpoints.');
 if(/\.rv\{[^}]*opacity\s*:\s*0/.test(css))
  add('DXL104','high','Content hidden by default; script failure may blank page','Keep content visible by default; enhancement should be optional.');
 if(!/prefers-reduced-motion/.test(css))
  add('DXL105','medium','Reduced-motion strategy not found','Add reduced-motion fallback to motion effects.');
 return {engine:'DesignerX Native Layout Guard',author:'Daniel Rodrigues',findings,scope:'Source-only risk detection; pixel overlaps need browser measurement.'};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const p=path.resolve(process.argv[2]||'index.html');if(!fs.existsSync(p)){console.error('Not found');process.exitCode=2;}else{const r=inspectLayout(fs.readFileSync(p,'utf8'));console.log(JSON.stringify(r,null,2));if(r.findings.some(f=>f.severity==='high'))process.exitCode=1;}
}
