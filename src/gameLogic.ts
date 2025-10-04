import type {
  Board,
  Square,
  Piece,
  Position,
  Move,
  GameState,
  MoveResult,
} from "./types";
import {
  PieceType,
  SquareType,
  BOARD_SIZE,
  INITIAL_BOARD_CONFIG,
} from "./types";

// Initialize the game board
export const initializeBoard = (): Board => {
  const board: Board = [];

  for (let row = 0; row < BOARD_SIZE; row++) {
    board[row] = [];
    for (let col = 0; col < BOARD_SIZE; col++) {
      const config = INITIAL_BOARD_CONFIG[row][col];

      const square: Square = {
        type: SquareType.NORMAL,
      };

      if (config === "goal") {
        square.type = SquareType.GOAL;
      } else if (config === "missing") {
        square.type = SquareType.MISSING;
      } else {
        // It's a piece
        const piece: Piece = {
          type: config as PieceType,
          position: { row, col },
          id: `${config}-${row}-${col}`,
        };
        square.piece = piece;
      }

      board[row][col] = square;
    }
  }

  return board;
};

// Check if a position is within board bounds and not a missing square
export const isValidPosition = (position: Position, board: Board): boolean => {
  const { row, col } = position;

  if (row < 0 || row >= BOARD_SIZE || col < 0 || col >= BOARD_SIZE) {
    return false;
  }

  return board[row][col].type !== SquareType.MISSING;
};

// Get all valid moves for a knight
export const getKnightMoves = (
  position: Position,
  board: Board,
): Position[] => {
  const { row, col } = position;
  const knightMoves = [
    { row: row + 2, col: col + 1 },
    { row: row + 2, col: col - 1 },
    { row: row - 2, col: col + 1 },
    { row: row - 2, col: col - 1 },
    { row: row + 1, col: col + 2 },
    { row: row + 1, col: col - 2 },
    { row: row - 1, col: col + 2 },
    { row: row - 1, col: col - 2 },
  ];

  return knightMoves.filter(
    (pos) => isValidPosition(pos, board) && !board[pos.row][pos.col].piece,
  );
};

// Get all valid moves for a bishop
export const getBishopMoves = (
  position: Position,
  board: Board,
): Position[] => {
  const moves: Position[] = [];
  const { row, col } = position;

  const directions = [
    { row: 1, col: 1 }, // down-right
    { row: 1, col: -1 }, // down-left
    { row: -1, col: 1 }, // up-right
    { row: -1, col: -1 }, // up-left
  ];

  for (const dir of directions) {
    for (let i = 1; i < BOARD_SIZE; i++) {
      const newPos = { row: row + dir.row * i, col: col + dir.col * i };

      if (!isValidPosition(newPos, board)) break;

      const targetSquare = board[newPos.row][newPos.col];
      if (targetSquare.piece) break; // Blocked by piece

      moves.push(newPos);
    }
  }

  return moves;
};

// Get all valid moves for a rook
export const getRookMoves = (position: Position, board: Board): Position[] => {
  const moves: Position[] = [];
  const { row, col } = position;

  const directions = [
    { row: 1, col: 0 }, // down
    { row: -1, col: 0 }, // up
    { row: 0, col: 1 }, // right
    { row: 0, col: -1 }, // left
  ];

  for (const dir of directions) {
    for (let i = 1; i < BOARD_SIZE; i++) {
      const newPos = { row: row + dir.row * i, col: col + dir.col * i };

      if (!isValidPosition(newPos, board)) break;

      const targetSquare = board[newPos.row][newPos.col];
      if (targetSquare.piece) break; // Blocked by piece

      moves.push(newPos);
    }
  }

  return moves;
};

// Get all valid moves for a pawn
export const getPawnMoves = (position: Position, board: Board): Position[] => {
  const moves: Position[] = [];
  const { row, col } = position;

  // Pawn can only move forward (upward toward row 0) in chess
  const upPos = { row: row - 1, col };
  if (isValidPosition(upPos, board) && !board[upPos.row][upPos.col].piece) {
    moves.push(upPos);
  }

  return moves;
};

// Get all valid moves for a queen (combination of rook and bishop)
export const getQueenMoves = (position: Position, board: Board): Position[] => {
  return [...getRookMoves(position, board), ...getBishopMoves(position, board)];
};

// Get valid moves for any piece
export const getValidMoves = (piece: Piece, board: Board): Position[] => {
  switch (piece.type) {
    case PieceType.KNIGHT:
      return getKnightMoves(piece.position, board);
    case PieceType.BISHOP:
      return getBishopMoves(piece.position, board);
    case PieceType.ROOK:
      return getRookMoves(piece.position, board);
    case PieceType.PAWN:
      return getPawnMoves(piece.position, board);
    case PieceType.QUEEN:
      return getQueenMoves(piece.position, board);
    default:
      return [];
  }
};

// Check if a piece is the original pawn (can be pawn or promoted queen)
export const isOriginalPawn = (piece: Piece): boolean => {
  return piece.id.startsWith("pawn");
};

// Check if pawn should be promoted (reached top row)
export const shouldPromotePawn = (
  piece: Piece,
  newPosition: Position,
): boolean => {
  return piece.type === PieceType.PAWN && newPosition.row === 0;
};

// Make a move on the board
export const makeMove = (board: Board, move: Move): MoveResult => {
  const { from, to, piece } = move;

  // Validate the move
  const validMoves = getValidMoves(piece, board);
  const isValidMove = validMoves.some(
    (pos) => pos.row === to.row && pos.col === to.col,
  );

  if (!isValidMove) {
    return { isValid: false };
  }

  // Create new board
  const newBoard: Board = board.map((row) =>
    row.map((square) => ({
      ...square,
      piece: square.piece ? { ...square.piece } : undefined,
    })),
  );

  // Remove piece from old position
  newBoard[from.row][from.col].piece = undefined;

  // Check for promotion
  const isPromotion = shouldPromotePawn(piece, to);
  const updatedPiece: Piece = {
    ...piece,
    position: to,
    type: isPromotion ? PieceType.QUEEN : piece.type,
  };

  // Place piece in new position
  newBoard[to.row][to.col].piece = updatedPiece;

  // Check if game is won (only original pawn or promoted queen can win)
  const isGameWon =
    to.row === 3 &&
    to.col === 0 &&
    newBoard[to.row][to.col].type === SquareType.GOAL &&
    isOriginalPawn(piece);

  return {
    isValid: true,
    resultingBoard: newBoard,
    isPromotion,
    isGameWon,
  };
};

// Get the pawn piece specifically (for win condition checking)
export const getPawnPiece = (board: Board): Piece | null => {
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const piece = board[row][col].piece;
      if (piece && isOriginalPawn(piece)) {
        return piece;
      }
    }
  }
  return null;
};

// Get all player pieces (all pieces on the board can be moved)
export const getAllPlayerPieces = (board: Board): Piece[] => {
  const pieces: Piece[] = [];
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const piece = board[row][col].piece;
      if (piece) {
        pieces.push(piece);
      }
    }
  }
  return pieces;
};

// Check if a piece is a player piece (all pieces are player pieces)
export const isPlayerPiece = (): boolean => {
  return true; // All pieces belong to the player
};

// Initialize game state
export const initializeGameState = (): GameState => {
  const board = initializeBoard();

  return {
    board,
    currentTurn: "player",
    validMoves: [],
    moveHistory: [],
    isGameWon: false,
    isGameOver: false,
  };
};

// Check if any piece is blocking the path to goal
export const analyzeBoardState = (
  board: Board,
): {
  playerPiece: Piece | null;
  pathToGoal: Position[];
  blockingPieces: Piece[];
} => {
  const playerPiece = getPawnPiece(board);
  const pathToGoal: Position[] = [];
  const blockingPieces: Piece[] = [];

  if (!playerPiece) {
    return { playerPiece: null, pathToGoal: [], blockingPieces: [] };
  }

  // Calculate path to goal (pawn moves up to row 0, then needs to reach (0,0))
  const { row, col } = playerPiece.position;

  // First, path upward to top row (promotion)
  for (let checkRow = row - 1; checkRow >= 0; checkRow--) {
    const pos = { row: checkRow, col };
    pathToGoal.push(pos);

    const square = board[checkRow][col];
    if (square.piece) {
      blockingPieces.push(square.piece);
    }
  }

  // Then path from promotion square to goal at (3,0)
  // After promotion at top row, need to navigate to bottom-left corner
  if (col !== 0) {
    // First move left along top row
    for (let checkCol = col - 1; checkCol >= 0; checkCol--) {
      const pos = { row: 0, col: checkCol };
      pathToGoal.push(pos);

      const square = board[0][checkCol];
      if (square.piece) {
        blockingPieces.push(square.piece);
      }
    }
  }

  // Then move down to goal row (3,0)
  for (let checkRow = 1; checkRow <= 3; checkRow++) {
    const pos = { row: checkRow, col: 0 };
    pathToGoal.push(pos);

    const square = board[checkRow][0];
    if (square.piece) {
      blockingPieces.push(square.piece);
    }
  }

  return { playerPiece, pathToGoal, blockingPieces };
};

// Check if the pawn has a clear path to the goal
export const canPawnReachGoal = (board: Board): boolean => {
  const pawn = getPawnPiece(board);
  if (!pawn) return false;

  // Goal is at position (3, 0)
  const goalPosition = { row: 3, col: 0 };
  const { row, col } = pawn.position;

  // Check if pawn can move up to top row (promotion)
  for (let checkRow = row - 1; checkRow >= 0; checkRow--) {
    if (
      !isValidPosition({ row: checkRow, col }, board) ||
      board[checkRow][col].piece
    ) {
      return false;
    }
  }

  // Check if promoted queen can reach goal at (3,0)
  if (col !== goalPosition.col) {
    // Check path left along top row to column 0
    for (let checkCol = col - 1; checkCol >= goalPosition.col; checkCol--) {
      const checkPos = { row: 0, col: checkCol };
      if (
        !isValidPosition(checkPos, board) ||
        board[checkPos.row][checkPos.col].piece
      ) {
        return false;
      }
    }
  }

  // Check path down from (0,0) to (3,0)
  for (let checkRow = 1; checkRow <= goalPosition.row; checkRow++) {
    const checkPos = { row: checkRow, col: goalPosition.col };
    if (
      !isValidPosition(checkPos, board) ||
      board[checkPos.row][checkPos.col].piece
    ) {
      return false;
    }
  }

  return true;
};
