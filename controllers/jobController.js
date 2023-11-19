import 'express-async-errors';
import Job from '../models/JobModel.js'; //job model
import { StatusCodes } from 'http-status-codes';

import mongoose from 'mongoose';
import day from 'dayjs';

//refactored
export const getAllJobs = async (req, res) => {
  const { search, jobStatus, jobType, sort } = req.query; //166
  // console.log(req.user); //gets user bases off JWT 104
  // const jobs = await Job.find({}); //78

  const queryObject = {
    createdBy: req.user.userId,
  };

  //166
  if (search) {
    queryObject.$or = [
      { position: { $regex: search, $options: 'i' } },
      { company: { $regex: search, $options: 'i' } },
    ];
  }
  //166
  if (jobStatus && jobStatus !== 'all') {
    queryObject.jobStatus = jobStatus;
  }
  if (jobType && jobType !== 'all') {
    queryObject.jobType = jobType;
  }

  const sortOptions = {
    newest: '-createdAt',
    oldest: 'createdAt',
    'a-z': 'position',
    'z-a': '-position',
  };

  const sortKey = sortOptions[sort] || sortOptions.newest;

  // setup pagination 169
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10; //how many are displayed at once
  const skip = (page - 1) * limit; //how many items were skipping

  const jobs = await Job.find(queryObject)
    .sort(sortKey)
    .skip(skip)
    .limit(limit);

  const totalJobs = await Job.countDocuments(queryObject);
  const numOfPages = Math.ceil(totalJobs / limit);

  // const jobs = await Job.find(queryObject).sort(sortKey);
  res
    .status(StatusCodes.OK)
    .json({ totalJobs, numOfPages, currentPage: page, jobs });
};

//refactored
export const createJob = async (req, res) => {
  //when we create a job, we want to make sure its tied to a specific user

  req.body.createdBy = req.user.userId;
  const job = await Job.create(req.body);
  res.status(StatusCodes.CREATED).json({ job });
};

//refactored
export const getJob = async (req, res) => {
  const job = await Job.findById(req.params.id);
  res.status(StatusCodes.OK).json({ job });
};

export const updateJob = async (req, res) => {
  const updatedJob = await Job.findByIdAndUpdate(
    { _id: req.params.id },
    req.body,
    {
      new: true,
    }
  );

  res.status(StatusCodes.OK).json({ job: updatedJob });
};

//refactored
export const deleteJob = async (req, res) => {
  const removedJob = await Job.findByIdAndDelete(req.params.id);
  res.status(200).json({ job: removedJob });
};

export const showStats = async (req, res) => {
  let stats = await Job.aggregate([
    { $match: { createdBy: new mongoose.Types.ObjectId(req.user.userId) } }, //gets job from specific user
    { $group: { _id: '$jobStatus', count: { $sum: 1 } } }, //groups by job status and gets the sum
  ]);

  stats = stats.reduce((acc, curr) => {
    //acc is what we're getting to return
    //curr is what we're looping over
    const { _id: title, count } = curr;
    acc[title] = count;
    return acc;
  }, {});

  const defaultStats = {
    pending: stats.pending || 0,
    interview: stats.interview || 0,
    declined: stats.declined || 0,
  };

  let monthlyApplications = await Job.aggregate([
    //159
    { $match: { createdBy: new mongoose.Types.ObjectId(req.user.userId) } },
    {
      $group: {
        _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': -1, '_id.month': -1 } },
    { $limit: 6 },
  ]);

  monthlyApplications = monthlyApplications
    .map((item) => {
      const {
        _id: { year, month },
        count,
      } = item;

      const date = day()
        .month(month - 1)
        .year(year)
        .format('MMM YY');
      return { date, count };
    })
    .reverse();

  res.status(StatusCodes.OK).json({ defaultStats, monthlyApplications });
};

// const defaultStats = {
//   pending: 22,
//   interview: 11,
//   declined: 4,
// };

// let monthlyApplications = [
//   {
//     date: 'May 23',
//     count: 12,
//   },
//   {
//     date: 'Jun 23',
//     count: 9,
//   },
//   {
//     date: 'Jul 23',
//     count: 3,
//   },
// ];

// res.status(StatusCodes.OK).json({ defaultStats, monthlyApplications });
// };
