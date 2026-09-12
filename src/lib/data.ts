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
  "Generic - Unit Economics",
  "Generic - Percentage Based",
] as const;

/**
 * Subsector templates offered for each primary sector/template.
 * PROTOTYPE: this is the single source of truth for the A.2 dropdown; Phase 2
 * moves the list to the backend/template service.
 */
export const SUBSECTORS: Record<string, string[]> = {
  "Agribusiness & Forestry": [
    "Crop Production",
    "Livestock & Animal Products",
    "Forestry & Timber",
    "Agri-Processing",
  ],
  Chemicals: [
    "Specialty Chemicals",
    "Fertilizers & Agrochemicals",
    "Petrochemicals",
    "Industrial Gases",
  ],
  "Construction Materials": [
    "Cement & Aggregates",
    "Ready-Mix Concrete",
    "Construction Steel",
    "Building Products",
  ],
  "Consumer Goods & Retail": [
    "Food & Beverage",
    "Apparel & Textiles",
    "Consumer Electronics",
    "Retail & Distribution",
  ],
  Education: [
    "K-12 Education",
    "Higher Education",
    "Vocational Training",
    "EdTech",
  ],
  "Health Care": [
    "Hospitals & Clinics",
    "Pharmaceuticals",
    "Medical Devices",
    "Health Insurance",
  ],
  "Hospitality & Tourism": [
    "Hotels & Resorts",
    "Restaurants & Food Service",
    "Travel & Tour Operators",
    "Entertainment",
  ],
  Manufacturing: [
    "Automotive & Components",
    "Industrial Machinery",
    "Electronics Manufacturing",
    "Textile Manufacturing",
  ],
  "Metals & Mining": [
    "Precious Metals",
    "Base Metals",
    "Iron & Steel",
    "Mining Services",
  ],
  "Oil, Gas & Refining": [
    "Upstream Exploration & Production",
    "Midstream & Pipelines",
    "Downstream Refining",
    "Oilfield Services",
  ],
  "Power Generation": [
    "Thermal Power",
    "Renewable Energy (Solar/Wind)",
    "Hydroelectric",
    "Gas-Fired Power",
  ],
  "Real Estate": [
    "Residential Development",
    "Commercial Office",
    "Industrial & Logistics",
    "Retail Real Estate",
  ],
  "Telecommunications & Technology": [
    "Mobile Telecom",
    "Fixed Broadband",
    "Data Centers",
    "Software & IT Services",
  ],
  "Transport & Logistics": [
    "Freight & Trucking",
    "Ports & Terminals",
    "Aviation",
    "Warehousing & Logistics",
  ],
  "Water & Utilities": [
    "Water Supply & Sanitation",
    "Wastewater Treatment",
    "Solid Waste Management",
    "Utilities Infrastructure",
  ],
  "Generic - Unit Economics": ["Default Unit Economics"],
  "Generic - Percentage Based": ["Default Percentage Based"],
};

export const CURRENCIES = [
  "AED – UAE Dirham",
  "ARS – Argentine Peso",
  "AUD – Australian Dollar",
  "BDT – Bangladeshi Taka",
  "BGN – Bulgarian Lev",
  "BRL – Brazilian Real",
  "CAD – Canadian Dollar",
  "CHF – Swiss Franc",
  "CLP – Chilean Peso",
  "CNY – Chinese Yuan",
  "COP – Colombian Peso",
  "CZK – Czech Koruna",
  "DKK – Danish Krone",
  "EGP – Egyptian Pound",
  "EUR – Euro",
  "GBP – Pound Sterling",
  "GHS – Ghanaian Cedi",
  "HKD – Hong Kong Dollar",
  "HUF – Hungarian Forint",
  "IDR – Indonesian Rupiah",
  "ILS – Israeli Shekel",
  "INR – Indian Rupee",
  "JPY – Japanese Yen",
  "KES – Kenyan Shilling",
  "KRW – South Korean Won",
  "KWD – Kuwaiti Dinar",
  "LKR – Sri Lankan Rupee",
  "MAD – Moroccan Dirham",
  "MXN – Mexican Peso",
  "MYR – Malaysian Ringgit",
  "NGN – Nigerian Naira",
  "NOK – Norwegian Krone",
  "NZD – New Zealand Dollar",
  "PEN – Peruvian Sol",
  "PHP – Philippine Peso",
  "PKR – Pakistani Rupee",
  "PLN – Polish Zloty",
  "QAR – Qatari Riyal",
  "RON – Romanian Leu",
  "RUB – Russian Ruble",
  "SAR – Saudi Riyal",
  "SEK – Swedish Krona",
  "SGD – Singapore Dollar",
  "THB – Thai Baht",
  "TRY – Turkish Lira",
  "TWD – New Taiwan Dollar",
  "UAH – Ukrainian Hryvnia",
  "USD – US Dollar",
  "VND – Vietnamese Dong",
  "ZAR – South African Rand",
  "ZMW – Zambian Kwacha",
] as const;

export const COUNTRIES = [
  "Argentina",
  "Australia",
  "Austria",
  "Bangladesh",
  "Belgium",
  "Brazil",
  "Bulgaria",
  "Canada",
  "Chile",
  "China",
  "Colombia",
  "Czech Republic",
  "Denmark",
  "Egypt",
  "Finland",
  "France",
  "Germany",
  "Ghana",
  "Greece",
  "Hong Kong SAR, China",
  "Hungary",
  "India",
  "Indonesia",
  "Ireland",
  "Israel",
  "Italy",
  "Japan",
  "Kenya",
  "Korea, Republic of",
  "Kuwait",
  "Malaysia",
  "Mexico",
  "Morocco",
  "Netherlands",
  "New Zealand",
  "Nigeria",
  "Norway",
  "Pakistan",
  "Peru",
  "Philippines",
  "Poland",
  "Portugal",
  "Qatar",
  "Romania",
  "Russian Federation",
  "Saudi Arabia",
  "Singapore",
  "South Africa",
  "Spain",
  "Sri Lanka",
  "Sweden",
  "Switzerland",
  "Taiwan, China",
  "Thailand",
  "Turkey",
  "Ukraine",
  "United Arab Emirates",
  "United Kingdom",
  "United States",
  "Vietnam",
  "Zambia",
] as const;

const COUNTRY_DEFAULT_CURRENCY: Record<string, string> = {
  "united states": "USD – US Dollar",
  usa: "USD – US Dollar",
  us: "USD – US Dollar",
  "united kingdom": "GBP – Pound Sterling",
  uk: "GBP – Pound Sterling",
  "great britain": "GBP – Pound Sterling",
  argentina: "ARS – Argentine Peso",
  australia: "AUD – Australian Dollar",
  austria: "EUR – Euro",
  bangladesh: "BDT – Bangladeshi Taka",
  belgium: "EUR – Euro",
  brazil: "BRL – Brazilian Real",
  bulgaria: "BGN – Bulgarian Lev",
  canada: "CAD – Canadian Dollar",
  chile: "CLP – Chilean Peso",
  china: "CNY – Chinese Yuan",
  colombia: "COP – Colombian Peso",
  "czech republic": "CZK – Czech Koruna",
  denmark: "DKK – Danish Krone",
  egypt: "EGP – Egyptian Pound",
  finland: "EUR – Euro",
  france: "EUR – Euro",
  germany: "EUR – Euro",
  ghana: "GHS – Ghanaian Cedi",
  greece: "EUR – Euro",
  "hong kong sar, china": "HKD – Hong Kong Dollar",
  hungary: "HUF – Hungarian Forint",
  india: "INR – Indian Rupee",
  indonesia: "IDR – Indonesian Rupiah",
  ireland: "EUR – Euro",
  israel: "ILS – Israeli Shekel",
  italy: "EUR – Euro",
  japan: "JPY – Japanese Yen",
  kenya: "KES – Kenyan Shilling",
  "korea, republic of": "KRW – South Korean Won",
  kuwait: "KWD – Kuwaiti Dinar",
  malaysia: "MYR – Malaysian Ringgit",
  mexico: "MXN – Mexican Peso",
  morocco: "MAD – Moroccan Dirham",
  netherlands: "EUR – Euro",
  "new zealand": "NZD – New Zealand Dollar",
  nigeria: "NGN – Nigerian Naira",
  norway: "NOK – Norwegian Krone",
  pakistan: "PKR – Pakistani Rupee",
  peru: "PEN – Peruvian Sol",
  philippines: "PHP – Philippine Peso",
  poland: "PLN – Polish Zloty",
  portugal: "EUR – Euro",
  qatar: "QAR – Qatari Riyal",
  romania: "RON – Romanian Leu",
  "russian federation": "RUB – Russian Ruble",
  "saudi arabia": "SAR – Saudi Riyal",
  singapore: "SGD – Singapore Dollar",
  "south africa": "ZAR – South African Rand",
  spain: "EUR – Euro",
  "sri lanka": "LKR – Sri Lankan Rupee",
  sweden: "SEK – Swedish Krona",
  switzerland: "CHF – Swiss Franc",
  "taiwan, china": "TWD – New Taiwan Dollar",
  thailand: "THB – Thai Baht",
  turkey: "TRY – Turkish Lira",
  ukraine: "UAH – Ukrainian Hryvnia",
  "united arab emirates": "AED – UAE Dirham",
  vietnam: "VND – Vietnamese Dong",
  zambia: "ZMW – Zambian Kwacha",
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
    id: "res-dcf-generic",
    name: "DCF Generic Templates",
    description: "Generic standardized DCF valuation templates used when no sector-specific template is available.",
    kind: "template",
    lastUpdated: "2026-09-11",
    files: [],
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
  /** True for actions created by a developer in the console (not shipped in the registry). */
  custom?: boolean;
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
  // --- Workflow A, Step 1: Template Selection & Key Inputs ---------------------------
  // Minimal set of instruction blocks for the first-time standardized model workflow.
  {
    id: "A-001",
    title: "Select Sector / Subsector Template",
    category: "Template Selection & Key Inputs",
    step: "Workflow A – Step 1: Template Selection & Key Inputs",
    status: "Active",
    lastUpdated: "2026-09-10",
    variables: ["{{primary_sector}}", "{{subsector_template}}"],
    promptText:
      "Select the standardized DCF template that corresponds to {{primary_sector}} — {{subsector_template}} from the IFC DCF template library. Use this template as the base workbook for all subsequent configuration and population steps. If no exact subsector template exists, choose the closest available template and note the mapping. Do not alter the template's core structure unless required by another questionnaire response.",
    requiredResources: [],
  },
  {
    id: "A-002",
    title: "Company Name",
    category: "Template Population",
    step: "Workflow A – Step 1: Template Selection & Key Inputs",
    status: "Active",
    lastUpdated: "2026-09-09",
    variables: ["{{company_name}}"],
    promptText:
      "Use {{company_name}} as the company name throughout the model. Replace company-specific references or placeholders in the template with this name where applicable. Do not modify formulas or model structure solely because of the company name.",
    requiredResources: [],
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
];

export const PROMPT_CATEGORIES = [
  // Categories mirror the section / step names the end user sees in the app.
  "Template Selection & Key Inputs",
  "Template Population",
  "Modeling Approach",
  "Segmentation and Categorization",
  "Other Modeling Key Inputs",
  "Document Upload",
  "Model Generation",
  "Model Updates",
  "Review and Generate",
];

export const PROMPT_STEPS = [
  "Workflow A – Step 1: Template Selection & Key Inputs",
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

/** Keyword hints taken from the business description. Used only as a fallback. */
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

/**
 * PROTOTYPE: capacity-measurement options by subsector template. These are the
 * choices shown in the Capacity measurement dropdown when capacity is allowed
 * to differ from Maximum Output / Units Sold. The first option is used as the
 * default capacity measurement for that subsector.
 */
export const SUBSECTOR_CAPACITY_MEASUREMENTS: Record<string, string[]> = {
  "Crop Production": ["Hectares", "Processing Capacity (MT/year)", "Units"],
  "Livestock & Animal Products": ["Head of Livestock", "Processing Capacity (MT/year)", "Units"],
  "Forestry & Timber": ["Hectares", "Processing Capacity (MT/year)", "Units"],
  "Agri-Processing": ["Processing Capacity (MT/year)", "Production Capacity (Units/year)", "Units"],

  "Specialty Chemicals": ["Processing Capacity (MT/year)", "Production Capacity (Units/year)", "Units"],
  "Fertilizers & Agrochemicals": ["Processing Capacity (MT/year)", "Production Capacity (Units/year)", "Units"],
  "Petrochemicals": ["Processing Capacity (MT/year)", "Storage Capacity (m³)", "Units"],
  "Industrial Gases": ["Production Capacity (Units/year)", "Processing Capacity (MT/year)", "Units"],

  "Cement & Aggregates": ["Processing Capacity (MT/year)", "Production Capacity (Units/year)", "Units"],
  "Ready-Mix Concrete": ["Processing Capacity (MT/year)", "Production Capacity (Units/year)", "Units"],
  "Construction Steel": ["Processing Capacity (MT/year)", "Production Capacity (Units/year)", "Units"],
  "Building Products": ["Production Capacity (Units/year)", "Processing Capacity (MT/year)", "Units"],

  "Food & Beverage": ["Production Capacity (Units/year)", "Processing Capacity (MT/year)", "Units"],
  "Apparel & Textiles": ["Production Capacity (Units/year)", "Units"],
  "Consumer Electronics": ["Production Capacity (Units/year)", "Units"],
  "Retail & Distribution": ["Store Count", "Production Capacity (Units/year)", "Units"],

  "K-12 Education": ["Seats", "Units"],
  "Higher Education": ["Seats", "Units"],
  "Vocational Training": ["Seats", "Units"],
  "EdTech": ["Subscriber Capacity (Lines)", "Seats", "Units"],

  "Hospitals & Clinics": ["Beds", "Units"],
  "Pharmaceuticals": ["Production Capacity (Units/year)", "Processing Capacity (MT/year)", "Units"],
  "Medical Devices": ["Production Capacity (Units/year)", "Units"],
  "Health Insurance": ["Subscriber Capacity (Lines)", "Units"],

  "Hotels & Resorts": ["Rooms / Keys", "Units"],
  "Restaurants & Food Service": ["Seats", "Units"],
  "Travel & Tour Operators": ["Units"],
  "Entertainment": ["Seats", "Units"],

  "Automotive & Components": ["Production Capacity (Units/year)", "Units"],
  "Industrial Machinery": ["Production Capacity (Units/year)", "Units"],
  "Electronics Manufacturing": ["Production Capacity (Units/year)", "Units"],
  "Textile Manufacturing": ["Production Capacity (Units/year)", "Units"],

  "Precious Metals": ["Processing Capacity (MT/year)", "Units"],
  "Base Metals": ["Processing Capacity (MT/year)", "Units"],
  "Iron & Steel": ["Processing Capacity (MT/year)", "Production Capacity (Units/year)", "Units"],
  "Mining Services": ["Fleet Size (Vehicles)", "Processing Capacity (MT/year)", "Units"],

  "Upstream Exploration & Production": ["Processing Capacity (MT/year)", "Storage Capacity (m³)", "Units"],
  "Midstream & Pipelines": ["Storage Capacity (m³)", "Units"],
  "Downstream Refining": ["Processing Capacity (MT/year)", "Storage Capacity (m³)", "Units"],
  "Oilfield Services": ["Fleet Size (Vehicles)", "Units"],

  "Thermal Power": ["Installed Capacity (MW)", "Units"],
  "Renewable Energy (Solar/Wind)": ["Installed Capacity (MW)", "Units"],
  Hydroelectric: ["Installed Capacity (MW)", "Units"],
  "Gas-Fired Power": ["Installed Capacity (MW)", "Units"],

  "Residential Development": ["Floor Area (sqm)", "Units"],
  "Commercial Office": ["Floor Area (sqm)", "Units"],
  "Industrial & Logistics": ["Floor Area (sqm)", "Storage Capacity (m³)", "Units"],
  "Retail Real Estate": ["Floor Area (sqm)", "Units"],

  "Mobile Telecom": ["Subscriber Capacity (Lines)", "Units"],
  "Fixed Broadband": ["Subscriber Capacity (Lines)", "Units"],
  "Data Centers": ["Floor Area (sqm)", "Units"],
  "Software & IT Services": ["Subscriber Capacity (Lines)", "Units"],

  "Freight & Trucking": ["Fleet Size (Vehicles)", "Units"],
  "Ports & Terminals": ["Storage Capacity (m³)", "Units"],
  Aviation: ["Seats", "Units"],
  "Warehousing & Logistics": ["Storage Capacity (m³)", "Floor Area (sqm)", "Units"],

  "Water Supply & Sanitation": ["Water Treatment Capacity (m³/day)", "Units"],
  "Wastewater Treatment": ["Water Treatment Capacity (m³/day)", "Units"],
  "Solid Waste Management": ["Processing Capacity (MT/year)", "Units"],
  "Utilities Infrastructure": ["Installed Capacity (MW)", "Water Treatment Capacity (m³/day)", "Units"],

  "Default Unit Economics": ["Units", "Production Capacity (Units/year)"],
};

/**
 * PROTOTYPE: default Maximum Output / Units Sold measurement by subsector
 * template. When a subsector is not listed, recommendedMeasurements falls back
 * to the sector-level default.
 */
export const SUBSECTOR_OUTPUT_MEASUREMENTS: Record<string, string> = {
  "Crop Production": "Metric Tons (MT)",
  "Livestock & Animal Products": "Head of Livestock",
  "Forestry & Timber": "Cubic Metres (m³)",
  "Agri-Processing": "Metric Tons (MT)",

  "Specialty Chemicals": "Metric Tons (MT)",
  "Fertilizers & Agrochemicals": "Metric Tons (MT)",
  Petrochemicals: "Metric Tons (MT)",
  "Industrial Gases": "Units",

  "Cement & Aggregates": "Metric Tons (MT)",
  "Ready-Mix Concrete": "Cubic Metres (m³)",
  "Construction Steel": "Metric Tons (MT)",
  "Building Products": "Units",

  "Food & Beverage": "Units",
  "Apparel & Textiles": "Units",
  "Consumer Electronics": "Units",
  "Retail & Distribution": "Units",

  "K-12 Education": "Students Enrolled",
  "Higher Education": "Students Enrolled",
  "Vocational Training": "Students Enrolled",
  EdTech: "Subscribers",

  "Hospitals & Clinics": "Patients Treated",
  Pharmaceuticals: "Units",
  "Medical Devices": "Units",
  "Health Insurance": "Subscribers",

  "Hotels & Resorts": "Room Nights",
  "Restaurants & Food Service": "Customers Served",
  "Travel & Tour Operators": "Customers Served",
  Entertainment: "Tickets Sold",

  "Automotive & Components": "Units",
  "Industrial Machinery": "Units",
  "Electronics Manufacturing": "Units",
  "Textile Manufacturing": "Units",

  "Precious Metals": "Metric Tons (MT)",
  "Base Metals": "Metric Tons (MT)",
  "Iron & Steel": "Metric Tons (MT)",
  "Mining Services": "Metric Tons (MT)",

  "Upstream Exploration & Production": "Barrels (bbl)",
  "Midstream & Pipelines": "Barrels (bbl)",
  "Downstream Refining": "Barrels (bbl)",
  "Oilfield Services": "Units",

  "Thermal Power": "Megawatt-hours (MWh)",
  "Renewable Energy (Solar/Wind)": "Megawatt-hours (MWh)",
  Hydroelectric: "Megawatt-hours (MWh)",
  "Gas-Fired Power": "Megawatt-hours (MWh)",

  "Residential Development": "Square Metres Sold (sqm)",
  "Commercial Office": "Square Metres Sold (sqm)",
  "Industrial & Logistics": "Square Metres Sold (sqm)",
  "Retail Real Estate": "Square Metres Sold (sqm)",

  "Mobile Telecom": "Subscribers",
  "Fixed Broadband": "Subscribers",
  "Data Centers": "Units",
  "Software & IT Services": "Subscribers",

  "Freight & Trucking": "Metric Tons (MT)",
  "Ports & Terminals": "Metric Tons (MT)",
  Aviation: "Passengers",
  "Warehousing & Logistics": "Metric Tons (MT)",

  "Water Supply & Sanitation": "Cubic Metres (m³)",
  "Wastewater Treatment": "Cubic Metres (m³)",
  "Solid Waste Management": "Metric Tons (MT)",
  "Utilities Infrastructure": "Megawatt-hours (MWh)",

  "Generic - Unit Economics": "Units",
  "Generic - Percentage Based": "Units",
};

/**
 * Developer Console overrides for the shipped sector/subsector defaults.
 * PROTOTYPE: edited in the Developer Console (Sector Specifics) and stored with
 * the app state; Phase 2 persists these with the template service.
 */
export type SubsectorMeasurementSetting = {
  /** Default Maximum Output / Units Sold measurement. */
  output: string;
  /**
   * Extra Maximum Output / Units Sold measurements (Option 1 / Option 2), only
   * offered when a sub-sector is modeled with multiple revenue streams.
   */
  outputOptions?: string[];
  /** Capacity measurements offered for this subsector template. */
  capacityOptions: string[];
};

export type SectorSpecifics = Record<string, SubsectorMeasurementSetting>;

/** Shipped defaults for a subsector template, before developer overrides. */
export function defaultSubsectorMeasurements(
  subsector: string,
  sector?: string,
): SubsectorMeasurementSetting {
  const sectorDefaults = sector ? SECTOR_MEASUREMENTS[sector] : undefined;
  const output = SUBSECTOR_OUTPUT_MEASUREMENTS[subsector] ?? sectorDefaults?.output ?? "Units";
  const capacityOptions =
    SUBSECTOR_CAPACITY_MEASUREMENTS[subsector] ??
    (sectorDefaults?.capacity ? [sectorDefaults.capacity, "Units"] : ["Units"]);
  return { output, capacityOptions };
}

export function recommendedMeasurements(input: {
  sector?: string;
  subsector?: string;
  businessModel?: string;
  /** Developer Console overrides keyed by subsector template. */
  sectorSpecifics?: SectorSpecifics;
}): { capacity: string; output: string; capacityOptions: string[] } {
  const override = input.subsector ? input.sectorSpecifics?.[input.subsector] : undefined;

  // The selected subsector template defines the default output unit.
  const bySubsector = input.subsector
    ? SUBSECTOR_OUTPUT_MEASUREMENTS[input.subsector]
    : undefined;
  const bySector = input.sector ? SECTOR_MEASUREMENTS[input.sector] : undefined;

  let output: string | undefined = override?.output || bySubsector || bySector?.output;

  // If no template match, use keywords in the business description as a fallback.
  if (!output) {
    const text = `${input.businessModel ?? ""}`;
    const keyword = KEYWORD_MEASUREMENTS.find((entry) => entry.match.test(text));
    output = keyword?.output ?? "Units";
  }

  // Capacity measurement options are driven by the selected subsector template.
  const subsectorOptions = input.subsector
    ? SUBSECTOR_CAPACITY_MEASUREMENTS[input.subsector]
    : undefined;
  const sectorCapacity = bySector?.capacity;
  const baseOptions =
    (override?.capacityOptions?.length ? override.capacityOptions : undefined) ??
    subsectorOptions ??
    (sectorCapacity ? [sectorCapacity, "Units"] : ["Units"]);
  const capacityOptions = [
    ...new Set([SAME_AS_OUTPUT_MEASUREMENT, ...baseOptions, OTHER_MEASUREMENT]),
  ];

  // Default capacity value: use the subsector's first option when it differs from
  // the output unit; otherwise default to "Same as Maximum Output / Units Sold".
  const primaryCapacity = baseOptions[0] ?? "Units";
  const capacity = primaryCapacity === output ? SAME_AS_OUTPUT_MEASUREMENT : primaryCapacity;

  return { capacity, output, capacityOptions };
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
