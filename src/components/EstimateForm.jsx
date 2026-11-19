
import { useState } from "react";
import {
  CheckCircle2,
  ShieldCheck,
  Receipt,
  ArrowLeft,
  Loader2
} from "lucide-react";

import { formatCurrency } from "../utils/pricing";
import { useLanguage } from "../context/LanguageContext";

export default function EstimateForm({
  plan,
  estimate,
  customer,
  updateCustomer,
  submitLead,
  submitting,
  submissionSuccess,
  submissionError,
  onBack
}) {
  const { t, language } = useLanguage();
  const breakdown = estimate.breakdown;
  const careTypeKeys = {
    elderly: "common.elderlyCare",
    dementia: "common.dementiaCare",
    baby: "common.babyCare",
    recovery: "common.recoveryCare"
  };

  const [acceptedTerms, setAcceptedTerms] = useState(false);

  if (submissionSuccess) {
    return (
      <div className="text-center py-12">
        <CheckCircle2
          size={64}
          className="text-teal-600 mx-auto mb-5"
        />

        <h2 className="text-3xl font-bold text-gray-900">
          {t("estimate.submitted")}
        </h2>

        <p className="text-gray-500 mt-3 max-w-md mx-auto">
          {t("estimate.thankYou")}
        </p>

        <div className="bg-teal-50 rounded-xl p-6 mt-8 max-w-md mx-auto">
          <p className="text-sm text-teal-700">
            {t("estimate.planCost")}
          </p>

          <h3 className="text-3xl font-bold text-teal-800 mt-2">
            {formatCurrency(breakdown.total)}
          </h3>
        </div>

        <p className="text-sm text-gray-400 mt-6">
          {t("estimate.recorded")}
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-teal-50 p-3 rounded-xl">
          <Receipt className="text-teal-600" size={25} />
        </div>

        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {t("estimate.title")}
          </h2>

          <p className="text-sm text-gray-500">
            {t("estimate.review")}
          </p>
        </div>
      </div>

      {/* Care plan summary */}
      <div className="bg-gray-50 rounded-xl p-5 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">
          {t("estimate.selectedPlan")}
        </h3>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-400">{t("common.city")}</p>
            <p className="font-semibold">{plan.city}</p>
          </div>

          <div>
            <p className="text-gray-400">{t("common.careType")}</p>
            <p className="font-semibold capitalize">
              {t(careTypeKeys[plan.careType] || "common.notSelected")}
            </p>
          </div>

          <div>
            <p className="text-gray-400">{t("common.dailyHours")}</p>
            <p className="font-semibold">{plan.hoursPerDay} {t("common.hours")}</p>
          </div>

          <div>
            <p className="text-gray-400">{t("common.shift")}</p>
            <p className="font-semibold">{t(plan.shift === "live-in" ? "common.liveInCare" : "common.dayShift")}</p>
          </div>

          <div>
            <p className="text-gray-400">{t("common.duration")}</p>
            <p className="font-semibold">{plan.durationDays} {t("common.days")}</p>
          </div>
        </div>
      </div>

      {/* Price breakdown */}
      <div className="border border-gray-200 rounded-xl p-5 mb-8">
        <h3 className="font-bold text-gray-800 mb-5">
          {t("estimate.priceBreakdown")}
        </h3>

        <div className="space-y-4 text-sm">
          <div className="flex justify-between gap-3">
            <span className="text-gray-500">
              {t("estimate.baseCare", { days: plan.durationDays })}
            </span>

            <span className="font-semibold">
              {formatCurrency(breakdown.careCost)}
            </span>
          </div>

          <div className="flex justify-between gap-3">
            <span className="text-gray-500">
              {t("estimate.dailyRate")}
            </span>

            <span>
              {formatCurrency(breakdown.dailyCareCost)}
            </span>
          </div>

          {breakdown.addons.map(addon => (
            <div
              key={addon.key}
              className="flex justify-between gap-3"
            >
              <span className="text-gray-500">
                {t(addon.key === "physiotherapy" ? "common.physiotherapy" : addon.name)} ({addon.quantity} {language === "hi" ? t("common.visit") : `${addon.unit}${addon.quantity > 1 ? "s" : ""}`})
              </span>

              <span className="font-semibold">
                {formatCurrency(addon.total)}
              </span>
            </div>
          ))}

          <div className="flex justify-between">
            <span className="text-gray-500">{t("estimate.addonTotal")}</span>

            <span>
              {formatCurrency(breakdown.addonTotal)}
            </span>
          </div>

          <div className="border-t pt-4 flex justify-between">
            <span className="font-semibold">{t("estimate.subtotal")}</span>

            <span className="font-semibold">
              {formatCurrency(breakdown.subtotal)}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-500">
              {t("estimate.gst", { percentage: breakdown.gstPercentage })}
            </span>

            <span>
              {formatCurrency(breakdown.gstAmount)}
            </span>
          </div>

          <div className="border-t pt-4 flex justify-between items-center">
            <span className="font-bold text-lg">{t("estimate.total")}</span>

            <span className="text-2xl font-bold text-teal-700">
              {formatCurrency(breakdown.total)}
            </span>
          </div>
        </div>

        <p className="text-xs text-gray-400 mt-4">
          {t("estimate.disclaimer")}
        </p>
      </div>

      {/* Customer details */}
      <form onSubmit={submitLead} className="space-y-5">
        <div>
          <h3 className="text-xl font-bold text-gray-900">
            {t("estimate.contactDetails")}
          </h3>

          <p className="text-sm text-gray-500 mt-1">
            {t("estimate.contactSubtitle")}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            {t("estimate.fullName")}
          </label>

          <input
            type="text"
            required
            value={customer.name}
            onChange={e =>
              updateCustomer("name", e.target.value)
            }
            placeholder={t("estimate.enterName")}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            {t("estimate.mobile")}
          </label>

          <input
            type="tel"
            required
            maxLength={10}
            value={customer.phone}
            onChange={e =>
              updateCustomer(
                "phone",
                e.target.value.replace(/\D/g, "").slice(0, 10)
              )
            }
            placeholder={t("estimate.mobilePlaceholder")}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            {t("estimate.email")}
          </label>

          <input
            type="email"
            required
            value={customer.email}
            onChange={e =>
              updateCustomer("email", e.target.value)
            }
            placeholder="you@example.com"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            {t("estimate.callback")}
          </label>

          <select
            value={customer.callbackTime}
            onChange={e =>
              updateCustomer("callbackTime", e.target.value)
            }
            className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-white"
          >
            <option value="Anytime">{t("common.anytime")}</option>
            <option value="Morning">{t("common.morning")}</option>
            <option value="Afternoon">{t("common.afternoon")}</option>
            <option value="Evening">{t("common.evening")}</option>
          </select>
        </div>

        <label className="flex items-start gap-3 text-sm text-gray-600">
          <input
            type="checkbox"
            checked={acceptedTerms}
            onChange={e => setAcceptedTerms(e.target.checked)}
            className="mt-1 accent-teal-600"
          />

          <span>
            {t("estimate.consent")}
          </span>
        </label>

        {submissionError && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
            {t(submissionError)}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting || !acceptedTerms}
          className="w-full bg-teal-600 text-white py-4 rounded-xl font-semibold flex justify-center items-center gap-2 hover:bg-teal-700 disabled:opacity-50"
        >
          {submitting ? (
            <>
              <Loader2 className="animate-spin" size={19} />
              {t("estimate.submitting")}
            </>
          ) : (
            t("estimate.submit")
          )}
        </button>

        <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
          <ShieldCheck size={15} />
          {t("estimate.privacy")}
        </div>
      </form>

      <button
        type="button"
        onClick={onBack}
        className="mt-6 flex items-center gap-2 text-gray-500 hover:text-teal-700"
      >
        <ArrowLeft size={17} />
        {t("estimate.editPlan")}
      </button>
    </div>
  );
}
