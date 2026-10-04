#!/usr/bin/env python3
"""Builds docs/DesignerX-Manual.pdf. Usage: python3 docs/build_manual.py"""
import os
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_LEFT
from reportlab.platypus import (BaseDocTemplate, PageTemplate, Frame, Paragraph, Spacer, Table,
                                TableStyle, PageBreak, KeepTogether, Preformatted, NextPageTemplate)

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "DesignerX-Manual.pdf")
VERSION = "1.0.0"
INK = colors.HexColor("#14161c"); ACCENT = colors.HexColor("#d9480f"); MUTED = colors.HexColor("#5b6070")
SOFT = colors.HexColor("#f4f1ec"); LINE = colors.HexColor("#d8d3ca"); CODEBG = colors.HexColor("#1b1e27")

def S(name, **kw):
    base = dict(fontName="Helvetica", fontSize=9.6, leading=14, textColor=INK, alignment=TA_LEFT)
    base.update(kw); return ParagraphStyle(name, **base)
body = S("body"); small = S("small", fontSize=8.2, leading=11.5, textColor=MUTED)
h1 = S("h1", fontName="Helvetica-Bold", fontSize=22, leading=26, spaceBefore=4, spaceAfter=10, keepWithNext=1)
h2 = S("h2", fontName="Helvetica-Bold", fontSize=13.5, leading=17, spaceBefore=12, spaceAfter=5, textColor=ACCENT, keepWithNext=1)
h3 = S("h3", fontName="Helvetica-Bold", fontSize=10.5, leading=14, spaceBefore=6, spaceAfter=2)
lab = S("lab", fontName="Helvetica-Bold", fontSize=7.6, leading=10, textColor=MUTED)
cell = S("cell", fontSize=8.6, leading=11.5); cellb = S("cellb", fontName="Helvetica-Bold", fontSize=8.6, leading=11.5)
code = ParagraphStyle("code", fontName="Courier", fontSize=8.4, leading=11.5, textColor=colors.HexColor("#e8e6df"))

def P(t, st=body): return Paragraph(t, st)
CW = A4[0] - 36*mm
def C(t):
    box = Table([[Preformatted(t, code)]], colWidths=[CW])
    box.setStyle(TableStyle([("BACKGROUND", (0, 0), (-1, -1), CODEBG), ("LEFTPADDING", (0, 0), (-1, -1), 10),
                             ("TOPPADDING", (0, 0), (-1, -1), 7), ("BOTTOMPADDING", (0, 0), (-1, -1), 7)]))
    box.spaceBefore = 3; box.spaceAfter = 8
    return box
def esc(t): return t.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")

def tbl(rows, widths, head=True):
    data = [[Paragraph(esc(c) if isinstance(c, str) and not c.startswith("<") else c, cellb if (head and i == 0) else cell) for c in r] for i, r in enumerate(rows)]
    t = Table(data, colWidths=widths, repeatRows=1 if head else 0)
    st = [("VALIGN", (0, 0), (-1, -1), "TOP"), ("LINEBELOW", (0, 0), (-1, -1), 0.4, LINE),
          ("TOPPADDING", (0, 0), (-1, -1), 4), ("BOTTOMPADDING", (0, 0), (-1, -1), 4)]
    if head: st += [("BACKGROUND", (0, 0), (-1, 0), SOFT), ("LINEBELOW", (0, 0), (-1, 0), 0.8, INK)]
    t.setStyle(TableStyle(st)); return t

# ---------------------------------------------------------------- commands
CMDS = [
 # name, args, category, one-liner, what it does, example, tip
 ("craft", "[feature]", "Build", "Deprecated alias for an ordinary new-work request.",
  "Kept for muscle memory. It routes to the same new-work flow as simply describing the feature you want, with design context loaded first.",
  "/designerx craft pricing page for a B2B invoicing tool", "Prefer plain requests or `shape` followed by implementation."),
 ("shape", "[feature]", "Build", "Plan UX/UI before writing code.",
  "Runs a short discovery, then produces a design brief: users, goals, content, structure, states and constraints. No code is written until you confirm the brief.",
  "/designerx shape onboarding for a habit-tracking app", "Use before big features. A confirmed brief makes every later command sharper."),
 ("init", "", "Build", "Capture durable product context in PRODUCT.md.",
  "Interviews you once about users, purpose, brand and principles and writes PRODUCT.md. Every other command reads it, so output stops sounding generic.",
  "/designerx init", "Run it first in any new project. Re-run when the product direction changes."),
 ("document", "", "Build", "Generate DESIGN.md from existing project code.",
  "Reads your real CSS, tokens and components and writes DESIGN.md (palette, type, spacing, components) so the design system is written down.",
  "/designerx document", "Run after `init`; re-run after large refactors to keep it honest."),
 ("extract", "[target]", "Build", "Pull reusable tokens and components into a design system.",
  "Finds repeated colors, spacing values and UI patterns in the target and consolidates them into tokens and shared components.",
  "/designerx extract src/components/checkout", "Review the proposed token names before accepting the refactor."),
 ("critique", "[target]", "Evaluate", "UX design review with heuristic scoring.",
  "Scores hierarchy, clarity, consistency, emotional fit and more, then lists prioritized fixes and recommends which DesignerX commands to run next.",
  "/designerx critique the dashboard header", "Use it as a second opinion before polishing."),
 ("audit", "[target]", "Evaluate", "Technical quality checks: accessibility, performance, responsiveness.",
  "Measures contrast, keyboard paths, semantics, layout shifts, responsiveness and anti-patterns, and returns a severity-ranked report. Includes a native-app variant.",
  "/designerx audit src/pages/Signup.tsx", "Pair with the terminal detector in CI: `designerx detect src/`."),
 ("polish", "[target]", "Refine", "Final quality pass before shipping.",
  "Fixes alignment, spacing, consistency, states and micro-details so a good screen becomes a finished one.",
  "/designerx polish the settings screen", "Always last in the sequence, never first."),
 ("bolder", "[target]", "Refine", "Amplify safe or bland designs.",
  "Increases contrast of scale, color and composition while keeping the product's identity and accessibility.",
  "/designerx bolder landing hero", "Follow with `quieter` on secondary areas to keep a calm baseline."),
 ("quieter", "[target]", "Refine", "Tone down aggressive or overstimulating designs.",
  "Reduces visual noise: saturation, competing accents, heavy effects, so content leads.",
  "/designerx quieter admin tables", "Good for dense tools used for hours."),
 ("distill", "[target]", "Refine", "Strip to essence and remove complexity.",
  "Removes decoration, redundant UI and low-value options until the primary task is obvious.",
  "/designerx distill checkout form", "Ask it what it removed so nothing important disappears silently."),
 ("harden", "[target]", "Refine", "Make it production-ready: errors, i18n, edge cases.",
  "Handles empty, loading, error and overflow states, long text, missing data, offline and localization risks.",
  "/designerx harden the upload flow", "Run before `handoff`."),
 ("onboard", "[target]", "Refine", "Design first-run flows, empty states and activation.",
  "Turns blank screens into guided first steps and shortens time to the first success.",
  "/designerx onboard project dashboard", "Needs a clear definition of the 'aha' moment in PRODUCT.md."),
 ("animate", "[target]", "Enhance", "Add purposeful animation and motion.",
  "Adds transitions and feedback that explain state changes, with reduced-motion support.",
  "/designerx animate modal open and close", "Motion should explain, not decorate."),
 ("colorize", "[target]", "Enhance", "Add strategic color to monochromatic UIs.",
  "Introduces an accessible, restrained color system for state, emphasis and brand.",
  "/designerx colorize the analytics view", "Check results with `audit` for contrast."),
 ("typeset", "[target]", "Enhance", "Improve typography hierarchy and fonts.",
  "Chooses and pairs typefaces, fixes scale, weight, line length and rhythm.",
  "/designerx typeset blog article template", "Mention the languages you support so character coverage is checked."),
 ("layout", "[target]", "Enhance", "Fix spacing, rhythm and visual hierarchy.",
  "Rebuilds spacing scale, alignment and grouping so structure is visible at a glance.",
  "/designerx layout pricing cards", "Use before `polish` on messy screens."),
 ("delight", "[target]", "Enhance", "Add personality and memorable touches.",
  "Adds small moments of character (copy, micro-interactions, empty-state art) without hurting usability.",
  "/designerx delight the success screen", "Reserve it for moments of success, not for error paths."),
 ("overdrive", "[target]", "Enhance", "Push past conventional limits.",
  "Ambitious, high-effort treatment (advanced effects, unusual interaction models) for showcase surfaces.",
  "/designerx overdrive the product launch page", "Not for dense productivity UI."),
 ("signature", "[target]", "Enhance", "DesignerX original. Define one ownable visual signature.",
  "Finds a recognizable move rooted in the product's real world (structure, type, color, motion or detail), writes it as an implementable rule and applies it with restraint. Verified by crop and removal tests.",
  "/designerx signature the whole marketing site", "One primary signature plus at most one echo."),
 ("clarify", "[target]", "Fix", "Improve UX copy, labels and error messages.",
  "Rewrites unclear microcopy so every label, error and empty state says what happened and what to do.",
  "/designerx clarify payment errors", "Run `localize` afterwards if you ship in more than one language."),
 ("adapt", "[target]", "Fix", "Adapt for different devices and screen sizes.",
  "Fixes breakpoints, touch targets, input modes and platform conventions. Includes a native-app variant.",
  "/designerx adapt dashboard for mobile", "State the smallest viewport you must support."),
 ("optimize", "[target]", "Fix", "Diagnose and fix UI performance.",
  "Finds render, asset, font and layout-shift problems and fixes the highest impact ones first.",
  "/designerx optimize homepage", "Include a throttled profile if you have one."),
 ("localize", "[locale] [target]", "Fix", "DesignerX original. Adapt copy, formats and layout to another locale.",
  "Audits code for i18n blockers, rewrites copy idiomatically, applies Intl formats, plural/gender rules and RTL-safe logical CSS, then verifies with pseudo-localization. Contains pt-BR notes (você, R$ 1.234,56, CPF/CNPJ/CEP, text expansion).",
  "/designerx localize pt-BR checkout", "If no locale is given it uses PRODUCT.md, otherwise asks once."),
 ("live", "", "Iterate", "Visual variant mode in the browser.",
  "Starts a local session: pick an element in your running app, describe the change, and compare generated variants in place before accepting one.",
  "/designerx live", "Needs a running dev server. Not covered by this manual's automated tests."),
 ("generate", "[n] [action] [element]", "Iterate", "N variants of a named element, no manual picking.",
  "Like live mode but you name the element: it produces N alternatives to choose from.",
  "/designerx generate 4 variations hero headline", "Keep n between 3 and 6."),
 ("handoff", "[target]", "Ship", "DesignerX original. Write a developer handoff spec.",
  "Reads the built UI and writes HANDOFF.md: tokens, component states, breakpoints, content rules, accessibility, motion, open questions and an acceptance checklist. Every claim carries a file:line or measured value.",
  "/designerx handoff src/features/billing", "Run `harden` and `audit` first so gaps are real findings."),
]
CATS = ["Build", "Evaluate", "Refine", "Enhance", "Fix", "Iterate", "Ship"]

# ---------------------------------------------------------------- page furniture
def deco(canvas, doc):
    canvas.saveState(); w, h = A4
    canvas.setStrokeColor(LINE); canvas.setLineWidth(0.5); canvas.line(18*mm, h-16*mm, w-18*mm, h-16*mm)
    canvas.setFont("Helvetica-Bold", 8); canvas.setFillColor(INK); canvas.drawString(18*mm, h-13*mm, "DesignerX")
    canvas.setFont("Helvetica", 8); canvas.setFillColor(MUTED)
    canvas.drawRightString(w-18*mm, h-13*mm, "Command Manual · v" + VERSION)
    canvas.line(18*mm, 14*mm, w-18*mm, 14*mm)
    canvas.drawString(18*mm, 9.5*mm, "Crafted by Daniel Rodrigues · Apache-2.0 · derived from Impeccable by Paul Bakaus")
    canvas.drawRightString(w-18*mm, 9.5*mm, str(doc.page)); canvas.restoreState()

def cover(canvas, doc):
    w, h = A4; canvas.saveState()
    canvas.setFillColor(INK); canvas.rect(0, 0, w, h, fill=1, stroke=0)
    canvas.setFillColor(ACCENT); canvas.rect(18*mm, h-62*mm, 14*mm, 3*mm, fill=1, stroke=0)
    canvas.setFillColor(colors.white); canvas.setFont("Helvetica-Bold", 54); canvas.drawString(18*mm, h-92*mm, "DesignerX")
    canvas.setFont("Helvetica", 17); canvas.setFillColor(colors.HexColor("#d9d5cc"))
    canvas.drawString(18*mm, h-106*mm, "Command Manual")
    canvas.setFont("Helvetica", 11); canvas.setFillColor(colors.HexColor("#a9a69e"))
    for i, t in enumerate(["Design skills and anti-pattern detection for any AI coding agent.",
                           "27 commands · 18 agent platforms · one terminal detector."]):
        canvas.drawString(18*mm, h-122*mm - i*6*mm, t)
    canvas.setFillColor(colors.white); canvas.setFont("Helvetica-Bold", 11)
    canvas.drawString(18*mm, 40*mm, "Crafted by Daniel Rodrigues")
    canvas.setFont("Helvetica", 8.5); canvas.setFillColor(colors.HexColor("#a9a69e"))
    canvas.drawString(18*mm, 33*mm, "Version " + VERSION + "  ·  Apache License 2.0")
    canvas.drawString(18*mm, 28*mm, "Derived from Impeccable by Paul Bakaus. See NOTICE.md.")
    canvas.restoreState()

def build():
    W = A4[0] - 36*mm
    doc = BaseDocTemplate(OUT, pagesize=A4, leftMargin=18*mm, rightMargin=18*mm, topMargin=24*mm, bottomMargin=22*mm,
                          title="DesignerX Command Manual", author="Daniel Rodrigues", subject="DesignerX " + VERSION)
    fr = Frame(18*mm, 22*mm, W, A4[1]-46*mm, id="f", leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)
    doc.addPageTemplates([PageTemplate(id="cover", frames=[fr], onPage=cover), PageTemplate(id="main", frames=[fr], onPage=deco)])
    s = [NextPageTemplate("main"), PageBreak()]

    # 1 Quick start
    s += [P("1. Quick start", h1),
          P("DesignerX gives your AI coding agent a design brain: a skill with 27 commands, a library of design references, and a terminal detector that flags common UI anti-patterns. It works in Claude Code, Cursor, Gemini CLI, OpenAI Codex, GitHub Copilot, OpenCode and 12 more agents."),
          P("Install", h2),
          P("From a project folder (npm package, once published):"), C("npx designerx install --providers=claude,cursor"),
          P("Or from a clone of the repository:"), C("git clone <your-designerX-repo-url>\nnode designerX/bin/designerx.mjs install --providers=claude --dir /path/to/your/project"),
          P("Other forms: <font name='Courier'>--providers=all</font> installs for every platform, <font name='Courier'>--global</font> installs into your home folder (hooks are not touched), <font name='Courier'>--no-hooks</font> skips hook files. <font name='Courier'>designerx list</font> shows all platforms; <font name='Courier'>designerx uninstall</font> removes everything DesignerX added."),
          P("Your first five minutes", h2),
          tbl([["Step", "Command", "Result"],
               ["1", "/designerx init", "PRODUCT.md: who it is for, purpose, brand, principles"],
               ["2", "/designerx document", "DESIGN.md: your real palette, type and components"],
               ["3", "/designerx audit", "Severity-ranked technical report"],
               ["4", "/designerx critique", "UX review with prioritized fixes"],
               ["5", "/designerx polish", "Final pass before shipping"]], [14*mm, 52*mm, W-66*mm]),
          P("Invoking commands", h2),
          tbl([["Where", "Syntax"],
               ["Most agents (Claude Code, Cursor, Gemini, Copilot, ...)", "/designerx <command> [target]"],
               ["OpenAI Codex", "$designerx <command> [target]"],
               ["Terminal", "designerx <verb> [options]  (or npx designerx ...)"]], [90*mm, W-90*mm]),
          P("Run <font name='Courier'>/designerx</font> with no argument for a context-aware menu that recommends what to do next based on your project's state.")]

    # 2 command reference
    s += [PageBreak(), P("2. Command reference", h1),
          P("Twenty-seven commands in seven groups. Commands marked <b>Original</b> were written for DesignerX and do not exist upstream.")]
    rows = [["Command", "Group", "Purpose"]]
    for n, a, c, one, *_ in CMDS:
        tag = " (Original)" if n in ("signature", "localize", "handoff") else ""
        rows.append([f"<font name='Courier'>{n}</font>", c, esc(one) + tag])
    s.append(tbl(rows, [26*mm, 20*mm, W-46*mm]))
    for cat in CATS:
        head = [P(cat, h2)]
        for n, a, c, one, what, ex, tip in [x for x in CMDS if x[2] == cat]:
            orig = " <font color='#d9480f' size='8'>ORIGINAL</font>" if n in ("signature", "localize", "handoff") else ""
            block = [P(f"<font name='Courier'>{n}</font> <font name='Courier' color='#5b6070'>{esc(a)}</font>{orig}", h3),
                     P(esc(one), S("one", fontName="Helvetica-Oblique", textColor=MUTED, spaceAfter=3)),
                     P(esc(what)), C(ex), P("<b>Tip:</b> " + esc(tip), small), Spacer(1, 4)]
            s.append(KeepTogether(head + block)); head = []

    # 3 terminal
    s += [PageBreak(), P("3. Terminal verbs", h1),
          P("The launcher runs outside your agent, for scripts, CI and quick checks. Use <font name='Courier'>designerx</font> (npm) or the launcher inside the installed skill, for example <font name='Courier'>.claude/skills/designerx/scripts/designerx</font>."),
          tbl([["Verb", "What it does"],
               ["detect [file|dir|url ...]", "Scans UI code for anti-patterns and quality issues. Exit code 0 means clean, 2 means findings. Add --json for machine output."],
               ["context", "Loads PRODUCT.md and DESIGN.md context for the current project (what agents read first)."],
               ["hooks on|off|status", "Enables, disables or inspects the automatic design detector that runs after your agent edits UI files."],
               ["hooks ignore-rule|ignore-file|ignore-value|reset", "Suppression ladder for false positives, from narrow to broad."],
               ["doctor", "Reports and repairs drift in DesignerX project files."],
               ["ignores", "Manages detector ignore rules."],
               ["pin pin <command>", "Creates a standalone shortcut, for example /polish, in every installed platform of the project."],
               ["pin unpin <command>", "Removes that shortcut (only if DesignerX created it)."],
               ["help, version", "Local help and version information."]], [58*mm, W-58*mm]),
          P("CI example", h2),
          C("# fail the build when UI anti-patterns are found\nnpx designerx detect src/ || exit 1"),
          P("Inline suppression", h2),
          P("In code you can mark intentional exceptions with the detector's comment directives (they keep the upstream spelling because the engine reads them), for example a <font name='Courier'>impeccable-disable-next-line</font> comment placed above the line. Prefer fixing the issue; use suppression for deliberate design choices."),
          P("Hooks", h2),
          P("Installed hook files make supported agents run the detector after UI edits and feed findings back to the agent. Toggle per project with <font name='Courier'>designerx hooks off</font> and <font name='Courier'>on</font>. State lives in <font name='Courier'>.impeccable/config.json</font>."),
          P("Environment variables", h2),
          tbl([["Variable", "Effect"],
               ["DESIGNERX_HOME", "Engine cache folder (default ~/.designerx)."],
               ["DESIGNERX_BIN", "Use an already installed engine binary; skips download."],
               ["DESIGNERX_DOWNLOAD_BASE", "Mirror for engine downloads (needs matching .sha256 files)."],
               ["DESIGNERX_ONLINE=1", "Re-enable engine telemetry, update and staleness checks (off by default)."],
               ["DESIGNERX_OFFLINE=1", "Block the single hosted call (concept-seed roll). The engine falls back locally."],
               ["DESIGNERX_API_URL", "Point that call at your own service."],
               ["DESIGNERX_RAW=1", "Print engine output without the DesignerX naming layer."]], [52*mm, W-52*mm])]

    # 4 workflows
    s += [PageBreak(), P("4. Workflows", h1),
          tbl([["Goal", "Sequence"],
               ["New product", "init → shape → (build) → document → audit → polish"],
               ["Rescue an ugly screen", "critique → layout → typeset → colorize → polish"],
               ["Make it distinctive", "document → signature → bolder or quieter → polish"],
               ["Ship-ready", "harden → audit → clarify → polish → handoff"],
               ["Ship in Brazil", "clarify → localize pt-BR → harden → audit"],
               ["Explore options", "live  or  generate 4 variations <element>"],
               ["Weekly hygiene", "detect in CI + hooks on + document after refactors"]], [42*mm, W-42*mm]),
          P("Good habits", h2),
          P("1. Keep PRODUCT.md and DESIGN.md current; every command is better with them.<br/>2. Give a target (a file, folder or screen name) instead of 'everything'.<br/>3. Review diffs: DesignerX edits real code.<br/>4. Run <font name='Courier'>polish</font> last and <font name='Courier'>audit</font> after any big change."),
          P("5. Network and privacy", h1),
          P("The core engine is a compiled binary from the upstream project. On first use the launcher downloads it from the upstream release channel and verifies its SHA-256 checksum; it refuses to run unverified downloads. Telemetry, update checks and staleness checks are disabled by default. The only remaining hosted call is the concept-seed roll, which sends scope, mode, a short seed and a counter, and no project content. Set DESIGNERX_OFFLINE=1 to block it."),
          P("6. Troubleshooting", h1),
          tbl([["Symptom", "Fix"],
               ["'cannot create cache directory' or download fails", "Allow network once, or set DESIGNERX_HOME to a writable folder, or DESIGNERX_BIN to a preinstalled engine."],
               ["Command not found in the agent", "Restart the agent session after install. Check the skill folder exists, for example .claude/skills/designerx."],
               ["'NO_PRODUCT_MD' message", "Run /designerx init to create PRODUCT.md."],
               ["Hooks do nothing", "Run designerx hooks status; enable with designerx hooks on. Confirm the hook file for your platform was installed."],
               ["Windows: pin or help missing", "Those verbs are implemented in the POSIX launcher. Use Git Bash or WSL, or the npm CLI."]], [58*mm, W-58*mm]),
          P("7. Credits and license", h1),
          P("DesignerX is crafted by <b>Daniel Rodrigues</b> and released under the Apache License 2.0. It is a derivative of <b>Impeccable</b> by <b>Paul Bakaus</b> (Copyright 2025), also Apache-2.0. The names and marks of the original project are not used under license. See NOTICE.md in the repository for the full list of changes and third-party attributions.")]
    doc.build(s)
    print("wrote", OUT)

if __name__ == "__main__":
    build()
