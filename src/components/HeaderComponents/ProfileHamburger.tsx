import React from "react";
import "../../styles/HeaderStyles/ProfileStyles.css";
import { NavLink } from "react-router-dom";
import { defaultUser, useUser } from "../../utils/UserContext";
import { useTranslation } from "react-i18next";
import { signOut } from "@aws-amplify/auth";

export const ProfileHamburger: React.FC = () => {
  const [isHovered, setIsHovered] = React.useState(false);
  const { user, setUser } = useUser();
  const { t } = useTranslation();
  return (
    <div
      id="profile"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div id="always-visible">
        <NavLink to="/profile">
          <img src={user.profilePicture} alt="pp" />
        </NavLink>
      </div>
      {isHovered && (
        <div id="profile-hover">
          {user.isLoggedIn && (
            <div id="profile-hover-content-username">
              <span>
                {t("header.profile.logged-in-as", { name: user.username })}
              </span>
            </div>
          )}
          {user.isLoggedIn && (
            <div id="profile-hover-content-logout">
              <span
                onClick={() => {
                  setUser(defaultUser);
                  signOut();
                }}
              >
                {t("common.sign-out")}
              </span>
            </div>
          )}
          {!user.isLoggedIn && (
            <div id="profile-hover-content-login">
              <span>
                {t("header.profile.not-logged-in-reminder")}{" "}
                <NavLink to="/profile">
                  <u>({t("header.profile.log-in")})</u>
                </NavLink>
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
