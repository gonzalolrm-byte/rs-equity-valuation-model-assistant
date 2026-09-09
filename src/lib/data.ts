/**
 * Static reference data for the prototype.
 *
 * PROTOTYPE NOTE: this module is the single place where option lists,
 * developer resources and prompt actions live today. In the next phase these
 * lists are served by the backend (see src/lib/services/README.md); the UI
 * reads them through the same shapes, so no screen needs redesigning.
 */

export const SECTORS = [
  "Agribusiness & Forestry",
  "Chemicals",
  "Construction Materials",
  "Consumer Goods & Retail",
  "Education",
  "Health Care",
  "Hospitality & Tourism",
  "Manufacturing",
  "Metals & Mining",
  "Oil, Gas & Refining",
  "Power Generation",
  "Real Estate",
  "Telecommunications & Technology",
  "Transport & Logistics",
  "Water & Utilities",
] as const;

export const CURRENCIES = [
  "USD – US Dollar",
  "EUR – Euro",
  "GBP – Pound Sterling",
  "JPY – Japanese Yen",
  "BRL – Brazilian Real",
  "MXN – Mexican Peso",
  "COP – Colombian Peso",
  "PEN – Peruvian Sol",
  "INR – Indian Rupee",
  "IDR – Indonesian Rupiah",
  "NGN – Nigerian Naira",
  "KES – Kenyan Shilling",
  "EGP – Egyptian Pound",
  "ZAR – South African Rand",
  "TRY – Turkish Lira",
  "VND – Vietnamese Dong",
] as const;

const COUNTRY_DEFAULT_CURRENCY: Record<string, string> = {
  "united states": "USD – US Dollar",
  usa: "USD – US Dollar",
  us: "USD – US Dollar",
  "united kingdom": "GBP – Pound Sterling",
  uk: "GBP – Pound Sterling",
  "great britain": "GBP – Pound Sterling",
  brazil: "BRL – Brazilian Real",
  mexico: "MXN – Mexican Peso",
  colombia: "COP – Colombian Peso",
  peru: "PEN – Peruvian Sol",
  india: "INR – Indian Rupee",
  indonesia: "IDR – Indonesian Rupiah",
  nigeria: "NGN – Nigerian Naira",
  kenya: "KES – Kenyan Shilling",
  egypt: "EGP – Egyptian Pound",
  "south africa": "ZAR – South African Rand",
  turkey: "TRY – Turkish Lira",
  vietnam: "VND – Vietnamese Dong",
  japan: "JPY – Japanese Yen",
  china: "CNY – Chinese Yuan",
  "european union": "EUR – Euro",
  germany: "EUR – Euro",
  france: "EUR – Euro",
  italy: "EUR – Euro",
  spain: "EUR – Euro",
  netherlands: "EUR – Euro",
  belgium: "EUR – Euro",
  austria: "EUR – Euro",
  portugal: "EUR – Euro",
  greece: "EUR – Euro",
  ireland: "EUR – Euro",
  finland: "EUR – Euro",
};

export function defaultCurrencyForCountry(country: string): string | undefined {
  const key = country.trim().toLowerCase();
  return COUNTRY_DEFAULT_CURRENCY[key];
}

export const COGS_CATEGORIES = [
  "Materials & Consumables",
  "Direct Labor",
  "Utilities & Energy",
  "O&M (Operations & Maintenance)",
  "Third-Party Costs",
  "Regulatory Fees & Payments",
  "Purchased Goods",
] as const;

export const PUT_PRICE_MECHANISMS = [
  "IRR-Based",
  "Enterprise Value Multiple-Based",
  "Equity Multiple-Based",
  "Fixed Price-Based",
  "Fair Value Determined by a Third Party",
] as const;

/** Model update actions – each maps to a developer-controlled prompt action ID. */
export const UPDATE_ACTIONS = [
  {
    actionId: "B-01",
    label: "Add one year of historicals for roll-up purposes and update historical financials",
    hint: "Rolls the model forward one year and refreshes the historical financial statements.",
  },
  {
    actionId: "B-02",
    label: "Update Cost of Equity parameters",
    hint: "Uses the latest Cost of Equity report held in developer resources.",
  },
  {
    actionId: "B-03",
    label: "Update macro variables",
    hint: "Inflation, FX and GDP assumptions from the latest macro tool.",
  },
  {
    actionId: "B-04",
    label: "Update YTD financials",
    hint: "Adds year-to-date actuals from the uploaded documents.",
  },
  {
    actionId: "B-05",
    label:
      "Update revenue, COGS and CapEx calibration factors so projections align with the client's latest projections / business plan",
    hint: "Recalibrates projection drivers against the client's own financial model.",
  },
  {
    actionId: "B-06",
    label: "Update debt inputs so outputs match the company's projections",
    hint: "Aligns debt schedules, drawdowns and amortization with company projections.",
  },
] as const;

export type ResourceKind = "template" | "reference";

export type DeveloperResource = {
  id: string;
  name: string;
  description: string;
  kind: ResourceKind;
  sector?: string;
  lastUpdated: string;
  files: string[];
};

export const INITIAL_RESOURCES: DeveloperResource[] = [
  {
    id: "res-dcf",
    name: "DCF Templates",
    description:
      "Standardized DCF valuation templates, organized by sector and model type. Multiple files allowed.",
    kind: "template",
    lastUpdated: "2026-08-14",
    files: [
      "IFC_Standard_DCF_RealSector_v4.2.xlsx",
      "IFC_Standard_DCF_Infrastructure_v3.8.xlsx",
      "IFC_Standard_DCF_Manufacturing_v2.6.xlsx",
    ],
  },
  {
    id: "res-waterfall",
    name: "Preferred Waterfall Template",
    description: "Preferred / common share waterfall used when preferred instruments exist.",
    kind: "template",
    lastUpdated: "2026-07-02",
    files: ["IFC_Preferred_Waterfall_v2.1.xlsx"],
  },
  {
    id: "res-put",
    name: "Liquidity Put Template",
    description: "Put valuation template covering IRR, multiple and fixed-price mechanisms.",
    kind: "template",
    lastUpdated: "2026-06-19",
    files: ["IFC_Liquidity_Put_v1.9.xlsx"],
  },
  {
    id: "res-coe",
    name: "Latest Cost of Equity Report",
    description: "Quarterly cost of equity parameters by country and sector.",
    kind: "reference",
    lastUpdated: "2026-09-01",
    files: ["CoE_Report_2026Q3.pdf"],
  },
  {
    id: "res-macro",
    name: "Latest Macro Tool",
    description: "Macroeconomic assumptions: inflation, FX, GDP growth and interest rates.",
    kind: "reference",
    lastUpdated: "2026-09-01",
    files: ["Macro_Tool_2026Q3.xlsx"],
  },
];

export type PromptStatus = "Active" | "Inactive";

export type PromptAction = {
  id: string;
  title: string;
  category: string;
  step: string;
  status: PromptStatus;
  lastUpdated: string;
  promptText: string;
  requiredResources: string[];
  /**
   * Questionnaire variables this instruction block consumes (e.g.
   * "{{company_name}}"). Step 1 instructions are instruction blocks that the
   * future generation service combines with the user's answers, the extracted
   * document data and the selected template - they are not separate Claude
   * executions.
   */
  variables?: string[];
};

const NO_GUESSING =
  "\n\nIf a required value cannot be located in the supplied documents, return exactly \"Data not found.\" for that field. Never estimate, interpolate or invent financial information.";

export const INITIAL_PROMPTS: PromptAction[] = [
  // --- Workflow A, Step 1: Company Information ---------------------------
  // A.1-A.5 mirror section "A. General Information"
  {
    id: "A-01",
    title: "A.1 Company name",
    category: "General Information",
    step: "Workflow A – Step 1: Company Information",
    status: "Active",
    lastUpdated: "2026-08-21",
    promptText:
      "Confirm the legal and commercial name of the company from the uploaded documents and compare it with the company name entered by the user. Report the name used in the source documents and flag any mismatch." +
      NO_GUESSING,
    requiredResources: [],
  },
  {
    id: "A-02",
    title: "A.2 Primary sector",
    category: "General Information",
    step: "Workflow A – Step 1: Company Information",
    status: "Active",
    lastUpdated: "2026-08-21",
    promptText:
      "Using the company description in the uploaded documents, confirm whether the sector selected by the user is the primary sector. State the sector evidenced by the documents and identify which standardized DCF template that sector maps to." +
      NO_GUESSING,
    requiredResources: ["res-dcf"],
  },
  {
    id: "A-03",
    title: "A.3 Main countries of operation (up to 3) and local currencies",
    category: "General Information",
    step: "Workflow A – Step 1: Company Information",
    status: "Active",
    lastUpdated: "2026-08-21",
    promptText:
      "Identify the main countries in which the company operates (maximum three, ranked by contribution to revenue) and the local currency of each. Return the country, its local currency and the evidence used for the ranking." +
      NO_GUESSING,
    requiredResources: ["res-macro"],
  },
  {
    id: "A-04",
    title: "A.4 Material foreign-currency revenues, costs or investments",
    category: "General Information",
    step: "Workflow A – Step 1: Company Information",
    status: "Active",
    lastUpdated: "2026-08-21",
    promptText:
      "Determine whether the company has material revenues, costs or investments denominated in a currency other than the local currency. Quote the disclosures relied upon and list the currencies involved with their approximate share of revenue and costs." +
      NO_GUESSING,
    requiredResources: [],
  },
  {
    id: "A-05",
    title: "A.5 Reporting currency",
    category: "General Information",
    step: "Workflow A – Step 1: Company Information",
    status: "Active",
    lastUpdated: "2026-08-21",
    promptText:
      "State the reporting (presentation) currency and the units of the audited financial statements, and confirm whether it matches the reporting currency selected by the user." +
      NO_GUESSING,
    requiredResources: [],
  },
  // B.1-B.3 mirror section "B. Modeling Approach"
  {
    id: "A-06",
    title: "B.1 Revenue modeling approach",
    category: "Modeling Approach",
    step: "Workflow A – Step 1: Company Information",
    status: "Active",
    lastUpdated: "2026-08-21",
    promptText:
      "Given the sector, business description and data available in the uploaded documents, recommend whether revenue should be modeled on a percentage-based (simplified) basis or using unit economics (price x volume). Justify the recommendation with the specific historical data available." +
      NO_GUESSING,
    requiredResources: ["res-dcf"],
  },
  {
    id: "A-07",
    title: "B.2 COGS modeling approach",
    category: "Modeling Approach",
    step: "Workflow A – Step 1: Company Information",
    status: "Active",
    lastUpdated: "2026-08-21",
    promptText:
      "Recommend whether COGS should be modeled as a percentage of revenue or from per-unit cost assumptions, based on the cost disclosures available. State which historical inputs support the recommended approach." +
      NO_GUESSING,
    requiredResources: ["res-dcf"],
  },
  {
    id: "A-08",
    title: "B.3 CapEx modeling approach",
    category: "Modeling Approach",
    step: "Workflow A – Step 1: Company Information",
    status: "Active",
    lastUpdated: "2026-08-21",
    promptText:
      "Recommend whether CapEx should be modeled as a percentage of revenue or driven by per-unit capacity and expansion assumptions, based on the capital expenditure and capacity data disclosed." +
      NO_GUESSING,
    requiredResources: ["res-dcf"],
  },
  // C.1-C.5 mirror section "C. Segmentation and Categorization"
  {
    id: "A-09",
    title: "C.1 Segmentation basis: business line or revenue stream",
    category: "Segmentation and Categorization",
    step: "Workflow A – Step 1: Company Information",
    status: "Active",
    lastUpdated: "2026-08-21",
    promptText:
      "Using the company's business model and internal reporting, recommend whether operations should be segmented by business line or by revenue stream. Explain the operating-model and market-dynamic differences that justify the recommendation." +
      NO_GUESSING,
    requiredResources: ["res-dcf"],
  },
  {
    id: "A-10",
    title: "C.2 Segments to include and measurement units per segment",
    category: "Segmentation and Categorization",
    step: "Workflow A – Step 1: Company Information",
    status: "Active",
    lastUpdated: "2026-08-21",
    promptText:
      "List the segments that should be included in the model and, for each segment, recommend the measurement unit for Maximum Output / Units Sold and for Capacity. Maximum Output and Units Sold must share the same unit; Capacity may differ. If the applicable template defines units, use those; otherwise default to 'Units'. Also report the segment sheets and input blocks that must exist in the adapted template, without altering formula logic." +
      NO_GUESSING,
    requiredResources: ["res-dcf"],
  },
  {
    id: "A-11",
    title: "C.3 COGS segmented or aggregate",
    category: "Segmentation and Categorization",
    step: "Workflow A – Step 1: Company Information",
    status: "Active",
    lastUpdated: "2026-08-21",
    promptText:
      "State whether historical COGS can be reliably split by the selected segmentation basis. Recommend a segmented or aggregate COGS build and list the structural changes required in the template." +
      NO_GUESSING,
    requiredResources: ["res-dcf"],
  },
  {
    id: "A-12",
    title: "C.4 CapEx segmented or aggregate",
    category: "Segmentation and Categorization",
    step: "Workflow A – Step 1: Company Information",
    status: "Active",
    lastUpdated: "2026-08-21",
    promptText:
      "State whether historical CapEx can be reliably split by the selected segmentation basis. Recommend a segmented or aggregate CapEx build and list the structural changes required in the template." +
      NO_GUESSING,
    requiredResources: ["res-dcf"],
  },
  {
    id: "A-13",
    title: 'C.5 Map COGS categories to "Other Direct Costs"',
    category: "Segmentation and Categorization",
    step: "Workflow A – Step 1: Company Information",
    status: "Active",
    lastUpdated: "2026-08-09",
    promptText:
      "The user selected a set of standard COGS categories to be combined under 'Other Direct Costs'. Return the mapping between the template's standard COGS line items and the aggregated line, flagging any selected category that does not exist in the template or that is disclosed separately in the financial statements." +
      NO_GUESSING,
    requiredResources: ["res-dcf"],
  },
  // D.1-D.5 mirror section "D. Other Modeling Considerations"
  {
    id: "A-14",
    title: "D.1 Projection horizon",
    category: "Other Modeling Considerations",
    step: "Workflow A – Step 1: Company Information",
    status: "Active",
    lastUpdated: "2026-07-28",
    promptText:
      "Given the requested number of projection years, report the projection columns that must be added or removed in each worksheet, and confirm which formulas must be extended. Application code performs the workbook edit; you only return the instruction set." +
      NO_GUESSING,
    requiredResources: ["res-dcf"],
  },
  {
    id: "A-15",
    title: "D.2 Working capital days by line item",
    category: "Other Modeling Considerations",
    step: "Workflow A – Step 1: Company Information",
    status: "Active",
    lastUpdated: "2026-08-21",
    promptText:
      "For each working capital line item (trade receivables, contract assets, inventories, prepayments and other current assets, trade payables, contract liabilities / deferred revenue, accrued expenses and other operating payables), extract the historical balances and compute the implied days for the last 1, 2, 3 and 5 years. Return the values for the basis the user selected, with the arithmetic shown." +
      NO_GUESSING,
    requiredResources: [],
  },
  {
    id: "A-16",
    title: "D.3 Comparable companies (comps)",
    category: "Other Modeling Considerations",
    step: "Workflow A – Step 1: Company Information",
    status: "Active",
    lastUpdated: "2026-08-21",
    promptText:
      "Given the number of comparable companies requested, list the comps input rows the template requires and the data points needed for each comp. Do not propose comparable companies or multiples that are not present in the supplied documents." +
      NO_GUESSING,
    requiredResources: ["res-dcf"],
  },
  {
    id: "A-17",
    title: "D.4 Share classes and preferred rights",
    category: "Other Modeling Considerations",
    step: "Workflow A – Step 1: Company Information",
    status: "Active",
    lastUpdated: "2026-07-28",
    promptText:
      "Based on the share class answer and the preferred share rights described, state whether the preferred waterfall template must be appended and which inputs it requires from the uploaded documents (liquidation preference, dividend rights, conversion terms)." +
      NO_GUESSING,
    requiredResources: ["res-waterfall"],
  },
  {
    id: "A-18",
    title: "D.5 Liquidity put mechanics",
    category: "Other Modeling Considerations",
    step: "Workflow A – Step 1: Company Information",
    status: "Active",
    lastUpdated: "2026-07-28",
    promptText:
      "The user indicated a liquidity put and selected one or more pricing mechanisms. For each mechanism, list the inputs the liquidity put template requires and the source document where each input should be found." +
      NO_GUESSING,
    requiredResources: ["res-put"],
  },
  // --- Workflow A, Step 2 and Step 3 -------------------------------------
  {
    id: "A-19",
    title: "Extract historical financial statements",
    category: "Document Upload",
    step: "Workflow A – Step 2: Document Upload",
    status: "Active",
    lastUpdated: "2026-08-30",
    promptText:
      "From the uploaded audited financial statements, extract the income statement, balance sheet and cash flow statement for every available historical year. Return a strict JSON object keyed by statement, then line item, then fiscal year. Preserve the reporting currency and units as stated in the source document." +
      NO_GUESSING,
    requiredResources: [],
  },
  {
    id: "A-20",
    title: "Extract operational drivers by segment",
    category: "Document Upload",
    step: "Workflow A – Step 2: Document Upload",
    status: "Active",
    lastUpdated: "2026-08-30",
    promptText:
      "From the uploaded operational reports, extract volume and price drivers, revenue, COGS and CapEx by segment for each historical year, plus the COGS breakdown by standard category. Return strict JSON and cite the page or sheet for each figure." +
      NO_GUESSING,
    requiredResources: [],
  },
  {
    id: "A-21",
    title: "Populate standardized template and flag gaps",
    category: "Model Generation",
    step: "Workflow A – Step 3: Model Generation",
    status: "Active",
    lastUpdated: "2026-09-02",
    promptText:
      "Using the extracted data set, produce the cell-level population instructions for the adapted standardized template. Never write to formula cells. Produce a separate list of every required input that remains unresolved, using the status values 'Data not found', 'Missing information' or 'Requires user input'." +
      NO_GUESSING,
    requiredResources: ["res-dcf"],
  },
  {
    id: "B-01",
    title: "Add one year of historicals",
    category: "Model Updates",
    step: "Workflow B – Step 2: Model Updates",
    status: "Active",
    lastUpdated: "2026-09-03",
    promptText:
      "Roll the standardized model forward by one year. Identify the new historical year, extract its audited financials, and return the instructions to shift the historical/projection boundary while preserving all formulas and the model structure." +
      NO_GUESSING,
    requiredResources: [],
  },
  {
    id: "B-02",
    title: "Update Cost of Equity Parameters",
    category: "Model Updates",
    step: "Workflow B – Step 2: Model Updates",
    status: "Active",
    lastUpdated: "2026-09-03",
    promptText:
      "Using the latest Cost of Equity report, return the updated risk-free rate, equity risk premium, country risk premium, beta and any size or liquidity adjustments applicable to this company's countries and sector, together with the target cells in the standardized model." +
      NO_GUESSING,
    requiredResources: ["res-coe"],
  },
  {
    id: "B-03",
    title: "Update macro variables",
    category: "Model Updates",
    step: "Workflow B – Step 2: Model Updates",
    status: "Active",
    lastUpdated: "2026-09-03",
    promptText:
      "Using the latest macro tool, return updated inflation, FX, GDP growth and interest rate assumptions for every country used by the model, mapped to the macro input block." +
      NO_GUESSING,
    requiredResources: ["res-macro"],
  },
  {
    id: "B-04",
    title: "Update YTD financials",
    category: "Model Updates",
    step: "Workflow B – Step 2: Model Updates",
    status: "Active",
    lastUpdated: "2026-08-27",
    promptText:
      "Extract year-to-date actuals from the uploaded documents, state the period covered, and return the values mapped to the model's YTD input block." +
      NO_GUESSING,
    requiredResources: [],
  },
  {
    id: "B-05",
    title: "Update calibration factors (revenue, COGS, CapEx)",
    category: "Model Updates",
    step: "Workflow B – Step 2: Model Updates",
    status: "Active",
    lastUpdated: "2026-08-27",
    promptText:
      "Compare the standardized model's projections with the client's latest business plan and return the revenue, COGS and CapEx calibration factors required for alignment, by segment and year, with the arithmetic shown." +
      NO_GUESSING,
    requiredResources: [],
  },
  {
    id: "B-06",
    title: "Update debt inputs",
    category: "Model Updates",
    step: "Workflow B – Step 2: Model Updates",
    status: "Active",
    lastUpdated: "2026-08-27",
    promptText:
      "Extract the company's debt schedule: existing facilities, drawdowns, amortization, interest rates and covenants. Return the values mapped to the debt input block so model outputs reconcile with the company's projections." +
      NO_GUESSING,
    requiredResources: [],
  },
  {
    id: "B-07",
    title: "Missing information report",
    category: "Review and Generate",
    step: "Workflow B – Step 3: Review and Generate",
    status: "Inactive",
    lastUpdated: "2026-06-30",
    promptText:
      "Produce a consolidated report of every unresolved required input across all executed actions, grouped by worksheet, with the status value and the document that was searched." +
      NO_GUESSING,
    requiredResources: [],
  },
];

export const PROMPT_CATEGORIES = [
  // Categories mirror the section / step names the end user sees in the app.
  "General Information",
  "Modeling Approach",
  "Segmentation and Categorization",
  "Other Modeling Considerations",
  "Document Upload",
  "Model Generation",
  "Model Updates",
  "Review and Generate",
];

export const PROMPT_STEPS = [
  "Workflow A – Step 1: Company Information",
  "Workflow A – Step 2: Document Upload",
  "Workflow A – Step 3: Model Generation",
  "Workflow B – Step 1: Document Upload",
  "Workflow B – Step 2: Model Updates",
  "Workflow B – Step 3: Review and Generate",
];

/**
 * Measurement units for the per-segment operational drivers (Company
 * Information, section B). "Other Measurement" is always the last option and
 * reveals a free-text field in the UI.
 */
export const OTHER_MEASUREMENT = "Other Measurement";
export const SAME_AS_OUTPUT_MEASUREMENT = "Same as Maximum Output / Units Sold";

export const CAPACITY_MEASUREMENTS = [
  SAME_AS_OUTPUT_MEASUREMENT,
  "Units",
  "Hectares",
  "Installed Capacity (MW)",
  "Processing Capacity (MT/year)",
  "Production Capacity (Units/year)",
  "Floor Area (sqm)",
  "Rooms / Keys",
  "Beds",
  "Seats",
  "Store Count",
  "Fleet Size (Vehicles)",
  "Storage Capacity (m³)",
  "Subscriber Capacity (Lines)",
  "Water Treatment Capacity (m³/day)",
  "Head of Livestock",
  OTHER_MEASUREMENT,
] as const;

export const OUTPUT_MEASUREMENTS = [
  "Units",
  "Metric Tons (MT)",
  "Megawatt-hours (MWh)",
  "Barrels (bbl)",
  "Litres",
  "Cubic Metres (m³)",
  "Kilograms (kg)",
  "Room Nights",
  "Passengers",
  "Patients Treated",
  "Students Enrolled",
  "Subscribers",
  "Transactions",
  "Cases / Packs",
  "Square Metres Sold (sqm)",
  OTHER_MEASUREMENT,
] as const;

/**
 * PROTOTYPE: recommendation heuristic standing in for the backend/template
 * lookup. Phase 2 replaces this with the measurement units defined by the
 * applicable standardized template; when the template defines none, the
 * default remains "Units".
 */
const SECTOR_MEASUREMENTS: Record<string, { capacity: string; output: string }> = {
  "Agribusiness & Forestry": { capacity: "Hectares", output: "Metric Tons (MT)" },
  Chemicals: { capacity: "Processing Capacity (MT/year)", output: "Metric Tons (MT)" },
  "Construction Materials": { capacity: "Processing Capacity (MT/year)", output: "Metric Tons (MT)" },
  "Consumer Goods & Retail": { capacity: "Store Count", output: "Units" },
  Education: { capacity: "Seats", output: "Students Enrolled" },
  "Health Care": { capacity: "Beds", output: "Patients Treated" },
  "Hospitality & Tourism": { capacity: "Rooms / Keys", output: "Room Nights" },
  Manufacturing: { capacity: "Production Capacity (Units/year)", output: "Units" },
  "Metals & Mining": { capacity: "Processing Capacity (MT/year)", output: "Metric Tons (MT)" },
  "Oil, Gas & Refining": { capacity: "Processing Capacity (MT/year)", output: "Barrels (bbl)" },
  "Power Generation": { capacity: "Installed Capacity (MW)", output: "Megawatt-hours (MWh)" },
  "Real Estate": { capacity: "Floor Area (sqm)", output: "Square Metres Sold (sqm)" },
  "Telecommunications & Technology": { capacity: "Subscriber Capacity (Lines)", output: "Subscribers" },
  "Transport & Logistics": { capacity: "Fleet Size (Vehicles)", output: "Metric Tons (MT)" },
  "Water & Utilities": { capacity: "Water Treatment Capacity (m³/day)", output: "Cubic Metres (m³)" },
};

/** Keyword hints taken from the business / segment description. */
const KEYWORD_MEASUREMENTS: { match: RegExp; capacity: string; output: string }[] = [
  { match: /farm|agri|planta|crop|orchard|forest/i, capacity: "Hectares", output: "Metric Tons (MT)" },
  { match: /process|mill|refin|packag/i, capacity: "Processing Capacity (MT/year)", output: "Metric Tons (MT)" },
  { match: /hotel|resort|lodge/i, capacity: "Rooms / Keys", output: "Room Nights" },
  { match: /hospital|clinic/i, capacity: "Beds", output: "Patients Treated" },
  { match: /school|univers|campus/i, capacity: "Seats", output: "Students Enrolled" },
  { match: /solar|wind|power|generation/i, capacity: "Installed Capacity (MW)", output: "Megawatt-hours (MWh)" },
  { match: /retail|store|shop/i, capacity: "Store Count", output: "Units" },
  { match: /logistic|transport|fleet|truck/i, capacity: "Fleet Size (Vehicles)", output: "Metric Tons (MT)" },
  { match: /telecom|subscri|mobile|broadband/i, capacity: "Subscriber Capacity (Lines)", output: "Subscribers" },
  { match: /water|utility|sanitation/i, capacity: "Water Treatment Capacity (m³/day)", output: "Cubic Metres (m³)" },
];

export function recommendedMeasurements(input: {
  sector?: string;
  businessModel?: string;
  segmentDescription?: string;
}): { capacity: string; output: string } {
  const text = `${input.segmentDescription ?? ""} ${input.businessModel ?? ""}`;
  const keyword = KEYWORD_MEASUREMENTS.find((entry) => entry.match.test(text));
  if (keyword) return { capacity: keyword.capacity, output: keyword.output };
  const bySector = input.sector ? SECTOR_MEASUREMENTS[input.sector] : undefined;
  return bySector ?? { capacity: "Units", output: "Units" };
}

/** Working capital line items modeled on a days basis (assets vs. liabilities). */
export const WORKING_CAPITAL_ASSETS = [
  "Trade receivables",
  "Contract assets",
  "Inventories",
  "Prepayments and other current assets",
];

export const WORKING_CAPITAL_LIABILITIES = [
  "Trade payables",
  "Contract liabilities / deferred revenue",
  "Accrued expenses and other operating payables",
];

export const MANUAL_WORKING_CAPITAL_BASIS = "Manual input";

export const WORKING_CAPITAL_BASIS_OPTIONS = [
  "Last year",
  "Average of last 2 years",
  "Average of last 3 years",
  "Average of last 5 years",
  MANUAL_WORKING_CAPITAL_BASIS,
];
