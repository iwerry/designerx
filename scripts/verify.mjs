#!/usr/bin/env node
// Consistency checks for the DesignerX repo. Exit 1 on any failure.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const errs = [];
const need = (cond, msg) => { if (!cond) errs.push(msg); };
const NEW = ['signature', 'handoff', 'localize'];
let n = 0;
for (const e of fs.readdirSync(ROOT, { withFileTypes: true })) {
  if (!e.isDirectory() || !e.name.startsWith('.')) continue;
  const d = path.join(ROOT, e.name, 'skills', 'designerx');
  if (!fs.existsSync(path.join(d, 'SKILL.md'))) continue;
  n++;
  const sk = fs.readFileSync(path.join(d, 'SKILL.md'), 'utf8');
  need(/^name: designerx$/m.test(sk), `${e.name}: frontmatter name is not designerx`);
  need(sk.includes('designerx-signature'), `${e.name}: missing signature footer`);
  for (const c of NEW) {
    need(sk.includes(`| \`${c} `), `${e.name}: command row ${c} missing`);
    need(fs.existsSync(path.join(d, 'reference', `${c}.md`)), `${e.name}: reference ${c}.md missing`);
    need(fs.existsSync(path.join(d, 'scripts', 'pinned', `${c}.md`)), `${e.name}: pinned ${c}.md missing`);
  }
  for (const f of ['designerx', 'designerx.cmd', 'help.txt', 'brand.sed', 'VERSION', 'command-metadata.json'])
    need(fs.existsSync(path.join(d, 'scripts', f)), `${e.name}: scripts/${f} missing`);
  // every reference linked from the table exists
  for (const m of sk.matchAll(/\]\((reference\/[^)]+)\)/g)) need(fs.existsSync(path.join(d, m[1].split('#')[0])), `${e.name}: broken link ${m[1]}`);
  // brand leaks in prose (protocol tokens are allowed)
  const leak = /(?<![.\w-])\/impeccable\b|\$impeccable\b|skills\/impeccable/;
  for (const f of ['SKILL.md']) need(!leak.test(fs.readFileSync(path.join(d, f), 'utf8')), `${e.name}: old command name leaked in ${f}`);
}
need(n >= 18, `expected >= 18 platform folders, found ${n}`);
for (const f of ['LICENSE', 'NOTICE.md', 'README.md', 'docs/DesignerX-Manual.pdf', 'bin/designerx.mjs'])
  need(fs.existsSync(path.join(ROOT, f)), `${f} missing`);
if (errs.length) { console.error('FAIL\n' + errs.map((x) => ' - ' + x).join('\n')); process.exit(1); }
console.log(`OK: ${n} platform folders verified.`);
