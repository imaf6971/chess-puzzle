import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ChessPuzzle } from "../components/ChessPuzzle";
import { ChessPuzzleAISolver } from "../aiSolver";
import {
  initializeBoard,
  makeMove,
  getValidMoves,
  getPawnPiece,
} from "../gameLogic";
import { PieceType, SquareType } from "../types";

// Mock window.alert for tests
const mockAlert = vi.fn();
vi.stubGlobal("alert", mockAlert);

describe("Chess Puzzle Integration Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    mockAlert.mockClear();
  });

  describe("Game Logic Integration", () => {
    it("should initialize a complete game with all pieces", () => {
      const board = initializeBoard();

      // Count all pieces
      let pieceCount = 0;
      let knightCount = 0;
      let bishopCount = 0;
      let rookCount = 0;
      let pawnCount = 0;

      for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 4; col++) {
          const piece = board[row][col].piece;
          if (piece) {
            pieceCount++;
            switch (piece.type) {
              case PieceType.KNIGHT:
                knightCount++;
                break;
              case PieceType.BISHOP:
                bishopCount++;
                break;
              case PieceType.ROOK:
                rookCount++;
                break;
              case PieceType.PAWN:
                pawnCount++;
                break;
            }
          }
        }
      }

      expect(pieceCount).toBe(13); // 4+4+4+1
      expect(knightCount).toBe(4);
      expect(bishopCount).toBe(4);
      expect(rookCount).toBe(4);
      expect(pawnCount).toBe(1);

      // Check special squares
      expect(board[3][0].type).toBe(SquareType.GOAL);
      expect(board[3][1].type).toBe(SquareType.MISSING);
      expect(board[3][2].type).toBe(SquareType.MISSING);
    });

    it("should handle piece movement and board updates correctly", () => {
      const board = initializeBoard();

      // Create a scenario where we can move a piece
      // Clear some spaces to allow movement
      const testBoard = structuredClone(board);

      // Clear path for knight movement
      testBoard[2][1].piece = undefined;

      const knight = testBoard[0][0].piece!;
      const validMoves = getValidMoves(knight, testBoard);

      expect(validMoves.length).toBeGreaterThan(0);

      // Make a valid move
      const move = {
        from: knight.position,
        to: validMoves[0],
        piece: knight,
      };

      const result = makeMove(testBoard, move);

      expect(result.isValid).toBe(true);
      expect(result.resultingBoard).toBeDefined();
      expect(
        result.resultingBoard![knight.position.row][knight.position.col].piece,
      ).toBeUndefined();
      expect(
        result.resultingBoard![validMoves[0].row][validMoves[0].col].piece
          ?.type,
      ).toBe(PieceType.KNIGHT);
    });

    it("should track pawn promotion correctly through game sequence", () => {
      const board = initializeBoard();
      let currentBoard = structuredClone(board);

      // Clear path for pawn
      for (let row = 0; row < 3; row++) {
        currentBoard[row][3].piece = undefined;
      }

      const pawn = getPawnPiece(currentBoard)!;
      expect(pawn.type).toBe(PieceType.PAWN);

      // Move pawn step by step to promotion
      let currentPawn = pawn;
      for (let targetRow = 2; targetRow >= 0; targetRow--) {
        const move = {
          from: currentPawn.position,
          to: { row: targetRow, col: 3 },
          piece: currentPawn,
        };

        const result = makeMove(currentBoard, move);
        expect(result.isValid).toBe(true);

        if (targetRow === 0) {
          expect(result.isPromotion).toBe(true);
          expect(result.resultingBoard![0][3].piece?.type).toBe(
            PieceType.QUEEN,
          );
          expect(result.resultingBoard![0][3].piece?.id).toBe("pawn-3-3");
        } else {
          expect(result.isPromotion).toBeFalsy();
        }

        currentBoard = result.resultingBoard!;
        currentPawn = currentBoard[targetRow][3].piece!;
      }
    });

    it("should handle complete win scenario", () => {
      // Create a board where pawn can win
      const winBoard = Array(4)
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
            })),
        );

      // Place promoted queen (originally pawn) near goal
      const promotedQueen = {
        type: PieceType.QUEEN,
        position: { row: 2, col: 0 },
        id: "pawn-3-3",
      };
      winBoard[2][0].piece = promotedQueen;

      const winMove = {
        from: { row: 2, col: 0 },
        to: { row: 3, col: 0 },
        piece: promotedQueen,
      };

      const result = makeMove(winBoard, winMove);

      expect(result.isValid).toBe(true);
      expect(result.isGameWon).toBe(true);
      expect(result.resultingBoard![3][0].piece?.id).toBe("pawn-3-3");
    });
  });

  describe("AI Solver Integration", () => {
    it("should analyze board state and provide meaningful insights", () => {
      const solver = new ChessPuzzleAISolver();
      const board = initializeBoard();

      const analysis = solver.analyzeBoardState(board);

      expect(analysis.pawnPosition).toEqual({ row: 3, col: 3 });
      expect(analysis.isPawnPromoted).toBe(false);
      expect(analysis.movesToPromotion).toBe(3);
      expect(analysis.blockingPieces).toBeGreaterThan(0);
      expect(analysis.movesToGoal).toBeGreaterThan(3);
    });

    it("should handle promoted pawn analysis", () => {
      const solver = new ChessPuzzleAISolver();

      // Create board with promoted pawn
      const testBoard = Array(4)
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
            })),
        );

      const promotedQueen = {
        type: PieceType.QUEEN,
        position: { row: 0, col: 2 },
        id: "pawn-3-3",
      };
      testBoard[0][2].piece = promotedQueen;

      const analysis = solver.analyzeBoardState(testBoard);

      expect(analysis.isPawnPromoted).toBe(true);
      expect(analysis.movesToPromotion).toBe(0);
      expect(analysis.movesToGoal).toBe(5); // Manhattan distance
    });

    it("should provide consistent analysis across multiple calls", () => {
      const solver = new ChessPuzzleAISolver();
      const board = initializeBoard();

      const analysis1 = solver.analyzeBoardState(board);
      const analysis2 = solver.analyzeBoardState(board);

      expect(analysis1).toEqual(analysis2);
    });
  });

  describe("Component Integration", () => {
    it("should render complete game interface", () => {
      render(<ChessPuzzle />);

      // Should render chess board
      expect(screen.getByRole("main")).toBeInTheDocument();

      // Should render all board squares as buttons
      const squares = screen.getAllByRole("button");
      expect(squares).toHaveLength(15); // 14 board squares (16 total - 2 missing) + 1 reset button
    });

    it("should handle complete user interaction flow", async () => {
      const user = userEvent.setup();

      render(<ChessPuzzle />);

      const squares = screen.getAllByRole("button");

      // Try to interact with the interface
      await user.click(squares[0]);

      // Should not crash and should handle the click
      expect(screen.getByRole("main")).toBeInTheDocument();
    });

    it("should maintain game state consistency across interactions", async () => {
      const user = userEvent.setup();

      render(<ChessPuzzle />);

      const squares = screen.getAllByRole("button");

      // Multiple interactions should not crash the component
      await user.click(squares[0]);
      await user.click(squares[1]);
      await user.click(squares[2]);

      expect(screen.getByRole("main")).toBeInTheDocument();
    });
  });

  describe("End-to-End Game Scenarios", () => {
    it("should handle a simplified winning scenario", () => {
      // Create a nearly won game state
      const nearWinBoard = Array(4)
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
            })),
        );

      // Place promoted queen one move from victory
      const winningQueen = {
        type: PieceType.QUEEN,
        position: { row: 2, col: 0 },
        id: "pawn-3-3",
      };
      nearWinBoard[2][0].piece = winningQueen;

      // Queen should be able to reach goal
      const validMoves = getValidMoves(winningQueen, nearWinBoard);
      const goalMove = validMoves.find(
        (move) => move.row === 3 && move.col === 0,
      );

      expect(goalMove).toBeDefined();

      // Execute winning move
      const winMove = {
        from: { row: 2, col: 0 },
        to: { row: 3, col: 0 },
        piece: winningQueen,
      };

      const result = makeMove(nearWinBoard, winMove);

      expect(result.isValid).toBe(true);
      expect(result.isGameWon).toBe(true);
    });

    it("should handle piece blocking scenarios correctly", () => {
      const board = initializeBoard();
      const pawn = getPawnPiece(board)!;

      // Pawn should be blocked by pieces above it
      const validMoves = getValidMoves(pawn, board);
      expect(validMoves).toHaveLength(0); // Should be blocked

      // Clear the blocking piece
      const clearedBoard = structuredClone(board);
      clearedBoard[2][3].piece = undefined; // Remove rook above pawn

      const clearedValidMoves = getValidMoves(pawn, clearedBoard);
      expect(clearedValidMoves).toHaveLength(1); // Should now be able to move
      expect(clearedValidMoves[0]).toEqual({ row: 2, col: 3 });
    });

    it("should validate game rules throughout play session", () => {
      const board = initializeBoard();

      // Test knight movement rules
      const knight = board[0][0].piece!;
      const knightMoves = getValidMoves(knight, board);

      // Knight moves should follow L-shape pattern
      knightMoves.forEach((move) => {
        const rowDiff = Math.abs(move.row - knight.position.row);
        const colDiff = Math.abs(move.col - knight.position.col);

        const isValidKnightMove =
          (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);

        expect(isValidKnightMove).toBe(true);
      });

      // Test bishop movement rules
      const bishop = board[1][0].piece!;
      const bishopMoves = getValidMoves(bishop, board);

      bishopMoves.forEach((move) => {
        const rowDiff = Math.abs(move.row - bishop.position.row);
        const colDiff = Math.abs(move.col - bishop.position.col);

        // Bishop moves diagonally
        expect(rowDiff).toBe(colDiff);
      });

      // Test rook movement rules
      const rook = board[2][0].piece!;
      const rookMoves = getValidMoves(rook, board);

      rookMoves.forEach((move) => {
        const rowDiff = Math.abs(move.row - rook.position.row);
        const colDiff = Math.abs(move.col - rook.position.col);

        // Rook moves horizontally or vertically
        expect(rowDiff === 0 || colDiff === 0).toBe(true);
        expect(rowDiff === 0 && colDiff === 0).toBe(false);
      });
    });
  });

  describe("Error Handling and Edge Cases", () => {
    it("should handle malformed game states gracefully", () => {
      const malformedBoard: any = Array(4).fill(null);

      expect(() => {
        const solver = new ChessPuzzleAISolver();
        solver.analyzeBoardState(malformedBoard);
      }).not.toThrow();
    });

    it("should handle empty board scenarios", () => {
      const emptyBoard = Array(4)
        .fill(null)
        .map(() =>
          Array(4)
            .fill(null)
            .map(() => ({ type: SquareType.NORMAL })),
        );

      const pawn = getPawnPiece(emptyBoard);
      expect(pawn).toBeNull();

      const solver = new ChessPuzzleAISolver();
      const analysis = solver.analyzeBoardState(emptyBoard);

      expect(analysis.pawnPosition).toBeNull();
      expect(analysis.movesToGoal).toBe(Infinity);
    });

    it("should handle boundary conditions", () => {
      const board = initializeBoard();

      // Test moves to board edges
      const cornerKnight = board[0][0].piece!;
      const edgeMoves = getValidMoves(cornerKnight, board);

      // All moves should be within board bounds
      edgeMoves.forEach((move) => {
        expect(move.row).toBeGreaterThanOrEqual(0);
        expect(move.row).toBeLessThan(4);
        expect(move.col).toBeGreaterThanOrEqual(0);
        expect(move.col).toBeLessThan(4);
      });
    });

    it("should maintain board integrity after operations", () => {
      const board = initializeBoard();
      const originalBoardString = JSON.stringify(board);

      // Perform read operations
      getPawnPiece(board);
      getValidMoves(board[0][0].piece!, board);

      // Original board should remain unchanged
      expect(JSON.stringify(board)).toBe(originalBoardString);
    });

    it("should handle rapid successive operations", () => {
      const board = initializeBoard();
      const solver = new ChessPuzzleAISolver();

      // Perform multiple rapid operations
      for (let i = 0; i < 10; i++) {
        const analysis = solver.analyzeBoardState(board);
        expect(analysis.pawnPosition).toEqual({ row: 3, col: 3 });

        const pawn = getPawnPiece(board);
        expect(pawn?.position).toEqual({ row: 3, col: 3 });
      }
    });
  });

  describe("Performance Integration", () => {
    it("should initialize game state quickly", () => {
      const startTime = Date.now();
      const board = initializeBoard();
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(100);
      expect(board).toHaveLength(4);
    });

    it("should handle move validation efficiently", () => {
      const board = initializeBoard();
      const startTime = Date.now();

      // Validate moves for all pieces
      for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 4; col++) {
          const piece = board[row][col].piece;
          if (piece) {
            getValidMoves(piece, board);
          }
        }
      }

      const endTime = Date.now();
      expect(endTime - startTime).toBeLessThan(500);
    });

    it("should handle AI analysis efficiently", () => {
      const board = initializeBoard();
      const solver = new ChessPuzzleAISolver();

      const startTime = Date.now();
      const analysis = solver.analyzeBoardState(board);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(100);
      expect(analysis).toBeDefined();
    });
  });

  describe("Data Consistency", () => {
    it("should maintain consistent piece identification", () => {
      const board = initializeBoard();
      const pawn1 = getPawnPiece(board);
      const pawn2 = board[3][3].piece;

      expect(pawn1?.id).toBe(pawn2?.id);
      expect(pawn1?.type).toBe(pawn2?.type);
      expect(pawn1?.position).toEqual(pawn2?.position);
    });

    it("should maintain board consistency across operations", () => {
      const board = initializeBoard();
      const initialPieceCount = board
        .flat()
        .filter((square) => square.piece).length;

      // Perform various read operations
      getPawnPiece(board);

      const finalPieceCount = board
        .flat()
        .filter((square) => square.piece).length;

      expect(finalPieceCount).toBe(initialPieceCount);
    });
  });
});
