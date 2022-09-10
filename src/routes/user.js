import axios from 'axios';
import express from 'express';
import { kakaoRestAPIKey } from '../config/config.js';
import User from '../schema/user.js';
import Project from '../schema/project.js';
import jwt from 'jsonwebtoken';
import { secretKey } from '../config/config.js';

const router = express.Router();

router.get('/', (req, res) => {
  res.status(200).json({
    message: 'Welcome to the User API.',
  });
});

// query: { platform, code }
router.get('/auth', async (req, res) => {
  if (!req.query.platform || !req.query.code) {
    return res.status(400).json({
      message: 'Bad Request.',
    });
  }

  switch (req.query.platform) {
    case 'kakao':
      await axios
        .post(
          `https://kauth.kakao.com/oauth/token?grant_type=authorization_code&redirect_uri=http://localhost:3001/redirect/kakao&code=${req.query.code}&client_id=${kakaoRestAPIKey}`,
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
              if (!data.data) {
                return res.status(500).json({
                  message: 'Failed to load user data.',
                });
              }

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

// body: { username, uid, translate }
router.post('/login', async (req, res) => {
  if (!req.body.username || !req.body.uid || !req.body.translate) {
    return res.status(400).json({
      message: 'Bad Request.',
    });
  }

  if (
    (await User.findOne({
      username: req.body.username,
    })) ||
    (await User.findOne({
      uid: req.body.uid,
    }))
  ) {
    await User.findOne({
      username: req.body.username,
      uid: req.body.uid,
    }).exec((err, data) => {
      if (err || !data) {
        return res.status(500).json({
          message: 'Failed to load user.',
        });
      }

      //User logged in.
      res.status(200).json({
        message: 'Successfully logged in.',
        token: data.token,
      });
    });
  } else {
    const accessToken = jwt.sign(
      {
        uid: req.body.uid,
      },
      secretKey,
      {
        subject: 'Selenod JWT',
        issuer: 'Selenod',
      }
    );

    await User.create(
      {
        username: req.body.username,
        uid: req.body.uid,
        token: accessToken,
        translate: req.body.translate,
      },
      (err) => {
        if (err) {
          return res.status(500).json({
            message: 'Failed to create user.',
          });
        }
      }
    );

    // User created.
    res.status(200).json({
      message: 'Successfully created.',
      token: accessToken,
    });
  }
});

// parameter: { uid }
router.get('/projects/:uid', async (req, res) => {
  if (!req.params.uid) {
    return res.status(400).json({
      message: 'Bad Request.',
    });
  }

  await User.findOne({
    uid: req.params.uid,
  }).exec((err, data) => {
    if (err || !data) {
      return res.status(500).json({
        message: 'Failed to load user.',
      });
    }

    Project.find({ owner: data._id }).exec((err, data) => {
      if (err || !data) {
        return res.status(500).json({
          message: 'Fail to load project list.',
        });
      }

      res.status(200).json({
        projectList: data,
      });
    });
  });
});

// parameter: { token }
router.get('/:token', async (req, res) => {
  if (req.params.token === undefined) {
    return res.status(400).json({
      message: 'Bad Request.',
    });
  }

  await User.findOne({
    token: req.params.token,
  }).exec((err, data) => {
    if (err || !data) {
      return res.status(500).json({
        message: 'Failed to load user data.',
      });
    }

    res.status(200).json({
      uid: data.uid,
      username: data.username,
      translate: data.translate,
    });
  });
});

// body: { token, translate }
router.put('/', async (req, res) => {
  if (!req.body.token || !req.body.translate) {
    return res.status(400).json({
      message: 'Bad Request.',
    });
  }

  await User.updateOne(
    {
      token: req.body.token,
    },
    {
      translate: req.body.translate,
    }
  ).exec((err) => {
    if (err) {
      return res.status(500).json({
        message: 'Failed to update user.',
      });
    }

    res.status(200).json({
      message: 'Successfully updated.',
    });
  });
});

export default router;
