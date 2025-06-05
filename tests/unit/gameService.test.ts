import { GameService } from '../../src/services/gameService';
import { GameState, StartAIGameRequest, PlayerMoveRequest } from '../../src/interfaces/game.interface';
import { Types } from 'mongoose';

// Mock the dependencies
jest.mock('../../src/services/aiService', () => {
  const mockGetAIMove = jest.fn();
  return {
    AIService: jest.fn().mockImplementation(() => ({
      getAIMove: mockGetAIMove
    })),
    mockGetAIMove // Export for test access
  };
});

jest.mock('../../src/models/Game', () => {
  const mockFind = jest.fn();
  const mockSave = jest.fn();
  const defaultExport = jest.fn().mockImplementation(() => ({
    save: mockSave
  }));
  Object.assign(defaultExport, { find: mockFind });
  return {
    __esModule: true,
    default: defaultExport,
    mockSave, // Export for test access
    mockFind // Export for test access
  };
});

describe('GameService', () => {
  let gameService: GameService;
  let mockGetAIMove: jest.Mock;
  let mockFind: jest.Mock;
  let mockSave: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    gameService = new GameService();
    // Get mock functions from the mocked modules
    mockGetAIMove = require('../../src/services/aiService').mockGetAIMove;
    const gameMocks = require('../../src/models/Game');
    mockFind = gameMocks.mockFind;
    mockSave = gameMocks.mockSave;
  });

  describe('evaluateGame', () => {
    it('should evaluate a valid game state', async () => {
      const gameState: GameState = {
        board: [
          ['X', 'O', 'X'],
          ['O', 'X', 'O'],
          ['X', null, null]
        ],
        currentPlayer: 'O',
        gridSize: 3
      };

      const result = await gameService.evaluateGame(gameState);
      expect(result).toBeDefined();
      expect(result.gameState).toEqual(gameState);
    });

    it('should throw error for invalid game state', async () => {
      const invalidGameState: GameState = {
        board: [
          ['X', 'O', 'X'],
          ['O', 'X', 'O'],
          ['X', 'Invalid', null] // Invalid symbol
        ],
        currentPlayer: 'O',
        gridSize: 3
      };

      await expect(gameService.evaluateGame(invalidGameState)).rejects.toThrow();
    });

    it('should save completed game when there is a winner', async () => {
      const gameState: GameState = {
        board: [
          ['X', 'X', 'X'],
          ['O', 'O', null],
          [null, null, null]
        ],
        currentPlayer: 'O',
        gridSize: 3
      };

      await gameService.evaluateGame(gameState);
      expect(mockSave).toHaveBeenCalled();
    });
  });

  describe('getCompletedGames', () => {
    it('should return list of completed games', async () => {
      const mockGames = [
        {
          _id: new Types.ObjectId(),
          winner: 'X',
          gridSize: 3,
          finalBoard: [['X', 'O', 'X'], ['O', 'X', 'O'], ['X', null, null]],
          winningLine: [[0, 0], [1, 1], [2, 2]],
          createdAt: new Date()
        }
      ];

      const mockSort = jest.fn().mockReturnThis();
      const mockLimit = jest.fn().mockReturnThis();
      const mockLean = jest.fn().mockResolvedValue(mockGames);

      mockFind.mockReturnValue({
        sort: mockSort,
        limit: mockLimit,
        lean: mockLean
      });

      const result = await gameService.getCompletedGames();
      expect(result).toHaveLength(1);
      expect(result[0].winner).toBe('X');
      expect(mockSort).toHaveBeenCalledWith({ createdAt: -1 });
      expect(mockLimit).toHaveBeenCalledWith(100);
      expect(mockLean).toHaveBeenCalled();
    });

    it('should handle database errors', async () => {
      mockFind.mockImplementation(() => {
        throw new Error('Database error');
      });

      await expect(gameService.getCompletedGames()).rejects.toThrow('Database error');
    });
  });

  describe('getAIMove', () => {
    it('should return AI move for valid game state', async () => {
      const gameState: GameState = {
        board: [
          ['X', null, null],
          [null, null, null],
          [null, null, null]
        ],
        currentPlayer: 'O',
        gridSize: 3
      };

      const expectedMove = { move: { row: 1, col: 1 } };
      mockGetAIMove.mockResolvedValue(expectedMove);

      const result = await gameService.getAIMove(gameState);
      expect(result).toEqual(expectedMove);
    });

    it('should throw error for completed game', async () => {
      const completedGameState: GameState = {
        board: [
          ['X', 'X', 'X'],
          ['O', 'O', null],
          [null, null, null]
        ],
        currentPlayer: 'O',
        gridSize: 3
      };

      await expect(gameService.getAIMove(completedGameState)).rejects.toThrow();
    });

    it('should handle AI service errors', async () => {
      const gameState: GameState = {
        board: [
          ['X', null, null],
          [null, null, null],
          [null, null, null]
        ],
        currentPlayer: 'O',
        gridSize: 3
      };

      mockGetAIMove.mockRejectedValue(new Error('AI service error'));
      await expect(gameService.getAIMove(gameState)).rejects.toThrow('AI service error');
    });
  });

  describe('startGameAgainstAI', () => {
    it('should start new game with default player symbol', async () => {
      const request: StartAIGameRequest = {
        mode: 'ai',
        gridSize: 3
      };

      const result = await gameService.startGameAgainstAI(request);
      expect(result.aiSymbol).toBe('O');
      expect(result.currentPlayer).toBe('X');
      expect(result.board).toHaveLength(3);
      expect(result.board[0]).toHaveLength(3);
    });

    it('should start new game with specified player symbol', async () => {
      const request: StartAIGameRequest = {
        mode: 'ai',
        gridSize: 3,
        playerSymbol: 'O'
      };

      const result = await gameService.startGameAgainstAI(request);
      expect(result.aiSymbol).toBe('X');
      expect(result.currentPlayer).toBe('O');
    });

    it('should throw error for invalid grid size', async () => {
      const request: StartAIGameRequest = {
        mode: 'ai',
        gridSize: 0 // Invalid size
      };

      await expect(gameService.startGameAgainstAI(request)).rejects.toThrow('Invalid grid size');
    });
  });

  describe('playerAIMove', () => {
    it('should process player move and return AI response', async () => {
      // Start a new game first
      const gameSetup = await gameService.startGameAgainstAI({ mode: 'ai', gridSize: 3 });
      
      const playerMove: PlayerMoveRequest = {
        row: 0,
        col: 0
      };

      // Mock the AI service to return a valid move
      mockGetAIMove.mockResolvedValue({
        move: { row: 1, col: 1 }
      });

      const result = await gameService.playerAIMove(gameSetup.gameId, playerMove);
      expect(result.board[0][0]).toBe('X');
      expect(result.board[1][1]).toBe('O');
    });

    it('should throw error for invalid game ID', async () => {
      const playerMove: PlayerMoveRequest = {
        row: 0,
        col: 0
      };

      await expect(gameService.playerAIMove('invalid-id', playerMove)).rejects.toThrow('Game not found');
    });

    it('should throw error for invalid move', async () => {
      const gameSetup = await gameService.startGameAgainstAI({ mode: 'ai', gridSize: 3 });
      
      const invalidMove: PlayerMoveRequest = {
        row: 3, // Out of bounds
        col: 0
      };

      await expect(gameService.playerAIMove(gameSetup.gameId, invalidMove)).rejects.toThrow('Invalid move');
    });

    it('should handle game completion after player move', async () => {
      const gameSetup = await gameService.startGameAgainstAI({ mode: 'ai', gridSize: 3 });
      
      // Set up a winning scenario
      const moves = [
        { row: 0, col: 0 }, // X
        { row: 1, col: 0 }, // X
        { row: 2, col: 0 }, // X (winning move)
      ];

      // Mock AI moves with valid positions
      mockGetAIMove
        .mockResolvedValueOnce({ move: { row: 0, col: 1 } })  // First AI move
        .mockResolvedValueOnce({ move: { row: 1, col: 1 } }); // Second AI move

      // Execute moves
      for (const move of moves) {
        const result = await gameService.playerAIMove(gameSetup.gameId, move);
        if (move === moves[moves.length - 1]) {
          expect(result.status).toBe('win');
          expect(result.winner).toBe('X');
        }
      }
    });

    it('should handle AI service errors during move', async () => {
      const gameSetup = await gameService.startGameAgainstAI({ mode: 'ai', gridSize: 3 });
      
      const playerMove: PlayerMoveRequest = {
        row: 0,
        col: 0
      };

      mockGetAIMove.mockRejectedValue(new Error('AI service error'));
      await expect(gameService.playerAIMove(gameSetup.gameId, playerMove)).rejects.toThrow('AI service error');
    });

    it('should handle invalid AI moves', async () => {
      const gameSetup = await gameService.startGameAgainstAI({ mode: 'ai', gridSize: 3 });
      
      const playerMove: PlayerMoveRequest = {
        row: 0,
        col: 0
      };

      // Mock AI to return an invalid move
      mockGetAIMove.mockResolvedValue({
        move: { row: -1, col: -1 }
      });

      await expect(gameService.playerAIMove(gameSetup.gameId, playerMove)).rejects.toThrow('AI provided an invalid move');
    });
  });
}); 