import { createFileRoute } from "@tanstack/react-router";
import { Pencil, Play, Plus, Power, Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/Button";
import { SelectField, TextField } from "@/components/form";
import { PROMPT_CATEGORIES, PROMPT_STEPS, type PromptAction } from "@/lib/data";
import { testPrompt } from "@/lib/services/claudeService";
import { useApp } from "@/lib/store";

const PAGE_SIZE = 8;

const WORKFLOWS = [
  {
    key: "Workflow A",
    prefix: "A",
    title: "Use Standardized Model for the First Time",
    description:
      "AI instructions used during Workflow A. Step 1 instructions correspond directly to the questions and decisions collected in the Company Information questionnaire and are used to configure the standardized DCF model.",
  },
  {
    key: "Workflow B",
    prefix: "B",
    title: "Update Standardized Model",
    description:
      "Prompts executed during Workflow B: quarterly and event-driven updates to an existing standardized model.",
  },
] as const;

export const Route = createFileRoute("/developer/prompts")({
  head: () => ({
    meta: [
      { title: "Prompts & Actions — Developer Console" },
      {
        name: "description",
        content:
          "Manage the action registry per workflow: every user question or model update has a unique ID and a developer-editable Claude prompt, searchable, filterable and testable.",
      },
      { property: "og:title", content: "Prompts & Actions — Developer Console" },
      {
        property: "og:description",
        content: "Create, edit, test, activate and deactivate the prompts sent to Claude.",
      },
    ],
  }),
  component: Prompts,
});

function Prompts() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");

  return (
    <div>
      <div>
        <h1 className="font-heading text-2xl font-extrabold">2. Prompts &amp; Actions</h1>
        <p className="mt-2 max-w-3xl text-[15px] leading-relaxed text-muted-foreground">
          Manage the list of actions / questions and their corresponding Claude prompts, organized
          by workflow. Each item has a unique ID (A-## for the first-time standardized model,
          B-## for model updates), title and prompt that guides Claude's response.
        </p>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <label className="relative block">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by ID, title or keyword…"
            className="w-full rounded-lg border border-input bg-card py-2.5 pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/25"
          />
        </label>
        <SelectField
          value={category}
          onChange={setCategory}
          options={PROMPT_CATEGORIES}
          placeholder="All Categories"
        />
        <SelectField
          value={status}
          onChange={setStatus}
          options={["Active", "Inactive"]}
          placeholder="All Statuses"
        />
      </div>

      <div className="mt-8 space-y-10">
        {WORKFLOWS.map((workflow) => (
          <WorkflowSection
            key={workflow.key}
            workflow={workflow}
            search={search}
            category={category}
            status={status}
          />
        ))}
      </div>
    </div>
  );
}

function WorkflowSection({
  workflow,
  search,
  category,
  status,
}: {
  workflow: (typeof WORKFLOWS)[number];
  search: string;
  category: string;
  status: string;
}) {
  const { state, togglePromptStatus } = useApp();
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<PromptAction | null>(null);
  const [creating, setCreating] = useState(false);

  const workflowPrompts = useMemo(
    () =>
      state.prompts
        .filter((prompt) => prompt.step.startsWith(workflow.key))
        // Keep the table in strict ID sequence (A-01, A-02, ...).
        .slice()
        .sort((a, b) => a.id.localeCompare(b.id)),
    [state.prompts, workflow.key],
  );

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return workflowPrompts.filter((prompt) => {
      if (category && prompt.category !== category) return false;
      if (status && prompt.status !== status) return false;
      if (!query) return true;
      return (
        prompt.id.toLowerCase().includes(query) ||
        prompt.title.toLowerCase().includes(query) ||
        prompt.promptText.toLowerCase().includes(query)
      );
    });
  }, [workflowPrompts, search, category, status]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pages);
  const rows = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  let digits = 2;
  const maxNumber = state.prompts.reduce((max, prompt) => {
    const match = prompt.id.match(new RegExp(`^${workflow.prefix}-(\\d+)$`));
    if (!match) return max;
    digits = Math.max(digits, match[1].length);
    return Math.max(max, Number(match[1]));
  }, 0);
  const nextId = `${workflow.prefix}-${String(maxNumber + 1).padStart(digits, "0")}`;

  const workflowSteps = PROMPT_STEPS.filter((step) => step.startsWith(workflow.key));

  return (
    <section>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-heading text-lg font-extrabold text-navy">
            {workflow.key} — {workflow.title}
          </h2>
          <p className="mt-1 max-w-3xl text-[13px] leading-relaxed text-muted-foreground">
            {workflow.description}
          </p>
        </div>
        <Button variant="secondary" onClick={() => setCreating(true)}>
          <Plus className="size-4" />
          Add {workflow.key} Action
        </Button>
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border border-border bg-card shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[880px] text-left text-sm">
            <thead className="bg-secondary/70 text-[12px] uppercase tracking-wide text-navy-soft">
              <tr>
                <Th>ID</Th>
                <Th>Title / Question</Th>
                <Th>Category</Th>
                <Th>Step</Th>
                <Th>Status</Th>
                <Th>Last Updated</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((prompt) => (
                <tr key={prompt.id} className="border-t border-border">
                  <td className="whitespace-nowrap px-4 py-3 font-mono text-[12px] font-semibold text-primary">
                    {prompt.id}
                  </td>
                  <td className="max-w-80 px-4 py-3 text-navy">{prompt.title}</td>
                  <td className="px-4 py-3 text-muted-foreground">{prompt.category}</td>
                  <td className="px-4 py-3 text-muted-foreground">{prompt.step}</td>
                  <td className="px-4 py-3">
                    <span
                      className={[
                        "rounded-full px-2.5 py-1 text-[11px] font-semibold",
                        prompt.status === "Active"
                          ? "bg-success-soft text-success"
                          : "bg-secondary text-muted-foreground",
                      ].join(" ")}
                    >
                      {prompt.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{prompt.lastUpdated}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setEditing(prompt)}
                        className="rounded-md p-1.5 text-primary transition-colors hover:bg-panel"
                        aria-label={`Edit ${prompt.id}`}
                      >
                        <Pencil className="size-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => togglePromptStatus(prompt.id)}
                        className="rounded-md p-1.5 text-navy-soft transition-colors hover:bg-secondary"
                        aria-label={`Toggle status of ${prompt.id}`}
                      >
                        <Power className="size-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr className="border-t border-border">
                  <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                    No actions match these filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3 text-[13px] text-muted-foreground">
          <span>
            {filtered.length} action(s) · page {current} of {pages}
          </span>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              disabled={current <= 1}
              onClick={() => setPage(current - 1)}
              className="px-3 py-1.5"
            >
              Previous
            </Button>
            <Button
              variant="secondary"
              disabled={current >= pages}
              onClick={() => setPage(current + 1)}
              className="px-3 py-1.5"
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      {(editing || creating) && (
        <PromptEditor
          prompt={
            editing ?? {
              id: nextId,
              title: "",
              category: PROMPT_CATEGORIES[0] ?? "General Information",
              step: workflowSteps[0] ?? `${workflow.key} – Step 1`,
              status: "Active",
              lastUpdated: new Date().toISOString().slice(0, 10),
              promptText: "",
              requiredResources: [],
            }
          }
          isNew={creating}
          steps={workflowSteps}
          onClose={() => {
            setEditing(null);
            setCreating(false);
          }}
        />
      )}
    </section>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-4 py-3 font-semibold">{children}</th>;
}

function PromptEditor({
  prompt,
  isNew,
  steps,
  onClose,
}: {
  prompt: PromptAction;
  isNew: boolean;
  steps: readonly string[];
  onClose: () => void;
}) {
  const { state, savePrompt, addPrompt } = useApp();
  const [draft, setDraft] = useState<PromptAction>(prompt);
  const [testDoc, setTestDoc] = useState("");
  const [testing, setTesting] = useState(false);
  const [response, setResponse] = useState("");

  const resourceFiles = state.resources.flatMap((resource) => resource.files);

  const runTest = async () => {
    setTesting(true);
    setResponse("");
    const result = await testPrompt(draft.promptText, testDoc);
    setResponse(result.response);
    setTesting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-navy/40 p-0 sm:p-4">
      <div className="flex h-full w-full max-w-2xl flex-col overflow-y-auto rounded-none bg-card shadow-card-hover sm:rounded-xl">
        <div className="sticky top-0 flex items-center justify-between gap-4 border-b border-border bg-card px-5 py-4">
          <h2 className="font-heading text-lg font-bold">
            {isNew ? "Add New Action" : "Edit Prompt"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-secondary"
            aria-label="Close editor"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="space-y-5 px-5 py-6">
          <div className="grid gap-4 sm:grid-cols-2">
            {isNew ? (
              <TextField
                label="ID"
                value={draft.id}
                onChange={(value) => setDraft({ ...draft, id: value })}
              />
            ) : (
              <label className="block">
                <span className="mb-1.5 block text-sm text-muted-foreground">ID</span>
                <p className="rounded-lg border border-input bg-secondary/40 px-3.5 py-2.5 font-mono text-[13px] font-semibold text-primary">
                  {draft.id}
                </p>
              </label>
            )}
            <SelectField
              label="Status"
              value={draft.status}
              onChange={(value) => setDraft({ ...draft, status: value as PromptAction["status"] })}
              options={["Active", "Inactive"]}
              placeholder="Select status"
            />
          </div>

          <TextField
            label="Title / Question"
            value={draft.title}
            onChange={(value) => setDraft({ ...draft, title: value })}
            placeholder="e.g. Update Cost of Equity Parameters"
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <SelectField
              label="Category"
              value={draft.category}
              onChange={(value) => setDraft({ ...draft, category: value })}
              options={PROMPT_CATEGORIES}
              placeholder="Select category"
            />
            <SelectField
              label="Step / Workflow"
              value={draft.step}
              onChange={(value) => setDraft({ ...draft, step: value })}
              options={steps}
              placeholder="Select step"
            />
          </div>

          <TextField
            label="Questionnaire Variable(s)"
            value={(draft.variables ?? []).join(", ")}
            onChange={(value) =>
              setDraft({
                ...draft,
                variables: value
                  .split(",")
                  .map((item) => item.trim())
                  .filter(Boolean),
              })
            }
            placeholder="e.g. {{company_name}}, {{primary_sector}}"
          />

          <label className="block">
            <span className="mb-1.5 block text-sm text-muted-foreground">
              AI Prompt / Instruction
            </span>
            <textarea
              value={draft.promptText}
              onChange={(event) => setDraft({ ...draft, promptText: event.target.value })}
              rows={14}
              className="w-full rounded-lg border border-input bg-secondary/40 px-3.5 py-3 font-mono text-[13px] leading-relaxed text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring/25"
              placeholder="Exact instruction this action contributes to model generation…"
            />
          </label>

          <p className="text-[12px] text-muted-foreground">
            Last updated: <span className="font-semibold text-navy">{draft.lastUpdated}</span>
          </p>

          <div className="rounded-xl border border-panel-border bg-panel/60 p-4">
            <p className="font-heading text-[14px] font-bold">Test Prompt</p>
            <p className="mt-1 text-[12px] text-muted-foreground">
              Run this prompt against a developer resource or an uploaded test document, review the
              response, adjust the prompt and test again. Claude is not connected in this prototype,
              so the response is simulated.
            </p>
            <div className="mt-3 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
              <SelectField
                value={testDoc}
                onChange={setTestDoc}
                options={resourceFiles}
                placeholder="Select a developer resource"
              />
              <Button variant="secondary" onClick={runTest} disabled={testing}>
                <Play className="size-4" />
                {testing ? "Running…" : "Run Test"}
              </Button>
            </div>
            {response && (
              <pre className="mt-3 max-h-64 overflow-auto rounded-lg border border-border bg-card p-3 font-mono text-[12px] leading-relaxed text-navy-soft">
                {response}
              </pre>
            )}
          </div>
        </div>

        <div className="sticky bottom-0 flex justify-end gap-3 border-t border-border bg-card px-5 py-4">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            disabled={!draft.id.trim() || !draft.title.trim()}
            onClick={() => {
              if (isNew) addPrompt({ ...draft, lastUpdated: new Date().toISOString().slice(0, 10) });
              else savePrompt(draft);
              onClose();
            }}
          >
            {isNew ? "Add Action" : "Save Prompt"}
          </Button>
        </div>
      </div>
    </div>
  );
}
