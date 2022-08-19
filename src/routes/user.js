import axios from 'axios';
import express from 'express';
import { kakaoRestAPIKey } from '../config/config.js';
import User from '../schema/user.js';

const router = express.Router();

router.get('/', (req, res) => {
  res.status(200).json({
    message: 'Welcome to the User API.',
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
                message: 'Bad Request.',
              });
            });
        })
        .catch(() => {
          res.status(400).json({
            message: 'Bad Request.',
          });
        });
      break;
    default:
      res.status(400).json({
        message: 'Invalid platform.',
      });
      break;
  }
});

// { username, uid }
router.post('/create', async (req, res) => {
  try {
    if (!req.body.username || !req.body.uid) {
      res.status(400).json({
        message: 'Bad Request.',
      });

      return false;
    }

    if (
      (await User.findOne({
        username: req.body.username,
      })) ||
      (await User.findOne({
        uid: req.body.uid,
      }))
    ) {
      //User logged in.
      res.status(200).json({
        message: 'Successfully logged in.',
      });
    } else {
      await User.create({
        username: req.body.username,
        uid: req.body.uid,
      });

      // User created.
      res.status(200).json({
        message: 'Successfully created.',
      });
    }
  } catch (error) {
    res.status(400).json({
      message: error,
    });
  }
});

export default router;
