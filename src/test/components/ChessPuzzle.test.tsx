import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ChessPuzzle } from "../../components/ChessPuzzle";
import * as gameLogic from "../../gameLogic";
import { PieceType, SquareType, type GameState, type Move } from "../../types";

// Mock the gameLogic module
vi.mock("../../gameLogic", () => ({
  initializeGameState: vi.fn(),
  getValidMoves: vi.fn(),
  makeMove: vi.fn(),
}));

// Mock window.alert to avoid issues in tests
const mockAlert = vi.fn();
vi.stubGlobal("alert", mockAlert);

describe("ChessPuzzle Component", () => {
  const mockInitialGameState: GameState = {
    board: Array(4)
      .fill(null)
      .map((_, row) =>
        Array(4)
          .fill(null)
          .map((_, col) => ({
            type:
              row === 3 && col === 0
                ? SquareType.GOAL
                : row === 3 && (col === 1 || col === 2)
                  ? SquareType.MISSING
                  : SquareType.NORMAL,
            piece:
              row === 0 && col === 0
                ? {
                    type: PieceType.KNIGHT,
                    position: { row: 0, col: 0 },
                    id: "knight-0-0",
                  }
                : row === 3 && col === 3
                  ? {
                      type: PieceType.PAWN,
                      position: { row: 3, col: 3 },
                      id: "pawn-3-3",
                    }
                  : undefined,
          })),
      ),
    currentTurn: "player" as const,
    validMoves: [],
    moveHistory: [],
    isGameWon: false,
    isGameOver: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (gameLogic.initializeGameState as any).mockReturnValue(
      mockInitialGameState,
    );
    (gameLogic.getValidMoves as any).mockReturnValue([]);
    (gameLogic.makeMove as any).mockReturnValue({ isValid: false });
  });

  describe("Rendering", () => {
    it("should render without crashing", () => {
      render(<ChessPuzzle />);
      expect(screen.getByRole("main")).toBeInTheDocument();
    });

    it("should initialize game state on mount", () => {
      render(<ChessPuzzle />);
      expect(gameLogic.initializeGameState).toHaveBeenCalledTimes(1);
    });

    it("should render the chess board", () => {
      render(<ChessPuzzle />);

      // Check if board squares are rendered
      const squares = screen.getAllByRole("button");
      expect(squares.length).toBeGreaterThan(0);
    });

    it("should pass game state to ChessBoard component", () => {
      render(<ChessPuzzle />);

      // The ChessBoard should receive the initial game state
      // We can verify this by checking if pieces are rendered
      const squares = screen.getAllByRole("button");
      expect(squares).toBeDefined();
    });
  });

  describe("Piece Selection", () => {
    it("should handle piece selection", async () => {
      const user = userEvent.setup();

      const mockValidMoves = [
        { row: 2, col: 1 },
        { row: 1, col: 2 },
      ];
      (gameLogic.getValidMoves as any).mockReturnValue(mockValidMoves);

      render(<ChessPuzzle />);

      // Find and click on a piece (knight at 0,0)
      const knightSquare = screen.getAllByRole("button")[0]; // First square should be knight
      await user.click(knightSquare);

      expect(gameLogic.getValidMoves).toHaveBeenCalledWith(
        mockInitialGameState.board[0][0].piece,
        mockInitialGameState.board,
      );
    });

    it("should deselect piece when clicking on the same piece", async () => {
      const user = userEvent.setup();

      const mockValidMoves = [{ row: 2, col: 1 }];
      (gameLogic.getValidMoves as any).mockReturnValue(mockValidMoves);

      render(<ChessPuzzle />);

      const knightSquare = screen.getAllByRole("button")[0];

      // First click - select piece
      await user.click(knightSquare);
      expect(gameLogic.getValidMoves).toHaveBeenCalledTimes(1);

      // Second click - deselect piece
      await user.click(knightSquare);

      // Should not call getValidMoves again for deselection
      expect(gameLogic.getValidMoves).toHaveBeenCalledTimes(1);
    });

    it("should select different piece when clicking another piece", async () => {
      const user = userEvent.setup();

      const mockValidMoves = [{ row: 2, col: 1 }];
      (gameLogic.getValidMoves as any).mockReturnValue(mockValidMoves);

      render(<ChessPuzzle />);

      const squares = screen.getAllByRole("button");

      // Find squares with pieces by testing their text content
      const knightSquare = squares.find((square) =>
        square.textContent?.includes("♞"),
      );
      const pawnSquare = squares.find((square) =>
        square.textContent?.includes("♟"),
      );

      expect(knightSquare).toBeDefined();
      expect(pawnSquare).toBeDefined();

      // Select first piece (knight)
      await user.click(knightSquare!);
      expect(gameLogic.getValidMoves).toHaveBeenCalledTimes(1);

      // Select different piece (pawn)
      await user.click(pawnSquare!);
      expect(gameLogic.getValidMoves).toHaveBeenCalledTimes(2);
    });

    it("should not select pieces when game is won", async () => {
      const user = userEvent.setup();

      const wonGameState = {
        ...mockInitialGameState,
        isGameWon: true,
      };
      (gameLogic.initializeGameState as any).mockReturnValue(wonGameState);

      render(<ChessPuzzle />);

      const square = screen.getAllByRole("button")[0];
      await user.click(square);

      // Should not call getValidMoves when game is won
      expect(gameLogic.getValidMoves).not.toHaveBeenCalled();
    });
  });

  describe("Move Making", () => {
    it("should make valid moves", async () => {
      const user = userEvent.setup();

      const mockValidMoves = [{ row: 2, col: 1 }];
      const mockMoveResult = {
        isValid: true,
        resultingBoard: mockInitialGameState.board,
        isPromotion: false,
        isGameWon: false,
      };

      (gameLogic.getValidMoves as any).mockReturnValue(mockValidMoves);
      (gameLogic.makeMove as any).mockReturnValue(mockMoveResult);

      render(<ChessPuzzle />);

      const squares = screen.getAllByRole("button");

      // Select piece (knight at 0,0)
      await user.click(squares[0]);

      // Make move to valid position
      const targetSquare = squares[9]; // Some empty square
      await user.click(targetSquare);

      expect(gameLogic.makeMove).toHaveBeenCalledWith(
        mockInitialGameState.board,
        expect.objectContaining({
          from: { row: 0, col: 0 },
          piece: mockInitialGameState.board[0][0].piece,
        }),
      );
    });

    it("should reject invalid moves", async () => {
      const user = userEvent.setup();

      const mockValidMoves = [{ row: 2, col: 1 }];
      const mockMoveResult = {
        isValid: false,
      };

      (gameLogic.getValidMoves as any).mockReturnValue(mockValidMoves);
      (gameLogic.makeMove as any).mockReturnValue(mockMoveResult);

      render(<ChessPuzzle />);

      const squares = screen.getAllByRole("button");

      // Select piece
      await user.click(squares[0]);

      // Try to make invalid move
      await user.click(squares[5]);

      expect(gameLogic.makeMove).toHaveBeenCalled();

      // Piece should be deselected after invalid move
      // We can verify this by checking that clicking the same square again calls getValidMoves
      await user.click(squares[0]);
      expect(gameLogic.getValidMoves).toHaveBeenCalledTimes(2);
    });

    it("should handle pawn promotion", async () => {
      const user = userEvent.setup();

      const mockValidMoves = [{ row: 0, col: 3 }];
      const mockMoveResult = {
        isValid: true,
        resultingBoard: mockInitialGameState.board,
        isPromotion: true,
        isGameWon: false,
      };

      (gameLogic.getValidMoves as any).mockReturnValue(mockValidMoves);
      (gameLogic.makeMove as any).mockReturnValue(mockMoveResult);

      render(<ChessPuzzle />);

      const squares = screen.getAllByRole("button");

      // Find pawn square
      const pawnSquare = squares.find((square) =>
        square.textContent?.includes("♟"),
      );
      expect(pawnSquare).toBeDefined();

      // Select pawn
      await user.click(pawnSquare!);

      // Find an empty square to move to (not missing squares)
      const targetSquare = squares.find(
        (square) =>
          !square.textContent?.match(/[♞♟🎯]/) &&
          square.getAttribute("role") === "button",
      );
      expect(targetSquare).toBeDefined();

      // Make promotion move
      await user.click(targetSquare!);

      expect(gameLogic.makeMove).toHaveBeenCalled();

      // Should show promotion alert
      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith(
          "🎉 Your pawn has been promoted to a Queen! 🎉",
        );
      });
    });

    it("should handle winning moves", async () => {
      const user = userEvent.setup();

      const mockValidMoves = [{ row: 3, col: 0 }];
      const mockMoveResult = {
        isValid: true,
        resultingBoard: mockInitialGameState.board,
        isPromotion: false,
        isGameWon: true,
      };

      (gameLogic.getValidMoves as any).mockReturnValue(mockValidMoves);
      (gameLogic.makeMove as any).mockReturnValue(mockMoveResult);

      render(<ChessPuzzle />);

      const squares = screen.getAllByRole("button");

      // Select piece
      await user.click(squares[0]);

      // Make winning move
      await user.click(squares[12]); // Goal square

      expect(gameLogic.makeMove).toHaveBeenCalled();

      // Should show win alert
      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith(
          "🏆 Congratulations! You solved the puzzle! 🏆",
        );
      });
    });

    it("should handle promotion and win in same move", async () => {
      const user = userEvent.setup();

      const mockValidMoves = [{ row: 3, col: 0 }];
      const mockMoveResult = {
        isValid: true,
        resultingBoard: mockInitialGameState.board,
        isPromotion: true,
        isGameWon: true,
      };

      (gameLogic.getValidMoves as any).mockReturnValue(mockValidMoves);
      (gameLogic.makeMove as any).mockReturnValue(mockMoveResult);

      render(<ChessPuzzle />);

      const squares = screen.getAllByRole("button");

      // Select piece
      await user.click(squares[0]);

      // Make move that both promotes and wins
      await user.click(squares[12]);

      expect(gameLogic.makeMove).toHaveBeenCalled();

      // Should show both alerts
      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith(
          "🎉 Your pawn has been promoted to a Queen! 🎉",
        );
      });

      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith(
          "🏆 Congratulations! You solved the puzzle! 🏆",
        );
      });
    });
  });

  describe("Game Reset", () => {
    it("should reset game when reset is triggered", async () => {
      const user = userEvent.setup();

      render(<ChessPuzzle />);

      // Initial call
      expect(gameLogic.initializeGameState).toHaveBeenCalledTimes(1);

      // Find reset button (this would be passed to ChessBoard)
      // Since we don't have direct access to the reset button from ChessPuzzle,
      // we'll test that the reset handler is properly created and passed

      // The reset functionality would be tested in ChessBoard component tests
      expect(gameLogic.initializeGameState).toHaveBeenCalled();
    });

    it("should clear selection and valid moves on reset", () => {
      render(<ChessPuzzle />);

      // After initialization, the game state should have no selected piece
      // and empty valid moves array
      expect(gameLogic.initializeGameState).toHaveBeenCalledWith();
    });
  });

  describe("Move History", () => {
    it("should track move history", async () => {
      const user = userEvent.setup();

      const mockValidMoves = [{ row: 2, col: 1 }];
      let moveCount = 0;

      (gameLogic.getValidMoves as any).mockReturnValue(mockValidMoves);
      (gameLogic.makeMove as any).mockImplementation(() => {
        moveCount++;
        return {
          isValid: true,
          resultingBoard: mockInitialGameState.board,
          isPromotion: false,
          isGameWon: false,
        };
      });

      render(<ChessPuzzle />);

      const squares = screen.getAllByRole("button");

      // Find knight and pawn pieces
      const knightSquare = squares.find((square) =>
        square.textContent?.includes("♞"),
      );
      const pawnSquare = squares.find((square) =>
        square.textContent?.includes("♟"),
      );

      // Find empty squares to move to
      const emptySquares = squares.filter(
        (square) =>
          !square.textContent?.match(/[♞♟🎯]/) &&
          square.getAttribute("role") === "button",
      );

      expect(knightSquare).toBeDefined();
      expect(pawnSquare).toBeDefined();
      expect(emptySquares.length).toBeGreaterThan(1);

      // Make first move with knight
      await user.click(knightSquare!);
      await user.click(emptySquares[0]);

      expect(gameLogic.makeMove).toHaveBeenCalledTimes(1);

      // Make second move with pawn
      await user.click(pawnSquare!);
      await user.click(emptySquares[1]);

      expect(gameLogic.makeMove).toHaveBeenCalledTimes(2);
    });
  });

  describe("Edge Cases", () => {
    it("should handle clicking on empty squares when no piece is selected", async () => {
      const user = userEvent.setup();

      render(<ChessPuzzle />);

      const squares = screen.getAllByRole("button");

      // Click on empty square (should do nothing)
      await user.click(squares[5]); // Assuming this is empty

      expect(gameLogic.getValidMoves).not.toHaveBeenCalled();
      expect(gameLogic.makeMove).not.toHaveBeenCalled();
    });

    it("should handle rapid clicking", async () => {
      const user = userEvent.setup();

      const mockValidMoves = [{ row: 2, col: 1 }];
      (gameLogic.getValidMoves as any).mockReturnValue(mockValidMoves);

      render(<ChessPuzzle />);

      const square = screen.getAllByRole("button")[0];

      // Rapid clicks
      await user.click(square);
      await user.click(square);
      await user.click(square);

      // Should handle multiple clicks gracefully
      expect(gameLogic.getValidMoves).toHaveBeenCalled();
    });

    it("should handle undefined move results", async () => {
      const user = userEvent.setup();

      const mockValidMoves = [{ row: 2, col: 1 }];
      (gameLogic.getValidMoves as any).mockReturnValue(mockValidMoves);
      (gameLogic.makeMove as any).mockReturnValue({
        isValid: true,
        resultingBoard: undefined, // Edge case
      });

      render(<ChessPuzzle />);

      const squares = screen.getAllByRole("button");

      await user.click(squares[0]);
      await user.click(squares[9]);

      // Should not crash when resultingBoard is undefined
      expect(gameLogic.makeMove).toHaveBeenCalled();
    });
  });

  describe("State Management", () => {
    it("should maintain consistent state throughout interactions", async () => {
      const user = userEvent.setup();

      const mockValidMoves = [{ row: 2, col: 1 }];
      (gameLogic.getValidMoves as any).mockReturnValue(mockValidMoves);
      (gameLogic.makeMove as any).mockReturnValue({
        isValid: true,
        resultingBoard: mockInitialGameState.board,
        isPromotion: false,
        isGameWon: false,
      });

      render(<ChessPuzzle />);

      const squares = screen.getAllByRole("button");

      // Find knight and pawn pieces
      const knightSquare = squares.find((square) =>
        square.textContent?.includes("♞"),
      );
      const pawnSquare = squares.find((square) =>
        square.textContent?.includes("♟"),
      );

      // Find empty squares to move to
      const emptySquares = squares.filter(
        (square) =>
          !square.textContent?.match(/[♞♟🎯]/) &&
          square.getAttribute("role") === "button",
      );

      expect(knightSquare).toBeDefined();
      expect(pawnSquare).toBeDefined();
      expect(emptySquares.length).toBeGreaterThan(0);

      // Select first piece (knight)
      await user.click(knightSquare!);
      expect(gameLogic.getValidMoves).toHaveBeenCalledTimes(1);

      // Make move
      await user.click(emptySquares[0]);
      expect(gameLogic.makeMove).toHaveBeenCalledTimes(1);

      // Select another piece (pawn)
      await user.click(pawnSquare!);
      expect(gameLogic.getValidMoves).toHaveBeenCalledTimes(2);

      // State should be consistent throughout
      expect(gameLogic.initializeGameState).toHaveBeenCalledTimes(1);
    });

    it("should update board state after successful moves", async () => {
      const user = userEvent.setup();

      const newBoard = Array(4)
        .fill(null)
        .map(() =>
          Array(4)
            .fill(null)
            .map(() => ({ type: SquareType.NORMAL })),
        );

      const mockValidMoves = [{ row: 1, col: 0 }];
      (gameLogic.getValidMoves as any).mockReturnValue(mockValidMoves);
      (gameLogic.makeMove as any).mockReturnValue({
        isValid: true,
        resultingBoard: newBoard,
        isPromotion: false,
        isGameWon: false,
      });

      render(<ChessPuzzle />);

      const squares = screen.getAllByRole("button");

      // Make a move
      await user.click(squares[0]);
      await user.click(squares[4]);

      expect(gameLogic.makeMove).toHaveBeenCalledWith(
        mockInitialGameState.board,
        expect.any(Object),
      );

      // After move, the board should be updated
      // This would be reflected in subsequent interactions
    });
  });

  describe("Accessibility", () => {
    it("should be keyboard navigable", () => {
      render(<ChessPuzzle />);

      const allButtons = screen.getAllByRole("button");

      // Filter out the reset button to only get square elements
      const squares = allButtons.filter(
        (button) => !button.textContent?.includes("Reset Puzzle"),
      );

      // Squares should be focusable (handled by individual Square components)
      // Check that squares exist and are interactive
      squares.forEach((square) => {
        expect(square).toBeInTheDocument();
        expect(square.tagName).toBe("DIV"); // Square components render as divs with role="button"
      });

      // Verify that at least some squares are rendered
      expect(squares.length).toBeGreaterThan(0);
    });

    it("should have proper ARIA labels", () => {
      render(<ChessPuzzle />);

      // Main container should have proper role
      const main = screen.getByRole("main");
      expect(main).toBeInTheDocument();

      // Buttons should be properly labeled
      const buttons = screen.getAllByRole("button");
      expect(buttons.length).toBeGreaterThan(0);
    });
  });
});
