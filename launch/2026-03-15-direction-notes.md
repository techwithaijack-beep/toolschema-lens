# Direction notes for 2026-03-15

## News-summary scan takeaways
- BBC tech highlighted AI toys misreading emotions: trust, reliability, and safe behavior are still front-of-mind.
- Grammarly pulled an AI author-impersonation feature after backlash: product teams are getting punished for sloppy AI abstractions and overreach.
- Meta faced criticism around fake AI video oversight: AI systems need clearer controls and inspectability.
- Deepfake fraud and broader AI misuse concerns continue to reinforce the need for explainable, controllable tooling.

## Current growth-loop takeaways
- Recent successful repos were local-first, zero-API, immediately demoable diagnostics tools.
- Existing repos already cover prompt envelope bloat and RAG citation QA, so the next repo should target a different layer.
- Agent stacks are increasingly built on MCP / function calling / JSON Schema contracts, but schema bloat is still under-tooled.

## Product direction
Build a developer tool that inspects LLM tool schemas and MCP contracts for prompt-budget waste, reliability risks, and readability problems, then generates a compact runtime-friendly version plus an HTML report.

## Why this is a real gap
- Tool-schema bloat is common in production agent systems.
- It silently affects latency, cost, and tool-call quality.
- It is easy to demonstrate with before/after token estimates.
- It requires no paid APIs and fits the local-first open-source pattern that has been working.
