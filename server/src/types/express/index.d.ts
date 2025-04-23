import * as express from 'express';

declare global {
  namespace Express {
    export interface Request {
      user?: {
        _id: unknown;
        username: string;
        email: string;
      };
    }
  }
}

// This helps resolve the type incompatibility with exactOptionalPropertyTypes
declare module 'express' {
  interface Application {
    // Make optional properties explicitly handle undefined
    get: express.Application['get'];
    // Add other methods if needed
  }
}

export {};
