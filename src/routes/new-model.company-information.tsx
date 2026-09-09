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

  const canContinue =
    a.companyName.trim() &&
    a.sector &&
    a.mainCountry.trim() &&
    a.mainCountryCurrency &&
    a.reportingCurrency &&
    a.segmentBasis &&
    a.segmentCount &&
    a.cogsBasis &&
    a.capexBasis &&
    a.projectionYears &&
    (a.projectionYears !== "custom" || a.customYears.trim()) &&
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
                  label="Provide a brief description of the company's business model and how it generates revenue."
                >
                  <TextField
                    value={a.businessModel}
                    onChange={(value) => setAnswer("businessModel", value)}
                    placeholder="Describe the business model and revenue drivers"
                  />
                </Question>

                <Question
                  number={4}
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
                    <SelectField
                      label="Currency"
                      value={a.mainCountryCurrency}
                      onChange={(value) => setAnswer("mainCountryCurrency", value)}
                      options={CURRENCIES}
                      placeholder="Select currency"
                    />
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
                    <SelectField
                      label="Currency (optional)"
                      value={a.secondCountryCurrency}
                      onChange={(value) => setAnswer("secondCountryCurrency", value)}
                      options={CURRENCIES}
                      placeholder="Select currency"
                    />
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
                    <SelectField
                      label="Currency (optional)"
                      value={a.thirdCountryCurrency}
                      onChange={(value) => setAnswer("thirdCountryCurrency", value)}
                      options={CURRENCIES}
                      placeholder="Select currency"
                    />
                  </div>
                </Question>

                <Question
                  number={5}
                  label="Does the company have material revenues, costs, or investments denominated in a currency other than the local currency?"
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

                <Question number={6} label="What is the company's reporting currency?" required>
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
                  label="Do you want to segment operations by business line or by revenue stream?"
                  required
                  hint="Select the approach that best reflects how the business is managed and reported internally."
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
                  number={2}
                  label="How many segments do you need?"
                  required
                  hint='You can select up to 4 segments, including "Other", due to standardized-template limitations.'
                >
                  <SelectField
                    value={a.segmentCount}
                    onChange={(value) => setAnswer("segmentCount", value)}
                    options={["1", "2", "3", "4"]}
                    placeholder="Select number of segments"
                  />
                </Question>

                <Question
                  number={3}
                  label="Do you want COGS to be segmented or modeled on an aggregate basis?"
                  required
                  hint="Choose the level of detail based on data availability and whether cost structures differ materially across segments."
                >
                  <OptionRow
                    value={a.cogsBasis}
                    onChange={(value) => setAnswer("cogsBasis", value as typeof a.cogsBasis)}
                    options={[
                      { value: "segmented", label: "Segmented by business line" },
                      { value: "aggregate", label: "Aggregate (company level)" },
                    ]}
                  />
                </Question>

                <Question
                  number={4}
                  label="Do you want CapEx to be segmented or modeled on an aggregate basis?"
                  required
                  hint="Choose the level of detail based on data availability and whether investment needs differ materially across segments."
                >
                  <OptionRow
                    value={a.capexBasis}
                    onChange={(value) => setAnswer("capexBasis", value as typeof a.capexBasis)}
                    options={[
                      { value: "segmented", label: "Segmented by business line" },
                      { value: "aggregate", label: "Aggregate (company level)" },
                    ]}
                  />
                </Question>

                <Question
                  number={5}
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
                    />
                  )}
                </Question>

                <Question
                  number={2}
                  label="How many comparable companies (comps) do you want to enter?"
                >
                  <SelectField
                    value={a.compsCount}
                    onChange={(value) => setAnswer("compsCount", value)}
                    options={["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]}
                    placeholder="Select number of comps"
                  />
                </Question>

                <Question
                  number={3}
                  label="Does the company have common shares, preferred shares, or both?"
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
