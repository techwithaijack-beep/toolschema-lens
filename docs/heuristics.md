# Heuristics

ToolSchema Lens intentionally uses explainable heuristics instead of model calls.

Current checks:
- tool descriptions that are too long to ship on every turn
- schemas with heavy token footprint
- deeply nested objects that make tool selection harder
- large enums that consume budget without adding much reasoning value
- overlong field descriptions
- duplicated field descriptions
- titles/examples/defaults that mainly help human readers
- underspecified fields with no description

This is a linting and compaction aid, not a correctness oracle.
