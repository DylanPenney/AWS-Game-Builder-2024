import React from "react";

export const Settings: React.FC = () => {
  return (
    <div>
      <h1>Settings</h1>
      <div>
        <label htmlFor="difficulty">Difficulty</label>
        <select name="difficulty" id="difficulty">
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
      </div>
    </div>
  );
};
