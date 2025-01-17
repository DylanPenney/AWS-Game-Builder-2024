import React from "react";
import "../../styles/HeaderStyles/Header.css";
import { HeaderMidButtonsContainer } from "./HeaderMiddleButtons";
import { ProfileHamburger } from "./ProfileHamburger";
import { HeaderLeftButtonsContainer } from "./HeaderLeftButtons";

export const Header: React.FC = () => {
  return (
    <div id="menu">
      <HeaderLeftButtonsContainer />

      <HeaderMidButtonsContainer />

      <ProfileHamburger />
    </div>
  );
};
