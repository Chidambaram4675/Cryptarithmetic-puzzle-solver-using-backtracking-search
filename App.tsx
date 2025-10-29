import React, { useState, useCallback, useRef } from 'react';
import { solveCryptarithmeticPuzzle } from './services/solver';
import { generatePuzzle, explainSolution } from './services/geminiService';
import type { Puzzle, SolutionMapping, Difficulty } from './types';
import SolvedPuzzleDisplay from './components/SolvedPuzzleDisplay';

declare const marked: any;

const Spinner: React.FC = () => (
    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);


const App: React.FC = () => {
    const [puzzle, setPuzzle] = useState<Puzzle>({ word1: 'SEND', word2: 'MORE', result: 'MONEY' });
    const [solution, setSolution] = useState<SolutionMapping | null>(null);
    const [explanation, setExplanation] = useState<string>('');
    const [difficulty, setDifficulty] = useState<Difficulty>('medium');
    const [solveAttempted, setSolveAttempted] = useState<boolean>(false);
    
    const [isLoading, setIsLoading] = useState({
        solving: false,
        generating: false,
        explaining: false,
    });

    const word1Ref = useRef<HTMLInputElement>(null);
    const word2Ref = useRef<HTMLInputElement>(null);
    const resultRef = useRef<HTMLInputElement>(null);

    const handleInputChange = () => {
        setPuzzle({
            word1: word1Ref.current?.value.toUpperCase() || '',
            word2: word2Ref.current?.value.toUpperCase() || '',
            result: resultRef.current?.value.toUpperCase() || '',
        });
        setSolution(null);
        setExplanation('');
        setSolveAttempted(false);
    };

    const handleGeneratePuzzle = useCallback(async (level: Difficulty) => {
        setIsLoading(prev => ({ ...prev, generating: true }));
        setSolution(null);
        setExplanation('');
        setDifficulty(level);
        setSolveAttempted(false);
        const newPuzzle = await generatePuzzle(level);
        if (newPuzzle) {
            setPuzzle(newPuzzle);
            if(word1Ref.current) word1Ref.current.value = newPuzzle.word1;
            if(word2Ref.current) word2Ref.current.value = newPuzzle.word2;
            if(resultRef.current) resultRef.current.value = newPuzzle.result;
        }
        setIsLoading(prev => ({ ...prev, generating: false }));
    }, []);

    const handleSolve = useCallback(async () => {
        setIsLoading(prev => ({ ...prev, solving: true }));
        setExplanation('');
        setSolveAttempted(true);
        const result = await solveCryptarithmeticPuzzle(puzzle.word1, puzzle.word2, puzzle.result);
        setSolution(result);
        setIsLoading(prev => ({ ...prev, solving: false }));
    }, [puzzle]);

    const handleExplain = useCallback(async () => {
        if (!solution) return;
        setIsLoading(prev => ({ ...prev, explaining: true }));
        const explanationText = await explainSolution(puzzle, solution);
        setExplanation(explanationText);
        setIsLoading(prev => ({ ...prev, explaining: false }));
    }, [puzzle, solution]);

    const renderedExplanation = explanation ? marked.parse(explanation) : '';

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center p-4 sm:p-6 lg:p-8">
            <div className="w-full max-w-4xl mx-auto">
                <header className="text-center mb-8">
                    <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-cyan-400 via-sky-500 to-purple-500 text-transparent bg-clip-text mb-2">
                        Cryptarithmetic Puzzle Solver
                    </h1>
                    <p className="text-slate-400">An AI-powered puzzle generator and explainer.</p>
                </header>

                <main className="bg-slate-800/50 rounded-lg shadow-2xl shadow-cyan-500/10 p-6 ring-1 ring-slate-700">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Left Column: Puzzle and Controls */}
                        <div className="flex flex-col space-y-6">
                             <div className="puzzle-display font-mono text-3xl sm:text-4xl text-center tracking-widest text-slate-300 p-4 rounded-md bg-slate-900/50">
                                <div>&nbsp;&nbsp;{puzzle.word1 || 'WORD1'}</div>
                                <div>+ {puzzle.word2 || 'WORD2'}</div>
                                <hr className="border-slate-600 my-2"/>
                                <div>{puzzle.result || 'RESULT'}</div>
                            </div>
                            
                            <div className="space-y-4">
                                <input ref={word1Ref} onChange={handleInputChange} defaultValue={puzzle.word1} className="w-full bg-slate-700 border border-slate-600 rounded-md px-4 py-2 text-lg focus:ring-2 focus:ring-cyan-500 focus:outline-none" placeholder="First word (e.g., SEND)" />
                                <input ref={word2Ref} onChange={handleInputChange} defaultValue={puzzle.word2} className="w-full bg-slate-700 border border-slate-600 rounded-md px-4 py-2 text-lg focus:ring-2 focus:ring-cyan-500 focus:outline-none" placeholder="Second word (e.g., MORE)" />
                                <input ref={resultRef} onChange={handleInputChange} defaultValue={puzzle.result} className="w-full bg-slate-700 border border-slate-600 rounded-md px-4 py-2 text-lg focus:ring-2 focus:ring-cyan-500 focus:outline-none" placeholder="Result word (e.g., MONEY)" />
                            </div>

                             <div>
                                <label className="block text-sm font-medium text-slate-400 mb-2">Generate New Puzzle</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {(['easy', 'medium', 'hard'] as Difficulty[]).map(level => (
                                        <button key={level} onClick={() => handleGeneratePuzzle(level)} disabled={isLoading.generating} className={`px-4 py-2 text-sm font-semibold rounded-md transition-all duration-200 flex items-center justify-center h-10
                                            ${difficulty === level ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/30' : 'bg-slate-700 hover:bg-slate-600'}
                                            disabled:opacity-50 disabled:cursor-not-allowed`}>
                                            {isLoading.generating && difficulty === level ? <Spinner /> : <span>{level.charAt(0).toUpperCase() + level.slice(1)}</span>}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2">
                                <button onClick={handleSolve} disabled={isLoading.solving} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-4 rounded-md transition duration-200 h-12 flex items-center justify-center disabled:bg-emerald-800 disabled:cursor-not-allowed">
                                    {isLoading.solving ? <Spinner /> : 'Solve'}
                                </button>
                                <button onClick={handleExplain} disabled={!solution || isLoading.explaining} className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold py-2 px-4 rounded-md transition duration-200 h-12 flex items-center justify-center disabled:bg-sky-800 disabled:cursor-not-allowed disabled:opacity-50">
                                    {isLoading.explaining ? <Spinner /> : 'Explain'}
                                </button>
                            </div>
                        </div>

                        {/* Right Column: Solution and Explanation */}
                        <div className="flex flex-col space-y-6">
                            <div id="solution-section">
                                <h2 className="text-2xl font-bold text-slate-300 mb-4 border-b-2 border-slate-700 pb-2">Solution</h2>
                                {solveAttempted && (
                                    solution ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                                            <SolvedPuzzleDisplay puzzle={puzzle} solution={solution} />
                                            <div className="bg-slate-900/70 p-4 rounded-md">
                                                <h3 className="text-lg font-semibold text-slate-300 mb-3 text-center">Mappings</h3>
                                                <div className="grid grid-cols-2 gap-x-4 gap-y-2 font-mono text-lg">
                                                    {Object.entries(solution).sort((a,b) => a[0].localeCompare(b[0])).map(([letter, digit]) => (
                                                        <div key={letter} className="text-center text-emerald-400">
                                                            {letter} &rarr; {digit}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center text-amber-400 bg-amber-900/30 p-4 rounded-md">
                                            No solution found for this puzzle.
                                        </div>
                                    )
                                )}
                                 {!solveAttempted && <p className="text-slate-400 text-center py-8">Click 'Solve' to see the solution.</p>}
                            </div>

                            <div id="explanation-section">
                                <h2 className="text-2xl font-bold text-slate-300 mb-4 border-b-2 border-slate-700 pb-2">Explanation</h2>
                                {explanation ? (
                                    <div className="prose prose-invert bg-slate-900/50 p-4 rounded-md explanation-content" dangerouslySetInnerHTML={{ __html: renderedExplanation }}></div>
                                ) : (
                                    <p className="text-slate-400 text-center py-8">
                                        {solution ? "Click 'Explain' for a step-by-step breakdown." : "Solve the puzzle to generate an explanation."}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default App;
