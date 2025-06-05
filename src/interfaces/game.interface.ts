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

export interface StartAIGameRequest {
  mode: 'ai'; // To differentiate from other potential game modes in the future
  playerSymbol?: 'X' | 'O';
  gridSize: number;
}

export interface StartAIGameResponse {
  gameId: string;
  board: (string | null)[][];
  currentPlayer: 'X' | 'O';
  aiSymbol: 'X' | 'O';
  gridSize: number;
}

export interface AIGameState extends GameState {
  gameId: string;
  humanSymbol: 'X' | 'O';
  aiSymbol: 'X' | 'O';
  status: 'ongoing' | 'win' | 'loss' | 'draw';
  winner?: 'X' | 'O' | 'draw' | null;
}

export interface PlayerMoveRequest extends GameMove {
  // Inherits row and col from GameMove
}

export interface AIGameMoveResponse {
  board: (string | null)[][];
  currentPlayer: 'X' | 'O'; // Who should make the next move
  status: 'ongoing' | 'win' | 'loss' | 'draw';
  winner?: 'X' | 'O' | 'draw' | null;
  aiSymbol: 'X' | 'O';
  gridSize: number;
  message?: string;
}