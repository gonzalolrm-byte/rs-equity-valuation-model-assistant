/**
 * Claude service abstraction.
 *
 * PROTOTYPE: every call below is simulated in the browser. No Anthropic
 * request is made and no API key exists in this project. The signatures are
 * the contract the phase-2 server functions will implement unchanged.
 * See ./README.md.
 */

import type { PromptAction } from "../data";

export type MissingItemStatus = "Data not found" | "Missing information" | "Requires user input";

export type MissingItem = {
  field: string;
  worksheet: string;
  status: MissingItemStatus;
};

export type ActionExecution = {
  actionId: string;
  title: string;
  promptId: string;
  startedAt: string;
  finishedAt: string;
  state: "completed" | "partial";
  summary: string;
  missing: MissingItem[];
};

export type ExecutionLog = {
  runId: string;
  startedAt: string;
  executions: ActionExecution[];
  missing: MissingItem[];
};

export type RunContext = {
  documents: string[];
  answers?: Record<string, unknown>;
  resources?: string[];
};

const MOCK_MISSING: Record<string, MissingItem[]> = {
  "Q-007": [
    { field: "Deferred tax liabilities (FY2023)", worksheet: "Historicals", status: "Data not found" },
  ],
  "Q-008": [
    { field: "CapEx by segment (FY2022)", worksheet: "Operational Drivers", status: "Missing information" },
    { field: "Utilities & Energy split", worksheet: "COGS Breakdown", status: "Requires user input" },
  ],
  "Q-013": [
    { field: "YTD other operating income", worksheet: "YTD Actuals", status: "Data not found" },
  ],
  "Q-015": [
    { field: "Covenant schedule for Facility B", worksheet: "Debt", status: "Requires user input" },
  ],
};

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * Executes a single predefined prompt action.
 * Phase 2: prompt text is read from the database, documents are attached, and
 * the request is sent to Claude from the server.
 */
export async function runAction(
  prompt: PromptAction,
  context: RunContext,
  onProgress?: (message: string) => void,
): Promise<ActionExecution> {
  const startedAt = new Date().toISOString();
  onProgress?.(`${prompt.id} · ${prompt.title}`);
  await wait(700);

  const missing = MOCK_MISSING[prompt.id] ?? [];
  return {
    actionId: prompt.id,
    title: prompt.title,
    promptId: prompt.id,
    startedAt,
    finishedAt: new Date().toISOString(),
    state: missing.length ? "partial" : "completed",
    summary: missing.length
      ? `Executed with ${missing.length} unresolved input${missing.length > 1 ? "s" : ""} flagged.`
      : "Executed successfully. All required inputs resolved.",
    missing,
  };
}

/** Runs an ordered set of prompt actions and records an execution log. */
export async function runActions(
  prompts: PromptAction[],
  context: RunContext,
  onProgress?: (message: string) => void,
): Promise<ExecutionLog> {
  const startedAt = new Date().toISOString();
  const executions: ActionExecution[] = [];
  for (const prompt of prompts) {
    executions.push(await runAction(prompt, context, onProgress));
  }
  return {
    runId: `run-${Date.now()}`,
    startedAt,
    executions,
    missing: executions.flatMap((execution) => execution.missing),
  };
}

/** Developer prompt testing. Phase 2: single Claude call, no side effects. */
export async function testPrompt(
  promptText: string,
  testDocument: string,
): Promise<{ response: string; latencyMs: number }> {
  await wait(900);
  return {
    latencyMs: 900,
    response: [
      "SIMULATED RESPONSE — Claude is not connected in this prototype.",
      "",
      `Prompt characters: ${promptText.length}`,
      `Test document: ${testDocument || "none selected"}`,
      "",
      "Structured output preview:",
      "{",
      '  "resolved": [',
      '    { "field": "Revenue FY2025", "value": 184200000, "source": "p. 14" }',
      "  ],",
      '  "unresolved": [',
      '    { "field": "CapEx by segment FY2022", "status": "Data not found" }',
      "  ]",
      "}",
    ].join("\n"),
  };
}
