import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

import en from "./locales/en/translation.json";
import fr from "./locales/fr/translation.json";
import de from "./locales/de/translation.json";
import es from "./locales/es/translation.json";
import ar from "./locales/ar/translation.json";
import jp from "./locales/jp/translation.json";
import zh from "./locales/zh/translation.json";
import ru from "./locales/ru/translation.json";

const resources = {
  en: { translation: en },
  fr: { translation: fr },
  de: { translation: de },
  es: { translation: es },
  ar: { translation: ar },
  jp: { translation: jp },
  zh: { translation: zh },
  ru: { translation: ru },
};

const STORAGE_KEY = "i18n_language";

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "en",
    detection: {
      order: ["localStorage", "navigator", "htmlTag"],
      lookupLocalStorage: STORAGE_KEY,
      caches: ["localStorage"],
    },
    interpolation: {
      escapeValue: false,
    },
  });

if (typeof window !== "undefined") {
  i18n.on("languageChanged", (lang: string) => {
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // ignore storage errors
    }
    const dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
  });
}

export function setLanguage(lang: string) {
  i18n.changeLanguage(lang);
}

export default i18n;
