import 'express-async-errors';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { rateLimit } from 'express-rate-limit';
import { config } from './config';
import { requestId, httpLogger } from './middleware/logger';
import routes from './routes';
import { notFoundHandler } from './middleware/notFound';
import { errorHandler } from './middleware/error';

import cookieParser from 'cookie-parser';

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: config.FRONTEND_URL,
    credentials: true,
  })
);

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

app.use(requestId);
app.use(httpLogger);

app.use(express.json({ limit: '100kb' }));
app.use(cookieParser());

app.use(routes);

app.use(notFoundHandler);

app.use(errorHandler);

export default app;
