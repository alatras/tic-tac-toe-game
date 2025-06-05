import request from 'supertest';
import app from '../../src/app';
import Game from '../../src/models/Game';

describe('Game Controller Integration Tests', () => {
  describe('POST /api/game/evaluate', () => {
    it('should evaluate game state and return winner', async () => {
      const gameState = {
        board: [
          ['X', 'X', 'X'],
          ['O', 'O', null],
          [null, null, null]
        ],
        currentPlayer: 'O',
        gridSize: 3
      };
      
      const response = await request(app)
        .post('/api/game/evaluate')
        .send({ gameState })
        .expect(200);
      
      expect(response.body).toMatchObject({
        isGameOver: true,
        winner: 'X',
        message: 'Player X wins!'
      });
      
      // Check if game was saved
      const savedGame = await Game.findOne({ winner: 'X' });
      expect(savedGame).toBeTruthy();
    });
    
    it('should handle invalid game state', async () => {
      const gameState = {
        board: [['X']],
        currentPlayer: 'invalid',
        gridSize: 1
      };
      
      await request(app)
        .post('/api/game/evaluate')
        .send({ gameState })
        .expect(400);
    });
  });
  
  describe('GET /api/game/completed', () => {
    beforeEach(async () => {
      await Game.create([
        {
          winner: 'X',
          gridSize: 3,
          finalBoard: [
            ['X', 'X', 'X'],
            ['O', 'O', null],
            [null, null, null]
          ],
          winningLine: [
            { row: 0, col: 0 },
            { row: 0, col: 1 },
            { row: 0, col: 2 }
          ]
        },
        {
          winner: 'draw',
          gridSize: 3,
          finalBoard: [
            ['X', 'O', 'X'],
            ['X', 'O', 'O'],
            ['O', 'X', 'X']
          ]
        }
      ]);
    });
    
    it('should return completed games', async () => {
      const response = await request(app)
        .get('/api/game/completed')
        .expect(200);
      
      expect(response.body.games).toHaveLength(2);
      expect(response.body.games[0]).toHaveProperty('winner');
      expect(response.body.games[0]).toHaveProperty('finalBoard');
    });
  });
});