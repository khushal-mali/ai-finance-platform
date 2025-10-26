import { NuqsAdapter } from "nuqs/adapters/react";
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { Toaster } from 'sonner';
import App from './App.tsx';
import { persistor, store } from './app/store.ts';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <NuqsAdapter>
        <App />
      </NuqsAdapter>
      <Toaster 
      position="top-center" 
        expand={true}
        duration={5000}
        richColors
        closeButton
      />
    </PersistGate>
    </Provider>
  </StrictMode>,
)
