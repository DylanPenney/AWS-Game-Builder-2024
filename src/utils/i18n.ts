import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import HttpBackend from "i18next-http-backend";

i18n
  .use(HttpBackend)
  .use(initReactI18next) // Integrates with React
  .init({
    backend: {
      loadPath: "/translations/{{lng}}.json", // Path to your translation files
    },
    lng: "en", // Default language
    supportedLngs: ["en", "fr", "zh", "es"], // Supported languages
    fallbackLng: "en", // Fallback language
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    react: { useSuspense: false },
  });

export default i18n;
