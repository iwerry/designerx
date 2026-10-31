#!/usr/bin/env node
/** DesignerX Native Critique © 2026 Daniel Rodrigues. Evidence-only static heuristics. */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
export function critiqueHTML(html){
 const issues=[];const add=(id,severity,evidence,action)=>issues.push({id,severity,evidence,action});
 if(!/<h1\b/i.test(html))add('DXQ01','high','No primary heading detected','Add a visible h1 describing the portfolio.');
 if((html.match(/<h1\b/gi)||[]).length>1)add('DXQ02','medium','Multiple h1 elements','Use a clear heading hierarchy.');
 if(!/<nav\b/i.test(html))add('DXQ03','medium','No navigation landmark','Provide navigation for major sections.');
 if(!/<section\b[^>]*id=["']work["']/i.test(html))add('DXQ04','medium','No identifiable work section','Make evidence of work readily findable.');
 if(!/mailto:/i.test(html))add('DXQ05','high','No email contact action','Provide a working contact path.');
 if(!/prefers-reduced-motion/i.test(html))add('DXQ06','high','No reduced-motion strategy','Honor reduced-motion preference.');
 if(/display\s*:\s*none[^}]*}/i.test(html)&&/nav\s+ul\s*\{display\s*:\s*none/i.test(html))add('DXQ07','high','Mobile nav hidden','Make navigation discoverable on phones.');
 if(!/aria-pressed/i.test(html)&&/data-lang/i.test(html))add('DXQ08','low','Locale controls lack state evidence','Expose selected locale on language controls.');
 if(!/content=["']width=device-width/i.test(html))add('DXQ09','medium','Viewport configuration not detected','Set device-width viewport.');
 return {engine:'DesignerX Native Critique',author:'Daniel Rodrigues',issues,heuristicScore:Math.max(0,100-issues.reduce((a,x)=>a+({high:10,medium:4,low:2}[x.severity]),0)),disclaimer:'Static source heuristics; no actual usability testing or WCAG compliance claim.'};
}
function cli(){const file=path.resolve(process.argv[2]||'index.html');if(!fs.existsSync(file)){console.error('File not found: '+file);process.exitCode=2;return;}const r=critiqueHTML(fs.readFileSync(file,'utf8'));console.log(JSON.stringify(r,null,2));if(r.issues.some(x=>x.severity==='high'))process.exitCode=1;}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))cli();
