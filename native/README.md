# DesignerX Native — Independent Inspection Engine

**Original code by Daniel Rodrigues, 2026.** This new module runs without downloading or executing the upstream Impeccable binary.

## Commands

```bash
node native/inspect.mjs path/to/index.html
node native/inspect.mjs path/to/index.html --json
node --test native/inspect.test.mjs
```

Checks 13 categories of static HTML evidence: language, viewport, main landmark, skip link, focus-visible, reduced motion, title, description, image alt/dimensions, canvas semantics, external link security, and hidden mobile navigation.

Exit status: 0 no high findings; 1 one or more high findings; 2 invalid invocation. JSON includes evidence, rule IDs, severity, score and remediation. Scores are triage heuristics, **not** measured UX quality or WCAG certification.

## Independent roadmap
1. **Native Inspect**: static analysis and machine-readable evidence (implemented).
2. **Native Context**: deterministic PRODUCT/DESIGN ingestion with validation (planned).
3. **Native Critique**: design-system checks and severity-ranked design rationale (planned).
4. **Native Motion**: reduced-motion, animation budget and interaction continuity (planned).
5. **Native Handoff**: traceable implementation specs (planned).

The surrounding DesignerX package still contains adapted Impeccable materials and an upstream executable dependency. See NOTICE.md. No claim is made that the whole package has been independently rewritten.
