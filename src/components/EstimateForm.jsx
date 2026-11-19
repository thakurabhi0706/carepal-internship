
import { useState } from "react";
import {
  CheckCircle2,
  ShieldCheck,
  Receipt,
  ArrowLeft,
  Loader2
} from "lucide-react";

import { formatCurrency } from "../utils/pricing";

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
  const breakdown = estimate.breakdown;

  const [acceptedTerms, setAcceptedTerms] = useState(false);

  if (submissionSuccess) {
    return (
      <div className="text-center py-12">
        <CheckCircle2
          size={64}
          className="text-teal-600 mx-auto mb-5"
        />

        <h2 className="text-3xl font-bold text-gray-900">
          Enquiry Submitted!
        </h2>

        <p className="text-gray-500 mt-3 max-w-md mx-auto">
          Thank you for choosing TheCarePal.
          Our team will contact you regarding your care requirements.
        </p>

        <div className="bg-teal-50 rounded-xl p-6 mt-8 max-w-md mx-auto">
          <p className="text-sm text-teal-700">
            Your estimated care plan cost
          </p>

          <h3 className="text-3xl font-bold text-teal-800 mt-2">
            {formatCurrency(breakdown.total)}
          </h3>
        </div>

        <p className="text-sm text-gray-400 mt-6">
          Your enquiry has been recorded successfully.
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
            Your Care Estimate
          </h2>

          <p className="text-sm text-gray-500">
            Review your personalized care plan.
          </p>
        </div>
      </div>

      {/* Care plan summary */}
      <div className="bg-gray-50 rounded-xl p-5 mb-6">
        <h3 className="font-bold text-gray-800 mb-4">
          Selected Care Plan
        </h3>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-400">City</p>
            <p className="font-semibold">{plan.city}</p>
          </div>

          <div>
            <p className="text-gray-400">Care Type</p>
            <p className="font-semibold capitalize">
              {plan.careType}
            </p>
          </div>

          <div>
            <p className="text-gray-400">Daily Hours</p>
            <p className="font-semibold">{plan.hoursPerDay} hours</p>
          </div>

          <div>
            <p className="text-gray-400">Shift</p>
            <p className="font-semibold capitalize">{plan.shift}</p>
          </div>

          <div>
            <p className="text-gray-400">Duration</p>
            <p className="font-semibold">{plan.durationDays} days</p>
          </div>
        </div>
      </div>

      {/* Price breakdown */}
      <div className="border border-gray-200 rounded-xl p-5 mb-8">
        <h3 className="font-bold text-gray-800 mb-5">
          Price Breakdown
        </h3>

        <div className="space-y-4 text-sm">
          <div className="flex justify-between gap-3">
            <span className="text-gray-500">
              Base care ({plan.durationDays} days)
            </span>

            <span className="font-semibold">
              {formatCurrency(breakdown.careCost)}
            </span>
          </div>

          <div className="flex justify-between gap-3">
            <span className="text-gray-500">
              Daily care rate
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
                {addon.name} ({addon.quantity} {addon.unit}s)
              </span>

              <span className="font-semibold">
                {formatCurrency(addon.total)}
              </span>
            </div>
          ))}

          <div className="flex justify-between">
            <span className="text-gray-500">Add-ons total</span>

            <span>
              {formatCurrency(breakdown.addonTotal)}
            </span>
          </div>

          <div className="border-t pt-4 flex justify-between">
            <span className="font-semibold">Subtotal</span>

            <span className="font-semibold">
              {formatCurrency(breakdown.subtotal)}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-500">
              GST ({breakdown.gstPercentage}%)
            </span>

            <span>
              {formatCurrency(breakdown.gstAmount)}
            </span>
          </div>

          <div className="border-t pt-4 flex justify-between items-center">
            <span className="font-bold text-lg">Total Estimate</span>

            <span className="text-2xl font-bold text-teal-700">
              {formatCurrency(breakdown.total)}
            </span>
          </div>
        </div>

        <p className="text-xs text-gray-400 mt-4">
          This is an indicative estimate based on configured rates.
          Final pricing is subject to confirmation.
        </p>
      </div>

      {/* Customer details */}
      <form onSubmit={submitLead} className="space-y-5">
        <div>
          <h3 className="text-xl font-bold text-gray-900">
            Your Contact Details
          </h3>

          <p className="text-sm text-gray-500 mt-1">
            Our care team will get in touch with you.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Full Name *
          </label>

          <input
            type="text"
            required
            value={customer.name}
            onChange={e =>
              updateCustomer("name", e.target.value)
            }
            placeholder="Enter your full name"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Mobile Number *
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
            placeholder="10-digit mobile number"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Email Address *
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
            Preferred Callback Time
          </label>

          <select
            value={customer.callbackTime}
            onChange={e =>
              updateCustomer("callbackTime", e.target.value)
            }
            className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-white"
          >
            <option value="Anytime">Anytime</option>
            <option value="Morning">Morning (9 AM - 12 PM)</option>
            <option value="Afternoon">Afternoon (12 PM - 4 PM)</option>
            <option value="Evening">Evening (4 PM - 7 PM)</option>
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
            I agree to be contacted by TheCarePal regarding my
            care enquiry and understand that this is an indicative
            estimate.
          </span>
        </label>

        {submissionError && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
            {submissionError}
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
              Submitting...
            </>
          ) : (
            "Submit Care Enquiry"
          )}
        </button>

        <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
          <ShieldCheck size={15} />
          Your information is used to process your enquiry.
        </div>
      </form>

      <button
        type="button"
        onClick={onBack}
        className="mt-6 flex items-center gap-2 text-gray-500 hover:text-teal-700"
      >
        <ArrowLeft size={17} />
        Edit Care Plan
      </button>
    </div>
  );
}
