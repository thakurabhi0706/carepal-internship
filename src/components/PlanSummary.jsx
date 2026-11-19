
import { MapPin, Clock, CalendarDays, Heart } from "lucide-react";

const careLabels = {
  elderly: "Elderly Care",
  dementia: "Alzheimer's / Dementia Care",
  baby: "Baby Care",
  recovery: "Post-Surgery Recovery"
};

export default function PlanSummary({ plan }) {
  const items = [
    {
      icon: Heart,
      label: "Care Type",
      value: careLabels[plan.careType] || "Not selected"
    },
    {
      icon: MapPin,
      label: "City",
      value: plan.city || "Not selected"
    },
    {
      icon: Clock,
      label: "Daily Hours",
      value: plan.hoursPerDay
        ? `${plan.hoursPerDay} hours`
        : "Not selected"
    },
    {
      icon: CalendarDays,
      label: "Duration",
      value: plan.durationDays
        ? `${plan.durationDays} days`
        : "Not selected"
    }
  ];

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5">
      <h3 className="font-bold text-gray-800 mb-5">
        Your Care Plan
      </h3>

      <div className="space-y-5">
        {items.map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-start gap-3">
            <div className="bg-teal-50 p-2 rounded-lg">
              <Icon size={17} className="text-teal-600" />
            </div>

            <div>
              <p className="text-xs text-gray-400">{label}</p>
              <p className="text-sm font-semibold text-gray-800 mt-1">
                {value}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
