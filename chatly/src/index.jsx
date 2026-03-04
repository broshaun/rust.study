import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { BrowserShell } from 'components';
import "./styles/global.css";


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserShell>
      <App />
    </BrowserShell>
  </React.StrictMode>,
);
