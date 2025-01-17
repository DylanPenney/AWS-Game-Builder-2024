import { useState, useEffect } from "react";
import {
  Authenticator,
  Button,
  Text,
  TextField,
  Heading,
  Flex,
  View,
  Image,
  Grid,
  Divider,
} from "@aws-amplify/ui-react";
import { Amplify } from "aws-amplify";
import "@aws-amplify/ui-react/styles.css";
import { generateClient } from "aws-amplify/data";
import outputs from "../amplify_outputs.json";
import { uploadData, getUrl } from "aws-amplify/storage";
import { fetchUserAttributes } from "aws-amplify/auth";

import { BrowserRouter, Routes, Route } from "react-router-dom";

import React from "react";
import { Game } from "./components/Game";
import { Header } from "./components/HeaderComponents/Header";
import { HighScores } from "./components/highScores";
import { Profile } from "./components/Profile";

import { Navigate } from "react-router-dom";

import { UserProvider } from "./utils/UserContext";
import "./styles/App.css";

import "./utils/i18n";

/**
 * @type {import('aws-amplify/data').Client<import('../amplify/data/resource').Schema>}
 */

Amplify.configure(outputs);
const client = generateClient({
  authMode: "apiKey",
});

export default function App() {
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    fetchNotes();
  }, []);

  async function fetchNotes() {
    const { data: notes } = await client.models.Note.list();
    await Promise.all(
      notes.map(async (note) => {
        if (note.image) {
          /*const linkToStorageFile = await getUrl({
            path: `profile_pictures/${note.name}/profile_pic.jpg`,
          });
          note.image = linkToStorageFile.url;*/
        }
        return note;
      })
    );
    setNotes(notes);
  }

  async function uploadProfilePicture(event) {
    event.preventDefault();
    const form = new FormData(event.target);
    const file = form.get("profilePicture");
    if (!file) {
      alert("Please select an image file.");
      return;
    }
    const userAttributes = await fetchUserAttributes();
    const email = userAttributes.email; // Access email attribute

    try {
      // Upload the image to S3
      uploadData({
        path: `profile_pictures/${email}/profile_pic.jpg`,
        data: file,
      });

      alert("Profile picture uploaded successfully!");
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      alert("Error uploading profile picture. Please try again.");
    }
  }

  async function storeHighscore(highscore) {
    try {
      // Fetch current user attributes
      const userAttributes = await fetchUserAttributes();
      const email = userAttributes.email; // Access email attribute

      // Store highscore in the database
      const { data: newHighscore } = await client.models.Note.create({
        name: email, // Storing email as username
        description: highscore,
        image: true,
      });

      console.log("Highscore stored successfully:", newHighscore);
    } catch (error) {
      console.error("Error storing highscore:", error);
    }
  }

  return (
    <div className="App">
      <Authenticator>
        <UserProvider>
          <BrowserRouter>
            <Header />
            <Routes>
              <Route path="/" element={<Navigate to="/play" replace />} />
              <Route path="/play" element={<Game />} />
              <Route path="/high-scores" element={<HighScores />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="*" element={<Navigate to="/play" replace />} />
            </Routes>
          </BrowserRouter>
        </UserProvider>
      </Authenticator>
    </div>
  );
}
