import React, { useEffect, useRef, useState } from "react";
import "../styles/Game.css";

import backgroundImage from "../assets/images/background.png";
import horseImageNormal from "../assets/images/normal.png";
import horseImageNormal2 from "../assets/images/normal2.png";
import horseImageJump from "../assets/images/jumping.png";
import hurdleImageSrc1 from "../assets/images/hurdle1.png";
import hurdleImageSrc2 from "../assets/images/hurdle2.png";

import { useTranslation } from "react-i18next";
import { defaultUser, useUser } from "../utils/UserContext";

import { Amplify } from "aws-amplify";
import outputs from "../../amplify_outputs.json";
import { generateClient } from "aws-amplify/data";
import { type Schema } from "../../amplify/data/resource";

import { handleHighscoreSubmission } from "../utils/AWScontext";

const GAME_WIDTH = 800;
const GAME_HEIGHT = 400;
const HORSE_WIDTH = 65;
const HORSE_HEIGHT = 50;
const HURDLE_WIDTH = 50;
const HURDLE_HEIGHT = 70;
const MIN_HURDLE_DISTANCE = 175;
const BACKGROUND_MOVE_SPEED = 3;

const RED_HURDLE_COLOR = { r: 238, g: 22, b: 25 };
const YELLOW_HURDLE_COLOR = { r: 255, g: 240, b: 0 };
const COLOR_TOLERANCE = 10;

export const Game: React.FC = () => {
  const SPRITE_SWITCH_INTERVAL = 150;
  const [currentRunningSprite, setCurrentRunningSprite] = useState(0);
  const [score, setScore] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const animationFrameRef = useRef<number | null>(null);
  const backgroundXRef = useRef(0);
  const horseYRef = useRef(GAME_HEIGHT - HORSE_HEIGHT - 10);
  const isJumpingRef = useRef(false); // checks if horse is jumping
  const obstaclesRef = useRef<
    { x: number; y: number; image: HTMLImageElement }[]
  >([]); // list of hurdles on the canvas
  const [gameOver, setGameOver] = useState(false);

  const { user } = useUser();
  const { t } = useTranslation();

  // Resets all game state variables to their initial values for a new game
  const restartGame = () => {
    setScore(0);
    setGameOver(false);
    horseYRef.current = GAME_HEIGHT - HORSE_HEIGHT - 10;
    obstaclesRef.current = [];
    backgroundXRef.current = 0;
    isJumpingRef.current = false;
  };

  const colorsMatch = (
    r1: number,
    g1: number,
    b1: number,
    r2: number,
    g2: number,
    b2: number
  ) => {
    return (
      Math.abs(r1 - r2) <= COLOR_TOLERANCE &&
      Math.abs(g1 - g2) <= COLOR_TOLERANCE &&
      Math.abs(b1 - b2) <= COLOR_TOLERANCE
    );
  };

  // Collision occurs when horse interacts with hurdle colours, not hurdle images
  const detectColorCollision = (ctx: CanvasRenderingContext2D): boolean => {
    const horseX = 50;
    const horseY = horseYRef.current;

    const imageData = ctx.getImageData(
      horseX,
      horseY,
      HORSE_WIDTH,
      HORSE_HEIGHT
    );
    const { data } = imageData;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      if (
        colorsMatch(
          r,
          g,
          b,
          RED_HURDLE_COLOR.r,
          RED_HURDLE_COLOR.g,
          RED_HURDLE_COLOR.b
        ) ||
        colorsMatch(
          r,
          g,
          b,
          YELLOW_HURDLE_COLOR.r,
          YELLOW_HURDLE_COLOR.g,
          YELLOW_HURDLE_COLOR.b
        )
      ) {
        return true;
      }
    }

    return false;
  };

  // handles jump logic
  const jump = () => {
    if (isJumpingRef.current || gameOver) return;
    isJumpingRef.current = true;

    const originalY = GAME_HEIGHT - HORSE_HEIGHT - 10;
    let velocity = -10; // initial upwards velocity
    const gravity = 0.5; // gravity force

    const jumpInterval = setInterval(() => {
      horseYRef.current += velocity;
      velocity += gravity;

      if (horseYRef.current >= originalY) {
        horseYRef.current = originalY;
        clearInterval(jumpInterval);
        isJumpingRef.current = false;
      }
    }, 20);
  };

  /*async function storeHighscore(highscore: number) {
    try {
      // Fetch current user attributes
      if (!user.email) {
        return;
      }
      const email = user.email; // Access email attribute

      // Store highscore in the database
      const newHighscore = {
        name: email, // Storing email as username
        description: highscore.toString(),
        image: user.profilePicture || defaultUser.profilePicture,
        username: user.username == "" ? user.username : defaultUser.username,
      };
      console.log(newHighscore);
      await client.models.Note.create(newHighscore);

      console.log("Highscore stored successfully:", newHighscore);
    } catch (error) {
      console.error("Error storing highscore:", error);
    }
  }*/

  // Updates score when game is running
  useEffect(() => {
    if (gameOver) return;

    const scoreInterval = setInterval(() => {
      setScore((prevScore) => prevScore + 1);
    }, 75); // increment score every 75 ms

    return () => {
      clearInterval(scoreInterval);
    };
  }, [gameOver]);

  // Horse running animation
  useEffect(() => {
    if (gameOver) return;

    const spriteInterval = setInterval(() => {
      if (!isJumpingRef.current) {
        setCurrentRunningSprite((prev) => (prev === 0 ? 1 : 0));
      }
    }, SPRITE_SWITCH_INTERVAL);

    return () => clearInterval(spriteInterval);
  }, [gameOver]);

  // Main Game Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");

    const background = new Image();
    background.src = backgroundImage;

    const horseImageNormalSprite = new Image();
    horseImageNormalSprite.src = horseImageNormal;

    const horseImageNormalSprite2 = new Image();
    horseImageNormalSprite2.src = horseImageNormal2;

    const horseImageJumpSprite = new Image();
    horseImageJumpSprite.src = horseImageJump;

    const hurdleImage1 = new Image();
    hurdleImage1.src = hurdleImageSrc1;

    const hurdleImage2 = new Image();
    hurdleImage2.src = hurdleImageSrc2;

    const gameLoop = () => {
      if (ctx && canvas) {
        // Render game over screen
        if (gameOver) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = "black";
          ctx.font = "48px Arial";
          ctx.textAlign = "center";
          ctx.fillText(t("game.game-over"), GAME_WIDTH / 2, GAME_HEIGHT / 2);
          ctx.font = "32px Arial";
          ctx.fillText(
            t("game.final-score", { scr: score }),
            GAME_WIDTH / 2,
            GAME_HEIGHT / 2 + 50
          );

          // Restart Button
          ctx.fillStyle = "white";
          ctx.fillRect(GAME_WIDTH / 2 - 100, GAME_HEIGHT / 2 + 80, 200, 50);
          ctx.fillStyle = "black";
          ctx.font = "24px Arial";
          ctx.fillText(
            t("game.restart"),
            GAME_WIDTH / 2,
            GAME_HEIGHT / 2 + 115
          );

          if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
          }
          return;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Background scrolling
        backgroundXRef.current -= BACKGROUND_MOVE_SPEED;
        if (backgroundXRef.current <= -GAME_WIDTH) {
          backgroundXRef.current = 0;
        }

        const currentSprite = isJumpingRef.current
          ? horseImageJumpSprite
          : currentRunningSprite === 0
          ? horseImageNormalSprite
          : horseImageNormalSprite2;

        // Draw background
        ctx.drawImage(
          background,
          backgroundXRef.current,
          0,
          GAME_WIDTH,
          GAME_HEIGHT
        );
        ctx.drawImage(
          background,
          backgroundXRef.current + GAME_WIDTH,
          0,
          GAME_WIDTH,
          GAME_HEIGHT
        );

        // Draw horse
        ctx.drawImage(
          currentSprite,
          50,
          horseYRef.current,
          HORSE_WIDTH,
          HORSE_HEIGHT
        );

        // Hurdle spawning and movement
        if (Math.random() < 0.02) {
          const lastObstacle =
            obstaclesRef.current[obstaclesRef.current.length - 1];
          const canSpawn =
            !lastObstacle || lastObstacle.x < GAME_WIDTH - MIN_HURDLE_DISTANCE;

          if (canSpawn) {
            const selectedHurdleImage =
              Math.random() < 0.5 ? hurdleImage1 : hurdleImage2;
            obstaclesRef.current.push({
              x: GAME_WIDTH,
              y: GAME_HEIGHT - HURDLE_HEIGHT - 3,
              image: selectedHurdleImage,
            });
          }
        }

        obstaclesRef.current = obstaclesRef.current.filter((obstacle) => {
          obstacle.x -= BACKGROUND_MOVE_SPEED;

          ctx.drawImage(
            obstacle.image,
            obstacle.x,
            obstacle.y,
            HURDLE_WIDTH,
            HURDLE_HEIGHT
          );

          return obstacle.x + HURDLE_WIDTH > 0;
        });

        // Score display
        ctx.fillStyle = "black";
        ctx.font = "24px Arial";
        ctx.textAlign = "left"; // Ensure score label position consistency
        ctx.fillText(t("game.score", { scr: score }), 10, 30);

        // Check for collisions
        if (detectColorCollision(ctx)) {
          // storeHighScore(score);
          handleHighscoreSubmission(score, user);
          setGameOver(true);
          return;
        }
      }

      animationFrameRef.current = requestAnimationFrame(gameLoop);
    };

    // Onclick for restart button
    const handleRestartClick = (e: MouseEvent) => {
      if (!gameOver) return;

      const canvasRect = canvas?.getBoundingClientRect();
      const x = e.clientX - (canvasRect?.left || 0);
      const y = e.clientY - (canvasRect?.top || 0);

      if (
        x >= GAME_WIDTH / 2 - 100 &&
        x <= GAME_WIDTH / 2 + 100 &&
        y >= GAME_HEIGHT / 2 + 80 &&
        y <= GAME_HEIGHT / 2 + 130
      ) {
        restartGame();
      }
    };

    animationFrameRef.current = requestAnimationFrame(gameLoop);

    canvas?.addEventListener("click", handleRestartClick);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      canvas?.removeEventListener("click", handleRestartClick);
    };
  }, [gameOver, currentRunningSprite, score]);

  // Listens for spacebar input
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "Space" || e.key === " ") {
        jump();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, []);

  return (
    <div className="game-container">
      <canvas
        ref={canvasRef}
        width={GAME_WIDTH}
        height={GAME_HEIGHT}
        className="game-canvas"
      />
    </div>
  );
};
