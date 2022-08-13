import express from 'express';

const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    status: '200',
    message: 'Welcome to the User API',
  });
});

router.post('/register', (req, res) => {
  console.log(req.body);
  res.json({
    status: '200',
    message: 'User registered successfully',
  });
});

export default router;
