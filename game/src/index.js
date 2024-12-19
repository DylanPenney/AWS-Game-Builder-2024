import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

const controls = ReactDOM.createRoot(document.getElementById("controls"));
controls.render(
  <React.StrictMode>
    <div className="controls">
      <div className="controls__title">Controls</div>
      <div className="controls__description">
        Use the arrow keys to move the player. Use the space bar to shoot. Use
        the escape key to pause the game.
      </div>
    </div>
  </React.StrictMode>,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
