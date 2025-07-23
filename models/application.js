const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  applicantName: {
    type: String,
    required: true
  },
  applicantEmail: {
    type: String,
    required: true
  },
  applicantPhone: {
    type: String,
    required: true
  },
  resumePath: {
    type: String,
    required: true
  },
  coverLetter: String,
  applicationDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['Pending', 'Reviewed', 'Interview', 'Rejected', 'Hired'],
    default: 'Pending'
  }
});

module.exports = mongoose.model('Application', ApplicationSchema);