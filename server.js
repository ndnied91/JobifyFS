import express from 'express';
const app = express();
import morgan from 'morgan';
import * as dotenv from 'dotenv';
import mongoose from 'mongoose';
dotenv.config();

import cookieParser from 'cookie-parser';

import { v2 as cloudinary } from 'cloudinary';

// middleware
import errorHandlerMiddleware from './middleware/errorHandlerMiddleware.js';

//custom imports
import jobRouter from './routes/jobRouter.js';
import authRouter from './routes/authRouter.js';
import userRoutes from './routes/userRoutes.js';
import { authenticateUser } from './middleware/authMiddleware.js';

import { dirname } from 'path';
import { fileURLToPath } from 'url';
import path from 'path';

app.use(express.json()); //used for post routes for accepting data
app.use(cookieParser()); //103

app.use('/api/v1/jobs', authenticateUser, jobRouter); //sets the base URL here
//auth 102
app.use('/api/v1/users', authenticateUser, userRoutes); //sets the base URL here
app.use('/api/v1/auth', authRouter); //sets the base URL here

if ((process.env.NODE_ENV = 'development')) {
  app.use(morgan('dev')); //61
}

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

const __dirname = dirname(fileURLToPath(import.meta.url));
app.use(express.static(path.resolve(__dirname, './public')));

// MIDDLEWARE
// catch all
app.get('/api/v1/test', (req, res) => {
  res.json({ msg: 'test route' });
});

app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, './public', 'index.html'));
});

app.use('*', (req, res) => {
  res.status(404).json({ msg: 'not found' });
});

app.use(errorHandlerMiddleware);

const port = process.env.PORT || 5100;

try {
  //new way in es6
  await mongoose.connect(process.env.MONGO_URL);
  app.listen(port, () => {
    console.log(`server running on PORT ${port}....`);
  });
} catch (error) {
  console.log(error);
  process.exit(1);
}
