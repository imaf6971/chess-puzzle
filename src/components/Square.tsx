import React from "react";
import type { Square as SquareType, Position } from "../types";
import { PieceType, SquareType as SquareTypeEnum } from "../types";

interface SquareProps {
  square: SquareType;
  position: Position;
  isSelected: boolean;
  isValidMove: boolean;
  onClick: (position: Position) => void;
}

const getPieceSymbol = (pieceType: PieceType): string => {
  switch (pieceType) {
    case PieceType.KNIGHT:
      return "♞";
    case PieceType.BISHOP:
      return "♝";
    case PieceType.ROOK:
      return "♜";
    case PieceType.PAWN:
      return "♟";
    case PieceType.QUEEN:
      return "♛";
    default:
      return "";
  }
};

const getSquareClasses = (
  square: SquareType,
  position: Position,
  isSelected: boolean,
  isValidMove: boolean,
): string => {
  const baseClasses =
    "w-20 h-20 flex items-center justify-center relative cursor-pointer transition-all duration-200 border border-black/10 select-none hover:scale-105 hover:z-10";
  const classes = [baseClasses];

  // Checkerboard pattern
  const isLightSquare = (position.row + position.col) % 2 === 0;
  classes.push(isLightSquare ? "chess-light-square" : "chess-dark-square");

  // Square type specific styling
  if (square.type === SquareTypeEnum.GOAL) {
    classes.push("chess-goal-square chess-goal-pulse");
  } else if (square.type === SquareTypeEnum.MISSING) {
    classes.push(
      "!bg-transparent border-2 border-dashed border-gray-300 !cursor-not-allowed opacity-30 hover:!transform-none",
    );
  }

  // Interactive states
  if (isSelected) {
    classes.push("!bg-yellow-300 shadow-xl !border-4 !border-yellow-500");
  }
  if (isValidMove) {
    classes.push("!bg-green-300 animate-valid-move-pulse");
  }

  return classes.join(" ");
};

const getPieceClasses = (pieceType: PieceType): string => {
  const baseClasses =
    "text-5xl drop-shadow-md transition-all duration-300 z-10 cursor-pointer font-bold hover:scale-110 hover:brightness-110";

  switch (pieceType) {
    case PieceType.PAWN:
      return `${baseClasses} text-chess-pawn animate-pawn-glow`;
    case PieceType.QUEEN:
      return `${baseClasses} text-chess-queen animate-queen-glow`;
    case PieceType.KNIGHT:
      return `${baseClasses} text-chess-knight`;
    case PieceType.BISHOP:
      return `${baseClasses} text-chess-bishop`;
    case PieceType.ROOK:
      return `${baseClasses} text-chess-rook`;
    default:
      return `${baseClasses} animate-player-piece-glow`;
  }
};

export const Square: React.FC<SquareProps> = ({
  square,
  position,
  isSelected,
  isValidMove,
  onClick,
}) => {
  const handleClick = () => {
    if (square.type !== SquareTypeEnum.MISSING) {
      onClick(position);
    }
  };

  const squareClasses = getSquareClasses(
    square,
    position,
    isSelected,
    isValidMove,
  );

  // Don't render missing squares
  if (square.type === SquareTypeEnum.MISSING) {
    return (
      <div className="w-20 h-20 bg-transparent border-2 border-dashed border-gray-300 cursor-not-allowed opacity-30" />
    );
  }

  return (
    <div
      className={squareClasses}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          handleClick();
        }
      }}
    >
      {square.piece && (
        <div className={getPieceClasses(square.piece.type)}>
          {getPieceSymbol(square.piece.type)}
        </div>
      )}
      {square.type === SquareTypeEnum.GOAL && !square.piece && (
        <div className="text-3xl animate-spin-slow">🎯</div>
      )}
      {isValidMove && (
        <div
          className="absolute w-5 h-5 rounded-full animate-move-indicator-pulse"
          style={{ background: "var(--gradient-chess-move-indicator)" }}
        />
      )}
    </div>
  );
};
