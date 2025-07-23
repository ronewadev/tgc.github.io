const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  requirements: {
    type: [String],
    required: true
  },
  location: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['Full-time', 'Part-time', 'Contract', 'Remote'],
    required: true
  },
  postedDate: {
    type: Date,
    default: Date.now
  },
  deadline: Date,
  isActive: {
    type: Boolean,
    default: true
  }
});

module.exports = mongoose.model('Job', JobSchema);