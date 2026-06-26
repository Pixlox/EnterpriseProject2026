// server.js - Express server
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import reportsRouter from './routes/reports.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// serve photos
app.use('/content/photos', express.static(path.join(__dirname, '..', 'content', 'photos')));

app.use('/api', reportsRouter);

console.log('starting up...');
app.listen(PORT, () => {
  console.log('Server running on http://localhost:' + PORT);
});
