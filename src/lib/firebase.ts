import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Credenciais exatas do seu projeto Agenda Perpétua
const firebaseConfig = {
  apiKey: "AIzaSyAsb-V3YV78U2XmU_s7pE6b1WvA4YtZnc",
  authDomain: "agenda-perpetua-a83d2.firebaseapp.com",
  projectId: "agenda-perpetua-a83d2",
  storageBucket: "agenda-perpetua-a83d2.appspot.com",
  messagingSenderId: "1055849302114",
  appId: "1:1055849302114:web:0a364fbfb7c25e41a832d3"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
