import { GameLogicService } from '../../src/services/gameLogicService';
import { GameState } from '../../src/interfaces/game.interface';

describe('GameLogicService', () => {
  describe('evaluateGameState', () => {
    it('should detect horizontal win', () => {
      const gameState: GameState = {
        board: [
          ['X', 'X', 'X'],
          ['O', 'O', null],
          [null, null, null]
        ],
        currentPlayer: 'O',
        gridSize: 3
      };
      
      const result = GameLogicService.evaluateGameState(gameState);
      expect(result.winner).toBe('X');
      expect(result.winningLine).toEqual([
        { row: 0, col: 0 },
        { row: 0, col: 1 },
        { row: 0, col: 2 }
      ]);
    });
    
    it('should detect vertical win', () => {
      const gameState: GameState = {
        board: [
          ['O', 'X', null],
          ['O', 'X', null],
          ['O', null, null]
        ],
        currentPlayer: 'X',
        gridSize: 3
      };
      
      const result = GameLogicService.evaluateGameState(gameState);
      expect(result.winner).toBe('O');
      expect(result.winningLine).toEqual([
        { row: 0, col: 0 },
        { row: 1, col: 0 },
        { row: 2, col: 0 }
      ]);
    });
    
    it('should detect diagonal win', () => {
      const gameState: GameState = {
        board: [
          ['X', 'O', null],
          ['O', 'X', null],
          ['O', null, 'X']
        ],
        currentPlayer: 'O',
        gridSize: 3
      };
      
      const result = GameLogicService.evaluateGameState(gameState);
      expect(result.winner).toBe('X');
      expect(result.winningLine).toEqual([
        { row: 0, col: 0 },
        { row: 1, col: 1 },
        { row: 2, col: 2 }
      ]);
    });
    
    it('should detect draw', () => {
      const gameState: GameState = {
        board: [
          ['X', 'O', 'X'],
          ['X', 'O', 'O'],
          ['O', 'X', 'X']
        ],
        currentPlayer: 'O',
        gridSize: 3
      };
      
      const result = GameLogicService.evaluateGameState(gameState);
      expect(result.winner).toBe('draw');
      expect(result.winningLine).toBeUndefined();
    });
    
    it('should handle 4x4 grid', () => {
      const gameState: GameState = {
        board: [
          ['X', 'X', 'X', 'X'],
          ['O', 'O', 'O', null],
          [null, null, null, null],
          [null, null, null, null]
        ],
        currentPlayer: 'O',
        gridSize: 4
      };
      
      const result = GameLogicService.evaluateGameState(gameState);
      expect(result.winner).toBe('X');
    });
  });
  
  describe('validateGameState', () => {
    it('should validate correct game state', () => {
      const gameState: GameState = {
        board: [
          ['X', null, null],
          [null, 'O', null],
          [null, null, null]
        ],
        currentPlayer: 'X',
        gridSize: 3
      };
      
      expect(GameLogicService.validateGameState(gameState)).toBe(true);
    });
    
    it('should reject invalid grid size', () => {
      const gameState: GameState = {
        board: [['X']],
        currentPlayer: 'X',
        gridSize: 1
      };
      
      expect(GameLogicService.validateGameState(gameState)).toBe("gridSize must be between 3 and 10");
    });
    
    it('should reject mismatched board size', () => {
      const gameState: GameState = {
        board: [
          ['X', null],
          [null, 'O']
        ],
        currentPlayer: 'X',
        gridSize: 3
      };
      
      expect(GameLogicService.validateGameState(gameState)).toBe("board must have exactly 3 rows (found 2)");
    });
  });
});