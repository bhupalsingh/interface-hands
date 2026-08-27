import type { Step } from "./schema.js";

export type Policy = { allowedOrigins: string[]; allowedActions: Step["action"][]; allowIrreversible: boolean };
export const defaultPolicy: Policy = {
  allowedOrigins: ["http://127.0.0.1:3100", "http://localhost:3100"],
  allowedActions: ["goto", "click", "fill", "extract", "wait", "assert"], allowIrreversible: false
};
export function enforcePolicy(url: string, step: Step, policy = defaultPolicy) {
  const origin = new URL(url).origin;
  if (!policy.allowedOrigins.includes(origin)) throw new Error(`POLICY: origin ${origin} is not allowed`);
  if (!policy.allowedActions.includes(step.action)) throw new Error(`POLICY: action ${step.action} is not allowed`);
  if (step.risk === "irreversible" && !policy.allowIrreversible) throw new Error("POLICY: irreversible action requires human approval");
}
export function redact(value: unknown): unknown {
  if (typeof value === "string") return value.replace(/\b\d{9}\b/g, "[REDACTED_SSN]").replace(/(token|password|secret)=\S+/gi, "$1=[REDACTED]");
  if (Array.isArray(value)) return value.map(redact);
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([k,v]) => [/password|token|secret|ssn/i.test(k) ? k : k, /password|token|secret|ssn/i.test(k) ? "[REDACTED]" : redact(v)]));
  return value;
}
