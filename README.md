<h1 align="center">DesignerX</h1>

<p align="center"><strong>Give your AI agent a designer's eye.</strong><br>
27 commands. 18 agent platforms. One anti-pattern detector.<br>
<sub>Crafted by <strong>Daniel Rodrigues</strong></sub></p>

---

Download the manual: https://github.com/iwerry/designerx/blob/9ae6fc0b9abf895cef5654906d9cbe9c4700d0df/DesignerX-Manual.pdf

Ask any AI to "make it look good" and you get the same purple gradient, the same rounded card with a left border, the same Inter. Fast, and forgettable.

**DesignerX is a skill pack that teaches your coding agent to design on purpose.** It loads real product context, applies a library of design references (typography, color, spacing, motion, accessibility), runs a linter over what the agent just wrote, and gives you a vocabulary of commands to steer the result: `/designerx critique`, `/designerx polish`, `/designerx signature`.

It is not tied to one model. If your agent can read a skill folder, DesignerX works in it.

## Install in 20 seconds

```bash
# inside your project
npx designerx install --providers=claude,cursor     # pick your agents
npx designerx install --providers=all                # or everything
npx designerx install --global                       # or once for your whole machine
```

No `npx` yet? Clone this repo and run `node bin/designerx.mjs install --providers=claude --dir /path/to/project`.

Works with **Claude Code · Cursor · Gemini CLI · OpenAI Codex · GitHub Copilot · OpenCode · Grok Build · Antigravity · Kiro · Pi · Qoder · Rovo Dev · Trae · Trae China · Hermes · Mistral Vibe · Veto · DeepSeek Harness** (`designerx list`).

## Your first five minutes

```text
/designerx init          # who is this for? what is the brand?  → PRODUCT.md
/designerx document      # read my real code, write the design system → DESIGN.md
/designerx audit         # accessibility, performance, responsiveness, anti-patterns
/designerx critique      # a UX review with prioritized fixes
/designerx polish        # the last 5% that makes it feel finished
```

In Codex, use `$designerx` instead of `/designerx`. Run it with no argument for a menu that looks at your project and suggests what to do next.

## The command deck

| Group | Commands |
|---|---|
| **Build** | `craft` `shape` `init` `document` `extract` |
| **Evaluate** | `critique` `audit` |
| **Refine** | `polish` `bolder` `quieter` `distill` `harden` `onboard` |
| **Enhance** | `animate` `colorize` `typeset` `layout` `delight` `overdrive` **`signature`** |
| **Fix** | `clarify` `adapt` `optimize` **`localize`** |
| **Iterate** | `live` `generate` |
| **Ship** | **`handoff`** |

Bold commands are **DesignerX originals**:

- **`signature`** finds the one recognizable move that makes your product unmistakable (a rule, a typographic habit, a reserved accent) and applies it with restraint. Verified with a crop test and a removal test.
- **`localize`** makes the interface read as *written* in another language, not translated. Intl formats, plural rules, RTL-safe CSS, text expansion, and built-in Brazilian Portuguese craft (`você`, `R$ 1.234,56`, CPF/CNPJ/CEP).
- **`handoff`** turns the UI you built into a `HANDOFF.md` engineers can implement and QA can sign off: tokens, states, breakpoints, accessibility, with `file:line` evidence for every claim.

The complete reference, with examples and workflows, is in **[docs/DesignerX-Manual.pdf](docs/DesignerX-Manual.pdf)**.

## The detector

```bash
npx designerx detect src/            # exit code 2 when it finds something
npx designerx detect --json src/     # machine-readable
```

Gradient text, side-stripe cards, glow shadows, low contrast, cramped line length. Hooks can run it automatically after your agent edits UI files and feed findings back, so the agent fixes its own slop.

```bash
npx designerx hooks status | on | off
```

Drop it into CI: `npx designerx detect src/ || exit 1`.

## Terminal cheatsheet

| Verb | Does |
|---|---|
| `designerx install / uninstall / list` | Manage platforms |
| `designerx detect` | Scan for anti-patterns |
| `designerx context` | Show the context agents load |
| `designerx hooks` | Toggle and tune the automatic detector |
| `designerx doctor` | Repair drift in project files |
| `designerx pin pin polish` | Create a standalone `/polish` shortcut |
| `designerx help / version` | Local help |

## How it is built

```text
.claude/ .cursor/ .agents/ .gemini/ ...   one ready-to-use skill folder per platform
skill/                                    canonical source (placeholders, references, scripts)
extensions/                               DesignerX originals (signature, handoff, localize)
scripts/apply-extensions.mjs              injects extensions into every platform folder
scripts/verify.mjs                        consistency checks (run in CI)
bin/designerx.mjs                         installer + terminal front door
docs/                                     manual and its generator
tools/rebrand.py                          the auditable rename pass from the upstream project
```

Add your own command: put `mycommand.md` in `extensions/reference/`, register it in `scripts/apply-extensions.mjs`, run `npm run apply`, then `npm run verify`.

## Network and privacy, plainly

- The core engine is a compiled binary from the upstream project. On first run the launcher downloads it from the upstream release channel and **verifies its SHA-256**; unverified downloads are refused. Self-host a mirror with `DESIGNERX_DOWNLOAD_BASE`.
- Telemetry, update checks and staleness checks are **off by default**. `DESIGNERX_ONLINE=1` turns them back on.
- One hosted call remains: the `concept-seed` roll sends scope, mode, a short seed and a counter, never project content. `DESIGNERX_OFFLINE=1` blocks it and the engine falls back locally.
- Engine state lives in `.impeccable/` in your project. That name belongs to the engine's protocol and is intentionally unchanged.

| Variable | Effect |
|---|---|
| `DESIGNERX_HOME` | Engine cache (default `~/.designerx`) |
| `DESIGNERX_BIN` | Use a preinstalled engine |
| `DESIGNERX_OFFLINE=1` | Block the hosted roll |
| `DESIGNERX_RAW=1` | Show engine output without the DesignerX naming layer |

## Known limits

- Windows `.cmd` launcher lacks native `pin`, `help` and the naming layer; use Git Bash, WSL, or the npm CLI.
- `live` mode is inherited from the engine and has not been re-tested after the rename.
- Some text compiled inside the engine still says "Impeccable"; the naming layer rewrites it on common verbs.

## Credits and license

DesignerX is crafted by **Daniel Rodrigues** and released under the **Apache License 2.0**.

It is a derivative of **[Impeccable](https://github.com/pbakaus/impeccable)** by **Paul Bakaus** (Copyright 2025, Apache-2.0). Heartfelt thanks for the foundation. DesignerX is not affiliated with or endorsed by the original project, and its name and marks are not used under license. Full list of changes and third-party notices: [NOTICE.md](NOTICE.md).

<p align="center"><sub>Design on purpose. · Daniel Rodrigues</sub></p>
