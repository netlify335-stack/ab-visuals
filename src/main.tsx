import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { DataProvider } from './lib/DataContext';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <DataProvider>
      <App />
    </DataProvider>
  </StrictMode>
);
