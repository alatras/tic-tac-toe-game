export type CellValue = 'X' | 'O' | null;
export type Player = 'X' | 'O';

export interface GameState {
  board: CellValue[][];
  currentPlayer: Player;
  gridSize: number;
}

export interface Position {
  row: number;
  col: number;
}

export interface EvaluateGameResponse {
  isGameOver: boolean;
  winner: Player | 'draw' | null;
  winningLine?: Position[];
  message: string;
}

export interface AIMove {
  move: Position;
}

export interface GameStartRequest {
  mode: 'ai';
  playerSymbol: Player;
  gridSize: number;
}

export interface GameStartResponse {
  gameId: string;
  board: CellValue[][];
  currentPlayer: Player;
  aiSymbol: Player;
  gridSize: number;
}

export interface PlayerMoveRequest {
  row: number;
  col: number;
}

export interface PlayerMoveResponse {
  board: CellValue[][];
  currentPlayer: Player;
  status: 'ongoing' | 'win' | 'loss' | 'draw';
  winner: Player | 'draw' | null;
  aiSymbol: Player;
  gridSize: number;
}
