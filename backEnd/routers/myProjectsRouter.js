const express = require('express');
const Project = require('../model/projectSchema');
const userAuth = require('../middleware/userAuth');

const router = express.Router();

router.get('/', userAuth, async (req, res) => {
  try {
    const userEmail = req.user.email; // From JWT payload
    
    const myProjects = await Project.find({ email: userEmail })
      .sort({ createdAt: -1 })
      .lean();

    res.json(myProjects);
  } catch (error) {
    console.error('Error fetching user projects:', error);
    res.status(500).json({ message: 'Failed to fetch projects' });
  }
});

module.exports = router;
