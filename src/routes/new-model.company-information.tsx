import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Lightbulb } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { AppHeader } from "@/components/AppHeader";
import { Button, ButtonLink } from "@/components/Button";
import { SidePanel } from "@/components/SidePanel";
import { StepProgress } from "@/components/StepProgress";
import {
  CheckItem,
  Collapsible,
  OptionRow,
  PageHeading,
  Question,
  SegmentedToggleRow,
  SelectField,
  TextField,
} from "@/components/form";
import {
  COGS_CATEGORIES,
  COUNTRIES,
  CURRENCIES,
  defaultCurrencyForCountry,
  OTHER_MEASUREMENT,
  PUT_PRICE_MECHANISMS,
  recommendedMeasurements,
  SAME_AS_OUTPUT_MEASUREMENT,
  SECTORS,
  SUBSECTORS,
  WORKING_CAPITAL_ASSETS,
  MANUAL_WORKING_CAPITAL_BASIS,
  WORKING_CAPITAL_BASIS_OPTIONS,
  WORKING_CAPITAL_LIABILITIES,
} from "@/lib/data";
import {
  useApp,
  type SegmentMeasurement,
  type WorkingCapitalDays,
} from "@/lib/store";

export const WORKFLOW_A_STEPS = [
  "Template Selection & Adaptation",
  "Upload Company Information",
  "Generate Standardized Model",
];

export const Route = createFileRoute("/new-model/company-information")({
  head: () => ({
    meta: [
      { title: "Template Selection & Adaptation — Real Sector – Equity Valuation Model Assistant" },
      {
        name: "description",
        content:
          "Step 1 of 3: answer the company, Revenue/COGS/CapEx adaptations and valuation questions used to identify and customize the standardized DCF template.",
      },
      { property: "og:title", content: "Template Selection & Adaptation — Real Sector – Equity Valuation Model Assistant" },
      {
        property: "og:description",
        content: "Step 1 of 3 of the standardized DCF template workflow.",
      },
    ],
  }),
  component: CompanyInformation,
});

function CompanyInformation() {
  const { state, setAnswer, toggleAnswerItem, saveProgress } = useApp();
  const a = state.answers;
  const navigate = useNavigate();
  const [showSegmentationNote, setShowSegmentationNote] = useState(false);

  // Normalize stale saved answers after the segmentation values changed.
  useEffect(() => {
    const normalize = (
      key: "cogsBasis" | "capexBasis",
      value: Record<string, string>,
    ) => {
      let changed = false;
      const next: Record<string, "business_line" | "revenue_stream"> = {};
      for (const lineId of a.selectedSegments) {
        // COGS / CapEx segmentation only applies in multi-stream mode.
        if (a.lineStreamMode[lineId] !== "multi") continue;
        const current = value[lineId];
        if (current === "business_line" || current === "revenue_stream") {
          // "By revenue stream" only applies to a single business line setup.
          next[lineId] =
            a.selectedSegments.length > 1 && current === "revenue_stream"
              ? "business_line"
              : current;
          if (next[lineId] !== current) changed = true;
        } else if (current !== undefined) {
          changed = true;
        } else {
          // Default to business-line segmentation when first entering multi-stream mode.
          next[lineId] = "business_line";
          changed = true;
        }
      }
      if (changed || Object.keys(value).some((lineId) => !a.selectedSegments.includes(lineId))) {
        setAnswer(key, next);
      }
    };
    normalize("cogsBasis", a.cogsBasis);
    normalize("capexBasis", a.capexBasis);
  }, [a.cogsBasis, a.capexBasis, a.selectedSegments, a.lineStreamMode, setAnswer]);

  // Clear country fields that are no longer relevant when the country count changes.
  useEffect(() => {
    if (!a.countryCount) return;
    if (a.countryCount === "1" && (a.secondCountry || a.thirdCountry)) {
      setAnswer("secondCountry", "");
      setAnswer("secondCountryCurrency", "");
      setAnswer("thirdCountry", "");
      setAnswer("thirdCountryCurrency", "");
    } else if (a.countryCount === "2" && a.thirdCountry) {
      setAnswer("thirdCountry", "");
      setAnswer("thirdCountryCurrency", "");
    }
  }, [a.countryCount, a.secondCountry, a.thirdCountry, setAnswer]);

  const segmentOptions = [
    { value: "segment1", label: "Business Line 1" },
    { value: "segment2", label: "Business Line 2" },
    { value: "segment3", label: "Business Line 3" },
    { value: "other", label: "Other Business Line" },
  ];
  const revenueStreamOptions = [
    { value: "stream1", label: "Revenue Stream 1" },
    { value: "stream2", label: "Revenue Stream 2" },
    { value: "stream3", label: "Revenue Stream 3" },
    { value: "other", label: "Other" },
  ];


  const customYearsNum = a.projectionYears === "custom" ? Number(a.customYears) : NaN;
  const customYearsError =
    a.projectionYears === "custom" && !Number.isNaN(customYearsNum) && customYearsNum < 10
      ? "When selecting More than 10 years, please enter a value of 10 or greater."
      : undefined;

  const canContinue =
    a.sector &&
    a.subsector &&
    a.countryCount &&
    a.mainCountry.trim() &&
    ((a.countryCount !== "2" && a.countryCount !== "3" && a.countryCount !== "more") ||
      a.secondCountry.trim()) &&
    ((a.countryCount !== "3" && a.countryCount !== "more") || a.thirdCountry.trim()) &&
    a.reportingCurrency &&
    a.selectedSegments
      .filter((lineId) => a.lineStreamMode[lineId] === "multi")
      .every((lineId) => a.cogsBasis[lineId]) &&
    a.selectedSegments
      .filter((lineId) => a.lineStreamMode[lineId] === "multi")
      .every((lineId) => a.capexBasis[lineId]) &&
    a.projectionYears &&
    (a.projectionYears !== "custom" || a.customYears.trim()) &&
    !customYearsError &&
    a.shareClasses &&
    a.liquidityPut &&
    (a.liquidityPut !== "yes" || a.putMechanisms.length > 0) &&
    (a.selectedSegments.length <= 1 || a.businessLineModeling !== "");

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <StepProgress steps={WORKFLOW_A_STEPS} current={1} />

      <main className="mx-auto max-w-7xl px-5 py-10">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div>
            <PageHeading
              step="Step 1 of 3"
              title="Template Selection & Adaptation"
              intro="Please answer the following questions to help us identify and customize the most appropriate valuation template for your company."
            />

            <div className="space-y-4">
              <Collapsible title="A. Template Selection" defaultOpen>
                <Question number={1} label="Select Primary Sector" required>
                  <SelectField
                    value={a.sector}
                    onChange={(value) => {
                      setAnswer("sector", value);
                      setAnswer("subsector", "");
                    }}
                    options={SECTORS}
                    placeholder="Select a sector"
                  />
                </Question>

                {a.sector && (
                  <Question number={2} label="Select Subsector Template" required>
                    <SelectField
                      value={a.subsector}
                      onChange={(value) => {
                        setAnswer("subsector", value);
                        // Reset per-segment measurement defaults so they reflect the
                        // newly selected subsector template.
                        setAnswer("segmentMeasurements", {});
                      }}
                      options={[
                        ...(SUBSECTORS[a.sector] ?? []),
                        "Generic - Unit Economics",
                        "Generic - Percentage Based",
                      ]}
                      placeholder="Select a subsector template"
                    />
                  </Question>
                )}
              </Collapsible>

              <Collapsible title="B. Revenue, COGS, and CapEx Adaptations">
                <Question
                  number={1}
                  label="Select the business lines and the revenue streams within each business line to include in the model:"
                  labelAction={
                    <button
                      type="button"
                      onClick={() => setShowSegmentationNote((v) => !v)}
                      aria-expanded={showSegmentationNote}
                      aria-label={showSegmentationNote ? "Hide segmentation guidance" : "Show segmentation guidance"}
                      className="mt-0.5 shrink-0 rounded-lg p-1 text-warning transition-colors hover:bg-warning-soft"
                    >
                      <Lightbulb className="size-4" />
                    </button>
                  }
                >
                  <SegmentMatrix
                    segmentOptions={segmentOptions}
                    revenueStreamOptions={revenueStreamOptions}
                    footer={
                      showSegmentationNote && (
                        <p className="rounded-lg border border-warning/30 bg-warning-soft p-3 text-[13px] text-navy-soft">
                          A business line reflects how a company's operations are divided into
                          distinct operating segments based on differences in operating models and
                          market dynamics, while a revenue stream is a specific way the company
                          generates revenue within a business line. A business line may include
                          multiple revenue streams (up to four, including Other). Different business
                          lines typically have different measures of Units Sold and operating
                          capacity.
                        </p>
                      )
                    }
                  />
                </Question>

                <Question
                  number={2}
                  label="Which standard COGS categories should be included?"
                  hint="Select all COGS categories that should appear in the model. Choosing Aggregate all categories will combine all standard categories into a single aggregate line."
                >
                  <div className="grid gap-3 sm:grid-cols-2">
                    {["Aggregate all categories", ...COGS_CATEGORIES, "Other Costs"].map(
                      (category) => {
                        const aggregate = category === "Aggregate all categories";
                        const disabled =
                          a.otherDirectCosts.includes("Aggregate all categories") && !aggregate;
                        return (
                          <CheckItem
                            key={category}
                            label={category}
                            description={
                              aggregate
                                ? "Combine all standard categories into a single line"
                                : category === "Other Costs"
                                  ? "Add a custom other-costs line"
                                  : undefined
                            }
                            checked={a.otherDirectCosts.includes(category)}
                            disabled={disabled}
                            onChange={(checked) => {
                              if (aggregate) {
                                setAnswer("otherDirectCosts", checked ? [category] : []);
                              } else if (!disabled) {
                                toggleAnswerItem("otherDirectCosts", category);
                              }
                            }}
                          />
                        );
                      },
                    )}
                  </div>
                </Question>
              </Collapsible>

              <Collapsible title="C. FX Adaptations">
                <Question number={1} label="How many countries does the company operate in?" required>
                  <OptionRow
                    value={a.countryCount}
                    onChange={(value) =>
                      setAnswer("countryCount", value as typeof a.countryCount)
                    }
                    options={[
                      { value: "1", label: "1" },
                      { value: "2", label: "2" },
                      { value: "3", label: "3" },
                      { value: "more", label: "More than 3" },
                    ]}
                  />
                  {a.countryCount === "1" && (
                    <div className="mt-6">
                      <Question
                        label="Does the company have material revenues, costs, or investments in foreign currencies due to import/export activities?"
                        hint="For simplicity, we assume the foreign currency is USD. This choice is disabled when the company operates in more than one country."
                      >
                        <OptionRow
                          value={a.hasForeignCurrency}
                          onChange={(value) =>
                            setAnswer("hasForeignCurrency", value as typeof a.hasForeignCurrency)
                          }
                          options={[
                            { value: "yes", label: "Yes" },
                            { value: "no", label: "No" },
                          ]}
                        />
                      </Question>
                    </div>
                  )}
                </Question>

                {a.countryCount && (
                  <Question
                    number={2}
                    label={`Select the main countries in which the company operates (${
                      a.countryCount === "more" ? "list the top 3" : `list up to ${a.countryCount} name${a.countryCount === "1" ? "" : "s"}`
                    }).`}
                    required
                  >
                    <div className="grid gap-3 sm:grid-cols-[1fr_220px]">
                      <SelectField
                        label="Main country"
                        value={a.mainCountry}
                        onChange={(value) => {
                          setAnswer("mainCountry", value);
                          setAnswer("mainCountryCurrency", defaultCurrencyForCountry(value) ?? "");
                        }}
                        options={COUNTRIES}
                        placeholder="Select country"
                      />
                      <CurrencyDisplay label="Currency" value={a.mainCountryCurrency} />
                    </div>
                    {a.countryCount !== "1" && (
                      <div className="grid gap-3 sm:grid-cols-[1fr_220px]">
                        <SelectField
                          label="Second country"
                          value={a.secondCountry}
                          onChange={(value) => {
                            setAnswer("secondCountry", value);
                            setAnswer("secondCountryCurrency", defaultCurrencyForCountry(value) ?? "");
                          }}
                          options={COUNTRIES}
                          placeholder="Select country"
                        />
                        <CurrencyDisplay label="Currency" value={a.secondCountryCurrency} />
                      </div>
                    )}
                    {(a.countryCount === "3" || a.countryCount === "more") && (
                      <div className="grid gap-3 sm:grid-cols-[1fr_220px]">
                        <SelectField
                          label="Third country"
                          value={a.thirdCountry}
                          onChange={(value) => {
                            setAnswer("thirdCountry", value);
                            setAnswer("thirdCountryCurrency", defaultCurrencyForCountry(value) ?? "");
                          }}
                          options={COUNTRIES}
                          placeholder="Select country"
                        />
                        <CurrencyDisplay label="Currency" value={a.thirdCountryCurrency} />
                      </div>
                    )}
                    {a.countryCount === "more" && (
                      <p className="text-[13px] text-muted-foreground">
                        For simplicity, additional countries will be grouped into a single category and will use the FX rate of the main country of operations.
                      </p>
                    )}
                  </Question>
                )}

                <Question number={3} label="What is the company's reporting currency?" required>
                  <SelectField
                    value={a.reportingCurrency}
                    onChange={(value) => setAnswer("reportingCurrency", value)}
                    options={CURRENCIES}
                    placeholder="Select currency"
                  />
                </Question>
              </Collapsible>

              <Collapsible title="D. Other Modeling Considerations">
                {a.selectedSegments.length > 1 && (
                  <Question
                    number={1}
                    label="How should the company's different business lines be modeled?"
                    required
                  >
                    <OptionRow
                      value={a.businessLineModeling}
                      onChange={(value) =>
                        setAnswer("businessLineModeling", value as typeof a.businessLineModeling)
                      }
                      options={[
                        { value: "consolidated", label: "Consolidated Cash Flow" },
                        { value: "sotp", label: "Sum-of-the-Parts (SOTP)" },
                      ]}
                    />
                  </Question>
                )}

                <Question number={2} label="How many years of projections do you need?" required>
                  <OptionRow
                    columns={3}
                    value={a.projectionYears}
                    onChange={(value) =>
                      setAnswer("projectionYears", value as typeof a.projectionYears)
                    }
                    options={[
                      { value: "5", label: "5 years" },
                      { value: "10", label: "10 years" },
                      { value: "custom", label: "More than 10 years" },
                    ]}
                  />
                  {a.projectionYears === "custom" && (
                    <TextField
                      label="Enter number of years"
                      value={a.customYears}
                      onChange={(value) => setAnswer("customYears", value.replace(/\D/g, ""))}
                      placeholder="e.g. 15"
                      error={!!customYearsError}
                      errorMessage={customYearsError}
                    />
                  )}
                </Question>

                <Question
                  number={3}
                  label="Working capital — how should days be modeled for each line item?"
                  hint="Select the historical basis used to derive days for each working capital item, or choose Manual input to enter the number of days directly."
                >
                  <div className="space-y-4">
                    <WorkingCapitalGroup title="Assets" items={WORKING_CAPITAL_ASSETS} />
                    <WorkingCapitalGroup title="Liabilities" items={WORKING_CAPITAL_LIABILITIES} />
                  </div>
                </Question>

                <Question
                  number={4}
                  label="How many comparable companies (comps) does the company have?"
                >
                  <TextField
                    value={a.compsCount}
                    onChange={(value) => setAnswer("compsCount", value.replace(/\D/g, ""))}
                    placeholder="Enter number of comps"
                  />
                </Question>

                <Question
                  number={5}
                  label="Does IFC have common shares or preferred shares?"
                  required
                >
                  <OptionRow
                    columns={3}
                    value={a.shareClasses}
                    onChange={(value) => setAnswer("shareClasses", value as typeof a.shareClasses)}
                    options={[
                      { value: "common", label: "Common shares only" },
                      { value: "preferred", label: "Preferred shares only" },
                      { value: "both", label: "Both common and preferred" },
                    ]}
                  />
                  {(a.shareClasses === "preferred" || a.shareClasses === "both") && (
                    <div className="mt-4">
                      <TextField
                        label="Describe the rights of the preferred shares"
                        value={a.preferredShareRights}
                        onChange={(value) => setAnswer("preferredShareRights", value)}
                        placeholder="e.g., liquidation preference, dividend rights, conversion terms"
                      />
                    </div>
                  )}
                </Question>

                <Question number={6} label="Does the company have a liquidity put?" required>
                  <OptionRow
                    value={a.liquidityPut}
                    onChange={(value) => setAnswer("liquidityPut", value as typeof a.liquidityPut)}
                    options={[
                      { value: "yes", label: "Yes" },
                      { value: "no", label: "No" },
                    ]}
                  />
                  {a.liquidityPut === "yes" && (
                    <div className="mt-4 rounded-xl border border-panel-border bg-panel/60 p-4">
                      <p className="text-[15px] font-semibold text-navy">
                        How is the put price determined? Select all that apply.
                      </p>
                      <p className="mt-1 text-[13px] text-muted-foreground">
                        The put price may use the maximum or a combination of several mechanisms.
                      </p>
                      <div className="mt-3 grid gap-3 sm:grid-cols-2">
                        {PUT_PRICE_MECHANISMS.map((mechanism) => (
                          <CheckItem
                            key={mechanism}
                            label={mechanism}
                            checked={a.putMechanisms.includes(mechanism)}
                            onChange={() => toggleAnswerItem("putMechanisms", mechanism)}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </Question>
              </Collapsible>
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
              <ButtonLink to="/" variant="secondary">
                <ArrowLeft className="size-4" />
                Back
              </ButtonLink>
              <div className="flex gap-3">
                <Button variant="ghost" onClick={saveProgress}>
                  Save &amp; Exit
                </Button>
                <Button
                  disabled={!canContinue}
                  onClick={() => {
                    saveProgress();
                    navigate({ to: "/new-model/upload" });
                  }}
                >
                  Save &amp; Continue
                  <ArrowRight className="size-4" />
                </Button>
              </div>
            </div>
            {!canContinue && (
              <p className="mt-2 text-right text-sm text-muted-foreground">
                Complete all required fields to continue.
              </p>
            )}
          </div>

          <SidePanel
            about="These questions help us understand your company and select the most appropriate valuation template. The information you provide will be used to customize and populate the template in the next steps."
            tips={[
              "Answer all questions to the best of your knowledge.",
              "You can modify your answers later if needed.",
              "Fields marked with * are required.",
              "Refer to the Guidelines for more detail on segmentation, COGS categories and CapEx modeling.",
            ]}
          />
        </div>
      </main>
    </div>
  );
}

function CurrencyDisplay({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label className="mb-1.5 block text-[13px] font-medium text-navy/80">{label}</label>
      <div className="flex h-11 items-center rounded-lg border border-panel-border bg-panel/40 px-3 text-[15px] text-navy">
        {value ? (
          <span>{value}</span>
        ) : (
          <span className="text-muted-foreground">Currency will appear here</span>
        )}
      </div>
    </div>
  );
}

/**
 * Measurement units for one segment's operational drivers. Defaults are
 * recommended from the selected sector template, and the user can override
 * them or enter a custom unit.
 */
function SegmentMeasurements({
  segmentId,
  segmentLabel,
  hideHeader = false,
}: {
  segmentId: string;
  segmentLabel: string;
  hideHeader?: boolean;
}) {
  const { state, setAnswer } = useApp();
  const a = state.answers;
  const saved = a.segmentMeasurements[segmentId];

  const recommended = recommendedMeasurements({
    sector: a.sector,
    subsector: a.subsector,
    businessModel: a.businessModel,
  });

  const current: SegmentMeasurement = {
    capacity: saved?.capacity || recommended.capacity,
    capacityOther: saved?.capacityOther ?? "",
    output: saved?.output || recommended.output,
    outputOther: saved?.outputOther ?? "",
    capacityBasis: saved?.capacityBasis ?? "",
  };

  const update = (partial: Partial<SegmentMeasurement>) => {
    setAnswer("segmentMeasurements", {
      ...a.segmentMeasurements,
      [segmentId]: { ...current, ...partial },
    });
  };

  // The selected subsector/template determines whether the model uses unit
  // economics or a percentage-based approach. Percentage-based templates do not
  // need operational measurement units.
  const isPercentageBased = a.subsector === "Generic - Percentage Based";
  const needsOutputUnit = !isPercentageBased;
  const needsCapacityUnit = !isPercentageBased;
  const needsAnyUnit = needsOutputUnit || needsCapacityUnit;
  const [showUnitNote, setShowUnitNote] = useState(false);
  const isFirstSegment = segmentId === "segment1";

  // Business Line 1 cannot use a custom measurement.
  const outputValue =
    isFirstSegment && current.output === OTHER_MEASUREMENT
      ? recommended.output
      : current.output;

  return (
    <div className="mt-2 rounded-xl border border-panel-border bg-panel/60 p-4">
      {!hideHeader && (
        <p className="text-[15px] font-semibold text-navy">
          {segmentLabel}
          {needsAnyUnit ? " — measurement units" : " — segment detail"}
        </p>
      )}
      {!needsAnyUnit && (
        <p className="mt-1 text-[13px] text-muted-foreground">
          Based on the selected template, revenue, COGS and CapEx are modeled on a percentage
          basis, so no measurement units are required for this segment.
        </p>
      )}

      {needsAnyUnit && (
        <div
          className={`mt-3 grid gap-3 ${
            needsOutputUnit && needsCapacityUnit ? "sm:grid-cols-2" : ""
          }`}
        >
          {needsOutputUnit && (
            <div>
              <SelectField
                label="Maximum Output / Units Sold measurement"
                labelAction={
                  <button
                    type="button"
                    onClick={(event) => {
                      event.preventDefault();
                      setShowUnitNote((v) => !v);
                    }}
                    aria-expanded={showUnitNote}
                    aria-label={showUnitNote ? "Hide measurement guidance" : "Show measurement guidance"}
                    className="rounded-lg p-1 text-warning transition-colors hover:bg-warning-soft"
                  >
                    <Lightbulb className="size-4" />
                  </button>
                }
                value={outputValue}
                onChange={(value) =>
                  update({ output: isFirstSegment && value === OTHER_MEASUREMENT ? recommended.output : value })
                }
                // The sector/template defines the default unit; the user can
                // keep it or pick "Other" to enter a custom measurement.
                options={[
                  ...new Set(
                    [outputValue, recommended.output, ...(isFirstSegment ? [] : [OTHER_MEASUREMENT])].filter(
                      Boolean,
                    ),
                  ),
                ]}
              />
              {!isFirstSegment && current.output === OTHER_MEASUREMENT && (
                <div className="mt-2">
                  <TextField
                    value={current.outputOther}
                    onChange={(value) => update({ outputOther: value })}
                    placeholder="Enter output / units sold measurement"
                  />
                </div>
              )}
            </div>
          )}
          {needsCapacityUnit && (
            <div>
              <SelectField
                label="Capacity measurement"
                value={current.capacity}
                onChange={(value) => update({ capacity: value })}
                options={[
                  ...new Set(
                    [current.capacity, ...recommended.capacityOptions].filter(Boolean),
                  ),
                ]}
              />
              {current.capacity === OTHER_MEASUREMENT && (
                <div className="mt-2">
                  <TextField
                    value={current.capacityOther}
                    onChange={(value) => update({ capacityOther: value })}
                    placeholder="Enter capacity measurement"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      )}


      {needsAnyUnit && showUnitNote && (
        <p className="mt-4 rounded-lg border border-warning/30 bg-warning-soft p-3 text-[13px] text-navy-soft">
          Recommended units are pre-selected. Maximum Output and Units Sold (or equivalent)
          always use the same unit of measurement, while Capacity may be expressed in either
          the same or a different unit. Maximum Output represents the maximum quantity of
          products that can be sold, excluding sales from inventory, or the maximum volume of
          services or operational activity that can be delivered in a particular year.
        </p>
      )}
    </div>
  );
}

/**
 * Days basis selection for a group of working capital line items (assets or
 * liabilities). Each item can use a historical average or a manual day count.
 */
function WorkingCapitalGroup({ title, items }: { title: string; items: string[] }) {
  const { state, setAnswer } = useApp();
  const a = state.answers;

  const update = (item: string, partial: Partial<WorkingCapitalDays>) => {
    const current: WorkingCapitalDays =
      a.workingCapitalDays[item] ?? { basis: "", manualDays: "" };
    setAnswer("workingCapitalDays", {
      ...a.workingCapitalDays,
      [item]: { ...current, ...partial },
    });
  };

  return (
    <div className="rounded-xl border border-panel-border bg-panel/60 p-4">
      <p className="text-[15px] font-semibold text-navy">{title}</p>
      <div className="mt-3 space-y-3">
        {items.map((item) => {
          const current = a.workingCapitalDays[item] ?? { basis: "", manualDays: "" };
          return (
            <div
              key={item}
              className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"
            >
              <p className="w-full pt-2 text-[15px] font-medium text-navy sm:w-1/2 lg:w-5/12">
                {item}
              </p>
              <div className="flex w-full flex-col gap-2 sm:w-1/2 lg:w-7/12">
                <SelectField
                  value={current.basis}
                  onChange={(value) => update(item, { basis: value })}
                  options={WORKING_CAPITAL_BASIS_OPTIONS}
                  placeholder="Select basis"
                />
                {current.basis === MANUAL_WORKING_CAPITAL_BASIS && (
                  <TextField
                    value={current.manualDays}
                    onChange={(value) =>
                      update(item, { manualDays: value.replace(/\D/g, "") })
                    }
                    placeholder="Enter number of days"
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Business line / revenue stream selection matrix. Rows are business lines
 * (up to four, including "Other") and columns are the revenue streams inside
 * each business line (up to four, including "Other"). Selecting any revenue
 * stream automatically activates its business line, and measurement units are
 * collected for every activated business line.
 */
function SegmentMatrix({
  segmentOptions,
  revenueStreamOptions,
  footer,
}: {
  segmentOptions: { value: string; label: string }[];
  revenueStreamOptions: { value: string; label: string }[];
  footer?: ReactNode;
}) {
  const { state, setAnswer } = useApp();
  const a = state.answers;

  const toggleLine = (lineId: string) => {
    // Business Line 1 is always selected.
    if (lineId === "segment1") return;
    const isSelected = a.selectedSegments.includes(lineId);
    setAnswer(
      "selectedSegments",
      isSelected
        ? a.selectedSegments.filter((item) => item !== lineId)
        : [...a.selectedSegments, lineId],
    );
    if (isSelected) {
      const next = { ...a.revenueStreams };
      delete next[lineId];
      setAnswer("revenueStreams", next);
      const modes = { ...a.lineStreamMode };
      delete modes[lineId];
      setAnswer("lineStreamMode", modes);
    }
  };

  const setMode = (lineId: string, mode: "single" | "multi") => {
    setAnswer("lineStreamMode", { ...a.lineStreamMode, [lineId]: mode });
    if (mode === "single") {
      const nextStreams = { ...a.revenueStreams };
      delete nextStreams[lineId];
      setAnswer("revenueStreams", nextStreams);
      // COGS / CapEx segmentation is hidden in single-stream mode.
      const nextCogs = { ...a.cogsBasis };
      delete nextCogs[lineId];
      setAnswer("cogsBasis", nextCogs);
      const nextCapex = { ...a.capexBasis };
      delete nextCapex[lineId];
      setAnswer("capexBasis", nextCapex);
    } else {
      const current = a.revenueStreams[lineId] ?? [];
      if (current.length === 0) {
        // Multi-Stream defaults to Revenue Stream 1 and Revenue Stream 2.
        setAnswer("revenueStreams", { ...a.revenueStreams, [lineId]: ["stream1", "stream2"] });
      } else if (lineId === "segment1" && !current.includes("stream2")) {
        // Business Line 1 always includes Revenue Stream 1 and 2 in Multi-Stream mode.
        setAnswer("revenueStreams", { ...a.revenueStreams, [lineId]: [...current, "stream2"] });
      }
      // Default COGS / CapEx segmentation to By business line when entering multi-stream mode.
      if (!a.cogsBasis[lineId]) {
        setAnswer("cogsBasis", { ...a.cogsBasis, [lineId]: "business_line" });
      }
      if (!a.capexBasis[lineId]) {
        setAnswer("capexBasis", { ...a.capexBasis, [lineId]: "business_line" });
      }
    }
  };

  const toggleStream = (lineId: string, streamId: string) => {
    // Revenue Stream 1 under Business Line 1 is always selected.
    if (lineId === "segment1" && streamId === "stream1") return;
    const current = a.revenueStreams[lineId] ?? [];
    const next = current.includes(streamId)
      ? current.filter((item) => item !== streamId)
      : [...current, streamId];
    setAnswer("revenueStreams", { ...a.revenueStreams, [lineId]: next });
    if (next.length > 0 && !a.selectedSegments.includes(lineId)) {
      setAnswer("selectedSegments", [...a.selectedSegments, lineId]);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-card p-4 shadow-card">
        {footer && <div className="mb-4">{footer}</div>}
        <div className="space-y-3">
          {segmentOptions.map((line) => {
            const lineSelected = a.selectedSegments.includes(line.value);
            const mode = a.lineStreamMode[line.value] ?? "single";
            const streams = a.revenueStreams[line.value] ?? [];
            return (
              <div
                key={line.value}
                className="rounded-lg border border-panel-border bg-panel/40 p-3"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    type="button"
                    onClick={() => toggleLine(line.value)}
                    aria-pressed={lineSelected}
                    className={[
                      "flex items-center gap-2.5 rounded-lg border px-3 py-2.5 text-left text-[15px] transition-colors sm:w-64",
                      lineSelected
                        ? "border-primary bg-panel text-navy"
                        : "border-border bg-card text-navy-soft hover:border-primary/50 hover:bg-secondary/60",
                    ].join(" ")}
                  >
                    <span
                      className={[
                        "flex size-4.5 shrink-0 items-center justify-center rounded border-2 text-primary-foreground",
                        lineSelected ? "border-primary bg-primary" : "border-input",
                      ].join(" ")}
                    >
                      {lineSelected && (
                        <svg
                          viewBox="0 0 12 12"
                          className="size-3"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.2"
                        >
                          <path d="M2 6.5 4.6 9 10 3.4" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </span>
                    {line.label}
                  </button>

                  <div className="flex gap-2">
                    {(
                      [
                        { value: "single", label: "Single Revenue Stream" },
                        { value: "multi", label: "Multi Stream" },
                      ] as const
                    ).map((option) => {
                      const active = lineSelected && mode === option.value;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          disabled={!lineSelected}
                          onClick={() => setMode(line.value, option.value)}
                          aria-pressed={active}
                          className={[
                            "rounded-lg border px-3 py-2 text-[14px] font-medium transition-colors",
                            active
                              ? "border-primary bg-primary/10 text-navy"
                              : "border-border bg-card text-navy-soft hover:border-primary/50 hover:bg-secondary/60",
                            !lineSelected && "cursor-not-allowed opacity-50 hover:border-border hover:bg-card",
                          ].join(" ")}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {lineSelected && mode === "multi" && (
                  <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {revenueStreamOptions.map((stream) => {
                      const active = streams.includes(stream.value);
                      return (
                        <button
                          key={stream.value}
                          type="button"
                          onClick={() => toggleStream(line.value, stream.value)}
                          aria-pressed={active}
                          className={[
                            "flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-[14px] transition-colors",
                            active
                              ? "border-primary bg-primary/10 text-navy"
                              : "border-border bg-card text-navy-soft hover:border-primary/50 hover:bg-secondary/60",
                          ].join(" ")}
                        >
                          <span
                            className={[
                              "flex size-4.5 shrink-0 items-center justify-center rounded border-2 text-primary-foreground",
                              active ? "border-primary bg-primary" : "border-input",
                            ].join(" ")}
                          >
                            {active && (
                              <svg
                                viewBox="0 0 12 12"
                                className="size-3"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.2"
                              >
                                <path
                                  d="M2 6.5 4.6 9 10 3.4"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            )}
                          </span>
                          {stream.label}
                        </button>
                      );
                    })}
                  </div>
                )}

                {lineSelected && (
                  <SegmentMeasurements
                    segmentId={line.value}
                    segmentLabel={line.label}
                    hideHeader
                  />
                )}

                {lineSelected && mode === "multi" && (
                  <div className="mt-3 space-y-3 rounded-lg border border-panel-border bg-card p-3">
                    <p className="text-[13px] font-medium text-navy-soft">
                      How do you want COGS and CapEx to be segmented?
                    </p>
                    <SegmentedToggleRow
                      label="COGS"
                      value={a.cogsBasis[line.value] ?? ""}
                      onChange={(value) =>
                        setAnswer("cogsBasis", {
                          ...a.cogsBasis,
                          [line.value]: value as "business_line" | "revenue_stream",
                        })
                      }
                      disabledOptions={
                        a.selectedSegments.length > 1 ? ["revenue_stream"] : []
                      }
                      options={[
                        { value: "business_line", label: "By business line" },
                        { value: "revenue_stream", label: "By revenue stream" },
                      ]}
                    />
                    <SegmentedToggleRow
                      label="CapEx"
                      value={a.capexBasis[line.value] ?? ""}
                      onChange={(value) =>
                        setAnswer("capexBasis", {
                          ...a.capexBasis,
                          [line.value]: value as "business_line" | "revenue_stream",
                        })
                      }
                      disabledOptions={
                        a.selectedSegments.length > 1 ? ["revenue_stream"] : []
                      }
                      options={[
                        { value: "business_line", label: "By business line" },
                        { value: "revenue_stream", label: "By revenue stream" },
                      ]}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
