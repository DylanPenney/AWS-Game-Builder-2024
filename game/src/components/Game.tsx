// src/components/Game.tsx
import React, { useEffect, useRef, useState } from "react";
import { Horse, Item, Position } from "../types/GameTypes";
import { generateRandomItem } from "../utils/gameUtils";
import "../styles/Game.css";

const GAME_WIDTH = 800;
const GAME_HEIGHT = 400;
const HORSE_WIDTH = 60;
const HORSE_HEIGHT = 40;

export const Game: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [horse, setHorse] = useState<Horse>({
    position: { x: 50, y: GAME_HEIGHT - HORSE_HEIGHT - 10 },
    speed: 5,
    baseSpeed: 5,
    isJumping: false,
    effects: {
      speedBoost: 0,
      shield: false,
    },
  });
  const [items, setItems] = useState<Item[]>([]);
  const [gameLoop, setGameLoop] = useState<number | null>(null);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowRight":
          moveHorse("right");
          break;
        case "ArrowLeft":
          moveHorse("left");
          break;
        case "Space":
        case " ":
          jump();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, []);

  const moveHorse = (direction: "left" | "right") => {
    setHorse((prev) => {
      const newX =
        direction === "right"
          ? Math.min(prev.position.x + prev.speed, GAME_WIDTH - HORSE_WIDTH)
          : Math.max(prev.position.x - prev.speed, 0);

      return {
        ...prev,
        position: {
          ...prev.position,
          x: newX,
        },
      };
    });
  };

  const jump = () => {
    if (!horse.isJumping) {
      setHorse((prev) => ({ ...prev, isJumping: true }));
      const jumpHeight = 100;
      const jumpDuration = 500;

      // Jump up
      const originalY = horse.position.y;
      const jumpUp = setInterval(() => {
        setHorse((prev) => ({
          ...prev,
          position: {
            ...prev.position,
            y: Math.max(prev.position.y - 5, originalY - jumpHeight),
          },
        }));
      }, 20);

      // Return to ground
      setTimeout(() => {
        clearInterval(jumpUp);
        const fallDown = setInterval(() => {
          setHorse((prev) => {
            const newY = Math.min(
              prev.position.y + 5,
              GAME_HEIGHT - HORSE_HEIGHT - 10,
            );
            if (newY === GAME_HEIGHT - HORSE_HEIGHT - 10) {
              clearInterval(fallDown);
              setHorse((p) => ({ ...p, isJumping: false }));
            }
            return {
              ...prev,
              position: {
                ...prev.position,
                y: newY,
              },
            };
          });
        }, 20);
      }, jumpDuration / 2);
    }
  };

  const spawnItem = () => {
    if (Math.random() < 0.02) {
      // 2% chance each frame
      const newItem = generateRandomItem(GAME_WIDTH, GAME_HEIGHT);
      setItems((prev) => [...prev, newItem]);
    }
  };

  const checkItemCollision = () => {
    setItems((prevItems) => {
      return prevItems.filter((item) => {
        const collision =
          Math.abs(item.position.x - horse.position.x) < HORSE_WIDTH &&
          Math.abs(item.position.y - horse.position.y) < HORSE_HEIGHT;

        if (collision) {
          applyItemEffect(item);
          return false;
        }
        return true;
      });
    });
  };

  const applyItemEffect = (item: Item) => {
    setHorse((prev) => {
      switch (item.type) {
        case "speed_boost":
          return {
            ...prev,
            speed: prev.baseSpeed * 1.5,
            effects: { ...prev.effects, speedBoost: 3000 },
          };
        case "shield":
          return {
            ...prev,
            effects: { ...prev.effects, shield: true },
          };
        default:
          return prev;
      }
    });

    if (item.type === "speed_boost") {
      setTimeout(() => {
        setHorse((prev) => ({
          ...prev,
          speed: prev.baseSpeed,
          effects: { ...prev.effects, speedBoost: 0 },
        }));
      }, 3000);
    }
  };

  useEffect(() => {
    /*
    const loop = setInterval(() => {
      spawnItem();
      checkItemCollision();
      setScore((prev) => prev + 1);
    }, 1000 / 60);

    //setGameLoop(loop)
    return () => clearInterval(loop);*/
  }, []);

  return (
    <div className="game-container">
      <div className="game-stats">
        <span>Score: {score}</span>
        {horse.effects.speedBoost > 0 && <span>Speed Boost Active!</span>}
        {horse.effects.shield && <span>Shield Active!</span>}
      </div>
      <canvas
        ref={canvasRef}
        width={GAME_WIDTH}
        height={GAME_HEIGHT}
        className="game-canvas"
      />
    </div>
  );
};
