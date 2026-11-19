
import { formatCurrency, getPricingConfig } from "../utils/pricing";
import { ArrowLeftRight, X, TrendingDown } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

const config = getPricingConfig();

const careTypes = [
  { id: "elderly", label: "common.elderlyCare" },
  { id: "dementia", label: "common.dementiaCare" },
  { id: "baby", label: "common.babyCare" },
  { id: "recovery", label: "common.recoveryCare" }
];

function PlanCard({ title, plan, estimate, highlighted }) {
  const { t } = useLanguage();
  const breakdown = estimate.breakdown;

  const rows = [
    [t("common.careType"), t(careTypes.find(c => c.id === plan.careType)?.label || "common.notSelected")],
    [t("common.city"), plan.city],
    [t("common.dailyHours"), `${plan.hoursPerDay} ${t("common.hours")}`],
    [t("common.shift"), t(plan.shift === "live-in" ? "common.liveInCare" : "common.dayShift")],
    [t("common.duration"), `${plan.durationDays} ${t("common.days")}`],
    [t("common.physiotherapy"), `${plan.addons.physiotherapy} ${t("common.visit")}`]
  ];

  return (
    <div
      className={`rounded-xl border p-4 md:p-5 h-full ${
        highlighted
          ? "border-teal-300 bg-teal-50/30"
          : "border-gray-200 bg-white"
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-base md:text-lg text-gray-800">
          {t(title)}
        </h3>

        {highlighted && (
          <span className="text-xs font-semibold text-teal-700 bg-teal-100 px-2 py-1 rounded-full">
            {t("comparison.alternative")}
          </span>
        )}
      </div>

      <div className="space-y-2.5 text-sm">
        {rows.map(([label, value]) => (
          <div
            key={label}
            className="flex justify-between items-start gap-3"
          >
            <span className="text-gray-500">{label}</span>
            <span className="font-semibold text-gray-800 text-right">
              {value}
            </span>
          </div>
        ))}
      </div>

      <div className="border-t border-gray-200 mt-4 pt-3 space-y-2.5 text-sm">
        <div className="flex justify-between gap-3">
          <span className="text-gray-500">{t("comparison.careCost")}</span>
          <span>{formatCurrency(breakdown.careCost)}</span>
        </div>

        <div className="flex justify-between gap-3">
          <span className="text-gray-500">{t("comparison.addons")}</span>
          <span>{formatCurrency(breakdown.addonTotal)}</span>
        </div>

        <div className="flex justify-between gap-3">
          <span className="text-gray-500">
            {t("comparison.gst", { percentage: breakdown.gstPercentage })}
          </span>
          <span>{formatCurrency(breakdown.gstAmount)}</span>
        </div>
      </div>

      <div className="border-t border-gray-200 mt-4 pt-3">
        <p className="text-xs text-gray-500">{t("comparison.total")}</p>
        <p className="text-2xl font-bold text-teal-700 mt-1">
          {formatCurrency(breakdown.total)}
        </p>
      </div>
    </div>
  );
}

export default function PlanComparison({
  plan,
  estimate,
  comparisonPlan,
  comparisonEstimate,
  onPlanChange,
  onAddonChange,
  onClose
}) {
  const { t } = useLanguage();
  if (!estimate || !comparisonEstimate) return null;

  const plan1Total = estimate.breakdown.total;
  const plan2Total = comparisonEstimate.breakdown.total;

  const difference = Math.abs(plan1Total - plan2Total);

  const cheaperPlan =
    plan1Total < plan2Total
      ? "comparison.original"
      : plan2Total < plan1Total
      ? "comparison.alternativePlan"
      : null;

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="comparison-title"
        className="bg-white w-full max-w-6xl max-h-[94vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 px-4 py-4 md:px-6 border-b border-gray-200 bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-teal-50 p-2 rounded-lg">
              <ArrowLeftRight className="text-teal-600" size={21} />
            </div>

            <div>
              <h2
                id="comparison-title"
                className="text-lg md:text-xl font-bold text-gray-900"
              >
                {t("comparison.title")}
              </h2>
              <p className="text-xs md:text-sm text-gray-500 mt-0.5">
                {t("comparison.subtitle")}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition"
            aria-label={t("comparison.close")}
          >
            <X size={22} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto p-4 md:p-6 space-y-5">

          {/* Plan 2 Editor */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800">
                {t("comparison.customize")}
              </h3>
              <span className="text-xs text-teal-700 font-medium">
                {t("comparison.editable")}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  {t("common.careType")}
                </label>
                <select
                  value={comparisonPlan.careType}
                  onChange={e => onPlanChange("careType", e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:ring-2 focus:ring-teal-500 outline-none"
                >
                  {careTypes.map(item => (
                    <option key={item.id} value={item.id}>
                      {t(item.label)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  {t("common.city")}
                </label>
                <select
                  value={comparisonPlan.city}
                  onChange={e => onPlanChange("city", e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:ring-2 focus:ring-teal-500 outline-none"
                >
                  {Object.keys(config.cities).map(city => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  {t("comparison.hoursPerDay")}
                </label>
                <select
                  value={comparisonPlan.hoursPerDay}
                  onChange={e =>
                    onPlanChange("hoursPerDay", Number(e.target.value))
                  }
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:ring-2 focus:ring-teal-500 outline-none"
                >
                  {[8, 12, 24].map(hours => (
                    <option key={hours} value={hours}>
                      {hours} {t("common.hours")}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  {t("comparison.careShift")}
                </label>
                <select
                  value={comparisonPlan.shift}
                  onChange={e => onPlanChange("shift", e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:ring-2 focus:ring-teal-500 outline-none"
                >
                  <option value="day">{t("common.dayShift")}</option>
                  <option value="live-in">{t("common.liveInCare")}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  {t("common.duration")}
                </label>
                <select
                  value={comparisonPlan.durationDays}
                  onChange={e =>
                    onPlanChange("durationDays", Number(e.target.value))
                  }
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:ring-2 focus:ring-teal-500 outline-none"
                >
                  {config.durations.map(days => (
                    <option key={days} value={days}>
                      {days} {t("common.days")}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  {t("comparison.physiotherapyVisits")}
                </label>
                <input
                  type="number"
                  min="0"
                  max="30"
                  value={comparisonPlan.addons.physiotherapy}
                  onChange={e => {
                    const value = Math.max(
                      0,
                      Math.min(30, Number(e.target.value) || 0)
                    );
                    onAddonChange(value);
                  }}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>

            </div>
          </div>

          {/* Comparison Cards */}
          <div>
            <h3 className="text-sm font-bold text-gray-700 mb-3">
              {t("comparison.comparison")}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <PlanCard
                title="comparison.original"
                plan={plan}
                estimate={estimate}
              />

              <PlanCard
                title="comparison.alternativePlan"
                plan={comparisonPlan}
                estimate={comparisonEstimate}
                highlighted
              />
            </div>
          </div>

          {/* Price Difference */}
          <div className="bg-teal-50 border border-teal-100 rounded-xl p-4 md:p-5">
            <div className="flex items-center gap-2 text-teal-800 font-semibold">
              <TrendingDown size={19} />
              {t("comparison.priceComparison")}
            </div>

            {cheaperPlan ? (
              <p className="text-sm text-teal-700 mt-2">
                {t("comparison.cheaper", {
                  plan: t(cheaperPlan),
                  amount: formatCurrency(difference)
                })}
              </p>
            ) : (
              <p className="text-sm text-teal-700 mt-2">
                {t("comparison.samePrice")}
              </p>
            )}

            <p className="text-xs text-teal-600 mt-2">
              {t("comparison.finalPricing")}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-4 py-3 md:px-6 flex justify-end bg-white shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold transition"
          >
            {t("common.done")}
          </button>
        </div>
      </div>
    </div>
  );
}
