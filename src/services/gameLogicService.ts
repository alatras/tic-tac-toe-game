import { GameState, GameResult, GameMove } from "../interfaces/game.interface";

export class GameLogicService {
  /**
   * Evaluates the current state of a Tic Tac Toe game
   *
   * @remarks
   * This function receives the current game state (board, current player, grid size),
   * evaluates if there is a winner or a draw, and returns the result.
   * If a winner is found, the completed game is saved to the database.
   *
   * The function validates the game state, checks for winning conditions (rows, columns,
   * diagonals), and returns appropriate game status information including whether the
   * game is over, who won, the winning line coordinates, and a human-readable message.
   */
  static evaluateGameState(gameState: GameState): GameResult {
    const { board, gridSize } = gameState;

    // Check rows
    for (let row = 0; row < gridSize; row++) {
      const winner = this.checkLine(board[row]);
      if (winner) {
        const winningLine: GameMove[] = [];
        for (let col = 0; col < gridSize; col++) {
          winningLine.push({ row, col });
        }
        return { winner, winningLine, gameState };
      }
    }

    // Check columns
    for (let col = 0; col < gridSize; col++) {
      const column = board.map((row) => row[col]);
      const winner = this.checkLine(column);
      if (winner) {
        const winningLine: GameMove[] = [];
        for (let row = 0; row < gridSize; row++) {
          winningLine.push({ row, col });
        }
        return { winner, winningLine, gameState };
      }
    }

    // Check main diagonal
    const mainDiagonal = [];
    for (let i = 0; i < gridSize; i++) {
      mainDiagonal.push(board[i][i]);
    }
    let winner = this.checkLine(mainDiagonal);
    if (winner) {
      const winningLine: GameMove[] = [];
      for (let i = 0; i < gridSize; i++) {
        winningLine.push({ row: i, col: i });
      }
      return { winner, winningLine, gameState };
    }

    // Check anti-diagonal
    const antiDiagonal = [];
    for (let i = 0; i < gridSize; i++) {
      antiDiagonal.push(board[i][gridSize - 1 - i]);
    }
    winner = this.checkLine(antiDiagonal);
    if (winner) {
      const winningLine: GameMove[] = [];
      for (let i = 0; i < gridSize; i++) {
        winningLine.push({ row: i, col: gridSize - 1 - i });
      }
      return { winner, winningLine, gameState };
    }

    // Check for draw
    const isDraw = board.every((row) => row.every((cell) => cell !== null));
    if (isDraw) {
      return { winner: "draw", gameState };
    }

    return { winner: null, gameState };
  }

  private static checkLine(line: (string | null)[]): "X" | "O" | null {
    if (line.every((cell) => cell === "X")) return "X";
    if (line.every((cell) => cell === "O")) return "O";
    return null;
  }

  static validateGameState(gameState: GameState): true | string {
    const { board, gridSize, currentPlayer } = gameState;

    if (!board || !Array.isArray(board)) {
      return "board must be a 2D array";
    }

    if (board.length !== gridSize) {
      return `board must have exactly ${gridSize} rows (found ${board.length})`;
    }

    if (!["X", "O"].includes(currentPlayer)) {
      return 'currentPlayer must be either "X" or "O"';
    }

    if (gridSize < 3 || gridSize > 10) {
      return "gridSize must be between 3 and 10";
    }

    for (let i = 0; i < board.length; i++) {
      const row = board[i];
      if (!Array.isArray(row)) {
        return `row at index ${i} must be an array`;
      }

      if (row.length !== gridSize) {
        return `row at index ${i} must have exactly ${gridSize} cells (found ${row.length})`;
      }

      for (let j = 0; j < row.length; j++) {
        const cell = row[j];
        if (cell !== null && cell !== "X" && cell !== "O") {
          return `invalid cell value at position [${i},${j}]: ${cell} (must be null, "X", or "O")`;
        }
      }
    }

    return true;
  }
}
