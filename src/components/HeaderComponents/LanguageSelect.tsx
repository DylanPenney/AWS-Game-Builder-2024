import React from "react";
import { useTranslation } from "react-i18next";

import "../../styles/HeaderStyles/LanguageSelect.css";

export const LanguageSelect: React.FC = () => {
  const { t, i18n } = useTranslation();

  const languages = (i18n.options.supportedLngs as string[]).filter(
    (lng) =>
      lng !==
      "cimode" /*remove the weird translation mode from displayed languages https://stackoverflow.com/a/58787968*/
  );

  return (
    <div id="language-select">
      {languages.map((lang, index) => (
        <React.Fragment key={lang}>
          <span
            onClick={() => i18n.changeLanguage(lang)}
            className={i18n.language === lang ? "selected" : "not-selected"}
          >
            {t(lang)}
          </span>
          {index < languages.length - 1 && <span> | </span>}
        </React.Fragment>
      ))}
    </div>
  );
};
