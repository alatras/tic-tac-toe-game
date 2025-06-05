import mongoose from 'mongoose';
import { connectDB } from '../../src/config/database';
import { config } from '../../src/config/environment';
import winston from 'winston';

// Mock mongoose and winston
jest.mock('mongoose');
jest.mock('winston', () => ({
  createLogger: jest.fn().mockReturnValue({
    info: jest.fn(),
    error: jest.fn()
  }),
  format: {
    json: jest.fn()
  },
  transports: {
    Console: jest.fn()
  }
}));

describe('Database Connection', () => {
  // Mock process.exit to prevent actual exit
  const mockExit = jest.spyOn(process, 'exit').mockImplementation((number) => {
    throw new Error('process.exit: ' + number);
  });

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  afterAll(() => {
    mockExit.mockRestore();
  });

  it('should connect to MongoDB successfully', async () => {
    // Mock successful connection
    (mongoose.connect as jest.Mock).mockResolvedValueOnce(undefined);

    await connectDB();

    // Verify mongoose.connect was called with correct URI
    expect(mongoose.connect).toHaveBeenCalledWith(config.mongoUri);
    
    // Verify success was logged
    const logger = winston.createLogger();
    expect(logger.info).toHaveBeenCalledWith('MongoDB connected successfully');
  });

  it('should handle connection errors and exit process', async () => {
    // Mock connection failure
    const mockError = new Error('Connection failed');
    (mongoose.connect as jest.Mock).mockRejectedValueOnce(mockError);

    // Test that it handles the error correctly
    await expect(connectDB()).rejects.toThrow('process.exit: 1');

    // Verify mongoose.connect was called
    expect(mongoose.connect).toHaveBeenCalledWith(config.mongoUri);
    
    // Verify error was logged
    const logger = winston.createLogger();
    expect(logger.error).toHaveBeenCalledWith('MongoDB connection error:', mockError);
    
    // Verify process.exit was called with 1
    expect(mockExit).toHaveBeenCalledWith(1);
  });
});
