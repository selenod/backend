import { HashRouter, Route, Routes } from 'react-router-dom';
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import data from './data.json';
import 'pretendard/dist/web/variable/pretendardvariable.css';

function Page() {
  const [elementData, setElementData] = React.useState([]);
  /*
    id: number;
    contents?: string;
  */
  const [assetData, setAssetData] = React.useState([]);

  React.useEffect(() => {
    setElementData(
      data.windowList[
        window.location.hash === '' ? 0 : window.location.hash.substring(2)
      ].elementData
    );

    setAssetData(
      data.assetData.map((asset) => ({
        id: asset.id,
        contents: asset.contents ?? undefined,
      }))
    );

    console.log(window.location.href);
  }, []);

  return (
    <div>
      {/* Code for test. */}
      {window.location.hash === '' ? (
        data.windowList.map((windowData) => (
          <div key={windowData.id}>
            <button
              onClick={() => {
                window.open(
                  `${MAIN_WINDOW_WEBPACK_ENTRY}#/${windowData.id}`,
                  '_blank',
                  `
                  width=${windowData.windowData.width},
                  height=${windowData.windowData.height},
                  nodeIntegration=no,
                  title=${windowData.name},
                  resizable=false, fullscreenable=false
                  `
                );
              }}
            >
              {windowData.name} 생성(wid: {windowData.id})
            </button>
            <br />
          </div>
        ))
      ) : (
        <div>
          {elementData.length === 0
            ? null
            : elementData.map((element) => {
                switch (element.type) {
                  case 'text':
                    return (
                      <pre
                        key={element.id}
                        style={{
                          position: 'absolute',
                          top: `calc(${
                            !isNaN(element.y) ? `${element.y}px` : element.y
                          })`,
                          left: `calc(${
                            !isNaN(element.x) ? `${element.x}px` : element.x
                          })`,
                          fontSize: element.fontSize,
                          fontWeight: element.fontWeight,
                          color: element.color,
                          margin: 0,
                          backgroundColor: element.backgroundColor,
                          transform: `translate(-${element.xAlign}%, -${
                            element.yAlign
                          }%) rotate(calc(${
                            !isNaN(element.rotation)
                              ? `${element.rotation}deg`
                              : element.rotation
                          }))`,
                          zIndex: -10000 + element.index,
                        }}
                      >
                        {element.text}
                      </pre>
                    );
                  case 'line':
                    return (
                      <div
                        key={element.id}
                        style={{
                          position: 'absolute',
                          top: `calc(${
                            !isNaN(element.y) ? `${element.y}px` : element.y
                          })`,
                          left: `calc(${
                            !isNaN(element.x) ? `${element.x}px` : element.x
                          })`,
                          width: `calc(${
                            !isNaN(element.width)
                              ? `${element.width}px`
                              : element.width
                          })`,
                          height: `calc(${
                            !isNaN(element.height)
                              ? `${element.height}px`
                              : element.height
                          })`,
                          borderRadius: '1rem',
                          backgroundColor: element.backgroundColor,
                          transform: `translate(-${element.xAlign}%, -${
                            element.yAlign
                          }%) rotate(calc(${
                            !isNaN(element.rotation)
                              ? `${element.rotation}deg`
                              : element.rotation
                          }))`,
                          zIndex: -10000 + element.index,
                        }}
                      />
                    );
                  case 'image':
                    return (
                      <img
                        key={element.id}
                        src={
                          assetData.find((asset) => asset.id === element.src)
                            ?.contents
                        }
                        alt=""
                        style={{
                          position: 'absolute',
                          top: `calc(${
                            !isNaN(element.y) ? `${element.y}px` : element.y
                          })`,
                          left: `calc(${
                            !isNaN(element.x) ? `${element.x}px` : element.x
                          })`,
                          width: `calc(${
                            !isNaN(element.width)
                              ? `${element.width}px`
                              : element.width
                          })`,
                          height: `calc(${
                            !isNaN(element.height)
                              ? `${element.height}px`
                              : element.height
                          })`,
                          transform: `translate(-${element.xAlign}%, -${
                            element.yAlign
                          }%) rotate(calc(${
                            !isNaN(element.rotation)
                              ? `${element.rotation}deg`
                              : element.rotation
                          }))`,
                          borderRadius: `calc(${
                            !isNaN(element.borderRadius)
                              ? `${element.borderRadius}px`
                              : element.borderRadius
                          })`,
                          zIndex: -10000 + element.index,
                        }}
                      />
                    );
                  case 'video':
                    return (
                      <video
                        key={element.id}
                        src={
                          assetData.find((asset) => asset.id === element.src)
                            ?.contents
                        }
                        controls
                        style={{
                          position: 'absolute',
                          top: `calc(${
                            !isNaN(element.y) ? `${element.y}px` : element.y
                          })`,
                          left: `calc(${
                            !isNaN(element.x) ? `${element.x}px` : element.x
                          })`,
                          width: `calc(${
                            !isNaN(element.width)
                              ? `${element.width}px`
                              : element.width
                          })`,
                          height: `calc(${
                            !isNaN(element.height)
                              ? `${element.height}px`
                              : element.height
                          })`,
                          transform: `translate(-${element.xAlign}%, -${
                            element.yAlign
                          }%) rotate(calc(${
                            !isNaN(element.rotation)
                              ? `${element.rotation}deg`
                              : element.rotation
                          }))`,
                          borderRadius: `calc(${
                            !isNaN(element.borderRadius)
                              ? `${element.borderRadius}px`
                              : element.borderRadius
                          })`,
                          zIndex: -10000 + element.index,
                        }}
                      ></video>
                    );
                  case 'button':
                    return (
                      <div
                        key={element.id}
                        className="button"
                        style={{
                          position: 'absolute',
                          top: `calc(${
                            !isNaN(element.y) ? `${element.y}px` : element.y
                          })`,
                          left: `calc(${
                            !isNaN(element.x) ? `${element.x}px` : element.x
                          })`,
                          width: `calc(${
                            !isNaN(element.width)
                              ? `${element.width}px`
                              : element.width
                          })`,
                          height: `calc(${
                            !isNaN(element.height)
                              ? `${element.height}px`
                              : element.height
                          })`,
                          transform: `translate(-${element.xAlign}%, -${
                            element.yAlign
                          }%) rotate(calc(${
                            !isNaN(element.rotation)
                              ? `${element.rotation}deg`
                              : element.rotation
                          }))`,
                          borderRadius: `calc(${
                            !isNaN(element.borderRadius)
                              ? `${element.borderRadius}px`
                              : element.borderRadius
                          })`,
                          backgroundColor: element.backgroundColor,
                          transition: 'ease-out background-color 100ms',
                          paddingLeft: 15,
                          paddingRight: 15,
                          minWidth: 70,
                          border: 0,
                          outline: 0,
                          color: element.color,
                          fontSize: element.fontSize,
                          fontWeight: element.fontWeight,
                          zIndex: -10000 + element.index,
                        }}
                      >
                        <p
                          style={{
                            position: 'relative',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            textAlign: 'center',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            width: '100%',
                            margin: 0,
                          }}
                        >
                          {element.text}
                        </p>
                      </div>
                    );
                  case 'checkbox':
                    return (
                      <div
                        key={element.id}
                        style={{
                          position: 'absolute',
                          top: `calc(${
                            !isNaN(element.y) ? `${element.y}px` : element.y
                          })`,
                          left: `calc(${
                            !isNaN(element.x) ? `${element.x}px` : element.x
                          })`,
                          width: `calc(${
                            !isNaN(element.width)
                              ? `${element.width}px`
                              : element.width
                          })`,
                          height: `calc(${
                            !isNaN(element.width)
                              ? `${element.width}px`
                              : element.width
                          })`,
                          backgroundColor: element.backgroundColor,
                          transform: `translate(-${element.xAlign}%, -${
                            element.yAlign
                          }%) rotate(calc(${
                            !isNaN(element.rotation)
                              ? `${element.rotation}deg`
                              : element.rotation
                          }))`,
                          zIndex: -10000 + element.index,
                          borderRadius: `calc(${
                            !isNaN(element.borderRadius)
                              ? `${element.borderRadius}px`
                              : element.borderRadius
                          })`,
                          boxSizing: 'border-box',
                          border: element.isChecked
                            ? undefined
                            : `1.5px solid ${element.borderColor}`,
                        }}
                      >
                        {element.isChecked ? (
                          <div
                            style={{
                              width: '100%',
                              height: '100%',
                              backgroundColor: element.color,
                              borderRadius: `calc(${
                                !isNaN(element.borderRadius)
                                  ? `${element.borderRadius}px`
                                  : element.borderRadius
                              })`,
                              cursor: 'pointer',
                            }}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 20 20"
                              fill="#fff"
                              style={{
                                position: 'relative',
                              }}
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                        ) : null}
                      </div>
                    );
                  case 'sl-input':
                    return (
                      <input
                        key={element.id}
                        style={{
                          position: 'absolute',
                          top: `calc(${
                            !isNaN(element.y) ? `${element.y}px` : element.y
                          })`,
                          left: `calc(${
                            !isNaN(element.x) ? `${element.x}px` : element.x
                          })`,
                          width: `calc(${
                            !isNaN(element.width)
                              ? `${element.width}px`
                              : element.width
                          })`,
                          height: `calc(${
                            !isNaN(element.height)
                              ? `${element.height}px`
                              : element.height
                          })`,
                          transform: `translate(-${element.xAlign}%, -${
                            element.yAlign
                          }%) rotate(calc(${
                            !isNaN(element.rotation)
                              ? `${element.rotation}deg`
                              : element.rotation
                          }))`,
                          zIndex: -10000 + element.index,
                          borderRadius: `calc(${
                            !isNaN(element.borderRadius)
                              ? `${element.borderRadius}px`
                              : element.borderRadius
                          })`,
                          boxSizing: 'border-box',
                          border: `1.5px solid ${element.borderColor}`,
                          fontSize: element.fontSize,
                          fontWeight: element.fontWeight,
                          color: element.color,
                        }}
                        type="text"
                        placeholder={element.text}
                      />
                    );
                  case 'ml-input':
                    return (
                      <textarea
                        key={element.id}
                        style={{
                          position: 'absolute',
                          top: `calc(${
                            !isNaN(element.y) ? `${element.y}px` : element.y
                          })`,
                          left: `calc(${
                            !isNaN(element.x) ? `${element.x}px` : element.x
                          })`,
                          width: `calc(${
                            !isNaN(element.width)
                              ? `${element.width}px`
                              : element.width
                          })`,
                          height: `calc(${
                            !isNaN(element.height)
                              ? `${element.height}px`
                              : element.height
                          })`,
                          transform: `translate(-${element.xAlign}%, -${
                            element.yAlign
                          }%) rotate(calc(${
                            !isNaN(element.rotation)
                              ? `${element.rotation}deg`
                              : element.rotation
                          }))`,
                          zIndex: -10000 + element.index,
                          borderRadius: `calc(${
                            !isNaN(element.borderRadius)
                              ? `${element.borderRadius}px`
                              : element.borderRadius
                          })`,
                          boxSizing: 'border-box',
                          border: `1.5px solid ${element.borderColor}`,
                          fontSize: element.fontSize,
                          fontWeight: element.fontWeight,
                          color: element.color,
                        }}
                        placeholder={element.text}
                      />
                    );
                  default:
                    return undefined;
                }
              })}
        </div>
      )}
    </div>
  );
}

function render() {
  createRoot(document.getElementById('root')).render(
    <HashRouter>
      <Routes>
        <Route path="/" element={<Page />} />
        <Route path="/:id" element={<Page />} />
      </Routes>
    </HashRouter>
  );
}

render();
