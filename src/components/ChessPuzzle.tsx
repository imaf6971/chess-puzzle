import React, { useState, useCallback } from "react";
import { ChessBoard } from "./ChessBoard";
import type { GameState, Position, Move } from "../types";
import { initializeGameState, getValidMoves, makeMove } from "../gameLogic";

export const ChessPuzzle: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(() =>
    initializeGameState(),
  );

  const handleSquareClick = useCallback(
    (position: Position) => {
      const { board, selectedPiece, isGameWon } = gameState;

      // Don't allow moves if game is won
      if (isGameWon) {
        return;
      }

      // Get the piece at the clicked position
      const clickedPiece = board[position.row][position.col].piece;

      // If no piece is selected
      if (!selectedPiece) {
        // Allow selecting any piece (all pieces belong to the player)
        if (clickedPiece) {
          const validMoves = getValidMoves(clickedPiece, board);
          setGameState((prev) => ({
            ...prev,
            selectedPiece: clickedPiece,
            validMoves,
          }));
        }
        return;
      }

      // If clicking on the same piece, deselect it
      if (
        selectedPiece.position.row === position.row &&
        selectedPiece.position.col === position.col
      ) {
        setGameState((prev) => ({
          ...prev,
          selectedPiece: undefined,
          validMoves: [],
        }));
        return;
      }

      // If clicking on another piece, select it instead
      if (clickedPiece) {
        const validMoves = getValidMoves(clickedPiece, board);
        setGameState((prev) => ({
          ...prev,
          selectedPiece: clickedPiece,
          validMoves,
        }));
        return;
      }

      // Try to make a move
      const move: Move = {
        from: selectedPiece.position,
        to: position,
        piece: selectedPiece,
      };

      const moveResult = makeMove(board, move);

      if (moveResult.isValid && moveResult.resultingBoard) {
        // Update move history
        const newMoveHistory = [...gameState.moveHistory, move];

        setGameState((prev) => ({
          ...prev,
          board: moveResult.resultingBoard!,
          selectedPiece: undefined,
          validMoves: [],
          moveHistory: newMoveHistory,
          isGameWon: moveResult.isGameWon || false,
          isGameOver: moveResult.isGameWon || false,
        }));

        // Show promotion message if applicable
        if (moveResult.isPromotion) {
          setTimeout(() => {
            alert("🎉 Your pawn has been promoted to a Queen! 🎉");
          }, 100);
        }

        // Show win message if applicable
        if (moveResult.isGameWon) {
          setTimeout(() => {
            alert("🏆 Congratulations! You solved the puzzle! 🏆");
          }, 200);
        }
      } else {
        // Invalid move, deselect the piece
        setGameState((prev) => ({
          ...prev,
          selectedPiece: undefined,
          validMoves: [],
        }));
      }
    },
    [gameState],
  );

  const handleResetGame = useCallback(() => {
    setGameState(initializeGameState());
  }, []);

  return (
    <main role="main">
      <ChessBoard
        gameState={gameState}
        onSquareClick={handleSquareClick}
        onResetGame={handleResetGame}
      />
    </main>
  );
};
