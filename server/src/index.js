import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import authRouter from './routes/auth.js';
import onboardingRouter from './routes/onboarding.js';
import brandsRouter from './routes/brands.js';
import inboxRouter from './routes/inbox.js';
import generateRouter from './routes/generate.js';
import dashboardRouter from './routes/dashboard.js';
import intentRouter from './routes/intent.js';
import settingsRouter from './routes/settings.js';
import inboundRouter from './routes/inbound.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();
const PORT = process.env.PORT || 4000;

// Allow CORS for local development and Vercel domains
const allowedOrigins = [
  'http://localhost:3000',
  /\.vercel\.app$/
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.some(pattern => 
      typeof pattern === 'string' ? pattern === origin : pattern.test(origin)
    )) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use('/api/inbound', express.raw({ type: 'application/json' }), inboundRouter);
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/onboarding', onboardingRouter);
app.use('/api/brands', brandsRouter);
app.use('/api/inbox', inboxRouter);
app.use('/api/generate', generateRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/intent', intentRouter);
app.use('/api/settings', settingsRouter);

app.use(errorHandler);

// Only listen when running locally
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`BrandOS server running on port ${PORT}`);
  });
}

export default app;
