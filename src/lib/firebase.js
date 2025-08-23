import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_firebase_apiKey,
    authDomain: process.env.NEXT_PUBLIC_firebase_authDomain,
    projectId: process.env.NEXT_PUBLIC_firebase_projectId,
    storageBucket: process.env.NEXT_PUBLIC_firebase_storageBucket,
    messagingSenderId: process.env.NEXT_PUBLIC_firebase_messagingSenderId,
    appId: process.env.NEXT_PUBLIC_firebase_appId
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider };
