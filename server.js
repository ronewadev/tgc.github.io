// Load environment variables
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
// These would need to be installed via npm:
// const helmet = require('helmet');
// const rateLimit = require('express-rate-limit');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static('uploads'));

// Database Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tgcsa', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Models
const Event = require('models/Event');
const Program = require('models/Program');
const Job = require('models/Job');
const Application = require('models/Application');
const User = require('models/User');

// File Upload Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ storage });

// Routes
app.use('/api/events', require('routes/events'));
app.use('/api/programs', require('routes/programs'));
app.use('/api/jobs', require('routes/jobs'));
app.use('/api/applications', require('routes/applications'));
app.use('/api/auth', require('./routes/auth'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));