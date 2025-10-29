import type { SolutionMapping } from '../types';

function wordToNumber(word: string, mapping: SolutionMapping): number {
    let numStr = '';
    for (const char of word) {
        numStr += mapping[char];
    }
    return parseInt(numStr, 10);
}

function solveRecursive(
    uniqueLetters: string[],
    index: number,
    mapping: SolutionMapping,
    usedDigits: boolean[],
    word1: string,
    word2: string,
    result: string
): SolutionMapping | null {
    if (index === uniqueLetters.length) {
        if (mapping[word1[0]] === 0 || mapping[word2[0]] === 0 || mapping[result[0]] === 0) {
            return null;
        }

        const num1 = wordToNumber(word1, mapping);
        const num2 = wordToNumber(word2, mapping);
        const numResult = wordToNumber(result, mapping);

        if (num1 + num2 === numResult) {
            return { ...mapping };
        }
        return null;
    }

    const currentLetter = uniqueLetters[index];

    for (let digit = 0; digit <= 9; digit++) {
        if (!usedDigits[digit]) {
            mapping[currentLetter] = digit;
            usedDigits[digit] = true;

            const solution = solveRecursive(uniqueLetters, index + 1, mapping, usedDigits, word1, word2, result);
            if (solution) {
                return solution;
            }

            usedDigits[digit] = false;
            delete mapping[currentLetter];
        }
    }

    return null;
}

export function solveCryptarithmeticPuzzle(word1: string, word2: string, result: string): Promise<SolutionMapping | null> {
    return new Promise((resolve) => {
        const w1 = word1.toUpperCase();
        const w2 = word2.toUpperCase();
        const res = result.toUpperCase();

        const combined = w1 + w2 + res;
        const uniqueLetters = [...new Set(combined.split(''))];

        if (uniqueLetters.length > 10) {
            resolve(null);
            return;
        }
        
        if (res.length < Math.max(w1.length, w2.length) || res.length > Math.max(w1.length, w2.length) + 1) {
             resolve(null);
             return;
        }


        const mapping: SolutionMapping = {};
        const usedDigits = Array(10).fill(false);
        
        // Use setTimeout to avoid blocking the main thread for too long on complex puzzles
        setTimeout(() => {
            const solution = solveRecursive(uniqueLetters, 0, mapping, usedDigits, w1, w2, res);
            resolve(solution);
        }, 0);
    });
}
