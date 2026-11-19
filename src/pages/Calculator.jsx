import PlanComparison from "../components/PlanComparison";
import EstimateForm from "../components/EstimateForm";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../lib/firebase";
import { useMemo, useState } from "react";
import {
  Heart, Baby, Activity, UserRound,
  ArrowLeft, ArrowRight, Check, Plus, Minus,ArrowLeftRight,
  MessageCircle
} from "lucide-react";

import ProgressBar from "../components/ProgressBar";
import PlanSummary from "../components/PlanSummary";
import LanguageToggle from "../components/LanguageToggle";
import { useLanguage } from "../context/LanguageContext";

import {
  calculateEstimate,
  formatCurrency,
  getPricingConfig
} from "../utils/pricing";

const config = getPricingConfig();

const careTypes = [
  {
    id: "elderly",
    title: "common.elderlyCare",
    description: "calculator.elderlyDescription",
    icon: UserRound
  },
  {
    id: "dementia",
    title: "common.dementiaCare",
    description: "calculator.dementiaDescription",
    icon: Heart
  },
  {
    id: "baby",
    title: "common.babyCare",
    description: "calculator.babyDescription",
    icon: Baby
  },
  {
    id: "recovery",
    title: "common.recoveryCare",
    description: "calculator.recoveryDescription",
    icon: Activity
  }
];

const initialPlan = {
  careType: "",
  city: "",
  hoursPerDay: 8,
  shift: "day",
  durationDays: 30,
  addons: {
    physiotherapy: 0
  }
};

export default function Calculator() {
    const { t } = useLanguage();
    const [comparisonPlan, setComparisonPlan] = useState(null);
    const [showComparison, setShowComparison] = useState(false);
  const [step, setStep] = useState(1);
  const [plan, setPlan] = useState(initialPlan);
  const [showEstimate, setShowEstimate] = useState(false);

  const [customer, setCustomer] = useState({
    name: "",
    phone: "",
    email: "",
    callbackTime: "Anytime"
  });

  const [submitting, setSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [submissionError, setSubmissionError] = useState("");

  const updateCustomer = (key, value) => {
    setCustomer(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const totalSteps = 6;

  const updatePlan = (key, value) => {
    setPlan(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const updateAddon = (quantity) => {
    setPlan(prev => ({
      ...prev,
      addons: {
        ...prev.addons,
        physiotherapy: quantity
      }
    }));
  };

  const estimate = useMemo(() => {
    if (
      !plan.city ||
      !plan.careType ||
      !plan.hoursPerDay ||
      !plan.shift ||
      !plan.durationDays
    ) {
      return null;
    }

    try {
      return calculateEstimate(plan);
    } catch (error) {
      return null;
    }
  }, [plan]);

    const comparisonEstimate = useMemo(() => {
    if (!comparisonPlan) return null;

    try {
        return calculateEstimate(comparisonPlan);
    } catch (error) {
        return null;
    }
    }, [comparisonPlan]);

    const startComparison = () => {
    setComparisonPlan({
        ...plan,
        addons: { ...plan.addons }
    });

    setShowComparison(true);
    };

    const updateComparisonPlan = (key, value) => {
    setComparisonPlan(prev => ({
        ...prev,
        [key]: value
    }));
    };

    const updateComparisonAddon = (quantity) => {
    setComparisonPlan(prev => ({
        ...prev,
        addons: {
        ...prev.addons,
        physiotherapy: quantity
        }
    }));
    };

  // Share the generated estimate through WhatsApp.
  const shareEstimate = () => {
    if (!estimate) return;

    const careTypeName =
      t(careTypes.find(item => item.id === plan.careType)?.title || plan.careType);

    const shiftName =
      t(plan.shift === "live-in" ? "common.liveInCare" : "common.dayShift");

    const message = [
      t("calculator.whatsappIntro"),
      "",
      `*${t("calculator.planDetails")}*`,
      `${t("calculator.careLabel")}: ${careTypeName}`,
      `${t("calculator.cityLabel")}: ${plan.city}`,
      `${t("calculator.dailyCare")}: ${plan.hoursPerDay} ${t("common.hours")}`,
      `${t("calculator.shiftLabel")}: ${shiftName}`,
      `${t("calculator.durationLabel")}: ${plan.durationDays} ${t("common.days")}`,
      `${t("calculator.physioVisits")}: ${plan.addons.physiotherapy}`,
      "",
      `*${t("calculator.estimatedTotal")}: ${formatCurrency(estimate.breakdown.total)}*`,
      "",
      t("calculator.contactFurther"),
      "",
      t("calculator.generatedBy")
    ].join("\n");

    const whatsappUrl =
      `https://wa.me/?text=${encodeURIComponent(message)}`;

    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
  };

  const submitLead = async (e) => {
    e.preventDefault();

    setSubmissionError("");

    if (!customer.name.trim()) {
      setSubmissionError("calculator.submitErrorName");
      return;
    }

    if (!/^[6-9]\d{9}$/.test(customer.phone)) {
      setSubmissionError("calculator.submitErrorPhone");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email)) {
      setSubmissionError("calculator.submitErrorEmail");
      return;
    }

    if (!estimate) {
      setSubmissionError("calculator.submitErrorPlan");
      return;
    }

    try {
      setSubmitting(true);

      const leadData = {
        customer: {
          name: customer.name.trim(),
          phone: customer.phone,
          email: customer.email.trim().toLowerCase(),
          callbackTime: customer.callbackTime
        },

        carePlan: {
          ...plan,
          addons: { ...plan.addons }
        },

        pricing: estimate.breakdown,

        status: "new",
        source: "website",

        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, "careLeads"), leadData);

      setSubmissionSuccess(true);

    } catch (error) {
      console.error("Lead submission error:", error);

      setSubmissionError(
        "calculator.submitErrorFailed"
      );

    } finally {
      setSubmitting(false);
    }
  };

  const canContinue = () => {
    switch (step) {
      case 1:
        return Boolean(plan.careType);
      case 2:
        return Boolean(plan.city);
      case 3:
        return Boolean(plan.hoursPerDay);
      case 4:
        return Boolean(plan.shift);
      case 5:
        return Boolean(plan.durationDays);
      case 6:
        return true;
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (!canContinue()) return;

    if (step === totalSteps) {
      setShowEstimate(true);
      return;
    }

    setStep(prev => prev + 1);
  };

  const previousStep = () => {
    setStep(prev => Math.max(prev - 1, 1));
  };

  const OptionCard = ({
    selected,
    onClick,
    children
  }) => (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left p-5 rounded-xl border-2 transition ${
        selected
          ? "border-teal-600 bg-teal-50"
          : "border-gray-100 bg-white hover:border-teal-200"
      }`}
    >
      {children}
    </button>
  );

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <>
            <h2 className="text-2xl font-bold text-gray-900">
              {t("calculator.whoNeeds")}
            </h2>
            <p className="text-gray-500 mt-2 mb-6">
              {t("calculator.selectCare")}
            </p>

            <div className="grid sm:grid-cols-2 gap-4">
              {careTypes.map(item => {
                const Icon = item.icon;
                const selected = plan.careType === item.id;

                return (
                  <OptionCard
                    key={item.id}
                    selected={selected}
                    onClick={() => updatePlan("careType", item.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="bg-teal-50 p-3 rounded-xl">
                        <Icon className="text-teal-700" size={22} />
                      </div>
                      {selected && (
                        <Check className="text-teal-600" />
                      )}
                    </div>

                    <h3 className="font-bold mt-4 text-gray-800">
                      {t(item.title)}
                    </h3>

                    <p className="text-sm text-gray-500 mt-1">
                      {t(item.description)}
                    </p>
                  </OptionCard>
                );
              })}
            </div>
          </>
        );

      case 2:
        return (
          <>
            <h2 className="text-2xl font-bold text-gray-900">
              {t("calculator.whereNeeds")}
            </h2>
            <p className="text-gray-500 mt-2 mb-6">
              {t("calculator.selectCity")}
            </p>

            <div className="grid grid-cols-2 gap-4">
              {Object.keys(config.cities).map(city => (
                <OptionCard
                  key={city}
                  selected={plan.city === city}
                  onClick={() => updatePlan("city", city)}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">{city}</span>
                    {plan.city === city && (
                      <Check className="text-teal-600" />
                    )}
                  </div>
                </OptionCard>
              ))}
            </div>
          </>
        );

      case 3:
        return (
          <>
            <h2 className="text-2xl font-bold text-gray-900">
              {t("calculator.hoursQuestion")}
            </h2>
            <p className="text-gray-500 mt-2 mb-6">
              {t("calculator.hoursDescription")}
            </p>

            <div className="grid grid-cols-3 gap-3">
              {[8, 12, 24].map(hours => (
                <OptionCard
                  key={hours}
                  selected={plan.hoursPerDay === hours}
                  onClick={() => updatePlan("hoursPerDay", hours)}
                >
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-gray-800">
                      {hours}
                    </h3>
                    <p className="text-sm text-gray-500">{t("calculator.hoursPerDay")}</p>
                  </div>
                </OptionCard>
              ))}
            </div>
          </>
        );

      case 4:
        return (
          <>
            <h2 className="text-2xl font-bold text-gray-900">
              {t("calculator.shiftQuestion")}
            </h2>
            <p className="text-gray-500 mt-2 mb-6">
              {t("calculator.shiftDescription")}
            </p>

            <div className="space-y-4">
              <OptionCard
                selected={plan.shift === "day"}
                onClick={() => updatePlan("shift", "day")}
              >
                <h3 className="font-bold text-gray-800">
                  {t("common.dayShift")}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {t("calculator.dayDescription")}
                </p>
              </OptionCard>

              <OptionCard
                selected={plan.shift === "live-in"}
                onClick={() => updatePlan("shift", "live-in")}
              >
                <h3 className="font-bold text-gray-800">
                  {t("common.liveInCare")}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {t("calculator.liveInDescription")}
                </p>
              </OptionCard>
            </div>
          </>
        );

      case 5:
        return (
          <>
            <h2 className="text-2xl font-bold text-gray-900">
              {t("calculator.durationQuestion")}
            </h2>
            <p className="text-gray-500 mt-2 mb-6">
              {t("calculator.durationDescription")}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {config.durations.map(days => (
                <OptionCard
                  key={days}
                  selected={plan.durationDays === days}
                  onClick={() => updatePlan("durationDays", days)}
                >
                  <div className="text-center">
                    <h3 className="text-2xl font-bold">
                      {days}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {t("common.days")}
                    </p>
                  </div>
                </OptionCard>
              ))}
            </div>
          </>
        );

      case 6:
        return (
          <>
            <h2 className="text-2xl font-bold text-gray-900">
              {t("calculator.additionalServices")}
            </h2>
            <p className="text-gray-500 mt-2 mb-6">
              {t("calculator.customizeServices")}
            </p>

            <div className="border border-gray-200 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-gray-800">
                  {t("common.physiotherapy")}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {t("calculator.perVisit")}
                </p>
              </div>

              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() =>
                    updateAddon(Math.max(0, plan.addons.physiotherapy - 1))
                  }
                  className="border rounded-lg p-2"
                >
                  <Minus size={18} />
                </button>

                <span className="font-bold w-5 text-center">
                  {plan.addons.physiotherapy}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    updateAddon(Math.min(30, plan.addons.physiotherapy + 1))
                  }
                  className="border rounded-lg p-2"
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>

            {estimate && (
              <div className="mt-6 bg-teal-50 rounded-xl p-5">
                <p className="text-sm text-teal-700">
                  {t("calculator.currentEstimate")}
                </p>
                <h3 className="text-3xl font-bold text-teal-800 mt-2">
                  {formatCurrency(estimate.breakdown.total)}
                </h3>
              </div>
            )}
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#F7FAF9]">
      <header className="bg-white border-b px-6 py-5">
        <div className="max-w-6xl mx-auto flex items-center gap-2">
          <Heart className="text-teal-600" size={25} />
          <span className="font-bold text-xl">TheCarePal</span>
          <div className="ml-auto">
            <LanguageToggle />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-5 py-10 md:py-16">
        <div className="max-w-3xl mx-auto">
          <button
            onClick={() => window.location.href = "/"}
            className="text-sm text-teal-700 font-semibold mb-8"
          >
            ← {t("calculator.backHome")}
          </button>

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            {t("calculator.title")}
          </h1>

          <p className="text-gray-500 mt-2 mb-9">
            {t("calculator.subtitle")}
          </p>

          <ProgressBar
            currentStep={step}
            totalSteps={totalSteps}
          />

          <div className="grid lg:grid-cols-[1fr_280px] gap-6">

            <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8">

              {showEstimate ? (
                <>
                    <EstimateForm
                    plan={plan}
                    estimate={estimate}
                    customer={customer}
                    updateCustomer={updateCustomer}
                    submitLead={submitLead}
                    submitting={submitting}
                    submissionSuccess={submissionSuccess}
                    submissionError={submissionError}
                    onBack={() => setShowEstimate(false)}
                    />

                    {estimate && (
                    <div className="space-y-3 mt-5">

                        <button
                        type="button"
                        onClick={shareEstimate}
                        className="w-full flex items-center justify-center gap-3 bg-[#25D366] hover:bg-[#1DA851] text-white font-semibold py-3.5 px-5 rounded-xl transition"
                        >
                        <MessageCircle size={21} />
                        {t("calculator.shareWhatsapp")}
                        </button>

                        <button
                        type="button"
                        onClick={startComparison}
                        className="w-full flex items-center justify-center gap-2 border-2 border-teal-600 text-teal-700 hover:bg-teal-50 font-semibold py-3.5 px-5 rounded-xl transition"
                        >
                        <ArrowLeftRight size={19} />
                        {t("calculator.comparePlans")}
                        </button>

                    </div>
                    )}

                    {showComparison && comparisonPlan && (
                    <PlanComparison
                        plan={plan}
                        estimate={estimate}
                        comparisonPlan={comparisonPlan}
                        comparisonEstimate={comparisonEstimate}
                        onPlanChange={updateComparisonPlan}
                        onAddonChange={updateComparisonAddon}
                        onClose={() => setShowComparison(false)}
                    />
                    )}
                </>
                ) : (
                // Keep your existing calculator steps and navigation here.

                <>
                  {renderStep()}

                  <div className="flex justify-between mt-10 pt-6 border-t border-gray-100">

                    <button
                      onClick={previousStep}
                      disabled={step === 1}
                      className="flex items-center gap-2 px-5 py-3 rounded-xl border font-semibold text-gray-600 disabled:opacity-30"
                    >
                      <ArrowLeft size={18} />
                      {t("common.back")}
                    </button>

                    <button
                      onClick={nextStep}
                      disabled={!canContinue()}
                      className="flex items-center gap-2 px-6 py-3 rounded-xl bg-teal-600 text-white font-semibold hover:bg-teal-700 disabled:opacity-40"
                    >
                      {step === totalSteps ? t("calculator.viewEstimate") : t("common.continue")}
                      <ArrowRight size={18} />
                    </button>

                  </div>
                </>
              )}

            </div>

            {!showEstimate && (
              <div className="hidden lg:block">
                <PlanSummary plan={plan} />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
