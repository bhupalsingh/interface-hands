# Interface Hands

A focused reference implementation of a record-once/replay-many computer-use system for legacy financial software. An LLM discovers a workflow against a real browser surface; the successful run becomes a typed capability; production invocations replay it without a model in the decision loop.

## Quick start

Requirements: Node.js 20+ and an OpenAI API key for the genuine discovery run.

```bash
npm install
npx playwright install chromium
cp .env.example .env
npm run demo
```

`demo` starts the local Heritage Core simulator, records a flow with a scripted development provider, replays a successful lookup, and exercises the `MEMBER_NOT_FOUND` outcome. It requires no external service.

## Genuine LLM discovery

Add your key to `.env` (which is gitignored), then run:

```bash
npm run discover
```

This performs a real observe-decide-act loop with the OpenAI Responses API and writes the artifact and redacted trace under `evidence/runtime/`. The model receives a compact accessibility-tree observation and must return one action conforming to a strict schema. It never produces executable code.

Replay the reviewed artifact without any LLM call:

```bash
npm run replay -- --artifact evidence/runtime/artifacts/lookup-savings-balance.json --member 12345
npm run replay -- --artifact evidence/runtime/artifacts/lookup-savings-balance.json --member 99999
```

## Commands

| Command | Purpose |
|---|---|
| `npm run serve` | Run the intentionally old-fashioned banking simulator |
| `npm run discover` | Genuine LLM discovery run (API key required) |
| `npm run discover -- --mock` | Offline development discovery |
| `npm run replay -- --member 12345` | Deterministically replay the example artifact |
| `npm run demo` | Full offline vertical slice, including error outcome |
| `npm test` | Schema, policy, success, and business-outcome tests |
| `npm run typecheck` | Strict TypeScript validation |

## Structure

```text
src/schema.ts      Typed, versioned capability and result contracts
src/discovery.ts   Observe-decide-act loop and model boundary
src/replay.ts      Model-free deterministic executor
src/surface.ts     Web surface adapter seam
src/policy.ts      Origin/action/risk enforcement and redaction
src/handoff.ts     Same-session human control transfer
src/simulator.ts   Local legacy banking proxy target
evidence/          Reviewable artifact and run evidence
```

## Safety notes

- Only configured origins and action types may execute.
- Irreversible steps are denied unless policy explicitly allows them.
- Input values marked sensitive remain parameters; they are not baked into capabilities.
- Logs redact obvious secrets and nine-digit identifiers.
- `.env` and runtime evidence are ignored to prevent accidental key or PII commits.
- The demo uses synthetic members only.

## Human handoff

`HumanHandoff` transfers an existing `WebSurface` session from `automation` to `human`. Its minimal operator endpoint returns the current screenshot, accepts coordinate click/type actions against that same page, records the human actor, and resumes only through an explicit `/resume`. The class is intentionally UI-light; it demonstrates the control seam rather than a production co-browsing console.

## Submission checklist

- Run genuine `npm run discover`, inspect/redact its evidence, and commit it.
- Replay both `12345` and `99999`; commit the resulting logs and one failure screenshot if available.
- Set `approved: true` only after reviewing the artifact.
- Record a short terminal/browser demo if time permits.
- Push to a new public GitHub repository and email its URL on its own line.

See [REPORT.md](REPORT.md) for design decisions and trade-offs.
