import { StatusCodes } from 'http-status-codes';
import User from '../models/UserModel.js';
import Job from '../models/JobModel.js';

import { v2 as cloudinary } from 'cloudinary';
import { formatImage } from '../middleware/multerMiddleware.js';

export const getCurrentUser = async (req, res) => {
  const user = await User.findOne({ _id: req.user.userId });

  if (user) {
    user.toJSON(); //removes password
  }

  res.status(StatusCodes.OK).json({ user });
};

export const getApplicationStats = async (req, res) => {
  //admin route validated by authorizePermissions

  const users = await User.countDocuments();
  const jobs = await Job.countDocuments();

  res.status(StatusCodes.OK).json({ users, jobs });
};

export const updateUser = async (req, res) => {
  console.log(req.file);
  const newUser = { ...req.body };
  delete newUser.password; //password can't be updated here

  if (req.file) {
    const file = formatImage(req.file);

    const response = await cloudinary.uploader.upload(file); //uploads image to cloudary

    newUser.avatar = response.secure_url; //points user avatar to the image
    newUser.avatarPublicId = response.public_id;
  }

  const updatedUser = await User.findByIdAndUpdate(req.user.userId, newUser);

  if (req.file && updatedUser.avatarPublicId) {
    await cloudinary.uploader.destroy(updatedUser.avatarPublicId);
  }

  res
    .status(StatusCodes.OK)
    .json({ msg: 'User successfully has been updated' });
};
