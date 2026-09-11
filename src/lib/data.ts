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
  // --- Workflow A, Step 1: Template Selection & Adaptation ---------------------------
  // One instruction block per Company Information question. Grouped exactly
  // like the questionnaire the user sees: A. Template Selection,
  // B. General Information, C. Modeling Approach, D. Segmentation and Categorization,
  // E. Other Modeling Considerations.
  {
    id: "A-001",
    title: "Select Sector / Subsector Template",
    category: "Template Selection",
    step: "Workflow A – Step 1: Template Selection & Adaptation",
    status: "Active",
    lastUpdated: "2026-09-10",
    variables: ["{{primary_sector}}", "{{subsector_template}}"],
    promptText:
      "Select the standardized DCF template that corresponds to {{primary_sector}} — {{subsector_template}} from the IFC DCF template library. Use this template as the base workbook for all subsequent configuration and population steps. If no exact subsector template exists, choose the closest available template and note the mapping. Do not alter the template's core structure unless required by another questionnaire response.",
    requiredResources: ["res-dcf"],
  },
  {
    id: "A-002",
    title: "Company Name",
    category: "General Information",
    step: "Workflow A – Step 1: Template Selection & Adaptation",
    status: "Active",
    lastUpdated: "2026-09-09",
    variables: ["{{company_name}}"],
    promptText:
      "Use {{company_name}} as the company name throughout the model. Replace company-specific references or placeholders in the template with this name where applicable. Do not modify formulas or model structure solely because of the company name.",
    requiredResources: [],
  },
  {
    id: "A-003",
    title: "Primary Sector",
    category: "General Information",
    step: "Workflow A – Step 1: Template Selection & Adaptation",
    status: "Active",
    lastUpdated: "2026-09-09",
    variables: ["{{primary_sector}}"],
    promptText:
      "Treat {{primary_sector}} as the company's primary sector. Use this sector classification when determining sector-appropriate terminology, operating drivers, measurement units, assumptions, and model conventions within the already-selected standardized template. Do not change the standardized template structure unless required by another questionnaire response.",
    requiredResources: [],
  },
  {
    id: "A-004",
    title: "Countries of Operation",
    category: "General Information",
    step: "Workflow A – Step 1: Template Selection & Adaptation",
    status: "Active",
    lastUpdated: "2026-09-09",
    variables: ["{{country_1}}", "{{country_2}}", "{{country_3}}"],
    promptText:
      "Configure the model for the following operating countries: {{country_1}}, {{country_2}}, and {{country_3}}, where provided. Use the corresponding local currencies and country-specific macroeconomic assumptions, including inflation and real GDP growth, where required by the template. Ignore unused country slots.",
    requiredResources: ["res-macro"],
  },
  {
    id: "A-005",
    title: "Foreign Currency Exposure",
    category: "General Information",
    step: "Workflow A – Step 1: Template Selection & Adaptation",
    status: "Active",
    lastUpdated: "2026-09-09",
    variables: ["{{foreign_currency_exposure}}"],
    promptText:
      "The response to material foreign-currency exposure is {{foreign_currency_exposure}}. If Yes, reflect material revenues, costs, or investments denominated in a currency other than the local operating currency. To avoid unnecessary complexity, use USD as the default foreign currency unless another currency is explicitly provided in the source information. If No, do not introduce an additional FX exposure solely for modeling purposes.",
    requiredResources: [],
  },
  {
    id: "A-006",
    title: "Reporting Currency",
    category: "General Information",
    step: "Workflow A – Step 1: Template Selection & Adaptation",
    status: "Active",
    lastUpdated: "2026-09-09",
    variables: ["{{reporting_currency}}"],
    promptText:
      "Use {{reporting_currency}} as the company's reporting and model presentation currency. Convert financial information from other currencies into the reporting currency using the template's FX methodology where required.",
    requiredResources: [],
  },
  {
    id: "A-007",
    title: "Revenue Modeling Approach",
    category: "Modeling Approach",
    step: "Workflow A – Step 1: Template Selection & Adaptation",
    status: "Active",
    lastUpdated: "2026-09-09",
    variables: ["{{revenue_modeling_approach}}"],
    promptText:
      "Model revenue using {{revenue_modeling_approach}}. If Growth rate is selected, use the template's simplified revenue forecasting methodology. If Unit Economics is selected, model revenue using Units Sold (or equivalent) x Price per Unit, together with the relevant operating and pricing drivers.",
    requiredResources: [],
  },
  {
    id: "A-008",
    title: "COGS Modeling Approach",
    category: "Modeling Approach",
    step: "Workflow A – Step 1: Template Selection & Adaptation",
    status: "Active",
    lastUpdated: "2026-09-09",
    variables: ["{{cogs_modeling_approach}}"],
    promptText:
      "Model COGS using {{cogs_modeling_approach}}. If % of revenues is selected, forecast COGS using the template's percentage-based methodology. If Unit Economics is selected, model applicable variable costs using cost per Unit Sold (or equivalent) and applicable fixed or semi-fixed costs using Maximum Output or capacity-related drivers where appropriate.",
    requiredResources: [],
  },
  {
    id: "A-009",
    title: "CapEx Modeling Approach",
    category: "Modeling Approach",
    step: "Workflow A – Step 1: Template Selection & Adaptation",
    status: "Active",
    lastUpdated: "2026-09-09",
    variables: ["{{capex_modeling_approach}}"],
    promptText:
      "Model CapEx using {{capex_modeling_approach}}. If % of revenues is selected, forecast CapEx as a percentage of revenue. If Unit Economics is selected, model maintenance and expansion CapEx using the applicable capacity-based methodology, distinguishing existing capacity from incremental capacity where required.",
    requiredResources: [],
  },
  {
    id: "A-010",
    title: "Segmentation Type: Business Line vs. Revenue Stream",
    category: "Segmentation and Categorization",
    step: "Workflow A – Step 1: Template Selection & Adaptation",
    status: "Active",
    lastUpdated: "2026-09-09",
    variables: ["{{segmentation_type}}"],
    promptText:
      "Segment operations and revenues by {{segmentation_type}}. If Business Line is selected, each segment should represent a distinct operating segment based on differences in operating models or market dynamics. If Revenue Stream is selected, each segment should represent a distinct source of revenue within the company's operations. Apply the selected segmentation consistently throughout the relevant model schedules.",
    requiredResources: [],
  },
  {
    id: "A-011",
    title: "Segments & Measurement Units",
    category: "Segmentation and Categorization",
    step: "Workflow A – Step 1: Template Selection & Adaptation",
    status: "Active",
    lastUpdated: "2026-09-09",
    variables: [
      "{{segmentation_type}}",
      "{{segment_1}}",
      "{{segment_2}}",
      "{{segment_3}}",
      "{{other_segment}}",
      "{{units_sold_measurements}}",
      "{{capacity_measurements}}",
      "{{capacity_modeling_level}}",
    ],
    promptText:
      "Configure the model using the selected {{segmentation_type}} segments: {{segment_1}}, {{segment_2}}, {{segment_3}}, and {{other_segment}}, where selected.\n\nWhere Revenue or COGS uses Unit Economics, use the selected {{units_sold_measurements}} for Maximum Output and Units Sold (or equivalent) for each applicable segment. Maximum Output and Units Sold must always use the same measurement unit.\n\nWhere CapEx uses Unit Economics, use {{capacity_measurements}} as the applicable capacity measure. Capacity may use the same or a different measurement unit from Maximum Output / Units Sold.\n\nApply {{capacity_modeling_level}} when determining whether capacity should be modeled separately by revenue stream or at the aggregate company level.\n\nIf Revenues use Growth rate and COGS and CapEx are % of revenues, do not create operational measurement-unit schedules solely for forecasting purposes.\n\nDo not create segments that were not selected by the user.",
    requiredResources: [],
  },
  {
    id: "A-012",
    title: "COGS Segmentation",
    category: "Segmentation and Categorization",
    step: "Workflow A – Step 1: Template Selection & Adaptation",
    status: "Active",
    lastUpdated: "2026-09-09",
    variables: ["{{cogs_segmentation}}"],
    promptText:
      "Model COGS on a {{cogs_segmentation}} basis. If Segmented is selected, align COGS with the selected business lines or revenue streams wherever the source information permits. If Aggregate is selected, maintain COGS at the company level and do not create separate COGS schedules by segment.",
    requiredResources: [],
  },
  {
    id: "A-013",
    title: "CapEx Segmentation",
    category: "Segmentation and Categorization",
    step: "Workflow A – Step 1: Template Selection & Adaptation",
    status: "Active",
    lastUpdated: "2026-09-09",
    variables: ["{{capex_segmentation}}"],
    promptText:
      "Model CapEx on a {{capex_segmentation}} basis. If Segmented is selected, align CapEx with the selected business lines or revenue streams wherever applicable. If Aggregate is selected, maintain CapEx at the company level and do not create separate CapEx schedules by segment.",
    requiredResources: [],
  },
  {
    id: "A-014",
    title: "COGS Categories Combined under Other Direct Costs",
    category: "Segmentation and Categorization",
    step: "Workflow A – Step 1: Template Selection & Adaptation",
    status: "Active",
    lastUpdated: "2026-09-09",
    variables: ["{{cogs_categories_to_combine}}"],
    promptText:
      "Combine the following selected COGS categories under Other Direct Costs: {{cogs_categories_to_combine}}.\n\nKeep all unselected standard COGS categories separate. This is a reclassification only. Ensure Total COGS remains unchanged and preserve all historical, projection, subtotal, and downstream formula linkages.",
    requiredResources: [],
  },
  {
    id: "A-015",
    title: "Projection Horizon",
    category: "Other Modeling Considerations",
    step: "Workflow A – Step 1: Template Selection & Adaptation",
    status: "Active",
    lastUpdated: "2026-09-09",
    variables: ["{{projection_years}}"],
    promptText:
      "Configure the model for {{projection_years}} years of projections. Add or remove forecast-year columns as necessary while preserving formulas, dependencies, formatting, valuation calculations, terminal-value calculations, and references throughout the workbook. Ensure that no formulas or links are broken by the change in projection horizon.",
    requiredResources: ["res-dcf"],
  },
  {
    id: "A-016",
    title: "Working Capital Methodology",
    category: "Other Modeling Considerations",
    step: "Workflow A – Step 1: Template Selection & Adaptation",
    status: "Active",
    lastUpdated: "2026-09-09",
    variables: [
      "{{trade_receivables_basis}}",
      "{{contract_assets_basis}}",
      "{{inventories_basis}}",
      "{{prepayments_basis}}",
      "{{trade_payables_basis}}",
      "{{contract_liabilities_basis}}",
      "{{accrued_expenses_basis}}",
      "{{manual_days_inputs}}",
    ],
    promptText:
      "Forecast each working-capital line item using the historical basis selected by the user.\n\nApply the selected basis independently to Trade Receivables, Contract Assets, Inventories, Prepayments and Other Current Assets, Trade Payables, Contract Liabilities / Deferred Revenue, and Accrued Expenses and Other Operating Payables.\n\nWhere Manual Input is selected, use the corresponding value in {{manual_days_inputs}} instead of calculating a historical average.\n\nPreserve the appropriate revenue, COGS, or other denominator used by the standardized template for each working-capital calculation.",
    requiredResources: [],
  },
  {
    id: "A-017",
    title: "Number of Comparable Companies",
    category: "Other Modeling Considerations",
    step: "Workflow A – Step 1: Template Selection & Adaptation",
    status: "Active",
    lastUpdated: "2026-09-09",
    variables: ["{{number_of_comps}}"],
    promptText:
      "Configure the comparable-company section to accommodate {{number_of_comps}} comparable companies. Add or remove comparable-company rows as necessary while preserving formulas, summary statistics, valuation multiples, formatting, and downstream references.",
    requiredResources: [],
  },
  {
    id: "A-018",
    title: "IFC Share Classes & Preferred Share Rights",
    category: "Other Modeling Considerations",
    step: "Workflow A – Step 1: Template Selection & Adaptation",
    status: "Active",
    lastUpdated: "2026-09-09",
    variables: ["{{ifc_share_type}}", "{{preferred_share_rights}}"],
    promptText:
      "Reflect IFC's investment as {{ifc_share_type}}.\n\nIf Common Shares Only is selected, use the common-equity valuation methodology.\n\nIf Preferred Shares Only or Both is selected, incorporate the preferred-share rights described in {{preferred_share_rights}}, including any liquidation preference, dividend rights, conversion rights, participation features, or other economically relevant provisions.\n\nDo not assume preferred-share rights that are not stated in the questionnaire or supporting documents.",
    requiredResources: [],
  },
  {
    id: "A-019",
    title: "Liquidity Put",
    category: "Other Modeling Considerations",
    step: "Workflow A – Step 1: Template Selection & Adaptation",
    status: "Active",
    lastUpdated: "2026-09-09",
    variables: ["{{liquidity_put}}", "{{put_price_mechanisms}}"],
    promptText:
      "The response to whether IFC has a liquidity put is {{liquidity_put}}.\n\nIf No, do not include a liquidity-put valuation.\n\nIf Yes, incorporate the selected put-price mechanisms in {{put_price_mechanisms}}.\n\nExtract detailed contractual terms from the supporting documentation where available, including the counterparty, exercise dates, IRR requirements, multiples, fixed prices, fair-value provisions, caps, floors, and other relevant terms.\n\nWhere multiple pricing mechanisms apply, determine from the supporting documentation whether the contractual put price uses the maximum, minimum, combination, or another relationship between those mechanisms.\n\nDo not infer missing contractual terms. If required information cannot be identified, return \"Data not found.\"",
    requiredResources: ["res-put"],
  },
  // --- Workflow A, Step 2 and Step 3 -------------------------------------
  {
    id: "A-020",
    title: "Extract historical financial statements",
    category: "Document Upload",
    step: "Workflow A – Step 2: Document Upload",
    status: "Active",
    lastUpdated: "2026-08-30",
    variables: [],
    promptText:
      "From the uploaded audited financial statements, extract the income statement, balance sheet and cash flow statement for every available historical year. Return a strict JSON object keyed by statement, then line item, then fiscal year. Preserve the reporting currency and units as stated in the source document." +
      NO_GUESSING,
    requiredResources: [],
  },
  {
    id: "A-021",
    title: "Extract operational drivers by segment",
    category: "Document Upload",
    step: "Workflow A – Step 2: Document Upload",
    status: "Active",
    lastUpdated: "2026-08-30",
    variables: [],
    promptText:
      "From the uploaded operational reports, extract volume and price drivers, revenue, COGS and CapEx by segment for each historical year, plus the COGS breakdown by standard category. Return strict JSON and cite the page or sheet for each figure." +
      NO_GUESSING,
    requiredResources: [],
  },
  {
    id: "A-022",
    title: "Populate standardized template and flag gaps",
    category: "Model Generation",
    step: "Workflow A – Step 3: Model Generation",
    status: "Active",
    lastUpdated: "2026-09-02",
    variables: [],
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
  "Template Selection",
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
  "Workflow A – Step 1: Template Selection & Adaptation",
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

export function recommendedMeasurements(input: {
  sector?: string;
  businessModel?: string;
}): { capacity: string; output: string } {
  // The selected sector template defines the default measurement units.
  const bySector = input.sector ? SECTOR_MEASUREMENTS[input.sector] : undefined;
  if (bySector) return bySector;
  // Keywords in the business description are a fallback only, used when the
  // selected template does not define its own units.
  const text = `${input.businessModel ?? ""}`;
  const keyword = KEYWORD_MEASUREMENTS.find((entry) => entry.match.test(text));
  if (keyword) return { capacity: keyword.capacity, output: keyword.output };
  return { capacity: "Units", output: "Units" };
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
