import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import type { VerifyErrors } from 'jsonwebtoken';

import dotenv from 'dotenv';
dotenv.config();

export interface JwtPayload {
  _id: unknown;
  username: string;
  email: string;
}

// Legacy middleware for RESTful routes
export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1];

    const secretKey = process.env.JWT_SECRET_KEY || '';

    jwt.verify(token, secretKey, (err: VerifyErrors | null, user: any) => {
      if (err) {
        return res.sendStatus(403); // Forbidden
      }

      req.user = user as JwtPayload;
      return next();
    });
  } else {
    res.sendStatus(401); // Unauthorized
  }
};

// Function for Apollo Server context
export const authMiddleware = ({ req }: { req: Request }) => {
  // Get the token from the headers
  let token = req.headers.authorization || '';

  if (token.startsWith('Bearer ')) {
    token = token.slice(7);
  }

  if (!token) {
    return { user: null };
  }

  try {
    const secretKey = process.env.JWT_SECRET_KEY || '';
    const { _id, username, email } = jwt.verify(token, secretKey) as JwtPayload;
    return { user: { _id, username, email } };
  } catch (error) {
    console.log('Invalid token');
    return { user: null };
  }
};

export const signToken = (username: string, email: string, _id: unknown) => {
  const payload = { username, email, _id };
  const secretKey = process.env.JWT_SECRET_KEY || '';

  return jwt.sign(payload, secretKey, { expiresIn: '1h' });
};
