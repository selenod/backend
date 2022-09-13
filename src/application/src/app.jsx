import { HashRouter, Route, Routes } from 'react-router-dom';
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import data from './data/data.json';

function Page() {
  return (
    <div>
      Curr:
      {window.location.hash === ''
        ? data.windowList[0].name
        : data.windowList[window.location.hash.substring(2)].name}
      <br />
      <br />
      {data.windowList.map((windowData) => (
        <div key={windowData.id}>
          <button
            onClick={() => {
              window.open(
                `/main_window#/${windowData.id}`,
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
      ))}
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
