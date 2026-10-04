> **Additional context needed**: target locale (for example `pt-BR`, `es-MX`, `ar`) and the register the brand uses with its users.

Adapt the interface for another locale so it reads as written there, not translated. If no locale is named, use the one recorded in PRODUCT.md; if none is recorded, ask once.

## Audit the code first

Find what blocks localization before touching words:

- strings hardcoded in markup, scripts, alt text, aria labels, metadata, and validation;
- concatenated sentences that fix word order or plurals;
- text inside images;
- manual date, number, and currency formatting;
- layouts that assume English length, left-to-right flow, or single-byte characters.

Fix the structure (message catalog, `Intl` APIs, logical CSS properties) in the project's existing i18n approach. Do not introduce a new library when one is already in use.

## Rewrite for the locale

- Write natural copy in the locale's own idiom. Keep product terms, legal meaning, and factual claims; ask before changing any of them.
- Match the brand's register consistently (formal or informal address, inclusive or neutral phrasing).
- Use the locale's plural and gender rules through the message format, never by string tricks.
- Format dates, numbers, currencies, units, addresses, names, and phone numbers with `Intl` and locale conventions.

### Brazilian Portuguese (pt-BR) notes

- Address: `você` is the safe default; avoid mixing `tu` and `você`. Do not use European Portuguese vocabulary or spelling.
- Formats: `31/12/2026`, `1.234,56`, `R$ 1.234,56`; local fields such as CPF, CNPJ, CEP, and phone with DDD need masks and validation that accept pasted input.
- Length: expect 20 to 35 percent expansion over English in labels and buttons; test the longest strings.
- Characters: confirm the chosen fonts include full Latin-1 and Latin Extended coverage for accents and cedilla.
- Tone: prefer direct verbs for actions (`Salvar alterações`, `Enviar pedido`) and plain wording in errors.

## Layout resilience

Allow growth in buttons, tabs, table headers, and navigation. Use logical properties (`margin-inline`, `inset-inline-start`) so right-to-left locales mirror correctly. Never clip, never fix widths to English text.

## Verify

- Run a pseudo-localization pass (accented, 40 percent longer strings) and fix every overflow.
- Check that no user-visible string remains in the source language.
- Check plurals at 0, 1, 2, and many.
- Run the detector once over the changed files.

Report the locale, the files changed, the strings still needing human review, and anything left deliberately untranslated.
