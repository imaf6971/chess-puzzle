import React, { useState, useCallback, useMemo, useEffect } from "react";
import { Square } from "./Square";
import type { Move, Position, Board } from "../types";
import { initializeBoard, makeMove } from "../gameLogic";

// Utility function to convert move to chess notation
const moveToNotation = (move: Move): string => {
  const pieceSymbols: Record<string, string> = {
    knight: "N",
    bishop: "B",
    rook: "R",
    pawn: "",
    queen: "Q",
  };

  const colToFile = (col: number): string => String.fromCharCode(97 + col); // a-d
  const rowToRank = (row: number): string => String(4 - row); // 4-1

  const piece = pieceSymbols[move.piece.type];
  const fromSquare = `${colToFile(move.from.col)}${rowToRank(move.from.row)}`;
  const toSquare = `${colToFile(move.to.col)}${rowToRank(move.to.row)}`;

  if (move.piece.type === "pawn") {
    return `${fromSquare}-${toSquare}${move.isPromotion ? "=Q" : ""}`;
  }

  return `${piece}${fromSquare}-${toSquare}`;
};

interface SolutionPreviewProps {
  solution: Move[];
  onClose: () => void;
}

export const SolutionPreview: React.FC<SolutionPreviewProps> = ({
  solution,
  onClose,
}) => {
  const [currentMoveIndex, setCurrentMoveIndex] = useState(-1); // -1 means initial state
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [autoPlaySpeed, setAutoPlaySpeed] = useState(1000); // ms between moves

  // Generate all board states for the solution
  const boardStates = useMemo(() => {
    const states: Board[] = [];
    let currentBoard = initializeBoard();
    states.push(JSON.parse(JSON.stringify(currentBoard))); // Initial state

    for (const move of solution) {
      const result = makeMove(currentBoard, move);
      if (result.isValid && result.resultingBoard) {
        currentBoard = result.resultingBoard;
        states.push(JSON.parse(JSON.stringify(currentBoard)));
      }
    }

    return states;
  }, [solution]);

  const currentBoard = boardStates[currentMoveIndex + 1] || boardStates[0];
  const currentMove = currentMoveIndex >= 0 ? solution[currentMoveIndex] : null;

  const handlePrevious = useCallback(() => {
    setCurrentMoveIndex((prev) => Math.max(-1, prev - 1));
  }, []);

  const handleNext = useCallback(() => {
    setCurrentMoveIndex((prev) => Math.min(solution.length - 1, prev + 1));
  }, [solution.length]);

  const handleJumpToMove = useCallback((moveIndex: number) => {
    setCurrentMoveIndex(moveIndex);
  }, []);

  const handleReset = useCallback(() => {
    setCurrentMoveIndex(-1);
  }, []);

  const handlePlayAll = useCallback(() => {
    setCurrentMoveIndex(solution.length - 1);
  }, [solution.length]);

  const toggleAutoPlay = useCallback(() => {
    setIsAutoPlaying((prev) => !prev);
  }, []);

  const handleSpeedChange = useCallback((speed: number) => {
    setAutoPlaySpeed(speed);
  }, []);

  // Create a dummy onClick handler for the squares (preview mode doesn't allow interaction)
  const handleSquareClick = useCallback(() => {
    // No interaction in preview mode
  }, []);

  // Highlight the move squares
  const isFromSquare = (position: Position): boolean => {
    return (
      currentMove?.from.row === position.row &&
      currentMove?.from.col === position.col
    );
  };

  const isToSquare = (position: Position): boolean => {
    return (
      currentMove?.to.row === position.row &&
      currentMove?.to.col === position.col
    );
  };

  const getSquareHighlight = (position: Position): string => {
    if (isFromSquare(position)) return "from-square";
    if (isToSquare(position)) return "to-square";
    return "";
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case "ArrowLeft":
          event.preventDefault();
          if (!isAutoPlaying) handlePrevious();
          break;
        case "ArrowRight":
          event.preventDefault();
          if (!isAutoPlaying) handleNext();
          break;
        case " ":
          event.preventDefault();
          toggleAutoPlay();
          break;
        case "Home":
          event.preventDefault();
          if (!isAutoPlaying) handleReset();
          break;
        case "End":
          event.preventDefault();
          if (!isAutoPlaying) handlePlayAll();
          break;
        case "Escape":
          event.preventDefault();
          onClose();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    handlePrevious,
    handleNext,
    handleReset,
    handlePlayAll,
    onClose,
    isAutoPlaying,
    toggleAutoPlay,
  ]);

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentMoveIndex((prev) => {
        if (prev >= solution.length - 1) {
          setIsAutoPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, autoPlaySpeed);

    return () => clearInterval(interval);
  }, [isAutoPlaying, autoPlaySpeed, solution.length]);

  return (
    <div className="fixed inset-0 bg-black/50 solution-preview-overlay flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-chess-primary text-white p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-1">🤖 Solution Preview</h2>
            <p className="text-chess-primary-light">
              Interactive visualization of AI solution ({solution.length} moves)
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:opacity-75 text-3xl font-bold transition-all hover:scale-110"
          >
            ×
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Board Section */}
          <div className="flex-1 flex flex-col items-center justify-center p-6">
            {/* Move Info */}
            <div className="mb-4 text-center">
              <div className="text-lg font-semibold text-slate-800">
                {currentMoveIndex === -1 ? (
                  "Initial Position"
                ) : (
                  <>
                    Move {currentMoveIndex + 1} of {solution.length}
                  </>
                )}
              </div>
              {currentMove && (
                <div className="text-sm text-slate-600 mt-1">
                  <div className="font-mono text-chess-primary font-semibold">
                    {moveToNotation(currentMove)}
                  </div>
                  <div className="text-xs">
                    {currentMove.piece.type} from ({currentMove.from.row},
                    {currentMove.from.col}) to ({currentMove.to.row},
                    {currentMove.to.col})
                    {currentMove.isPromotion && " (Promotion!)"}
                  </div>
                </div>
              )}

              {/* Progress Bar */}
              <div className="mt-3 max-w-md mx-auto">
                <div className="flex justify-between text-xs text-slate-500 mb-1">
                  <span>Start</span>
                  <span>
                    {Math.round(
                      ((currentMoveIndex + 1) / solution.length) * 100,
                    )}
                    %
                  </span>
                  <span>End</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-chess-primary h-2 rounded-full transition-all duration-300 ease-out"
                    style={{
                      width: `${((currentMoveIndex + 1) / solution.length) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Chess Board */}
            <div className="inline-block border-4 border-chess-border rounded-xl shadow-chess bg-chess-border">
              {currentBoard.map((row, rowIndex) => (
                <div key={rowIndex} className="flex">
                  {row.map((square, colIndex) => {
                    const position = { row: rowIndex, col: colIndex };
                    const highlight = getSquareHighlight(position);
                    return (
                      <div
                        key={`${rowIndex}-${colIndex}`}
                        className="relative solution-board-highlight"
                      >
                        <Square
                          square={square}
                          position={position}
                          isSelected={false}
                          isValidMove={false}
                          onClick={handleSquareClick}
                        />
                        {highlight === "from-square" && (
                          <div className="absolute inset-0 border-4 border-red-500 rounded pointer-events-none solution-from-square" />
                        )}
                        {highlight === "to-square" && (
                          <div className="absolute inset-0 border-4 border-green-500 rounded pointer-events-none solution-to-square" />
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Auto-play Controls */}
            <div className="mt-4 flex items-center justify-center gap-4">
              <button
                onClick={toggleAutoPlay}
                disabled={currentMoveIndex === solution.length - 1}
                className={`px-4 py-2 rounded-lg font-semibold move-button transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                  isAutoPlaying
                    ? "bg-red-500 text-white hover:bg-red-600"
                    : "bg-green-500 text-white hover:bg-green-600"
                }`}
              >
                {isAutoPlaying ? "⏸ Pause" : "▶ Auto Play"}
              </button>

              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-600">Speed:</span>
                <select
                  value={autoPlaySpeed}
                  onChange={(e) => handleSpeedChange(Number(e.target.value))}
                  className="text-sm border border-gray-300 rounded px-2 py-1"
                >
                  <option value={2000}>Slow (2s)</option>
                  <option value={1000}>Normal (1s)</option>
                  <option value={500}>Fast (0.5s)</option>
                  <option value={200}>Very Fast (0.2s)</option>
                </select>
              </div>
            </div>

            {/* Navigation Controls */}
            <div className="mt-4 flex items-center gap-4">
              <button
                onClick={handleReset}
                disabled={currentMoveIndex === -1 || isAutoPlaying}
                className="bg-chess-reset text-white px-4 py-2 rounded-lg font-semibold move-button hover:bg-chess-reset/80 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ⏮ Start
              </button>

              <button
                onClick={handlePrevious}
                disabled={currentMoveIndex === -1 || isAutoPlaying}
                className="bg-chess-primary text-white px-4 py-2 rounded-lg font-semibold move-button hover:bg-chess-primary/80 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ← Prev
              </button>

              <span className="text-slate-600 font-mono bg-gray-100 px-3 py-1 rounded">
                {currentMoveIndex + 1} / {solution.length}
              </span>

              <button
                onClick={handleNext}
                disabled={
                  currentMoveIndex === solution.length - 1 || isAutoPlaying
                }
                className="bg-chess-primary text-white px-4 py-2 rounded-lg font-semibold move-button hover:bg-chess-primary/80 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next →
              </button>

              <button
                onClick={handlePlayAll}
                disabled={
                  currentMoveIndex === solution.length - 1 || isAutoPlaying
                }
                className="bg-chess-success text-white px-4 py-2 rounded-lg font-semibold move-button hover:bg-chess-success/80 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                End ⏭
              </button>
            </div>
          </div>

          {/* Move List Sidebar */}
          <div className="w-80 bg-gray-50 border-l border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-slate-800">
                Move History
              </h3>
              <p className="text-sm text-slate-600">
                Click any move to jump to that position
              </p>
            </div>

            <div className="flex-1 overflow-y-auto p-2 solution-move-list">
              {/* Initial Position */}
              <button
                onClick={() => handleJumpToMove(-1)}
                disabled={isAutoPlaying}
                className={`w-full text-left p-3 rounded-lg mb-2 move-button disabled:opacity-50 disabled:cursor-not-allowed ${
                  currentMoveIndex === -1
                    ? "bg-chess-primary text-white active"
                    : "bg-white hover:bg-gray-100"
                }`}
              >
                <div className="font-semibold">Initial Position</div>
                <div className="text-sm opacity-75">Starting board state</div>
              </button>

              {/* Move List */}
              {solution.map((move, index) => (
                <button
                  key={index}
                  onClick={() => handleJumpToMove(index)}
                  disabled={isAutoPlaying}
                  className={`w-full text-left p-3 rounded-lg mb-2 move-button disabled:opacity-50 disabled:cursor-not-allowed ${
                    currentMoveIndex === index
                      ? "bg-chess-primary text-white active"
                      : "bg-white hover:bg-gray-100"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold">Move {index + 1}</span>
                    {move.isPromotion && (
                      <span className="text-xs bg-yellow-500 text-white px-2 py-1 rounded-full">
                        PROMOTION
                      </span>
                    )}
                  </div>
                  <div className="text-sm opacity-90 font-mono font-semibold text-chess-primary">
                    {moveToNotation(move)}
                  </div>
                  <div className="text-xs opacity-75">
                    {move.piece.type} ({move.from.row},{move.from.col}) → (
                    {move.to.row},{move.to.col})
                  </div>
                </button>
              ))}
            </div>

            {/* Legend */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <h4 className="font-semibold text-slate-800 mb-2">Legend</h4>
              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-red-500 rounded"></div>
                  <span>From position</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-green-500 rounded"></div>
                  <span>To position</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer with keyboard shortcuts */}
        <div className="bg-gray-100 px-6 py-3 border-t border-gray-200">
          <div className="text-xs text-slate-600 text-center keyboard-shortcuts">
            <strong>Keyboard shortcuts:</strong>
            <span className="ml-2 bg-white px-2 py-1 rounded">← Previous</span>
            <span className="ml-4 bg-white px-2 py-1 rounded">→ Next</span>
            <span className="ml-4 bg-white px-2 py-1 rounded">
              Space Auto-play
            </span>
            <span className="ml-4 bg-white px-2 py-1 rounded">Home Start</span>
            <span className="ml-4 bg-white px-2 py-1 rounded">End Finish</span>
            <span className="ml-4 bg-white px-2 py-1 rounded">Esc Close</span>
          </div>
        </div>
      </div>
    </div>
  );
};
