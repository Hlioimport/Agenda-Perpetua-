import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBwr0L3IFveoD6MXUZKHC_0sa0XohvL_Ds", 
  authDomain: "agenda-perpetua.firebaseapp.com",
  projectId: "agenda-perpetua",
  storageBucket: "agenda-perpetua.firebasestorage.app",
  messagingSenderId: "1062998494461",
  appId: "1:1062998494461:web:d817cfd39ebbd2b345029"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// EXPORTA AS VARIÁVEIS QUE O APP.TSX PRECISA:
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
