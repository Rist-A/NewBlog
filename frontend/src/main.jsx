import { StrictMode } from 'react'
import React from 'react';
import ReactDOM from 'react-dom/client';
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Toaster } from 'sonner';
createRoot(document.getElementById('root')).render(

  <StrictMode>
    
    <App />
    <Toaster position="top-center" richColors />
  </StrictMode>,
)
