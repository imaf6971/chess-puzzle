export const PieceType = {
  KNIGHT: "knight",
  BISHOP: "bishop",
  ROOK: "rook",
  PAWN: "pawn",
  QUEEN: "queen",
} as const;

export type PieceType = (typeof PieceType)[keyof typeof PieceType];

export const SquareType = {
  NORMAL: "normal",
  GOAL: "goal",
  MISSING: "missing",
} as const;

export type SquareType = (typeof SquareType)[keyof typeof SquareType];

export interface Position {
  row: number;
  col: number;
}

export interface Piece {
  type: PieceType;
  position: Position;
  id: string;
}

export interface Square {
  type: SquareType;
  piece?: Piece;
}

export type Board = Square[][];

export interface Move {
  from: Position;
  to: Position;
  piece: Piece;
  isPromotion?: boolean;
}

export interface GameState {
  board: Board;
  currentTurn: "player" | "ai";
  selectedPiece?: Piece;
  validMoves: Position[];
  moveHistory: Move[];
  isGameWon: boolean;
  isGameOver: boolean;
}

export interface MoveResult {
  isValid: boolean;
  resultingBoard?: Board;
  capturedPiece?: Piece;
  isPromotion?: boolean;
  isGameWon?: boolean;
}

export const BOARD_SIZE = 4;

// Initial board configuration
export const INITIAL_BOARD_CONFIG = [
  ["knight", "knight", "knight", "knight"],
  ["bishop", "bishop", "bishop", "bishop"],
  ["rook", "rook", "rook", "rook"],
  ["goal", "missing", "missing", "pawn"],
] as const;
