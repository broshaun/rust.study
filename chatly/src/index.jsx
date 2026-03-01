import React from '.store/react@18.3.1/node_modules/react';
import ReactDOM from '.store/react-dom@18.3.1/node_modules/react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
