import { Request, Response, NextFunction } from 'express';
import { GameService } from '../services/gameService';
import { 
  EvaluateGameRequest,
  StartAIGameRequest,
  PlayerMoveRequest
} from '../interfaces/game.interface';

export class GameController {
  private gameService: GameService;
  
  constructor() {
    this.gameService = new GameService();
  }
  
  evaluateGame = async (
    req: Request<{}, {}, EvaluateGameRequest>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { gameState } = req.body;
      const result = await this.gameService.evaluateGame(gameState);
      
      const response = {
        isGameOver: result.winner !== null,
        winner: result.winner,
        winningLine: result.winningLine,
        message: this.getGameMessage(result.winner)
      };
      
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };
  
  getCompletedGames = async (
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const games = await this.gameService.getCompletedGames();
      res.status(200).json({ games });
    } catch (error) {
      next(error);
    }
  };
  
  getAIMove = async (
    req: Request<{}, {}, { gameState: any }>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { gameState } = req.body;
      const aiMove = await this.gameService.getAIMove(gameState);
      res.status(200).json(aiMove);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('Invalid game state') || 
            error.message.includes('game is already over')) {
          res.status(400).json({ message: error.message });
          return;
        }
      }
      next(error);
    }
  };
  
  startGameAgainstAI = async (
    req: Request<{}, {}, StartAIGameRequest>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { mode, playerSymbol, gridSize } = req.body;
      const game = await this.gameService.startGameAgainstAI({ mode, playerSymbol, gridSize });
      res.status(201).json(game);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("Invalid input")) {
            res.status(400).json({ message: error.message });
            return;
        }
      }
      next(error);
    }
  };
  
  playerAIMove = async (
    req: Request<{ gameId: string }, {}, PlayerMoveRequest>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { gameId } = req.params;
      const { row, col } = req.body;
      const result = await this.gameService.playerAIMove(gameId, { row, col });
      res.status(200).json(result);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Game not found') {
          res.status(404).json({ message: error.message });
          return;
        } else if (error.message === 'Invalid move.' || error.message === 'Not player\'s turn.') {
          res.status(400).json({ message: error.message });
          return;
        }
      }
      next(error);
    }
  };
  
  private getGameMessage(winner: 'X' | 'O' | 'draw' | null): string {
    switch (winner) {
      case 'X':
        return 'Player X wins!';
      case 'O':
        return 'Player O wins!';
      case 'draw':
        return 'The game is a draw!';
      default:
        return 'Game is still in progress';
    }
  }
}