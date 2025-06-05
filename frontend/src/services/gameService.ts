import axios from 'axios';
import { 
  GameState, 
  EvaluateGameResponse, 
  AIMove, 
  GameStartRequest, 
  GameStartResponse, 
  PlayerMoveRequest, 
  PlayerMoveResponse 
} from '../types/game';

const API_URL = '/api/game';

export const evaluateGame = async (gameState: GameState): Promise<EvaluateGameResponse> => {
  const response = await axios.post(`${API_URL}/evaluate`, { gameState });
  return response.data;
};

export const getAIMove = async (gameState: GameState): Promise<AIMove> => {
  const response = await axios.post(`${API_URL}/ai-move`, { gameState });
  return response.data;
};

export const startGame = async (request: GameStartRequest): Promise<GameStartResponse> => {
  const response = await axios.post(`${API_URL}/start`, request);
  return response.data;
};

export const makeMove = async (gameId: string, move: PlayerMoveRequest): Promise<PlayerMoveResponse> => {
  const response = await axios.post(`${API_URL}/${gameId}/move`, move);
  return response.data;
};
