import express from 'express';

const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    status: '200',
    message: 'Welcome to the Project API',
  });
});

export default router;
