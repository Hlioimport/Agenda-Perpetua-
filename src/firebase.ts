import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBwr0L3IFveoD6MXUZKHC_0sa0XohvL...", // Coloque sua chave real aqui
  authDomain: "agenda-perpetua.firebaseapp.com",
  projectId: "agenda-perpetua",
  storageBucket: "agenda-perpetua.firebasestorage.app",
  messagingSenderId: "1062998494461",
  appId: "1:1062998494461:web:d817cfd39ebbd2b3..."
};

const app = initializeApp(firebaseConfig);

// Estas duas linhas com 'export' são o que resolvem o seu erro:
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
