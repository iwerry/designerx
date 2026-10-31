#!/usr/bin/env node
/** DesignerX Native Context © 2026 Daniel Rodrigues. Independent implementation. */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const required=['Platform','Users','Product Purpose','Positioning','Capabilities and Constraints','Product Principles'];
export function parseContext(markdown){
 const sections={};let current=null;
 for(const line of markdown.split(/\r?\n/)){const m=/^## (.+?)\s*$/.exec(line);if(m){current=m[1];sections[current]=[];}else if(current)sections[current].push(line);}
 return Object.fromEntries(Object.entries(sections).map(([k,v])=>[k,v.join('\n').trim()]));
}
export function inspectContext(product,design=''){
 const p=parseContext(product);const issues=[];
 for(const name of required)if(!p[name])issues.push({id:'DXC01',severity:'medium',message:'Missing or empty PRODUCT.md section: '+name});
 if(!/impeccable:product-schema\s+\d+/.test(product))issues.push({id:'DXC02',severity:'low',message:'Missing product schema version'});
 if(!design.trim())issues.push({id:'DXC03',severity:'low',message:'DESIGN.md unavailable; design tokens not checked'});
 else if(!/^---\s*\n/.test(design))issues.push({id:'DXC04',severity:'medium',message:'DESIGN.md missing YAML frontmatter'});
 return {engine:'DesignerX Native Context',author:'Daniel Rodrigues',sections:Object.keys(p),issues,valid:!issues.some(i=>i.severity==='medium')};
}
function cli(){const root=path.resolve(process.argv[2]||'.');const prod=path.join(root,'PRODUCT.md'),design=path.join(root,'DESIGN.md');if(!fs.existsSync(prod)){console.error('PRODUCT.md not found');process.exitCode=2;return;}const result=inspectContext(fs.readFileSync(prod,'utf8'),fs.existsSync(design)?fs.readFileSync(design,'utf8'):'');console.log(JSON.stringify(result,null,2));if(!result.valid)process.exitCode=1;}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))cli();
