import React, { useState } from 'react';
import { Player } from '../types/game';
import '../styles/PlayerSetup.css';

interface PlayerSetupProps {
  onSetupComplete: (playerSymbol: Player, gridSize: number) => void;
}

const PlayerSetup: React.FC<PlayerSetupProps> = ({ onSetupComplete }) => {
  const [step, setStep] = useState<number>(1);
  const [playerSymbol, setPlayerSymbol] = useState<Player>('X');
  const [gridSize, setGridSize] = useState<number>(3);

  const handleSymbolSelect = (symbol: Player) => {
    setPlayerSymbol(symbol);
    setStep(2);
  };

  const handleGridSizeSelect = (size: number) => {
    setGridSize(size);
    onSetupComplete(playerSymbol, size);
  };

  return (
    <div className="player-setup">
      {step === 1 ? (
        <div className="setup-step">
          <h2>Choose Your Symbol</h2>
          <div className="symbol-options">
            <button 
              className={`symbol-button ${playerSymbol === 'X' ? 'selected' : ''}`} 
              onClick={() => handleSymbolSelect('X')}
            >
              X
            </button>
            <button 
              className={`symbol-button ${playerSymbol === 'O' ? 'selected' : ''}`} 
              onClick={() => handleSymbolSelect('O')}
            >
              O
            </button>
          </div>
        </div>
      ) : (
        <div className="setup-step">
          <h2>Select Grid Size</h2>
          <div className="grid-options">
            {[3, 4, 5].map(size => (
              <button 
                key={size} 
                className={`grid-button ${gridSize === size ? 'selected' : ''}`}
                onClick={() => handleGridSizeSelect(size)}
              >
                {size}x{size}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayerSetup;
