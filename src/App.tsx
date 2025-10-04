import { useState } from "react";
import { ChessPuzzle } from "./components/ChessPuzzle";
import { AISolver, type BoardAnalysis } from "./components/AISolver";
import type { Move } from "./types";

function App() {
  const [showAISolver, setShowAISolver] = useState(false);
  const [aiSolutions, setAiSolutions] = useState<Map<string, Move[]>>(
    new Map(),
  );
  const [analysisData, setAnalysisData] = useState<BoardAnalysis | null>(null);
  const [currentAlgorithm, setCurrentAlgorithm] = useState<string>("");

  const handleSolutionFound = (moves: Move[], algorithm?: string) => {
    if (algorithm) {
      setAiSolutions((prev) => new Map(prev).set(algorithm, moves));
      setCurrentAlgorithm(algorithm);
    }
  };

  return (
    <div className="min-h-screen bg-chess-gradient pt-5">
      <div className="text-center p-5 bg-white/10 backdrop-blur-chess rounded-2xl mx-auto mb-5 max-w-3xl">
        <button
          className="bg-chess-ai text-white border-none py-3 px-8 text-xl rounded-full cursor-pointer transition-all duration-300 shadow-chess font-bold hover:-translate-y-0.5 hover:shadow-chess-hover"
          onClick={() => setShowAISolver(!showAISolver)}
        >
          {showAISolver ? "🎮 Play Mode" : "🤖 AI Solver"}
        </button>
      </div>

      {showAISolver ? (
        <div className="max-w-7xl mx-auto px-5">
          <AISolver
            onSolutionFound={handleSolutionFound}
            onAnalysisUpdate={setAnalysisData}
          />
          {analysisData && (
            <div className="bg-white rounded-2xl shadow-chess p-6 my-5 mx-auto max-w-md border-l-4 border-chess-primary">
              <h3 className="text-slate-800 mb-4 text-center text-xl font-semibold">
                Board Analysis
              </h3>
              <p className="text-slate-600 my-2.5 py-2 border-b border-gray-200">
                Pawn Position:{" "}
                {analysisData.pawnPosition
                  ? `(${analysisData.pawnPosition.row}, ${analysisData.pawnPosition.col})`
                  : "Not found"}
              </p>
              <p className="text-slate-600 my-2.5 py-2 border-b border-gray-200">
                Is Promoted: {analysisData.isPawnPromoted ? "Yes" : "No"}
              </p>
              <p className="text-slate-600 my-2.5 py-2 border-b border-gray-200">
                Moves to Promotion: {analysisData.movesToPromotion}
              </p>
              <p className="text-slate-600 my-2.5 py-2 border-b border-gray-200">
                Moves to Goal: {analysisData.movesToGoal}
              </p>
              <p className="text-slate-600 my-2.5 py-2">
                Blocking Pieces: {analysisData.blockingPieces}
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="pb-20">
          <ChessPuzzle />
        </div>
      )}

      {aiSolutions.size > 0 && currentAlgorithm && (
        <div className="fixed bottom-5 right-5 bg-chess-success text-white py-4 px-5 rounded-full shadow-chess font-bold animate-slide-in-right z-50">
          <p>
            🤖 {currentAlgorithm === "astar" ? "A*" : "BFS"} found a solution in{" "}
            {aiSolutions.get(currentAlgorithm)?.length || 0} moves!
          </p>
          {aiSolutions.size > 1 && (
            <p className="text-xs opacity-75 mt-1">
              {aiSolutions.size} algorithm{aiSolutions.size > 1 ? "s" : ""}{" "}
              solved
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
