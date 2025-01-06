// src/App.tsx
import React from "react";
import { Game } from "./components/Game";
import { Header } from "./components/Header";
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  const selectedPage = "Play";

  return (
    <div className="App">
      <BrowserRouter>
        <Header />
        <Routes>
          <Route path="/play" element={<Game />} />
          <Route path="/settings" element={<Game />} />
          <Route path="/help" element={<Game />} />
          <Route path="/high-scores" element={<Game />} />
          <Route path="/dev-menu" element={<Game />} />
        </Routes>
      </BrowserRouter>
      <Game />
      <div>
        <span>{selectedPage}</span>
      </div>
    </div>
  );
}

export default App;
