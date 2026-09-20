/**
 * Editable user-interface layer.
 *
 * Developers can override the *presentation* of user-facing content — wording,
 * font size, weight, alignment — and the order of repeatable blocks, without
 * touching workflow logic, field IDs, conditions, prompts or data mappings.
 *
 * Overrides are keyed by a stable slug derived from the shipped default text
 * (or an explicit key), so nothing in the underlying application state,
 * questionnaire IDs or downstream processing changes when text is edited.
 *
 * PROTOTYPE: overrides live in localStorage. Phase 2 swaps `persist()` for a
 * server function; the context API stays identical.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ElementType,
  type ReactNode,
} from "react";

export type UiOverride = {
  text?: string | undefined;
  fontSize?: string | undefined;
  fontWeight?: string | undefined;
  align?: "left" | "center" | "right" | undefined;
};

export type UiContentMap = Record<string, UiOverride>;
export type UiOrderMap = Record<string, string[]>;

/**
 * Presentation-only layout overrides for a visible component. Keys are
 * `${scope}|${cssPath}` where scope is "user" or "developer", so layout work in
 * one interface never touches the other.
 */
export type UiLayoutOverride = {
  width?: string | undefined;
  height?: string | undefined;
  minWidth?: string | undefined;
  maxWidth?: string | undefined;
  minHeight?: string | undefined;
  maxHeight?: string | undefined;
  padding?: string | undefined;
  margin?: string | undefined;
  columnGap?: string | undefined;
  rowGap?: string | undefined;
  whiteSpace?: string | undefined;
  textAlign?: string | undefined;
  verticalAlign?: string | undefined;
};

export type UiLayoutMap = Record<string, UiLayoutOverride>;
/** Wording overrides for any text on the page selected directly in the browser. */
export type UiPathTextMap = Record<string, string>;
export type UiEditMode = "text" | "layout";

export const LAYOUT_FIELDS = [
  { key: "width", label: "Width", placeholder: "e.g. 320px or 60%" },
  { key: "height", label: "Height", placeholder: "e.g. 240px or auto" },
  { key: "minWidth", label: "Min width", placeholder: "e.g. 200px" },
  { key: "maxWidth", label: "Max width", placeholder: "e.g. 800px" },
  { key: "minHeight", label: "Min height", placeholder: "e.g. 40px" },
  { key: "maxHeight", label: "Max height", placeholder: "e.g. 400px" },
  { key: "padding", label: "Internal padding", placeholder: "e.g. 12px or 8px 16px" },
  { key: "margin", label: "Margin", placeholder: "e.g. 0 0 16px" },
  { key: "columnGap", label: "Horizontal gap", placeholder: "e.g. 12px" },
  { key: "rowGap", label: "Vertical gap", placeholder: "e.g. 12px" },
] as const satisfies readonly { key: keyof UiLayoutOverride; label: string; placeholder: string }[];

export type UiRegistryEntry = { key: string; defaultText: string; group: string };

const STORAGE_KEY = "ifc-ui-content-v1";
const SESSION_KEY = "ifc-ui-edit-session-v1";

export const FONT_SIZES = [
  { value: "", label: "Default" },
  { value: "12px", label: "12 px" },
  { value: "13px", label: "13 px" },
  { value: "15px", label: "15 px" },
  { value: "17px", label: "17 px" },
  { value: "20px", label: "20 px" },
  { value: "24px", label: "24 px" },
  { value: "30px", label: "30 px" },
  { value: "36px", label: "36 px" },
] as const;

export const FONT_WEIGHTS = [
  { value: "", label: "Default" },
  { value: "400", label: "Regular" },
  { value: "500", label: "Medium" },
  { value: "600", label: "Semibold" },
  { value: "700", label: "Bold" },
  { value: "800", label: "Extra bold" },
] as const;

export const ALIGNMENTS = [
  { value: "", label: "Default" },
  { value: "left", label: "Left" },
  { value: "center", label: "Center" },
  { value: "right", label: "Right" },
] as const;

/** Stable key derived from the shipped default text. */
export function uiKeyFor(defaultText: string, explicitKey?: string) {
  if (explicitKey) return explicitKey;
  return defaultText
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

type Ctx = {
  /** Saved overrides applied to every user-facing page. */
  content: UiContentMap;
  order: UiOrderMap;
  /** Unsaved edits, shown live while edit mode is on. */
  draft: UiContentMap;
  draftOrder: UiOrderMap;
  editing: boolean;
  dirty: boolean;
  selectedKey: string | null;
  registry: UiRegistryEntry[];
  /** Active layout overrides (draft while editing). */
  layout: UiLayoutMap;
  editMode: UiEditMode;
  setEditMode: (mode: UiEditMode) => void;
  selectedPath: string | null;
  selectPath: (path: string | null) => void;
  setLayoutOverride: (path: string, patch: UiLayoutOverride) => void;
  resetLayout: (path: string) => void;
  startEditing: () => void;
  cancelEditing: () => void;
  saveEditing: () => void;
  select: (key: string | null) => void;
  setDraftOverride: (key: string, patch: UiOverride) => void;
  resetOverride: (key: string) => void;
  moveInOrder: (listKey: string, ids: string[], id: string, direction: "up" | "down") => void;
  register: (entry: UiRegistryEntry) => void;
  resolve: (key: string, defaultText: string) => { text: string; override: UiOverride };
};

const globalScope = globalThis as typeof globalThis & {
  __uiContentContext?: ReturnType<typeof createContext<Ctx | null>>;
};
const UiContext = (globalScope.__uiContentContext ??= createContext<Ctx | null>(null));

export function UiContentProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<UiContentMap>({});
  const [order, setOrder] = useState<UiOrderMap>({});
  const [draft, setDraft] = useState<UiContentMap>({});
  const [draftOrder, setDraftOrder] = useState<UiOrderMap>({});
  const [editing, setEditing] = useState(false);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [registry, setRegistry] = useState<UiRegistryEntry[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [layout, setLayout] = useState<UiLayoutMap>({});
  const [draftLayout, setDraftLayout] = useState<UiLayoutMap>({});
  const [editMode, setEditMode] = useState<UiEditMode>("text");
  const [selectedPath, setSelectedPath] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as {
          content?: UiContentMap;
          order?: UiOrderMap;
          layout?: UiLayoutMap;
        };
        setContent(saved.content ?? {});
        setOrder(saved.order ?? {});
        setLayout(saved.layout ?? {});
      }
    } catch {
      /* ignore corrupt local state */
    }
    // Edit mode and unsaved edits survive page reloads within the same tab so
    // the developer can browse every user-facing page while editing.
    try {
      const rawSession = sessionStorage.getItem(SESSION_KEY);
      if (rawSession) {
        const session = JSON.parse(rawSession) as {
          editing?: boolean;
          draft?: UiContentMap;
          draftOrder?: UiOrderMap;
          draftLayout?: UiLayoutMap;
          editMode?: UiEditMode;
        };
        if (session.editing) {
          setEditing(true);
          setDraft(session.draft ?? {});
          setDraftOrder(session.draftOrder ?? {});
          setDraftLayout(session.draftLayout ?? {});
          setEditMode(session.editMode === "layout" ? "layout" : "text");
        }
      }
    } catch {
      /* ignore corrupt session state */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ content, order, layout }));
      sessionStorage.setItem(
        SESSION_KEY,
        JSON.stringify({ editing, draft, draftOrder, draftLayout, editMode }),
      );
    } catch {
      /* storage unavailable */
    }
  }, [content, order, layout, editing, draft, draftOrder, draftLayout, editMode, hydrated]);

  const register = useCallback((entry: UiRegistryEntry) => {
    setRegistry((prev) =>
      prev.some((item) => item.key === entry.key) ? prev : [...prev, entry],
    );
  }, []);

  const value = useMemo<Ctx>(() => {
    const active = editing ? draft : content;
    const activeOrder = editing ? draftOrder : order;
    return {
      content,
      order: activeOrder,
      draft,
      draftOrder,
      editing,
      dirty:
        JSON.stringify(draft) !== JSON.stringify(content) ||
        JSON.stringify(draftOrder) !== JSON.stringify(order) ||
        JSON.stringify(draftLayout) !== JSON.stringify(layout),
      selectedKey,
      registry,
      layout: editing ? draftLayout : layout,
      editMode,
      setEditMode: (mode) => {
        setEditMode(mode);
        setSelectedKey(null);
        setSelectedPath(null);
      },
      selectedPath,
      selectPath: (path) => setSelectedPath(path),
      setLayoutOverride: (path, patch) =>
        setDraftLayout((prev) => {
          const next = { ...prev, [path]: { ...prev[path], ...patch } };
          const entry = next[path] as UiLayoutOverride;
          if (Object.values(entry).every((item) => !item)) delete next[path];
          return next;
        }),
      resetLayout: (path) =>
        setDraftLayout((prev) => {
          const next = { ...prev };
          delete next[path];
          return next;
        }),
      startEditing: () => {
        setDraft(content);
        setDraftOrder(order);
        setDraftLayout(layout);
        setSelectedKey(null);
        setSelectedPath(null);
        setEditing(true);
      },
      cancelEditing: () => {
        setDraft(content);
        setDraftOrder(order);
        setDraftLayout(layout);
        setSelectedKey(null);
        setSelectedPath(null);
        setEditing(false);
      },
      saveEditing: () => {
        setContent(draft);
        setOrder(draftOrder);
        setLayout(draftLayout);
        setSelectedKey(null);
        setSelectedPath(null);
        setEditing(false);
      },
      select: (key) => setSelectedKey(key),
      setDraftOverride: (key, patch) =>
        setDraft((prev) => ({ ...prev, [key]: { ...prev[key], ...patch } })),
      resetOverride: (key) =>
        setDraft((prev) => {
          const next = { ...prev };
          delete next[key];
          return next;
        }),
      moveInOrder: (listKey, ids, id, direction) =>
        setDraftOrder((prev) => {
          const current = (prev[listKey] ?? ids).filter((item) => ids.includes(item));
          const missing = ids.filter((item) => !current.includes(item));
          const list = [...current, ...missing];
          const index = list.indexOf(id);
          const target = direction === "up" ? index - 1 : index + 1;
          if (index < 0 || target < 0 || target >= list.length) return prev;
          const swapped = [...list];
          const a = swapped[index] as string;
          const b = swapped[target] as string;
          swapped[index] = b;
          swapped[target] = a;
          return { ...prev, [listKey]: swapped };
        }),
      register,
      resolve: (key, defaultText) => {
        const override = active[key] ?? {};
        return { text: override.text?.trim() ? override.text : defaultText, override };
      },
    };
  }, [
    content,
    order,
    layout,
    draft,
    draftOrder,
    draftLayout,
    editing,
    editMode,
    selectedKey,
    selectedPath,
    registry,
    register,
  ]);

  return <UiContext.Provider value={value}>{children}</UiContext.Provider>;
}

export function useUiContent() {
  const ctx = useContext(UiContext);
  if (!ctx) throw new Error("useUiContent must be used inside UiContentProvider");
  return ctx;
}

/** Optional access for components that may render outside the provider. */
export function useUiContentSafe() {
  return useContext(UiContext);
}

export function styleFor(override: UiOverride) {
  return {
    ...(override.fontSize ? { fontSize: override.fontSize } : {}),
    ...(override.fontWeight ? { fontWeight: override.fontWeight } : {}),
    ...(override.align ? { textAlign: override.align } : {}),
  } as const;
}

/** Resolved text for places that need a plain string (placeholders, aria labels). */
export function useUiString(defaultText: string, options?: { key?: string; group?: string }) {
  const ctx = useUiContentSafe();
  const key = uiKeyFor(defaultText, options?.key);
  useEffect(() => {
    ctx?.register({ key, defaultText, group: options?.group ?? "General" });
  }, [ctx, key, defaultText, options?.group]);
  if (!ctx) return defaultText;
  return ctx.resolve(key, defaultText).text;
}

/**
 * Renders a piece of user-facing text. In Edit User Interface mode the element
 * becomes clickable and opens the editor panel; outside edit mode it renders
 * exactly like plain text with any saved wording/formatting applied.
 */
export function EditableText({
  as: Tag = "span",
  children,
  className,
  uiKey,
  group = "General",
}: {
  as?: ElementType;
  children: string;
  className?: string;
  uiKey?: string;
  group?: string;
}) {
  const ctx = useUiContentSafe();
  const key = uiKeyFor(children, uiKey);

  useEffect(() => {
    ctx?.register({ key, defaultText: children, group });
  }, [ctx, key, children, group]);

  if (!ctx) return <Tag className={className}>{children}</Tag>;

  const { text, override } = ctx.resolve(key, children);
  const textMode = ctx.editing && ctx.editMode === "text";
  const selected = textMode && ctx.selectedKey === key;

  return (
    <Tag
      className={[
        className,
        textMode
          ? "cursor-pointer rounded outline-dashed outline-1 outline-offset-2 outline-primary/40 hover:outline-primary"
          : "",
        selected ? "outline-2 outline-primary bg-panel/60" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={styleFor(override)}
      {...(textMode
        ? {
            onClick: (event: React.MouseEvent) => {
              event.preventDefault();
              event.stopPropagation();
              ctx.select(key);
            },
            role: "button",
            "data-ui-key": key,
          }
        : {})}
    >
      {text}
    </Tag>
  );
}

/** Applies the developer's saved order to a list of block ids on a page. */
export function useUiOrder(listKey: string, ids: string[]) {
  const ctx = useUiContentSafe();
  if (!ctx) return ids;
  const saved = ctx.order[listKey];
  if (!saved) return ids;
  const ordered = saved.filter((id) => ids.includes(id));
  return [...ordered, ...ids.filter((id) => !ordered.includes(id))];
}
