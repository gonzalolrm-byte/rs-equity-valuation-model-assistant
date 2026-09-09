/**
 * Front-end application state.
 *
 * PROTOTYPE: state lives in React context and is mirrored to localStorage so a
 * user can "save and return later" within the same browser. Phase 2 swaps the
 * persistence calls for server functions; the context API stays identical.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  INITIAL_PROMPTS,
  INITIAL_RESOURCES,
  type DeveloperResource,
  type PromptAction,
} from "./data";
import type { ExecutionLog } from "./services/claudeService";
import type { GeneratedModel } from "./services/excelService";

export type UploadedFile = { id: string; name: string; size: number; addedAt: string };

export type FileSlots = Record<string, UploadedFile[]>;

/**
 * Operational driver measurement units for one segment. Maximum Output and
 * Units Sold always share a single unit, so only one output value is stored.
 * `*Other` holds the manual entry used when "Other Measurement" is selected.
 */
export type SegmentMeasurement = {
  description: string;
  capacity: string;
  capacityOther: string;
  output: string;
  outputOther: string;
  capacityBasis: "" | "revenue_stream" | "aggregate";
};

export type WorkingCapitalDays = {
  basis: string;
  manualDays: string;
};

export type Answers = {
  companyName: string;
  sector: string;
  businessModel: string;
  mainCountry: string;
  mainCountryCurrency: string;
  secondCountry: string;
  secondCountryCurrency: string;
  thirdCountry: string;
  thirdCountryCurrency: string;
  hasForeignCurrency: "" | "yes" | "no";
  reportingCurrency: string;
  segmentBasis: "" | "business_line" | "revenue_stream";
  selectedSegments: string[];
  /** Per-segment operational driver measurement units, keyed by segment id. */
  segmentMeasurements: Record<string, SegmentMeasurement>;
  cogsBasis: "" | "segmented" | "aggregate";
  capexBasis: "" | "segmented" | "aggregate";
  otherDirectCosts: string[];
  projectionYears: "" | "5" | "10" | "custom";
  customYears: string;
  compsCount: string;
  shareClasses: "" | "common" | "preferred" | "both";
  preferredShareRights: string;
  liquidityPut: "" | "yes" | "no";
  putMechanisms: string[];
  workingCapitalDays: Record<string, WorkingCapitalDays>;
};

export const EMPTY_ANSWERS: Answers = {
  companyName: "",
  sector: "",
  businessModel: "",
  mainCountry: "",
  mainCountryCurrency: "",
  secondCountry: "",
  secondCountryCurrency: "",
  thirdCountry: "",
  thirdCountryCurrency: "",
  hasForeignCurrency: "",
  reportingCurrency: "",
  segmentBasis: "",
  selectedSegments: [],
  segmentMeasurements: {},
  cogsBasis: "",
  capexBasis: "",
  otherDirectCosts: [],
  projectionYears: "",
  customYears: "",
  compsCount: "",
  shareClasses: "",
  preferredShareRights: "",
  liquidityPut: "",
  putMechanisms: [],
  workingCapitalDays: {},
};

export type AppState = {
  workflow: "" | "new" | "update";
  answers: Answers;
  newFiles: FileSlots;
  updateFiles: FileSlots;
  selectedActions: string[];
  savedAt: string | null;
  generated: GeneratedModel | null;
  updated: GeneratedModel | null;
  log: ExecutionLog | null;
  prompts: PromptAction[];
  resources: DeveloperResource[];
};

const INITIAL_STATE: AppState = {
  workflow: "",
  answers: EMPTY_ANSWERS,
  newFiles: {},
  updateFiles: {},
  selectedActions: [],
  savedAt: null,
  generated: null,
  updated: null,
  log: null,
  prompts: INITIAL_PROMPTS,
  resources: INITIAL_RESOURCES,
};

const STORAGE_KEY = "ifc-valuation-assistant-v1";

type Ctx = {
  state: AppState;
  patch: (partial: Partial<AppState>) => void;
  setAnswer: <K extends keyof Answers>(key: K, value: Answers[K]) => void;
  toggleAnswerItem: (key: "otherDirectCosts" | "putMechanisms" | "selectedSegments", value: string) => void;
  addFiles: (slotGroup: "newFiles" | "updateFiles", slot: string, files: File[]) => void;
  removeFile: (slotGroup: "newFiles" | "updateFiles", slot: string, id: string) => void;
  toggleAction: (actionId: string) => void;
  savePrompt: (prompt: PromptAction) => void;
  addPrompt: (prompt: PromptAction) => void;
  togglePromptStatus: (id: string) => void;
  replaceResourceFiles: (id: string, files: File[]) => void;
  removeResourceFile: (id: string, fileName: string) => void;
  saveProgress: () => void;
  reset: () => void;
};

const AppContext = createContext<Ctx | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(INITIAL_STATE);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as Partial<AppState>;
        setState({
          ...INITIAL_STATE,
          ...saved,
          // merge answers field-by-field so saved state from an older question
          // set never leaves newly added fields undefined
          answers: { ...EMPTY_ANSWERS, ...(saved.answers ?? {}) },
        });
      }
    } catch {
      /* ignore corrupt local state */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* storage unavailable */
    }
  }, [state, hydrated]);

  const patch = useCallback((partial: Partial<AppState>) => {
    setState((prev) => ({ ...prev, ...partial }));
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      state,
      patch,
      setAnswer: (key, val) =>
        setState((prev) => ({ ...prev, answers: { ...prev.answers, [key]: val } })),
      toggleAnswerItem: (key, val) =>
        setState((prev) => {
          const current = prev.answers[key];
          const next = current.includes(val)
            ? current.filter((item) => item !== val)
            : [...current, val];
          return { ...prev, answers: { ...prev.answers, [key]: next } };
        }),
      addFiles: (group, slot, files) =>
        setState((prev) => ({
          ...prev,
          [group]: {
            ...prev[group],
            [slot]: [
              ...(prev[group][slot] ?? []),
              ...files.map((file) => ({
                id: `${file.name}-${file.size}-${Math.random().toString(36).slice(2, 8)}`,
                name: file.name,
                size: file.size,
                addedAt: new Date().toISOString(),
              })),
            ],
          },
        })),
      removeFile: (group, slot, id) =>
        setState((prev) => ({
          ...prev,
          [group]: {
            ...prev[group],
            [slot]: (prev[group][slot] ?? []).filter((file) => file.id !== id),
          },
        })),
      toggleAction: (actionId) =>
        setState((prev) => ({
          ...prev,
          selectedActions: prev.selectedActions.includes(actionId)
            ? prev.selectedActions.filter((item) => item !== actionId)
            : [...prev.selectedActions, actionId],
        })),
      savePrompt: (prompt) =>
        setState((prev) => ({
          ...prev,
          prompts: prev.prompts.map((item) =>
            item.id === prompt.id
              ? { ...prompt, lastUpdated: new Date().toISOString().slice(0, 10) }
              : item,
          ),
        })),
      addPrompt: (prompt) =>
        setState((prev) => ({ ...prev, prompts: [...prev.prompts, prompt] })),
      togglePromptStatus: (id) =>
        setState((prev) => ({
          ...prev,
          prompts: prev.prompts.map((item) =>
            item.id === id
              ? {
                  ...item,
                  status: item.status === "Active" ? "Inactive" : "Active",
                  lastUpdated: new Date().toISOString().slice(0, 10),
                }
              : item,
          ),
        })),
      replaceResourceFiles: (id, files) =>
        setState((prev) => ({
          ...prev,
          resources: prev.resources.map((resource) =>
            resource.id === id
              ? {
                  ...resource,
                  files: [...resource.files, ...files.map((file) => file.name)],
                  lastUpdated: new Date().toISOString().slice(0, 10),
                }
              : resource,
          ),
        })),
      removeResourceFile: (id, fileName) =>
        setState((prev) => ({
          ...prev,
          resources: prev.resources.map((resource) =>
            resource.id === id
              ? { ...resource, files: resource.files.filter((file) => file !== fileName) }
              : resource,
          ),
        })),
      saveProgress: () => setState((prev) => ({ ...prev, savedAt: new Date().toISOString() })),
      reset: () =>
        setState((prev) => ({
          ...INITIAL_STATE,
          prompts: prev.prompts,
          resources: prev.resources,
        })),
    }),
    [state, patch],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppStateProvider");
  return ctx;
}

export function fileCount(slots: FileSlots, slot: string) {
  return slots[slot]?.length ?? 0;
}
