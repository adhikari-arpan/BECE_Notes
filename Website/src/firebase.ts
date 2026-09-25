import { initializeApp } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: 'AIzaSyD4IpOvft61a6kgoWk7zNiEtl-jMzbDT78',
  authDomain: 'web-counters.firebaseapp.com',
  databaseURL: 'https://web-counters-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId: 'web-counters',
  storageBucket: 'web-counters.firebasestorage.app',
  messagingSenderId: '1028704805401',
  appId: '1:1028704805401:web:2c341e3da3a5815fa5c088',
  measurementId: 'G-NEN3E32N45',
};

export const app = initializeApp(firebaseConfig);

// Only track the live site, and skip browsers where Analytics can't run (e.g. ad blockers).
if (import.meta.env.PROD) {
  isSupported().then((ok) => ok && getAnalytics(app));
}
