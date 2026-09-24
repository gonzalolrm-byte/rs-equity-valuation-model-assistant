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
  type ResourceKind,

  type SectorSpecifics,
  type SubsectorMeasurementSetting,
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
  subsector: string;
  subsector2: string;
  subsector3: string;
  businessModel: string;
  mainCountry: string;
  mainCountryCurrency: string;
  secondCountry: string;
  secondCountryCurrency: string;
  thirdCountry: string;
  thirdCountryCurrency: string;
  countryCount: "" | "1" | "2" | "3" | "more";
  hasForeignCurrency: "" | "yes" | "no";
  reportingCurrency: string;
  segmentBasis: "" | "business_line" | "revenue_stream";
  businessLineModeling: "" | "consolidated" | "sotp";
  /** Selected business lines (segment ids). */
  selectedSegments: string[];
  /** Revenue streams selected within each business line, keyed by segment id. */
  revenueStreams: Record<string, string[]>;
  /** Whether each business line is modeled with a single revenue stream or multiple, keyed by segment id. */
  lineStreamMode: Record<string, "single" | "multi">;
  /** Per-segment operational driver measurement units, keyed by segment id. */
  segmentMeasurements: Record<string, SegmentMeasurement>;
  /** Modeling basis for each sub-sector, keyed by segment id. */
  lineModelBasis: Record<string, "unit_economics" | "percentage">;
  /** COGS segmentation basis per selected business line, keyed by segment id. */
  cogsBasis: Record<string, "" | "business_line" | "revenue_stream">;
  /** CapEx segmentation basis per selected business line, keyed by segment id. */
  capexBasis: Record<string, "" | "business_line" | "revenue_stream">;
  otherDirectCosts: string[];
  projectionYears: "" | "5" | "10" | "custom";
  customYears: string;
  compsCount: string;
  shareClasses: "" | "common" | "preferred" | "both";
  preferredShareRights: string;
  liquidityPut: "" | "yes" | "no";
  putMechanisms: string[];
  workingCapitalDays: Record<string, WorkingCapitalDays>;
  /** Per-business-line projection horizon (SOTP only), keyed by segment id. */
  projectionYearsByLine: Record<string, string>;
  /** Per-business-line custom projection years (SOTP only), keyed by segment id. */
  customYearsByLine: Record<string, string>;
  /** Per-business-line working capital days: segment id -> line item -> days config. */
  workingCapitalDaysByLine: Record<string, Record<string, WorkingCapitalDays>>;
  /** Per-business-line comparable company counts, keyed by segment id. */
  compsCountByLine: Record<string, string>;
  /** Per-business-line valuation method (SOTP only). Business Line 1 is always DCF. */
  lineValuationMethod: Record<string, "dcf" | "comps">;
  /** Per-business-line country count (SOTP only), keyed by segment id. */
  lineCountryCount: Record<string, "" | "1" | "2" | "3" | "more">;
  /** Per-business-line countries of operation (SOTP only), keyed by segment id (up to 3). */
  lineCountries: Record<string, { country: string; currency: string }[]>;
};

export const EMPTY_ANSWERS: Answers = {
  companyName: "",
  sector: "",
  subsector: "",
  subsector2: "",
  subsector3: "",
  businessModel: "",
  mainCountry: "",
  mainCountryCurrency: "",
  secondCountry: "",
  secondCountryCurrency: "",
  thirdCountry: "",
  thirdCountryCurrency: "",
  countryCount: "",
  hasForeignCurrency: "",
  reportingCurrency: "",
  segmentBasis: "business_line",
  businessLineModeling: "",
  selectedSegments: ["segment1"],
  revenueStreams: { segment1: ["stream1"] },
  lineStreamMode: { segment1: "multi" },
  segmentMeasurements: {},
  lineModelBasis: {},
  cogsBasis: {},
  capexBasis: {},
  otherDirectCosts: [],
  projectionYears: "",
  customYears: "",
  compsCount: "",
  shareClasses: "",
  preferredShareRights: "",
  liquidityPut: "",
  putMechanisms: [],
  workingCapitalDays: {},
  projectionYearsByLine: {},
  customYearsByLine: {},
  workingCapitalDaysByLine: {},
  compsCountByLine: {},
  lineValuationMethod: { segment1: "dcf" },
  lineCountryCount: {},
  lineCountries: {},
};

export type NavigationMode = "required" | "free";

/**
 * A default subsector template derived from a generic DCF template.
 * PROTOTYPE: no workbook is produced; this records the developer's instructions
 * so the future generation service can act on them.
 */
export type SubsectorDefaultTemplate = {
  fileName: string;
  baseTemplate: string;
  prompt: string;
  generatedAt: string;
  outputMeasurement: string;
  capacityMeasurements: string[];
  /** Automatic summary of the developer settings used for this generation. */
  specificationSummary?: string;
  /** Prompts (by ID) attached to this template. A-001 is pre-selected but optional. */
  extraPromptIds?: string[];
  /** The generated file body, kept so the developer can open or download it later. */
  content?: string;
};

/**
 * Developer defaults for the user's Section A/B sub-sector card. Each value is
 * pre-selected for users; the matching `*Locked` flag prevents users changing it.
 * Presentation defaults only — no question IDs, mappings or logic change.
 */
export type SubsectorConfigDefaults = {
  modelBasis: "unit_economics" | "percentage";
  modelBasisLocked: boolean;
  streamMode: "single" | "multi";
  streamModeLocked: boolean;
  streams: string[];
  streamsLocked: boolean;
  unitEconomicsApproach: "v1" | "v2" | "v3" | "v4";
  unitEconomicsApproachLocked: boolean;
  cogsBasis: "business_line" | "revenue_stream";
  capexBasis: "business_line" | "revenue_stream";
  cogsCapexLocked: boolean;
  unitsLocked: boolean;
};

export const DEFAULT_SUBSECTOR_CONFIG: SubsectorConfigDefaults = {
  modelBasis: "unit_economics",
  modelBasisLocked: false,
  streamMode: "single",
  streamModeLocked: false,
  streams: ["stream1"],
  streamsLocked: false,
  unitEconomicsApproach: "v1",
  unitEconomicsApproachLocked: false,
  cogsBasis: "business_line",
  capexBasis: "business_line",
  cogsCapexLocked: false,
  unitsLocked: false,
};




export type AppState = {
  workflow: "" | "new" | "update" | "developer" | "user" | "validator";
  /** Developer setting: "required" enforces field validation, "free" unlocks navigation for demos. */
  navigationMode: NavigationMode;
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
  /** Developer overrides of the default measurement units per subsector template. */
  sectorSpecifics: SectorSpecifics;
  /** Uploaded template file names per subsector template (prototype: names only). */
  subsectorTemplates: Record<string, string[]>;
  /** Uploaded file names per generic DCF template (prototype: names only). */
  genericTemplateFiles: Record<string, string[]>;
  /** Generic DCF templates removed by the developer. */
  removedGenericTemplates: string[];
  /**
   * Default templates generated per subsector from a generic template plus a
   * developer prompt. Prototype: metadata only, no workbook is produced.
   */
  subsectorDefaultTemplates: Record<string, SubsectorDefaultTemplate>;
  /** Developer defaults + locks for the user's Section A/B card, per subsector. */
  subsectorConfigs: Record<string, SubsectorConfigDefaults>;

  /** Developer-added subsector templates per sector. */
  customSubsectors: Record<string, string[]>;
  /** Shipped subsector templates hidden by the developer, per sector. */
  removedSubsectors: Record<string, string[]>;
  /**
   * Titles of registry (shipped) prompts the developer deleted, so hydration does
   * not resurrect them. Titles are used because IDs get renumbered on delete.
   */
  deletedRegistryPromptIds: string[];
};


const INITIAL_STATE: AppState = {
  workflow: "",
  navigationMode: "required",
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
  sectorSpecifics: {},
  subsectorTemplates: {},
  genericTemplateFiles: {},
  removedGenericTemplates: [],
  subsectorDefaultTemplates: {},
  subsectorConfigs: {},

  customSubsectors: {},
  removedSubsectors: {},
  deletedRegistryPromptIds: [],

};


const STORAGE_KEY = "ifc-valuation-assistant-v1";

const UNIT_ECONOMICS_TEMPLATE = "Generic - Unit Economics";
const PERCENTAGE_BASED_TEMPLATE = "Generic - Percentage Based";

function migrateGenericTemplateName(value: string) {
  return value
    .replace(/\s*Keep all formulas, tabs and links intact\./gi, "");
}

/** Only warn once per session when browser storage is full. */
let storageWarned = false;

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
  deletePrompt: (id: string) => void;
  movePrompt: (id: string, direction: "up" | "down") => void;
  replaceResourceFiles: (id: string, files: File[]) => void;
  removeResourceFile: (id: string, fileName: string) => void;
  addResource: (resource: { name: string; description: string; kind: ResourceKind }) => void;
  deleteResource: (id: string) => void;
  setGenericTemplateFiles: (id: string, files: File[]) => void;
  removeGenericTemplateFile: (id: string, fileName: string) => void;
  removeGenericTemplate: (id: string) => void;

  setSubsectorMeasurements: (subsector: string, setting: SubsectorMeasurementSetting) => void;
  resetSubsectorMeasurements: (subsector: string) => void;
  addSubsectorTemplateFiles: (subsector: string, files: File[]) => void;
  removeSubsectorTemplateFile: (subsector: string, fileName: string) => void;
  generateSubsectorDefaultTemplate: (
    subsector: string,
    input: {
      baseTemplate: string;
      prompt: string;
      outputMeasurement: string;
      capacityMeasurements: string[];
      extraPromptIds?: string[];
      specificationSummary?: string;
    },
  ) => void;
  clearSubsectorDefaultTemplate: (subsector: string) => void;
  setSubsectorConfig: (subsector: string, patch: Partial<SubsectorConfigDefaults>) => void;
  resetSubsectorConfig: (subsector: string) => void;

  addCustomSubsector: (sector: string, name: string) => void;
  deleteSubsector: (sector: string, name: string) => void;

  saveProgress: () => void;
  reset: () => void;
};

/**
 * Kept on globalThis so a hot-reloaded second copy of this module still shares
 * the same context object as the provider mounted by the root route; otherwise
 * consumers read a fresh, empty context and throw during dev updates.
 */
const globalScope = globalThis as typeof globalThis & {
  __appStateContext?: ReturnType<typeof createContext<Ctx | null>>;
};
const AppContext = (globalScope.__appStateContext ??= createContext<Ctx | null>(null));


export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(INITIAL_STATE);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as Partial<AppState>;
        // Reconcile the action registry: keep developer edits for actions that
        // still exist, adopt any newly shipped actions, and drop actions that
        // were removed from the registry (while keeping developer-created ones).
        const savedPrompts = (saved.prompts ?? []).map((prompt) => ({
          ...prompt,
          promptText: migrateGenericTemplateName(prompt.promptText),
        }));
        const deletedRegistry = new Set(saved.deletedRegistryPromptIds ?? []);
        // The developer's saved list is the source of truth (edits, new actions,
        // deletions and renumbering). Only adopt newly shipped registry actions
        // that are not already present and were not deleted.
        const savedTitles = new Set(savedPrompts.map((item) => item.title));
        const savedIds = new Set(savedPrompts.map((item) => item.id));
        const prompts: PromptAction[] = saved.prompts
          ? [
              ...savedPrompts,
              ...INITIAL_PROMPTS.filter(
                (prompt) =>
                  !deletedRegistry.has(prompt.title) &&
                  !savedTitles.has(prompt.title) &&
                  !savedIds.has(prompt.id),
              ),
            ]
          : INITIAL_PROMPTS;
        // Reconcile the developer resource registry: keep uploaded files for
        // resources that still exist, adopt newly shipped resources, drop
        // resources removed from the registry, and keep developer-created ones.
        const savedResources = saved.resources ?? [];
        const resourceRegistryIds = new Set(INITIAL_RESOURCES.map((item) => item.id));
        const resources: DeveloperResource[] = [
          ...INITIAL_RESOURCES.map((resource) => {
            const savedResource = savedResources.find((item) => item.id === resource.id);
            return savedResource ? { ...resource, files: savedResource.files } : resource;
          }),
          ...savedResources.filter(
            (item) => !resourceRegistryIds.has(item.id) && item.custom === true,
          ),
        ];

        const savedGenericFiles = saved.genericTemplateFiles ?? {};
        const consolidatedFiles = savedGenericFiles["generic-consolidated-dcf"] ?? [];
        const genericTemplateFiles = {
          "generic-unit-economics": [
            ...new Set([...(savedGenericFiles["generic-unit-economics"] ?? []), ...consolidatedFiles]),
          ],
          "generic-percentage-based": [
            ...new Set([...(savedGenericFiles["generic-percentage-based"] ?? []), ...consolidatedFiles]),
          ],
        };
        const subsectorDefaultTemplates = Object.fromEntries(
          Object.entries(saved.subsectorDefaultTemplates ?? {}).map(([subsector, template]) => [
            subsector,
            {
              ...template,
              baseTemplate:
                template.baseTemplate === "Generic - Consolidated DCF"
                  ? (saved.subsectorConfigs?.[subsector]?.modelBasis === "percentage"
                      ? PERCENTAGE_BASED_TEMPLATE
                      : UNIT_ECONOMICS_TEMPLATE)
                  : template.baseTemplate,
              prompt: migrateGenericTemplateName(template.prompt),
              ...(template.content
                ? { content: migrateGenericTemplateName(template.content) }
                : {}),
            },
          ]),
        );

        setState({
          ...INITIAL_STATE,
          ...saved,
          prompts,
          resources,
          deletedRegistryPromptIds: [...deletedRegistry],
          subsectorDefaultTemplates,
          subsectorConfigs: saved.subsectorConfigs ?? {},
          genericTemplateFiles,
          removedGenericTemplates: saved.removedGenericTemplates ?? [],


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
      // Browser storage is full (usually because uploaded prompt files are
      // stored inline). Retry without the heavy file payloads so the rest of
      // the console settings still survive a refresh, and tell the user.
      try {
        const slim = {
          ...state,
          prompts: state.prompts.map((prompt) => {
            const { promptFileData: _dropped, ...rest } = prompt;
            return rest;
          }),
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(slim));
        if (typeof window !== "undefined" && !storageWarned) {
          storageWarned = true;
          window.alert(
            "Browser storage is full, so uploaded prompt files could not be kept. Your actions and settings were saved, but please remove some uploaded files.",
          );
        }
      } catch {
        if (typeof window !== "undefined" && !storageWarned) {
          storageWarned = true;
          window.alert(
            "Browser storage is full, so your latest changes could not be saved. Please remove some uploaded files and try again.",
          );
        }
      }
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
      deletePrompt: (id) =>
        setState((prev) => {
          const prefix = id.split("-")[0] ?? "";
          // Renumber the remaining actions in this workflow so the IDs stay a
          // gapless sequence (A-01, A-02, ...) after a deletion.
          const siblings = prev.prompts
            .filter((item) => item.id !== id && item.id.startsWith(`${prefix}-`))
            .sort((a, b) => a.id.localeCompare(b.id));
          const digits = Math.max(2, ...siblings.map((item) => (item.id.split("-")[1] ?? "").length));
          const renumbered = new Map(
            siblings.map((item, index) => [
              item.id,
              `${prefix}-${String(index + 1).padStart(digits, "0")}`,
            ]),
          );
          const remap = (value: string) => renumbered.get(value) ?? value;
          const deleted = prev.prompts.find((item) => item.id === id);
          // Registry actions are remembered by title: IDs get renumbered, so an
          // ID is not a stable identity for "this shipped action was deleted".
          const deletedTitle =
            deleted && INITIAL_PROMPTS.some((prompt) => prompt.title === deleted.title)
              ? deleted.title
              : null;
          const nextPrompts = prev.prompts
            .filter((item) => item.id !== id)
            .map((item) => ({ ...item, id: remap(item.id) }));
          return {
            ...prev,
            prompts: nextPrompts,
            selectedActions: prev.selectedActions.filter((item) => item !== id).map(remap),
            deletedRegistryPromptIds: [
              ...prev.deletedRegistryPromptIds,
              ...(deletedTitle ? [deletedTitle] : []),
            ].filter((value, index, all) => all.indexOf(value) === index),
          };

        }),
      movePrompt: (id, direction) =>
        setState((prev) => {
          const prefix = id.split("-")[0] ?? "";
          const siblings = prev.prompts
            .filter((item) => item.id.startsWith(`${prefix}-`))
            .slice()
            .sort((a, b) => a.id.localeCompare(b.id));
          const index = siblings.findIndex((item) => item.id === id);
          if (index < 0) return prev;
          const neighborIndex = direction === "up" ? index - 1 : index + 1;
          if (neighborIndex < 0 || neighborIndex >= siblings.length) return prev;
          const current = siblings[index];
          const neighbor = siblings[neighborIndex];
          if (!current || !neighbor) return prev;
          // Swap the IDs so the two actions trade places in the ID-ordered list.
          return {
            ...prev,
            prompts: prev.prompts.map((item) =>
              item.id === current.id
                ? { ...item, id: neighbor.id }
                : item.id === neighbor.id && item.step === neighbor.step
                  ? { ...item, id: current.id }
                  : item,
            ),
          };
        }),
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
      addResource: ({ name, description, kind }) =>
        setState((prev) => ({
          ...prev,
          resources: [
            ...prev.resources,
            {
              id: `res-custom-${Date.now()}`,
              name,
              description,
              kind,
              lastUpdated: new Date().toISOString().slice(0, 10),
              files: [],
              custom: true,
            },
          ],
        })),
      deleteResource: (id) =>
        setState((prev) => ({
          ...prev,
          resources: prev.resources.filter((resource) => resource.id !== id),
        })),
      setGenericTemplateFiles: (id, files) =>
        setState((prev) => ({
          ...prev,
          genericTemplateFiles: {
            ...prev.genericTemplateFiles,
            [id]: files.map((file) => file.name),
          },
        })),
      removeGenericTemplateFile: (id, fileName) =>
        setState((prev) => ({
          ...prev,
          genericTemplateFiles: {
            ...prev.genericTemplateFiles,
            [id]: (prev.genericTemplateFiles[id] ?? []).filter((file) => file !== fileName),
          },
        })),
      removeGenericTemplate: (id) =>
        setState((prev) => ({
          ...prev,
          removedGenericTemplates: (prev.removedGenericTemplates ?? []).includes(id)
            ? (prev.removedGenericTemplates ?? [])
            : [...(prev.removedGenericTemplates ?? []), id],
        })),

      setSubsectorMeasurements: (subsector, setting) =>
        setState((prev) => ({
          ...prev,
          sectorSpecifics: { ...prev.sectorSpecifics, [subsector]: setting },
        })),
      resetSubsectorMeasurements: (subsector) =>
        setState((prev) => {
          const next = { ...prev.sectorSpecifics };
          delete next[subsector];
          return { ...prev, sectorSpecifics: next };
        }),
      addSubsectorTemplateFiles: (subsector, files) =>
        setState((prev) => ({
          ...prev,
          subsectorTemplates: {
            ...prev.subsectorTemplates,
            [subsector]: [
              ...new Set([
                ...(prev.subsectorTemplates[subsector] ?? []),
                ...files.map((file) => file.name),
              ]),
            ],
          },
        })),
      removeSubsectorTemplateFile: (subsector, fileName) =>
        setState((prev) => ({
          ...prev,
          subsectorTemplates: {
            ...prev.subsectorTemplates,
            [subsector]: (prev.subsectorTemplates[subsector] ?? []).filter(
              (file) => file !== fileName,
            ),
          },
        })),
      generateSubsectorDefaultTemplate: (subsector, input) =>
        setState((prev) => {
          const generatedAt = new Date().toISOString();
          const slug = subsector.replace(/[^a-zA-Z0-9]+/g, "_").replace(/^_|_$/g, "");
          const prompt = migrateGenericTemplateName(input.prompt);
          const rows = [
            ["Default template (prototype)", subsector],
            ["Base generic template", input.baseTemplate],
            ["Generated at", generatedAt],
            ["Maximum Output / Units Sold measurement", input.outputMeasurement],
            ["Capacity measurements offered", input.capacityMeasurements.join("; ")],
            ["Additional prompts applied", (input.extraPromptIds ?? []).join("; ") || "none"],
            ["Developer specification summary", input.specificationSummary ?? ""],
            ["Adaptation prompt", prompt],
          ];
          const content = rows
            .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
            .join("\r\n");
          return {
            ...prev,
            subsectorDefaultTemplates: {
              ...(prev.subsectorDefaultTemplates ?? {}),
              [subsector]: {
                fileName: `Default_Template_${slug}.csv`,
                baseTemplate: input.baseTemplate,
                prompt,
                generatedAt,
                outputMeasurement: input.outputMeasurement,
                capacityMeasurements: input.capacityMeasurements,
                extraPromptIds: input.extraPromptIds ?? [],
                ...(input.specificationSummary
                  ? { specificationSummary: input.specificationSummary }
                  : {}),
                content,
              },
            },
          };
        }),
      clearSubsectorDefaultTemplate: (subsector) =>
        setState((prev) => {
          const next = { ...(prev.subsectorDefaultTemplates ?? {}) };
          delete next[subsector];
          return { ...prev, subsectorDefaultTemplates: next };
        }),
      setSubsectorConfig: (subsector, patch) =>
        setState((prev) => ({
          ...prev,
          subsectorConfigs: {
            ...(prev.subsectorConfigs ?? {}),
            [subsector]: {
              ...DEFAULT_SUBSECTOR_CONFIG,
              ...((prev.subsectorConfigs ?? {})[subsector] ?? {}),
              ...patch,
            },
          },
        })),
      resetSubsectorConfig: (subsector) =>
        setState((prev) => {
          const next = { ...(prev.subsectorConfigs ?? {}) };
          delete next[subsector];
          return { ...prev, subsectorConfigs: next };
        }),



      addCustomSubsector: (sector, name) =>
        setState((prev) => {
          const trimmed = name.trim();
          if (!trimmed) return prev;
          const existing = prev.customSubsectors[sector] ?? [];
          if (existing.includes(trimmed)) return prev;
          // Re-adding a shipped template simply un-hides it.
          const removed = (prev.removedSubsectors[sector] ?? []).filter((item) => item !== trimmed);
          return {
            ...prev,
            customSubsectors: { ...prev.customSubsectors, [sector]: [...existing, trimmed] },
            removedSubsectors: { ...prev.removedSubsectors, [sector]: removed },
          };
        }),
      deleteSubsector: (sector, name) =>
        setState((prev) => {
          const isCustom = (prev.customSubsectors[sector] ?? []).includes(name);
          const sectorSpecifics = { ...prev.sectorSpecifics };
          delete sectorSpecifics[name];
          const subsectorTemplates = { ...prev.subsectorTemplates };
          delete subsectorTemplates[name];
          const subsectorDefaultTemplates = { ...(prev.subsectorDefaultTemplates ?? {}) };
          delete subsectorDefaultTemplates[name];
          const subsectorConfigs = { ...(prev.subsectorConfigs ?? {}) };
          delete subsectorConfigs[name];
          return {
            ...prev,
            sectorSpecifics,
            subsectorTemplates,
            subsectorDefaultTemplates,
            subsectorConfigs,

            customSubsectors: isCustom
              ? {
                  ...prev.customSubsectors,
                  [sector]: (prev.customSubsectors[sector] ?? []).filter((item) => item !== name),
                }
              : prev.customSubsectors,
            removedSubsectors: isCustom
              ? prev.removedSubsectors
              : {
                  ...prev.removedSubsectors,
                  [sector]: [...new Set([...(prev.removedSubsectors[sector] ?? []), name])],
                },
          };
        }),
      saveProgress: () => setState((prev) => ({ ...prev, savedAt: new Date().toISOString() })),
      reset: () =>
        setState((prev) => ({
          ...INITIAL_STATE,
          prompts: prev.prompts,
          deletedRegistryPromptIds: prev.deletedRegistryPromptIds,
          sectorSpecifics: prev.sectorSpecifics,
          subsectorTemplates: prev.subsectorTemplates,
          subsectorDefaultTemplates: prev.subsectorDefaultTemplates,
          subsectorConfigs: prev.subsectorConfigs,

          resources: prev.resources,
          customSubsectors: prev.customSubsectors,
          removedSubsectors: prev.removedSubsectors,

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
