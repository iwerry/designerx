# Notices and Attribution

## DesignerX

DesignerX is crafted by **Daniel Rodrigues**.
Modifications and additions Copyright 2026 Daniel Rodrigues, released under the Apache License 2.0 (see `LICENSE`).

## Derived work: Impeccable

DesignerX is a derivative work of **Impeccable** by **Paul Bakaus**
(https://github.com/pbakaus/impeccable), Copyright 2025 Paul Bakaus, licensed under the Apache License 2.0.

Changes made in this derivative (Apache-2.0, section 4(b)):

- Renamed the skill, slash commands, launcher, sub-agents, hook manifests and prose from "Impeccable" to "DesignerX".
- Replaced the launcher with a DesignerX launcher (checksum-verified engine download, native `pin`/`help`/`version`, output branding layer, telemetry/update checks off by default, offline switch).
- Added the commands `signature`, `handoff` and `localize` (`extensions/`), and an injector script (`scripts/apply-extensions.mjs`).
- Added a universal installer CLI (`bin/designerx.mjs`) and documentation (`README.md`, `docs/`).
- Removed the upstream website, browser extension, Rust sources, plugin packaging and test suites from this repository.

The "Impeccable" name and marks are not licensed for use (Apache-2.0, section 6). DesignerX is not affiliated with or endorsed by the original author.

## Core engine

The compiled core engine is the upstream project's Apache-2.0 binary, downloaded at first run from the upstream release channel and verified against its SHA-256 sidecar. Protocol identifiers the engine depends on (the `.impeccable/` state folder, `data-impeccable-*` attributes, `IMPECCABLE_*` variables) are intentionally unchanged.

## Third-party content

`skill/reference/ios.md` and `skill/reference/android.md` (and their provider copies) are distilled from ehmo's `platform-design-skills` (Apple HIG and Material Design 3 rules), MIT licensed.
Original work: https://github.com/ehmo/platform-design-skills
