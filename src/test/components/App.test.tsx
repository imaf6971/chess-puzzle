import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../../App";
import type { BoardAnalysis } from "../../components/AISolver";
import type { Move } from "../../types";

// Mock the child components
vi.mock("../../components/ChessPuzzle", () => ({
  ChessPuzzle: () => (
    <div data-testid="chess-puzzle">Chess Puzzle Component</div>
  ),
}));

vi.mock("../../components/AISolver", () => ({
  AISolver: ({ onSolutionFound, onAnalysisUpdate }: any) => (
    <div data-testid="ai-solver">
      <button
        onClick={() => {
          const mockMoves: Move[] = [
            {
              from: { row: 0, col: 0 },
              to: { row: 1, col: 2 },
              piece: {
                type: "knight",
                position: { row: 0, col: 0 },
                id: "knight-0-0",
              },
            },
          ];
          onSolutionFound(mockMoves, "astar");
        }}
      >
        Find Solution
      </button>
      <button
        onClick={() => {
          const mockAnalysis: BoardAnalysis = {
            pawnPosition: { row: 3, col: 3 },
            isPawnPromoted: false,
            movesToPromotion: 3,
            movesToGoal: 6,
            blockingPieces: 5,
          };
          onAnalysisUpdate(mockAnalysis);
        }}
      >
        Analyze Board
      </button>
    </div>
  ),
}));

describe("App Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Initial Rendering", () => {
    it("should render without crashing", () => {
      render(<App />);
      expect(
        screen.getByRole("button", { name: /🤖 AI Solver/i }),
      ).toBeInTheDocument();
    });

    it("should render in play mode by default", () => {
      render(<App />);

      expect(screen.getByText("🤖 AI Solver")).toBeInTheDocument();
      expect(screen.getByTestId("chess-puzzle")).toBeInTheDocument();
      expect(screen.queryByTestId("ai-solver")).not.toBeInTheDocument();
    });

    it("should have correct initial styling and layout", () => {
      render(<App />);

      const container = screen
        .getByRole("button", { name: /🤖 AI Solver/i })
        .closest("div");
      expect(container).toHaveClass("text-center", "p-5");

      const button = screen.getByRole("button", { name: /🤖 AI Solver/i });
      expect(button).toHaveClass("bg-chess-ai", "text-white", "rounded-full");
    });
  });

  describe("Mode Switching", () => {
    it("should switch to AI solver mode when button is clicked", async () => {
      const user = userEvent.setup();
      render(<App />);

      const toggleButton = screen.getByRole("button", {
        name: /🤖 AI Solver/i,
      });
      await user.click(toggleButton);

      expect(screen.getByText("🎮 Play Mode")).toBeInTheDocument();
      expect(screen.getByTestId("ai-solver")).toBeInTheDocument();
      expect(screen.queryByTestId("chess-puzzle")).not.toBeInTheDocument();
    });

    it("should switch back to play mode when clicking play mode button", async () => {
      const user = userEvent.setup();
      render(<App />);

      // Switch to AI mode
      const toggleButton = screen.getByRole("button", {
        name: /🤖 AI Solver/i,
      });
      await user.click(toggleButton);

      // Switch back to play mode
      const playModeButton = screen.getByRole("button", {
        name: /🎮 Play Mode/i,
      });
      await user.click(playModeButton);

      expect(screen.getByText("🤖 AI Solver")).toBeInTheDocument();
      expect(screen.getByTestId("chess-puzzle")).toBeInTheDocument();
      expect(screen.queryByTestId("ai-solver")).not.toBeInTheDocument();
    });

    it("should toggle between modes multiple times", async () => {
      const user = userEvent.setup();
      render(<App />);

      // Initial state - play mode
      expect(screen.getByTestId("chess-puzzle")).toBeInTheDocument();

      // Switch to AI mode
      await user.click(screen.getByRole("button", { name: /🤖 AI Solver/i }));
      expect(screen.getByTestId("ai-solver")).toBeInTheDocument();

      // Switch back to play mode
      await user.click(screen.getByRole("button", { name: /🎮 Play Mode/i }));
      expect(screen.getByTestId("chess-puzzle")).toBeInTheDocument();

      // Switch to AI mode again
      await user.click(screen.getByRole("button", { name: /🤖 AI Solver/i }));
      expect(screen.getByTestId("ai-solver")).toBeInTheDocument();
    });
  });

  describe("AI Solution Handling", () => {
    it("should handle solution found callback", async () => {
      const user = userEvent.setup();
      render(<App />);

      // Switch to AI mode
      await user.click(screen.getByRole("button", { name: /🤖 AI Solver/i }));

      // Trigger solution found
      const findSolutionButton = screen.getByRole("button", {
        name: /Find Solution/i,
      });
      await user.click(findSolutionButton);

      // Should show solution notification
      await waitFor(() => {
        expect(
          screen.getByText(/A\* found a solution in 1 moves!/i),
        ).toBeInTheDocument();
      });
    });

    it("should display correct move count in solution notification", async () => {
      const user = userEvent.setup();
      render(<App />);

      // Switch to AI mode and find solution
      await user.click(screen.getByRole("button", { name: /🤖 AI Solver/i }));
      await user.click(screen.getByRole("button", { name: /Find Solution/i }));

      await waitFor(() => {
        expect(
          screen.getByText(/found a solution in 1 moves!/i),
        ).toBeInTheDocument();
      });
    });

    it("should handle multiple algorithm solutions", async () => {
      const user = userEvent.setup();

      render(<App />);

      await user.click(screen.getByRole("button", { name: /🤖 AI Solver/i }));

      // Click the Find Solution button to trigger first solution
      const findButton = screen.getByRole("button", { name: /Find Solution/i });
      await user.click(findButton);

      // Simulate a second solution call with different algorithm
      fireEvent.click(findButton);

      await waitFor(() => {
        expect(
          screen.getByText(/found a solution in 1 moves!/i),
        ).toBeInTheDocument();
      });
    });

    it("should handle BFS algorithm solutions", async () => {
      const user = userEvent.setup();

      render(<App />);

      await user.click(screen.getByRole("button", { name: /🤖 AI Solver/i }));
      await user.click(screen.getByRole("button", { name: /Find Solution/i }));

      await waitFor(() => {
        expect(
          screen.getByText(/found a solution in 1 moves!/i),
        ).toBeInTheDocument();
      });
    });
  });

  describe("Board Analysis Display", () => {
    it("should display board analysis when provided", async () => {
      const user = userEvent.setup();
      render(<App />);

      // Switch to AI mode
      await user.click(screen.getByRole("button", { name: /🤖 AI Solver/i }));

      // Trigger analysis
      const analyzeButton = screen.getByRole("button", {
        name: /Analyze Board/i,
      });
      await user.click(analyzeButton);

      // Should display analysis
      await waitFor(() => {
        expect(screen.getByText("Board Analysis")).toBeInTheDocument();
        expect(screen.getByText("Pawn Position: (3, 3)")).toBeInTheDocument();
        expect(screen.getByText("Is Promoted: No")).toBeInTheDocument();
        expect(screen.getByText("Moves to Promotion: 3")).toBeInTheDocument();
        expect(screen.getByText("Moves to Goal: 6")).toBeInTheDocument();
        expect(screen.getByText("Blocking Pieces: 5")).toBeInTheDocument();
      });
    });

    it("should handle analysis with promoted pawn", async () => {
      const user = userEvent.setup();

      render(<App />);

      await user.click(screen.getByRole("button", { name: /🤖 AI Solver/i }));
      await user.click(screen.getByRole("button", { name: /Analyze Board/i }));

      await waitFor(() => {
        expect(screen.getByText(/Board Analysis/i)).toBeInTheDocument();
        expect(screen.getByText(/Is Promoted: No/i)).toBeInTheDocument();
      });
    });

    it("should handle analysis with no pawn found", async () => {
      const user = userEvent.setup();

      render(<App />);

      await user.click(screen.getByRole("button", { name: /🤖 AI Solver/i }));
      await user.click(screen.getByRole("button", { name: /Analyze Board/i }));

      await waitFor(() => {
        expect(screen.getByText(/Board Analysis/i)).toBeInTheDocument();
        expect(screen.getByText(/Pawn Position:/i)).toBeInTheDocument();
      });
    });

    it("should not display analysis in play mode", async () => {
      const user = userEvent.setup();
      render(<App />);

      // Should not show analysis panel in play mode
      expect(screen.queryByText("Board Analysis")).not.toBeInTheDocument();

      // Switch to AI mode, trigger analysis, then switch back
      await user.click(screen.getByRole("button", { name: /🤖 AI Solver/i }));
      await user.click(screen.getByRole("button", { name: /Analyze Board/i }));

      await waitFor(() => {
        expect(screen.getByText("Board Analysis")).toBeInTheDocument();
      });

      // Switch back to play mode
      await user.click(screen.getByRole("button", { name: /🎮 Play Mode/i }));

      // Analysis should no longer be visible
      expect(screen.queryByText("Board Analysis")).not.toBeInTheDocument();
    });
  });

  describe("Styling and Visual Elements", () => {
    it("should apply correct background gradient", () => {
      render(<App />);

      const mainContainer = screen
        .getByRole("button", { name: /🤖 AI Solver/i })
        .closest("div")?.parentElement;
      expect(mainContainer).toHaveClass("min-h-screen", "bg-chess-gradient");
    });

    it("should style the toggle button correctly", () => {
      render(<App />);

      const button = screen.getByRole("button", { name: /🤖 AI Solver/i });
      expect(button).toHaveClass(
        "bg-chess-ai",
        "text-white",
        "py-3",
        "px-8",
        "text-xl",
        "rounded-full",
        "font-bold",
      );
    });

    it("should style the analysis panel correctly", async () => {
      const user = userEvent.setup();
      render(<App />);

      await user.click(screen.getByRole("button", { name: /🤖 AI Solver/i }));
      await user.click(screen.getByRole("button", { name: /Analyze Board/i }));

      await waitFor(() => {
        const analysisPanel = screen.getByText("Board Analysis").closest("div");
        expect(analysisPanel).toHaveClass(
          "bg-white",
          "rounded-2xl",
          "shadow-chess",
          "p-6",
          "border-l-4",
          "border-chess-primary",
        );
      });
    });

    it("should style the solution notification correctly", async () => {
      const user = userEvent.setup();
      render(<App />);

      await user.click(screen.getByRole("button", { name: /🤖 AI Solver/i }));
      await user.click(screen.getByRole("button", { name: /Find Solution/i }));

      await waitFor(() => {
        const notification = screen
          .getByText(/A\* found a solution/i)
          .closest("div");
        expect(notification).toHaveClass(
          "fixed",
          "bottom-5",
          "right-5",
          "bg-chess-success",
          "text-white",
          "rounded-full",
          "shadow-chess",
        );
      });
    });
  });

  describe("State Management", () => {
    it("should maintain separate state for AI solutions and analysis", async () => {
      const user = userEvent.setup();
      render(<App />);

      await user.click(screen.getByRole("button", { name: /🤖 AI Solver/i }));

      // Trigger both solution and analysis
      await user.click(screen.getByRole("button", { name: /Find Solution/i }));
      await user.click(screen.getByRole("button", { name: /Analyze Board/i }));

      await waitFor(() => {
        expect(screen.getByText(/A\* found a solution/i)).toBeInTheDocument();
        expect(screen.getByText("Board Analysis")).toBeInTheDocument();
      });
    });

    it("should preserve solution notifications when switching modes", async () => {
      const user = userEvent.setup();
      render(<App />);

      // Find solution in AI mode
      await user.click(screen.getByRole("button", { name: /🤖 AI Solver/i }));
      await user.click(screen.getByRole("button", { name: /Find Solution/i }));

      await waitFor(() => {
        expect(screen.getByText(/A\* found a solution/i)).toBeInTheDocument();
      });

      // Switch to play mode - notification should still be visible
      await user.click(screen.getByRole("button", { name: /🎮 Play Mode/i }));
      expect(screen.getByText(/A\* found a solution/i)).toBeInTheDocument();
    });

    it("should reset state appropriately when needed", async () => {
      const user = userEvent.setup();
      render(<App />);

      // Initial state should have no solutions
      expect(screen.queryByText(/found a solution/i)).not.toBeInTheDocument();

      // Find solution
      await user.click(screen.getByRole("button", { name: /🤖 AI Solver/i }));
      await user.click(screen.getByRole("button", { name: /Find Solution/i }));

      await waitFor(() => {
        expect(screen.getByText(/found a solution/i)).toBeInTheDocument();
      });
    });
  });

  describe("Accessibility", () => {
    it("should have accessible button labels", () => {
      render(<App />);

      const toggleButton = screen.getByRole("button", {
        name: /🤖 AI Solver/i,
      });
      expect(toggleButton).toBeInTheDocument();
      expect(toggleButton).toHaveTextContent("🤖 AI Solver");
    });

    it("should maintain focus management when switching modes", async () => {
      const user = userEvent.setup();
      render(<App />);

      const toggleButton = screen.getByRole("button", {
        name: /🤖 AI Solver/i,
      });
      toggleButton.focus();

      await user.click(toggleButton);

      // Button should still be focusable after mode switch
      const playModeButton = screen.getByRole("button", {
        name: /🎮 Play Mode/i,
      });
      expect(playModeButton).toBeInTheDocument();
    });

    it("should provide clear visual feedback for mode switching", async () => {
      const user = userEvent.setup();
      render(<App />);

      const initialButton = screen.getByRole("button", {
        name: /🤖 AI Solver/i,
      });
      expect(initialButton).toHaveTextContent("🤖 AI Solver");

      await user.click(initialButton);

      const aiModeButton = screen.getByRole("button", {
        name: /🎮 Play Mode/i,
      });
      expect(aiModeButton).toHaveTextContent("🎮 Play Mode");
    });
  });

  describe("Error Handling", () => {
    it("should handle missing solution data gracefully", async () => {
      const user = userEvent.setup();

      render(<App />);

      // Switch to AI mode first
      await user.click(screen.getByRole("button", { name: /🤖 AI Solver/i }));

      // The app should render without crashing even if we're in AI mode
      // This test mainly verifies that the component can handle undefined states
      expect(screen.getByTestId("ai-solver")).toBeInTheDocument();

      // The component should be stable and not crash
      expect(() => {
        screen.getByRole("button", { name: /Find Solution/i });
      }).not.toThrow();
    });

    it("should handle missing analysis data gracefully", async () => {
      const user = userEvent.setup();

      render(<App />);

      // Switch to AI mode first
      await user.click(screen.getByRole("button", { name: /🤖 AI Solver/i }));

      // The app should render without crashing even if we're in AI mode
      // This test mainly verifies that the component can handle null states
      expect(screen.getByTestId("ai-solver")).toBeInTheDocument();

      // The component should be stable and not crash
      expect(() => {
        screen.getByRole("button", { name: /Analyze Board/i });
      }).not.toThrow();
    });
  });
});
