import { FetchUserAttributesOutput } from "@aws-amplify/auth";
import React, { createContext, useState, useContext } from "react";
import { getAmplifyCreds } from "./AWScontext";

export type User = {
  username: string;
  email: string;
};

// use if aws fails
export const defaultUser: User = {
  username: "AnonymousUser" + Math.floor(Math.random() * 1000),
  email: "",
};

let amplifyUser: User = defaultUser;

try {
  const amplifyCredentials: FetchUserAttributesOutput = await getAmplifyCreds();

  if (
    amplifyCredentials &&
    amplifyCredentials.email_verified &&
    amplifyCredentials.email
  ) {
    amplifyUser = { ...amplifyUser, email: amplifyCredentials.email };
  }

  if (amplifyCredentials && amplifyCredentials.username) {
    amplifyUser = { ...amplifyUser, username: amplifyCredentials.username };
  }
} catch (e) {
  console.log(e);
}

type UserContextType = {
  user: User;
  setUser: (user: User) => void;
  updateUsername: (username: string) => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Initialize state with default values
  const [user, setUser] = useState<User>(() => {
    try {
      return amplifyUser || defaultUser;
    } catch (e) {
      localStorage.removeItem("user");
      return defaultUser;
    }
  });

  // Helper function to save user state to localStorage
  const saveUser = (newUserState: User) => {
    localStorage.setItem("user", JSON.stringify(newUserState));
    setUser(newUserState);
  };

  // Convenience methods for updating specific user properties
  const updateUsername = (username: string) => {
    saveUser({ ...user, username });
  };

  return (
    <UserContext.Provider
      value={{
        user,
        setUser: saveUser,
        updateUsername,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
