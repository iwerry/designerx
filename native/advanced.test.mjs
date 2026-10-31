import test from 'node:test';import assert from 'node:assert/strict';
import {inspectContext} from './context.mjs';import {critiqueHTML} from './critique.mjs';
test('context rejects missing mandatory product information',()=>{assert.equal(inspectContext('## Platform\nweb').valid,false)});
test('context accepts a complete product record',()=>{const t='<!-- impeccable:product-schema 1 -->\n'+['Platform','Users','Product Purpose','Positioning','Capabilities and Constraints','Product Principles'].map(n=>'## '+n+'\nvalue').join('\n');assert.equal(inspectContext(t,'---\nname: Example\n---').valid,true)});
test('critique identifies absent portfolio evidence',()=>{const r=critiqueHTML('<html><body></body></html>');assert.ok(r.issues.find(i=>i.id==='DXQ04'))});
test('critique accepts essential structure',()=>{const r=critiqueHTML('<meta name="viewport" content="width=device-width"><style>@media(prefers-reduced-motion:reduce){}</style><nav></nav><h1>Portfolio</h1><section id="work"></section><a href="mailto:test@example.com">Contact</a>');assert.equal(r.issues.length,0)});
