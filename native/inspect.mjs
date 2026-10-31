#!/usr/bin/env node
/**
 * DesignerX Native / Inspect v1
 * Original implementation © 2026 Daniel Rodrigues.
 * Static evidence auditor. Does not use the Impeccable engine.
 * No external dependencies; Node.js >= 18.
 */
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

export function inspectHTML(source, filename = 'index.html') {
  const findings = [];
  const add = (id, severity, message, remediation) =>
    findings.push({ id, severity, file: filename, message, remediation });
  const clean = source.replace(/<!--[^]*?-->/g, '');
  const has = (re) => re.test(clean);
  if (!has(/<html\b[^>]*\blang\s*=\s*["'][^"']+["']/i))
    add('DX101', 'high', 'Missing document language', 'Declare html lang and update it when changing locale.');
  if (!has(/<meta\s+name=["']viewport["']/i))
    add('DX102', 'high', 'Missing viewport metadata', 'Set width=device-width, initial-scale=1.');
  if (!has(/<main\b/i))
    add('DX103', 'medium', 'Missing main landmark', 'Wrap principal page content in <main id="main">.');
  if (!has(/<a\b[^>]+href=["']#main["']/i))
    add('DX104', 'medium', 'Missing skip navigation', 'Add a keyboard-visible Skip to content link.');
  if (!has(/:focus-visible\s*\{/i))
    add('DX105', 'medium', 'No focus-visible rule detected', 'Add a visible focus style.');
  if (!has(/prefers-reduced-motion/i))
    add('DX106', 'medium', 'No reduced-motion fallback', 'Disable essential movement for reduced-motion users.');
  if (!has(/<title\b[^>]*>\s*[^<]+<\/title>/i))
    add('DX107', 'medium', 'Missing title content', 'Provide a concise page title.');
  if (!has(/<meta\s+name=["']description["']/i))
    add('DX108', 'low', 'Missing description', 'Add a factual search description.');
  const imageTags = clean.match(/<img\b[^>]*>/gi) || [];
  for (const [i, tag] of imageTags.entries()) {
    if (!/\balt\s*=/.test(tag))
      add('DX109', 'high', `Image ${i + 1} has no alt attribute`, 'Provide useful alt text or alt="" when decorative.');
    if (!/\b(width|height)\s*=/.test(tag))
      add('DX110', 'low', `Image ${i + 1} lacks explicit dimensions`, 'Add width and height to help reserve layout space.');
  }
  if (has(/<canvas\b/i) && !has(/<canvas\b[^>]*aria-hidden/i))
    add('DX111', 'low', 'Canvas may be announced by assistive technology', 'If decorative, mark aria-hidden=true.');
  const links = clean.match(/<a\b[^>]*target=["']_blank["'][^>]*>/gi) || [];
  for (const [i, tag] of links.entries()) if (!/rel=["'][^"']*noopener/i.test(tag))
    add('DX112', 'medium', `External link ${i + 1} lacks rel=noopener`, 'Use rel="noopener noreferrer".');
  if (has(/<nav\b/i) && has(/nav\s+ul\s*\{display\s*:\s*none/i))
    add('DX113', 'high', 'Navigation hidden on small screens', 'Provide accessible mobile navigation or alternate menu.');
  const scores = { high: 5, medium: 2, low: 1 };
  const score = Math.max(0, 100 - findings.reduce((sum, f) => sum + scores[f.severity], 0));
  return { engine: 'DesignerX Native Inspect', author: 'Daniel Rodrigues', filename,
    score, findings, checks: 13, scope: 'Static heuristics only; not a WCAG certification.' };
}

function main(args) {
  const target = args.find(a => !a.startsWith('--'));
  if (!target) { process.stderr.write('Usage: node native/inspect.mjs <html-file> [--json]\n'); process.exitCode = 2; return; }
  const file = path.resolve(target);
  if (!fs.existsSync(file) || !fs.statSync(file).isFile()) { process.stderr.write('File not found: ' + file + '\n'); process.exitCode = 2; return; }
  const report = inspectHTML(fs.readFileSync(file, 'utf8'), path.relative(process.cwd(), file));
  const json = args.includes('--json');
  if (json) process.stdout.write(JSON.stringify(report, null, 2) + '\n');
  else {
    process.stdout.write(`DesignerX Native Inspect | ${report.filename} | ${report.score}/100\n`);
    for (const f of report.findings) process.stdout.write(`[${f.severity}] ${f.id}: ${f.message}\n  -> ${f.remediation}\n`);
    process.stdout.write(report.findings.length ? '' : 'No issues detected by these static checks.\n');
  }
  if (report.findings.some(f => f.severity === 'high')) process.exitCode = 1;
}
const self = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname);
if (self) main(process.argv.slice(2));
