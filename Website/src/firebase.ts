/**
 * Google Analytics (through Firebase). Site analytics always run (they are not part of the cookie
 * choice, which only covers saving features), only on the live site, in browsers where Analytics can
 * run. Everything — the Firebase SDK and Google's gtag script — is downloaded only on the visitor's
 * first interaction or 8 s after the page loads, so it never slows the first paint or blocks taps.
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

// Starts on the visitor's first interaction (scroll, tap, key) or 8 s after the page loads, whichever
// comes first — so loading the page itself never waits on Google's scripts.
if (import.meta.env.PROD) {
  let started = false;
  const events = ['pointerdown', 'keydown', 'scroll', 'touchstart'] as const;
  const start = () => {
    if (started) return;
    started = true;
    events.forEach((e) => window.removeEventListener(e, start));
    void startAnalytics();
  };
  events.forEach((e) => window.addEventListener(e, start, { once: true, passive: true }));
  const afterLoad = () => setTimeout(start, 8000);
  if (document.readyState === 'complete') afterLoad();
  else window.addEventListener('load', afterLoad, { once: true });
}
