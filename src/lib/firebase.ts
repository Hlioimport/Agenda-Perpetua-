import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBwrOl3IFveoD6MXUZKHC_0sa0XohvL_Ds",
  authDomain: "agenda-perpetua.firebaseapp.com",
  projectId: "agenda-perpetua",
  storageBucket: "agenda-perpetua.firebasestorage.app",
  messagingSenderId: "1062998494461",
  appId: "1:1062998494461:web:d817cfd39ebbd2b3450294"
};

// Inicializa o app Firebase
const app = initializeApp(firebaseConfig);

// Exporta todos os módulos que o projeto precisa (auth, googleProvider e db)
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);

export default app;
