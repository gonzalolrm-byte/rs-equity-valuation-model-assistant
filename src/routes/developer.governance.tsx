import { createFileRoute } from "@tanstack/react-router";
import { EditableText } from "@/lib/ui-content";
import { FileText, Info, Plus, ShieldCheck, Trash2, Upload, X } from "lucide-react";
import { useRef, useState } from "react";

export const Route = createFileRoute("/developer/governance")({
  head: () => ({
    meta: [
      { title: "Governance — Developer Console" },
      {
        name: "description",
        content:
          "Define the governance rules for the valuation model assistant: review and approval owners, model change control, documentation requirements and audit records.",
      },
      { property: "og:title", content: "Governance — Developer Console" },
      {
        property: "og:description",
        content:
          "Manage review owners, approval requirements and supporting governance documents for the valuation model assistant.",
      },
    ],
  }),
  component: Governance,
});

type Policy = {
  id: string;
  name: string;
  owner: string;
  description: string;
  required: boolean;
  files: string[];
};

const INITIAL_POLICIES: Policy[] = [
  {
    id: "gov-review",
    name: "Model Review & Sign-off",
    owner: "CROMC Equity Team",
    description:
      "Every generated or updated valuation model is reviewed by a second team member before it is shared with the investment team.",
    required: true,
    files: [],
  },
  {
    id: "gov-assumptions",
    name: "Assumption Documentation",
    owner: "Valuation Analyst",
    description:
      "Key assumptions (growth, margins, cost of equity, exit multiples) must be documented with their source before the model is approved.",
    required: true,
    files: [],
  },
  {
    id: "gov-change-control",
    name: "Template Change Control",
    owner: "Developer / Template Owner",
    description:
      "Changes to standardized templates, prompts or market data are recorded with a date, author and short rationale.",
    required: true,
    files: [],
  },
  {
    id: "gov-retention",
    name: "Data Retention & Access",
    owner: "CROMC Equity Team",
    description:
      "Uploaded company files and generated models are retained per the internal retention policy and accessible only to authorized users.",
    required: false,
    files: [],
  },
];

function Governance() {
  const [policies, setPolicies] = useState<Policy[]>(INITIAL_POLICIES);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [owner, setOwner] = useState("");
  const [description, setDescription] = useState("");

  const update = (id: string, changes: Partial<Policy>) =>
    setPolicies((items) =>
      items.map((item) => (item.id === id ? { ...item, ...changes } : item)),
    );

  const submit = () => {
    if (!name.trim()) return;
    setPolicies((items) => [
      ...items,
      {
        id: `gov-custom-${Date.now()}`,
        name: name.trim(),
        owner: owner.trim() || "Unassigned",
        description: description.trim() || "No description provided.",
        required: true,
        files: [],
      },
    ]);
    setName("");
    setOwner("");
    setDescription("");
    setAdding(false);
  };

  return (
    <div>
      <EditableText as="h1" className="block font-heading text-2xl font-extrabold" group="Governance">
        4. Governance
      </EditableText>
      <EditableText as="p" className="mt-2 block max-w-3xl text-[15px] leading-relaxed text-muted-foreground" group="Governance">
        Define the review, approval and documentation rules that apply to models produced with this application, and keep the supporting governance documents in one place.
      </EditableText>

      <div className="mt-6 space-y-4">
        {policies.map((policy) => (
          <PolicyRow
            key={policy.id}
            policy={policy}
            onUpdate={(changes) => update(policy.id, changes)}
            onDelete={() =>
              setPolicies((items) => items.filter((item) => item.id !== policy.id))
            }
          />
        ))}
      </div>

      {adding ? (
        <section className="mt-4 rounded-xl border border-primary/40 bg-panel p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-[16px] font-bold">New governance rule</h2>
            <button
              type="button"
              onClick={() => setAdding(false)}
              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary"
              aria-label="Cancel new governance rule"
            >
              <X className="size-4" />
            </button>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="text-[13px] font-semibold text-navy">
              Rule name
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g. Independent Valuation Review"
                className="mt-1.5 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm font-normal text-navy outline-none focus:border-primary"
              />
            </label>
            <label className="text-[13px] font-semibold text-navy">
              Owner
              <input
                value={owner}
                onChange={(event) => setOwner(event.target.value)}
                placeholder="e.g. CROMC Equity Team"
                className="mt-1.5 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm font-normal text-navy outline-none focus:border-primary"
              />
            </label>
            <label className="text-[13px] font-semibold text-navy sm:col-span-2">
              Description
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={2}
                placeholder="What this rule requires and when it applies."
                className="mt-1.5 w-full rounded-lg border border-border bg-card px-3 py-2 text-sm font-normal text-navy outline-none focus:border-primary"
              />
            </label>
          </div>
          <button
            type="button"
            onClick={submit}
            disabled={!name.trim()}
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-[13px] font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            <Plus className="size-4" />
            Add rule
          </button>
        </section>
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="mt-4 inline-flex items-center gap-2 rounded-lg border border-dashed border-primary/50 px-4 py-2.5 text-[13px] font-semibold text-primary transition-colors hover:bg-panel"
        >
          <Plus className="size-4" />
          Add new rule
        </button>
      )}

      <div className="mt-6 flex gap-3 rounded-xl border border-panel-border bg-panel p-5">
        <Info className="mt-0.5 size-4 shrink-0 text-primary" />
        <p className="text-[13px] leading-relaxed text-navy-soft">
          Rules marked as required are shown to users as part of the review step before a model is
          finalized. Supporting documents (policies, checklists, sign-off forms) can be attached to
          each rule. Supported formats: Word (.docx), PDF (.pdf) and Excel (.xlsx, .xls).
        </p>
      </div>
    </div>
  );
}

function PolicyRow({
  policy,
  onUpdate,
  onDelete,
}: {
  policy: Policy;
  onUpdate: (changes: Partial<Policy>) => void;
  onDelete: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <section className="rounded-xl border border-border bg-card p-5 shadow-card">
      <div className="flex flex-wrap items-start gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <ShieldCheck className="size-4 shrink-0 text-primary" />
            <h2 className="font-heading text-[16px] font-bold">{policy.name}</h2>
            <span
              className={`rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${
                policy.required
                  ? "bg-panel text-primary"
                  : "bg-secondary text-navy-soft"
              }`}
            >
              {policy.required ? "Required" : "Optional"}
            </span>
          </div>
          <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
            {policy.description}
          </p>
          <p className="mt-2 text-[12px] text-muted-foreground">
            Owner: <span className="font-semibold text-navy-soft">{policy.owner}</span> ·{" "}
            <span className={policy.files.length ? "text-success" : "text-warning"}>
              {policy.files.length} document(s)
            </span>
          </p>
        </div>
        <button
          type="button"
          onClick={() => onUpdate({ required: !policy.required })}
          className="inline-flex items-center gap-2 rounded-lg border border-input px-3.5 py-2 text-[13px] font-semibold text-navy transition-colors hover:bg-secondary"
          aria-pressed={policy.required}
        >
          {policy.required ? "Mark optional" : "Mark required"}
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="inline-flex items-center gap-2 rounded-lg border border-destructive/40 px-3.5 py-2 text-[13px] font-semibold text-destructive transition-colors hover:bg-destructive/10"
        >
          <Trash2 className="size-4" />
          Remove
        </button>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="inline-flex items-center gap-2 rounded-lg border border-primary/40 px-3.5 py-2 text-[13px] font-semibold text-primary transition-colors hover:bg-panel"
        >
          <Upload className="size-4" />
          Upload document
        </button>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".docx,.pdf,.xlsx,.xls"
          className="hidden"
          onChange={(event) => {
            if (event.target.files?.length) {
              const names = Array.from(event.target.files).map((file) => file.name);
              onUpdate({ files: [...policy.files, ...names] });
            }
            event.target.value = "";
          }}
        />
      </div>

      {policy.files.length > 0 && (
        <ul className="mt-4 space-y-2">
          {policy.files.map((file) => (
            <li
              key={file}
              className="flex items-center gap-3 rounded-lg border border-border bg-secondary/40 px-3 py-2.5"
            >
              <FileText className="size-4 shrink-0 text-primary" />
              <span className="min-w-0 flex-1 truncate text-sm text-navy">{file}</span>
              <button
                type="button"
                onClick={() =>
                  onUpdate({ files: policy.files.filter((item) => item !== file) })
                }
                className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                aria-label={`Remove ${file}`}
              >
                <Trash2 className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
