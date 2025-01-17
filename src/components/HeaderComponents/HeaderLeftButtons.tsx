import React from "react";
import { NavLink } from "react-router-dom";
import { LanguageSelect } from "./LanguageSelect";

import "../../styles/HeaderStyles/Header.css";

export const HeaderLeftButtonsContainer: React.FC = () => {
  return (
    <div id="header-left-buttons-container">
      <div id="home-button">
        <NavLink to="">
          <img src="/favicon.png" alt="logo.png" />
        </NavLink>
      </div>
      <LanguageSelect />
    </div>
  );
};
