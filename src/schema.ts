import { z } from "zod";

export const LocatorSchema = z.object({
  strategy: z.enum(["role", "label", "text", "css", "coordinates"]),
  value: z.string(),
  name: z.string().optional(),
  exact: z.boolean().default(true),
  fallbacks: z.array(z.object({ strategy: z.enum(["role", "label", "text", "css"]), value: z.string(), name: z.string().optional() })).default([])
});
export const StepSchema = z.object({
  id: z.string(), action: z.enum(["goto", "click", "fill", "extract", "wait", "assert"]),
  locator: LocatorSchema.optional(), value: z.string().optional(), output: z.string().optional(),
  timeoutMs: z.number().int().positive().default(5000), risk: z.enum(["safe", "reversible", "irreversible"]).default("safe"),
  checkpoint: z.object({ kind: z.enum(["url", "visible", "text"]), value: z.string() }).optional()
});
export const CapabilitySchema = z.object({
  schemaVersion: z.literal("1.0"), capabilityVersion: z.string(), name: z.string(), description: z.string(),
  vendorApp: z.string(), baseUrl: z.string(), approved: z.boolean().default(false),
  inputs: z.record(z.string(), z.object({ type: z.enum(["string", "number", "boolean"]), required: z.boolean(), sensitive: z.boolean().default(false) })),
  outputs: z.record(z.string(), z.object({ type: z.enum(["string", "number", "boolean"]), description: z.string() })),
  steps: z.array(StepSchema), success: z.object({ kind: z.enum(["url", "visible", "text"]), value: z.string() }),
  businessOutcomes: z.array(z.object({ code: z.string(), locator: LocatorSchema, message: z.string() })).default([]),
  tenantOverrides: z.record(z.string(), z.object({ baseUrl: z.string().optional(), locatorOverrides: z.record(z.string(), LocatorSchema).optional() })).default({}),
  metadata: z.object({ createdAt: z.string(), discoveredBy: z.string(), reviewedBy: z.string().optional() })
});
export type Capability = z.infer<typeof CapabilitySchema>;
export type Step = z.infer<typeof StepSchema>;

export type RunResult =
  | { status: "success"; runId: string; outputs: Record<string, unknown>; durationMs: number }
  | { status: "business_outcome"; runId: string; code: string; message: string; stepId: string }
  | { status: "failure"; runId: string; error: { category: "POLICY"|"TIMEOUT"|"LOCATOR"|"CHECKPOINT"|"APP"|"HUMAN_REQUIRED"; stepId: string; message: string; evidence?: string } };

export const AgentDecisionSchema = z.object({
  rationale: z.string(), action: z.enum(["click", "fill", "extract", "done", "escalate"]),
  locator: LocatorSchema.optional(), value: z.string().optional(), output: z.string().optional(),
  success: z.object({ kind: z.enum(["url", "visible", "text"]), value: z.string() }).optional()
});
export type AgentDecision = z.infer<typeof AgentDecisionSchema>;
