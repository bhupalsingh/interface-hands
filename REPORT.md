# 1. Architecture

The system is a small single-process vertical slice with deliberate boundaries: a `DecisionProvider` discovers intent, a `Surface` observes and acts, a versioned capability is the durable contract, and the replay executor consumes that contract without a model. The local Heritage Core application is intentionally server-rendered, table-based, and has no test IDs. This makes accessibility-first targeting useful while remaining safe and reproducible.

Discovery sends the current URL and accessibility snapshot to a model constrained to one typed action. The model cannot emit code or bypass policy. After each action the system observes again. A successful run is canonicalized into an artifact decoupled from model rationale. In production I would split orchestration, evidence storage, and browser workers, but queues and distributed infrastructure add no value to this demonstration.

# 2. Artifact schema

The artifact is both a human-reviewable document and an agent-callable contract. It contains semantic name/version, typed inputs and outputs, ordered steps, locator strategies, risk classification, success checkpoint, known business outcomes, approval state, and tenant overrides. Invocation values use placeholders such as `{{memberId}}`; actual customer values never become part of the reusable artifact.

Locators prefer accessible role/name or label, then visible text, with CSS only when necessary. A locator may carry ordered fallbacks, although the thin implementation deliberately executes only the primary strategy; production would record which fallback matched and use confidence gates. Artifact schema version and capability version are separate so contract migrations do not masquerade as business-flow revisions.

# 3. Determinism & error handling

Replay validates the artifact, resolves typed parameters, enforces policy before each action, performs explicit waits through Playwright, extracts declared outputs, and verifies an independent final checkpoint. No model is constructed or invoked on this path.

Results form a tagged union: `success`, `business_outcome`, or `failure`. A missing member is detected from an explicit outcome locator and returned as `MEMBER_NOT_FOUND`, not thrown as a crash. Known transient conditions would be encoded as bounded recovery rules (maximum attempts plus backoff); this slice captures timeouts and failure evidence but intentionally avoids generalized retry, because blind retries are dangerous for non-idempotent steps. Failures identify category, step, observation, and screenshot. UI drift is secondary to runtime outcomes, but locator diagnostics and tenant overrides provide a controlled repair path.

# 4. Heterogeneity & multi-tenant

The artifact expresses abstract actions and locator intent; `WebSurface` translates them into Playwright operations. A desktop adapter could implement the same contract using Windows UI Automation or accessibility APIs, and a screenshot adapter could implement role-free coordinate targets with image anchors. Surface-specific locator payloads should become a discriminated union as those adapters are added.

Capabilities belong to a vendor product and semantic version, not directly to one institution. A tenant binds a vendor capability to its base URL and may supply narrow locator overrides. Replay telemetry builds a compatibility matrix across tenant, vendor version, and capability version. Canary replays detect drift; failures quarantine only the affected binding rather than invalidating the shared capability. Overrides are promoted into the base artifact only after evidence shows they generalize.

# 5. Escalation & handoff

Discovery escalates on explicit model refusal/dead-end or maximum steps; replay escalates on policy blocks, unknown dialogs, exhausted recovery, or irreversible actions. An intervention contains run/capability identity, current step, reason, screenshot, and trace location.

`HumanHandoff` preserves the exact Playwright page and browser context. A lease-like owner field changes from `automation` to `human`; the operator endpoint exposes the current screenshot and applies clicks/keystrokes to that same page. Every manual action is attributed and redacted. `/resume` explicitly returns ownership to automation. A production implementation would add authenticated WebSocket streaming, expiring leases, RBAC, dual approval for money movement, and disconnect recovery; the control-transfer semantics would remain the same.

# 6. Safety

Policy is enforced in code, outside the model: allowed origins, action types, and risk classes are configurable. Irreversible actions are blocked by default and require a human-approved policy change. Model output is schema-validated. Secrets stay in `.env`; sensitive invocation values remain parameters; artifacts contain no raw PII; evidence passes through recursive redaction. The demo uses only synthetic data.

Limits: regex redaction is defense in depth, not a DLP system. Production requires field-level classification, encrypted evidence with retention limits, tenant-scoped credentials, audit immutability, content-injection defenses, and independent authorization at the target application.

# 7. Cuts

I chose a thin but real implementation of every required seam. I did not build a polished operator console, desktop adapter, distributed queue, persistent database, generalized retry DSL, or visual grounding model. Locator fallbacks and tenant overrides are represented but minimally executed. These cuts keep attention on the load-bearing contracts.

Next I would add bounded recovery rules with idempotency declarations, authenticated streaming handoff, artifact signing and approval workflow, cross-tenant replay canaries, and multi-run stability scoring. Only after those controls would I add a narrowly bounded LLM fallback during replay.
