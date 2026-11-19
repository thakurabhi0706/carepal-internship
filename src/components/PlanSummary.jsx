
import { MapPin, Clock, CalendarDays, Heart } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

export default function PlanSummary({ plan }) {
  const { t } = useLanguage();
  const careLabels = {
    elderly: t("common.elderlyCare"),
    dementia: t("common.dementiaCare"),
    baby: t("common.babyCare"),
    recovery: t("common.recoveryCare")
  };
  const items = [
    {
      icon: Heart,
      label: t("common.careType"),
      value: careLabels[plan.careType] || t("common.notSelected")
    },
    {
      icon: MapPin,
      label: t("common.city"),
      value: plan.city || t("common.notSelected")
    },
    {
      icon: Clock,
      label: t("common.dailyHours"),
      value: plan.hoursPerDay
        ? `${plan.hoursPerDay} ${t("common.hours")}`
        : t("common.notSelected")
    },
    {
      icon: CalendarDays,
      label: t("common.duration"),
      value: plan.durationDays
        ? `${plan.durationDays} ${t("common.days")}`
        : t("common.notSelected")
    }
  ];

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5">
      <h3 className="font-bold text-gray-800 mb-5">
        {t("summary.title")}
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
