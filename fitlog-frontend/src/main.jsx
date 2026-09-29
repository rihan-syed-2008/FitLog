import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'var(--paper-raised)',
              color: 'var(--ink)',
              border: '1px solid var(--rule)',
              borderRadius: 'var(--radius-md)',
              fontFamily: 'var(--font-ui)',
              fontSize: '0.875rem',
              boxShadow: '0 4px 16px rgba(27,37,33,0.12)',
            },
            success: {
              iconTheme: { primary: 'var(--track)', secondary: 'var(--paper-raised)' },
            },
            error: {
              iconTheme: { primary: 'var(--bib)', secondary: 'var(--paper-raised)' },
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
