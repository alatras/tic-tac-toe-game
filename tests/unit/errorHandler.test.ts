import { Request, Response, NextFunction } from 'express';

const mockErrorFn = jest.fn();
jest.mock('winston', () => ({
  createLogger: jest.fn().mockReturnValue({
    error: mockErrorFn
  }),
  format: {
    json: jest.fn().mockReturnValue({})
  },
  transports: {
    Console: jest.fn()
  }
}));

// Moving import of the module here so that it uses the mocked winston
import { errorHandler } from '../../src/middleware/errorHandler';

describe('Error Handler Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;
  let originalNodeEnv: string | undefined;

  beforeEach(() => {
    mockRequest = {
      method: 'GET',
      url: '/test',
      body: { test: 'data' }
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    nextFunction = jest.fn();

    originalNodeEnv = process.env.NODE_ENV;
    
    jest.clearAllMocks();
  });

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
  });

  it('should handle errors in development environment with stack trace', () => {
    process.env.NODE_ENV = 'development';
    const testError = new Error('Test error');
    testError.stack = 'Test stack trace';

    errorHandler(
      testError,
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: {
        message: 'Test error',
        stack: 'Test stack trace'
      }
    });

    expect(mockErrorFn).toHaveBeenCalledWith({
      message: 'Test error',
      stack: 'Test stack trace',
      method: 'GET',
      url: '/test',
      body: { test: 'data' }
    });
  });

  it('should handle errors in production environment without stack trace', () => {
    process.env.NODE_ENV = 'production';
    const testError = new Error('Test error');
    testError.stack = 'Test stack trace';

    errorHandler(
      testError,
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: {
        message: 'Test error'
      }
    });

    expect(mockErrorFn).toHaveBeenCalledWith({
      message: 'Test error',
      stack: 'Test stack trace',
      method: 'GET',
      url: '/test',
      body: { test: 'data' }
    });
  });

  it('should use default error message if error message is undefined', () => {
    const testError = new Error();
    testError.message = '';

    errorHandler(
      testError,
      mockRequest as Request,
      mockResponse as Response,
      nextFunction
    );

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: {
        message: 'Internal server error'
      }
    });
  });
}); 