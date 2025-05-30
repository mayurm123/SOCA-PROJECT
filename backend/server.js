const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');

dotenv.config();
const authRoutes = require('./routes/authRoutes');
const optionRoutes = require('./routes/optionRoutes');
const backtestRoutes = require('./routes/backtestRoutes');
//app.use('/api/backtest', backtestRoutes);

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));

// DB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error(err));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/options', optionRoutes);

app.use('/api/options', backtestRoutes);
//app.use('/api/backtest', backtestRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
app.get('/', (req, res) => {
  res.send('API is running...');
});


// Enable CORS for frontend with cookies
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));

// // Routes
// const authRoutes = require('./routes/auth');
// app.use('/api/auth', authRoutes);

//added on 28/05/25 for : calling scheduler when backend start

const { spawn } = require('child_process');
const path = require('path');

const server = express();

// Start the Python scheduler as a child process
const schedulerPath = path.join(__dirname,'..', 'python-service', 'scheduler.py');
const pythonProcess = spawn('python', [schedulerPath]);

pythonProcess.stdout.on('data', (data) => {
  console.log(`[Python Scheduler]: ${data}`);
});

pythonProcess.stderr.on('data', (data) => {
  console.error(`[Python Scheduler Error]: ${data}`);
});

pythonProcess.on('close', (code) => {
  console.log(`[Python Scheduler] exited with code ${code}`);
});


