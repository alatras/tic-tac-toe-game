import React from 'react';
import { CellValue, Position } from '../types/game';
import '../styles/GameBoard.css';

interface GameBoardProps {
  board: CellValue[][];
  onCellClick: (position: Position) => void;
  winningLine?: Position[];
  disabled: boolean;
}

const GameBoard: React.FC<GameBoardProps> = ({ board, onCellClick, winningLine = [], disabled }) => {
  const isWinningCell = (row: number, col: number): boolean => {
    return winningLine.some(pos => pos.row === row && pos.col === col);
  };

  return (
    <div className="game-board">
      {board.map((row, rowIndex) => (
        <div key={rowIndex} className="board-row">
          {row.map((cell, colIndex) => (
            <button
              key={`${rowIndex}-${colIndex}`}
              className={`board-cell ${isWinningCell(rowIndex, colIndex) ? 'winning-cell' : ''}`}
              onClick={() => onCellClick({ row: rowIndex, col: colIndex })}
              disabled={cell !== null || disabled}
            >
              {cell}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
};

export default GameBoard;
