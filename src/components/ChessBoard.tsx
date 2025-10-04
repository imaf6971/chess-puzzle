import React from "react";
import { Square } from "./Square";
import type { GameState, Position } from "../types";

interface ChessBoardProps {
  gameState: GameState;
  onSquareClick: (position: Position) => void;
  onResetGame: () => void;
}

export const ChessBoard: React.FC<ChessBoardProps> = ({
  gameState,
  onSquareClick,
  onResetGame,
}) => {
  const { board, selectedPiece, validMoves, isGameWon } = gameState;

  // Handle malformed game state gracefully
  if (!board || !Array.isArray(board) || board.length === 0) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-chess p-8 w-full max-w-4xl">
          <div className="text-center mb-8">
            <h1 className="text-slate-800 text-4xl mb-3 font-bold drop-shadow-md">
              Chess Puzzle: Pawn to Goal
            </h1>
            <p className="text-slate-600 text-lg mb-4">
              Error loading game board. Please try again.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const isSquareSelected = (position: Position): boolean => {
    return (
      selectedPiece?.position.row === position.row &&
      selectedPiece?.position.col === position.col
    );
  };

  const isValidMoveSquare = (position: Position): boolean => {
    return validMoves.some(
      (move) => move.row === position.row && move.col === position.col,
    );
  };

  return (
    <div
      className="flex items-center justify-center p-4"
      style={{ minHeight: "calc(100vh - 140px)" }}
    >
      <div className="bg-white rounded-2xl shadow-chess p-8 w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-slate-800 text-4xl mb-3 font-bold drop-shadow-md">
            Chess Puzzle: Pawn to Goal
          </h1>
          <p className="text-slate-600 text-lg mb-4">
            Move any pieces to clear a path for the pawn (♟) to reach the goal
            square (🎯) in the bottom-left corner!
          </p>
          {isGameWon && (
            <div className="bg-chess-win text-white py-4 px-6 rounded-full text-xl font-bold drop-shadow-md mt-4 animate-bounce-chess">
              🎉 Congratulations! You solved the puzzle! 🎉
            </div>
          )}
        </div>

        <div className="flex justify-center mb-8">
          <div className="inline-block border-4 border-chess-border rounded-xl shadow-chess bg-chess-border relative animate-fade-in">
            {board.map((row, rowIndex) => (
              <div key={rowIndex} className="flex">
                {row.map((square, colIndex) => {
                  const position = { row: rowIndex, col: colIndex };
                  return (
                    <Square
                      key={`${rowIndex}-${colIndex}`}
                      square={square}
                      position={position}
                      isSelected={isSquareSelected(position)}
                      isValidMove={isValidMoveSquare(position)}
                      onClick={onSquareClick}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        <div className="text-center my-8">
          <button
            className="bg-chess-reset text-white border-none py-4 px-8 text-lg rounded-full cursor-pointer transition-all duration-300 shadow-chess hover:-translate-y-0.5 hover:shadow-chess-hover active:translate-y-0"
            onClick={onResetGame}
          >
            Reset Puzzle
          </button>
        </div>

        <div className="bg-gray-50 rounded-xl p-5 my-5 border-l-4 border-chess-primary">
          <h3 className="text-slate-800 mb-4 text-lg font-semibold">
            How to Play:
          </h3>
          <ul className="list-none pl-0">
            <li className="py-1 relative pl-6 text-slate-600 before:content-['→'] before:absolute before:left-0 before:text-chess-primary before:font-bold">
              Click on any piece to select it
            </li>
            <li className="py-1 relative pl-6 text-slate-600 before:content-['→'] before:absolute before:left-0 before:text-chess-primary before:font-bold">
              Click on a highlighted square to move the selected piece
            </li>
            <li className="py-1 relative pl-6 text-slate-600 before:content-['→'] before:absolute before:left-0 before:text-chess-primary before:font-bold">
              All pieces belong to you and can be moved to clear paths
            </li>
            <li className="py-1 relative pl-6 text-slate-600 before:content-['→'] before:absolute before:left-0 before:text-chess-primary before:font-bold">
              The pawn can ONLY move UP (toward the top row) - proper chess
              rules!
            </li>
            <li className="py-1 relative pl-6 text-slate-600 before:content-['→'] before:absolute before:left-0 before:text-chess-primary before:font-bold">
              When the pawn reaches the top row, it promotes to a queen (♛)
            </li>
            <li className="py-1 relative pl-6 text-slate-600 before:content-['→'] before:absolute before:left-0 before:text-chess-primary before:font-bold">
              Get the pawn/queen to the goal square (🎯) to win!
            </li>
            <li className="py-1 relative pl-6 text-slate-600 before:content-['→'] before:absolute before:left-0 before:text-chess-primary before:font-bold">
              ONLY the original pawn (or its promoted queen) can win the game!
            </li>
            <li className="py-1 relative pl-6 text-slate-600 before:content-['→'] before:absolute before:left-0 before:text-chess-primary before:font-bold">
              No capturing - pieces just block each other's movement
            </li>
          </ul>
        </div>

        <div className="bg-gray-100 rounded-xl p-5 mt-5">
          <h3 className="text-slate-800 mb-4 text-center font-semibold">
            Pieces:
          </h3>
          <div className="flex flex-wrap justify-center gap-4">
            <span className="bg-white py-2 px-4 rounded-full text-lg shadow-chess transition-transform hover:scale-105">
              ♞ Knight
            </span>
            <span className="bg-white py-2 px-4 rounded-full text-lg shadow-chess transition-transform hover:scale-105">
              ♝ Bishop
            </span>
            <span className="bg-white py-2 px-4 rounded-full text-lg shadow-chess transition-transform hover:scale-105">
              ♜ Rook
            </span>
            <span className="bg-white py-2 px-4 rounded-full text-lg shadow-chess transition-transform hover:scale-105">
              ♟ Pawn
            </span>
            <span className="bg-white py-2 px-4 rounded-full text-lg shadow-chess transition-transform hover:scale-105">
              ♛ Queen (promoted pawn)
            </span>
            <span className="bg-white py-2 px-4 rounded-full text-lg shadow-chess transition-transform hover:scale-105">
              🎯 Goal
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
