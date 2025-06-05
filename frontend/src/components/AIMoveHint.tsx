import React from 'react';
import { Position } from '../types/game';
import '../styles/AIMoveHint.css';

interface AIMoveHintProps {
  suggestedMove: Position | null;
  isLoading: boolean;
}

const AIMoveHint: React.FC<AIMoveHintProps> = ({ suggestedMove, isLoading }) => {
  return (
    <div className="ai-move-hint">
      <h3>AI Move Suggestion</h3>
      {isLoading ? (
        <div className="loading-spinner"></div>
      ) : suggestedMove ? (
        <p>
          Try position: Row {suggestedMove.row + 1}, Column {suggestedMove.col + 1}
        </p>
      ) : (
        <p>Make a move to get an AI suggestion</p>
      )}
    </div>
  );
};

export default AIMoveHint;
