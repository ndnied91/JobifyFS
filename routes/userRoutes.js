import { Router } from 'express';
import {
  getCurrentUser,
  getApplicationStats,
  updateUser,
} from '../controllers/userController.js';
import { validateUpdateUserInput } from '../middleware/validationMiddleware.js';
import {
  authorizePermissions,
  checkForTestUser,
} from '../middleware/authMiddleware.js';
import upload from '../middleware/multerMiddleware.js';

const router = Router();

//this works bc they are the same url
router.get('/current-user', getCurrentUser); //gets actual url from server.js

router.get('/admin/app-stats', [
  authorizePermissions('admin'),
  getApplicationStats,
]); //gets actual url from server.js
router.patch(
  '/update-user',
  checkForTestUser, //checks for demo user
  upload.single('avatar'), //149
  validateUpdateUserInput,
  updateUser
); //gets actual url from server.js

export default router;
