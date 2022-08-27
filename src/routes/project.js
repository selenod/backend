import express from 'express';
import User from '../schema/user.js';
import Project from '../schema/project.js';
import Window from '../schema/window.js';
import AssetList from '../schema/assetList.js';
import AssetData from '../schema/assetData.js';
import Element from '../schema/element.js';

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
  if (req.params.uid === undefined || req.params.id === undefined) {
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
      .populate({
        path: 'windowList',
        populate: {
          path: 'elementData',
        },
      })
      .populate('assetList')
      .populate('assetData')
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
  if (req.params.uid === undefined || req.params.id === undefined) {
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

        data.windowList.forEach(async (window) => {
          await Element.deleteMany({
            _id: { $in: window.elementData },
          }).exec((err) => {
            if (err) {
              res.status(500).json({
                message: 'Fail to delete element.',
              });

              return;
            }
          });
        });

        Element.deleteMany({ _id: { $in: data.windowList.elementData } });

        Window.deleteMany(
          { _id: { $in: data.windowList } },
          (err, windowData) => {
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
          }
        );
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

// body : { uid, id, _id, name, windowData }
router.put('/window', async (req, res) => {
  if (
    req.body.uid === undefined ||
    req.body.id === undefined ||
    req.body._id === undefined ||
    req.body.name === undefined ||
    req.body.windowData === undefined
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

// parameter : { uid, id, _id }
router.delete('/window/:uid/:id/:_id', async (req, res) => {
  if (
    req.params.uid === undefined ||
    req.params.id === undefined ||
    req.params._id === undefined
  ) {
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

// body : { uid, id, name, type, extension?, contents? }
router.post('/asset', async (req, res) => {
  if (
    req.body.uid === undefined ||
    req.body.id === undefined ||
    req.body.name === undefined ||
    req.body.type === undefined
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

    Project.findOne({ owner: data._id, _id: req.body.id })
      .populate('assetList')
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

// parameter : { uid, id, index }
router.delete('/asset/:uid/:id/:index', async (req, res) => {
  if (
    req.params.uid === undefined ||
    req.params.id === undefined ||
    req.params.index === undefined
  ) {
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

// body : { uid, id, windowId, name, type }
router.post('/element', async (req, res) => {
  if (
    req.body.uid === undefined ||
    req.body.id === undefined ||
    req.body.windowId === undefined ||
    req.body.name === undefined ||
    req.body.type === undefined
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

    Project.findOne({
      owner: data._id,
      _id: req.body.id,
    })
      .populate('windowList')
      .exec((err, data) => {
        if (err || !data) {
          res.status(500).json({
            message: 'Fail to load project.',
          });

          return;
        }

        Window.findOne({
          _id: { $in: data.windowList },
          id: req.body.windowId,
        })
          .populate(
            data.windowList.find(
              (window) => String(window.id) === String(req.body.windowId)
            ).elementData.length === 0
              ? null
              : 'elementData'
          )
          .exec((err, data) => {
            if (err || !data) {
              res.status(500).json({
                message: 'Fail to load window.',
              });

              return;
            }

            Element.create(
              {
                name: req.body.name,
                id:
                  data.elementData.length === 0
                    ? 0
                    : data.elementData[data.elementData.length - 1].id + 1,
                type: req.body.type,
                x: '0',
                y: '0',
                xAlign: 0,
                yAlign: 0,
                rotation: '0',
                index: 0,
                width:
                  req.body.type === 'line'
                    ? '250'
                    : req.body.type === 'image' ||
                      req.body.type === 'video' ||
                      req.body.type === 'sl-input' ||
                      req.body.type === 'ml-input'
                    ? '150'
                    : req.body.type === 'button'
                    ? '70'
                    : req.body.type === 'checkbox'
                    ? '15'
                    : undefined,
                height:
                  req.body.type === 'line'
                    ? '1'
                    : req.body.type === 'image' || req.body.type === 'video'
                    ? '150'
                    : req.body.type === 'button'
                    ? '40'
                    : req.body.type === 'checkbox'
                    ? '15'
                    : req.body.type === 'sl-input'
                    ? '35'
                    : req.body.type === 'ml-input'
                    ? '70'
                    : undefined,
                text:
                  req.body.type === 'text' ||
                  req.body.type === 'button' ||
                  req.body.type === 'sl-input' ||
                  req.body.type === 'ml-input'
                    ? 'New Text'
                    : undefined,
                fontSize:
                  req.body.type === 'text' ||
                  req.body.type === 'button' ||
                  req.body.type === 'sl-input' ||
                  req.body.type === 'ml-input'
                    ? 16
                    : undefined,
                color:
                  req.body.type === 'text' ||
                  req.body.type === 'sl-input' ||
                  req.body.type === 'ml-input'
                    ? '#000'
                    : req.body.type === 'button'
                    ? '#fff'
                    : req.body.type === 'checkbox'
                    ? '#8052ff'
                    : undefined,
                backgroundColor:
                  req.body.type === 'line'
                    ? '#d8e0e5'
                    : req.body.type === 'button'
                    ? '#7f52ff'
                    : req.body.type === 'checkbox'
                    ? '#fff'
                    : undefined,
                borderRadius:
                  req.body.type === 'image' ||
                  req.body.type === 'video' ||
                  req.body.type === 'sl-input' ||
                  req.body.type === 'ml-input'
                    ? '7'
                    : req.body.type === 'button' || req.body.type === 'checkbox'
                    ? '5'
                    : undefined,
                borderColor:
                  req.body.type === 'checkbox' ||
                  req.body.type === 'sl-input' ||
                  req.body.type === 'ml-input'
                    ? '#e2e2e2'
                    : undefined,
                part: req.body.type === 'line' ? 'Horizontal' : undefined,
                canControl: req.body.type === 'video' ? false : undefined,
                isChecked: req.body.type === 'checkbox' ? false : undefined,
              },
              (err, elementData) => {
                if (err || !elementData) {
                  res.status(500).json({
                    message: 'Fail to create element.',
                  });

                  return;
                }

                Window.updateOne(
                  {
                    _id: data._id,
                  },
                  {
                    elementData: [...data.elementData, elementData._id],
                  }
                ).exec((err) => {
                  if (err) {
                    res.status(500).json({
                      message: 'Fail to update window.',
                    });

                    return;
                  }

                  Project.updateOne(
                    {
                      _id: req.body.id,
                    },
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
                      message: 'Successfully created.',
                    });
                  });
                });
              }
            );
          });
      });
  });
});

// body : { uid, id, windowId, index, prop }
router.put('/element', async (req, res) => {
  if (
    req.body.uid === undefined ||
    req.body.id === undefined ||
    req.body.windowId === undefined ||
    req.body.index === undefined ||
    req.body.prop === undefined
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

        Window.findOne({
          _id: { $in: data.windowList },
          id: req.body.windowId,
        }).exec((err, data) => {
          if (err || !data) {
            res.status(500).json({
              message: 'Fail to load window.',
            });

            return;
          }

          Element.updateOne(
            {
              _id: { $in: data.elementData },
              id: req.body.index,
            },
            {
              ...req.body.prop,
            }
          ).exec((err) => {
            if (err) {
              res.status(500).json({
                message: 'Fail to update element.',
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
});

// body: { uid, id, windowId, index }
router.delete('/element/:uid/:id/:windowId/:index', async (req, res) => {
  if (
    req.params.uid === undefined ||
    req.params.id === undefined ||
    req.params.windowId === undefined ||
    req.params.index === undefined
  ) {
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

        Element.deleteOne({
          _id: {
            $in: data.windowList.find(
              (window) => String(window.id) === String(req.params.windowId)
            ).elementData,
          },
          id: req.params.index,
        }).exec((err) => {
          if (err) {
            res.status(500).json({
              message: 'Fail to delete element.',
            });

            return;
          }

          Window.updateOne(
            {
              _id: { $in: data.windowList },
              id: req.params.windowId,
            },
            {
              elementData: data.windowList
                .find(
                  (window) => String(window.id) === String(req.params.windowId)
                )
                .elementData.filter(
                  (element) => String(element.id) !== String(req.params.index)
                )
                .map((element) => element._id),
            }
          ).exec((err) => {
            if (err) {
              res.status(500).json({
                message: 'Fail to update window.',
              });

              return;
            }

            Project.updateOne(
              {
                _id: req.params.id,
              },
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
                message: 'Successfully deleted.',
              });
            });
          });
        });
      });
  });
});

export default router;
