import mongoose, { Schema, Document } from 'mongoose';
import { CompletedGame } from '../interfaces/game.interface';

export interface IGame extends Document, Omit<CompletedGame, '_id'> {}

const GameSchema: Schema = new Schema({
  winner: {
    type: String,
    required: true,
    enum: ['X', 'O', 'draw']
  },
  gridSize: {
    type: Number,
    required: true,
    min: 3,
    max: 10
  },
  finalBoard: {
    type: [[String]],
    required: true
  },
  winningLine: [{
    row: Number,
    col: Number
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model<IGame>('Game', GameSchema);