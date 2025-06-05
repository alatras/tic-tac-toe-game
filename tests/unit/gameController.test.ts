import { GameController } from '../../src/controllers/gameController';
import { GameService } from '../../src/services/gameService';
import { Request, Response, NextFunction } from 'express';
import { EvaluateGameRequest, StartAIGameRequest, PlayerMoveRequest } from '../../src/interfaces/game.interface';

// Mock GameService
jest.mock('../../src/services/gameService');

describe('GameController', () => {
  let gameController: GameController;
  let mockReq: any;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;
  let mockGameService: jest.Mocked<GameService>;

  beforeEach(() => {
    mockGameService = new GameService() as jest.Mocked<GameService>;
    (GameService as jest.Mock).mockImplementation(() => mockGameService);
    
    gameController = new GameController();
    
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
  });

  describe('evaluateGame', () => {
    it('should evaluate game and return result', async () => {
      mockReq = {
        body: {
          gameState: {
            board: [['X', 'X', 'X'], ['O', 'O', null], [null, null, null]],
            currentPlayer: 'O',
            gridSize: 3
          }
        }
      } as Request<{}, {}, EvaluateGameRequest>;

      mockGameService.evaluateGame.mockResolvedValue({
        winner: 'X',
        winningLine: [{ row: 0, col: 0 }, { row: 0, col: 1 }, { row: 0, col: 2 }],
        gameState: mockReq.body.gameState
      });

      await gameController.evaluateGame(mockReq, mockRes as Response, mockNext);

      expect(mockGameService.evaluateGame).toHaveBeenCalledWith(mockReq.body.gameState);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        isGameOver: true,
        winner: 'X',
        winningLine: [{ row: 0, col: 0 }, { row: 0, col: 1 }, { row: 0, col: 2 }],
        message: 'Player X wins!'
      });
    });

    it('should handle errors', async () => {
      mockReq = {
        body: {
          gameState: {
            board: [['X', 'X', 'X'], ['O', 'O', null], [null, null, null]],
            currentPlayer: 'O',
            gridSize: 3
          }
        }
      } as Request<{}, {}, EvaluateGameRequest>;

      const error = new Error('Test error');
      mockGameService.evaluateGame.mockRejectedValue(error);

      await gameController.evaluateGame(mockReq, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('getCompletedGames', () => {
    it('should return completed games', async () => {
      const mockGames = [
        {
          _id: '123',
          winner: 'X' as 'X',
          gridSize: 3,
          finalBoard: [['X', 'X', 'X'], ['O', 'O', null], [null, null, null]],
          winningLine: [{ row: 0, col: 0 }, { row: 0, col: 1 }, { row: 0, col: 2 }],
          createdAt: new Date()
        }
      ];

      mockGameService.getCompletedGames.mockResolvedValue(mockGames);

      await gameController.getCompletedGames({} as Request, mockRes as Response, mockNext);

      expect(mockGameService.getCompletedGames).toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ games: mockGames });
    });

    it('should handle errors', async () => {
      const error = new Error('Test error');
      mockGameService.getCompletedGames.mockRejectedValue(error);

      await gameController.getCompletedGames({} as Request, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('getAIMove', () => {
    it('should return AI move', async () => {
      mockReq = {
        body: {
          gameState: {
            board: [[null, null, null], [null, 'X', null], [null, null, null]],
            currentPlayer: 'O',
            gridSize: 3
          }
        }
      };

      const aiMove = { move: { row: 0, col: 0 } };
      mockGameService.getAIMove.mockResolvedValue(aiMove);

      await gameController.getAIMove(mockReq, mockRes as Response, mockNext);

      expect(mockGameService.getAIMove).toHaveBeenCalledWith(mockReq.body.gameState);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(aiMove);
    });

    it('should handle invalid game state error', async () => {
      mockReq = {
        body: {
          gameState: {
            board: [[null, null, null], [null, 'X', null], [null, null, null]],
            currentPlayer: 'O',
            gridSize: 3
          }
        }
      };

      const error = new Error('Invalid game state: test error');
      mockGameService.getAIMove.mockRejectedValue(error);

      await gameController.getAIMove(mockReq, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ message: error.message });
    });

    it('should handle game over error', async () => {
      mockReq = {
        body: {
          gameState: {
            board: [['X', 'X', 'X'], ['O', 'O', null], [null, null, null]],
            currentPlayer: 'O',
            gridSize: 3
          }
        }
      };

      const error = new Error('Cannot get AI move: game is already over. Winner: X');
      mockGameService.getAIMove.mockRejectedValue(error);

      await gameController.getAIMove(mockReq, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ message: error.message });
    });

    it('should handle other errors', async () => {
      mockReq = {
        body: {
          gameState: {
            board: [[null, null, null], [null, 'X', null], [null, null, null]],
            currentPlayer: 'O',
            gridSize: 3
          }
        }
      };

      const error = new Error('Other error');
      mockGameService.getAIMove.mockRejectedValue(error);

      await gameController.getAIMove(mockReq, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('startGameAgainstAI', () => {
    it('should start a new game against AI', async () => {
      mockReq = {
        body: {
          mode: 'easy',
          playerSymbol: 'X',
          gridSize: 3
        }
      } as any;

      const gameResponse = {
        gameId: '123',
        board: [[null, null, null], [null, null, null], [null, null, null]],
        currentPlayer: 'X' as 'X' | 'O',
        aiSymbol: 'O' as 'X' | 'O',
        gridSize: 3
      };
      mockGameService.startGameAgainstAI.mockResolvedValue(gameResponse);

      await gameController.startGameAgainstAI(mockReq, mockRes as Response, mockNext);

      expect(mockGameService.startGameAgainstAI).toHaveBeenCalledWith(mockReq.body);
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(gameResponse);
    });

    it('should handle invalid input error', async () => {
      mockReq = {
        body: {
          mode: 'invalid' as any,
          playerSymbol: 'X',
          gridSize: 3
        }
      } as Request<{}, {}, StartAIGameRequest>;

      const error = new Error('Invalid input: mode must be easy, medium, or hard');
      mockGameService.startGameAgainstAI.mockRejectedValue(error);

      await gameController.startGameAgainstAI(mockReq as any, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ message: error.message });
    });

    it('should handle other errors', async () => {
      mockReq = {
        body: {
          mode: 'easy',
          playerSymbol: 'X',
          gridSize: 3
        }
      };

      const error = new Error('Other error');
      mockGameService.startGameAgainstAI.mockRejectedValue(error);

      await gameController.startGameAgainstAI(mockReq as any, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('playerAIMove', () => {
    it('should process player move and return updated game state', async () => {
      mockReq = {
        params: {
          gameId: '123'
        },
        body: {
          row: 0,
          col: 0
        }
      } as Request<{ gameId: string }, {}, PlayerMoveRequest>;

      const gameResponse = {
        board: [['X', null, null], [null, null, null], [null, null, null]],
        currentPlayer: 'O' as 'X' | 'O',
        status: 'ongoing' as 'ongoing' | 'win' | 'loss' | 'draw',
        winner: null,
        aiSymbol: 'O' as 'X' | 'O',
        gridSize: 3
      };
      mockGameService.playerAIMove.mockResolvedValue(gameResponse);

      await gameController.playerAIMove(mockReq, mockRes as Response, mockNext);

      expect(mockGameService.playerAIMove).toHaveBeenCalledWith('123', { row: 0, col: 0 });
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(gameResponse);
    });

    it('should handle game not found error', async () => {
      mockReq = {
        params: {
          gameId: 'invalid'
        },
        body: {
          row: 0,
          col: 0
        }
      } as Request<{ gameId: string }, {}, PlayerMoveRequest>;

      const error = new Error('Game not found');
      mockGameService.playerAIMove.mockRejectedValue(error);

      await gameController.playerAIMove(mockReq as any, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ message: error.message });
    });

    it('should handle invalid move error', async () => {
      mockReq = {
        params: {
          gameId: '123'
        },
        body: {
          row: 0,
          col: 0
        }
      };

      const error = new Error('Invalid move.');
      mockGameService.playerAIMove.mockRejectedValue(error);

      await gameController.playerAIMove(mockReq as any, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ message: error.message });
    });

    it('should handle not player\'s turn error', async () => {
      mockReq = {
        params: {
          gameId: '123'
        },
        body: {
          row: 0,
          col: 0
        }
      };

      const error = new Error('Not player\'s turn.');
      mockGameService.playerAIMove.mockRejectedValue(error);

      await gameController.playerAIMove(mockReq as any, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ message: error.message });
    });

    it('should handle other errors', async () => {
      mockReq = {
        params: {
          gameId: '123'
        },
        body: {
          row: 0,
          col: 0
        }
      };

      const error = new Error('Other error');
      mockGameService.playerAIMove.mockRejectedValue(error);

      await gameController.playerAIMove(mockReq as any, mockRes as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});
