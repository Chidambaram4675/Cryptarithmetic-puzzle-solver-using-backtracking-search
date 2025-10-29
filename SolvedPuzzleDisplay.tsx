import React from 'react';
import type { Puzzle, SolutionMapping } from '../types';

interface SolvedPuzzleDisplayProps {
    puzzle: Puzzle;
    solution: SolutionMapping;
}

const SolvedPuzzleDisplay: React.FC<SolvedPuzzleDisplayProps> = ({ puzzle, solution }) => {
    const substitute = (word: string): string => {
        return word.split('').map(char => solution[char] ?? '?').join('');
    };

    return (
        <div className="font-mono text-2xl sm:text-3xl tracking-widest space-y-2">
            <div className="grid grid-cols-[auto_1fr_auto] gap-x-4 items-baseline">
                <div>{/* empty for alignment */}</div>
                <div className="text-slate-300 text-right">{puzzle.word1}</div>
                <div className="text-emerald-400 text-right">{substitute(puzzle.word1)}</div>
            </div>
             <div className="grid grid-cols-[auto_1fr_auto] gap-x-4 items-baseline">
                <div className="text-xl text-slate-400">+</div>
                <div className="text-slate-300 text-right">{puzzle.word2}</div>
                <div className="text-emerald-400 text-right">{substitute(puzzle.word2)}</div>
            </div>
            <hr className="border-slate-500 !my-3 col-span-3"/>
             <div className="grid grid-cols-[auto_1fr_auto] gap-x-4 items-baseline">
                <div>{/* empty for alignment */}</div>
                <div className="text-slate-300 text-right">{puzzle.result}</div>
                <div className="text-emerald-400 text-right">{substitute(puzzle.result)}</div>
            </div>
        </div>
    );
};

export default SolvedPuzzleDisplay;
