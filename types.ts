export type SolutionMapping = { [key: string]: number };

export interface Puzzle {
  word1: string;
  word2: string;
  result: string;
}

export type Difficulty = 'easy' | 'medium' | 'hard';
