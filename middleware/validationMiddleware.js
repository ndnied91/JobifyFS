import { body, param, validationResult } from 'express-validator'; //validation
import Job from '../models/JobModel.js'; //job model
import User from '../models/UserModel.js';
import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
} from '../errors/customErrors.js';
import { JOB_STATUS, JOB_TYPE } from '../utils/constants.js';
import mongoose from 'mongoose';

const withValidationErrors = (validateValues) => {
  return [
    validateValues,
    (req, res, next) => {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        //if empty meaning theres no errors
        const errorMessages = errors.array().map((error) => error.msg);

        if (errorMessages[0].startsWith('no job')) {
          throw new NotFoundError(errorMessages);
        }

        if (errorMessages[0].startsWith('no authorized')) {
          throw new UnauthorizedError('Not authorized to access this route');
        }

        throw new BadRequestError(errorMessages);
      }
      next(); //passes to next middleware
    },
  ];
};

export const validateJobInput = withValidationErrors([
  body('company').notEmpty().withMessage('Company is required'),
  body('position').notEmpty().withMessage('Position is required'),
  body('jobLocation').notEmpty().withMessage('Job Location is required'),
  body('jobStatus')
    .isIn(Object.values(JOB_STATUS))
    .withMessage('invalid status value'),
  body('jobType')
    .isIn(Object.values(JOB_TYPE))
    .withMessage('invalid type value'),
]);

export const validateIdParam = withValidationErrors([
  param('id').custom(async (value, { req }) => {
    const isValidId = mongoose.Types.ObjectId.isValid(value);
    if (!isValidId) throw new BadRequestError('invalid MongoDB id'); //89
    const job = await Job.findById(value);
    if (!job) throw new NotFoundError(`no job with id : ${value}`);

    const isAdmin = req.user.role === 'admin';
    const isOwner = req.user.userId === job.createdBy.toString();
    console.log(isAdmin);

    if (!isAdmin && !isOwner) {
      //if the current user is neither an Admin or the owner of the job
      throw new UnauthorizedError('Not authorized to access this route');
    }
  }),
]);

// USER VALIDATION
export const validateRegisterInput = withValidationErrors([
  body('name').notEmpty().withMessage('name is required'),
  body('email')
    .notEmpty()
    .withMessage('email is required')
    .isEmail()
    .withMessage('invalid email format')
    .custom(async (email) => {
      const user = await User.findOne({ email });
      if (user) {
        throw new BadRequestError('email already exists');
      }
    }),
  body('password')
    .notEmpty()
    .withMessage('password is required')
    .isLength({ min: 8 })
    .withMessage('password must be at least 8 characters long'),
  body('location').notEmpty().withMessage('location is required'),
  body('lastName').notEmpty().withMessage('last name is required'),
]);

export const validateLoginInput = withValidationErrors([
  body('email')
    .notEmpty()
    .withMessage('email is required')
    .isEmail()
    .withMessage('invalid email format'),
  body('password').notEmpty().withMessage('password is required'),
]);

export const validateUpdateUserInput = withValidationErrors([
  body('name').notEmpty().withMessage('name is required'),
  body('email')
    .notEmpty()
    .withMessage('email is required')
    .isEmail()
    .withMessage('invalid email format')
    .custom(async (email, { req }) => {
      const user = await User.findOne({ email });
      if (user && user._id.toString() !== req.user.userId) {
        //cant update an email to an already existing email from someone else
        throw new Error('email already exists');
      }
    }),
  body('lastName').notEmpty().withMessage('last name is required'),
  body('location').notEmpty().withMessage('location is required'),
]);
