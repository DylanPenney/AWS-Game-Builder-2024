import React from "react";
import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";

import "../../styles/HeaderStyles/Header.css";

const BUTTONS = ["header.play", "header.high-scores"];

export const HeaderMidButtonsContainer: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div id="header-middle-buttons-container">
      {BUTTONS.map((button) => (
        <div className="buttonContainer" key={button}>
          <NavLink
            to={`/${button
              .toLowerCase()
              .replace(" ", "-")
              .replace("header.", "")}`}
            className={({ isActive }) => (isActive ? "selected" : "")}
          >
            {t(button)}
          </NavLink>
        </div>
      ))}
    </div>
  );
};
