/**
 * Placeholder routes - To be implemented
 */

import express from 'express';
const router = express.Router();

router.get('/', (req, res) => {
    res.json({ success: true, message: 'Route handler placeholder' });
});

export default router;
