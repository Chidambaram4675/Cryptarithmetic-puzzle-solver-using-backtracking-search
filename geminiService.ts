import { GoogleGenAI, Type } from "@google/genai";
import type { Puzzle, SolutionMapping, Difficulty } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

const getPromptForDifficulty = (difficulty: Difficulty): string => {
    switch (difficulty) {
        case 'easy':
            return "Generate a new, unique, and solvable cryptarithmetic puzzle that is EASY. It should have few unique letters (<= 5) and short words. Provide the response as a JSON object with keys 'word1', 'word2', and 'result'. Example: {\"word1\": \"SO\", \"word2\": \"SO\", \"result\": \"TOO\"}";
        case 'medium':
            return "Generate a new, unique, and solvable cryptarithmetic puzzle of MEDIUM difficulty. It should have 6-8 unique letters. Provide the response as a JSON object with keys 'word1', 'word2', and 'result'. Example: {\"word1\": \"SEND\", \"word2\": \"MORE\", \"result\": \"MONEY\"}";
        case 'hard':
            return "Generate a new, unique, and solvable cryptarithmetic puzzle that is HARD. It should have 9-10 unique letters and be challenging. Provide the response as a JSON object with keys 'word1', 'word2', and 'result'. Example: {\"word1\": \"CROSS\", \"word2\": \"ROADS\", \"result\": \"DANGER\"}";
        default:
            return "Generate a new, unique, and solvable cryptarithmetic puzzle of medium difficulty. Provide the response as a JSON object with keys 'word1', 'word2', and 'result'. Example: {\"word1\": \"SEND\", \"word2\": \"MORE\", \"result\": \"MONEY\"}";
    }
}

export async function generatePuzzle(difficulty: Difficulty): Promise<Puzzle | null> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: getPromptForDifficulty(difficulty),
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            word1: { type: Type.STRING },
            word2: { type: Type.STRING },
            result: { type: Type.STRING },
          },
          required: ["word1", "word2", "result"],
        },
      },
    });

    const jsonText = response.text;
    const puzzle = JSON.parse(jsonText);
    if (puzzle && typeof puzzle.word1 === 'string' && typeof puzzle.word2 === 'string' && typeof puzzle.result === 'string') {
        return {
            word1: puzzle.word1.toUpperCase(),
            word2: puzzle.word2.toUpperCase(),
            result: puzzle.result.toUpperCase()
        };
    }
    return null;
  } catch (error) {
    console.error("Error generating puzzle:", error);
    return null;
  }
}

export async function explainSolution(puzzle: Puzzle, solution: SolutionMapping): Promise<string> {
  try {
    const puzzleString = `${puzzle.word1} + ${puzzle.word2} = ${puzzle.result}`;
    const solutionString = JSON.stringify(solution);

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Provide a clear, step-by-step explanation for how to solve the cryptarithmetic puzzle: ${puzzleString} given the solution ${solutionString}. At the very end, show the final answer with the numbers substituted into the puzzle as the conclusion. Use markdown for formatting.`,
    });

    return response.text;
  } catch (error) {
    console.error("Error explaining solution:", error);
    return "Sorry, I couldn't generate an explanation for this solution.";
  }
}