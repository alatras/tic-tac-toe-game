# Tic Tac Toe Frontend

This React application serves as the testing interface for the Tic Tac Toe Backend API system. It provides a user-friendly way to interact with and test the API functionality.

## Overview

The frontend application allows users to:

- Play Tic Tac Toe games with dynamic grid sizes (3x3 up to 10x10)
- Play against the AI opponent powered by OpenAI
- Visualize game state and winning lines
- View game history and statistics
- Test all API endpoints through an intuitive interface

## Docker Deployment

When deployed with Docker Compose (as part of the full stack), this frontend is accessible at:

```
http://localhost/
```

## Development

### Prerequisites

- Node.js 18+
- npm or yarn

### Available Scripts

```bash
# Install dependencies
npm install

# Run in development mode
npm start

# Build for production
npm run build
```

In development mode, the app will be available at `http://localhost` and will automatically connect to the backend API.

## Integration with Backend

This frontend connects to the Tic Tac Toe Backend API endpoints to:

- Start new games
- Make player moves
- Get AI opponent moves
- Evaluate game states
- Retrieve game history

Refer to the main project README for detailed API documentation.
