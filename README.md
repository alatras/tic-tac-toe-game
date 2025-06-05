# Tic Tac Toe Backend API

A professional Node.js/TypeScript backend system for a dynamic Tic Tac Toe game featuring AI opponent integration, comprehensive game state management, and historical game tracking.

## Features

- **Dynamic Grid Sizes**: Support for 3x3 up to 10x10 game boards
- **AI Opponent**: OpenAI-powered intelligent opponent
- **Game State Evaluation**: Real-time winner detection with winning line tracking
- **Game History**: Persistent storage of completed games
- **RESTful API**: Well-documented endpoints with Swagger/OpenAPI
- **Docker Support**: Fully containerized with Docker Compose
- **Comprehensive Testing**: Unit and integration test coverage
- **TypeScript**: Full type safety and modern development experience

## Prerequisites

- Node.js 18+ 
- MongoDB 7.0+
- OpenAI API Key
- Docker & Docker Compose (for containerized deployment)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/alexa/TicTacToeGame.git
cd TicTacToeGame
```

2. Install dependencies:

```bash
npm install
```

3. Configure environment variables:

```bash
cp .env.example .env
# Edit .env with your configuration and include OpenAI API key
```

4. Run the backend application _(you need MongoDB running locally)_:

```bash
# Development mode
npm run dev
```

## Docker Deployment

Run the entire stack with Docker Compose:

```bash
# Set your OpenAI API key
export OPENAI_API_KEY=openai_api_key

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Frontend Component

The application includes a React-based frontend component that serves as a testing interface for the APIs. When using Docker Compose, the frontend is accessible at:

```
http://localhost/
```

This frontend provides a user-friendly way to interact with the Tic Tac Toe game APIs and test their functionality.

## API Endpoints

### POST /api/game/evaluate

Evaluates the current game state and determines if there's a winner.

#### Request Body:

```json
{
  "gameState": {
    "board": [
      ["X", "O", null],
      [null, "X", null],
      [null, null, "X"]
    ],
    "currentPlayer": "O",
    "gridSize": 3
  }
}
```

#### Response:

```json
{
  "isGameOver": true,
  "winner": "X",
  "winningLine": [
    {"row": 0, "col": 0},
    {"row": 1, "col": 1},
    {"row": 2, "col": 2}
  ],
  "message": "Player X wins!"
}
```

### GET /api/game/completed

Retrieves a list of completed games with their results.

#### Response:

```json
{
  "games": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "winner": "X",
      "gridSize": 3,
      "finalBoard": [["X", "X", "X"], ["O", "O", null], [null, null, null]],
      "winningLine": [{"row": 0, "col": 0}, {"row": 0, "col": 1}, {"row": 0, "col": 2}],
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### POST /api/game/ai-move

Gets AI move suggestion for the current game state.

#### Request Body:

```bash
{
  "gameState": {
    "board": [["X", null, null], [null, "O", null], [null, null, null]],
    "currentPlayer": "X",
    "gridSize": 3
  }
}
```

#### Response:
```bash
{
  "move": {
    "row": 0,
    "col": 1
  }
}
```

### POST /api/game/start

Starts a new game against AI opponent.

#### Request Body:

```json
{
  "mode": "ai",
  "playerSymbol": "X",
  "gridSize": 3
}
```

#### Response:

```json
{
  "gameId": "68565578-4346-44c3-b8f6-5bc622474f18",
  "board": [
    [null, null, null],
    [null, null, null],
    [null, null, null]
  ],
  "currentPlayer": "X",
  "aiSymbol": "O",
  "gridSize": 3
}
```

### POST /api/game/{gameId}/move

Makes a player move against AI opponent. The AI will automatically respond with its move.

#### Request Body:

```json
{
  "row": 0,
  "col": 0
}
```

#### Response:

```json
{
  "board": [
    ["X", null, "O"],
    [null, null, null],
    [null, null, null]
  ],
  "currentPlayer": "X",
  "status": "ongoing",
  "winner": null,
  "aiSymbol": "O",
  "gridSize": 3
}
```

### API Documentation

Interactive API documentation is available via Swagger UI:

- Local: http://localhost:3000/api-docs
- Docker: http://localhost:3000/api-docs

### Testing

Run the test suite:

```bash
# All tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

### Project Structure

```text
src/
├── config/         # Configuration files
├── controllers/    # Request handlers
├── services/       # Business logic
├── models/         # Database models
├── interfaces/     # TypeScript interfaces
├── middleware/     # Express middleware
├── routes/         # API routes
└── app.ts          # Application entry point
```

### Architecture Decisions

- Service Layer Pattern: Separation of concerns between controllers and business logic
- TypeScript: Strong typing for better maintainability and developer experience
- MongoDB: NoSQL database for flexible game state storage
- OpenAI Integration: Fallback to random moves on API failures
- Docker Compose: Easy deployment and environment consistency
- Comprehensive Testing: Unit tests for logic, integration tests for API

### Error Handling

- Validation errors return 400 Bad Request
- Server errors return 500 Internal Server Error
- All errors are logged with Winston
- Graceful fallbacks for AI service failures

### Performance Considerations

- Database queries are limited to 100 most recent games
- AI requests have timeout protection
- Efficient game state evaluation algorithms
- Connection pooling for MongoDB

### Security

- Helmet.js for security headers
- CORS configuration
- Input validation on all endpoints
- Environment variable protection

### License

MIT
