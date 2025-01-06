import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "../styles/Header.css";

const BUTTONS = ["Play", "Settings", "Help"];
const BUTTONS_DEV = ["High Scores", "Dev Menu"];

const DEV =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";

export const Header: React.FC = () => {
  const navigate = useNavigate();

  function selectPage({ button }: { button: string }) {
    return () => {
      // set the selectedPage to the button that was clicked
      // if the button is already selected, do nothing
      // and ensure the app can access this variable

      navigate(`/${button.toLowerCase()}`);
    };
  }

  if (DEV && !BUTTONS.includes(BUTTONS_DEV[0])) {
    BUTTONS_DEV.forEach((button: string) => {
      BUTTONS.push(button);
    });
  }
  return (
    <div id="menu">
      <img
        src="/favicon.png"
        alt="logo.png"
        onClick={selectPage({ button: "Play" })}
      />

      <div id="headerButtonsContainer">
        {BUTTONS.map((button) => (
          <div className="buttonContainer" key={button}>
            <NavLink
              to={`/${button.toLowerCase()}`}
              className={({ isActive }) => (isActive ? "selected" : "")}
            >
              {button}
            </NavLink>
          </div>
        ))}
      </div>
    </div>
  );
};
