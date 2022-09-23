import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { dburl } from './config/config.js';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import queue from 'express-queue';

export const __dirname = dirname(fileURLToPath(import.meta.url));

// express.js Init
const app = express();

// setup express-queue
const buildQueue = queue({
  activeLimit: 1,
  queuedLimit: -1,
});

// express.js settings
app.use(express.static(__dirname + '/public'));
app.use(cookieParser());
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());
app.use(bodyParser.json());
app.use(buildQueue);

// express.js routes
import indexRouter from './routes/index.js';
indexRouter(app);

// db connection
const db = mongoose.connection;

db.on('error', console.error);
db.on('disconnected', () => {
  console.log('Disconnected from DB! Trying to reconnect');
  mongoose.connect(dburl);
});
db.once('open', () => {
  console.log('Connected to mongo server');
});

mongoose.connect(dburl);

app.get('*', (_, res) => {
  res.status(404).json({
    status: 404,
    message: 'Not Found.',
  });
});

app.listen(process.env.PORT || 8080, () => {
  console.log('Server is running at port 8080');
});
