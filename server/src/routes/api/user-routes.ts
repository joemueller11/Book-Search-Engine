import express from 'express';
const router = express.Router();
import {
  createUser,
  getSingleUser,
  saveBook,
  deleteBook,
  login,
} from '../../controllers/user-controller.js';

// import middleware
import { authenticateToken } from '../../services/auth.js';

// Create a wrapper to handle Promise<Response> return values
// This ensures Express gets void return type it expects
const asyncHandler = (fn: Function) => (req: express.Request, res: express.Response, next: express.NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// put authMiddleware anywhere we need to send a token for verification of user
router.route('/')
  .post(asyncHandler(createUser))
  .put(authenticateToken, asyncHandler(saveBook));

router.route('/login')
  .post(asyncHandler(login));

router.route('/me')
  .get(authenticateToken, asyncHandler(getSingleUser));

router.route('/books/:bookId')
  .delete(authenticateToken, asyncHandler(deleteBook));

export default router;
