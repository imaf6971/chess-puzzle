import { describe, it, expect } from "vitest";
import {
  PieceType,
  SquareType,
  BOARD_SIZE,
  INITIAL_BOARD_CONFIG,
  type Position,
  type Piece,
  type Square,
  type Board,
  type Move,
  type GameState,
  type MoveResult,
} from "../types";

describe("Types Module", () => {
  describe("Constants", () => {
    it("should have correct PieceType values", () => {
      expect(PieceType.KNIGHT).toBe("knight");
      expect(PieceType.BISHOP).toBe("bishop");
      expect(PieceType.ROOK).toBe("rook");
      expect(PieceType.PAWN).toBe("pawn");
      expect(PieceType.QUEEN).toBe("queen");
    });

    it("should have correct SquareType values", () => {
      expect(SquareType.NORMAL).toBe("normal");
      expect(SquareType.GOAL).toBe("goal");
      expect(SquareType.MISSING).toBe("missing");
    });

    it("should have correct BOARD_SIZE", () => {
      expect(BOARD_SIZE).toBe(4);
    });

    it("should have correct INITIAL_BOARD_CONFIG dimensions", () => {
      expect(INITIAL_BOARD_CONFIG).toHaveLength(4);
      INITIAL_BOARD_CONFIG.forEach((row) => {
        expect(row).toHaveLength(4);
      });
    });

    it("should have correct INITIAL_BOARD_CONFIG layout", () => {
      // Row 0: Knights
      expect(INITIAL_BOARD_CONFIG[0]).toEqual(["knight", "knight", "knight", "knight"]);

      // Row 1: Bishops
      expect(INITIAL_BOARD_CONFIG[1]).toEqual(["bishop", "bishop", "bishop", "bishop"]);

      // Row 2: Rooks
      expect(INITIAL_BOARD_CONFIG[2]).toEqual(["rook", "rook", "rook", "rook"]);

      // Row 3: Goal, missing squares, and pawn
      expect(INITIAL_BOARD_CONFIG[3]).toEqual(["goal", "missing", "missing", "pawn"]);
    });
  });

  describe("Type Interfaces", () => {
    it("should create valid Position objects", () => {
      const position: Position = { row: 2, col: 3 };
      expect(position.row).toBe(2);
      expect(position.col).toBe(3);
    });

    it("should create valid Piece objects", () => {
      const piece: Piece = {
        type: PieceType.KNIGHT,
        position: { row: 0, col: 0 },
        id: "knight-0-0",
      };

      expect(piece.type).toBe("knight");
      expect(piece.position.row).toBe(0);
      expect(piece.position.col).toBe(0);
      expect(piece.id).toBe("knight-0-0");
    });

    it("should create valid Square objects", () => {
      const normalSquare: Square = {
        type: SquareType.NORMAL,
      };

      const squareWithPiece: Square = {
        type: SquareType.NORMAL,
        piece: {
          type: PieceType.PAWN,
          position: { row: 3, col: 3 },
          id: "pawn-3-3",
        },
      };

      expect(normalSquare.type).toBe("normal");
      expect(normalSquare.piece).toBeUndefined();

      expect(squareWithPiece.type).toBe("normal");
      expect(squareWithPiece.piece?.type).toBe("pawn");
    });

    it("should create valid Move objects", () => {
      const piece: Piece = {
        type: PieceType.KNIGHT,
        position: { row: 0, col: 0 },
        id: "knight-0-0",
      };

      const move: Move = {
        from: { row: 0, col: 0 },
        to: { row: 2, col: 1 },
        piece,
      };

      expect(move.from.row).toBe(0);
      expect(move.from.col).toBe(0);
      expect(move.to.row).toBe(2);
      expect(move.to.col).toBe(1);
      expect(move.piece.type).toBe("knight");
      expect(move.isPromotion).toBeUndefined();
    });

    it("should create valid Move objects with promotion", () => {
      const piece: Piece = {
        type: PieceType.PAWN,
        position: { row: 1, col: 0 },
        id: "pawn-3-3",
      };

      const move: Move = {
        from: { row: 1, col: 0 },
        to: { row: 0, col: 0 },
        piece,
        isPromotion: true,
      };

      expect(move.isPromotion).toBe(true);
    });

    it("should create valid GameState objects", () => {
      const board: Board = Array(4).fill(null).map(() =>
        Array(4).fill(null).map(() => ({ type: SquareType.NORMAL }))
      );

      const gameState: GameState = {
        board,
        currentTurn: "player",
        validMoves: [],
        moveHistory: [],
        isGameWon: false,
        isGameOver: false,
      };

      expect(gameState.currentTurn).toBe("player");
      expect(gameState.validMoves).toHaveLength(0);
      expect(gameState.moveHistory).toHaveLength(0);
      expect(gameState.isGameWon).toBe(false);
      expect(gameState.isGameOver).toBe(false);
      expect(gameState.selectedPiece).toBeUndefined();
    });

    it("should create valid MoveResult objects", () => {
      const validResult: MoveResult = {
        isValid: true,
        resultingBoard: Array(4).fill(null).map(() =>
          Array(4).fill(null).map(() => ({ type: SquareType.NORMAL }))
        ),
        isGameWon: false,
      };

      const invalidResult: MoveResult = {
        isValid: false,
      };

      expect(validResult.isValid).toBe(true);
      expect(validResult.resultingBoard).toBeDefined();
      expect(validResult.isGameWon).toBe(false);

      expect(invalidResult.isValid).toBe(false);
      expect(invalidResult.resultingBoard).toBeUndefined();
      expect(invalidResult.capturedPiece).toBeUndefined();
    });
  });

  describe("Type Safety", () => {
    it("should enforce PieceType constraints", () => {
      const validPieceTypes = ["knight", "bishop", "rook", "pawn", "queen"];

      validPieceTypes.forEach((pieceType) => {
        expect(Object.values(PieceType)).toContain(pieceType);
      });
    });

    it("should enforce SquareType constraints", () => {
      const validSquareTypes = ["normal", "goal", "missing"];

      validSquareTypes.forEach((squareType) => {
        expect(Object.values(SquareType)).toContain(squareType);
      });
    });

    it("should handle Board type correctly", () => {
      const board: Board = Array(4).fill(null).map(() =>
        Array(4).fill(null).map(() => ({ type: SquareType.NORMAL }))
      );

      expect(board).toHaveLength(4);
      board.forEach((row) => {
        expect(row).toHaveLength(4);
        row.forEach((square) => {
          expect(square).toHaveProperty("type");
        });
      });
    });
  });

  describe("Initial Configuration Validation", () => {
    it("should have goal square in correct position", () => {
      expect(INITIAL_BOARD_CONFIG[3][0]).toBe("goal");
    });

    it("should have missing squares in correct positions", () => {
      expect(INITIAL_BOARD_CONFIG[3][1]).toBe("missing");
      expect(INITIAL_BOARD_CONFIG[3][2]).toBe("missing");
    });

    it("should have pawn in correct position", () => {
      expect(INITIAL_BOARD_CONFIG[3][3]).toBe("pawn");
    });

    it("should have correct number of each piece type", () => {
      const pieceCount: Record<string, number> = {};

      INITIAL_BOARD_CONFIG.flat().forEach((item) => {
        if (item !== "goal" && item !== "missing") {
          pieceCount[item] = (pieceCount[item] || 0) + 1;
        }
      });

      expect(pieceCount.knight).toBe(4);
      expect(pieceCount.bishop).toBe(4);
      expect(pieceCount.rook).toBe(4);
      expect(pieceCount.pawn).toBe(1);
    });

    it("should have exactly one goal square", () => {
      const goalCount = INITIAL_BOARD_CONFIG.flat().filter(item => item === "goal").length;
      expect(goalCount).toBe(1);
    });

    it("should have exactly two missing squares", () => {
      const missingCount = INITIAL_BOARD_CONFIG.flat().filter(item => item === "missing").length;
      expect(missingCount).toBe(2);
    });
  });
});
