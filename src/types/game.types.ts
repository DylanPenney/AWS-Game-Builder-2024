export interface Horse {
    id: string
    name: string
    position: number
    lane: number
}

export interface GameState {
    isActive: boolean
    targetText: string
    currentInput: string
    progress: number
    wpm: number
}
