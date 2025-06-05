import Game from "../models/Game";
import {
  GameState,
  GameResult,
  CompletedGame,
  StartAIGameRequest,
  StartAIGameResponse,
  AIGameState,
  PlayerMoveRequest,
  AIGameMoveResponse,
  AIMoveSuggestion,
} from "../interfaces/game.interface";
import { GameLogicService } from "./gameLogicService";
import { AIService } from "./aiService";
import { randomUUID } from "crypto";


export class GameService {
  private aiService: AIService;
  private activeGames: Record<string, AIGameState> = {};

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
    const games = await Game.find().sort({ createdAt: -1 }).limit(100).lean();

    return games.map((game) => ({
      _id: game._id.toString(),
      winner: game.winner,
      gridSize: game.gridSize,
      finalBoard: game.finalBoard,
      winningLine: game.winningLine,
      createdAt: game.createdAt,
    }));
  }

  async getAIMove(gameState: GameState): Promise<AIMoveSuggestion> {
    const validationResult = GameLogicService.validateGameState(gameState);
    if (validationResult !== true) {
      throw new Error(`Invalid game state: ${validationResult}`);
    }

    const evaluation = GameLogicService.evaluateGameState(gameState);
    if (evaluation.winner) {
      throw new Error(
        `Cannot get AI move: game is already over. Winner: ${evaluation.winner}`
      );
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
      winningLine: result.winningLine,
    });

    await game.save();
  }

  async startGameAgainstAI(
    request: StartAIGameRequest
  ): Promise<StartAIGameResponse> {
    const { playerSymbol: requestedPlayerSymbol, gridSize } = request;

    if (gridSize <= 0) {
      throw new Error('Invalid grid size');
    }

    const gameId = randomUUID();
    const humanSymbol = requestedPlayerSymbol || "X";
    const aiSymbol = humanSymbol === "X" ? "O" : "X";

    const initialPlayer = humanSymbol;

    const board = Array(gridSize)
      .fill(null)
      .map(() => Array(gridSize).fill(null));

    const newGame: AIGameState = {
      gameId,
      board,
      currentPlayer: initialPlayer,
      gridSize,
      humanSymbol,
      aiSymbol,
      status: "ongoing",
      winner: null,
    };

    this.activeGames[gameId] = newGame;

    return {
      gameId,
      board: newGame.board,
      currentPlayer: newGame.currentPlayer,
      aiSymbol: newGame.aiSymbol,
      gridSize: newGame.gridSize,
    };
  }

  async playerAIMove(
    gameId: string,
    move: PlayerMoveRequest
  ): Promise<AIGameMoveResponse> {
    const game = this.activeGames[gameId];
    if (!game) {
      throw new Error("Game not found");
    }

    if (game.status !== "ongoing") {
      return {
        board: game.board,
        currentPlayer: game.currentPlayer,
        status: game.status,
        winner: game.winner,
        aiSymbol: game.aiSymbol,
        gridSize: game.gridSize,
        message: "Game is already over.",
      };
    }

    if (game.currentPlayer !== game.humanSymbol) {
      throw new Error("Not player's turn.");
    }

    if (
      move.row < 0 ||
      move.row >= game.gridSize ||
      move.col < 0 ||
      move.col >= game.gridSize ||
      game.board[move.row][move.col] !== null
    ) {
      throw new Error("Invalid move.");
    }

    game.board[move.row][move.col] = game.humanSymbol;
    let gameStateForEval: GameState = {
      board: game.board,
      currentPlayer: game.humanSymbol,
      gridSize: game.gridSize,
    };
    let evaluation = GameLogicService.evaluateGameState(gameStateForEval);

    if (evaluation.winner) {
      game.status =
        evaluation.winner === game.humanSymbol
          ? "win"
          : evaluation.winner === "draw"
          ? "draw"
          : "loss";
      game.winner = evaluation.winner;
      this.activeGames[gameId] = game;
      if (game.winner) {
        await this.saveCompletedGame({
          winner: game.winner,
          winningLine: evaluation.winningLine,
          gameState: {
            board: game.board,
            currentPlayer: game.humanSymbol,
            gridSize: game.gridSize,
          },
        });
      }
      return {
        board: game.board,
        currentPlayer: game.currentPlayer,
        status: game.status,
        winner: game.winner,
        aiSymbol: game.aiSymbol,
        gridSize: game.gridSize,
      };
    }

    game.currentPlayer = game.aiSymbol;
    const aiGameState: GameState = {
      board: game.board,
      currentPlayer: game.aiSymbol,
      gridSize: game.gridSize,
    };
    const aiMoveSuggestion = await this.aiService.getAIMove(aiGameState);

    if (
      aiMoveSuggestion.move.row < 0 ||
      aiMoveSuggestion.move.row >= game.gridSize ||
      aiMoveSuggestion.move.col < 0 ||
      aiMoveSuggestion.move.col >= game.gridSize ||
      game.board[aiMoveSuggestion.move.row][aiMoveSuggestion.move.col] !== null
    ) {
      throw new Error('AI provided an invalid move');
    }

    game.board[aiMoveSuggestion.move.row][aiMoveSuggestion.move.col] =
      game.aiSymbol;
    gameStateForEval = {
      board: game.board,
      currentPlayer: game.aiSymbol,
      gridSize: game.gridSize,
    };
    evaluation = GameLogicService.evaluateGameState(gameStateForEval);

    if (evaluation.winner) {
      game.status =
        evaluation.winner === game.aiSymbol
          ? "loss"
          : evaluation.winner === "draw"
          ? "draw"
          : "win";
      game.winner = evaluation.winner;
    } else {
      game.status = "ongoing";
    }

    game.currentPlayer = game.humanSymbol;
    this.activeGames[gameId] = game;

    if (game.winner) {
      await this.saveCompletedGame({
        winner: game.winner,
        winningLine: evaluation.winningLine,
        gameState: {
          board: game.board,
          currentPlayer: game.aiSymbol,
          gridSize: game.gridSize,
        },
      });
    }

    return {
      board: game.board,
      currentPlayer: game.currentPlayer,
      status: game.status,
      winner: game.winner,
      aiSymbol: game.aiSymbol,
      gridSize: game.gridSize,
    };
  }
}
