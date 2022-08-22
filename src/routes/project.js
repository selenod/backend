import express from 'express';
import User from '../schema/user.js';
import Project from '../schema/project.js';
import Window from '../schema/window.js';

const router = express.Router();

router.get('/', (_, res) => {
  res.status(200).json({
    message: 'Welcome to the Project API.',
  });
});

// parameter : { uid }
router.get('/list/:uid', async (req, res) => {
  if (!req.params.uid) {
    res.status(400).json({
      message: 'Bad Request.',
    });

    return;
  }

  await User.findOne({
    uid: req.params.uid,
  }).exec((err, data) => {
    if (err || !data) {
      res.status(500).json({
        message: 'Failed to load user.',
      });

      return;
    }

    Project.find({ owner: data._id }).exec((err, data) => {
      if (err || !data) {
        res.status(500).json({
          message: 'Fail to load project list.',
        });

        return;
      }

      res.status(200).json({
        projectList: data,
      });
    });
  });
});

// parameter : { uid, id }
router.get('/:uid/:id', async (req, res) => {
  if (!req.params.uid || !req.params.id) {
    res.status(400).json({
      message: 'Bad Request.',
    });

    return;
  }

  await User.findOne({
    uid: req.params.uid,
  }).exec((err, data) => {
    if (err || !data) {
      res.status(500).json({
        message: 'Fail to load user.',
      });

      return;
    }

    Project.findOne({ owner: data._id, _id: req.params.id })
      .populate('windowList')
      .exec((err, data) => {
        if (err || !data) {
          res.status(500).json({
            message: 'Fail to load project.',
          });

          return;
        }

        res.status(200).json({
          project: data,
        });
      });
  });
});

// body: { name, uid }
router.post('/create', async (req, res) => {
  if (!req.body.name || !req.body.uid) {
    res.status(400).json({
      message: 'Bad Request.',
    });

    return;
  }

  await User.findOne({ uid: req.body.uid }).exec((err, data) => {
    if (err || !data) {
      res.status(404).json({
        message: 'User not found.',
      });

      return;
    }

    Window.create(
      {
        name: 'Default Window',
        id: 0,
        windowData: {
          width: 1366,
          height: 768,
        },
        nodeData: [],
        elementData: [],
      },
      (err, windowData) => {
        if (err || !windowData) {
          res.status(500).json({
            message: 'Fail to create window.',
          });

          return;
        }

        Project.create(
          {
            name: req.body.name,
            owner: data._id,
            createAt: new Date(),
            modifiedAt: new Date(),
            windowList: [windowData._id],
            assetList: [],
            assetData: [],
            assetLength: 0,
          },
          (err, _) => {
            if (err) {
              res.status(500).json({
                message: 'Fail to create project.',
              });

              return;
            }

            res.status(200).json({
              message: 'Successfully created.',
            });
          }
        );
      }
    );
  });
});

// parameter : { uid, id }
router.delete('/delete/:uid/:id', async (req, res) => {
  if (!req.params.uid || !req.params.id) {
    res.status(400).json({
      message: 'Bad Request.',
    });

    return;
  }

  await User.findOne({
    uid: req.params.uid,
  }).exec((err, data) => {
    if (err || !data) {
      res.status(500).json({
        message: 'Fail to load user.',
      });

      return;
    }

    Project.findOne({ owner: data._id, _id: req.params.id })
      .populate('windowList')
      .exec((err, data) => {
        if (err || !data) {
          res.status(500).json({
            message: 'Fail to load project.',
          });

          return;
        }

        if (data.windowList.length > 0) {
          Window.deleteMany({ _id: { $in: data.windowList } }, (err) => {
            if (err) {
              res.status(500).json({
                message: 'Fail to delete window.',
              });

              return;
            }
          });
        }
      });

    Project.deleteOne({
      owner: data._id,
      _id: req.params.id,
    }).exec((err) => {
      if (err) {
        res.status(500).json({
          message: 'Fail to delete project.',
        });

        return;
      }

      res.status(200).json({
        message: 'Successfully deleted.',
      });
    });
  });
});

export default router;
