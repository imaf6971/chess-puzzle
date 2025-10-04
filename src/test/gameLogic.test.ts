import { describe, it, expect, beforeEach } from "vitest";
import {
  initializeBoard,
  isValidPosition,
  getKnightMoves,
  getBishopMoves,
  getRookMoves,
  getPawnMoves,
  getQueenMoves,
  getValidMoves,
  isOriginalPawn,
  shouldPromotePawn,
  makeMove,
  getPawnPiece,
  getAllPlayerPieces,
  isPlayerPiece,
  initializeGameState,
  analyzeBoardState,
  canPawnReachGoal,
} from "../gameLogic";
import {
  PieceType,
  SquareType,
  type Board,
  type Piece,
  type Position,
  type Move,
  type GameState,
} from "../types";

describe("Game Logic Module", () => {
  let board: Board;

  beforeEach(() => {
    board = initializeBoard();
  });

  describe("initializeBoard", () => {
    it("should create a 4x4 board", () => {
      expect(board).toHaveLength(4);
      board.forEach((row) => {
        expect(row).toHaveLength(4);
      });
    });

    it("should place knights in the first row", () => {
      for (let col = 0; col < 4; col++) {
        const square = board[0][col];
        expect(square.piece?.type).toBe(PieceType.KNIGHT);
        expect(square.piece?.position).toEqual({ row: 0, col });
        expect(square.piece?.id).toBe(`knight-0-${col}`);
      }
    });

    it("should place bishops in the second row", () => {
      for (let col = 0; col < 4; col++) {
        const square = board[1][col];
        expect(square.piece?.type).toBe(PieceType.BISHOP);
        expect(square.piece?.position).toEqual({ row: 1, col });
        expect(square.piece?.id).toBe(`bishop-1-${col}`);
      }
    });

    it("should place rooks in the third row", () => {
      for (let col = 0; col < 4; col++) {
        const square = board[2][col];
        expect(square.piece?.type).toBe(PieceType.ROOK);
        expect(square.piece?.position).toEqual({ row: 2, col });
        expect(square.piece?.id).toBe(`rook-2-${col}`);
      }
    });

    it("should place goal square, missing squares, and pawn in the fourth row", () => {
      expect(board[3][0].type).toBe(SquareType.GOAL);
      expect(board[3][0].piece).toBeUndefined();

      expect(board[3][1].type).toBe(SquareType.MISSING);
      expect(board[3][1].piece).toBeUndefined();

      expect(board[3][2].type).toBe(SquareType.MISSING);
      expect(board[3][2].piece).toBeUndefined();

      expect(board[3][3].type).toBe(SquareType.NORMAL);
      expect(board[3][3].piece?.type).toBe(PieceType.PAWN);
      expect(board[3][3].piece?.position).toEqual({ row: 3, col: 3 });
      expect(board[3][3].piece?.id).toBe("pawn-3-3");
    });

    it("should have all other squares as normal type", () => {
      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 4; col++) {
          expect(board[row][col].type).toBe(SquareType.NORMAL);
        }
      }
      expect(board[3][3].type).toBe(SquareType.NORMAL);
    });
  });

  describe("isValidPosition", () => {
    it("should return true for valid positions on normal squares", () => {
      expect(isValidPosition({ row: 0, col: 0 }, board)).toBe(true);
      expect(isValidPosition({ row: 3, col: 3 }, board)).toBe(true);
      expect(isValidPosition({ row: 2, col: 1 }, board)).toBe(true);
    });

    it("should return true for goal square", () => {
      expect(isValidPosition({ row: 3, col: 0 }, board)).toBe(true);
    });

    it("should return false for missing squares", () => {
      expect(isValidPosition({ row: 3, col: 1 }, board)).toBe(false);
      expect(isValidPosition({ row: 3, col: 2 }, board)).toBe(false);
    });

    it("should return false for out-of-bounds positions", () => {
      expect(isValidPosition({ row: -1, col: 0 }, board)).toBe(false);
      expect(isValidPosition({ row: 0, col: -1 }, board)).toBe(false);
      expect(isValidPosition({ row: 4, col: 0 }, board)).toBe(false);
      expect(isValidPosition({ row: 0, col: 4 }, board)).toBe(false);
    });
  });

  describe("getKnightMoves", () => {
    it("should return all valid knight moves from center position", () => {
      // Create empty board for testing
      const emptyBoard: Board = Array(4)
        .fill(null)
        .map(() =>
          Array(4)
            .fill(null)
            .map(() => ({ type: SquareType.NORMAL })),
        );

      const knightPosition = { row: 2, col: 2 };
      const moves = getKnightMoves(knightPosition, emptyBoard);

      const expectedMoves = [
        { row: 0, col: 3 }, // up 2, right 1
        { row: 0, col: 1 }, // up 2, left 1
        { row: 3, col: 0 }, // down 1, right 2
        { row: 1, col: 0 }, // up 1, right 2
      ];

      expect(moves).toHaveLength(4);
      expectedMoves.forEach((expectedMove) => {
        expect(moves).toContainEqual(expectedMove);
      });
    });

    it("should exclude moves to occupied squares", () => {
      const position = { row: 0, col: 0 };
      const moves = getKnightMoves(position, board);

      // From (0,0), knight can move to (2,1) but it's occupied by a rook
      // Should only have moves to empty squares
      moves.forEach((move) => {
        expect(board[move.row][move.col].piece).toBeUndefined();
      });
    });

    it("should exclude moves to missing squares", () => {
      // Create a board with knight near missing squares
      const testBoard: Board = Array(4)
        .fill(null)
        .map(() =>
          Array(4)
            .fill(null)
            .map(() => ({ type: SquareType.NORMAL })),
        );
      testBoard[3][1].type = SquareType.MISSING;
      testBoard[3][2].type = SquareType.MISSING;

      const position = { row: 1, col: 3 };
      const moves = getKnightMoves(position, testBoard);

      // Should not include moves to missing squares
      expect(moves).not.toContainEqual({ row: 3, col: 2 });
    });

    it("should handle edge cases", () => {
      const cornerPosition = { row: 0, col: 0 };
      const moves = getKnightMoves(cornerPosition, board);

      // From corner, knight has limited moves
      expect(moves.length).toBeLessThanOrEqual(2);
    });
  });

  describe("getBishopMoves", () => {
    it("should return diagonal moves in all four directions", () => {
      // Create empty board for testing
      const emptyBoard: Board = Array(4)
        .fill(null)
        .map(() =>
          Array(4)
            .fill(null)
            .map(() => ({ type: SquareType.NORMAL })),
        );

      const bishopPosition = { row: 1, col: 1 };
      const moves = getBishopMoves(bishopPosition, emptyBoard);

      const expectedMoves = [
        { row: 2, col: 2 },
        { row: 3, col: 3 }, // down-right
        { row: 2, col: 0 },
        { row: 3, col: -1 }, // down-left (only first valid)
        { row: 0, col: 2 },
        { row: -1, col: 3 }, // up-right (only first valid)
        { row: 0, col: 0 }, // up-left
      ];

      // Filter out invalid positions
      const validExpectedMoves = expectedMoves.filter(
        (move) =>
          move.row >= 0 && move.row < 4 && move.col >= 0 && move.col < 4,
      );

      expect(moves).toHaveLength(validExpectedMoves.length);
      validExpectedMoves.forEach((expectedMove) => {
        expect(moves).toContainEqual(expectedMove);
      });
    });

    it("should stop at first piece in each direction", () => {
      const position = { row: 1, col: 1 };
      const moves = getBishopMoves(position, board);

      // Should be blocked by pieces in initial board
      // The bishop at (1,1) should have limited moves due to other pieces
      moves.forEach((move) => {
        expect(board[move.row][move.col].piece).toBeUndefined();
      });
    });

    it("should exclude moves to missing squares", () => {
      const testBoard: Board = Array(4)
        .fill(null)
        .map(() =>
          Array(4)
            .fill(null)
            .map(() => ({ type: SquareType.NORMAL })),
        );
      testBoard[3][1].type = SquareType.MISSING;
      testBoard[3][2].type = SquareType.MISSING;

      const position = { row: 2, col: 0 };
      const moves = getBishopMoves(position, testBoard);

      // Should not include moves to missing squares
      expect(moves).not.toContainEqual({ row: 3, col: 1 });
    });
  });

  describe("getRookMoves", () => {
    it("should return horizontal and vertical moves", () => {
      // Create empty board for testing
      const emptyBoard: Board = Array(4)
        .fill(null)
        .map(() =>
          Array(4)
            .fill(null)
            .map(() => ({ type: SquareType.NORMAL })),
        );

      const rookPosition = { row: 1, col: 1 };
      const moves = getRookMoves(rookPosition, emptyBoard);

      const expectedMoves = [
        { row: 2, col: 1 },
        { row: 3, col: 1 }, // down
        { row: 0, col: 1 }, // up
        { row: 1, col: 2 },
        { row: 1, col: 3 }, // right
        { row: 1, col: 0 }, // left
      ];

      expect(moves).toHaveLength(expectedMoves.length);
      expectedMoves.forEach((expectedMove) => {
        expect(moves).toContainEqual(expectedMove);
      });
    });

    it("should stop at first piece in each direction", () => {
      const position = { row: 2, col: 2 };
      const moves = getRookMoves(position, board);

      // Should be blocked by pieces in initial board
      moves.forEach((move) => {
        expect(board[move.row][move.col].piece).toBeUndefined();
      });
    });

    it("should exclude moves to missing squares", () => {
      const testBoard: Board = Array(4)
        .fill(null)
        .map(() =>
          Array(4)
            .fill(null)
            .map(() => ({ type: SquareType.NORMAL })),
        );
      testBoard[3][1].type = SquareType.MISSING;

      const position = { row: 3, col: 0 };
      const moves = getRookMoves(position, testBoard);

      // Should not include moves to missing squares
      expect(moves).not.toContainEqual({ row: 3, col: 1 });
    });
  });

  describe("getPawnMoves", () => {
    it("should return one square forward if empty", () => {
      // Create empty board with pawn
      const emptyBoard: Board = Array(4)
        .fill(null)
        .map(() =>
          Array(4)
            .fill(null)
            .map(() => ({ type: SquareType.NORMAL })),
        );

      const pawnPosition = { row: 2, col: 0 };
      const moves = getPawnMoves(pawnPosition, emptyBoard);

      expect(moves).toHaveLength(1);
      expect(moves[0]).toEqual({ row: 1, col: 0 });
    });

    it("should return empty array if forward square is occupied", () => {
      const pawnPosition = { row: 3, col: 3 };
      const moves = getPawnMoves(pawnPosition, board);

      // Forward square (2,3) is occupied by a rook
      expect(moves).toHaveLength(0);
    });

    it("should return empty array if pawn is at top row", () => {
      const emptyBoard: Board = Array(4)
        .fill(null)
        .map(() =>
          Array(4)
            .fill(null)
            .map(() => ({ type: SquareType.NORMAL })),
        );

      const pawnPosition = { row: 0, col: 0 };
      const moves = getPawnMoves(pawnPosition, emptyBoard);

      expect(moves).toHaveLength(0);
    });

    it("should exclude moves to missing squares", () => {
      const testBoard: Board = Array(4)
        .fill(null)
        .map(() =>
          Array(4)
            .fill(null)
            .map(() => ({ type: SquareType.NORMAL })),
        );
      testBoard[2][1].type = SquareType.MISSING;

      const pawnPosition = { row: 3, col: 1 };
      const moves = getPawnMoves(pawnPosition, testBoard);

      expect(moves).toHaveLength(0);
    });
  });

  describe("getQueenMoves", () => {
    it("should return combination of rook and bishop moves", () => {
      const emptyBoard: Board = Array(4)
        .fill(null)
        .map(() =>
          Array(4)
            .fill(null)
            .map(() => ({ type: SquareType.NORMAL })),
        );

      const queenPosition = { row: 1, col: 1 };
      const queenMoves = getQueenMoves(queenPosition, emptyBoard);
      const rookMoves = getRookMoves(queenPosition, emptyBoard);
      const bishopMoves = getBishopMoves(queenPosition, emptyBoard);

      expect(queenMoves).toHaveLength(rookMoves.length + bishopMoves.length);

      rookMoves.forEach((move) => {
        expect(queenMoves).toContainEqual(move);
      });

      bishopMoves.forEach((move) => {
        expect(queenMoves).toContainEqual(move);
      });
    });
  });

  describe("getValidMoves", () => {
    it("should return knight moves for knight piece", () => {
      const knight: Piece = {
        type: PieceType.KNIGHT,
        position: { row: 0, col: 0 },
        id: "knight-0-0",
      };

      const moves = getValidMoves(knight, board);
      const expectedMoves = getKnightMoves(knight.position, board);

      expect(moves).toEqual(expectedMoves);
    });

    it("should return bishop moves for bishop piece", () => {
      const bishop: Piece = {
        type: PieceType.BISHOP,
        position: { row: 1, col: 0 },
        id: "bishop-1-0",
      };

      const moves = getValidMoves(bishop, board);
      const expectedMoves = getBishopMoves(bishop.position, board);

      expect(moves).toEqual(expectedMoves);
    });

    it("should return rook moves for rook piece", () => {
      const rook: Piece = {
        type: PieceType.ROOK,
        position: { row: 2, col: 0 },
        id: "rook-2-0",
      };

      const moves = getValidMoves(rook, board);
      const expectedMoves = getRookMoves(rook.position, board);

      expect(moves).toEqual(expectedMoves);
    });

    it("should return pawn moves for pawn piece", () => {
      const pawn: Piece = {
        type: PieceType.PAWN,
        position: { row: 3, col: 3 },
        id: "pawn-3-3",
      };

      const moves = getValidMoves(pawn, board);
      const expectedMoves = getPawnMoves(pawn.position, board);

      expect(moves).toEqual(expectedMoves);
    });

    it("should return queen moves for queen piece", () => {
      const queen: Piece = {
        type: PieceType.QUEEN,
        position: { row: 1, col: 1 },
        id: "queen-1-1",
      };

      const emptyBoard: Board = Array(4)
        .fill(null)
        .map(() =>
          Array(4)
            .fill(null)
            .map(() => ({ type: SquareType.NORMAL })),
        );

      const moves = getValidMoves(queen, emptyBoard);
      const expectedMoves = getQueenMoves(queen.position, emptyBoard);

      expect(moves).toEqual(expectedMoves);
    });

    it("should return empty array for unknown piece type", () => {
      const unknownPiece: any = {
        type: "unknown",
        position: { row: 0, col: 0 },
        id: "unknown-0-0",
      };

      const moves = getValidMoves(unknownPiece, board);
      expect(moves).toEqual([]);
    });
  });

  describe("isOriginalPawn", () => {
    it("should return true for original pawn", () => {
      const pawn: Piece = {
        type: PieceType.PAWN,
        position: { row: 3, col: 3 },
        id: "pawn-3-3",
      };

      expect(isOriginalPawn(pawn)).toBe(true);
    });

    it("should return true for promoted queen from original pawn", () => {
      const promotedQueen: Piece = {
        type: PieceType.QUEEN,
        position: { row: 0, col: 3 },
        id: "pawn-3-3", // ID still contains "pawn"
      };

      expect(isOriginalPawn(promotedQueen)).toBe(true);
    });

    it("should return false for other pieces", () => {
      const knight: Piece = {
        type: PieceType.KNIGHT,
        position: { row: 0, col: 0 },
        id: "knight-0-0",
      };

      expect(isOriginalPawn(knight)).toBe(false);
    });

    it("should return false for regular queen", () => {
      const queen: Piece = {
        type: PieceType.QUEEN,
        position: { row: 1, col: 1 },
        id: "queen-1-1",
      };

      expect(isOriginalPawn(queen)).toBe(false);
    });
  });

  describe("shouldPromotePawn", () => {
    it("should return true when pawn reaches top row", () => {
      const pawn: Piece = {
        type: PieceType.PAWN,
        position: { row: 1, col: 0 },
        id: "pawn-3-3",
      };

      const topRowPosition = { row: 0, col: 0 };
      expect(shouldPromotePawn(pawn, topRowPosition)).toBe(true);
    });

    it("should return false when pawn doesn't reach top row", () => {
      const pawn: Piece = {
        type: PieceType.PAWN,
        position: { row: 2, col: 0 },
        id: "pawn-3-3",
      };

      const middlePosition = { row: 1, col: 0 };
      expect(shouldPromotePawn(pawn, middlePosition)).toBe(false);
    });

    it("should return false for non-pawn pieces", () => {
      const knight: Piece = {
        type: PieceType.KNIGHT,
        position: { row: 1, col: 0 },
        id: "knight-0-0",
      };

      const topRowPosition = { row: 0, col: 0 };
      expect(shouldPromotePawn(knight, topRowPosition)).toBe(false);
    });
  });

  describe("makeMove", () => {
    it("should return invalid result for illegal moves", () => {
      const knight = board[0][0].piece!;
      const illegalMove: Move = {
        from: knight.position,
        to: { row: 0, col: 1 }, // Knight can't move one square horizontally
        piece: knight,
      };

      const result = makeMove(board, illegalMove);
      expect(result.isValid).toBe(false);
    });

    it("should successfully make valid moves", () => {
      // Clear a path for the knight to move
      const emptyBoard: Board = Array(4)
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

      // Place a knight
      const knight: Piece = {
        type: PieceType.KNIGHT,
        position: { row: 0, col: 0 },
        id: "knight-0-0",
      };
      emptyBoard[0][0].piece = knight;

      const validMove: Move = {
        from: { row: 0, col: 0 },
        to: { row: 2, col: 1 },
        piece: knight,
      };

      const result = makeMove(emptyBoard, validMove);

      expect(result.isValid).toBe(true);
      expect(result.resultingBoard).toBeDefined();
      expect(result.resultingBoard![0][0].piece).toBeUndefined();
      expect(result.resultingBoard![2][1].piece?.type).toBe(PieceType.KNIGHT);
      expect(result.resultingBoard![2][1].piece?.position).toEqual({
        row: 2,
        col: 1,
      });
    });

    it("should handle pawn promotion", () => {
      // Create board with pawn near promotion
      const testBoard: Board = Array(4)
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

      const pawn: Piece = {
        type: PieceType.PAWN,
        position: { row: 1, col: 0 },
        id: "pawn-3-3",
      };
      testBoard[1][0].piece = pawn;

      const promotionMove: Move = {
        from: { row: 1, col: 0 },
        to: { row: 0, col: 0 },
        piece: pawn,
      };

      const result = makeMove(testBoard, promotionMove);

      expect(result.isValid).toBe(true);
      expect(result.isPromotion).toBe(true);
      expect(result.resultingBoard![0][0].piece?.type).toBe(PieceType.QUEEN);
      expect(result.resultingBoard![0][0].piece?.id).toBe("pawn-3-3");
    });

    it("should detect win condition", () => {
      // Create board with promoted queen near goal
      const testBoard: Board = Array(4)
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

      const promotedQueen: Piece = {
        type: PieceType.QUEEN,
        position: { row: 2, col: 0 },
        id: "pawn-3-3", // Original pawn ID
      };
      testBoard[2][0].piece = promotedQueen;

      const winningMove: Move = {
        from: { row: 2, col: 0 },
        to: { row: 3, col: 0 },
        piece: promotedQueen,
      };

      const result = makeMove(testBoard, winningMove);

      expect(result.isValid).toBe(true);
      expect(result.isGameWon).toBe(true);
    });

    it("should not allow win with non-original pieces", () => {
      const testBoard: Board = Array(4)
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

      const regularQueen: Piece = {
        type: PieceType.QUEEN,
        position: { row: 2, col: 0 },
        id: "queen-2-0", // Not original pawn
      };
      testBoard[2][0].piece = regularQueen;

      const move: Move = {
        from: { row: 2, col: 0 },
        to: { row: 3, col: 0 },
        piece: regularQueen,
      };

      const result = makeMove(testBoard, move);

      expect(result.isValid).toBe(true);
      expect(result.isGameWon).toBe(false);
    });
  });

  describe("getPawnPiece", () => {
    it("should find the original pawn on initial board", () => {
      const pawn = getPawnPiece(board);

      expect(pawn).toBeDefined();
      expect(pawn?.type).toBe(PieceType.PAWN);
      expect(pawn?.position).toEqual({ row: 3, col: 3 });
      expect(pawn?.id).toBe("pawn-3-3");
    });

    it("should find promoted queen with original pawn ID", () => {
      const testBoard = structuredClone(board);
      // Promote the pawn
      const promotedQueen: Piece = {
        type: PieceType.QUEEN,
        position: { row: 0, col: 3 },
        id: "pawn-3-3",
      };
      testBoard[3][3].piece = undefined;
      testBoard[0][3].piece = promotedQueen;

      const pawn = getPawnPiece(testBoard);

      expect(pawn).toBeDefined();
      expect(pawn?.type).toBe(PieceType.QUEEN);
      expect(pawn?.id).toBe("pawn-3-3");
    });

    it("should return null when no original pawn exists", () => {
      const emptyBoard: Board = Array(4)
        .fill(null)
        .map(() =>
          Array(4)
            .fill(null)
            .map(() => ({ type: SquareType.NORMAL })),
        );

      const pawn = getPawnPiece(emptyBoard);
      expect(pawn).toBeNull();
    });
  });

  describe("getAllPlayerPieces", () => {
    it("should return all pieces on initial board", () => {
      const pieces = getAllPlayerPieces(board);

      // 4 knights + 4 bishops + 4 rooks + 1 pawn = 13 pieces
      expect(pieces).toHaveLength(13);

      const pieceCount: Record<string, number> = {};
      pieces.forEach((piece) => {
        pieceCount[piece.type] = (pieceCount[piece.type] || 0) + 1;
      });

      expect(pieceCount.knight).toBe(4);
      expect(pieceCount.bishop).toBe(4);
      expect(pieceCount.rook).toBe(4);
      expect(pieceCount.pawn).toBe(1);
    });

    it("should return empty array for empty board", () => {
      const emptyBoard: Board = Array(4)
        .fill(null)
        .map(() =>
          Array(4)
            .fill(null)
            .map(() => ({ type: SquareType.NORMAL })),
        );

      const pieces = getAllPlayerPieces(emptyBoard);
      expect(pieces).toHaveLength(0);
    });
  });

  describe("isPlayerPiece", () => {
    it("should always return true (all pieces belong to player)", () => {
      expect(isPlayerPiece()).toBe(true);
    });
  });

  describe("initializeGameState", () => {
    it("should create valid initial game state", () => {
      const gameState = initializeGameState();

      expect(gameState.board).toEqual(initializeBoard());
      expect(gameState.currentTurn).toBe("player");
      expect(gameState.validMoves).toEqual([]);
      expect(gameState.moveHistory).toEqual([]);
      expect(gameState.isGameWon).toBe(false);
      expect(gameState.isGameOver).toBe(false);
      expect(gameState.selectedPiece).toBeUndefined();
    });
  });

  describe("analyzeBoardState", () => {
    it("should analyze initial board state correctly", () => {
      const analysis = analyzeBoardState(board);

      expect(analysis.playerPiece).toBeDefined();
      expect(analysis.playerPiece?.type).toBe(PieceType.PAWN);
      expect(analysis.pathToGoal).toBeDefined();
      expect(analysis.blockingPieces.length).toBeGreaterThan(0);
    });

    it("should handle board without pawn", () => {
      const emptyBoard: Board = Array(4)
        .fill(null)
        .map(() =>
          Array(4)
            .fill(null)
            .map(() => ({ type: SquareType.NORMAL })),
        );

      const analysis = analyzeBoardState(emptyBoard);

      expect(analysis.playerPiece).toBeNull();
      expect(analysis.pathToGoal).toEqual([]);
      expect(analysis.blockingPieces).toEqual([]);
    });

    it("should identify blocking pieces in path", () => {
      const analysis = analyzeBoardState(board);

      // Should identify pieces blocking the pawn's path to promotion and goal
      expect(analysis.blockingPieces.length).toBeGreaterThan(0);

      // The rook at (2,3) should be blocking the pawn's upward path
      const blockingRook = analysis.blockingPieces.find(
        (piece) => piece.position.row === 2 && piece.position.col === 3,
      );
      expect(blockingRook).toBeDefined();
    });
  });

  describe("canPawnReachGoal", () => {
    it("should return false for initial board (blocked path)", () => {
      const canReach = canPawnReachGoal(board);
      expect(canReach).toBe(false);
    });

    it("should return true when pawn has clear path", () => {
      // Create board with clear path for pawn
      const testBoard: Board = Array(4)
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

      // Place pawn with clear path
      const pawn: Piece = {
        type: PieceType.PAWN,
        position: { row: 3, col: 3 },
        id: "pawn-3-3",
      };
      testBoard[3][3].piece = pawn;

      const canReach = canPawnReachGoal(testBoard);
      expect(canReach).toBe(true);
    });

    it("should return false when no pawn exists", () => {
      const emptyBoard: Board = Array(4)
        .fill(null)
        .map(() =>
          Array(4)
            .fill(null)
            .map(() => ({ type: SquareType.NORMAL })),
        );

      const canReach = canPawnReachGoal(emptyBoard);
      expect(canReach).toBe(false);
    });

    it("should return false when path is blocked", () => {
      // Create board with blocking piece
      const testBoard: Board = Array(4)
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

      // Place pawn
      const pawn: Piece = {
        type: PieceType.PAWN,
        position: { row: 3, col: 3 },
        id: "pawn-3-3",
      };
      testBoard[3][3].piece = pawn;

      // Place blocking piece in path
      const blockingPiece: Piece = {
        type: PieceType.ROOK,
        position: { row: 2, col: 3 },
        id: "rook-2-3",
      };
      testBoard[2][3].piece = blockingPiece;

      const canReach = canPawnReachGoal(testBoard);
      expect(canReach).toBe(false);
    });

    it("should handle promoted queen path checking", () => {
      // Create board with promoted queen
      const testBoard: Board = Array(4)
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

      // Place promoted queen (originally pawn) at different column
      const promotedQueen: Piece = {
        type: PieceType.QUEEN,
        position: { row: 3, col: 2 }, // Different column than goal
        id: "pawn-3-3",
      };
      testBoard[3][2].piece = promotedQueen;

      const canReach = canPawnReachGoal(testBoard);
      expect(canReach).toBe(true); // Queen should be able to reach goal
    });
  });

  describe("Integration Tests", () => {
    it("should handle a complete game sequence", () => {
      let gameState = initializeGameState();
      expect(gameState.isGameWon).toBe(false);

      // Simulate clearing pieces and moving pawn
      // This is more of an integration test concept
      const initialPiecesCount = getAllPlayerPieces(gameState.board).length;
      expect(initialPiecesCount).toBe(13);

      // Test that game state maintains consistency
      expect(gameState.board).toHaveLength(4);
      expect(gameState.currentTurn).toBe("player");
      expect(gameState.moveHistory).toHaveLength(0);
    });

    it("should maintain board integrity after moves", () => {
      // Create a simple scenario
      const testBoard: Board = Array(4)
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

      const knight: Piece = {
        type: PieceType.KNIGHT,
        position: { row: 0, col: 0 },
        id: "knight-0-0",
      };
      testBoard[0][0].piece = knight;

      const move: Move = {
        from: { row: 0, col: 0 },
        to: { row: 2, col: 1 },
        piece: knight,
      };

      const result = makeMove(testBoard, move);

      expect(result.isValid).toBe(true);
      expect(result.resultingBoard).toBeDefined();

      // Verify board integrity
      const newBoard = result.resultingBoard!;
      expect(newBoard).toHaveLength(4);
      newBoard.forEach((row) => expect(row).toHaveLength(4));

      // Verify piece moved correctly
      expect(newBoard[0][0].piece).toBeUndefined();
      expect(newBoard[2][1].piece?.type).toBe(PieceType.KNIGHT);
      expect(newBoard[2][1].piece?.position).toEqual({ row: 2, col: 1 });

      // Verify special squares are preserved
      expect(newBoard[3][0].type).toBe(SquareType.GOAL);
      expect(newBoard[3][1].type).toBe(SquareType.MISSING);
      expect(newBoard[3][2].type).toBe(SquareType.MISSING);
    });

    it("should handle edge cases gracefully", () => {
      // Test with null/undefined inputs where applicable
      const emptyBoard: Board = Array(4)
        .fill(null)
        .map(() =>
          Array(4)
            .fill(null)
            .map(() => ({ type: SquareType.NORMAL })),
        );

      expect(() => getAllPlayerPieces(emptyBoard)).not.toThrow();
      expect(() => getPawnPiece(emptyBoard)).not.toThrow();
      expect(() => analyzeBoardState(emptyBoard)).not.toThrow();
      expect(() => canPawnReachGoal(emptyBoard)).not.toThrow();
    });
  });
});
