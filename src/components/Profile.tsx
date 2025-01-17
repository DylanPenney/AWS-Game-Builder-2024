import React, { useState } from "react";
import "../styles/Profile.css";
import { useTranslation } from "react-i18next";
import { defaultUser, useUser } from "../utils/UserContext";
import naughtyWords from "naughty-words";
import { signOut } from "aws-amplify/auth";

type UsernameErrorCheckResult = {
  e: string /* error message */;
  error: boolean /* whether or not there was an error */;
};

export const Profile: React.FC = () => {
  const { t } = useTranslation();
  const { user, setUser, updateProfilePicture, updateUsername } = useUser();

  /* state for component to know when to show the username change box */
  const [usernameChangeInProgress, setUsernameChangeInProgress] =
    useState(false);

  /* state for component to know when to show the profile picture change upload  box */
  const [pfpChangeInProgress, setPfpChangeInProgress] = useState(false);

  /* state for component to know when to show the login box */
  const [userLoggingIn, setUserLoggingIn] = useState(false);

  const usernameRegex = /^[a-zA-Z0-9]*$/;

  if (!user.isLoggedIn) {
    return (
      <div id="profile-component-guest">
        <img id="profile-picture" src={defaultUser.profilePicture}></img>
        <span>
          {t("profile.user-page-greeting", { name: defaultUser.username })}
        </span>
        <button>
          <span onClick={() => setUserLoggingIn(true)}>
            {t("common.sign-in")}
          </span>
        </button>
        {userLoggingIn && (
          <div id="login-box">
            <textarea id="username" placeholder="Username"></textarea>
            <button onClick={() => handleLoginRequest()}>
              {t("profile.submit")}
            </button>
          </div>
        )}
      </div>
    );
  }

  function handleLoginRequest() {
    const newUsername = (
      document.getElementById("username") as HTMLInputElement
    ).value;
    let res = validateUsername(newUsername);
    if (res.error) {
      alert(t(res.e));
      return;
    }
    setUserLoggingIn(false);
    setUser({
      isLoggedIn: true,
      username: newUsername,
      profilePicture: "defaultUser.jpg",
      email: user.email,
    });
  }

  function changeUsername(newUsername: string) {
    updateUsername(newUsername);
  }

  function handleUsernameChangeRequest(newUsername: string) {
    const res = validateUsername(newUsername);
    if (res.error) {
      return res.e;
    }
  }

  function containsProfanity(str: string): boolean {
    const lower = str.toLowerCase();

    // Check against multiple language lists - doesnt pass scunthorpe problem but fuck it
    return (
      naughtyWords.en.some((word) => lower.includes(word)) ||
      naughtyWords.fr.some((word) => lower.includes(word)) ||
      naughtyWords.es.some((word) => lower.includes(word)) ||
      naughtyWords.zh.some((word) => lower.includes(word))
    );
  }

  /* prevent RCE, SQL injection, XSS, racism, profanity, etc. */
  function validateUsername(newUsername: string): UsernameErrorCheckResult {
    let res: UsernameErrorCheckResult = {
      e: "",
      error: false,
    };

    if (containsProfanity(newUsername)) {
      res.e = "profile.errors.profanity";
      res.error = true;
      return res;
    }

    if (!usernameRegex.test(newUsername)) {
      res.e = "profile.errors.invalid";
      res.error = true;
      return res;
    }

    if (newUsername === user.username) {
      res.e = "profile.errors.dupe";
      res.error = true;
      return res;
    }

    if (newUsername.length < 3) {
      res.e = "profile.errors.short";
      res.error = true;
      return res;
    }

    // valid username
    return res;
  }

  function showUsernameChange() {
    // close current open dialog box (if open) and open correct one
    setPfpChangeInProgress(false);
    setUsernameChangeInProgress(true);
  }

  function showPFPChange() {
    // close current open dialog box (if open) and open correct one
    setUsernameChangeInProgress(false);
    setPfpChangeInProgress(true);
  }

  function submitNewDetails() {
    if (usernameChangeInProgress) {
      const newUsername = (
        document.getElementById("new-username") as HTMLInputElement
      ).value;

      const err = handleUsernameChangeRequest(newUsername);
      if (err) {
        console.log(err);
        console.log(t(err));
        alert(t(err));
        return;
      }
      changeUsername(newUsername);
    }
    if (pfpChangeInProgress) {
      const newPFP = (document.getElementById("new-pfp") as HTMLInputElement)
        .value;
      updateProfilePicture(newPFP);
    }
  }

  return (
    <div id="profile-component">
      <div id="sign-out-button">
        <button
          onClick={() => {
            setUser(defaultUser);
            signOut();
          }}
        >
          {t("common.sign-out")}
        </button>
      </div>
      <img id="profile-picture" src={user.profilePicture}></img>
      <span>{t("profile.user-page-greeting", { name: user.username })}</span>

      <div id="user-change-detail-buttons-container">
        <button onClick={showUsernameChange}>
          <span>{t("profile.change-username")}</span>
        </button>
        <button onClick={showPFPChange}>
          <span>{t("profile.change-pfp")}</span>
        </button>
      </div>

      {(usernameChangeInProgress || pfpChangeInProgress) && (
        <div id="new-detail-container">
          {usernameChangeInProgress && (
            <div>
              <textarea id="new-username" placeholder="New username"></textarea>
            </div>
          )}

          {pfpChangeInProgress && (
            <div>
              <button>{t("profile.upload")}</button>
            </div>
          )}

          <button onClick={submitNewDetails}>
            <span>{t("profile.submit")}</span>
          </button>

          <button
            onClick={() => {
              setUsernameChangeInProgress(false);
              setPfpChangeInProgress(false);
            }}
          >
            <span>{t("profile.cancel")}</span>
          </button>
        </div>
      )}
    </div>
  );
};
