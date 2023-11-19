import { Router } from 'express';
const router = Router();

import { register, login, logout } from '../controllers/authController.js';
// import { validateRegisterInput } from '../middleware/validationMiddleware.js';

import {
  validateRegisterInput,
  validateLoginInput,
} from '../middleware/validationMiddleware.js'; //middleware

//this works bc they are the same url
router.post('/register', validateRegisterInput, register); //gets actual url from server.js

router.post('/login', validateLoginInput, login); //gets actual url from server.js
router.post('/logout', logout); //gets actual url from server.js

export default router;
