import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { login, requireAuth } from './auth';
import textExcerptsRouter from './routes/textExcerpts';
import annotationsRouter from './routes/annotations';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Text Annotation API Server' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Auth routes
app.post('/api/auth/login', login);

// Protected admin routes
app.get('/api/admin/dashboard', requireAuth, (req, res) => {
  res.json({ message: 'Admin dashboard data' });
});

// API routes
app.use('/api/texts', textExcerptsRouter);
app.use('/api/annotations', annotationsRouter);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});