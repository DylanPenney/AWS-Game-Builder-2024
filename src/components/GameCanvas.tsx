import React, { useRef, useEffect } from 'react';
import { Horse } from '../types/game.types';

interface GameCanvasProps {
    horses: Horse[];
    progress: number;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ horses, progress }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const drawHorse = (
        ctx: CanvasRenderingContext2D, 
        horse: Horse
    ) => {
        ctx.fillStyle = '#4CAF50';
        const xPos = 50 + (horse.position * 700); // Scale position to canvas width
        const yPos = 100 + (horse.lane * 80); // Space lanes vertically
        
        ctx.fillRect(xPos, yPos, 40, 20);
        
        // Draw horse name
        ctx.fillStyle = '#000';
        ctx.font = '14px Arial';
        ctx.fillText(horse.name, xPos, yPos - 5);
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear canvas
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw race track
        horses.forEach((horse, index) => {
            const laneY = 100 + (index * 80);
            ctx.strokeStyle = '#000';
            ctx.strokeRect(40, laneY - 20, canvas.width - 80, 60);
        });

        // Draw horses
        horses.forEach(horse => drawHorse(ctx, horse));

    }, [horses, progress]);

    return (
        <canvas 
            ref={canvasRef} 
            width={800} 
            height={400}
            style={{ border: '1px solid black' }}
        />
    );
};

export default GameCanvas;
