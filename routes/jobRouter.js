import { Router } from 'express';
const router = Router();

import {
  getAllJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob,
  showStats,
} from '../controllers/jobController.js';

import {
  validateJobInput,
  validateIdParam,
} from '../middleware/validationMiddleware.js'; //middleware

import { checkForTestUser } from '../middleware/authMiddleware.js';

//this works bc they are the same url
router
  .route('/')
  .get(getAllJobs)
  .post(checkForTestUser, validateJobInput, checkForTestUser, createJob); //gets actual url from server.js

router.route('/stats').get(showStats);

router
  .route('/:id')
  .get(validateIdParam, getJob)
  .patch(checkForTestUser, validateJobInput, validateIdParam, updateJob)
  .delete(checkForTestUser, validateIdParam, deleteJob);

export default router;
