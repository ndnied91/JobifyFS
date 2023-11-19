import 'express-async-errors';
import User from '../models/UserModel.js';
import { StatusCodes } from 'http-status-codes';
import {
  BadRequestError,
  UnauthenticatedError,
} from '../errors/customErrors.js';
import bcrypt from 'bcryptjs';

import { hashPassword, comparePassword } from '../utils/passwordUtils.js';
import { createJWT } from '../utils/tokenUtils.js';

export const register = async (req, res) => {
  const isFirstAccount = (await User.countDocuments()) === 0;

  req.body.role = isFirstAccount ? 'admin' : 'user';
  req.body.password = await hashPassword(req.body.password);

  const user = await User.create(req.body);
  res.status(StatusCodes.CREATED).json({ msg: 'User successfully created' });
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    throw new UnauthenticatedError('Invalid Credentials');
  }
  const isPasswordCorrect = await comparePassword(password, user.password);

  if (!isPasswordCorrect) throw new UnauthenticatedError('Invalid Credentials');
  const token = createJWT({ userId: user._id, role: user.role });

  const oneDay = 1000 * 60 * 60 * 24;

  res.cookie('token', token, {
    //we are sending the cookie right here
    httpOnly: true,
    expires: new Date(Date.now() + oneDay), //expires in one day
    secure: process.env.NODE_ENV === 'production', //if in Prod, secure and only https
  });
  res.status(StatusCodes.OK).json({ msg: 'User logged in.' });
};

export const logout = (req, res) => {
  res.cookie('token', 'logout', {
    httpOnly: true,
    expires: new Date(Date.now()),
  });
  res.status(StatusCodes.OK).json({ msg: `user logged out!` });
};
