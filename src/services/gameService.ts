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
    const validationResult = GameLogicService.validateGameState(gameState);
    if (validationResult !== true) {
      throw new Error(`Invalid game state: ${validationResult}`);
    }
    
    const result = GameLogicService.evaluateGameState(gameState);
    
    if (result.winner) {
      await this.saveCompletedGame(result);
    }
    
    return result;
  }
  
  /**
   * Retrieves the list of completed games from the database
   * 
   * @remarks
   * This function retrieves the list of completed games from the database,
   * sorted by creation date in descending order, and returns the first 100 games.
   * 
   * The function returns an array of completed game objects, each containing
   * the game ID, winner, grid size, final board, winning line, and creation date.
   */
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
    const validationResult = GameLogicService.validateGameState(gameState);
    if (validationResult !== true) {
      throw new Error(`Invalid game state: ${validationResult}`);
    }
    
    return this.aiService.getAIMove(gameState);
  }
  
  /**
   * Saves the completed game to the database
   * 
   * @remarks
   * This function receives the game result (winner, grid size, final board, winning line),
   * validates the game result, and saves the completed game to the database.
   * 
   * The function validates the game result, checks for winning conditions (rows, columns,
   * diagonals), and returns appropriate game status information including whether the 
   * game is over, who won, the winning line coordinates, and a human-readable message.
   */
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