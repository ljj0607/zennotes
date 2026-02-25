import dotenv from 'dotenv';
import {createApp} from './app.js';

dotenv.config();

const port = Number(process.env.API_PORT || 3001);
const {app} = createApp({dbPath: process.env.DB_PATH});

app.listen(port, () => {
  console.log(`API server listening on http://localhost:${port}`);
});
