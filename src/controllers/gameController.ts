import { Request, Response, NextFunction } from 'express';
import { GameService } from '../services/gameService';
import { EvaluateGameRequest } from '../interfaces/game.interface';

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