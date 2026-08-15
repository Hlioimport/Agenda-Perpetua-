import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBwrOl3IFveoD6MXUZKHC_0sa0XohvL_Ds",
  authDomain: "agenda-perpetua.firebaseapp.com",
  projectId: "agenda-perpetua",
  storageBucket: "agenda-perpetua.firebasestorage.app",
  messagingSenderId: "1062998494461",
  appId: "1:1062998494461:web:d817cfd39ebbd2b3450294"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
