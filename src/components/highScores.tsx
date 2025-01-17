import React from "react";
import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/api";
import { getUrl } from "aws-amplify/storage";
import outputs from "../../amplify_outputs.json";

import { BeatLoader, RingLoader } from "react-spinners";

import "../styles/HighScores.css";
import { useTranslation } from "react-i18next";
import { defaultUser, useUser } from "../utils/UserContext";

import { Schema } from "../../amplify/data/resource";

/**
 * @type {import('aws-amplify/data').Client<import('../amplify/data/resource').Schema>}
 */

Amplify.configure(outputs);
const client = generateClient<Schema>({
  authMode: "apiKey",
});
export const HighScores: React.FC = () => {
  const DEFAULT_RECORDS: number = 15;

  const [waitingForData, setWaitingForData] = React.useState(false);
  const [lastRefreshed, setLastRefreshed] = React.useState(() => {
    const stored = localStorage.getItem("lastRefreshed");
    return stored ? parseInt(stored) : Date.now();
  });
  const [canRefresh, setCanRefresh] = React.useState(true);
  const [scores, setScores] = React.useState<any[]>(() => {
    const stored = localStorage.getItem("highScores");
    return stored ? JSON.parse(stored) : [];
  });
  const { user } = useUser();
  const [t] = useTranslation();

  const [numberOfRecords, setNumberOfRecords] = React.useState(DEFAULT_RECORDS);

  const ONE_MINUTE = 1000 * 60;
  const FIVE_MINUTES = ONE_MINUTE * 5;

  React.useEffect(() => {
    localStorage.setItem("highScores", JSON.stringify(scores));
    localStorage.setItem("lastRefreshed", lastRefreshed.toString());
  }, [scores, lastRefreshed]);

  React.useEffect(() => {
    // Only fetch if we have no scores OR if it's been 5 minutes since last refresh
    const timeSinceLastRefresh = Date.now() - lastRefreshed;
    if (
      (!waitingForData && scores.length === 0) ||
      timeSinceLastRefresh >= FIVE_MINUTES
    ) {
      getHighScores();
    }

    const checkInterval = setInterval(() => {
      const timeSinceLastRefresh = Date.now() - lastRefreshed;
      if (timeSinceLastRefresh >= FIVE_MINUTES) {
        getHighScores();
      }
    }, 5000);

    return () => clearInterval(checkInterval);
  }, [lastRefreshed, scores.length]);

  React.useEffect(() => {
    const buttonStateInterval = setInterval(() => {
      const timeSinceLastRefresh = Date.now() - lastRefreshed;
      setCanRefresh(!waitingForData && timeSinceLastRefresh > ONE_MINUTE);
    }, 1000); // Check every second

    return () => clearInterval(buttonStateInterval);
  }, [lastRefreshed, waitingForData]);

  async function getHighScores() {
    if (waitingForData) {
      return;
    }

    setWaitingForData(true);
    try {
      const { data: highScores } = await client.models.Note.list();
      await Promise.all(
        highScores.map(async (highScore: any) => {
          /*const linkToStorageFile = await getUrl({
            path: `profile_pictures/${highScore.name}/profile_pic.jpg`,
          });*/
          highScore.image = defaultUser.profilePicture; //linkToStorageFile.url;
          highScore.username = highScore.name ? highScore.name : "Anonymous";
        })
      );

      highScores.sort((a: any, b: any) => {
        const diff = b.description - a.description;
        if (diff === 0) {
          // sort by date if scores are the same
          const diff2 =
            new Date(b.updatedAt).getDate() - new Date(a.updatedAt).getDate();
          if (diff2 === 0) {
            // sort by time if scores and dates are the same
            const diff3 =
              new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
            return -diff3;
          }
          return -diff2;
        }
        return diff;
      });

      setLastRefreshed(Date.now());

      setScores(highScores);
      setCanRefresh(false);
    } catch (e) {
      console.log(e);
    } finally {
      setWaitingForData(false);
    }
  }

  // O(n) - yikes!
  const generateOptions = (arrayLength: number): number[] => {
    let options = [1];

    for (let i = 5; i < arrayLength; i += 5) {
      options.push(i);
    }

    if (!options.includes(arrayLength)) {
      options.push(arrayLength);
    } else {
      options.pop();
      options.push(arrayLength);
    }

    return options;
  };

  interface ProfileImageProps {
    src: string;
    fallbackSrc: string;
    alt: string;
  }

  const ProfileImage: React.FC<ProfileImageProps> = ({
    src,
    fallbackSrc,
    alt,
  }) => {
    const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
      e.currentTarget.src = fallbackSrc;
    };
    return <img src={src} alt={alt} onError={handleError} />;
  };

  return (
    <div id="high-scores-component">
      <div id="phase1">
        <h1>{t("high-scores.title")}</h1>
        <span>
          {t("high-scores.last-updated", {
            date: new Date(lastRefreshed).toLocaleString(),
          })}
        </span>
      </div>
      <div id="phase2">
        <div>
          <label htmlFor="numberOfRecords">Number of records</label>
          <select
            onChange={(e) => setNumberOfRecords(parseInt(e.target.value))}
            defaultValue={DEFAULT_RECORDS}
          >
            {generateOptions(scores.length).map((option: number) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        {canRefresh && (
          <button onClick={getHighScores} disabled={waitingForData}>
            {!waitingForData && <span>{t("high-scores.refresh")}</span>}
            <RingLoader color="darkblue" loading={waitingForData} size={15} />
          </button>
        )}
      </div>
      <div id="phase3">
        <table>
          <thead>
            <tr>
              <th>{t("high-scores.user")}</th>
              <th>{t("high-scores.score")}</th>
              <th>Time</th>
            </tr>
          </thead>
          {!waitingForData && (
            <tbody>
              {scores.slice(0, numberOfRecords).map((score: any) => {
                return (
                  <tr
                    className={score.name === user.username ? "user-row" : ""}
                    key={score.id}
                  >
                    <td>
                      <div className="user">
                        <ProfileImage
                          src={score.image}
                          fallbackSrc={defaultUser.profilePicture}
                          alt="profile"
                        />
                        <span>{score.username}</span>
                      </div>
                    </td>
                    <td className="score">{score.description || 0}</td>
                    <td className="date">
                      {new Date(score.updatedAt).toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          )}
        </table>

        <BeatLoader color="darkblue" loading={waitingForData} size={15} />
      </div>
    </div>
  );
};
