import Game from '../models/Game';
import { GameState, GameResult, CompletedGame } from '../interfaces/game.interface';
import { GameLogicService } from './gameLogicService';
import { AIService } from './aiService';

export class GameService {
  private aiService: AIService;
  
  constructor() {
    this.aiService = new AIService();
  }
  
  async evaluateGame(gameState: GameState): Promise<GameResult> {
    // Validate game state
    if (!GameLogicService.validateGameState(gameState)) {
      throw new Error('Invalid game state');
    }
    
    // Evaluate the game
    const result = GameLogicService.evaluateGameState(gameState);
    
    // If game is over, save to database
    if (result.winner) {
      await this.saveCompletedGame(result);
    }
    
    return result;
  }
  
  async getCompletedGames(): Promise<CompletedGame[]> {
    const games = await Game.find()
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();
    
    return games.map(game => ({
      _id: game._id.toString(),
      winner: game.winner,
      gridSize: game.gridSize,
      finalBoard: game.finalBoard,
      winningLine: game.winningLine,
      createdAt: game.createdAt
    }));
  }
  
  async getAIMove(gameState: GameState) {
    if (!GameLogicService.validateGameState(gameState)) {
      throw new Error('Invalid game state');
    }
    
    return this.aiService.getAIMove(gameState);
  }
  
  private async saveCompletedGame(result: GameResult): Promise<void> {
    if (!result.winner) return;
    
    const game = new Game({
      winner: result.winner,
      gridSize: result.gameState.gridSize,
      finalBoard: result.gameState.board,
      winningLine: result.winningLine
    });
    
    await game.save();
  }
}