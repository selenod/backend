import axios from 'axios';
import express from 'express';
import { kakaoRestAPIKey } from '../config/config.js';

const router = express.Router();

router.get('/', (req, res) => {
  res.status(200).json({
    message: 'Welcome to the User API',
  });
});

router.get('/auth', async (req, res) => {
  switch (req.query.platform) {
    case 'kakao':
      await axios
        .post(
          `https://kauth.kakao.com/oauth/token?grant_type=authorization_code&redirect_uri=http://localhost:3000/redirect/kakao&code=${req.query.code}&client_id=${kakaoRestAPIKey}`,
          {
            headers: {
              'Content-type': 'application/x-www-form-urlencoded;charset=utf-8',
            },
          }
        )
        .then((data) => {
          axios
            .request('https://kapi.kakao.com/v2/user/me', {
              headers: {
                Authorization: `Bearer ${data.data.access_token}`,
              },
            })
            .then((data) => {
              res.status(200).json({
                id: data.data.id,
                name: data.data.properties.nickname,
              });
            })
            .catch(() => {
              res.status(400).json({
                message: 'Bad Request',
              });
            });
        })
        .catch(() => {
          res.status(400).json({
            message: 'Bad Request',
          });
        });
      break;
    default:
      res.status(400).json({
        message: 'Invalid platform',
      });
      break;
  }
});

export default router;
