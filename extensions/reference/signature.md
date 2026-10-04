> **Additional context needed**: what the product should be remembered for, and the one place a visitor will meet it most often.

Give the interface one ownable visual signature: a recognizable move that survives cropping, screenshots, and thumbnail size. A signature is not decoration. It is the product's point of view made visible once and repeated with discipline.

## Find the signature

Read PRODUCT.md and DESIGN.md first. If neither exists, infer from the incumbent implementation and say so in one line.

Look for the source inside the product's real world, in this order:

1. A material, tool, or object the product is about (a ledger rule, a lab label, a ticket stub, a patch bay).
2. A behavior unique to the product (how it counts, sorts, waits, or confirms).
3. A constraint the brand has chosen on purpose (one cut of one typeface, one ink, one grid unit).

Reject any candidate that is category habit (gradient blobs, glass cards, icon grids) or that would fit a competitor unchanged. If three candidates survive, choose the one that costs the least to repeat.

## Choose one move

Pick exactly one primary signature and at most one supporting echo. State it as a rule an engineer can implement:

- **Structure:** a recurring layout device, such as a hairline that breaks the grid at every section start.
- **Type:** one distinctive treatment, such as numerals in a different cut, or small-caps labels with fixed tracking.
- **Color:** one reserved accent used only for state or action, never for ornament.
- **Motion:** one entrance gesture and easing reused everywhere.
- **Detail:** a consistent corner, edge, or divider treatment.

## Specify it

Write the signature as tokens and a usage rule: the name, the exact values, where it appears, where it must never appear. Add it to DESIGN.md under a `Signature` heading when the user agrees; otherwise report it in the reply.

## Apply with restraint

- Show it in the first viewport and in at most three places per screen.
- Let it organize content (hierarchy, rhythm, state) before it decorates.
- Keep accessibility intact: the signature never carries meaning by color alone and respects reduced motion.
- Preserve everything outside the signature. Refinement keeps the incumbent identity.

## Verify

- **Crop test:** a 400px crop of any screen should still read as this product.
- **Removal test:** delete the signature. If nothing is lost, it was decoration; sharpen or drop it.
- **Consistency test:** every use follows the written rule, with no one-off variants.
- Run the detector once over the changed files and fix what it reports.

Finish by naming the signature in one sentence and listing where it now appears.
