import type { Board, Position, Move, Piece } from "./types";
import {
  getAllPlayerPieces,
  getValidMoves,
  makeMove,
  isOriginalPawn,
  initializeBoard,
} from "./gameLogic";

// Priority Queue implementation for A*
class PriorityQueue<T> {
  private heap: Array<{ item: T; priority: number }> = [];

  enqueue(item: T, priority: number): void {
    this.heap.push({ item, priority });
    this.heapifyUp(this.heap.length - 1);
  }

  dequeue(): T | null {
    if (this.heap.length === 0) return null;
    if (this.heap.length === 1) return this.heap.pop()!.item;

    const result = this.heap[0].item;
    this.heap[0] = this.heap.pop()!;
    this.heapifyDown(0);
    return result;
  }

  isEmpty(): boolean {
    return this.heap.length === 0;
  }

  private heapifyUp(index: number): void {
    if (index === 0) return;
    const parentIndex = Math.floor((index - 1) / 2);
    if (this.heap[parentIndex].priority > this.heap[index].priority) {
      this.swap(parentIndex, index);
      this.heapifyUp(parentIndex);
    }
  }

  private heapifyDown(index: number): void {
    const leftChild = 2 * index + 1;
    const rightChild = 2 * index + 2;
    let smallest = index;

    if (
      leftChild < this.heap.length &&
      this.heap[leftChild].priority < this.heap[smallest].priority
    ) {
      smallest = leftChild;
    }

    if (
      rightChild < this.heap.length &&
      this.heap[rightChild].priority < this.heap[smallest].priority
    ) {
      smallest = rightChild;
    }

    if (smallest !== index) {
      this.swap(index, smallest);
      this.heapifyDown(smallest);
    }
  }

  private swap(i: number, j: number): void {
    [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
  }
}

// Game state representation for AI
interface SearchState {
  board: Board;
  gCost: number; // Actual cost from start
  hCost: number; // Heuristic cost to goal
  fCost: number; // gCost + hCost
  move?: Move; // Move that led to this state
  parent?: SearchState; // Parent state for path reconstruction
}

// AI Solver class
export class ChessPuzzleAISolver {
  private visitedStates = new Map<string, number>(); // boardHash -> bestGCost
  private maxStatesExplored = 100_000_000; // Prevent infinite search

  // Generate unique hash for board state
  private hashBoard(board: Board): string {
    const pieces: string[] = [];
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        const piece = board[row][col].piece;
        if (piece) {
          pieces.push(`${piece.type}@${row},${col}`);
        }
      }
    }
    return pieces.sort().join("|");
  }

  // Check if current state is the goal state
  private isGoalState(board: Board): boolean {
    const goalSquare = board[3][0];
    return (
      goalSquare.piece !== undefined &&
      isOriginalPawn(goalSquare.piece) &&
      goalSquare.type === "goal"
    );
  }

  // Find the original pawn in the board
  private findPawn(board: Board): Piece | null {
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        const piece = board[row][col].piece;
        if (piece && isOriginalPawn(piece)) {
          return piece;
        }
      }
    }
    return null;
  }

  // Manhattan distance between two positions
  private manhattanDistance(from: Position, to: Position): number {
    return Math.abs(from.row - to.row) + Math.abs(from.col - to.col);
  }

  // Heuristic function for A* - estimates cost to reach goal
  private calculateHeuristic(board: Board): number {
    const pawn = this.findPawn(board);
    if (!pawn) return Infinity;

    const pawnPos = pawn.position;
    const goalPos = { row: 3, col: 0 };

    // If pawn is already promoted (queen), direct distance to goal
    if (pawn.type === "queen") {
      return this.manhattanDistance(pawnPos, goalPos);
    }

    // Pawn needs to: 1) reach top row for promotion, 2) reach goal
    const promotionDistance = pawnPos.row; // Distance to top row (row 0)
    const postPromotionDistance = 3 + pawnPos.col; // From top row to goal (3,0)

    // Add penalty for blocking pieces in pawn's path
    let blockingPenalty = 0;

    // Check for pieces blocking upward path
    for (let checkRow = pawnPos.row - 1; checkRow >= 0; checkRow--) {
      if (board[checkRow][pawnPos.col].piece) {
        blockingPenalty += 2; // Each blocking piece adds cost
      }
    }

    // Check for pieces blocking path to goal from promotion position
    const promotedCol = pawnPos.col;
    if (promotedCol > 0) {
      // Check horizontal path from promotion square to column 0
      for (let checkCol = promotedCol - 1; checkCol >= 0; checkCol--) {
        if (board[0][checkCol].piece) {
          blockingPenalty += 1;
        }
      }
    }

    // Check vertical path down to goal
    for (let checkRow = 1; checkRow <= 3; checkRow++) {
      if (board[checkRow][0].piece) {
        blockingPenalty += 1;
      }
    }

    return promotionDistance + postPromotionDistance + blockingPenalty;
  }

  // Generate all possible moves from current board state
  private generateMoves(board: Board): Move[] {
    const moves: Move[] = [];
    const pieces = getAllPlayerPieces(board);

    for (const piece of pieces) {
      const validMoves = getValidMoves(piece, board);
      for (const toPosition of validMoves) {
        moves.push({
          from: piece.position,
          to: toPosition,
          piece: piece,
        });
      }
    }

    return moves;
  }

  // Reconstruct solution path from goal state back to start
  private reconstructPath(goalState: SearchState): Move[] {
    const path: Move[] = [];
    let current: SearchState | undefined = goalState;

    while (current && current.move) {
      path.unshift(current.move);
      current = current.parent;
    }

    return path;
  }

  // Main A* search algorithm
  public async solvePuzzle(): Promise<{
    solution: Move[] | null;
    statesExplored: number;
    solutionLength: number;
    timeElapsed: number;
  }> {
    const startTime = Date.now();
    const initialBoard = initializeBoard();

    // Initialize starting state
    const startState: SearchState = {
      board: initialBoard,
      gCost: 0,
      hCost: this.calculateHeuristic(initialBoard),
      fCost: 0,
    };
    startState.fCost = startState.gCost + startState.hCost;

    const openSet = new PriorityQueue<SearchState>();
    openSet.enqueue(startState, startState.fCost);

    this.visitedStates.clear();
    let statesExplored = 0;

    while (!openSet.isEmpty() && statesExplored < this.maxStatesExplored) {
      const currentState = openSet.dequeue()!;
      statesExplored++;

      // Check if we reached the goal
      if (this.isGoalState(currentState.board)) {
        const timeElapsed = Date.now() - startTime;
        return {
          solution: this.reconstructPath(currentState),
          statesExplored,
          solutionLength: currentState.gCost,
          timeElapsed,
        };
      }

      const currentHash = this.hashBoard(currentState.board);

      // Skip if we've seen this state with a better cost
      if (this.visitedStates.has(currentHash)) {
        const bestCost = this.visitedStates.get(currentHash)!;
        if (currentState.gCost >= bestCost) {
          continue;
        }
      }

      this.visitedStates.set(currentHash, currentState.gCost);

      // Generate all possible moves
      const possibleMoves = this.generateMoves(currentState.board);

      for (const move of possibleMoves) {
        const moveResult = makeMove(currentState.board, move);

        if (!moveResult.isValid || !moveResult.resultingBoard) {
          continue;
        }

        const newGCost = currentState.gCost + 1;
        const newHCost = this.calculateHeuristic(moveResult.resultingBoard);
        const newFCost = newGCost + newHCost;

        const newState: SearchState = {
          board: moveResult.resultingBoard,
          gCost: newGCost,
          hCost: newHCost,
          fCost: newFCost,
          move: move,
          parent: currentState,
        };

        // Check if this new state is worth exploring
        const newStateHash = this.hashBoard(newState.board);
        if (this.visitedStates.has(newStateHash)) {
          const existingCost = this.visitedStates.get(newStateHash)!;
          if (newGCost >= existingCost) {
            continue; // Skip if we've found a better path to this state
          }
        }

        openSet.enqueue(newState, newState.fCost);
      }

      // Yield control periodically for UI responsiveness
      if (statesExplored % 1000 === 0) {
        await new Promise((resolve) => setTimeout(resolve, 0));
      }
    }

    const timeElapsed = Date.now() - startTime;
    return {
      solution: null,
      statesExplored,
      solutionLength: -1,
      timeElapsed,
    };
  }

  // Alternative: Simple BFS for guaranteed optimal solution (memory intensive)
  public async solvePuzzleBFS(): Promise<{
    solution: Move[] | null;
    statesExplored: number;
    solutionLength: number;
    timeElapsed: number;
  }> {
    const startTime = Date.now();
    const initialBoard = initializeBoard();

    const queue: SearchState[] = [
      {
        board: initialBoard,
        gCost: 0,
        hCost: 0,
        fCost: 0,
      },
    ];

    const visited = new Set<string>();
    let statesExplored = 0;

    while (queue.length > 0 && statesExplored < this.maxStatesExplored) {
      const currentState = queue.shift()!;
      statesExplored++;

      const currentHash = this.hashBoard(currentState.board);
      if (visited.has(currentHash)) {
        continue;
      }
      visited.add(currentHash);

      // Check if we reached the goal
      if (this.isGoalState(currentState.board)) {
        const timeElapsed = Date.now() - startTime;
        return {
          solution: this.reconstructPath(currentState),
          statesExplored,
          solutionLength: currentState.gCost,
          timeElapsed,
        };
      }

      // Generate all possible moves
      const possibleMoves = this.generateMoves(currentState.board);

      for (const move of possibleMoves) {
        const moveResult = makeMove(currentState.board, move);

        if (!moveResult.isValid || !moveResult.resultingBoard) {
          continue;
        }

        const newStateHash = this.hashBoard(moveResult.resultingBoard);
        if (visited.has(newStateHash)) {
          continue;
        }

        const newState: SearchState = {
          board: moveResult.resultingBoard,
          gCost: currentState.gCost + 1,
          hCost: 0,
          fCost: currentState.gCost + 1,
          move: move,
          parent: currentState,
        };

        queue.push(newState);
      }

      // Yield control periodically
      if (statesExplored % 1000 === 0) {
        await new Promise((resolve) => setTimeout(resolve, 0));
      }
    }

    const timeElapsed = Date.now() - startTime;
    return {
      solution: null,
      statesExplored,
      solutionLength: -1,
      timeElapsed,
    };
  }

  // Get detailed analysis of the current board state
  public analyzeBoardState(board: Board): {
    pawnPosition: Position | null;
    isPawnPromoted: boolean;
    movesToPromotion: number;
    movesToGoal: number;
    blockingPieces: number;
  } {
    // Validate board structure
    if (!board || !Array.isArray(board) || board.length !== 4) {
      return {
        pawnPosition: null,
        isPawnPromoted: false,
        movesToPromotion: Infinity,
        movesToGoal: Infinity,
        blockingPieces: 0,
      };
    }

    // Validate each row
    for (let i = 0; i < 4; i++) {
      if (!board[i] || !Array.isArray(board[i]) || board[i].length !== 4) {
        return {
          pawnPosition: null,
          isPawnPromoted: false,
          movesToPromotion: Infinity,
          movesToGoal: Infinity,
          blockingPieces: 0,
        };
      }
    }
    const pawn = this.findPawn(board);
    if (!pawn) {
      return {
        pawnPosition: null,
        isPawnPromoted: false,
        movesToPromotion: Infinity,
        movesToGoal: Infinity,
        blockingPieces: 0,
      };
    }

    const isPawnPromoted = pawn.type === "queen";
    const pawnPos = pawn.position;
    const goalPos = { row: 3, col: 0 };

    const movesToPromotion = isPawnPromoted ? 0 : pawnPos.row;
    const movesToGoal = isPawnPromoted
      ? this.manhattanDistance(pawnPos, goalPos)
      : pawnPos.row + 3 + pawnPos.col;

    // Count blocking pieces
    let blockingPieces = 0;
    if (!isPawnPromoted) {
      // Count pieces blocking upward path
      for (let checkRow = pawnPos.row - 1; checkRow >= 0; checkRow--) {
        if (board[checkRow][pawnPos.col].piece) {
          blockingPieces++;
        }
      }
    }

    // Count pieces blocking path to goal
    for (let checkRow = 1; checkRow <= 3; checkRow++) {
      if (board[checkRow][0].piece) {
        blockingPieces++;
      }
    }

    if (pawnPos.col > 0) {
      for (let checkCol = pawnPos.col - 1; checkCol >= 0; checkCol--) {
        if (board[0][checkCol].piece) {
          blockingPieces++;
        }
      }
    }

    return {
      pawnPosition: pawnPos,
      isPawnPromoted,
      movesToPromotion,
      movesToGoal,
      blockingPieces,
    };
  }
}
