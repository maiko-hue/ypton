// firebase.js - EL CEREBRO UNIFICADO (QRs + LOGIN + EXPORT AUTH + ANTI-CLON)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
// Agregamos 'updateDoc' a las importaciones
import { getFirestore, doc, setDoc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// Tus llaves de siempre (yapedata)
const firebaseConfig = {
  apiKey: "AIzaSyDHDXn-R6jgd4fBkgW4KzFp6p6Ym_yqQoI",
  authDomain: "yapedata.firebaseapp.com",
  projectId: "yapedata",
  storageBucket: "yapedata.firebasestorage.app",
  messagingSenderId: "228862586517",
  appId: "1:228862586517:web:4e2b2578fe0f826e32b59c"
};

// Inicializar todo
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app); 
const provider = new GoogleAuthProvider();

// --- TUS EXPORTACIONES ---
export { auth, db, doc, setDoc, getDoc };

// --- NUEVA FUNCIÓN: LOGIN CON GOOGLE ---
window.iniciarSesion = async function() {
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        
        const userRef = doc(db, "clientes", user.email);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
            await setDoc(userRef, {
                nombre: user.displayName,
                email: user.email,
                estado: "inactivo", 
                fecha: new Date().toISOString()
            });
        }

        // 🛡️ --- INICIO DEL SISTEMA ANTI-CLONACIÓN (SESIÓN ÚNICA) --- 🛡️
        // 1. Inventamos un ticket único e irrepetible para esta sesión
        const ticketSesion = "token_" + Date.now() + "_" + Math.floor(Math.random() * 10000);
        
        // 2. Lo guardamos en la memoria interna de este celular (localStorage)
        localStorage.setItem("sesion_token_yape", ticketSesion);
        
        // 3. Lo actualizamos en la base de datos de Firebase
        await updateDoc(userRef, {
            sesion_token: ticketSesion
        });
        // 🛡️ --- FIN DEL SISTEMA ANTI-CLONACIÓN --- 🛡️

        window.location.href = "login_pin.html";
    } catch (error) {
        alert("Error: " + error.message);
    }
};

// --- FUNCIÓN PARA EL SEMÁFORO (Saber si ya entró) ---
window.verificarSiYaEntro = function() {
    onAuthStateChanged(auth, (user) => {
        if (user) { 
            window.location.href = "login_pin.html"; 
        }
    });
};