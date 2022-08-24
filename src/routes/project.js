import express from 'express';
import User from '../schema/user.js';
import Project from '../schema/project.js';
import Window from '../schema/window.js';
import AssetList from '../schema/assetList.js';
import AssetData from '../schema/assetData.js';

const router = express.Router();

router.get('/', (_, res) => {
  res.status(200).json({
    message: 'Welcome to the Project API.',
  });
});

// body: { name, uid }
router.post('/', async (req, res) => {
  if (req.body.name === undefined || req.body.uid === undefined) {
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
          (err) => {
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
    Project.findOne({ owner: data._id, _id: req.params.id }).exec(
      (err, data) => {
        if (err || !data) {
          res.status(500).json({
            message: 'Fail to load project.',
          });

          return;
        }

        Project.findOne({ _id: req.params.id })
          .populate('windowList')
          .populate(data.assetLength === 0 ? null : 'assetList')
          .populate(data.assetLength === 0 ? null : 'assetData')
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
      }
    );
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

          AssetList.deleteMany({ _id: { $in: data.assetList } }, (err) => {
            if (err) {
              res.status(500).json({
                message: 'Fail to delete asset list.',
              });

              return;
            }

            AssetData.deleteMany({ _id: { $in: data.assetData } }, (err) => {
              if (err) {
                res.status(500).json({
                  message: 'Fail to delete asset data.',
                });
              }

              Project.deleteOne({
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
        });
      });
  });
});

// body : { uid, id, name }
router.post('/window', async (req, res) => {
  if (
    req.body.uid === undefined ||
    req.body.id === undefined ||
    req.body.name === undefined
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

          Project.updateOne(
            { _id: req.params.id },
            {
              windowList: data.windowList
                .filter((window) => String(window._id) !== req.params._id)
                .map((window) => window._id),
              modifiedAt: new Date(),
            }
          ).exec((err) => {
            if (err) {
              res.status(500).json({
                message: 'Fail to update project.',
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
});

// body : { uid, id, _id, name, windowData }
router.put('/window', async (req, res) => {
  if (
    req.body.uid === undefined ||
    req.body.id === undefined ||
    !req.body._id ||
    req.body.name === undefined ||
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

        Window.updateOne(
          { _id: req.body._id },
          {
            name: req.body.name,
            windowData: req.body.windowData,
          }
        ).exec((err) => {
          if (err) {
            res.status(500).json({
              message: 'Fail to update window.',
            });

            return;
          }

          Project.updateOne(
            { _id: req.body.id },
            {
              modifiedAt: new Date(),
            }
          ).exec((err) => {
            if (err) {
              res.status(500).json({
                message: 'Fail to update project.',
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

// body : { uid, id, name, type, extension?, contents? }
router.post('/asset', async (req, res) => {
  if (
    req.body.uid === undefined ||
    req.body.id === undefined ||
    req.body.name === undefined ||
    !req.body.type
  ) {
    res.status(400).json({
      message: 'Bad Request.',
    });

    return;
  }

  await User.findOne({ uid: req.body.uid }).exec((err, data) => {
    if (err || !data) {
      res.status(500).json({
        message: 'Fail to load user.',
      });

      return;
    }

    Project.findOne({ owner: data._id, _id: req.body.id }).exec((err, data) => {
      if (err || !data) {
        res.status(500).json({
          message: 'Fail to load project.',
        });

        return;
      }

      Project.findOne({ _id: req.body.id })
        .populate(data.assetLength === 0 ? null : 'assetList')
        .exec((err, data) => {
          if (err || !data) {
            res.status(500).json({
              message: 'Fail to load project.',
            });

            return;
          }

          AssetList.create(
            {
              id:
                data.assetLength === 0
                  ? 0
                  : data.assetList[data.assetList.length - 1].id + 1,
            },
            (err, assetListData) => {
              if (err) {
                res.status(500).json({
                  message: 'Fail to create asset list.',
                });

                return;
              }

              AssetData.create(
                {
                  name: req.body.name,
                  id: assetListData.id,
                  type: req.body.type,
                  contents: req.body.contents,
                  extension: req.body.extension,
                },
                (err, assetData) => {
                  if (err) {
                    res.status(500).json({
                      message: 'Fail to create asset data.',
                    });

                    return;
                  }

                  Project.updateOne(
                    {
                      _id: req.body.id,
                    },
                    {
                      modifiedAt: new Date(),
                      assetList: [...data.assetList, assetListData._id],
                      assetData: [...data.assetData, assetData._id],
                      assetLength: data.assetLength + 1,
                    }
                  ).exec((err) => {
                    if (err) {
                      res.status(500).json({
                        message: 'Fail to update project.',
                      });

                      return;
                    }

                    res.status(200).json({
                      message: 'Successfully created.',
                    });
                  });
                }
              );
            }
          );
        });
    });
  });
});

// parameter : { uid, id, index }
router.delete('/asset/:uid/:id/:index', async (req, res) => {
  if (!req.params.uid || !req.params.id || !req.params.index) {
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

    Project.findOne({ owner: data._id, _id: req.params.id }).exec(
      (err, data) => {
        if (err || !data) {
          res.status(500).json({
            message: 'Fail to load project.',
          });

          return;
        }

        AssetList.findOne({
          _id: { $in: data.assetList },
          id: req.params.index,
        }).exec((err, assetListData) => {
          if (err || !assetListData) {
            res.status(500).json({
              message: 'Fail to load asset list.',
            });

            return;
          }

          AssetData.findOne({
            _id: { $in: data.assetData },
            id: req.params.index,
          }).exec((err, assetData) => {
            if (err || !assetData) {
              res.status(500).json({
                message: 'Fail to load asset data.',
              });

              return;
            }

            AssetList.deleteOne({
              _id: assetListData._id,
            }).exec((err) => {
              if (err) {
                res.status(500).json({
                  message: 'Fail to delete asset list.',
                });

                return;
              }

              AssetData.deleteOne({
                _id: assetData._id,
              }).exec((err) => {
                if (err) {
                  res.status(500).json({
                    message: 'Fail to delete asset data.',
                  });

                  return;
                }

                Project.updateOne(
                  {
                    _id: req.params.id,
                  },
                  {
                    assetList: data.assetList
                      .filter(
                        (asset) =>
                          String(asset._id) !== String(assetListData._id)
                      )
                      .map((asset) => asset._id),
                    assetData: data.assetData
                      .filter(
                        (asset) => String(asset._id) !== String(assetData._id)
                      )
                      .map((asset) => asset._id),
                    assetLength: data.assetLength - 1,
                    modifiedAt: new Date(),
                  }
                ).exec((err) => {
                  if (err) {
                    res.status(500).json({
                      message: 'Fail to update project.',
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
        });
      }
    );
  });
});

// body : { uid, id, index, name, extension }
router.put('/asset', async (req, res) => {
  if (
    req.body.uid === undefined ||
    req.body.id === undefined ||
    req.body.index === undefined ||
    req.body.name === undefined ||
    req.body.extension === undefined
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

    Project.findOne({ owner: data._id, _id: req.body.id }).exec((err, data) => {
      if (err || !data) {
        res.status(500).json({
          message: 'Fail to load project.',
        });

        return;
      }

      AssetData.updateOne(
        {
          _id: { $in: data.assetData },
          id: req.body.index,
        },
        {
          name: req.body.name,
          extension: req.body.extension,
        }
      ).exec((err) => {
        if (err) {
          res.status(500).json({
            message: 'Fail to update asset data.',
          });

          return;
        }

        Project.updateOne(
          { _id: req.body.id },
          {
            modifiedAt: new Date(),
          }
        ).exec((err) => {
          if (err) {
            res.status(500).json({
              message: 'Fail to update project.',
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
