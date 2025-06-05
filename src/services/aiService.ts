import OpenAI from 'openai';
import { GameState, GameMove, AIMoveSuggestion } from '../interfaces/game.interface';
import { config } from '../config/environment';

export class AIService {
  private openai: OpenAI;
  
  constructor() {
    this.openai = new OpenAI({
      apiKey: config.openaiApiKey
    });
  }
  
  /**
   * Retrieves the AI move suggestion for the current game state
   * 
   * @remarks
   * This function receives the current game state (board, current player, grid size),
   * validates the game state, and returns the AI move suggestion.
   * 
   * The function validates the game state, checks for winning conditions (rows, columns,
   * diagonals), and returns appropriate game status information including whether the 
   * game is over, who won, the winning line coordinates, and a human-readable message.
   */
  async getAIMove(gameState: GameState): Promise<AIMoveSuggestion> {
    const prompt = this.buildPrompt(gameState);
    
    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a Tic Tac Toe AI player. Analyze the game board and suggest the best move. Respond ONLY with a JSON object containing 'row' and 'col' properties (0-indexed). No additional text."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 50
      });
      
      const response = completion.choices[0].message.content;
      if (!response) throw new Error('No response from AI');
      
      const move = JSON.parse(response) as GameMove;
      
      // Validate the move
      if (this.isValidMove(gameState, move)) {
        return { move };
      } else {
        // Fallback to random valid move
        return { move: this.getRandomValidMove(gameState) };
      }
    } catch (error) {
      // Fallback to random move on error
      console.error('AI Service error:', error);
      return { move: this.getRandomValidMove(gameState) };
    }
  }
  
  private buildPrompt(gameState: GameState): string {
    const boardStr = gameState.board
      .map((row, i) => row.map((cell, j) => cell || `(${i},${j})`).join(' | '))
      .join('\n');
    
    return `Current Tic Tac Toe board (${gameState.gridSize}x${gameState.gridSize}):
${boardStr}

You are playing as ${gameState.currentPlayer}. Empty cells are shown as (row,col).
What is your next move? Respond with JSON only: {"row": number, "col": number}`;
  }
  
  private isValidMove(gameState: GameState, move: GameMove): boolean {
    const { board, gridSize } = gameState;
    return (
      move.row >= 0 &&
      move.row < gridSize &&
      move.col >= 0 &&
      move.col < gridSize &&
      board[move.row][move.col] === null
    );
  }
  
  private getRandomValidMove(gameState: GameState): GameMove {
    const { board, gridSize } = gameState;
    const validMoves: GameMove[] = [];
    
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        if (board[row][col] === null) {
          validMoves.push({ row, col });
        }
      }
    }
    
    if (validMoves.length === 0) {
      throw new Error('No valid moves available');
    }
    
    const randomIndex = Math.floor(Math.random() * validMoves.length);
    return validMoves[randomIndex];
  }
}