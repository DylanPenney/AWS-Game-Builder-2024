// src/components/Game.tsx
import React, { useState, useEffect } from 'react'
import GameCanvas from './GameCanvas'
import TypingArea from './TypingArea'
import { GameState, Horse } from '../types/game.types'
import { calculateWPM } from '../utils/gameUtils'

const INITIAL_STATE: GameState = {
    isActive: false,
    targetText: 'The quick brown fox jumps over the lazy dog',
    currentInput: '',
    progress: 0,
    wpm: 0,
}

const Game: React.FC = () => {
    const [gameState, setGameState] = useState<GameState>(INITIAL_STATE)
    const [horses, setHorses] = useState<Horse[]>([
        { id: 'player', name: 'Player', position: 0, lane: 0 },
        { id: 'ai1', name: 'AI 1', position: 0, lane: 1 },
        { id: 'ai2', name: 'AI 2', position: 0, lane: 2 },
    ])
    const [startTime, setStartTime] = useState<number | null>(null)

    const handleInput = (input: string) => {
        if (!gameState.isActive) {
            setGameState((prev) => ({ ...prev, isActive: true }))
            setStartTime(Date.now())
        }

        const newProgress =
            input
                .split('')
                .filter((char, index) => char === gameState.targetText[index])
                .length / gameState.targetText.length

        // Update player horse position
        setHorses((prev) =>
            prev.map((horse) =>
                horse.id === 'player'
                    ? { ...horse, position: newProgress }
                    : horse
            )
        )

        // Calculate WPM
        if (startTime) {
            const timeElapsed = (Date.now() - startTime) / 1000 / 60 // in minutes
            const wpm = calculateWPM(input, timeElapsed)
            setGameState((prev) => ({
                ...prev,
                currentInput: input,
                progress: newProgress,
                wpm,
            }))
        }
    }

    return (
        <div className="game-container">
            <GameCanvas horses={horses} progress={gameState.progress} />
            <TypingArea
                targetText={gameState.targetText}
                currentInput={gameState.currentInput}
                onInputChange={handleInput}
                wpm={gameState.wpm}
            />
        </div>
    )
}

export default Game
