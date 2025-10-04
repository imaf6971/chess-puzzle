import React, { useState, useCallback, useMemo } from "react";
import { ChessPuzzleAISolver } from "../aiSolver";
import { initializeBoard } from "../gameLogic";
import { SolutionPreview } from "./SolutionPreview";
import type { Move } from "../types";

export interface BoardAnalysis {
  pawnPosition: { row: number; col: number } | null;
  isPawnPromoted: boolean;
  movesToPromotion: number;
  movesToGoal: number;
  blockingPieces: number;
}

interface SolutionResult {
  solution: Move[] | null;
  statesExplored: number;
  solutionLength: number;
  timeElapsed: number;
  algorithm: "astar" | "bfs";
}

interface AISolverProps {
  onSolutionFound: (moves: Move[], algorithm?: string) => void;
  onAnalysisUpdate: (analysis: BoardAnalysis) => void;
}

export const AISolver: React.FC<AISolverProps> = ({
  onSolutionFound,
  onAnalysisUpdate,
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [solutionCache, setSolutionCache] = useState<
    Map<string, SolutionResult>
  >(new Map());
  const [progress, setProgress] = useState("");
  const [algorithm, setAlgorithm] = useState<"astar" | "bfs">("astar");
  const [showSolutionPreview, setShowSolutionPreview] = useState(false);

  // Get current result from cache
  const result = solutionCache.get(algorithm) || null;

  const solver = useMemo(() => new ChessPuzzleAISolver(), []);

  const handleSolve = useCallback(async () => {
    // Check if we already have a cached solution for this algorithm
    if (solutionCache.has(algorithm)) {
      const cachedResult = solutionCache.get(algorithm)!;
      setProgress("Using cached solution...");
      if (cachedResult.solution) {
        onSolutionFound(cachedResult.solution, algorithm);
      }
      return;
    }

    setIsRunning(true);
    setProgress("Initializing AI solver...");

    try {
      let solutionResult;

      if (algorithm === "astar") {
        setProgress("Running A* search algorithm...");
        solutionResult = await solver.solvePuzzle();
      } else {
        setProgress("Running BFS algorithm...");
        solutionResult = await solver.solvePuzzleBFS();
      }

      // Create enhanced result with algorithm info
      const enhancedResult: SolutionResult = {
        ...solutionResult,
        algorithm: algorithm,
      };

      // Cache the result
      setSolutionCache((prev) => new Map(prev).set(algorithm, enhancedResult));
      setProgress("Solution complete!");

      if (solutionResult.solution) {
        onSolutionFound(solutionResult.solution, algorithm);
      }
    } catch (error) {
      console.error("AI Solver error:", error);
      setProgress("Error occurred during solving");
    } finally {
      setIsRunning(false);
    }
  }, [algorithm, onSolutionFound, solver, solutionCache]);

  const handleAnalyzeBoard = useCallback(() => {
    // This would need access to current board state
    // For now, we'll analyze the initial board
    const initialBoard = initializeBoard();
    const analysis = solver.analyzeBoardState(initialBoard);
    onAnalysisUpdate(analysis);
  }, [solver, onAnalysisUpdate]);

  const handleClearCache = useCallback(() => {
    setSolutionCache(new Map());
    setProgress("");
  }, []);

  const formatTime = (ms: number): string => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  return (
    <div className="bg-white rounded-2xl shadow-chess p-8 my-5 mx-auto max-w-2xl">
      <div className="text-center mb-6">
        <h2 className="text-slate-800 text-3xl mb-2 font-bold">
          🤖 AI Puzzle Solver
        </h2>
        <p className="text-slate-600 text-base">
          Let the AI find the optimal solution in minimal moves!
        </p>
      </div>

      <div className="flex flex-col gap-5 mb-6">
        <div className="flex items-center gap-2.5">
          <label
            htmlFor="algorithm-select"
            className="font-bold text-slate-800 min-w-20"
          >
            Algorithm:
          </label>
          <select
            id="algorithm-select"
            value={algorithm}
            onChange={(e) => setAlgorithm(e.target.value as "astar" | "bfs")}
            disabled={isRunning}
            className="flex-1 py-2 px-3 border-2 border-gray-300 rounded-lg bg-white text-base transition-colors focus:outline-none focus:border-chess-primary disabled:opacity-60"
          >
            <option value="astar">
              A* Search (Recommended) {solutionCache.has("astar") ? "✓" : ""}
            </option>
            <option value="bfs">
              Breadth-First Search (Optimal){" "}
              {solutionCache.has("bfs") ? "✓" : ""}
            </option>
          </select>
        </div>

        {/* Cache Status */}
        {solutionCache.size > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-blue-600 font-medium">
                  💾 Cached Solutions:
                </span>
                <div className="flex gap-2">
                  {solutionCache.has("astar") && (
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                      A* ({solutionCache.get("astar")!.solutionLength} moves)
                    </span>
                  )}
                  {solutionCache.has("bfs") && (
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                      BFS ({solutionCache.get("bfs")!.solutionLength} moves)
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={handleClearCache}
                disabled={isRunning}
                className="text-xs bg-red-100 text-red-600 px-3 py-1 rounded-full hover:bg-red-200 transition-colors disabled:opacity-60"
              >
                Clear Cache
              </button>
            </div>
          </div>
        )}

        <div className="flex gap-4 justify-center">
          <button
            className="bg-chess-solve text-white border-none py-3 px-6 text-lg rounded-full cursor-pointer transition-all duration-300 shadow-chess min-w-[150px] hover:-translate-y-0.5 hover:shadow-chess-hover disabled:opacity-60 disabled:cursor-not-allowed"
            onClick={handleSolve}
            disabled={isRunning}
          >
            {isRunning
              ? "🔄 Solving..."
              : solutionCache.has(algorithm)
                ? "📋 View Solution"
                : "🚀 Solve Puzzle"}
          </button>

          <button
            className="bg-chess-analyze text-white border-none py-3 px-6 text-lg rounded-full cursor-pointer transition-all duration-300 shadow-chess min-w-[150px] hover:-translate-y-0.5 hover:shadow-chess-hover disabled:opacity-60 disabled:cursor-not-allowed"
            onClick={handleAnalyzeBoard}
            disabled={isRunning}
          >
            📊 Analyze Board
          </button>
        </div>
      </div>

      {isRunning && (
        <div className="flex flex-col items-center py-5 bg-gray-50 rounded-xl my-5">
          <div className="w-10 h-10 border-4 border-gray-200 border-t-chess-primary rounded-full animate-spin mb-2.5"></div>
          <p className="text-slate-800 font-medium text-center">{progress}</p>
        </div>
      )}

      {result && (
        <div className="bg-gray-50 rounded-xl p-5 my-5">
          <h3 className="text-slate-800 mb-4 text-center font-semibold">
            {result.solution ? "✅ Solution Found!" : "❌ No Solution Found"}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
            <div className="flex flex-col md:flex-row md:justify-between py-2.5 px-2.5 bg-white rounded-lg shadow-sm">
              <span className="font-bold text-slate-800">Solution Length:</span>
              <span className="text-chess-primary font-semibold">
                {result.solutionLength === -1
                  ? "N/A"
                  : `${result.solutionLength} moves`}
              </span>
            </div>

            <div className="flex flex-col md:flex-row md:justify-between py-2.5 px-2.5 bg-white rounded-lg shadow-sm">
              <span className="font-bold text-slate-800">States Explored:</span>
              <span className="text-chess-primary font-semibold">
                {result.statesExplored.toLocaleString()}
              </span>
            </div>

            <div className="flex flex-col md:flex-row md:justify-between py-2.5 px-2.5 bg-white rounded-lg shadow-sm">
              <span className="font-bold text-slate-800">Time Elapsed:</span>
              <span className="text-chess-primary font-semibold">
                {formatTime(result.timeElapsed)}
              </span>
            </div>

            <div className="flex flex-col md:flex-row md:justify-between py-2.5 px-2.5 bg-white rounded-lg shadow-sm">
              <span className="font-bold text-slate-800">Algorithm:</span>
              <span className="text-chess-primary font-semibold">
                {result.algorithm === "astar"
                  ? "A* Search"
                  : "Breadth-First Search"}
              </span>
            </div>
          </div>

          {result.solution && (
            <div className="bg-white rounded-lg p-4 border-l-4 border-chess-success">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-slate-800 font-semibold text-lg mb-1">
                    ✅ Optimal Solution Found!
                  </h4>
                  <p className="text-sm text-slate-600">
                    {result.algorithm === "astar"
                      ? "A* heuristic"
                      : "BFS exhaustive"}{" "}
                    search completed
                  </p>
                </div>
                <button
                  onClick={() => setShowSolutionPreview(true)}
                  className="bg-chess-primary text-white px-6 py-3 rounded-lg font-semibold transition-all hover:bg-chess-primary/80 hover:-translate-y-0.5 hover:shadow-lg flex items-center gap-2"
                >
                  <span>🎯</span>
                  <div className="flex flex-col items-start">
                    <span>Interactive Preview</span>
                    <span className="text-xs opacity-75">
                      Step-by-step visualization
                    </span>
                  </div>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Solution Summary */}
                <div className="bg-gradient-to-br from-chess-primary/10 to-chess-success/10 p-4 rounded-lg">
                  <h5 className="font-semibold text-slate-800 mb-3">
                    Solution Summary
                  </h5>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">
                        Total Moves:
                      </span>
                      <span className="font-bold text-chess-primary text-lg">
                        {result.solution.length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">
                        Promotions:
                      </span>
                      <span className="font-semibold text-yellow-600">
                        {
                          result.solution.filter((move) => move.isPromotion)
                            .length
                        }
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">
                        Efficiency:
                      </span>
                      <span className="font-semibold text-green-600">
                        {result.solution.length <= 10
                          ? "Excellent"
                          : result.solution.length <= 15
                            ? "Good"
                            : "Acceptable"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Move Preview */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h5 className="font-semibold text-slate-800 mb-3">
                    First Few Moves
                  </h5>
                  <div className="space-y-1">
                    {result.solution.slice(0, 4).map((move, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 text-sm"
                      >
                        <span className="font-bold text-chess-primary w-6">
                          {index + 1}.
                        </span>
                        <span className="text-slate-700 flex-1">
                          {move.piece.type === "pawn"
                            ? "♟"
                            : move.piece.type === "queen"
                              ? "♛"
                              : move.piece.type === "knight"
                                ? "♞"
                                : move.piece.type === "bishop"
                                  ? "♝"
                                  : "♜"}
                          <span className="ml-1 font-mono">
                            ({move.from.row},{move.from.col}) → ({move.to.row},
                            {move.to.col})
                          </span>
                          {move.isPromotion && (
                            <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                              PROMOTE
                            </span>
                          )}
                        </span>
                      </div>
                    ))}
                    {result.solution.length > 4 && (
                      <div className="text-xs text-slate-500 italic pt-1">
                        ... and {result.solution.length - 4} more moves
                      </div>
                    )}
                  </div>
                  <div className="mt-3 p-2 bg-blue-50 rounded text-xs text-blue-700">
                    💡 Click "Interactive Preview" above to see the complete
                    solution with board visualization
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="bg-gray-100 rounded-xl p-5 mt-5">
        <h4 className="text-slate-800 mb-4 font-semibold">
          Algorithm Information:
        </h4>
        <div className="bg-white rounded-lg p-4">
          {algorithm === "astar" ? (
            <div>
              <strong className="text-slate-800 block mb-2.5">
                A* Search:
              </strong>
              <ul className="list-disc pl-5 text-slate-600">
                <li className="mb-1">
                  Uses heuristic function for faster solving
                </li>
                <li className="mb-1">
                  Considers pawn position and blocking pieces
                </li>
                <li className="mb-1">
                  Generally faster but may not guarantee absolute optimum
                </li>
                <li className="mb-1">
                  Good balance of speed and solution quality
                </li>
              </ul>
            </div>
          ) : (
            <div>
              <strong className="text-slate-800 block mb-2.5">
                Breadth-First Search:
              </strong>
              <ul className="list-disc pl-5 text-slate-600">
                <li className="mb-1">
                  Guarantees optimal solution (minimum moves)
                </li>
                <li className="mb-1">
                  Explores all possibilities systematically
                </li>
                <li className="mb-1">
                  Slower but finds the absolute best solution
                </li>
                <li className="mb-1">Higher memory usage</li>
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Algorithm Comparison */}
      {solutionCache.size === 2 && (
        <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-5 mt-5 border border-blue-200">
          <h4 className="text-slate-800 mb-4 font-semibold text-center">
            🔄 Algorithm Comparison
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from(solutionCache.entries()).map(([alg, result]) => (
              <div
                key={alg}
                className={`bg-white rounded-lg p-4 border-2 ${
                  alg === algorithm
                    ? "border-chess-primary shadow-md"
                    : "border-gray-200"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <h5 className="font-bold text-slate-800">
                    {alg === "astar" ? "A* Search" : "BFS"}
                  </h5>
                  {alg === algorithm && (
                    <span className="bg-chess-primary text-white text-xs px-2 py-1 rounded-full">
                      Current
                    </span>
                  )}
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Moves:</span>
                    <span
                      className={`font-bold ${
                        result.solutionLength ===
                        Math.min(
                          ...Array.from(solutionCache.values()).map(
                            (r) => r.solutionLength,
                          ),
                        )
                          ? "text-green-600"
                          : "text-slate-800"
                      }`}
                    >
                      {result.solutionLength}
                      {result.solutionLength ===
                        Math.min(
                          ...Array.from(solutionCache.values()).map(
                            (r) => r.solutionLength,
                          ),
                        ) && " ⭐"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Time:</span>
                    <span
                      className={`font-semibold ${
                        result.timeElapsed ===
                        Math.min(
                          ...Array.from(solutionCache.values()).map(
                            (r) => r.timeElapsed,
                          ),
                        )
                          ? "text-blue-600"
                          : "text-slate-600"
                      }`}
                    >
                      {formatTime(result.timeElapsed)}
                      {result.timeElapsed ===
                        Math.min(
                          ...Array.from(solutionCache.values()).map(
                            (r) => r.timeElapsed,
                          ),
                        ) && " ⚡"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">States:</span>
                    <span className="text-slate-600 font-mono text-xs">
                      {result.statesExplored.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-sm text-yellow-800 text-center">
              <strong>Winner:</strong>{" "}
              {(() => {
                const solutions = Array.from(solutionCache.entries());
                const [bestAlg] = solutions.reduce((best, current) =>
                  current[1].solutionLength < best[1].solutionLength
                    ? current
                    : best,
                );
                return bestAlg === "astar" ? "A* Search" : "BFS";
              })()}
              finds the optimal solution!
              {(() => {
                const solutions = Array.from(solutionCache.entries());
                const fastestAlg = solutions.reduce((fastest, current) =>
                  current[1].timeElapsed < fastest[1].timeElapsed
                    ? current
                    : fastest,
                )[0];
                return fastestAlg !==
                  solutions.reduce((best, current) =>
                    current[1].solutionLength < best[1].solutionLength
                      ? current
                      : best,
                  )[0]
                  ? ` ${fastestAlg === "astar" ? "A*" : "BFS"} is faster.`
                  : "";
              })()}
            </p>
          </div>
        </div>
      )}

      {/* Solution Preview Modal */}
      {showSolutionPreview && result?.solution && (
        <SolutionPreview
          solution={result.solution}
          onClose={() => setShowSolutionPreview(false)}
        />
      )}
    </div>
  );
};
