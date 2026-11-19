import { useLanguage } from "../context/LanguageContext";

export default function LanguageToggle() {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div
      className="inline-flex items-center rounded-lg border border-gray-200 bg-white p-1 text-xs sm:text-sm"
      role="group"
      aria-label={t("language.label")}
    >
      <button
        type="button"
        onClick={() => setLanguage("en")}
        aria-pressed={language === "en"}
        className={`rounded-md px-2.5 py-1.5 font-semibold transition ${
          language === "en" ? "bg-teal-600 text-white" : "text-gray-600 hover:bg-gray-50"
        }`}
      >
        {t("language.english")}
      </button>
      <button
        type="button"
        onClick={() => setLanguage("hi")}
        aria-pressed={language === "hi"}
        className={`rounded-md px-2.5 py-1.5 font-semibold transition ${
          language === "hi" ? "bg-teal-600 text-white" : "text-gray-600 hover:bg-gray-50"
        }`}
      >
        {t("language.hindi")}
      </button>
    </div>
  );
}
