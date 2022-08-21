import express from 'express';
import User from '../schema/user.js';
import Project from '../schema/project.js';

const router = express.Router();

router.get('/', (req, res) => {
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
    if (err) {
      res.status(400).json({
        message: err,
      });

      return;
    }

    Project.find({ owner: data._id }).exec((err, data) => {
      if (err) {
        res.status(400).json({
          message: err,
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
    if (err) {
      res.status(400).json({
        message: err,
      });

      return;
    }

    Project.findOne({ owner: data._id, _id: req.params.id }).exec(
      (err, data) => {
        if (err) {
          res.status(400).json({
            message: err,
          });

          return;
        }

        res.status(200).json({
          project: data,
        });
      }
    );
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
    if (err) {
      res.status(400).json({
        message: err,
      });

      return;
    }

    Project.create({
      name: req.body.name,
      owner: data._id,
      createAt: new Date(),
      modifiedAt: new Date(),
      windowList: [],
      assetList: [],
      assetData: [],
      assetLength: 0,
    });

    res.status(200).json({
      message: 'Successfully created.',
    });
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
    if (err) {
      res.status(400).json({
        message: err,
      });

      return;
    }

    Project.deleteOne({
      owner: data._id,
      _id: req.params.id,
    }).exec((err, _) => {
      if (err) {
        res.status(400).json({
          message: err,
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
