import test from 'node:test';import assert from 'node:assert/strict';
import {inspectMotion} from './motion.mjs';import {createHandoff} from './handoff.mjs';
test('motion reports no reduced motion',()=>assert.ok(inspectMotion('<style>.a{animation:spin 2s infinite}</style>').findings.find(x=>x.id==='DXM01')));
test('motion accepts reduced motion',()=>assert.equal(inspectMotion('<style>.a{animation:spin 2s}@media(prefers-reduced-motion:reduce){.a{animation:none}}</style>').findings.filter(x=>x.severity==='high').length,0));
test('handoff extracts real sections',()=>{const s=createHandoff('<section id="work"></section><a href="https://example.com">Link</a>');assert.match(s,/work/);assert.match(s,/https:\/\/example.com/)});
