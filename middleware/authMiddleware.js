import {
  UnauthenticatedError,
  UnauthorizedError,
  BadRequestError,
} from '../errors/customErrors.js';
import { verifyJWT } from '../utils/tokenUtils.js';

export const authenticateUser = (req, res, next) => {
  //this will check the auth status of each request
  console.log('auth middleware check...');

  const { token } = req.cookies;

  if (!token) {
    throw new UnauthenticatedError('authentication invalid');
  }

  try {
    //validate JWT
    const { userId, role } = verifyJWT(token);
    console.log();
    const testUser = userId === '6556bce683ab490a3af4bb43';
    console.log('value of testUser', testUser);
    req.user = { userId, role, testUser };
    next();
  } catch (e) {
    console.log(e);
  }
};

export const authorizePermissions = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new UnauthorizedError('Not authorized on this route');
    }
    next();
  };
};

export const checkForTestUser = (req, res, next) => {
  if (req.user.testUser) {
    throw new BadRequestError('Demo User. Read Only!');
  }
  next();
};
