import test from 'node:test';import assert from 'node:assert/strict';import {inspectLayout} from './layout-guard.mjs';
test('detects hidden content risk',()=>{const r=inspectLayout('<style>.rv{opacity:0}</style>');assert.ok(r.findings.some(x=>x.id==='DXL104'))});
test('detects cursor hint with absolute positioning',()=>{const r=inspectLayout('<style>.hint{position:absolute}</style><p>Move your cursor over the grid</p>');assert.ok(r.findings.some(x=>x.id==='DXL101'))});
test('clean responsive content passes high severity',()=>{const r=inspectLayout('<style>.rv{opacity:1}@media(prefers-reduced-motion:reduce){}</style>');assert.equal(r.findings.filter(x=>x.severity==='high').length,0)});
