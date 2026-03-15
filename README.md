# ToolSchema Lens

Lint and compact LLM tool schemas before they quietly wreck prompt budget.

ToolSchema Lens is a local-first analyzer for OpenAI-style tools, MCP tool lists, and plain JSON Schema-based contracts. It tells you which tools are too verbose, which fields are over-described or underspecified, and how much token budget you can save with a cleaner runtime contract.

If you build agents, this is one of the easiest hidden wins in the stack:

- shorter tool payloads
- faster tool selection
- less schema noise per turn
- cleaner MCP / function-calling contracts
- a sharable HTML report you can show to the team in 2 minutes

No API calls. No backend. No paid dependencies.

## Why this exists

A lot of agent debugging focuses on prompts, retrieval, or model choice.

But in real systems, tool contracts are often the invisible tax:

- giant descriptions repeated every turn
- nested objects the model barely needs
- large enums copied into every request
- titles/examples/defaults meant for humans, not runtime
- fields with too much wording in the wrong places and not enough in the important ones

ToolSchema Lens gives you an immediate answer:

**Which tool contracts are wasting tokens, and what does a cleaner version look like?**

## What it analyzes

ToolSchema Lens currently supports:

- arrays of tools
- `{ "tools": [...] }`
- MCP-style `{ "result": { "tools": [...] } }`
- tool objects using `parameters`, `input_schema`, or similar JSON Schema shapes

It checks for:

- verbose tool descriptions
- schema token heaviness
- deep nesting
- large enums
- long field descriptions
- duplicated descriptions
- titles/examples/defaults that inflate payloads
- underspecified fields with no description

It also generates a compact runtime-friendly contract for each tool.

## Quick start

```bash
cd toolschema-lens
node ./bin/toolschema-lens.js ./examples/verbose-tools.json \
  --json-out ./examples/report.json \
  --md-out ./examples/report.md \
  --html-out ./examples/report.html \
  --compact-out ./examples/compact-tools.json
```

Then open `examples/report.html` in your browser.

## Demo in under 2 minutes

```bash
cd toolschema-lens
npm test
npm run demo
python3 -m http.server 8080
```

Open <http://localhost:8080/examples/report.html>

## Example output

For each tool, the report shows:

- a health score
- before/after token estimates
- prioritized findings
- practical fixes
- an optimized compact contract

This makes it useful for:

- agent cost reviews
- MCP server cleanup
- prompt-regression investigations
- pre-release tool contract QA
- PR reviews when new tools get added

## Repo structure

- `bin/toolschema-lens.js` — CLI entry point
- `src/analyzer.js` — linting heuristics and compaction logic
- `src/report.js` — HTML and Markdown report generation
- `src/utils.js` — schema traversal and normalization helpers
- `examples/verbose-tools.json` — included demo input
- `docs/heuristics.md` — current rules and scope
- `tests/smoke.mjs` — zero-dependency smoke test

## Design principles

- **local-first** — nothing leaves your machine
- **explainable** — heuristic findings you can inspect
- **cheap** — no paid APIs required
- **adoptable** — one command, one report, one obvious win
- **extensible** — easy to add org-specific lint rules later

## Roadmap ideas

- diff mode between two tool contract versions
- CI threshold mode for schema regressions
- provider-specific exporters for captured traces
- VS Code extension wrapper
- plugin API for custom lint policies

## Limitations

- token counts are approximate, not tokenizer-exact
- compaction suggestions are heuristic, not semantically guaranteed
- some verbose metadata may still matter for certain tools
- human review is still needed before replacing production contracts

## License

MIT
