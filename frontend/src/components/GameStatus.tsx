import React from 'react';
import { Player } from '../types/game';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faRobot } from '@fortawesome/free-solid-svg-icons';
import '../styles/GameStatus.css';

interface GameStatusProps {
  currentPlayer: Player;
  playerSymbol: Player;
  aiSymbol: Player;
  winner: Player | 'draw' | null;
  gameOver: boolean;
}

const GameStatus: React.FC<GameStatusProps> = ({ 
  currentPlayer, 
  playerSymbol, 
  aiSymbol, 
  winner, 
  gameOver 
}) => {
  const getStatusMessage = () => {
    if (gameOver) {
      if (winner === 'draw') {
        return "Game ended in a draw!";
      } else if (winner === playerSymbol) {
        return "You win! Congratulations!";
      } else {
        return "AI wins! Better luck next time.";
      }
    } else {
      return currentPlayer === playerSymbol ? "Your turn" : "AI is thinking...";
    }
  };

  return (
    <div className="game-status">
      <div className="players">
        <div className={`player ${currentPlayer === playerSymbol && !gameOver ? 'active' : ''}`}>
          <FontAwesomeIcon icon={faUser} size="2x" />
          <span className="player-symbol">{playerSymbol}</span>
          <span className="player-label">You</span>
        </div>
        <div className={`player ${currentPlayer === aiSymbol && !gameOver ? 'active' : ''}`}>
          <FontAwesomeIcon icon={faRobot} size="2x" />
          <span className="player-symbol">{aiSymbol}</span>
          <span className="player-label">AI</span>
        </div>
      </div>
      <div className={`status-message ${gameOver ? 'game-over' : ''}`}>
        {getStatusMessage()}
      </div>
    </div>
  );
};

export default GameStatus;
