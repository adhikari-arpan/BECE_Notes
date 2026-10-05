/**
 * Google Analytics (through Firebase). Site analytics always run (they are not part of the cookie
 * choice, which only covers saving features), only on the live site, in browsers where Analytics can
 * run. Everything — the Firebase SDK and Google's gtag script — is downloaded only after the page has
 * finished loading and the browser is idle, so it never slows the first paint or blocks taps.
 */
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

async function startAnalytics() {
  const [{ initializeApp }, { getAnalytics, isSupported }] = await Promise.all([import('firebase/app'), import('firebase/analytics')]);
  if (await isSupported()) getAnalytics(initializeApp(firebaseConfig));
}

if (import.meta.env.PROD) {
  const whenIdle = () => {
    if ('requestIdleCallback' in window) window.requestIdleCallback(() => void startAnalytics(), { timeout: 4000 });
    else setTimeout(() => void startAnalytics(), 2000);
  };
  if (document.readyState === 'complete') whenIdle();
  else window.addEventListener('load', whenIdle, { once: true });
}
