import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "SUA_API_KEY_AQUI",
  authDomain: "seu-projeto.firebaseapp.com",
  projectId: "seu-projeto",
  storageBucket: "seu-projeto.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// EXPORTA AS VARIÁVEIS QUE O APP.TSX PRECISA:
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
