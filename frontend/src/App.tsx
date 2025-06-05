import React, { useState } from 'react';
import './App.css';
import PlayerSetup from './components/PlayerSetup';
import GameBoard from './components/GameBoard';
import GameStatus from './components/GameStatus';
import AIMoveHint from './components/AIMoveHint';
import { Player, Position, CellValue } from './types/game';
import * as gameService from './services/gameService';

function App() {
  const [gameStage, setGameStage] = useState<'setup' | 'playing' | 'gameOver'>('setup');
  const [playerSymbol, setPlayerSymbol] = useState<Player>('X');
  const [aiSymbol, setAiSymbol] = useState<Player>('O');
  const [gridSize, setGridSize] = useState<number>(3);
  const [gameId, setGameId] = useState<string>('');
  const [board, setBoard] = useState<CellValue[][]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<Player>('X');
  const [winner, setWinner] = useState<Player | 'draw' | null>(null);
  const [winningLine, setWinningLine] = useState<Position[]>([]);
  const [suggestedMove, setSuggestedMove] = useState<Position | null>(null);
  const [isLoadingSuggestion, setIsLoadingSuggestion] = useState<boolean>(false);
  const [waitingForAI, setWaitingForAI] = useState<boolean>(false);

  const handleSetupComplete = async (symbol: Player, size: number) => {
    setPlayerSymbol(symbol);
    setGridSize(size);
    setAiSymbol(symbol === 'X' ? 'O' : 'X');
    
    try {
      const response = await gameService.startGame({
        mode: 'ai',
        playerSymbol: symbol,
        gridSize: size
      });
      
      setGameId(response.gameId);
      setBoard(response.board);
      setCurrentPlayer(response.currentPlayer);
      setGameStage('playing');
    } catch (error) {
      console.error('Error starting game:', error);
      alert('Failed to start the game. Please try again.');
    }
  };

  const handleCellClick = async (position: Position) => {
    if (waitingForAI || currentPlayer !== playerSymbol || board[position.row][position.col] !== null) {
      return;
    }

    try {
      setWaitingForAI(true);
      const response = await gameService.makeMove(gameId, {
        row: position.row,
        col: position.col
      });

      setBoard(response.board);
      setCurrentPlayer(response.currentPlayer);

      if (response.status !== 'ongoing') {
        setGameStage('gameOver');
        setWinner(response.winner);
        if (response.winner && response.winner !== 'draw') {
          // Get winning line from evaluation
          const evaluation = await gameService.evaluateGame({
            board: response.board,
            currentPlayer: response.currentPlayer,
            gridSize: response.gridSize
          });
          setWinningLine(evaluation.winningLine || []);
        }
      } else {
        // Get AI move suggestion
        getAIMoveHint(response.board, response.currentPlayer, response.gridSize);
      }
      setWaitingForAI(false);
    } catch (error) {
      console.error('Error making move:', error);
      alert('Failed to make the move. Please try again.');
      setWaitingForAI(false);
    }
  };

  const getAIMoveHint = async (currentBoard: CellValue[][], player: Player, size: number) => {
    setIsLoadingSuggestion(true);
    setSuggestedMove(null);
    
    try {
      const response = await gameService.getAIMove({
        board: currentBoard,
        currentPlayer: player,
        gridSize: size
      });
      
      setSuggestedMove(response.move);
    } catch (error) {
      console.error('Error getting AI move suggestion:', error);
    } finally {
      setIsLoadingSuggestion(false);
    }
  };

  const resetGame = () => {
    setGameStage('setup');
    setBoard([]);
    setCurrentPlayer('X');
    setWinner(null);
    setWinningLine([]);
    setSuggestedMove(null);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Tic Tac Toe</h1>
      </header>
      
      <main className="App-main">
        {gameStage === 'setup' ? (
          <PlayerSetup onSetupComplete={handleSetupComplete} />
        ) : (
          <>
            <GameStatus 
              currentPlayer={currentPlayer}
              playerSymbol={playerSymbol}
              aiSymbol={aiSymbol}
              winner={winner}
              gameOver={gameStage === 'gameOver'}
            />
            
            <GameBoard 
              board={board}
              onCellClick={handleCellClick}
              winningLine={winningLine}
              disabled={waitingForAI || currentPlayer !== playerSymbol || gameStage === 'gameOver'}
            />
            
            {gameStage === 'playing' && (
              <AIMoveHint 
                suggestedMove={suggestedMove}
                isLoading={isLoadingSuggestion}
              />
            )}
            
            {gameStage === 'gameOver' && (
              <button className="reset-button" onClick={resetGame}>
                Play Again
              </button>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default App;
