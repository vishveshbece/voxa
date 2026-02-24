// src/lib/firebase.js
// ─────────────────────────────────────────────────────────────────
//  Replace the values below with your Firebase project credentials.
//  Find them at: Firebase Console → Project Settings → Your apps
// ─────────────────────────────────────────────────────────────────
import { initializeApp } from 'firebase/app'
import { getDatabase, ref, set, onValue } from 'firebase/database'

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY            || 'YOUR_API_KEY',
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN        || 'YOUR_PROJECT.firebaseapp.com',
  databaseURL:       import.meta.env.VITE_FIREBASE_DATABASE_URL       || 'https://YOUR_PROJECT-default-rtdb.firebaseio.com',
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID         || 'YOUR_PROJECT_ID',
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET     || 'YOUR_PROJECT.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID|| 'YOUR_SENDER_ID',
  appId:             import.meta.env.VITE_FIREBASE_APP_ID             || 'YOUR_APP_ID',
}

export const isConfigured = firebaseConfig.apiKey !== 'YOUR_API_KEY'

let app = null
let database = null

if (isConfigured) {
  app = initializeApp(firebaseConfig)
  database = getDatabase(app)
}

export { database, ref, set, onValue }
