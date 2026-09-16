import { ArrowDown, ArrowUp, CheckCircle2, FileText, Trash2, UploadCloud } from "lucide-react";
import { useRef, useState } from "react";
import { useApp, type UploadedFile } from "@/lib/store";
import { EditableText, useUiContentSafe } from "@/lib/ui-content";

export type UploadSlot = {
  key: string;
  index: number;
  title: string;
  description: string;
  formats: string;
  accept: string;
  required?: boolean;
  multiple?: boolean;
};

export function UploadCard({
  group,
  slot,
  onMove,
}: {
  group: "newFiles" | "updateFiles";
  slot: UploadSlot;
  onMove?: (direction: "up" | "down") => void;
}) {
  const { state, addFiles, removeFile } = useApp();
  const ui = useUiContentSafe();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const files: UploadedFile[] = state[group][slot.key] ?? [];

  const handle = (list: FileList | null) => {
    if (!list?.length) return;
    const incoming = Array.from(list);
    addFiles(group, slot.key, slot.multiple === false ? incoming.slice(0, 1) : incoming);
  };

  return (
    <section className="rounded-xl border border-border bg-card p-5 shadow-card">
      <div className="flex items-start gap-3">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-panel font-heading text-sm font-bold text-primary">
          {slot.index}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="font-heading text-[16px] font-bold">
            {slot.title}
            {slot.required && <span className="ml-1 text-destructive">*</span>}
          </h3>
          <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
            {slot.description}
          </p>
          <p className="mt-1 text-[12px] text-muted-foreground">
            Accepted formats: {slot.formats}
          </p>
        </div>
        {files.length > 0 && (
          <span className="flex items-center gap-1.5 rounded-full bg-success-soft px-2.5 py-1 text-[12px] font-semibold text-success">
            <CheckCircle2 className="size-3.5" />
            {files.length} uploaded
          </span>
        )}
      </div>

      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          handle(event.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") inputRef.current?.click();
        }}
        className={[
          "mt-4 cursor-pointer rounded-xl border-2 border-dashed px-5 py-8 text-center transition-colors",
          dragging ? "border-primary bg-panel" : "border-input bg-secondary/40 hover:border-primary/60",
        ].join(" ")}
      >
        <UploadCloud className="mx-auto size-7 text-primary" />
        <p className="mt-2 text-sm font-semibold text-navy">
          Drag and drop files here or click to browse
        </p>
        <p className="mt-1 text-[12px] text-muted-foreground">
          {slot.multiple === false ? "One file" : "Multiple files allowed"} · {slot.formats}
        </p>
        <input
          ref={inputRef}
          type="file"
          accept={slot.accept}
          multiple={slot.multiple !== false}
          className="hidden"
          onChange={(event) => {
            handle(event.target.files);
            event.target.value = "";
          }}
        />
      </div>

      {files.length > 0 && (
        <ul className="mt-4 space-y-2">
          {files.map((file) => (
            <li
              key={file.id}
              className="flex items-center gap-3 rounded-lg border border-border bg-secondary/40 px-3 py-2.5"
            >
              <FileText className="size-4 shrink-0 text-primary" />
              <span className="min-w-0 flex-1 truncate text-sm text-navy">{file.name}</span>
              <span className="hidden text-[12px] text-muted-foreground sm:block">
                {(file.size / 1024).toFixed(0)} KB
              </span>
              <button
                type="button"
                onClick={() => removeFile(group, slot.key, file.id)}
                className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                aria-label={`Remove ${file.name}`}
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
