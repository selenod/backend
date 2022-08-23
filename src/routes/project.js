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

// body: { name, uid }
router.post('/', async (req, res) => {
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

// parameter : { uid, id }
router.delete('/:uid/:id', async (req, res) => {
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
        if (err || !data || data.windowList.length === 0) {
          res.status(500).json({
            message: 'Fail to load project.',
          });

          return;
        }

        Window.deleteMany({ _id: { $in: data.windowList } }, (err) => {
          if (err) {
            res.status(500).json({
              message: 'Fail to delete window.',
            });

            return;
          }
        });
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

// body : { uid, id, name }
router.post('/window', async (req, res) => {
  if (!req.body.uid || !req.body.id || !req.body.name) {
    res.status(400).json({
      message: 'Bad Request.',
    });

    return;
  }

  await User.findOne({
    uid: req.body.uid,
  }).exec((err, data) => {
    if (err || !data) {
      res.status(500).json({
        message: 'Fail to load user.',
      });

      return;
    }

    Project.findOne({ owner: data._id, _id: req.body.id })
      .populate('windowList')
      .exec((err, data) => {
        if (err || !data) {
          res.status(500).json({
            message: 'Fail to load project.',
          });

          return;
        }

        Window.create(
          {
            name: req.body.name,
            id: data.windowList[data.windowList.length - 1].id + 1,
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

            Project.updateOne(
              { _id: req.body.id },
              {
                windowList: [...data.windowList, windowData._id],
                modifiedAt: new Date(),
              }
            ).exec((err) => {
              if (err) {
                res.status(500).json({
                  message: 'Fail to update project.',
                });

                return;
              }
            });

            res.status(200).json({
              message: 'Successfully created.',
            });
          }
        );
      });
  });
});

// parameter : { uid, id, _id }
router.delete('/window/:uid/:id/:_id', async (req, res) => {
  if (!req.params.uid || !req.params.id || !req.params._id) {
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

        if (data.windowList.length <= 1) {
          res.status(405).json({
            message: 'Fail to delete window.',
          });

          return;
        }

        Window.deleteOne({ _id: req.params._id }, (err) => {
          if (err) {
            res.status(500).json({
              message: 'Fail to delete window.',
            });

            return;
          }

          res.status(200).json({
            message: 'Successfully deleted.',
          });
        });
      });
  });
});

// body : { uid, id, _id, name, windowData }
router.put('/window', async (req, res) => {
  if (
    !req.body.uid ||
    !req.body.id ||
    !req.body._id ||
    !req.body.name ||
    !req.body.windowData
  ) {
    res.status(400).json({
      message: 'Bad Request.',
    });

    return;
  }

  await User.findOne({
    uid: req.body.uid,
  }).exec((err, data) => {
    if (err || !data) {
      res.status(500).json({
        message: 'Fail to load user.',
      });

      return;
    }

    Project.findOne({ owner: data._id, _id: req.body.id })
      .populate('windowList')
      .exec((err, data) => {
        if (err || !data) {
          res.status(500).json({
            message: 'Fail to load project.',
          });

          return;
        }

        Window.findOne({ _id: req.body._id }).exec((err, data) => {
          if (err || !data) {
            res.status(500).json({
              message: 'Fail to load window.',
            });

            return;
          }

          Window.updateOne(
            { _id: req.body._id },
            {
              name: req.body.name,
              windowData: req.body.windowData,
              modifiedAt: new Date(),
            }
          ).exec((err) => {
            if (err) {
              res.status(500).json({
                message: 'Fail to update window.',
              });

              return;
            }

            res.status(200).json({
              message: 'Successfully updated.',
            });
          });
        });
      });
  });
});

export default router;
