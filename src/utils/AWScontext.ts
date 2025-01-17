import { Amplify } from "aws-amplify";

import outputs from "../../amplify_outputs.json";

import { generateClient } from "aws-amplify/data";
import { type Schema } from "../../amplify/data/resource";
import { type User, defaultUser } from "./UserContext";
import {
  fetchUserAttributes,
  FetchUserAttributesOutput,
} from "@aws-amplify/auth";

export interface HighscoreSubmissionsRequestObject {
  success: boolean;
  err?: string;
}

Amplify.configure(outputs);
const client = generateClient<Schema>();

export async function getAmplifyCreds(): Promise<FetchUserAttributesOutput> {
  const data: FetchUserAttributesOutput = await fetchUserAttributes();
  return data;
}

/**
 * This function will handle the submission of a highscore to the database
 * @param highscore the score that the user submitachievedted
 * @param user the user that submitted the highscore
 * @returns
 */
export async function handleHighscoreSubmission(
  highscore: number,
  user: User
): Promise<HighscoreSubmissionsRequestObject> {
  console.log("User: ", user);
  console.log("Highscore: ", highscore);
  if (highscore < 0) {
    return {
      success: false,
      err: "Highscore cannot be negative",
    };
  }

  if (!user.email || user.email === defaultUser.email) {
    return {
      success: false,
      err: "User is not logged in [EMAIL]",
    };
  }

  let res = await storeHighscore(highscore, user);

  if (!res) {
    return {
      success: false,
      err: "An internal error occurred",
    };
  }

  return {
    success: true,
  };
}

/**
 * This function will store data in dynamo db
 * @param highscore the score that the user achieved
 * @param user the user that submitted the highscore
 * @returns a promise that resolves to a boolean indicating whether the highscore was stored successfully
 */
async function storeHighscore(highscore: number, user: User): Promise<boolean> {
  try {
    const payload = {
      name: user.email,
      description: highscore.toString(),
      username: user.username || defaultUser.username,
    };

    console.info("Sending storage request\n Payload: ", payload);

    await client.models.Note.create(payload);
    return true;
  } catch (e) {
    console.info("Error storing highscore:", e);
    return false;
  }
}
