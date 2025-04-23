import express, { Request, Response } from 'express';
import path from 'node:path';
import { ApolloServer } from 'apollo-server-express';
import { typeDefs, resolvers } from './schemas/index.js';
import { authMiddleware } from './services/auth.js';
import db from './config/connection.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function startServer() {
  // Create an Express application
  const app = express();
  const PORT = process.env.PORT || 3001;

  // Create a new Apollo server with the schema data
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: authMiddleware,
    cache: 'bounded',
    introspection: true // Enable playground in production
  });

  // Start the Apollo server
  await server.start();

  // Apply the Apollo GraphQL middleware to the Express app
  // Cast app to any to bypass the type checking issue
  server.applyMiddleware({ app: app as any, path: '/graphql' });

  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

  // Serve client/dist as static assets in production
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../../client/dist')));

    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, '../../client/dist/index.html'));
    });
  }

  // Open database connection and start server
  db.once('open', () => {
    app.listen(PORT, () => {
      console.log(`🌍 API server running on port ${PORT}!`);
      console.log(`🚀 GraphQL at http://localhost:${PORT}${server.graphqlPath}`);
    });
  });
}

startServer();
