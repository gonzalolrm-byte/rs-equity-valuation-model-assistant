import { createFileRoute } from "@tanstack/react-router";
import { ArrowDown, ArrowUp, FileText, Pencil, Play, Plus, Power, Search, Trash2, UploadCloud, X } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { Button } from "@/components/Button";
import { SelectField, TextField } from "@/components/form";
import { PROMPT_CATEGORIES, PROMPT_STEPS, type PromptAction } from "@/lib/data";
import { testPrompt } from "@/lib/services/claudeService";
import { extractPromptText } from "@/lib/services/documentTextService";
import { useApp } from "@/lib/store";


const WORKFLOWS = [
  {
    key: "Workflow A",
    prefix: "A",
    title: "Use Standardized Model for the First Time",
    description:
      "AI instructions used during Workflow A. Step 1 instructions correspond directly to the questions and decisions collected in the Template Selection & Key Inputs questionnaire and are used to configure the standardized DCF model.",
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
  const [activeWorkflow, setActiveWorkflow] = useState<string>(WORKFLOWS[0].key);

  const workflow = WORKFLOWS.find((item) => item.key === activeWorkflow) ?? WORKFLOWS[0];

  return (
    <div>
      <div>
        <EditableText as="h1" className="block font-heading text-2xl font-extrabold" group="Prompts & Actions">
          3. Prompts & Actions
        </EditableText>
        <EditableText as="p" className="mt-2 block max-w-3xl text-[15px] leading-relaxed text-muted-foreground" group="Prompts & Actions">
          Manage the list of actions / questions and their corresponding Claude prompts, organized by workflow. Each item has a unique ID (A-## for the first-time standardized model, B-## for model updates), title and prompt that guides Claude's response.
        </EditableText>
      </div>

      <div className="mt-6 inline-flex rounded-xl border border-border bg-card p-1 shadow-card">
        {WORKFLOWS.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => setActiveWorkflow(item.key)}
            aria-pressed={item.key === activeWorkflow}
            className={[
              "rounded-lg px-4 py-2 text-sm font-semibold transition-colors",
              item.key === activeWorkflow
                ? "bg-primary text-primary-foreground"
                : "text-navy-soft hover:bg-secondary",
            ].join(" ")}
          >
            {item.key}
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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

      <div className="mt-8">
        <WorkflowSection
          key={workflow.key}
          workflow={workflow}
          search={search}
          category={category}
          status={status}
        />
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
  const { state, togglePromptStatus, deletePrompt, movePrompt } = useApp();
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

  const rows = filtered;


  let digits = 2;
  const maxNumber = state.prompts.reduce((max, prompt) => {
    const match = prompt.id.match(new RegExp(`^${workflow.prefix}-(\\d+)$`));
    if (!match) return max;
    const number = match[1] ?? "";
    digits = Math.max(digits, number.length);
    return Math.max(max, Number(number));
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
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="bg-secondary/70 text-[12px] uppercase tracking-wide text-navy-soft">
              <tr>
                <Th>ID</Th>
                <Th>Category</Th>
                <Th>Status</Th>
                <Th>Last Updated</Th>
                <Th>Actions</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((prompt) => {
                const orderIndex = workflowPrompts.findIndex((item) => item.id === prompt.id);
                return (
                <tr key={prompt.id} className="border-t border-border">
                  <td className="whitespace-nowrap px-4 py-3 font-mono text-[12px] font-semibold text-primary">
                    {prompt.id}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{prompt.category}</td>
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
                        onClick={() => movePrompt(prompt.id, "up")}
                        disabled={orderIndex <= 0}
                        className="rounded-md p-1.5 text-navy-soft transition-colors hover:bg-secondary disabled:opacity-30"
                        aria-label={`Move ${prompt.id} up`}
                      >
                        <ArrowUp className="size-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => movePrompt(prompt.id, "down")}
                        disabled={orderIndex < 0 || orderIndex >= workflowPrompts.length - 1}
                        className="rounded-md p-1.5 text-navy-soft transition-colors hover:bg-secondary disabled:opacity-30"
                        aria-label={`Move ${prompt.id} down`}
                      >
                        <ArrowDown className="size-4" />
                      </button>
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
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`Delete action ${prompt.id} (${prompt.title})?`)) {
                            deletePrompt(prompt.id);
                          }
                        }}
                        className="rounded-md p-1.5 text-destructive transition-colors hover:bg-destructive/10"
                        aria-label={`Delete ${prompt.id}`}
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </td>
                </tr>
                );
              })}
              {rows.length === 0 && (
                <tr className="border-t border-border">
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                    No actions match these filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="border-t border-border px-4 py-3 text-[13px] text-muted-foreground">
          <span>{filtered.length} action(s)</span>
        </div>

      </div>

      {(editing || creating) && (
        <PromptEditor
          prompt={
            editing ?? {
              id: nextId,
              title: "",
              category: PROMPT_CATEGORIES[0] ?? "Template Selection & Key Inputs",
              step: workflowSteps[0] ?? `${workflow.key} – Step 1`,
              status: "Active",
              lastUpdated: new Date().toISOString().slice(0, 10),
              promptText: "",
              requiredResources: [],
            }
          }
          isNew={creating}
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
  onClose,
}: {
  prompt: PromptAction;
  isNew: boolean;
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
            label="Category"
            value={draft.category}
            onChange={(value) => setDraft({ ...draft, category: value })}
            placeholder="Enter category name"
          />

          <label className="block">
            <span className="mb-1.5 block text-sm text-muted-foreground">Description</span>
            <textarea
              value={draft.description ?? ""}
              onChange={(event) => setDraft({ ...draft, description: event.target.value })}
              placeholder="Brief description of what this prompt does"
              rows={3}
              className="w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </label>

          <PromptUpload
            promptText={draft.promptText}
            fileName={draft.promptFileName}
            fileData={draft.promptFileData}
            onChange={(text, fileName, fileData) =>
              setDraft({
                ...draft,
                promptText: text,
                promptFileName: fileName,
                promptFileData: fileData,
              })
            }
          />

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
            disabled={!draft.id.trim()}
            onClick={() => {
              if (isNew)
                addPrompt({
                  ...draft,
                  title: draft.title.trim() || draft.id,
                  custom: true,
                  lastUpdated: new Date().toISOString().slice(0, 10),
                });
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

function PromptUpload({
  promptText,
  fileName,
  fileData,
  onChange,
}: {
  promptText: string;
  fileName?: string | undefined;
  fileData?: string | undefined;
  onChange: (
    text: string,
    fileName?: string | undefined,
    fileData?: string | undefined,
  ) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [showText, setShowText] = useState(false);

  const load = async (list: FileList | null) => {
    const file = list?.[0];
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      const result = await extractPromptText(file);
      if (!result.text) {
        setError("No readable text was found in that file.");
      } else {
        const dataUrl = await new Promise<string | undefined>((resolve) => {
          const reader = new FileReader();
          reader.onload = () =>
            resolve(typeof reader.result === "string" ? reader.result : undefined);
          reader.onerror = () => resolve(undefined);
          reader.readAsDataURL(file);
        });
        onChange(result.text, result.fileName, dataUrl);
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not read that file.");
    } finally {
      setBusy(false);
    }
  };



  return (
    <div className="block">
      <span className="mb-1.5 block text-sm text-muted-foreground">AI Prompt / Instruction</span>

      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          void load(event.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") inputRef.current?.click();
        }}
        className={[
          "cursor-pointer rounded-xl border-2 border-dashed px-5 py-7 text-center transition-colors",
          dragging ? "border-primary bg-panel" : "border-input bg-secondary/40 hover:border-primary/60",
        ].join(" ")}
      >
        <UploadCloud className="mx-auto size-6 text-primary" />
        <p className="mt-2 text-sm font-semibold text-navy">
          {busy ? "Reading document…" : "Upload the prompt document"}
        </p>
        <p className="mt-1 text-[12px] text-muted-foreground">
          Drag and drop or click to browse · Word (.docx), PDF or plain text
        </p>
        <input
          ref={inputRef}
          type="file"
          accept=".docx,.pdf,.txt,.md"
          className="hidden"
          onChange={(event) => {
            void load(event.target.files);
            event.target.value = "";
          }}
        />
      </div>

      {error && <p className="mt-2 text-[12px] font-semibold text-destructive">{error}</p>}

      {promptText && (
        <div className="mt-3 rounded-xl border border-border bg-card">
          <div className="flex items-center gap-3 px-3.5 py-2.5">
            <FileText className="size-4 shrink-0 text-primary" />
            <span className="hidden text-[12px] text-muted-foreground sm:block">
              {promptText.length.toLocaleString()} characters
            </span>
            <div className="ml-auto flex items-center gap-1">
              <button
                type="button"
                onClick={() => setShowText((value) => !value)}
                className="rounded-md px-2 py-1 text-[12px] font-semibold text-primary transition-colors hover:bg-panel"
              >
                {showText ? "Hide text" : "View text"}
              </button>
              <a
                href={
                  fileData ??
                  `data:text/plain;charset=utf-8,${encodeURIComponent(promptText)}`
                }
                download={fileData ? (fileName ?? "prompt") : `${fileName ?? "prompt"}.txt`}
                className="rounded-md px-2 py-1 text-[12px] font-semibold text-primary transition-colors hover:bg-panel"
              >
                Download file
              </a>
              <button
                type="button"
                onClick={() => {
                  setShowText(false);
                  onChange("", undefined, undefined);
                }}
                className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                aria-label="Remove uploaded prompt"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          </div>
          {fileName && (
            <p className="truncate border-t border-border px-3.5 py-2 text-[13px] font-semibold text-navy">
              {fileName}
            </p>
          )}
          {showText && (
            <pre className="max-h-72 overflow-auto whitespace-pre-wrap border-t border-border px-3.5 py-3 font-mono text-[12px] leading-relaxed text-navy-soft">
              {promptText}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}

