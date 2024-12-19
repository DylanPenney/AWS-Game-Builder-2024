// src/types/GameTypes.ts
export interface Position {
  x: number;
  y: number;
}

export interface Item {
  id: string;
  type: "speed_boost" | "jump_boost" | "shield";
  position: Position;
}

export interface Horse {
  position: Position;
  speed: number;
  baseSpeed: number;
  isJumping: boolean;
  effects: {
    speedBoost: number;
    shield: boolean;
  };
}
