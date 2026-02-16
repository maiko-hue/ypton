// firebase.js
// 1. Importamos las herramientas de Google directamente desde internet
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// 2. Tus llaves de acceso (Copiadas de lo que me pasaste antes)
const firebaseConfig = {
  apiKey: "AIzaSyDHDXn-R6jgd4fBkgW4KzFp6p6Ym_yqQoI",
  authDomain: "yapedata.firebaseapp.com",
  projectId: "yapedata",
  storageBucket: "yapedata.firebasestorage.app",
  messagingSenderId: "228862586517",
  appId: "1:228862586517:web:4e2b2578fe0f826e32b59c"
};

// 3. Inicializar la conexión
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 4. Exportar las herramientas para que los otros archivos las usen
export { db, doc, setDoc, getDoc };