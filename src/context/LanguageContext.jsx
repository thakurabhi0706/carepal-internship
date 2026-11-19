import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import en from "../locales/en";
import hi from "../locales/hi";

const translations = { en, hi };
const LanguageContext = createContext(null);
const STORAGE_KEY = "thecarepal-language";

function getInitialLanguage() {
  try {
    return localStorage.getItem(STORAGE_KEY) === "hi" ? "hi" : "en";
  } catch {
    return "en";
  }
}

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(getInitialLanguage);

  useEffect(() => {
    document.documentElement.lang = language;
    try {
      localStorage.setItem(STORAGE_KEY, language);
    } catch (error) {
      console.error("Unable to save language preference:", error);
    }
  }, [language]);

  const t = useCallback((key, values = {}) => {
    const message = key.split(".").reduce((value, part) => value?.[part], translations[language])
      ?? key.split(".").reduce((value, part) => value?.[part], en)
      ?? key;

    return String(message).replace(/\{(\w+)\}/g, (match, name) =>
      Object.hasOwn(values, name) ? values[name] : match
    );
  }, [language]);

  const value = useMemo(() => ({ language, setLanguage, t }), [language, t]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used inside LanguageProvider");
  }
  return context;
}
