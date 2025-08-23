import express from 'express';

const router = express.Router();

/**
 * @route   GET /api/health
 * @desc    Health check endpoint for monitoring service status
 * @access  Public
 */
router.get('/', (req, res) => {
  res.status(200).json({ 
    status: 'ok',
    message: 'Library System API is running',
    timestamp: new Date()
  });
});

export default router;
