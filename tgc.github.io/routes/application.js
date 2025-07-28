const express = require('express');
const router = express.Router();
const Application = require('models/Application');
const Job = require('models/Job');
const auth = require('middleware/auth');
const multer = require('multer');
const path = require('path');

// Configure file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/resumes/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// Submit application
router.post('/', upload.single('resume'), async (req, res) => {
  try {
    const job = await Job.findById(req.body.jobId);
    if (!job || !job.isActive) return res.status(400).json({ message: 'Job not available' });

    const application = new Application({
      job: req.body.jobId,
      applicantName: req.body.applicantName,
      applicantEmail: req.body.applicantEmail,
      applicantPhone: req.body.applicantPhone,
      resumePath: req.file.path,
      coverLetter: req.body.coverLetter
    });

    const savedApplication = await application.save();
    res.status(201).json(savedApplication);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get applications for a job (admin only)
router.get('/job/:jobId', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Unauthorized' });

  try {
    const applications = await Application.find({ job: req.params.jobId });
    res.json(applications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update application status (admin only)
router.patch('/:id/status', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Unauthorized' });

  try {
    const application = await Application.findById(req.params.id);
    if (!application) return res.status(404).json({ message: 'Application not found' });

    application.status = req.body.status;
    const updatedApplication = await application.save();
    res.json(updatedApplication);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;