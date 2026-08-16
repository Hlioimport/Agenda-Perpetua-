import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY, 
  authDomain: "agenda-perpetua.firebaseapp.com",
  projectId: "agenda-perpetua",
  storageBucket: "agenda-perpetua.firebasestorage.app",
  messagingSenderId: "1062998494461",
  appId: "1:1062998494461:web:c06294a2dee8a6cc450294" // Use o appId que apareceu no seu print novo
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
