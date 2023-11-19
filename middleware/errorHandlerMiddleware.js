import { StatusCodes } from 'http-status-codes';
// 81
const errorHandlerMiddleware = (err, req, res, next) => {
  console.log(err);
  const statusCode = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
  const msg =
    err.message || 'Something went wrong, try again later (middleware)';

  res.status(statusCode).json({ msg });
};

export default errorHandlerMiddleware;
