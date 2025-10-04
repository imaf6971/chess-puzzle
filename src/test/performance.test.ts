import { describe, it, expect, beforeEach, vi } from "vitest";
import { ChessPuzzleAISolver } from "../aiSolver";
import {
  initializeBoard,
  initializeGameState,
  makeMove,
  getValidMoves,
  getAllPlayerPieces,
  getPawnPiece,
  analyzeBoardState,
  canPawnReachGoal,
} from "../gameLogic";
import {
  PieceType,
  SquareType,
  type Board,
  type Piece,
  type Move,
} from "../types";
import {
  createEmptyBoard,
  createBoardWithSpecialSquares,
  createTestPiece,
  placePieceOnBoard,
  measurePerformance,
  getAllBoardPositions,
  createMockMoveSequence,
} from "./utils/testHelpers";

describe("Performance Tests", () => {
  describe("Game Logic Performance", () => {
    it("should initialize board quickly", async () => {
      const { timeElapsed, withinLimit } = await measurePerformance(() => {
        return initializeBoard();
      }, 50);

      expect(withinLimit).toBe(true);
      expect(timeElapsed).toBeLessThan(50);
    });

    it("should initialize game state quickly", async () => {
      const { timeElapsed, withinLimit } = await measurePerformance(() => {
        return initializeGameState();
      }, 100);

      expect(withinLimit).toBe(true);
      expect(timeElapsed).toBeLessThan(100);
    });

    it("should calculate valid moves efficiently for all piece types", async () => {
      const board = createBoardWithSpecialSquares();
      const pieces = [
        createTestPiece(PieceType.KNIGHT, 1, 1),
        createTestPiece(PieceType.BISHOP, 1, 2),
        createTestPiece(PieceType.ROOK, 2, 1),
        createTestPiece(PieceType.PAWN, 2, 2),
        createTestPiece(PieceType.QUEEN, 1, 3),
      ];

      const { timeElapsed, withinLimit } = await measurePerformance(() => {
        pieces.forEach((piece) => {
          getValidMoves(piece, board);
        });
      }, 100);

      expect(withinLimit).toBe(true);
      expect(timeElapsed).toBeLessThan(100);
    });

    it("should handle move validation quickly", async () => {
      const board = initializeBoard();
      const knight = board[0][0].piece!;
      const validMoves = getValidMoves(knight, board);

      if (validMoves.length > 0) {
        const move: Move = {
          from: knight.position,
          to: validMoves[0],
          piece: knight,
        };

        const { timeElapsed, withinLimit } = await measurePerformance(() => {
          return makeMove(board, move);
        }, 50);

        expect(withinLimit).toBe(true);
        expect(timeElapsed).toBeLessThan(50);
      }
    });

    it("should find pawn piece quickly on full board", async () => {
      const board = initializeBoard();

      const { timeElapsed, withinLimit } = await measurePerformance(() => {
        return getPawnPiece(board);
      }, 25);

      expect(withinLimit).toBe(true);
      expect(timeElapsed).toBeLessThan(25);
    });

    it("should get all player pieces quickly", async () => {
      const board = initializeBoard();

      const { timeElapsed, withinLimit } = await measurePerformance(() => {
        return getAllPlayerPieces(board);
      }, 50);

      expect(withinLimit).toBe(true);
      expect(timeElapsed).toBeLessThan(50);
    });

    it("should analyze board state efficiently", async () => {
      const board = initializeBoard();

      const { timeElapsed, withinLimit } = await measurePerformance(() => {
        return analyzeBoardState(board);
      }, 100);

      expect(withinLimit).toBe(true);
      expect(timeElapsed).toBeLessThan(100);
    });

    it("should check pawn goal reachability quickly", async () => {
      const board = initializeBoard();

      const { timeElapsed, withinLimit } = await measurePerformance(() => {
        return canPawnReachGoal(board);
      }, 75);

      expect(withinLimit).toBe(true);
      expect(timeElapsed).toBeLessThan(75);
    });
  });

  describe("AI Solver Performance", () => {
    it("should analyze board state quickly", async () => {
      const solver = new ChessPuzzleAISolver();
      const board = initializeBoard();

      const { timeElapsed, withinLimit } = await measurePerformance(() => {
        return solver.analyzeBoardState(board);
      }, 100);

      expect(withinLimit).toBe(true);
      expect(timeElapsed).toBeLessThan(100);
    });

    it("should handle repeated analysis calls efficiently", async () => {
      const solver = new ChessPuzzleAISolver();
      const board = initializeBoard();

      const { timeElapsed, withinLimit } = await measurePerformance(() => {
        for (let i = 0; i < 100; i++) {
          solver.analyzeBoardState(board);
        }
      }, 500);

      expect(withinLimit).toBe(true);
      expect(timeElapsed).toBeLessThan(500);
    });

    it("should start solving within reasonable time", async () => {
      const solver = new ChessPuzzleAISolver();

      const startTime = Date.now();
      const solvingPromise = solver.solvePuzzle();

      // Give it a moment to start
      await new Promise((resolve) => setTimeout(resolve, 100));

      const timeToStart = Date.now() - startTime;

      // Cancel the solving to avoid long-running test
      solvingPromise.catch(() => {}); // Ignore cancellation

      expect(timeToStart).toBeLessThan(200);
    });
  });

  describe("Memory and Resource Management", () => {
    it("should not leak memory during board operations", async () => {
      const initialMemory = process.memoryUsage().heapUsed;

      // Perform many board operations
      for (let i = 0; i < 1000; i++) {
        const board = initializeBoard();
        getAllPlayerPieces(board);
        getPawnPiece(board);
      }

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;

      // Memory increase should be reasonable (less than 10MB for 1000 operations)
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
    });

    it("should handle concurrent board analysis", async () => {
      const board = initializeBoard();
      const solver = new ChessPuzzleAISolver();

      const { timeElapsed, withinLimit } = await measurePerformance(
        async () => {
          const promises = Array(10)
            .fill(0)
            .map(() => Promise.resolve(solver.analyzeBoardState(board)));

          return Promise.all(promises);
        },
        500,
      );

      expect(withinLimit).toBe(true);
      expect(timeElapsed).toBeLessThan(500);
    });

    it("should efficiently handle board cloning", async () => {
      const board = initializeBoard();

      const { timeElapsed, withinLimit } = await measurePerformance(() => {
        for (let i = 0; i < 100; i++) {
          const clonedBoard = structuredClone(board);
          // Modify clone to ensure deep copy
          clonedBoard[0][0].piece = undefined;
        }
      }, 200);

      expect(withinLimit).toBe(true);
      expect(timeElapsed).toBeLessThan(200);
    });
  });

  describe("Stress Tests", () => {
    it("should handle many sequential moves efficiently", async () => {
      const board = createBoardWithSpecialSquares();
      let currentBoard = board;

      // Place a knight that can move around
      const knight = createTestPiece(PieceType.KNIGHT, 1, 1);
      currentBoard = placePieceOnBoard(currentBoard, knight, 1, 1);

      const { timeElapsed, withinLimit } = await measurePerformance(() => {
        // Simulate 50 moves
        for (let i = 0; i < 50; i++) {
          const pieces = getAllPlayerPieces(currentBoard);
          if (pieces.length > 0) {
            const piece = pieces[0];
            const validMoves = getValidMoves(piece, currentBoard);

            if (validMoves.length > 0) {
              const move: Move = {
                from: piece.position,
                to: validMoves[0],
                piece,
              };

              const result = makeMove(currentBoard, move);
              if (result.isValid && result.resultingBoard) {
                currentBoard = result.resultingBoard;
              }
            }
          }
        }
      }, 2000);

      expect(withinLimit).toBe(true);
      expect(timeElapsed).toBeLessThan(2000);
    });

    it("should handle board with maximum pieces efficiently", async () => {
      // Create board with pieces in every possible position
      const fullBoard = createEmptyBoard();
      let pieceCount = 0;

      for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 4; col++) {
          if (!(row === 3 && (col === 1 || col === 2))) {
            // Skip missing squares
            const pieceType = [
              PieceType.KNIGHT,
              PieceType.BISHOP,
              PieceType.ROOK,
              PieceType.QUEEN,
            ][pieceCount % 4];
            const piece = createTestPiece(
              pieceType,
              row,
              col,
              `piece-${pieceCount}`,
            );
            fullBoard[row][col].piece = piece;
            pieceCount++;
          }
        }
      }

      const { timeElapsed, withinLimit } = await measurePerformance(() => {
        const pieces = getAllPlayerPieces(fullBoard);
        pieces.forEach((piece) => {
          getValidMoves(piece, fullBoard);
        });
      }, 1000);

      expect(withinLimit).toBe(true);
      expect(timeElapsed).toBeLessThan(1000);
    });

    it("should handle rapid state changes", async () => {
      let gameState = initializeGameState();

      const { timeElapsed, withinLimit } = await measurePerformance(() => {
        // Simulate rapid game state updates
        for (let i = 0; i < 100; i++) {
          gameState = {
            ...gameState,
            selectedPiece:
              i % 2 === 0 ? gameState.board[0][0].piece : undefined,
            validMoves: i % 3 === 0 ? [{ row: 1, col: 1 }] : [],
            moveHistory: [
              ...gameState.moveHistory,
              ...createMockMoveSequence(1),
            ],
          };
        }
      }, 500);

      expect(withinLimit).toBe(true);
      expect(timeElapsed).toBeLessThan(500);
    });

    it("should handle pathfinding stress test", async () => {
      const board = createBoardWithSpecialSquares();

      // Place pieces to create complex pathfinding scenarios
      const blockingPositions = [
        { row: 1, col: 1 },
        { row: 1, col: 2 },
        { row: 2, col: 1 },
        { row: 2, col: 2 },
        { row: 0, col: 2 },
        { row: 0, col: 3 },
      ];

      let testBoard = board;
      blockingPositions.forEach((pos, index) => {
        const piece = createTestPiece(
          PieceType.KNIGHT,
          pos.row,
          pos.col,
          `blocker-${index}`,
        );
        testBoard = placePieceOnBoard(testBoard, piece, pos.row, pos.col);
      });

      // Place pawn to test pathfinding
      const pawn = createTestPiece(PieceType.PAWN, 3, 3, "pawn-3-3");
      testBoard = placePieceOnBoard(testBoard, pawn, 3, 3);

      const { timeElapsed, withinLimit } = await measurePerformance(() => {
        // Test various pathfinding operations
        canPawnReachGoal(testBoard);
        analyzeBoardState(testBoard);

        // Test AI analysis
        const solver = new ChessPuzzleAISolver();
        solver.analyzeBoardState(testBoard);
      }, 500);

      expect(withinLimit).toBe(true);
      expect(timeElapsed).toBeLessThan(500);
    });

    it("should handle edge case positions efficiently", async () => {
      const { timeElapsed, withinLimit } = await measurePerformance(() => {
        const edgePositions = [
          { row: 0, col: 0 },
          { row: 0, col: 3 },
          { row: 3, col: 0 },
          { row: 3, col: 3 },
        ];

        edgePositions.forEach((pos) => {
          const board = createBoardWithSpecialSquares();
          const piece = createTestPiece(PieceType.QUEEN, pos.row, pos.col);
          const testBoard = placePieceOnBoard(board, piece, pos.row, pos.col);

          // Test operations from edge positions
          getValidMoves(piece, testBoard);
          getAllPlayerPieces(testBoard);

          // Test move to all other positions
          getAllBoardPositions().forEach((targetPos) => {
            if (targetPos.row !== pos.row || targetPos.col !== pos.col) {
              const move: Move = {
                from: pos,
                to: targetPos,
                piece,
              };
              makeMove(testBoard, move);
            }
          });
        });
      }, 2000);

      expect(withinLimit).toBe(true);
      expect(timeElapsed).toBeLessThan(2000);
    });
  });

  describe("Scalability Tests", () => {
    it("should scale linearly with board operations", async () => {
      const operationCounts = [10, 50, 100];
      const timings: number[] = [];

      for (const count of operationCounts) {
        const { timeElapsed } = await measurePerformance(() => {
          for (let i = 0; i < count; i++) {
            const board = initializeBoard();
            getAllPlayerPieces(board);
            getPawnPiece(board);
          }
        });

        timings.push(Math.max(timeElapsed, 1)); // Ensure minimum 1ms to avoid division by zero
      }

      // Check that timing scales roughly linearly (not exponentially)
      const ratio1 = timings[1] / timings[0];
      const ratio2 = timings[2] / timings[1];

      // Ratios should be roughly proportional to operation count ratios
      // If operations are very fast, ratios might be close to 1
      expect(ratio1).toBeLessThan(10); // Should not be 10x slower for 5x operations
      expect(ratio2).toBeLessThan(5); // Should not be 5x slower for 2x operations
    });

    it("should maintain performance with increasing move history", async () => {
      let gameState = initializeGameState();

      // Add increasing numbers of moves to history
      const historySizes = [10, 50, 100];
      const timings: number[] = [];

      for (const size of historySizes) {
        gameState = {
          ...gameState,
          moveHistory: createMockMoveSequence(size),
        };

        const { timeElapsed } = await measurePerformance(() => {
          // Operations that might be affected by move history size
          for (let i = 0; i < 20; i++) {
            getAllPlayerPieces(gameState.board);
            analyzeBoardState(gameState.board);
          }
        }, 1000);

        timings.push(Math.max(timeElapsed, 1)); // Ensure minimum 1ms to avoid division issues
      }

      // Performance should not degrade significantly with move history
      // Use a baseline minimum to handle very fast operations
      const baseline = Math.max(timings[0], 1);
      expect(timings[2]).toBeLessThan(baseline * 5); // Should not be 5x slower than baseline
    });
  });

  describe("Real-World Scenarios", () => {
    it("should handle typical game session performance", async () => {
      let gameState = initializeGameState();
      const moves: Move[] = [];

      const { timeElapsed, withinLimit } = await measurePerformance(() => {
        // Simulate a typical game session with up to 20 moves
        for (let moveCount = 0; moveCount < 20; moveCount++) {
          const pieces = getAllPlayerPieces(gameState.board);

          if (pieces.length === 0) break;

          // Find a piece with valid moves to ensure progress
          let moveFound = false;

          // Shuffle pieces to maintain randomness while ensuring we find valid moves
          const shuffledPieces = [...pieces].sort(() => Math.random() - 0.5);

          for (const piece of shuffledPieces) {
            const validMoves = getValidMoves(piece, gameState.board);

            if (validMoves.length > 0) {
              const randomMove =
                validMoves[Math.floor(Math.random() * validMoves.length)];
              const move: Move = {
                from: piece.position,
                to: randomMove,
                piece: piece,
              };

              const result = makeMove(gameState.board, move);
              if (result.isValid && result.resultingBoard) {
                moves.push(move);
                gameState = {
                  ...gameState,
                  board: result.resultingBoard,
                  moveHistory: [...gameState.moveHistory, move],
                };
                moveFound = true;
                break;
              }
            }
          }

          // If no valid moves found, break to avoid infinite loop
          if (!moveFound) break;
        }
      }, 3000);

      expect(withinLimit).toBe(true);
      expect(timeElapsed).toBeLessThan(3000);
      expect(moves.length).toBeGreaterThan(0);
    });

    it("should handle AI solver initialization efficiently", async () => {
      const { timeElapsed, withinLimit } = await measurePerformance(() => {
        // Create multiple solver instances
        for (let i = 0; i < 10; i++) {
          const solver = new ChessPuzzleAISolver();
          const board = initializeBoard();
          solver.analyzeBoardState(board);
        }
      }, 1000);

      expect(withinLimit).toBe(true);
      expect(timeElapsed).toBeLessThan(1000);
    });

    it("should maintain performance under concurrent access", async () => {
      const board = initializeBoard();

      const { timeElapsed, withinLimit } = await measurePerformance(
        async () => {
          // Simulate concurrent operations
          const operations = [];

          for (let i = 0; i < 50; i++) {
            operations.push(
              Promise.resolve().then(() => {
                const pieces = getAllPlayerPieces(board);
                const pawn = getPawnPiece(board);
                analyzeBoardState(board);
                canPawnReachGoal(board);

                if (pieces.length > 0) {
                  getValidMoves(pieces[0], board);
                }
              }),
            );
          }

          return Promise.all(operations);
        },
        2000,
      );

      expect(withinLimit).toBe(true);
      expect(timeElapsed).toBeLessThan(2000);
    });
  });

  describe("Resource Cleanup Tests", () => {
    it("should properly clean up after solver operations", async () => {
      const initialMemory = process.memoryUsage().heapUsed;

      // Run multiple solver operations
      for (let i = 0; i < 10; i++) {
        const solver = new ChessPuzzleAISolver();
        const board = initializeBoard();

        // Perform analysis
        solver.analyzeBoardState(board);

        // Start and immediately abandon solving to test cleanup
        const solvingPromise = solver.solvePuzzle().catch(() => {});
        await new Promise((resolve) => setTimeout(resolve, 10));
      }

      // Allow time for cleanup
      await new Promise((resolve) => setTimeout(resolve, 100));

      if (global.gc) {
        global.gc();
      }

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;

      // Memory increase should be reasonable (accounting for JS GC unpredictability)
      expect(memoryIncrease).toBeLessThan(100 * 1024 * 1024); // Less than 100MB
    });

    it("should handle rapid creation and destruction of game states", async () => {
      const { timeElapsed, withinLimit } = await measurePerformance(() => {
        for (let i = 0; i < 100; i++) {
          const gameState = initializeGameState();
          // Modify state
          const updatedState = {
            ...gameState,
            selectedPiece: gameState.board[0][0].piece,
            validMoves: [{ row: 1, col: 1 }],
          };

          // Use the state
          getAllPlayerPieces(updatedState.board);
        }
      }, 500);

      expect(withinLimit).toBe(true);
      expect(timeElapsed).toBeLessThan(500);
    });
  });

  describe("Performance Regression Tests", () => {
    it("should maintain baseline performance for board initialization", async () => {
      const iterations = 1000;
      const { timeElapsed } = await measurePerformance(() => {
        for (let i = 0; i < iterations; i++) {
          initializeBoard();
        }
      });

      const avgTimePerOperation = timeElapsed / iterations;
      expect(avgTimePerOperation).toBeLessThan(1); // Less than 1ms per initialization
    });

    it("should maintain baseline performance for move validation", async () => {
      const board = initializeBoard();
      const knight = board[0][0].piece!;
      const move: Move = {
        from: knight.position,
        to: { row: 2, col: 1 },
        piece: knight,
      };

      const iterations = 1000;
      const { timeElapsed } = await measurePerformance(() => {
        for (let i = 0; i < iterations; i++) {
          makeMove(board, move);
        }
      });

      const avgTimePerOperation = timeElapsed / iterations;
      expect(avgTimePerOperation).toBeLessThan(0.5); // Less than 0.5ms per move validation
    });

    it("should maintain baseline performance for AI analysis", async () => {
      const solver = new ChessPuzzleAISolver();
      const board = initializeBoard();

      const iterations = 100;
      const { timeElapsed } = await measurePerformance(() => {
        for (let i = 0; i < iterations; i++) {
          solver.analyzeBoardState(board);
        }
      });

      const avgTimePerOperation = timeElapsed / iterations;
      expect(avgTimePerOperation).toBeLessThan(5); // Less than 5ms per analysis
    });
  });
});
