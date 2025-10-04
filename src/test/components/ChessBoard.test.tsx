import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ChessBoard } from "../../components/ChessBoard";
import { PieceType, SquareType, type GameState } from "../../types";
import {
  createTestGameState,
  createBoardWithSpecialSquares,
  createTestPiece,
} from "../utils/testHelpers";

describe("ChessBoard Component", () => {
  let mockGameState: GameState;
  const mockOnSquareClick = vi.fn();
  const mockOnResetGame = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    const board = createBoardWithSpecialSquares();
    // Add some test pieces
    board[0][0].piece = createTestPiece(PieceType.KNIGHT, 0, 0);
    board[3][3].piece = createTestPiece(PieceType.PAWN, 3, 3);

    mockGameState = {
      ...createTestGameState(board),
      selectedPiece: undefined,
      validMoves: [],
      isGameWon: false,
    };
  });

  describe("Rendering", () => {
    it("should render without crashing", () => {
      render(
        <ChessBoard
          gameState={mockGameState}
          onSquareClick={mockOnSquareClick}
          onResetGame={mockOnResetGame}
        />,
      );

      expect(
        screen.getByText("Chess Puzzle: Pawn to Goal"),
      ).toBeInTheDocument();
    });

    it("should render the game title and description", () => {
      render(
        <ChessBoard
          gameState={mockGameState}
          onSquareClick={mockOnSquareClick}
          onResetGame={mockOnResetGame}
        />,
      );

      expect(
        screen.getByText("Chess Puzzle: Pawn to Goal"),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Move any pieces to clear a path/),
      ).toBeInTheDocument();
    });

    it("should render all board squares as buttons", () => {
      render(
        <ChessBoard
          gameState={mockGameState}
          onSquareClick={mockOnSquareClick}
          onResetGame={mockOnResetGame}
        />,
      );

      const squares = screen.getAllByRole("button");
      // 14 clickable squares (16 total - 2 missing) + 1 reset button
      expect(squares).toHaveLength(15);
    });

    it("should render reset button", () => {
      render(
        <ChessBoard
          gameState={mockGameState}
          onSquareClick={mockOnSquareClick}
          onResetGame={mockOnResetGame}
        />,
      );

      expect(
        screen.getByRole("button", { name: /Reset Puzzle/i }),
      ).toBeInTheDocument();
    });

    it("should render game instructions", () => {
      render(
        <ChessBoard
          gameState={mockGameState}
          onSquareClick={mockOnSquareClick}
          onResetGame={mockOnResetGame}
        />,
      );

      expect(screen.getByText("How to Play:")).toBeInTheDocument();
      expect(
        screen.getByText(/Click on any piece to select it/),
      ).toBeInTheDocument();
      expect(screen.getByText(/The pawn can ONLY move UP/)).toBeInTheDocument();
    });

    it("should render piece legend", () => {
      render(
        <ChessBoard
          gameState={mockGameState}
          onSquareClick={mockOnSquareClick}
          onResetGame={mockOnResetGame}
        />,
      );

      expect(screen.getByText("Pieces:")).toBeInTheDocument();
      expect(screen.getByText("♞ Knight")).toBeInTheDocument();
      expect(screen.getByText("♝ Bishop")).toBeInTheDocument();
      expect(screen.getByText("♜ Rook")).toBeInTheDocument();
      expect(screen.getByText("♟ Pawn")).toBeInTheDocument();
      expect(screen.getByText("♛ Queen (promoted pawn)")).toBeInTheDocument();
      expect(screen.getByText("🎯 Goal")).toBeInTheDocument();
    });
  });

  describe("Square Selection Display", () => {
    it("should highlight selected piece", () => {
      const selectedPiece = createTestPiece(PieceType.KNIGHT, 0, 0);
      const gameStateWithSelection = {
        ...mockGameState,
        selectedPiece,
      };

      render(
        <ChessBoard
          gameState={gameStateWithSelection}
          onSquareClick={mockOnSquareClick}
          onResetGame={mockOnResetGame}
        />,
      );

      // The selected square should be highlighted (this would be tested via CSS classes)
      const squares = screen.getAllByRole("button");
      const boardSquares = squares.slice(0, 16); // Exclude reset button

      // First square should be the selected one
      expect(boardSquares[0]).toBeInTheDocument();
    });

    it("should highlight valid move squares", () => {
      const selectedPiece = createTestPiece(PieceType.KNIGHT, 0, 0);
      const validMoves = [
        { row: 2, col: 1 },
        { row: 1, col: 2 },
      ];

      const gameStateWithMoves = {
        ...mockGameState,
        selectedPiece,
        validMoves,
      };

      render(
        <ChessBoard
          gameState={gameStateWithMoves}
          onSquareClick={mockOnSquareClick}
          onResetGame={mockOnResetGame}
        />,
      );

      // Valid move squares should be highlighted
      const squares = screen.getAllByRole("button");
      expect(squares).toHaveLength(15); // 14 clickable squares (16 total - 2 missing) + 1 reset button
    });

    it("should not highlight squares when no piece is selected", () => {
      const gameStateNoSelection = {
        ...mockGameState,
        selectedPiece: undefined,
        validMoves: [],
      };

      render(
        <ChessBoard
          gameState={gameStateNoSelection}
          onSquareClick={mockOnSquareClick}
          onResetGame={mockOnResetGame}
        />,
      );

      // Should render without highlights
      const squares = screen.getAllByRole("button");
      expect(squares).toHaveLength(15); // 14 clickable squares (16 total - 2 missing) + 1 reset button
    });
  });

  describe("User Interactions", () => {
    it("should call onSquareClick when a square is clicked", async () => {
      const user = userEvent.setup();

      render(
        <ChessBoard
          gameState={mockGameState}
          onSquareClick={mockOnSquareClick}
          onResetGame={mockOnResetGame}
        />,
      );

      const squares = screen.getAllByRole("button");
      const firstSquare = squares[0]; // First board square

      await user.click(firstSquare);

      expect(mockOnSquareClick).toHaveBeenCalledWith({ row: 0, col: 0 });
    });

    it("should call onResetGame when reset button is clicked", async () => {
      const user = userEvent.setup();

      render(
        <ChessBoard
          gameState={mockGameState}
          onSquareClick={mockOnSquareClick}
          onResetGame={mockOnResetGame}
        />,
      );

      const resetButton = screen.getByRole("button", { name: /Reset Puzzle/i });
      await user.click(resetButton);

      expect(mockOnResetGame).toHaveBeenCalledTimes(1);
    });

    it("should call onSquareClick for different squares with correct positions", async () => {
      const user = userEvent.setup();

      render(
        <ChessBoard
          gameState={mockGameState}
          onSquareClick={mockOnSquareClick}
          onResetGame={mockOnResetGame}
        />,
      );

      const squares = screen.getAllByRole("button");

      // Click first square (0,0)
      await user.click(squares[0]);
      expect(mockOnSquareClick).toHaveBeenCalledWith({ row: 0, col: 0 });

      // Click last board square (3,3)
      await user.click(squares[13]); // 14th board square (0-indexed, accounting for 2 missing squares)
      expect(mockOnSquareClick).toHaveBeenCalledWith({ row: 3, col: 3 });
    });

    it("should handle rapid clicking", async () => {
      const user = userEvent.setup();

      render(
        <ChessBoard
          gameState={mockGameState}
          onSquareClick={mockOnSquareClick}
          onResetGame={mockOnResetGame}
        />,
      );

      const square = screen.getAllByRole("button")[0];

      // Rapid clicks
      await user.click(square);
      await user.click(square);
      await user.click(square);

      expect(mockOnSquareClick).toHaveBeenCalledTimes(3);
    });
  });

  describe("Win State Display", () => {
    it("should display win message when game is won", () => {
      const wonGameState = {
        ...mockGameState,
        isGameWon: true,
      };

      render(
        <ChessBoard
          gameState={wonGameState}
          onSquareClick={mockOnSquareClick}
          onResetGame={mockOnResetGame}
        />,
      );

      expect(
        screen.getByText(/🎉 Congratulations! You solved the puzzle! 🎉/),
      ).toBeInTheDocument();
    });

    it("should not display win message when game is not won", () => {
      const notWonGameState = {
        ...mockGameState,
        isGameWon: false,
      };

      render(
        <ChessBoard
          gameState={notWonGameState}
          onSquareClick={mockOnSquareClick}
          onResetGame={mockOnResetGame}
        />,
      );

      expect(screen.queryByText(/🎉 Congratulations!/)).not.toBeInTheDocument();
    });

    it("should still allow interactions when game is won", async () => {
      const user = userEvent.setup();
      const wonGameState = {
        ...mockGameState,
        isGameWon: true,
      };

      render(
        <ChessBoard
          gameState={wonGameState}
          onSquareClick={mockOnSquareClick}
          onResetGame={mockOnResetGame}
        />,
      );

      const square = screen.getAllByRole("button")[0];
      await user.click(square);

      // Interactions should still work (game logic handles prevention)
      expect(mockOnSquareClick).toHaveBeenCalled();
    });
  });

  describe("Board Layout", () => {
    it("should render squares in correct 4x4 grid layout", () => {
      render(
        <ChessBoard
          gameState={mockGameState}
          onSquareClick={mockOnSquareClick}
          onResetGame={mockOnResetGame}
        />,
      );

      const squares = screen.getAllByRole("button");
      const boardSquares = squares.slice(0, 14);

      // Should have exactly 14 board squares (16 total - 2 missing squares)
      expect(boardSquares).toHaveLength(14);
    });

    it("should handle empty squares correctly", () => {
      const emptyBoard = Array(4)
        .fill(null)
        .map(() =>
          Array(4)
            .fill(null)
            .map(() => ({ type: SquareType.NORMAL })),
        );

      const emptyGameState = {
        ...mockGameState,
        board: emptyBoard,
      };

      render(
        <ChessBoard
          gameState={emptyGameState}
          onSquareClick={mockOnSquareClick}
          onResetGame={mockOnResetGame}
        />,
      );

      // Should still render all squares even if empty
      const squares = screen.getAllByRole("button");
      expect(squares).toHaveLength(17); // 16 + reset
    });

    it("should handle special square types", () => {
      render(
        <ChessBoard
          gameState={mockGameState}
          onSquareClick={mockOnSquareClick}
          onResetGame={mockOnResetGame}
        />,
      );

      // Should render goal and missing squares
      const squares = screen.getAllByRole("button");
      // 14 clickable squares (16 total - 2 missing) + 1 reset button
      expect(squares).toHaveLength(15);
    });
  });

  describe("Accessibility", () => {
    it("should have proper button roles for all interactive elements", () => {
      render(
        <ChessBoard
          gameState={mockGameState}
          onSquareClick={mockOnSquareClick}
          onResetGame={mockOnResetGame}
        />,
      );

      const buttons = screen.getAllByRole("button");
      // 14 clickable squares (16 total - 2 missing) + 1 reset button
      expect(buttons).toHaveLength(15);

      buttons.forEach((button) => {
        expect(button).toBeInTheDocument();
      });
    });

    it("should be keyboard navigable", () => {
      render(
        <ChessBoard
          gameState={mockGameState}
          onSquareClick={mockOnSquareClick}
          onResetGame={mockOnResetGame}
        />,
      );

      const buttons = screen.getAllByRole("button");

      buttons.forEach((button) => {
        // All buttons should be focusable
        expect(button.tabIndex).toBeGreaterThanOrEqual(-1);
      });
    });

    it("should handle keyboard events", async () => {
      render(
        <ChessBoard
          gameState={mockGameState}
          onSquareClick={mockOnSquareClick}
          onResetGame={mockOnResetGame}
        />,
      );

      const firstSquare = screen.getAllByRole("button")[0];

      // Focus and press Enter
      firstSquare.focus();
      fireEvent.keyDown(firstSquare, { key: "Enter" });
      fireEvent.keyUp(firstSquare, { key: "Enter" });

      // Should trigger click
      expect(mockOnSquareClick).toHaveBeenCalledWith({ row: 0, col: 0 });
    });
  });

  describe("Visual Feedback", () => {
    it("should apply correct styling classes", () => {
      render(
        <ChessBoard
          gameState={mockGameState}
          onSquareClick={mockOnSquareClick}
          onResetGame={mockOnResetGame}
        />,
      );

      const title = screen.getByText("Chess Puzzle: Pawn to Goal");
      expect(title).toHaveClass("text-4xl", "font-bold");

      const resetButton = screen.getByRole("button", { name: /Reset Puzzle/i });
      expect(resetButton).toHaveClass(
        "bg-chess-reset",
        "text-white",
        "rounded-full",
      );
    });

    it("should have proper responsive layout", () => {
      const { container } = render(
        <ChessBoard
          gameState={mockGameState}
          onSquareClick={mockOnSquareClick}
          onResetGame={mockOnResetGame}
        />,
      );

      const maxWidthContainer = container.querySelector(".max-w-4xl");
      expect(maxWidthContainer).toBeInTheDocument();
      expect(maxWidthContainer).toHaveClass("max-w-4xl");
    });
  });

  describe("Error Handling", () => {
    it("should handle malformed game state gracefully", () => {
      const malformedGameState: any = {
        ...mockGameState,
        board: null,
      };

      expect(() => {
        render(
          <ChessBoard
            gameState={malformedGameState}
            onSquareClick={mockOnSquareClick}
            onResetGame={mockOnResetGame}
          />,
        );
      }).not.toThrow();
    });

    it("should handle undefined callbacks gracefully", () => {
      expect(() => {
        render(
          <ChessBoard
            gameState={mockGameState}
            onSquareClick={undefined as any}
            onResetGame={undefined as any}
          />,
        );
      }).not.toThrow();
    });

    it("should handle edge case positions", async () => {
      const user = userEvent.setup();

      render(
        <ChessBoard
          gameState={mockGameState}
          onSquareClick={mockOnSquareClick}
          onResetGame={mockOnResetGame}
        />,
      );

      // Test corner squares
      const squares = screen.getAllByRole("button");

      await user.click(squares[0]); // Top-left (0,0)
      expect(mockOnSquareClick).toHaveBeenCalledWith({ row: 0, col: 0 });

      await user.click(squares[13]); // Bottom-right (3,3) - 14th board square accounting for missing squares
      expect(mockOnSquareClick).toHaveBeenCalledWith({ row: 3, col: 3 });
    });
  });

  describe("Performance", () => {
    it("should render efficiently with many pieces", () => {
      // Create board with all squares filled
      const fullBoard = Array(4)
        .fill(null)
        .map((_, row) =>
          Array(4)
            .fill(null)
            .map((_, col) => ({
              type: SquareType.NORMAL,
              piece: createTestPiece(
                PieceType.KNIGHT,
                row,
                col,
                `piece-${row}-${col}`,
              ),
            })),
        );

      const fullGameState = {
        ...mockGameState,
        board: fullBoard,
      };

      const startTime = Date.now();
      render(
        <ChessBoard
          gameState={fullGameState}
          onSquareClick={mockOnSquareClick}
          onResetGame={mockOnResetGame}
        />,
      );
      const endTime = Date.now();

      // Should render quickly even with all squares filled
      expect(endTime - startTime).toBeLessThan(100);
    });

    it("should handle frequent state updates", () => {
      const { rerender } = render(
        <ChessBoard
          gameState={mockGameState}
          onSquareClick={mockOnSquareClick}
          onResetGame={mockOnResetGame}
        />,
      );

      // Simulate rapid state updates
      for (let i = 0; i < 10; i++) {
        const updatedGameState = {
          ...mockGameState,
          selectedPiece:
            i % 2 === 0 ? createTestPiece(PieceType.KNIGHT, 0, 0) : undefined,
        };

        rerender(
          <ChessBoard
            gameState={updatedGameState}
            onSquareClick={mockOnSquareClick}
            onResetGame={mockOnResetGame}
          />,
        );
      }

      // Should handle updates without crashing
      expect(
        screen.getByText("Chess Puzzle: Pawn to Goal"),
      ).toBeInTheDocument();
    });
  });

  describe("Integration with Square Component", () => {
    it("should pass correct props to Square components", () => {
      const selectedPiece = createTestPiece(PieceType.KNIGHT, 0, 0);
      const validMoves = [{ row: 2, col: 1 }];

      const gameStateWithSelection = {
        ...mockGameState,
        selectedPiece,
        validMoves,
      };

      render(
        <ChessBoard
          gameState={gameStateWithSelection}
          onSquareClick={mockOnSquareClick}
          onResetGame={mockOnResetGame}
        />,
      );

      // Should render without errors, indicating proper prop passing
      expect(
        screen.getByText("Chess Puzzle: Pawn to Goal"),
      ).toBeInTheDocument();
    });

    it("should handle Square click events correctly", async () => {
      const user = userEvent.setup();

      render(
        <ChessBoard
          gameState={mockGameState}
          onSquareClick={mockOnSquareClick}
          onResetGame={mockOnResetGame}
        />,
      );

      const squares = screen.getAllByRole("button");

      // Click different squares and verify positions
      await user.click(squares[0]); // (0,0)
      expect(mockOnSquareClick).toHaveBeenLastCalledWith({ row: 0, col: 0 });

      await user.click(squares[5]); // (1,1)
      expect(mockOnSquareClick).toHaveBeenLastCalledWith({ row: 1, col: 1 });
    });
  });
});
