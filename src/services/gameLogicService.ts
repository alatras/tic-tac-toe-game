import { GameState, GameResult, GameMove } from '../interfaces/game.interface';

export class GameLogicService {
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
      const column = board.map(row => row[col]);
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
    const isDraw = board.every(row => row.every(cell => cell !== null));
    if (isDraw) {
      return { winner: 'draw', gameState };
    }
    
    return { winner: null, gameState };
  }
  
  private static checkLine(line: (string | null)[]): 'X' | 'O' | null {
    if (line.every(cell => cell === 'X')) return 'X';
    if (line.every(cell => cell === 'O')) return 'O';
    return null;
  }
  
  static validateGameState(gameState: GameState): boolean {
    const { board, gridSize, currentPlayer } = gameState;
    
    if (!board || !Array.isArray(board)) return false;
    if (board.length !== gridSize) return false;
    if (!['X', 'O'].includes(currentPlayer)) return false;
    if (gridSize < 3 || gridSize > 10) return false;
    
    for (const row of board) {
      if (!Array.isArray(row) || row.length !== gridSize) return false;
      for (const cell of row) {
        if (cell !== null && cell !== 'X' && cell !== 'O') return false;
      }
    }
    
    return true;
  }
}