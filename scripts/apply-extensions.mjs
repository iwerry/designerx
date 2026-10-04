#!/usr/bin/env node
/**
 * DesignerX extension injector.
 *
 * Source of truth for DesignerX originals lives in /extensions. This script
 * applies them to every provider copy of the skill (and to /skill, the
 * canonical source) so each AI harness ships the same command set.
 *
 *   node scripts/apply-extensions.mjs
 *
 * Idempotent: running it repeatedly yields the same tree.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DX_VERSION = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8')).version;

const NEW_COMMANDS = {
  signature: {
    row: '| `signature [target]` | Enhance | Define one ownable visual signature for the product and apply it with restraint | [reference/signature.md](reference/signature.md) |',
    description: 'Defines one ownable visual signature for a product (a recognizable structural, type, color, motion, or detail move) and applies it with restraint. Use when the user wants the design to feel distinctive, branded, memorable, or less generic.',
    argumentHint: '[target]',
  },
  localize: {
    row: '| `localize [locale] [target]` | Fix | Adapt copy, formats, and layout to another locale (pt-BR notes included) | [reference/localize.md](reference/localize.md) |',
    description: 'Adapts an interface to another locale: natural copy, plural and gender rules, date, number, and currency formats, right-to-left support, and layouts that survive text expansion. Includes Brazilian Portuguese guidance. Use when the user mentions translation, localization, i18n, pt-BR, or another language or region.',
    argumentHint: '[locale] [target]',
  },
  handoff: {
    row: '| `handoff [target]` | Ship | Write a developer handoff spec (tokens, states, breakpoints, a11y) from the built UI | [reference/handoff.md](reference/handoff.md) |',
    description: 'Writes a developer handoff specification from the interface as built: tokens, component states, breakpoints, content rules, accessibility, motion, and open questions, each backed by a file reference. Use when the user asks for handoff, specs, documentation for engineers, or QA acceptance criteria.',
    argumentHint: '[target]',
  },
};

const SIGNATURE_MARK = '<!-- designerx-signature -->';
const footer = `\n${SIGNATURE_MARK}\n---\n**DesignerX** ${DX_VERSION} · crafted by **Daniel Rodrigues**. Derived from Impeccable (Copyright 2025 Paul Bakaus), Apache-2.0; see NOTICE.md.\n`;

const read = (p) => fs.readFileSync(p, 'utf8');
const write = (p, s) => fs.writeFileSync(p, s);

function skillDirs() {
  const out = [];
  for (const entry of fs.readdirSync(ROOT, { withFileTypes: true })) {
    if (!entry.isDirectory() || !entry.name.startsWith('.')) continue;
    const d = path.join(ROOT, entry.name, 'skills', 'designerx');
    if (fs.existsSync(path.join(d, 'SKILL.md'))) out.push(d);
  }
  return out;
}

function patchSkillMd(file, isSource) {
  let s = read(file);
  // 1) command rows after the `generate` row
  const genRe = /^\| `generate \[n\][^\n]*\n/m;
  if (!genRe.test(s)) throw new Error(`generate row not found in ${file}`);
  for (const [name, c] of Object.entries(NEW_COMMANDS)) {
    if (s.includes(`| \`${name} `)) continue;
    s = s.replace(genRe, (m) => m + c.row + '\n');
  }
  // 2) argument-hint (provider builds only)
  if (!isSource && s.includes('generate] [target]') && !s.includes('signature|handoff|localize')) {
    s = s.replace('generate] [target]', 'generate · signature|handoff|localize] [target]');
  }
  // 3) signature footer
  if (!s.includes(SIGNATURE_MARK)) s = s.replace(/\s*$/, '\n') + footer;
  write(file, s);
}

function patchRecommendLists(refDir) {
  for (const f of ['critique.md', 'audit.md', 'audit.native.md']) {
    const p = path.join(refDir, f);
    if (!fs.existsSync(p)) continue;
    let s = read(p);
    if (s.includes('/designerx handoff')) continue;
    s = s.replace('/designerx harden,', '/designerx handoff, /designerx harden,')
         .replace('/designerx layout,', '/designerx layout, /designerx localize,')
         .replace('/designerx shape,', '/designerx shape, /designerx signature,');
    write(p, s);
  }
}

function patchMetadata(file) {
  const m = JSON.parse(read(file));
  for (const [name, c] of Object.entries(NEW_COMMANDS)) {
    m[name] = { description: c.description, argumentHint: c.argumentHint };
  }
  write(file, JSON.stringify(m, null, 2) + '\n');
  return m;
}

function writePinned(dir, skillMd, meta) {
  // Codex-style harnesses invoke skills as $designerx; everything else uses /designerx.
  const prefix = /\$designerx (?:hooks|doctor)/.test(skillMd) ? '$' : '/';
  const fm = skillMd.match(/^---\n([\s\S]*?)\n---/)[1];
  const hasInvocable = /^user-invocable:/m.test(fm);
  const hasHint = /^argument-hint:/m.test(fm);
  const pinDir = path.join(dir, 'scripts', 'pinned');
  fs.rmSync(pinDir, { recursive: true, force: true });
  fs.mkdirSync(pinDir, { recursive: true });
  for (const [name, c] of Object.entries(meta)) {
    const lines = ['---', `name: ${name}`, `description: ${JSON.stringify(c.description)}`];
    if (hasHint && c.argumentHint) lines.push(`argument-hint: ${JSON.stringify(c.argumentHint)}`);
    if (hasInvocable) lines.push('user-invocable: true');
    lines.push('---', '', '<!-- designerx-pinned-skill -->', '',
      `This is a pinned shortcut for \`${prefix}designerx ${name}\`.`, '',
      `Invoke ${prefix}designerx ${name}, passing along any arguments provided here, and follow its instructions.`, '');
    write(path.join(pinDir, `${name}.md`), lines.join('\n'));
  }
}

function apply(dir, isSource) {
  const refDir = path.join(dir, 'reference');
  const scriptsDir = path.join(dir, 'scripts');
  for (const f of fs.readdirSync(path.join(ROOT, 'extensions', 'reference'))) {
    fs.copyFileSync(path.join(ROOT, 'extensions', 'reference', f), path.join(refDir, f));
  }
  patchRecommendLists(refDir);
  const skillFile = path.join(dir, isSource ? 'SKILL.src.md' : 'SKILL.md');
  patchSkillMd(skillFile, isSource);
  const meta = patchMetadata(path.join(scriptsDir, 'command-metadata.json'));
  if (!isSource) {
    for (const f of ['designerx', 'designerx.cmd', 'help.txt', 'brand.sed']) {
      fs.copyFileSync(path.join(ROOT, 'skill', 'scripts', f), path.join(scriptsDir, f));
    }
    fs.chmodSync(path.join(scriptsDir, 'designerx'), 0o755);
    writePinned(dir, read(skillFile), meta);
  }
}

const sourceDir = path.join(ROOT, 'skill');
apply(sourceDir, true);
const dirs = skillDirs();
for (const d of dirs) apply(d, false);
console.log(`DesignerX ${DX_VERSION}: extensions applied to source + ${dirs.length} provider skill folders.`);
