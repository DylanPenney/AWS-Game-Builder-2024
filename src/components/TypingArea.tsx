import React from 'react'

interface TypingAreaProps {
    targetText: string
    currentInput: string
    onInputChange: (input: string) => void
    wpm: number
}

const TypingArea: React.FC<TypingAreaProps> = ({
    targetText,
    currentInput,
    onInputChange,
    wpm,
}) => {
    return (
        <div className="typing-area">
            <div className="stats">
                <span>WPM: {Math.round(wpm)}</span>
            </div>
            <div className="target-text">
                {targetText.split('').map((char, index) => (
                    <span
                        key={index}
                        style={{
                            color: !currentInput[index]
                                ? 'black'
                                : currentInput[index] === char
                                ? 'green'
                                : 'red',
                        }}
                    >
                        {char}
                    </span>
                ))}
            </div>
            <input
                type="text"
                value={currentInput}
                onChange={(e) => onInputChange(e.target.value)}
                className="typing-input"
                autoFocus
            />
        </div>
    )
}

export default TypingArea
