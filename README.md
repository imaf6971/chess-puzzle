# Chess Puzzle: Pawn to Goal

A unique chess puzzle game built with React, TypeScript, and modern Tailwind CSS 4 with CSS theme variables where you must navigate a pawn to the goal square on a custom board layout.

## 🎯 Objective

Move the pawn (♟) from the bottom-right corner to the goal square (🎯) in the bottom-left corner of the board. The pawn can ONLY move upward (proper chess rules) and promotes to a queen when reaching the top row. All pieces on the board belong to you and can be moved to clear paths. The challenge is to strategically reposition pieces to create a clear route for your pawn to reach the goal. **IMPORTANT: Only the original pawn (or its promoted queen) can win by reaching the goal square - other pieces cannot trigger victory!**

## 🎮 Game Features

- **Custom Board Layout**: A 4x4 chess board with a unique piece arrangement
- **Pawn Promotion**: When the pawn reaches the leftmost column, it automatically promotes to a queen (♛)
- **Interactive Gameplay**: Click to select pieces and move them
- **Visual Feedback**: Highlighted valid moves and selected pieces
- **Win Detection**: Automatic detection when you reach the goal
- **Reset Functionality**: Start over at any time

## 📋 Board Layout

```
Row 0: ♞ ♞ ♞ ♞  (Knights)
Row 1: ♝ ♝ ♝ ♝  (Bishops)
Row 2: ♜ ♜ ♜ ♜  (Rooks)
Row 3: 🎯 ❌ ❌ ♟  (Goal, Missing squares, Pawn)
```

- **♞ Knights**: Block movement in L-shaped patterns
- **♝ Bishops**: Block diagonal movement
- **♜ Rooks**: Block horizontal and vertical movement
- **♟ Pawn**: Your piece - can ONLY move UP (toward row 0)
- **🎯 Goal**: Your destination at bottom-left corner (3,0)
- **❌ Missing squares**: Cannot be occupied
- **Promotion**: Pawn becomes Queen (♛) when reaching any square in row 0

## 🎮 How to Play

1. **Select Any Piece**: Click on any piece to select it (all pieces belong to you)
2. **View Valid Moves**: Valid move squares will be highlighted in green
3. **Make a Move**: Click on any highlighted square to move the selected piece
4. **Move Pawn UP**: The pawn can ONLY move upward (proper chess rules)
5. **Clear the Path**: Move other pieces strategically to clear the pawn's upward path
6. **Promote to Queen**: When the pawn reaches the top row (row 0), it becomes a queen (♛)
7. **Reach the Goal**: Get your promoted queen to the goal square (🎯) at bottom-left to win!
8. **Win Condition**: ONLY the original pawn (or its promoted queen) can win the game!

## 🚀 Getting Started

### Prerequisites

- Node.js (version 18 or higher)
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd chess-puzzle
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The application uses Tailwind CSS 4 with CSS theme variables and the modern Vite plugin for styling, which provides instant CSS compilation and hot module reloading without any JavaScript configuration files.

4. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## 🛠️ Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Project Structure

```
chess-puzzle/
├── src/
│   ├── components/
│   │   ├── AISolver.tsx        # AI puzzle solver component
│   │   ├── ChessBoard.tsx      # Main board component
│   │   ├── ChessPuzzle.tsx     # Game logic wrapper
│   │   └── Square.tsx          # Individual square component
│   ├── types.ts                # TypeScript type definitions
│   ├── gameLogic.ts            # Core game mechanics
│   ├── aiSolver.ts             # AI solving algorithms
│   ├── App.tsx                 # Main app component
│   ├── index.css               # CSS theme variables and global styles
│   └── main.tsx                # App entry point
├── public/                     # Static assets
├── vite.config.ts              # Vite configuration with Tailwind plugin
├── package.json               # Dependencies and scripts
└── README.md                  # This file
```

## 🎨 Modern Styling with Tailwind CSS 4

The game features a completely modernized design system built with **Tailwind CSS 4** using CSS theme variables:

### Tailwind CSS 4 Features
- **CSS Theme Variables**: Uses `@theme` directive for defining design tokens in CSS
- **Zero JavaScript Config**: No `tailwind.config.js` file needed
- **Modern CSS**: Leverages CSS custom properties and native CSS features
- **Performance**: Optimized CSS generation with minimal bundle size
- **Developer Experience**: Hot module reloading and instant style updates

### Design System
- **CSS-Based Theming**: Chess-themed colors defined with `@theme` directive
- **Animation System**: Custom keyframes defined within `@theme` block
- **Auto-Generated Utilities**: Theme variables automatically create utility classes
- **Responsive Design**: Mobile-first approach with built-in breakpoint utilities
- **Native CSS Variables**: All theme variables available as CSS custom properties

### Visual Features
- **Interactive Elements**: Hover effects and smooth transitions
- **Chess Piece Animations**: Glowing effects for different piece types
- **Board Animations**: Pulsing goal squares and move indicators
- **State Feedback**: Visual feedback for selected pieces and valid moves
- **Accessibility**: Focus indicators and keyboard navigation support
- **Mobile Responsive**: Optimized for all device sizes

## 🧩 Game Mechanics

### Piece Movement Rules

- **Pawn**: Can ONLY move UP (toward row 0) - proper chess rules
- **Queen** (promoted pawn): Can move like both a rook and bishop
- **Knights**: Move in L-shapes (2 squares in one direction, 1 in perpendicular)
- **Bishops**: Move diagonally any number of squares
- **Rooks**: Move horizontally or vertically any number of squares
- **All Pieces**: Belong to the player and can be moved strategically
- **Missing Squares**: Cannot be occupied by any piece

### Special Features

- **Automatic Promotion**: Pawn becomes queen when reaching the top row (row 0)
- **Chess-Accurate Movement**: Pawn can only move forward (upward)
- **No Capturing**: Pieces cannot capture each other, they just block movement
- **Path Blocking**: Pieces prevent movement through their squares
- **Smart Move Validation**: Only valid moves are allowed
- **Strategic Repositioning**: Move any piece to clear paths for the pawn
- **Win Condition**: ONLY the original pawn (or its promoted queen) reaching the goal square completes the puzzle
- **No Alternative Victory**: Other pieces cannot win by reaching the goal square

## 🔧 Technical Details

### Built With

- **React 19.1.1** - Modern UI framework with latest features
- **TypeScript** - Type safety and enhanced development experience
- **Tailwind CSS 4** - Modern utility-first CSS framework with CSS theme variables
- **Vite** - Lightning-fast build tool with HMR
- **@tailwindcss/vite** - Official Tailwind CSS 4 Vite plugin
- **CSS Theme Variables** - Modern CSS-based theming with `@theme` directive

### Key Features

- **Modern Architecture**: Type-safe game logic with comprehensive TypeScript interfaces
- **State Management**: Immutable state management with React hooks
- **Performance**: Efficient re-rendering with React.memo and useCallback
- **CSS-Native Styling**: Utility-first CSS with Tailwind CSS 4 theme variables
- **Build System**: Modern Vite-powered development with instant HMR
- **AI Integration**: Built-in AI solver with A* and BFS algorithms
- **Error Handling**: Comprehensive validation and error management
- **Component Design**: Clean, modular component architecture

## 🎯 Game Strategy Tips

1. **Study the Board**: Analyze all piece positions and plan your strategy
2. **Navigate Around Missing Squares**: The missing squares at (3,1) and (3,2) block direct paths
3. **Clear the Upward Path**: Move blocking pieces out of the pawn's upward path
4. **Plan Multiple Moves**: Think ahead about the optimal sequence of moves
5. **Use All Pieces**: Remember you can move any piece to create space
6. **Focus on the Pawn**: Only the original pawn can win - other pieces are just helpers
7. **Get to Top Row**: First priority is getting the pawn to row 0 for promotion
8. **Navigate Back Down**: After promotion, use queen's enhanced movement to reach goal
9. **Remember Chess Rules**: Pawn can ONLY move forward (upward toward row 0)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

### Development Guidelines

1. Follow the existing code style and TypeScript patterns
2. Use Tailwind CSS utilities instead of custom CSS when possible
3. Add appropriate type definitions for new features
4. Test your changes thoroughly in different browsers
5. Ensure mobile responsiveness with Tailwind breakpoints
6. Update documentation as needed
7. Follow the established component and styling patterns

### Styling Guidelines

- Use Tailwind CSS utilities for all styling
- Define new theme variables in CSS using `@theme` directive
- Avoid inline styles and custom CSS files when possible
- Use the CSS theme variables for consistent design tokens
- Leverage auto-generated utilities from theme variables
- Maintain consistency with the CSS-based design system

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Chess piece Unicode symbols from the Unicode Standard
- Inspired by classic chess puzzles and tactical training
- Built with modern web technologies and Tailwind CSS 4 theme variables
- Tailwind CSS team for the excellent utility-first framework and CSS theme variables
- Vite team for the lightning-fast development experience

---

Enjoy solving the puzzle! 🎉