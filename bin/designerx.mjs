#!/usr/bin/env node
/**
 * DesignerX CLI: universal installer + terminal verbs.
 * Crafted by Daniel Rodrigues. Apache-2.0 (derived from Impeccable by Paul Bakaus; see NOTICE.md).
 *
 *   designerx install [--providers=claude,cursor|all] [--global] [--dir <path>] [--no-hooks]
 *   designerx uninstall [--providers=...] [--global] [--dir <path>]
 *   designerx list
 *   designerx <engine verb> ...      detect | context | hooks | doctor | ignores | pin | help | version
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const PKG = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const VERSION = JSON.parse(fs.readFileSync(path.join(PKG, 'package.json'), 'utf8')).version;
const OWNS = 'skills/designerx/scripts/designerx';

// key -> where the skill lives, plus optional hook manifest handling.
const PROVIDERS = {
  claude:      { label: 'Claude Code',        dir: '.claude',   manifest: '.claude/settings.json' },
  cursor:      { label: 'Cursor',             dir: '.cursor',   manifest: '.cursor/hooks.json' },
  codex:       { label: 'OpenAI Codex',       dir: '.agents',   manifest: '.codex/hooks.json' },
  gemini:      { label: 'Gemini CLI',         dir: '.gemini',   manifest: '.gemini/settings.json' },
  copilot:     { label: 'GitHub Copilot',     dir: '.github',   own: ['.github/hooks/designerx.json'] },
  opencode:    { label: 'OpenCode',           dir: '.opencode' },
  grok:        { label: 'Grok Build',         dir: '.grok',     own: ['.grok/hooks/designerx.json'] },
  antigravity: { label: 'Antigravity',        dir: '.agent' },
  kiro:        { label: 'Kiro',               dir: '.kiro' },
  pi:          { label: 'Pi',                 dir: '.pi' },
  qoder:       { label: 'Qoder',              dir: '.qoder' },
  rovodev:     { label: 'Rovo Dev',           dir: '.rovodev' },
  trae:        { label: 'Trae',               dir: '.trae' },
  'trae-cn':   { label: 'Trae China',         dir: '.trae-cn' },
  hermes:      { label: 'Hermes',             dir: '.hermes' },
  vibe:        { label: 'Mistral Vibe',       dir: '.vibe' },
  veto:        { label: 'Veto',               dir: '.veto' },
  dsh:         { label: 'DeepSeek Harness',   dir: '.dsh' },
};

const tty = process.stdout.isTTY;
const c = (n, s) => (tty ? `\x1b[${n}m${s}\x1b[0m` : s);
const bold = (s) => c(1, s), dim = (s) => c(2, s), green = (s) => c(32, s), red = (s) => c(31, s), cyan = (s) => c(36, s);

function parseArgs(argv) {
  const o = { _: [], flags: {} };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const [k, v] = a.slice(2).split('=');
      if (v !== undefined) o.flags[k] = v;
      else if (['dir', 'providers'].includes(k) && argv[i + 1] && !argv[i + 1].startsWith('--')) o.flags[k] = argv[++i];
      else o.flags[k] = true;
    } else o._.push(a);
  }
  return o;
}

function banner() {
  console.log(`\n  ${bold('DesignerX')} ${dim(VERSION)}  ${dim('· crafted by Daniel Rodrigues')}\n`);
}

function rmrf(p) { fs.rmSync(p, { recursive: true, force: true }); }
function copyDir(src, dst) {
  rmrf(dst);
  fs.mkdirSync(path.dirname(dst), { recursive: true });
  fs.cpSync(src, dst, { recursive: true });
  const launcher = path.join(dst, 'scripts', 'designerx');
  if (fs.existsSync(launcher)) fs.chmodSync(launcher, 0o755);
}
function copyFile(src, dst) { fs.mkdirSync(path.dirname(dst), { recursive: true }); fs.copyFileSync(src, dst); }
const ownsDX = (entry) => JSON.stringify(entry).includes(OWNS);

function mergeManifest(srcFile, dstFile) {
  const src = fs.readFileSync(srcFile, 'utf8');
  const incoming = JSON.parse(src);
  let dst = {};
  if (fs.existsSync(dstFile)) {
    try { dst = JSON.parse(fs.readFileSync(dstFile, 'utf8')); }
    catch { throw new Error(`${dstFile} is not valid JSON; refusing to overwrite it. Fix or remove it, then retry.`); }
  }
  for (const [k, v] of Object.entries(incoming)) if (k !== 'hooks' && dst[k] === undefined) dst[k] = v;
  dst.hooks ??= {};
  for (const [ev, arr] of Object.entries(incoming.hooks ?? {})) {
    dst.hooks[ev] = (dst.hooks[ev] ?? []).filter((e) => !ownsDX(e)).concat(arr);
  }
  fs.mkdirSync(path.dirname(dstFile), { recursive: true });
  fs.writeFileSync(dstFile, JSON.stringify(dst, null, 2) + '\n');
}

function stripManifest(file) {
  if (!fs.existsSync(file)) return false;
  let j; try { j = JSON.parse(fs.readFileSync(file, 'utf8')); } catch { return false; }
  let changed = false;
  for (const ev of Object.keys(j.hooks ?? {})) {
    const kept = j.hooks[ev].filter((e) => !ownsDX(e));
    if (kept.length !== j.hooks[ev].length) { changed = true; j.hooks[ev] = kept; }
    if (j.hooks[ev].length === 0) delete j.hooks[ev];
  }
  if (changed) {
    const rest = Object.keys(j).filter((k) => !['description', 'version', 'hooks'].includes(k));
    if (!rest.length && Object.keys(j.hooks ?? {}).length === 0) fs.rmSync(file, { force: true });
    else fs.writeFileSync(file, JSON.stringify(j, null, 2) + '\n');
  }
  return changed;
}

function resolveTargets(flags) {
  const root = flags.global ? os.homedir() : path.resolve(flags.dir || process.cwd());
  let keys;
  if (!flags.providers || flags.providers === true) {
    keys = Object.keys(PROVIDERS).filter((k) => fs.existsSync(path.join(root, PROVIDERS[k].dir)));
    if (!keys.length) {
      console.error(red('No AI harness folder detected in ') + root + '.\nPass ' + bold('--providers=claude,cursor') + ' (or ' + bold('--providers=all') + '). See: designerx list');
      process.exit(1);
    }
  } else if (flags.providers === 'all') keys = Object.keys(PROVIDERS);
  else keys = String(flags.providers).split(',').map((s) => s.trim()).filter(Boolean).map((k) => (k === 'agents' ? 'codex' : k));
  for (const k of keys) if (!PROVIDERS[k]) { console.error(red(`Unknown provider "${k}". Run: designerx list`)); process.exit(1); }
  return { root, keys };
}

function install(flags) {
  const { root, keys } = resolveTargets(flags);
  banner();
  console.log(`  Installing into ${cyan(root)}${flags.global ? dim('  (global; hooks are not touched)') : ''}\n`);
  for (const k of keys) {
    const p = PROVIDERS[k];
    const srcSkill = path.join(PKG, p.dir, 'skills', 'designerx');
    if (!fs.existsSync(srcSkill)) { console.log(`  ${red('✗')} ${p.label}: skill not found in package`); continue; }
    copyDir(srcSkill, path.join(root, p.dir, 'skills', 'designerx'));
    const agentsDir = path.join(PKG, p.dir, 'agents');
    if (fs.existsSync(agentsDir)) for (const f of fs.readdirSync(agentsDir)) if (f.startsWith('designerx')) copyFile(path.join(agentsDir, f), path.join(root, p.dir, 'agents', f));
    const cmd = path.join(PKG, p.dir, 'commands', 'designerx.md');
    if (fs.existsSync(cmd)) copyFile(cmd, path.join(root, p.dir, 'commands', 'designerx.md'));
    let hooks = '';
    if (!flags['no-hooks'] && !flags.global) {
      for (const f of p.own ?? []) { copyFile(path.join(PKG, f), path.join(root, f)); hooks = 'hooks'; }
      if (p.manifest) {
        mergeManifest(path.join(PKG, p.manifest), path.join(root, p.manifest));
        hooks = 'hooks merged';
      }
    }
    console.log(`  ${green('✓')} ${p.label.padEnd(18)} ${dim(path.join(p.dir, 'skills', 'designerx'))}${hooks ? dim('  + ' + hooks) : ''}`);
  }
  console.log(`\n  Done. In your agent, try ${bold(k0(keys))}  ${dim('(or run with no argument for a menu)')}`);
  console.log(`  Terminal: ${bold('npx designerx detect src/')}   ${dim('· manual: docs/DesignerX-Manual.pdf')}\n`);
}
const k0 = (keys) => (keys[0] === 'codex' ? '$designerx audit' : '/designerx audit');

function uninstall(flags) {
  const { root, keys } = resolveTargets(flags);
  banner();
  for (const k of keys) {
    const p = PROVIDERS[k];
    let removed = 0;
    const tryRm = (rel) => { const t = path.join(root, rel); if (fs.existsSync(t)) { rmrf(t); removed++; } };
    tryRm(path.join(p.dir, 'skills', 'designerx'));
    const agentsDir = path.join(root, p.dir, 'agents');
    if (fs.existsSync(agentsDir)) for (const f of fs.readdirSync(agentsDir)) if (f.startsWith('designerx')) { rmrf(path.join(agentsDir, f)); removed++; }
    tryRm(path.join(p.dir, 'commands', 'designerx.md'));
    for (const f of p.own ?? []) tryRm(f);
    if (p.manifest && stripManifest(path.join(root, p.manifest))) removed++;
    console.log(`  ${removed ? green('✓') : dim('·')} ${p.label.padEnd(18)} ${removed ? 'removed' : dim('nothing to remove')}`);
  }
  console.log(dim('\n  Project files (PRODUCT.md, DESIGN.md, .impeccable/) were left untouched.\n'));
}

function list() {
  banner();
  for (const [k, p] of Object.entries(PROVIDERS)) console.log(`  ${k.padEnd(12)} ${p.label.padEnd(20)} ${dim(p.dir + '/skills/designerx')}`);
  console.log(`\n  ${dim('Use:')} designerx install --providers=claude,cursor   ${dim('|')}  --providers=all   ${dim('|')}  --global\n`);
}

function findLauncher() {
  let dir = process.cwd();
  for (;;) {
    for (const p of Object.values(PROVIDERS)) {
      const f = path.join(dir, p.dir, 'skills', 'designerx', 'scripts', process.platform === 'win32' ? 'designerx.cmd' : 'designerx');
      if (fs.existsSync(f)) return f;
    }
    const up = path.dirname(dir);
    if (up === dir) break;
    dir = up;
  }
  return path.join(PKG, '.claude', 'skills', 'designerx', 'scripts', process.platform === 'win32' ? 'designerx.cmd' : 'designerx');
}

function forward(args) {
  const launcher = findLauncher();
  if (process.platform !== 'win32') { try { fs.chmodSync(launcher, 0o755); } catch {} }
  const r = spawnSync(launcher, args, { stdio: 'inherit', shell: process.platform === 'win32' });
  process.exit(r.status ?? 1);
}

const { _: pos, flags } = parseArgs(process.argv.slice(2));
const cmd = pos[0];
if (cmd === 'install') install(flags);
else if (cmd === 'uninstall') uninstall(flags);
else if (cmd === 'list' || cmd === 'providers') list();
else if (!cmd || cmd === '-h' || cmd === '--help') { forward(['help']); }
else forward(process.argv.slice(2));
