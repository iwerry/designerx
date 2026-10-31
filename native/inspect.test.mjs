import test from 'node:test';
import assert from 'node:assert/strict';
import {inspectHTML} from './inspect.mjs';
test('flags structural accessibility gaps', () => {
 const r=inspectHTML('<html><head></head><body><img src="x"></body></html>');
 assert.ok(r.findings.some(x=>x.id==='DX101'));
 assert.ok(r.findings.some(x=>x.id==='DX109'));
});
test('recognizes sound semantic foundation',()=>{
 const r=inspectHTML(`<html lang="en"><head><meta name="viewport" content="width=device-width"><meta name="description" content="Example"><title>Test</title><style>:focus-visible{} @media(prefers-reduced-motion:reduce){}</style></head><body><a href="#main">Skip</a><main id="main"><img src="x" alt="" width="20" height="20"></main></body></html>`);
 assert.equal(r.findings.length,0);
});
