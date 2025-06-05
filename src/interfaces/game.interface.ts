export interface GameState {
  board: (string | null)[][];
  currentPlayer: 'X' | 'O';
  gridSize: number;
}

export interface GameMove {
  row: number;
  col: number;
}

export interface GameResult {
  winner: 'X' | 'O' | 'draw' | null;
  winningLine?: GameMove[];
  gameState: GameState;
}

export interface CompletedGame {
  _id: string;
  winner: 'X' | 'O' | 'draw';
  gridSize: number;
  finalBoard: (string | null)[][];
  winningLine?: GameMove[];
  createdAt: Date;
}

export interface EvaluateGameRequest {
  gameState: GameState;
}

export interface EvaluateGameResponse {
  isGameOver: boolean;
  winner?: 'X' | 'O' | 'draw';
  winningLine?: GameMove[];
  message: string;
}

export interface AIMoveSuggestion {
  move: GameMove;
  reasoning?: string;
}