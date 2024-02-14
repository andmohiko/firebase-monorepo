import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import {
  serverTimestamp as getServerTimeStamp,
  getFirestore,
  connectFirestoreEmulator,
} from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import { getRemoteConfig } from 'firebase/remote-config'
import type { RemoteConfig } from 'firebase/remote-config'

const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

const firebaseApp = initializeApp({ ...config })

const auth = getAuth(firebaseApp)
auth.languageCode = 'ja'

const db = getFirestore(firebaseApp)
const serverTimestamp = getServerTimeStamp()

const storage = getStorage(firebaseApp)

let remoteConfig: RemoteConfig | null = null
if (typeof window !== 'undefined') {
  remoteConfig = getRemoteConfig()
  remoteConfig.settings.minimumFetchIntervalMillis = 60 * 1000 // 1min
}

if (process.env.NEXT_PUBLIC_USE_EMULATOR === 'true') {
  connectFirestoreEmulator(db, 'localhost', 8080)
}

export { auth, db, serverTimestamp, storage, remoteConfig }
