import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight } from "lucide-react";
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
  SelectField,
  TextField,
} from "@/components/form";
import {
  COGS_CATEGORIES,
  CURRENCIES,
  defaultCurrencyForCountry,
  PUT_PRICE_MECHANISMS,
  SECTORS,
} from "@/lib/data";
import { useApp } from "@/lib/store";

export const WORKFLOW_A_STEPS = [
  "Company Information",
  "Upload Company Information",
  "Generate Standardized Model",
];

export const Route = createFileRoute("/new-model/company-information")({
  head: () => ({
    meta: [
      { title: "Company Information — IFC Valuation Assistant" },
      {
        name: "description",
        content:
          "Step 1 of 3: answer the company, segmentation and valuation questions used to identify and customize the standardized DCF template.",
      },
      { property: "og:title", content: "Company Information — IFC Valuation Assistant" },
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

  const customYearsNum = a.projectionYears === "custom" ? Number(a.customYears) : NaN;
  const customYearsError =
    a.projectionYears === "custom" && !Number.isNaN(customYearsNum) && customYearsNum < 10
      ? "When selecting More than 10 years, please enter a value of 10 or greater."
      : undefined;

  const canContinue =
    a.companyName.trim() &&
    a.sector &&
    a.mainCountry.trim() &&
    a.mainCountryCurrency &&
    a.reportingCurrency &&
    a.cogsBasis &&
    a.capexBasis &&
    a.projectionYears &&
    (a.projectionYears !== "custom" || a.customYears.trim()) &&
    !customYearsError &&
    a.shareClasses &&
    a.liquidityPut &&
    (a.liquidityPut !== "yes" || a.putMechanisms.length > 0);

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <StepProgress steps={WORKFLOW_A_STEPS} current={1} />

      <main className="mx-auto max-w-7xl px-5 py-10">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div>
            <PageHeading
              step="Step 1 of 3"
              title="Company Information"
              intro="Please answer the following questions to help us identify and customize the most appropriate valuation template for your company."
            />

            <div className="space-y-4">
              <Collapsible title="A. General Information" defaultOpen>
                <Question number={1} label="What is the company name?" required>
                  <TextField
                    value={a.companyName}
                    onChange={(value) => setAnswer("companyName", value)}
                    placeholder="Enter company name"
                  />
                </Question>

                <Question number={2} label="What is the primary sector?" required>
                  <SelectField
                    value={a.sector}
                    onChange={(value) => setAnswer("sector", value)}
                    options={SECTORS}
                    placeholder="Select a sector"
                  />
                </Question>

                <Question
                  number={3}
                  label="Enter the name of the main countries in which the company operates (list up to 3 names)."
                  required
                >
                  <div className="grid gap-3 sm:grid-cols-[1fr_220px]">
                    <TextField
                      label="Main country"
                      value={a.mainCountry}
                      onChange={(value) => {
                        setAnswer("mainCountry", value);
                        setAnswer("mainCountryCurrency", defaultCurrencyForCountry(value) ?? "");
                      }}
                      placeholder="Enter country name"
                    />
                    <CurrencyDisplay label="Currency" value={a.mainCountryCurrency} />
                  </div>
                  <div className="grid gap-3 sm:grid-cols-[1fr_220px]">
                    <TextField
                      label="Second country (optional)"
                      value={a.secondCountry}
                      onChange={(value) => {
                        setAnswer("secondCountry", value);
                        setAnswer("secondCountryCurrency", defaultCurrencyForCountry(value) ?? "");
                      }}
                      placeholder="Enter country name"
                    />
                    <CurrencyDisplay label="Currency (optional)" value={a.secondCountryCurrency} />
                  </div>
                  <div className="grid gap-3 sm:grid-cols-[1fr_220px]">
                    <TextField
                      label="Third country (optional)"
                      value={a.thirdCountry}
                      onChange={(value) => {
                        setAnswer("thirdCountry", value);
                        setAnswer("thirdCountryCurrency", defaultCurrencyForCountry(value) ?? "");
                      }}
                      placeholder="Enter country name"
                    />
                    <CurrencyDisplay label="Currency (optional)" value={a.thirdCountryCurrency} />
                  </div>
                </Question>

                <Question
                  number={4}
                  label="If the company operates in a single country, does it have material revenues, costs, or investments denominated in a currency other than the local currency?"
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

                <Question number={5} label="What is the company's reporting currency?" required>
                  <SelectField
                    value={a.reportingCurrency}
                    onChange={(value) => setAnswer("reportingCurrency", value)}
                    options={CURRENCIES}
                    placeholder="Select currency"
                  />
                </Question>
              </Collapsible>

              <Collapsible title="B. Segmentation and Categorization">
                <Question
                  number={1}
                  label="Provide a brief description of the company's business model and how it generates revenue."
                >
                  <TextField
                    value={a.businessModel}
                    onChange={(value) => setAnswer("businessModel", value)}
                    placeholder="Describe the business model and revenue drivers"
                  />
                </Question>

                <Question
                  number={2}
                  label="Based on the company's business model, do you want to segment operations by business line or by revenue stream?"
                  hint="A business line reflects how a company's operations are divided into distinct operating segments based on differences in operating models and market dynamics, while a revenue stream is a specific way the company generates revenue within a business line. A business line may include multiple revenue streams. Different business lines typically have different measures of Units Sold and operating capacity."
                >
                  <OptionRow
                    value={a.segmentBasis}
                    onChange={(value) => setAnswer("segmentBasis", value as typeof a.segmentBasis)}
                    options={[
                      { value: "business_line", label: "Business line (e.g., Retail, Online, Wholesale)" },
                      { value: "revenue_stream", label: "Revenue stream (e.g., Product categories, Service types)" },
                    ]}
                  />
                </Question>

                <Question
                  number={3}
                  label="Select the number of segments to include in the model:"
                  hint='Select the segments that apply, then confirm the measurement units for each segment. "Other" can be used for any additional segment that is not one of the primary three. Maximum Output and Units Sold always share the same measurement unit.'
                >
                  <div className="space-y-3">
                    {segmentOptions.map((option) => (
                      <div key={option.value}>
                        <CheckItem
                          label={option.label}
                          checked={a.selectedSegments.includes(option.value)}
                          onChange={() => toggleAnswerItem("selectedSegments", option.value)}
                        />
                        {a.selectedSegments.includes(option.value) && (
                          <SegmentMeasurements
                            segmentId={option.value}
                            segmentLabel={option.label}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </Question>

                <Question
                  number={4}
                  label="Do you want COGS to be segmented or modeled on an aggregate basis?"
                  required
                  hint="If operations and revenues are segmented by business line, it is recommended that COGS also be segmented by business line to maintain consistency across the model."
                >
                  <OptionRow
                    value={a.cogsBasis}
                    onChange={(value) => setAnswer("cogsBasis", value as typeof a.cogsBasis)}
                    options={[
                      { value: "segmented", label: "Segmented" },
                      { value: "aggregate", label: "Aggregate (company level)" },
                    ]}
                  />
                </Question>

                <Question
                  number={5}
                  label="Do you want CapEx to be segmented or modeled on an aggregate basis?"
                  required
                  hint="If operations and revenues are segmented by business line, it is recommended that CapEx also be segmented by business line to maintain consistency across the model."
                >
                  <OptionRow
                    value={a.capexBasis}
                    onChange={(value) => setAnswer("capexBasis", value as typeof a.capexBasis)}
                    options={[
                      { value: "segmented", label: "Segmented" },
                      { value: "aggregate", label: "Aggregate (company level)" },
                    ]}
                  />
                </Question>

                <Question
                  number={6}
                  label='Which standard COGS categories should be combined under "Other Direct Costs"? Select all that apply.'
                  hint="Categories should be aggregated only when data is unavailable or a category is not relevant. Otherwise, keep these categories separate, as this breakdown supports more robust analysis and forecasting."
                >
                  <div className="grid gap-3 sm:grid-cols-2">
                    {COGS_CATEGORIES.map((category) => (
                      <CheckItem
                        key={category}
                        label={category}
                        checked={a.otherDirectCosts.includes(category)}
                        onChange={() => toggleAnswerItem("otherDirectCosts", category)}
                      />
                    ))}
                  </div>
                </Question>
              </Collapsible>

              <Collapsible title="C. Valuation">
                <Question number={1} label="How many years of projections do you need?" required>
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
                  number={2}
                  label="How many comparable companies (comps) do you want to enter?"
                >
                  <TextField
                    value={a.compsCount}
                    onChange={(value) => setAnswer("compsCount", value.replace(/\D/g, ""))}
                    placeholder="Enter number of comps"
                  />
                </Question>

                <Question
                  number={3}
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

                <Question number={4} label="Does the company have a liquidity put?" required>
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
