import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import authRouter from './routes/auth.js';
import onboardingRouter from './routes/onboarding.js';
import brandsRouter from './routes/brands.js';
import inboxRouter from './routes/inbox.js';
import generateRouter from './routes/generate.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/onboarding', onboardingRouter);
app.use('/api/brands', brandsRouter);
app.use('/api/inbox', inboxRouter);
app.use('/api/generate', generateRouter);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`BrandOS server running on port ${PORT}`);
});
