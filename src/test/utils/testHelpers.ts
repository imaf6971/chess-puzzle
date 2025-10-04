import type { Board, Piece, Square, Position, GameState, Move } from "../../types";
import { PieceType, SquareType } from "../../types";

/**
 * Test helper utilities for chess puzzle tests
 */

/**
 * Create an empty board with all normal squares
 */
export const createEmptyBoard = (): Board => {
  return Array(4)
    .fill(null)
    .map(() =>
      Array(4)
        .fill(null)
        .map(() => ({ type: SquareType.NORMAL }))
    );
};

/**
 * Create a board with goal and missing squares in correct positions
 */
export const createBoardWithSpecialSquares = (): Board => {
  return Array(4)
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
        }))
    );
};

/**
 * Create a test piece with given parameters
 */
export const createTestPiece = (
  type: PieceType,
  row: number,
  col: number,
  id?: string
): Piece => ({
  type,
  position: { row, col },
  id: id || `${type}-${row}-${col}`,
});

/**
 * Place a piece on a board at given position
 */
export const placePieceOnBoard = (
  board: Board,
  piece: Piece,
  row: number,
  col: number
): Board => {
  const newBoard = structuredClone(board);
  const updatedPiece = { ...piece, position: { row, col } };
  newBoard[row][col].piece = updatedPiece;
  return newBoard;
};

/**
 * Remove a piece from board at given position
 */
export const removePieceFromBoard = (board: Board, row: number, col: number): Board => {
  const newBoard = structuredClone(board);
  newBoard[row][col].piece = undefined;
  return newBoard;
};

/**
 * Create a minimal game state for testing
 */
export const createTestGameState = (board?: Board): GameState => ({
  board: board || createEmptyBoard(),
  currentTurn: "player",
  validMoves: [],
  moveHistory: [],
  isGameWon: false,
  isGameOver: false,
});

/**
 * Create a test move
 */
export const createTestMove = (
  from: Position,
  to: Position,
  piece: Piece,
  isPromotion?: boolean
): Move => ({
  from,
  to,
  piece,
  isPromotion,
});

/**
 * Count pieces of a specific type on the board
 */
export const countPiecesOfType = (board: Board, pieceType: PieceType): number => {
  let count = 0;
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      if (board[row][col].piece?.type === pieceType) {
        count++;
      }
    }
  }
  return count;
};

/**
 * Get all pieces on the board
 */
export const getAllPiecesOnBoard = (board: Board): Piece[] => {
  const pieces: Piece[] = [];
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      const piece = board[row][col].piece;
      if (piece) {
        pieces.push(piece);
      }
    }
  }
  return pieces;
};

/**
 * Check if two positions are equal
 */
export const positionsEqual = (pos1: Position, pos2: Position): boolean => {
  return pos1.row === pos2.row && pos1.col === pos2.col;
};

/**
 * Check if a position exists in an array of positions
 */
export const positionInArray = (position: Position, positions: Position[]): boolean => {
  return positions.some((pos) => positionsEqual(pos, position));
};

/**
 * Create a board with a clear path for testing movement
 */
export const createBoardWithClearPath = (
  startPos: Position,
  endPos: Position,
  pieceType: PieceType = PieceType.PAWN
): Board => {
  const board = createBoardWithSpecialSquares();
  const piece = createTestPiece(pieceType, startPos.row, startPos.col);
  return placePieceOnBoard(board, piece, startPos.row, startPos.col);
};

/**
 * Create a board with blocking pieces for testing
 */
export const createBoardWithBlocking = (
  mainPiece: { type: PieceType; position: Position },
  blockingPieces: Array<{ type: PieceType; position: Position }>
): Board => {
  const board = createBoardWithSpecialSquares();

  // Place main piece
  const mainPieceObj = createTestPiece(
    mainPiece.type,
    mainPiece.position.row,
    mainPiece.position.col
  );
  let resultBoard = placePieceOnBoard(board, mainPieceObj, mainPiece.position.row, mainPiece.position.col);

  // Place blocking pieces
  blockingPieces.forEach((blockingPiece, index) => {
    const piece = createTestPiece(
      blockingPiece.type,
      blockingPiece.position.row,
      blockingPiece.position.col,
      `blocking-${index}`
    );
    resultBoard = placePieceOnBoard(resultBoard, piece, blockingPiece.position.row, blockingPiece.position.col);
  });

  return resultBoard;
};

/**
 * Create a near-win scenario for testing
 */
export const createNearWinBoard = (): Board => {
  const board = createBoardWithSpecialSquares();
  // Place promoted queen (originally pawn) one move from goal
  const queen = createTestPiece(PieceType.QUEEN, 3, 3, "pawn-3-3");
  return placePieceOnBoard(board, queen, 3, 3);
};

/**
 * Create a won game scenario
 */
export const createWonBoard = (): Board => {
  const board = createBoardWithSpecialSquares();
  // Place original pawn at goal
  const pawn = createTestPiece(PieceType.PAWN, 3, 0, "pawn-3-3");
  return placePieceOnBoard(board, pawn, 3, 0);
};

/**
 * Validate that a board has correct dimensions and structure
 */
export const validateBoardStructure = (board: Board): boolean => {
  if (!Array.isArray(board) || board.length !== 4) {
    return false;
  }

  for (let row = 0; row < 4; row++) {
    if (!Array.isArray(board[row]) || board[row].length !== 4) {
      return false;
    }

    for (let col = 0; col < 4; col++) {
      const square = board[row][col];
      if (!square || !square.type) {
        return false;
      }

      // Check if piece position matches square position
      if (square.piece &&
          (square.piece.position.row !== row || square.piece.position.col !== col)) {
        return false;
      }
    }
  }

  return true;
};

/**
 * Get the Manhattan distance between two positions
 */
export const manhattanDistance = (pos1: Position, pos2: Position): number => {
  return Math.abs(pos1.row - pos2.row) + Math.abs(pos1.col - pos2.col);
};

/**
 * Check if a position is within board bounds
 */
export const isWithinBounds = (position: Position): boolean => {
  return position.row >= 0 && position.row < 4 && position.col >= 0 && position.col < 4;
};

/**
 * Generate all possible positions on the board
 */
export const getAllBoardPositions = (): Position[] => {
  const positions: Position[] = [];
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      positions.push({ row, col });
    }
  }
  return positions;
};

/**
 * Create mock move sequence for testing
 */
export const createMockMoveSequence = (length: number): Move[] => {
  const moves: Move[] = [];
  for (let i = 0; i < length; i++) {
    const piece = createTestPiece(PieceType.KNIGHT, 0, 0, `test-piece-${i}`);
    moves.push({
      from: { row: 0, col: 0 },
      to: { row: 1, col: 2 },
      piece,
    });
  }
  return moves;
};

/**
 * Deep clone a board to avoid mutation in tests
 */
export const cloneBoard = (board: Board): Board => {
  return structuredClone(board);
};

/**
 * Compare two boards for equality
 */
export const boardsEqual = (board1: Board, board2: Board): boolean => {
  if (!validateBoardStructure(board1) || !validateBoardStructure(board2)) {
    return false;
  }

  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      const square1 = board1[row][col];
      const square2 = board2[row][col];

      if (square1.type !== square2.type) {
        return false;
      }

      // Compare pieces
      if (square1.piece && square2.piece) {
        if (
          square1.piece.type !== square2.piece.type ||
          square1.piece.id !== square2.piece.id ||
          !positionsEqual(square1.piece.position, square2.piece.position)
        ) {
          return false;
        }
      } else if (square1.piece || square2.piece) {
        return false; // One has piece, other doesn't
      }
    }
  }

  return true;
};

/**
 * Create a performance test wrapper
 */
export const measurePerformance = async <T>(
  testFn: () => Promise<T> | T,
  maxTimeMs: number = 1000
): Promise<{ result: T; timeElapsed: number; withinLimit: boolean }> => {
  const startTime = Date.now();
  const result = await testFn();
  const endTime = Date.now();
  const timeElapsed = endTime - startTime;

  return {
    result,
    timeElapsed,
    withinLimit: timeElapsed <= maxTimeMs,
  };
};

/**
 * Mock implementation helpers
 */
export const createMockGameLogicFunctions = () => ({
  initializeBoard: () => createBoardWithSpecialSquares(),
  initializeGameState: () => createTestGameState(),
  getValidMoves: () => [],
  makeMove: () => ({ isValid: true, resultingBoard: createEmptyBoard() }),
  getPawnPiece: () => createTestPiece(PieceType.PAWN, 3, 3),
  getAllPlayerPieces: () => [createTestPiece(PieceType.PAWN, 3, 3)],
});

/**
 * Assertion helpers for common test patterns
 */
export const assertValidPosition = (position: Position): void => {
  if (!isWithinBounds(position)) {
    throw new Error(`Position (${position.row}, ${position.col}) is out of bounds`);
  }
};

export const assertValidMove = (move: Move): void => {
  assertValidPosition(move.from);
  assertValidPosition(move.to);

  if (!move.piece) {
    throw new Error("Move must have a piece");
  }

  if (!positionsEqual(move.piece.position, move.from)) {
    throw new Error("Move piece position must match from position");
  }
};

export const assertValidBoard = (board: Board): void => {
  if (!validateBoardStructure(board)) {
    throw new Error("Invalid board structure");
  }
};

/**
 * Test data generators
 */
export const generateRandomPosition = (): Position => ({
  row: Math.floor(Math.random() * 4),
  col: Math.floor(Math.random() * 4),
});

export const generateValidMoves = (count: number): Position[] => {
  const moves: Position[] = [];
  const allPositions = getAllBoardPositions();

  for (let i = 0; i < Math.min(count, allPositions.length); i++) {
    const randomIndex = Math.floor(Math.random() * allPositions.length);
    moves.push(allPositions[randomIndex]);
  }

  return moves;
};

/**
 * Test scenario builders
 */
export const buildPawnPromotionScenario = (): {
  board: Board;
  pawn: Piece;
  promotionMove: Move;
} => {
  const board = createBoardWithSpecialSquares();
  const pawn = createTestPiece(PieceType.PAWN, 1, 0, "pawn-3-3");
  const boardWithPawn = placePieceOnBoard(board, pawn, 1, 0);

  const promotionMove: Move = {
    from: { row: 1, col: 0 },
    to: { row: 0, col: 0 },
    piece: pawn,
    isPromotion: true,
  };

  return {
    board: boardWithPawn,
    pawn,
    promotionMove,
  };
};

export const buildWinningScenario = (): {
  board: Board;
  queen: Piece;
  winningMove: Move;
} => {
  const board = createBoardWithSpecialSquares();
  const queen = createTestPiece(PieceType.QUEEN, 2, 0, "pawn-3-3"); // Promoted pawn
  const boardWithQueen = placePieceOnBoard(board, queen, 2, 0);

  const winningMove: Move = {
    from: { row: 2, col: 0 },
    to: { row: 3, col: 0 }, // Goal square
    piece: queen,
  };

  return {
    board: boardWithQueen,
    queen,
    winningMove,
  };
};

/**
 * Debug helpers for tests
 */
export const printBoard = (board: Board): string => {
  let result = "\n";
  for (let row = 0; row < 4; row++) {
    let rowStr = "";
    for (let col = 0; col < 4; col++) {
      const square = board[row][col];
      let cell = "  ";

      if (square.type === SquareType.GOAL) {
        cell = "G ";
      } else if (square.type === SquareType.MISSING) {
        cell = "X ";
      } else if (square.piece) {
        switch (square.piece.type) {
          case PieceType.PAWN:
            cell = "P ";
            break;
          case PieceType.KNIGHT:
            cell = "N ";
            break;
          case PieceType.BISHOP:
            cell = "B ";
            break;
          case PieceType.ROOK:
            cell = "R ";
            break;
          case PieceType.QUEEN:
            cell = "Q ";
            break;
          default:
            cell = "? ";
        }
      } else {
        cell = ". ";
      }

      rowStr += cell;
    }
    result += rowStr + "\n";
  }
  return result;
};

export const printMove = (move: Move): string => {
  return `${move.piece.type} from (${move.from.row},${move.from.col}) to (${move.to.row},${move.to.col})${move.isPromotion ? " (promotion)" : ""}`;
};

export const printMoveSequence = (moves: Move[]): string => {
  return moves.map((move, index) => `${index + 1}. ${printMove(move)}`).join("\n");
};
