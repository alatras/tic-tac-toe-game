import { AIService } from '../../src/services/aiService';
import { GameState } from '../../src/interfaces/game.interface';
import OpenAI from 'openai';

// Mock OpenAI
jest.mock('openai', () => {
  return jest.fn().mockImplementation(() => {
    return {
      chat: {
        completions: {
          create: jest.fn()
        }
      }
    };
  });
});

describe('AIService', () => {
  let aiService: AIService;
  let mockOpenAI: jest.Mocked<OpenAI>;

  beforeEach(() => {
    jest.clearAllMocks();
    aiService = new AIService();
    // @ts-ignore - accessing private property for testing
    mockOpenAI = aiService.openai as jest.Mocked<OpenAI>;
  });

  describe('getAIMove', () => {
    const gameState: GameState = {
      board: [
        [null, 'X', null],
        [null, 'O', null],
        [null, null, null]
      ],
      currentPlayer: 'O',
      gridSize: 3
    };

    it('should return a valid AI move when OpenAI returns a valid move', async () => {
      // Mock OpenAI response
      const mockMove = { row: 0, col: 0 };
      mockOpenAI.chat.completions.create = jest.fn().mockResolvedValue({
        choices: [{ message: { content: JSON.stringify(mockMove) } }]
      });

      const result = await aiService.getAIMove(gameState);
      
      expect(mockOpenAI.chat.completions.create).toHaveBeenCalled();
      expect(result).toEqual({ move: mockMove });
    });

    it('should fall back to random move when OpenAI returns an invalid move', async () => {
      // Mock OpenAI response with invalid move (already occupied cell)
      const invalidMove = { row: 0, col: 1 }; // This cell already has 'X'
      mockOpenAI.chat.completions.create = jest.fn().mockResolvedValue({
        choices: [{ message: { content: JSON.stringify(invalidMove) } }]
      });

      const result = await aiService.getAIMove(gameState);
      
      expect(mockOpenAI.chat.completions.create).toHaveBeenCalled();
      expect(result.move).toBeDefined();
      expect(result.move).not.toEqual(invalidMove);
      
      // Verify the returned move is valid
      const { row, col } = result.move;
      expect(gameState.board[row][col]).toBeNull();
    });

    it('should fall back to random move when OpenAI throws an error', async () => {
      // Mock OpenAI error
      mockOpenAI.chat.completions.create = jest.fn().mockRejectedValue(new Error('API error'));

      const result = await aiService.getAIMove(gameState);
      
      expect(mockOpenAI.chat.completions.create).toHaveBeenCalled();
      expect(result.move).toBeDefined();
      
      // Verify the returned move is valid
      const { row, col } = result.move;
      expect(gameState.board[row][col]).toBeNull();
    });

    it('should fall back to random move when OpenAI returns null content', async () => {
      // Mock OpenAI response with null content
      mockOpenAI.chat.completions.create = jest.fn().mockResolvedValue({
        choices: [{ message: { content: null } }]
      });

      const result = await aiService.getAIMove(gameState);
      
      expect(mockOpenAI.chat.completions.create).toHaveBeenCalled();
      expect(result.move).toBeDefined();
      
      // Verify the returned move is valid
      const { row, col } = result.move;
      expect(gameState.board[row][col]).toBeNull();
    });

    it('should fall back to random move when OpenAI returns invalid JSON', async () => {
      // Mock OpenAI response with invalid JSON
      mockOpenAI.chat.completions.create = jest.fn().mockResolvedValue({
        choices: [{ message: { content: 'not json' } }]
      });

      const result = await aiService.getAIMove(gameState);
      
      expect(mockOpenAI.chat.completions.create).toHaveBeenCalled();
      expect(result.move).toBeDefined();
      
      // Verify the returned move is valid
      const { row, col } = result.move;
      expect(gameState.board[row][col]).toBeNull();
    });
  });

  describe('getRandomValidMove', () => {
    it('should return a valid random move when empty cells exist', () => {
      const gameState: GameState = {
        board: [
          ['X', 'O', 'X'],
          ['O', null, 'X'],
          ['O', 'X', 'O']
        ],
        currentPlayer: 'X',
        gridSize: 3
      };

      // @ts-ignore - accessing private method for testing
      const move = aiService.getRandomValidMove(gameState);
      
      expect(move).toEqual({ row: 1, col: 1 }); // The only empty cell
    });

    it('should throw an error when no valid moves are available', () => {
      const gameState: GameState = {
        board: [
          ['X', 'O', 'X'],
          ['O', 'X', 'O'],
          ['O', 'X', 'O']
        ],
        currentPlayer: 'X',
        gridSize: 3
      };

      // @ts-ignore - accessing private method for testing
      expect(() => aiService.getRandomValidMove(gameState)).toThrow('No valid moves available');
    });
  });
});
