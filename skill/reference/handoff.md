> **Additional context needed**: the receiving stack and who reads the handoff (engineers, QA, or another agent).

Produce a developer handoff specification from the interface as it is actually built. The code and the rendered result are the source of truth, not memory and not the original brief.

## Inventory from the code

Read the target's components, styles, and tokens. Measure; do not guess. Collect:

- design tokens: color, type scale, spacing, radii, shadows, z-index, motion durations and easings, with their values and where each is defined;
- components: props, variants, and every state that exists (default, hover, focus-visible, active, disabled, loading, error, empty, success);
- layout: breakpoints, container widths, grid behavior, what reflows and what scrolls;
- content rules: truncation, wrapping, min and max lengths, locale-sensitive formats;
- accessibility: roles, names, focus order, keyboard paths, measured contrast pairs, reduced-motion handling;
- assets: icons, images, fonts, with sources and licenses where visible.

## Write the handoff

Write `HANDOFF.md` at the project root unless the user names another path. Use these sections, omitting any with nothing real to say:

1. **Overview:** what this surface does and its primary user task.
2. **Tokens:** a table per group with name, value, and defining file.
3. **Components:** per component, props, variants, states, and the file that owns it.
4. **Layout and breakpoints.**
5. **Content and i18n rules.**
6. **Accessibility:** what is implemented and what is missing.
7. **Motion:** triggers, durations, easings, reduced-motion behavior.
8. **Known gaps and open questions:** anything inconsistent, undefined, or unverified.
9. **Acceptance checklist:** checks QA can run line by line.

## Rules

- Every claim carries a `file:line` reference or a measured value. If you cannot point to it, it does not go in.
- Flag mismatches between DESIGN.md and the code; do not silently pick one.
- Never invent states, tokens, or behavior that does not exist. Missing is a finding, not a gap to fill.
- Keep it scannable: tables and short lists over paragraphs.

## Verify

Re-open three random claims and confirm each against the code. Run the detector once over the target and list its remaining findings under Known gaps. Report the file written and the count of open questions.
