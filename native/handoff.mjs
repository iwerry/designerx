#!/usr/bin/env node
/** DesignerX Native Handoff — original code © 2026 Daniel Rodrigues */
import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';
const pick=(s,re)=>[...s.matchAll(re)].map(x=>x[1]);
export function createHandoff(html){
 const colors=[...new Set(pick(html,/--([a-z-]+)\s*:\s*(#[a-f\d]{3,8})\s*;/gi).map(x=>x))];
 const sections=pick(html,/<section\b[^>]*id=["']([^"']+)["']/gi);
 const links=[...new Set(pick(html,/<a\b[^>]*href=["'](https?:\/\/[^"']+)["']/gi))];
 const breakpoints=[...new Set(pick(html,/@media\s*\(max-width\s*:\s*([^)]+)\)/gi))];
 const lines=['# DesignerX Native Handoff','','Generated from actual source by Daniel Rodrigues’ independent DesignerX engine.','This is an implementation reference, not a UX certification.','',
 '## Sections',...sections.map(x=>'- '+x),'','## Responsive breakpoints',...breakpoints.map(x=>'- '+x),'','## External destinations',...links.map(x=>'- '+x),'',
 '## Acceptance checklist','- [ ] Keyboard traversal and visible focus','- [ ] Mobile navigation at each breakpoint','- [ ] Screen reader landmarks and alt text','- [ ] Light/dark contrast manually measured','- [ ] Reduced motion and no-WebGL fallback','- [ ] All locale copy reviewed by a human','- [ ] Projects and contact links work'];
 return lines.join('\n')+'\n';
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const file=path.resolve(process.argv[2]||'index.html');if(!fs.existsSync(file)){console.error('File not found');process.exitCode=2;}else{const out=createHandoff(fs.readFileSync(file,'utf8'));if(process.argv[3]==='--stdout')process.stdout.write(out);else{const dest=path.resolve(process.argv[3]||'HANDOFF.md');fs.writeFileSync(dest,out);console.log('Wrote '+dest);}}
}
