import { Router } from 'express';
import { GameController } from '../controllers/gameController';
import { body, validationResult } from 'express-validator';

const router = Router();
const gameController = new GameController();

const handleValidationErrors = (req: any, res: any, next: any) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

/**
 * @swagger
 * components:
 *   schemas:
 *     GameState:
 *       type: object
 *       required:
 *         - board
 *         - currentPlayer
 *         - gridSize
 *       properties:
 *         board:
 *           type: array
 *           items:
 *             type: array
 *             items:
 *               type: string
 *               nullable: true
 *               enum: ['X', 'O', null]
 *         currentPlayer:
 *           type: string
 *           enum: ['X', 'O']
 *         gridSize:
 *           type: integer
 *           minimum: 3
 *           maximum: 10
 *     
 *     EvaluateGameResponse:
 *       type: object
 *       properties:
 *         isGameOver:
 *           type: boolean
 *         winner:
 *           type: string
 *           enum: ['X', 'O', 'draw', null]
 *         winningLine:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               row:
 *                 type: integer
 *               col:
 *                 type: integer
 *         message:
 *           type: string
 *     
 *     CompletedGame:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         winner:
 *           type: string
 *           enum: ['X', 'O', 'draw']
 *         gridSize:
 *           type: integer
 *         finalBoard:
 *           type: array
 *           items:
 *             type: array
 *             items:
 *               type: string
 *               nullable: true
 *         winningLine:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               row:
 *                 type: integer
 *               col:
 *                 type: integer
 *         createdAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/game/evaluate:
 *   post:
 *     summary: Evaluate the current game state
 *     tags: [Game]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               gameState:
 *                 $ref: '#/components/schemas/GameState'
 *     responses:
 *       200:
 *         description: Game evaluation result
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/EvaluateGameResponse'
 *       400:
 *         description: Invalid input
 */
router.post(
  '/evaluate',
  [
    body('gameState').isObject(),
    body('gameState.board').isArray(),
    body('gameState.currentPlayer').isIn(['X', 'O']),
    body('gameState.gridSize').isInt({ min: 3, max: 10 })
  ],
  handleValidationErrors,
  gameController.evaluateGame
);

/**
 * @swagger
 * /api/game/completed:
 *   get:
 *     summary: Get list of completed games
 *     tags: [Game]
 *     responses:
 *       200:
 *         description: List of completed games
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 games:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/CompletedGame'
 */
router.get('/completed', gameController.getCompletedGames);

/**
 * @swagger
 * /api/game/ai-move:
 *   post:
 *     summary: Get AI move suggestion
 *     tags: [Game]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               gameState:
 *                 $ref: '#/components/schemas/GameState'
 *     responses:
 *       200:
 *         description: AI move suggestion
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 move:
 *                   type: object
 *                   properties:
 *                     row:
 *                       type: integer
 *                     col:
 *                       type: integer
 */
router.post(
  '/ai-move',
  [
    body('gameState').isObject(),
    body('gameState.board').isArray(),
    body('gameState.currentPlayer').isIn(['X', 'O']),
    body('gameState.gridSize').isInt({ min: 3, max: 10 })
  ],
  handleValidationErrors,
  gameController.getAIMove
);

export default router;