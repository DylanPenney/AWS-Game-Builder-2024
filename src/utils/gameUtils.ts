// src/utils/gameUtils.ts
export const calculateWPM = (text: string, timeElapsed: number): number => {
    const words = text.trim().split(/\s+/).length
    return words / timeElapsed
}
