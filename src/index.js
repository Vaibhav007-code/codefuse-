import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider } from './context/ThemeContext';
import App from './App';
import './index.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { checkReminders } from './utils/api';

if (typeof window !== 'undefined' && 'Notification' in window) {
  Notification.requestPermission();
}

setInterval(checkReminders, 60000);
checkReminders();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>
);