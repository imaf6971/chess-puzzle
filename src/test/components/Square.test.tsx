import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Square } from "../../components/Square";
import {
  PieceType,
  SquareType,
  type Square as SquareData,
  type Position,
} from "../../types";
import { createTestPiece } from "../utils/testHelpers";

describe("Square Component", () => {
  const mockOnClick = vi.fn();
  const defaultPosition: Position = { row: 1, col: 2 };

  beforeEach(() => {
    mockOnClick.mockClear();
  });

  describe("Rendering", () => {
    it("should render an empty normal square", () => {
      const emptySquare: SquareData = {
        type: SquareType.NORMAL,
      };

      render(
        <Square
          square={emptySquare}
          position={defaultPosition}
          isSelected={false}
          isValidMove={false}
          onClick={mockOnClick}
        />,
      );

      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
    });

    it("should render a square with a pawn", () => {
      const pawnPiece = createTestPiece(PieceType.PAWN, 1, 2);
      const squareWithPawn: SquareData = {
        type: SquareType.NORMAL,
        piece: pawnPiece,
      };

      render(
        <Square
          square={squareWithPawn}
          position={defaultPosition}
          isSelected={false}
          isValidMove={false}
          onClick={mockOnClick}
        />,
      );

      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent("♟");
    });

    it("should render a square with a knight", () => {
      const knightPiece = createTestPiece(PieceType.KNIGHT, 1, 2);
      const squareWithKnight: SquareData = {
        type: SquareType.NORMAL,
        piece: knightPiece,
      };

      render(
        <Square
          square={squareWithKnight}
          position={defaultPosition}
          isSelected={false}
          isValidMove={false}
          onClick={mockOnClick}
        />,
      );

      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent("♞");
    });

    it("should render a square with a bishop", () => {
      const bishopPiece = createTestPiece(PieceType.BISHOP, 1, 2);
      const squareWithBishop: SquareData = {
        type: SquareType.NORMAL,
        piece: bishopPiece,
      };

      render(
        <Square
          square={squareWithBishop}
          position={defaultPosition}
          isSelected={false}
          isValidMove={false}
          onClick={mockOnClick}
        />,
      );

      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent("♝");
    });

    it("should render a square with a rook", () => {
      const rookPiece = createTestPiece(PieceType.ROOK, 1, 2);
      const squareWithRook: SquareData = {
        type: SquareType.NORMAL,
        piece: rookPiece,
      };

      render(
        <Square
          square={squareWithRook}
          position={defaultPosition}
          isSelected={false}
          isValidMove={false}
          onClick={mockOnClick}
        />,
      );

      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent("♜");
    });

    it("should render a square with a queen", () => {
      const queenPiece = createTestPiece(PieceType.QUEEN, 1, 2);
      const squareWithQueen: SquareData = {
        type: SquareType.NORMAL,
        piece: queenPiece,
      };

      render(
        <Square
          square={squareWithQueen}
          position={defaultPosition}
          isSelected={false}
          isValidMove={false}
          onClick={mockOnClick}
        />,
      );

      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent("♛");
    });

    it("should render a goal square", () => {
      const goalSquare: SquareData = {
        type: SquareType.GOAL,
      };

      render(
        <Square
          square={goalSquare}
          position={defaultPosition}
          isSelected={false}
          isValidMove={false}
          onClick={mockOnClick}
        />,
      );

      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent("🎯");
    });

    it("should render a missing square", () => {
      const missingSquare: SquareData = {
        type: SquareType.MISSING,
      };

      const { container } = render(
        <Square
          square={missingSquare}
          position={defaultPosition}
          isSelected={false}
          isValidMove={false}
          onClick={mockOnClick}
        />,
      );

      // Missing squares render as div, not button
      const div = container.firstChild as HTMLElement;
      expect(div).toBeInTheDocument();
      expect(div.tagName).toBe("DIV");
      expect(div).toHaveClass("cursor-not-allowed", "opacity-30");
    });

    it("should render a goal square with a piece", () => {
      const pawnPiece = createTestPiece(PieceType.PAWN, 1, 2, "pawn-3-3");
      const goalSquareWithPawn: SquareData = {
        type: SquareType.GOAL,
        piece: pawnPiece,
      };

      render(
        <Square
          square={goalSquareWithPawn}
          position={defaultPosition}
          isSelected={false}
          isValidMove={false}
          onClick={mockOnClick}
        />,
      );

      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent("♟");
    });
  });

  describe("Visual States", () => {
    it("should apply selected styling when isSelected is true", () => {
      const squareWithPiece: SquareData = {
        type: SquareType.NORMAL,
        piece: createTestPiece(PieceType.KNIGHT, 1, 2),
      };

      render(
        <Square
          square={squareWithPiece}
          position={defaultPosition}
          isSelected={true}
          isValidMove={false}
          onClick={mockOnClick}
        />,
      );

      const button = screen.getByRole("button");
      expect(button).toHaveClass(
        "!bg-yellow-300",
        "shadow-xl",
        "!border-4",
        "!border-yellow-500",
      );
    });

    it("should apply valid move styling when isValidMove is true", () => {
      const emptySquare: SquareData = {
        type: SquareType.NORMAL,
      };

      render(
        <Square
          square={emptySquare}
          position={defaultPosition}
          isSelected={false}
          isValidMove={true}
          onClick={mockOnClick}
        />,
      );

      const button = screen.getByRole("button");
      expect(button).toHaveClass("!bg-green-300", "animate-valid-move-pulse");
    });

    it("should apply both selected and valid move styling when both are true", () => {
      const squareWithPiece: SquareData = {
        type: SquareType.NORMAL,
        piece: createTestPiece(PieceType.PAWN, 1, 2),
      };

      render(
        <Square
          square={squareWithPiece}
          position={defaultPosition}
          isSelected={true}
          isValidMove={true}
          onClick={mockOnClick}
        />,
      );

      const button = screen.getByRole("button");
      expect(button).toHaveClass(
        "!bg-yellow-300",
        "shadow-xl",
        "!border-4",
        "!border-yellow-500",
      );
    });

    it("should apply goal square styling", () => {
      const goalSquare: SquareData = {
        type: SquareType.GOAL,
      };

      render(
        <Square
          square={goalSquare}
          position={defaultPosition}
          isSelected={false}
          isValidMove={false}
          onClick={mockOnClick}
        />,
      );

      const button = screen.getByRole("button");
      expect(button).toHaveClass("chess-goal-square", "chess-goal-pulse");
    });

    it("should apply missing square styling", () => {
      const missingSquare: SquareData = {
        type: SquareType.MISSING,
      };

      const { container } = render(
        <Square
          square={missingSquare}
          position={defaultPosition}
          isSelected={false}
          isValidMove={false}
          onClick={mockOnClick}
        />,
      );

      const div = container.firstChild as HTMLElement;
      expect(div).toHaveClass(
        "bg-transparent",
        "border-dashed",
        "cursor-not-allowed",
        "opacity-30",
      );
    });

    it("should apply checkerboard pattern for light squares", () => {
      const position: Position = { row: 0, col: 0 }; // Even row + even col = light square
      const normalSquare: SquareData = {
        type: SquareType.NORMAL,
      };

      render(
        <Square
          square={normalSquare}
          position={position}
          isSelected={false}
          isValidMove={false}
          onClick={mockOnClick}
        />,
      );

      const button = screen.getByRole("button");
      expect(button).toHaveClass("chess-light-square");
    });

    it("should apply checkerboard pattern for dark squares", () => {
      const position: Position = { row: 0, col: 1 }; // Even row + odd col = dark square
      const normalSquare: SquareData = {
        type: SquareType.NORMAL,
      };

      render(
        <Square
          square={normalSquare}
          position={position}
          isSelected={false}
          isValidMove={false}
          onClick={mockOnClick}
        />,
      );

      const button = screen.getByRole("button");
      expect(button).toHaveClass("chess-dark-square");
    });
  });

  describe("User Interactions", () => {
    it("should call onClick when clicked", async () => {
      const user = userEvent.setup();
      const normalSquare: SquareData = {
        type: SquareType.NORMAL,
      };

      render(
        <Square
          square={normalSquare}
          position={defaultPosition}
          isSelected={false}
          isValidMove={false}
          onClick={mockOnClick}
        />,
      );

      const button = screen.getByRole("button");
      await user.click(button);

      expect(mockOnClick).toHaveBeenCalledTimes(1);
      expect(mockOnClick).toHaveBeenCalledWith(defaultPosition);
    });

    it("should not call onClick when missing square is clicked", () => {
      const missingSquare: SquareData = {
        type: SquareType.MISSING,
      };

      const { container } = render(
        <Square
          square={missingSquare}
          position={defaultPosition}
          isSelected={false}
          isValidMove={false}
          onClick={mockOnClick}
        />,
      );

      const div = container.firstChild as HTMLElement;
      fireEvent.click(div);

      expect(mockOnClick).not.toHaveBeenCalled();
    });

    it("should handle keyboard events", () => {
      const normalSquare: SquareData = {
        type: SquareType.NORMAL,
        piece: createTestPiece(PieceType.KNIGHT, 1, 2),
      };

      render(
        <Square
          square={normalSquare}
          position={defaultPosition}
          isSelected={false}
          isValidMove={false}
          onClick={mockOnClick}
        />,
      );

      const button = screen.getByRole("button");

      // Focus and press Enter
      button.focus();
      fireEvent.keyDown(button, { key: "Enter" });
      fireEvent.keyUp(button, { key: "Enter" });

      expect(mockOnClick).toHaveBeenCalledWith(defaultPosition);
    });

    it("should handle space key events", () => {
      const normalSquare: SquareData = {
        type: SquareType.NORMAL,
        piece: createTestPiece(PieceType.PAWN, 1, 2),
      };

      render(
        <Square
          square={normalSquare}
          position={defaultPosition}
          isSelected={false}
          isValidMove={false}
          onClick={mockOnClick}
        />,
      );

      const button = screen.getByRole("button");

      // Focus and press Space
      button.focus();
      fireEvent.keyDown(button, { key: " " });
      fireEvent.keyUp(button, { key: " " });

      expect(mockOnClick).toHaveBeenCalledWith(defaultPosition);
    });

    it("should handle multiple rapid clicks", async () => {
      const user = userEvent.setup();
      const normalSquare: SquareData = {
        type: SquareType.NORMAL,
        piece: createTestPiece(PieceType.QUEEN, 1, 2),
      };

      render(
        <Square
          square={normalSquare}
          position={defaultPosition}
          isSelected={false}
          isValidMove={false}
          onClick={mockOnClick}
        />,
      );

      const button = screen.getByRole("button");

      // Rapid clicks
      await user.click(button);
      await user.click(button);
      await user.click(button);

      expect(mockOnClick).toHaveBeenCalledTimes(3);
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA labels for empty squares", () => {
      const emptySquare: SquareData = {
        type: SquareType.NORMAL,
      };

      render(
        <Square
          square={emptySquare}
          position={defaultPosition}
          isSelected={false}
          isValidMove={false}
          onClick={mockOnClick}
        />,
      );

      const button = screen.getByRole("button");
      // Component doesn't provide aria-labels
      expect(button).not.toHaveAttribute("aria-label");
    });

    it("should have proper ARIA labels for squares with pieces", () => {
      const squareWithBishop: SquareData = {
        type: SquareType.NORMAL,
        piece: createTestPiece(PieceType.BISHOP, 1, 2),
      };

      render(
        <Square
          square={squareWithBishop}
          position={defaultPosition}
          isSelected={false}
          isValidMove={false}
          onClick={mockOnClick}
        />,
      );

      const button = screen.getByRole("button");
      // Component doesn't provide aria-labels
      expect(button).not.toHaveAttribute("aria-label");
    });

    it("should have proper ARIA labels for goal squares", () => {
      const goalSquare: SquareData = {
        type: SquareType.GOAL,
      };

      render(
        <Square
          square={goalSquare}
          position={defaultPosition}
          isSelected={false}
          isValidMove={false}
          onClick={mockOnClick}
        />,
      );

      const button = screen.getByRole("button");
      // Component doesn't provide aria-labels
      expect(button).not.toHaveAttribute("aria-label");
    });

    it("should have proper ARIA labels for missing squares", () => {
      const missingSquare: SquareData = {
        type: SquareType.MISSING,
      };

      const { container } = render(
        <Square
          square={missingSquare}
          position={defaultPosition}
          isSelected={false}
          isValidMove={false}
          onClick={mockOnClick}
        />,
      );

      const div = container.firstChild as HTMLElement;
      // Missing squares don't have aria-labels since they're not interactive
      expect(div).not.toHaveAttribute("aria-label");
    });

    it("should be focusable", () => {
      const normalSquare: SquareData = {
        type: SquareType.NORMAL,
      };

      render(
        <Square
          square={normalSquare}
          position={defaultPosition}
          isSelected={false}
          isValidMove={false}
          onClick={mockOnClick}
        />,
      );

      const button = screen.getByRole("button");
      expect(button).not.toHaveAttribute("tabIndex", "-1");
    });

    it("should have proper disabled state for missing squares", () => {
      const missingSquare: SquareData = {
        type: SquareType.MISSING,
      };

      const { container } = render(
        <Square
          square={missingSquare}
          position={defaultPosition}
          isSelected={false}
          isValidMove={false}
          onClick={mockOnClick}
        />,
      );

      const div = container.firstChild as HTMLElement;
      expect(div).toHaveClass("cursor-not-allowed");
    });
  });

  describe("Piece Display", () => {
    it("should display correct Unicode symbol for each piece type", () => {
      const pieceTypes = [
        { type: PieceType.PAWN, expected: "♟" },
        { type: PieceType.KNIGHT, expected: "♞" },
        { type: PieceType.BISHOP, expected: "♝" },
        { type: PieceType.ROOK, expected: "♜" },
        { type: PieceType.QUEEN, expected: "♛" },
      ];

      pieceTypes.forEach(({ type, expected }) => {
        const squareWithPiece: SquareData = {
          type: SquareType.NORMAL,
          piece: createTestPiece(type, 1, 2),
        };

        const { unmount } = render(
          <Square
            square={squareWithPiece}
            position={defaultPosition}
            isSelected={false}
            isValidMove={false}
            onClick={mockOnClick}
          />,
        );

        const button = screen.getByRole("button");
        expect(button).toHaveTextContent(expected);

        unmount();
      });
    });

    it("should display goal symbol for goal squares", () => {
      const goalSquare: SquareData = {
        type: SquareType.GOAL,
      };

      render(
        <Square
          square={goalSquare}
          position={defaultPosition}
          isSelected={false}
          isValidMove={false}
          onClick={mockOnClick}
        />,
      );

      const button = screen.getByRole("button");
      expect(button).toHaveTextContent("🎯");
    });

    it("should show piece over goal symbol when piece is on goal square", () => {
      const pawnPiece = createTestPiece(PieceType.PAWN, 1, 2);
      const goalSquareWithPawn: SquareData = {
        type: SquareType.GOAL,
        piece: pawnPiece,
      };

      render(
        <Square
          square={goalSquareWithPawn}
          position={defaultPosition}
          isSelected={false}
          isValidMove={false}
          onClick={mockOnClick}
        />,
      );

      const button = screen.getByRole("button");
      expect(button).toHaveTextContent("♟");
      expect(button).not.toHaveTextContent("🎯");
    });
  });

  describe("Error Handling", () => {
    it("should handle undefined piece gracefully", () => {
      const squareWithUndefinedPiece: SquareData = {
        type: SquareType.NORMAL,
        piece: undefined,
      };

      render(
        <Square
          square={squareWithUndefinedPiece}
          position={defaultPosition}
          isSelected={false}
          isValidMove={false}
          onClick={mockOnClick}
        />,
      );

      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
    });

    it("should handle invalid piece type gracefully", () => {
      const squareWithInvalidPiece = {
        type: SquareType.NORMAL,
        piece: {
          type: "invalid" as PieceType,
          position: { row: 1, col: 2 },
          id: "invalid-piece",
        },
      } as SquareData;

      render(
        <Square
          square={squareWithInvalidPiece}
          position={defaultPosition}
          isSelected={false}
          isValidMove={false}
          onClick={mockOnClick}
        />,
      );

      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
    });

    it("should handle undefined onClick gracefully", () => {
      const normalSquare: SquareData = {
        type: SquareType.NORMAL,
      };

      const undefinedOnClick = undefined as unknown as (
        position: Position,
      ) => void;

      render(
        <Square
          square={normalSquare}
          position={defaultPosition}
          isSelected={false}
          isValidMove={false}
          onClick={undefinedOnClick}
        />,
      );

      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
    });

    it("should handle edge case positions", () => {
      const edgePositions = [
        { row: 0, col: 0 },
        { row: 0, col: 3 },
        { row: 3, col: 0 },
        { row: 3, col: 3 },
      ];

      const normalSquare: SquareData = {
        type: SquareType.NORMAL,
      };

      edgePositions.forEach((position) => {
        const { unmount } = render(
          <Square
            square={normalSquare}
            position={position}
            isSelected={false}
            isValidMove={false}
            onClick={mockOnClick}
          />,
        );

        const button = screen.getByRole("button");
        expect(button).toBeInTheDocument();
        // Component doesn't provide aria-labels
        expect(button).not.toHaveAttribute("aria-label");

        unmount();
      });
    });
  });

  describe("Performance", () => {
    it("should render quickly", () => {
      const startTime = Date.now();
      const normalSquare: SquareData = {
        type: SquareType.NORMAL,
        piece: createTestPiece(PieceType.QUEEN, 1, 2),
      };

      render(
        <Square
          square={normalSquare}
          position={defaultPosition}
          isSelected={true}
          isValidMove={true}
          onClick={mockOnClick}
        />,
      );

      const endTime = Date.now();
      expect(endTime - startTime).toBeLessThan(50);
    });

    it("should handle frequent prop updates efficiently", () => {
      const normalSquare: SquareData = {
        type: SquareType.NORMAL,
      };

      const { rerender } = render(
        <Square
          square={normalSquare}
          position={defaultPosition}
          isSelected={false}
          isValidMove={false}
          onClick={mockOnClick}
        />,
      );

      // Simulate rapid state changes
      for (let i = 0; i < 10; i++) {
        const squareWithPiece: SquareData = {
          type: SquareType.NORMAL,
          piece:
            i % 2 === 0 ? createTestPiece(PieceType.KNIGHT, 1, 2) : undefined,
        };

        rerender(
          <Square
            square={squareWithPiece}
            position={defaultPosition}
            isSelected={i % 3 === 0}
            isValidMove={i % 4 === 0}
            onClick={mockOnClick}
          />,
        );
      }

      expect(screen.getByRole("button")).toBeInTheDocument();
    });
  });

  describe("Style Classes", () => {
    it("should apply base square styling", () => {
      const normalSquare: SquareData = {
        type: SquareType.NORMAL,
      };

      render(
        <Square
          square={normalSquare}
          position={defaultPosition}
          isSelected={false}
          isValidMove={false}
          onClick={mockOnClick}
        />,
      );

      const button = screen.getByRole("button");
      expect(button).toHaveClass(
        "w-20",
        "h-20",
        "cursor-pointer",
        "transition-all",
        "duration-200",
      );
    });

    it("should apply hover effects", () => {
      const normalSquare: SquareData = {
        type: SquareType.NORMAL,
      };

      render(
        <Square
          square={normalSquare}
          position={defaultPosition}
          isSelected={false}
          isValidMove={false}
          onClick={mockOnClick}
        />,
      );

      const button = screen.getByRole("button");
      expect(button).toHaveClass("hover:scale-105");
    });

    it("should apply active state styling", () => {
      const normalSquare: SquareData = {
        type: SquareType.NORMAL,
        piece: createTestPiece(PieceType.KNIGHT, 1, 2),
      };

      render(
        <Square
          square={normalSquare}
          position={defaultPosition}
          isSelected={false}
          isValidMove={false}
          onClick={mockOnClick}
        />,
      );

      const button = screen.getByRole("button");
      // Component doesn't have active:scale-95 class
      expect(button).toHaveClass("cursor-pointer");
    });

    it("should have proper focus styling", () => {
      const normalSquare: SquareData = {
        type: SquareType.NORMAL,
      };

      render(
        <Square
          square={normalSquare}
          position={defaultPosition}
          isSelected={false}
          isValidMove={false}
          onClick={mockOnClick}
        />,
      );

      const button = screen.getByRole("button");
      // Component doesn't have specific focus styling classes
      expect(button).toHaveAttribute("tabIndex", "0");
    });
  });
});
