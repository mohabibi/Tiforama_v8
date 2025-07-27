import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { register, unregister } from './serviceWorkerRegistration';
import { AudioService } from './services/AudioService';

// Initialiser le service audio
AudioService.getInstance();

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Enregistrer le service worker en mode production
if (process.env.NODE_ENV === 'production') {
  register({
    onSuccess: (registration) => {
      console.log('PWA disponible hors-ligne');
    },
    onUpdate: (registration) => {
      console.log('Nouvelle version disponible');
    },
  });
} else {
  unregister();
}