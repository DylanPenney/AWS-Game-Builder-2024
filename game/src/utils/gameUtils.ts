// src/utils/gameUtils.ts
import { Item, Position } from "../types/GameTypes";
import { v4 as uuidv4 } from "uuid";

export const generateRandomItem = (
  gameWidth: number,
  gameHeight: number,
): Item => {
  const types = ["speed_boost", "jump_boost", "shield"] as const;
  const randomType = types[Math.floor(Math.random() * types.length)];

  return {
    id: uuidv4(),
    type: randomType,
    position: {
      x: Math.random() * (gameWidth - 30),
      y: Math.random() * (gameHeight - 30),
    },
  };
};
