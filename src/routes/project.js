import express from 'express';
import User from '../schema/user.js';
import Project from '../schema/project.js';
import Window from '../schema/window.js';
import AssetList from '../schema/assetList.js';
import AssetData from '../schema/assetData.js';
import Element from '../schema/element.js';
import Script from '../schema/script.js';

import { __dirname } from '../app.js';
import fs from 'fs';
import shell from 'shelljs';

const router = express.Router();

router.get('/', (_, res) => {
  res.status(200).json({
    message: 'Welcome to the Project API.',
  });
});

// body: { name, uid }
router.post('/', async (req, res) => {
  if (req.body.name === undefined || req.body.uid === undefined) {
    return res.status(400).json({
      message: 'Bad Request.',
    });
  }

  await User.findOne({ uid: req.body.uid }).exec((err, data) => {
    if (err || !data) {
      return res.status(500).json({
        message: 'Fail to load user.',
      });
    }

    Script.create(
      {
        data: {},
      },
      (err, scriptData) => {
        if (err || !scriptData) {
          return res.status(500).json({
            message: 'Fail to create script.',
          });
        }

        Window.create(
          {
            name: 'Default Window',
            id: 0,
            windowData: {
              width: 500,
              height: 300,
            },
            scriptData: scriptData._id,
            elementData: [],
          },
          (err, windowData) => {
            if (err || !windowData) {
              return res.status(500).json({
                message: 'Fail to create window.',
              });
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
                  return res.status(500).json({
                    message: 'Fail to create project.',
                  });
                }

                res.status(200).json({
                  message: 'Successfully created.',
                });
              }
            );
          }
        );
      }
    );
  });
});

// parameter : { uid, id }
router.get('/:uid/:id', async (req, res) => {
  if (req.params.uid === undefined || req.params.id === undefined) {
    return res.status(400).json({
      message: 'Bad Request.',
    });
  }

  await User.findOne({
    uid: req.params.uid,
  }).exec((err, data) => {
    if (err || !data) {
      return res.status(500).json({
        message: 'Fail to load user.',
      });
    }

    Project.findOne({ owner: data._id, _id: req.params.id })
      .populate([
        {
          path: 'windowList',
          populate: {
            path: 'elementData',
            model: 'Element',
          },
        },
        {
          path: 'windowList',
          populate: {
            path: 'scriptData',
            model: 'Script',
          },
        },
      ])
      .populate('assetList')
      .populate('assetData')
      .exec((err, data) => {
        if (err || !data) {
          return res.status(500).json({
            message: 'Fail to load project.',
          });
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
    return res.status(400).json({
      message: 'Bad Request.',
    });
  }

  await User.findOne({
    uid: req.params.uid,
  }).exec((err, data) => {
    if (err || !data) {
      return res.status(500).json({
        message: 'Fail to load user.',
      });
    }

    Project.findOne({ owner: data._id, _id: req.params.id })
      .populate('windowList')
      .exec((err, data) => {
        if (err || !data || data.windowList.length === 0) {
          return res.status(500).json({
            message: 'Fail to load project.',
          });
        }

        data.windowList.forEach(async (window) => {
          await Element.deleteMany({
            _id: { $in: window.elementData },
          }).exec((err) => {
            if (err) {
              return res.status(500).json({
                message: 'Fail to delete element.',
              });
            }
          });

          await Script.deleteOne({ _id: window.scriptData }).exec((err) => {
            if (err) {
              return res.status(500).json({
                message: 'Fail to delete script.',
              });
            }
          });
        });

        Element.deleteMany({ _id: { $in: data.windowList.elementData } });

        Window.deleteMany(
          { _id: { $in: data.windowList } },
          (err, windowData) => {
            if (err) {
              return res.status(500).json({
                message: 'Fail to delete window.',
              });
            }

            AssetList.deleteMany({ _id: { $in: data.assetList } }, (err) => {
              if (err) {
                return res.status(500).json({
                  message: 'Fail to delete asset list.',
                });
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
                    return res.status(500).json({
                      message: 'Fail to delete project.',
                    });
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
    return res.status(400).json({
      message: 'Bad Request.',
    });
  }

  await User.findOne({
    uid: req.body.uid,
  }).exec((err, data) => {
    if (err || !data) {
      return res.status(500).json({
        message: 'Fail to load user.',
      });
    }

    Project.findOne({ owner: data._id, _id: req.body.id })
      .populate('windowList')
      .exec((err, data) => {
        if (err || !data) {
          return res.status(500).json({
            message: 'Fail to load project.',
          });
        }

        Script.create(
          {
            data: {},
          },
          (err, scriptData) => {
            if (err || !scriptData) {
              return res.status(500).json({
                message: 'Fail to create script.',
              });
            }
            Window.create(
              {
                name: req.body.name,
                id: data.windowList[data.windowList.length - 1].id + 1,
                windowData: {
                  width: 500,
                  height: 300,
                },
                scriptData: scriptData._id,
                elementData: [],
              },
              (err, windowData) => {
                if (err || !windowData) {
                  return res.status(500).json({
                    message: 'Fail to create window.',
                  });
                }

                Project.updateOne(
                  { _id: req.body.id },
                  {
                    windowList: [...data.windowList, windowData._id],
                    modifiedAt: new Date(),
                  }
                ).exec((err) => {
                  if (err) {
                    return res.status(500).json({
                      message: 'Fail to update project.',
                    });
                  }
                });

                res.status(200).json({
                  message: 'Successfully created.',
                });
              }
            );
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
    return res.status(400).json({
      message: 'Bad Request.',
    });
  }

  await User.findOne({
    uid: req.body.uid,
  }).exec((err, data) => {
    if (err || !data) {
      return res.status(500).json({
        message: 'Fail to load user.',
      });
    }

    Project.findOne({ owner: data._id, _id: req.body.id })
      .populate('windowList')
      .exec((err, data) => {
        if (err || !data) {
          return res.status(500).json({
            message: 'Fail to load project.',
          });
        }

        Window.updateOne(
          { _id: req.body._id },
          {
            name: req.body.name,
            windowData: req.body.windowData,
          }
        ).exec((err) => {
          if (err) {
            return res.status(500).json({
              message: 'Fail to update window.',
            });
          }

          Project.updateOne(
            { _id: req.body.id },
            {
              modifiedAt: new Date(),
            }
          ).exec((err) => {
            if (err) {
              return res.status(500).json({
                message: 'Fail to update project.',
              });
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
    return res.status(400).json({
      message: 'Bad Request.',
    });
  }

  await User.findOne({
    uid: req.params.uid,
  }).exec((err, data) => {
    if (err || !data) {
      return res.status(500).json({
        message: 'Fail to load user.',
      });
    }

    Project.findOne({ owner: data._id, _id: req.params.id })
      .populate('windowList')
      .exec((err, data) => {
        if (err || !data) {
          return res.status(500).json({
            message: 'Fail to load project.',
          });
        }

        if (data.windowList.length <= 1) {
          return res.status(405).json({
            message: 'Fail to delete window.',
          });
        }

        Element.deleteMany({
          _id: {
            $in: data.windowList.find(
              (window) => String(window._id) === String(req.params._id)
            ).elementData,
          },
        }).exec((err) => {
          if (err) {
            return res.status(500).json({
              message: 'Fail to delete element.',
            });
          }
        });

        Script.deleteOne({
          _id: data.windowList.find(
            (window) => String(window._id) === String(req.params._id)
          ).scriptData,
        }).exec((err) => {
          if (err) {
            return res.status(500).json({
              message: 'Fail to delete script.',
            });
          }
        });

        Window.deleteOne({ _id: req.params._id }, (err) => {
          if (err) {
            return res.status(500).json({
              message: 'Fail to delete window.',
            });
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
              return res.status(500).json({
                message: 'Fail to update project.',
              });
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
    return res.status(400).json({
      message: 'Bad Request.',
    });
  }

  await User.findOne({ uid: req.body.uid }).exec((err, data) => {
    if (err || !data) {
      return res.status(500).json({
        message: 'Fail to load user.',
      });
    }

    Project.findOne({ owner: data._id, _id: req.body.id })
      .populate('assetList')
      .exec((err, data) => {
        if (err || !data) {
          return res.status(500).json({
            message: 'Fail to load project.',
          });
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
              return res.status(500).json({
                message: 'Fail to create asset list.',
              });
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
                  return res.status(500).json({
                    message: 'Fail to create asset data.',
                  });
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
                    return res.status(500).json({
                      message: 'Fail to update project.',
                    });
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
    return res.status(400).json({
      message: 'Bad Request.',
    });
  }

  await User.findOne({
    uid: req.body.uid,
  }).exec((err, data) => {
    if (err || !data) {
      return res.status(500).json({
        message: 'Fail to load user.',
      });
    }

    Project.findOne({ owner: data._id, _id: req.body.id }).exec((err, data) => {
      if (err || !data) {
        return res.status(500).json({
          message: 'Fail to load project.',
        });
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
          return res.status(500).json({
            message: 'Fail to update asset data.',
          });
        }

        Project.updateOne(
          { _id: req.body.id },
          {
            modifiedAt: new Date(),
          }
        ).exec((err) => {
          if (err) {
            return res.status(500).json({
              message: 'Fail to update project.',
            });
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
    return res.status(400).json({
      message: 'Bad Request.',
    });
  }

  await User.findOne({
    uid: req.params.uid,
  }).exec((err, data) => {
    if (err || !data) {
      return res.status(500).json({
        message: 'Fail to load user.',
      });
    }

    Project.findOne({ owner: data._id, _id: req.params.id }).exec(
      (err, data) => {
        if (err || !data) {
          return res.status(500).json({
            message: 'Fail to load project.',
          });
        }

        AssetList.findOne({
          _id: { $in: data.assetList },
          id: req.params.index,
        }).exec((err, assetListData) => {
          if (err || !assetListData) {
            return res.status(500).json({
              message: 'Fail to load asset list.',
            });
          }

          AssetData.findOne({
            _id: { $in: data.assetData },
            id: req.params.index,
          }).exec((err, assetData) => {
            if (err || !assetData) {
              return res.status(500).json({
                message: 'Fail to load asset data.',
              });
            }

            AssetList.deleteOne({
              _id: assetListData._id,
            }).exec((err) => {
              if (err) {
                return res.status(500).json({
                  message: 'Fail to delete asset list.',
                });
              }

              AssetData.deleteOne({
                _id: assetData._id,
              }).exec((err) => {
                if (err) {
                  return res.status(500).json({
                    message: 'Fail to delete asset data.',
                  });
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
                    return res.status(500).json({
                      message: 'Fail to update project.',
                    });
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
    return res.status(400).json({
      message: 'Bad Request.',
    });
  }

  await User.findOne({
    uid: req.body.uid,
  }).exec((err, data) => {
    if (err || !data) {
      return res.status(500).json({
        message: 'Fail to load user.',
      });
    }

    Project.findOne({
      owner: data._id,
      _id: req.body.id,
    })
      .populate('windowList')
      .exec((err, data) => {
        if (err || !data) {
          return res.status(500).json({
            message: 'Fail to load project.',
          });
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
              return res.status(500).json({
                message: 'Fail to load window.',
              });
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
                fontWeight:
                  req.body.type === 'text' ||
                  req.body.type === 'button' ||
                  req.body.type === 'sl-input' ||
                  req.body.type === 'ml-input'
                    ? 400
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
                  return res.status(500).json({
                    message: 'Fail to create element.',
                  });
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
                    return res.status(500).json({
                      message: 'Fail to update window.',
                    });
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
                      return res.status(500).json({
                        message: 'Fail to update project.',
                      });
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
    return res.status(400).json({
      message: 'Bad Request.',
    });
  }

  await User.findOne({
    uid: req.body.uid,
  }).exec((err, data) => {
    if (err || !data) {
      return res.status(500).json({
        message: 'Fail to load user.',
      });
    }

    Project.findOne({ owner: data._id, _id: req.body.id })
      .populate('windowList')
      .exec((err, data) => {
        if (err || !data) {
          return res.status(500).json({
            message: 'Fail to load project.',
          });
        }

        Window.findOne({
          _id: { $in: data.windowList },
          id: req.body.windowId,
        }).exec((err, data) => {
          if (err || !data) {
            return res.status(500).json({
              message: 'Fail to load window.',
            });
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
              return res.status(500).json({
                message: 'Fail to update element.',
              });
            }

            Project.updateOne(
              { _id: req.body.id },
              {
                modifiedAt: new Date(),
              }
            ).exec((err) => {
              if (err) {
                return res.status(500).json({
                  message: 'Fail to update project.',
                });
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

// parameter : { uid, id, windowId, index }
router.delete('/element/:uid/:id/:windowId/:index', async (req, res) => {
  if (
    req.params.uid === undefined ||
    req.params.id === undefined ||
    req.params.windowId === undefined ||
    req.params.index === undefined
  ) {
    return res.status(400).json({
      message: 'Bad Request.',
    });
  }

  await User.findOne({
    uid: req.params.uid,
  }).exec((err, data) => {
    if (err || !data) {
      return res.status(500).json({
        message: 'Fail to load user.',
      });
    }

    Project.findOne({ owner: data._id, _id: req.params.id })
      .populate('windowList')
      .exec((err, data) => {
        if (err || !data) {
          return res.status(500).json({
            message: 'Fail to load project.',
          });
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
            return res.status(500).json({
              message: 'Fail to delete element.',
            });
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
              return res.status(500).json({
                message: 'Fail to update window.',
              });
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
                return res.status(500).json({
                  message: 'Fail to update project.',
                });
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

// body : { uid, id, windowId, scriptData }
router.put('/script', async (req, res) => {
  if (
    req.body.uid === undefined ||
    req.body.id === undefined ||
    req.body.windowId === undefined ||
    req.body.scriptData === undefined
  ) {
    return res.status(400).json({
      message: 'Bad Request.',
    });
  }

  await User.findOne({
    uid: req.body.uid,
  }).exec((err, data) => {
    if (err || !data) {
      return res.status(500).json({
        message: 'Fail to load user.',
      });
    }

    Project.findOne({ owner: data._id, _id: req.body.id })
      .populate('windowList')
      .exec((err, data) => {
        if (err || !data) {
          return res.status(500).json({
            message: 'Fail to load project.',
          });
        }

        Window.findOne({
          _id: { $in: data.windowList },
          id: req.body.windowId,
        }).exec((err, data) => {
          if (err || !data || !data.scriptData) {
            return res.status(500).json({
              message: 'Fail to load window.',
            });
          }

          Script.updateOne(
            {
              _id: data.scriptData,
            },
            {
              data: req.body.scriptData,
            }
          ).exec((err) => {
            if (err) {
              return res.status(500).json({
                message: 'Fail to update script.',
              });
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
                return res.status(500).json({
                  message: 'Fail to update project.',
                });
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

// parameter : { uid, id, data }
router.get('/build/:uid/:id/', async (req, res) => {
  if (req.params.uid === undefined || req.params.id === undefined) {
    return res.status(400).json({
      message: 'Bad Request.',
    });
  }

  await User.findOne({
    uid: req.params.uid,
  }).exec((err, data) => {
    if (err || !data) {
      return res.status(500).json({
        message: 'Fail to load user.',
      });
    }

    Project.findOne({ owner: data._id, _id: req.params.id })
      .populate('owner')
      .populate('assetList')
      .populate('assetData')
      .populate([
        {
          path: 'windowList',
          populate: {
            path: 'elementData',
            model: 'Element',
          },
        },
        {
          path: 'windowList',
          populate: {
            path: 'scriptData',
            model: 'Script',
          },
        },
      ])
      .exec((err, data) => {
        if (err || !data) {
          return res.status(500).json({
            message: 'Fail to load project.',
          });
        }

        const wsData = fs.createWriteStream(
          `${__dirname}/application/src/data.json`,
          {
            encoding: 'utf-8',
          }
        );

        wsData.write(JSON.stringify(data), (err) => {
          if (err) {
            console.log(err);

            return res.status(500).json({
              message: 'Fail to write data file.',
            });
          }

          const wsPackage = fs.createWriteStream(
            `${__dirname}/application/package.json`,
            {
              encoding: 'utf-8',
            }
          );

          wsPackage.write(
            JSON.stringify({
              name: 'application',
              productName: data.name,
              version: '1.0.0',
              description: 'My Selenod Application',
              main: '.webpack/main',
              scripts: {
                start: 'electron-forge start',
                package: 'electron-forge package',
                make: 'electron-forge make',
                publish: 'electron-forge publish',
                lint: 'echo "No linting configured"',
              },
              keywords: [],
              author: {
                name: 'Yejoon Kim',
                email: 'unsigndid@gmail.com',
              },
              license: 'MIT',
              config: {
                forge: {
                  packagerConfig: {},
                  makers: [
                    // {
                    //   name: '@electron-forge/maker-squirrel',
                    //   config: {
                    //     name: 'Selenod Application',
                    //   },
                    // },
                    // {
                    //   name: '@electron-forge/maker-zip',
                    //   platforms: ['darwin'],
                    // },
                    // {
                    //   name: '@electron-forge/maker-deb',
                    //   config: {},
                    // },
                    // {
                    //   name: '@electron-forge/maker-rpm',
                    //   config: {},
                    // },
                    {
                      name: '@electron-forge/maker-dmg',
                      config: {
                        format: 'ULFO',
                      },
                    },
                  ],
                  plugins: [
                    [
                      '@electron-forge/plugin-webpack',
                      {
                        mainConfig: './webpack.main.config.js',
                        renderer: {
                          config: './webpack.renderer.config.js',
                          entryPoints: [
                            {
                              html: './src/index.html',
                              js: './src/renderer.js',
                              name: 'main_window',
                              preload: {
                                js: './src/preload.js',
                              },
                            },
                          ],
                        },
                      },
                    ],
                  ],
                },
              },
              devDependencies: {
                '@babel/core': '^7.19.0',
                '@babel/preset-react': '^7.18.6',
                '@electron-forge/cli': '^6.0.0-beta.66',
                '@electron-forge/maker-deb': '^6.0.0-beta.66',
                '@electron-forge/maker-rpm': '^6.0.0-beta.66',
                '@electron-forge/maker-squirrel': '^6.0.0-beta.66',
                '@electron-forge/maker-zip': '^6.0.0-beta.66',
                '@electron-forge/maker-dmg': '^6.0.0-beta.66',
                '@electron-forge/plugin-webpack': '^6.0.0-beta.66',
                '@vercel/webpack-asset-relocator-loader': '^1.7.3',
                'babel-loader': '^8.2.5',
                'css-loader': '^6.7.1',
                electron: '20.1.3',
                'json-loader': '^0.5.7',
                'node-loader': '^2.0.0',
                'style-loader': '^3.3.1',
              },
              dependencies: {
                '@electron/remote': '^2.0.8',
                'electron-squirrel-startup': '^1.0.0',
                'file-loader': '^6.2.0',
                react: '^18.2.0',
                'react-dom': '^18.2.0',
                'react-router-dom': '^6.3.0',
              },
            }),
            (err) => {
              if (err) {
                console.log(err);

                return res.status(500).json({
                  message: 'Fail to write package.json.',
                });
              }
            }
          );

          shell.cd(`${__dirname}/application`);
          shell.exec('npm run make', { silent: true }, () => {
            res.download(
              `${__dirname}/application/out/make/${data.name}-1.0.0-arm64.dmg`,
              `${data.name}.dmg`
            );
          });
        });
      });
  });
});

export default router;
