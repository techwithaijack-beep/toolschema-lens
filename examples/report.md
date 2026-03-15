# ToolSchema Lens Report

Generated: 2026-03-15T02:38:17.597Z

## Summary
- Tools: 2
- Approx. runtime tokens before: 1000
- Approx. runtime tokens after compaction: 838
- Estimated tokens saved: 162
- Average score: 60/100
- Findings: 2 high / 3 medium / 1 low

## create_customer_support_ticket

- Score: 20/100
- Tokens: 769 -> 607 (saved 162)
- Properties: 10
- Max depth: 4

- [HIGH] Tool description is long enough to inflate every agent call. Fix: Keep the headline short and move edge cases to docs.
- [HIGH] Schema is approximately 607 tokens before the model even sees user input. Fix: Shorten descriptions, strip metadata, and split oversized tools.
- [MEDIUM] Nested depth reaches 4, which makes tool use harder to infer reliably. Fix: Flatten nested objects or split the contract.
- [MEDIUM] 1 field(s) contain large enums that bloat prompt budget. Fix: Prefer smaller enums, short codes, or server-side lookup tables.
- [LOW] Schema includes titles/examples/defaults that mainly help humans, not runtime inference. Fix: Keep verbose docs outside the runtime contract.
- [MEDIUM] 3 fields have no description. Fix: Every field should explain what the model should put there.

## lookup_internal_order

- Score: 100/100
- Tokens: 231 -> 231 (saved 0)
- Properties: 4
- Max depth: 1

- No major findings

