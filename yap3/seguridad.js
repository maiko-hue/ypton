// seguridad.js - MODO VELOCIDAD EXTREMA (VIGILANCIA SOLO EN EDITAR_DATOS Y PIN)
import { auth, db } from "./firebase.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { doc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// 1. DEFINIMOS LAS PUERTAS PRINCIPALES (Corregido el error de tipeo)
const paginaActual = window.location.pathname;
const esPuertaPrincipal = paginaActual.includes("editar_datos.html") || paginaActual.includes("login_pin.html");

// 2. REVISIÓN ULTRA-RÁPIDA PARA PÁGINAS SECUNDARIAS
if (esPuertaPrincipal) {
    // Solo en las puertas principales ocultamos la pantalla para consultar a Firebase
    document.body.style.opacity = "0";
}

const style = document.createElement('style');
style.textContent = `
    .seguridad-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.85); z-index: 10000; display: flex; justify-content: center; align-items: center; backdrop-filter: blur(5px); }
    .seguridad-card { background: white; width: 85%; max-width: 320px; border-radius: 20px; padding: 30px 20px; text-align: center; box-shadow: 0 15px 35px rgba(0,0,0,0.4); animation: slideUp 0.4s ease-out; }
    @keyframes slideUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
    .seguridad-icon { font-size: 55px; color: #742284; margin-bottom: 20px; }
    .seguridad-title { font-size: 20px; font-weight: 700; color: #333; margin-bottom: 12px; }
    .seguridad-text { font-size: 14px; color: #666; margin-bottom: 25px; line-height: 1.6; }
    .btn-soporte { background-color: #742284; color: white; border: none; width: 100%; padding: 15px; border-radius: 15px; font-size: 16px; font-weight: 700; cursor: pointer; display: block; text-decoration: none; margin-bottom: 12px; }
    .btn-salir { background: none; border: none; color: #888; font-size: 14px; font-weight: 600; cursor: pointer; }
`;
document.head.appendChild(style);

let vigilanteActivo = null;

window.expulsarUsuario = function() { 
    localStorage.removeItem("pase_vip_activo");
    window.location.href = "index.html"; 
};

onAuthStateChanged(auth, (user) => {
    if (!user) {
        if(!paginaActual.includes("index.html") && paginaActual !== "/" && !paginaActual.endsWith("/")) {
             window.expulsarUsuario();
        }
        return;
    }

    // Si NO estamos en editar_datos o login_pin, cortamos aquí para velocidad total
    if (!esPuertaPrincipal) return;

    // --- SOLO SE EJECUTA EN EDITAR_DATOS.HTML O LOGIN_PIN.HTML ---
    const miTicket = localStorage.getItem("sesion_token_yape");
    
    try {
        const userRef = doc(db, "clientes", user.email);
        vigilanteActivo = onSnapshot(userRef, (userSnap) => {
            if (!userSnap.exists()) {
                window.expulsarUsuario();
                return;
            }

            const userData = userSnap.data();

            // 1. Filtro Anti-Clonación
            if (userData.sesion_token && userData.sesion_token !== miTicket) {
                document.body.innerHTML = `
                    <div class="seguridad-overlay">
                        <div class="seguridad-card">
                            <i class="fa-solid fa-right-from-bracket seguridad-icon" style="color: #ef4444;"></i>
                            <div class="seguridad-title">Sesión Cerrada</div>
                            <div class="seguridad-text">Tu sesión se ha cerrado por actividad en otro dispositivo.</div>
                            <button class="btn-soporte" style="background-color: #ef4444;" onclick="expulsarUsuario()">Entendido</button>
                        </div>
                    </div>
                `;
                document.body.style.opacity = "1";
                localStorage.removeItem("pase_vip_activo"); 
                signOut(auth);
                if (vigilanteActivo) vigilanteActivo(); 
                return; 
            }

            // 2. Filtro de Estado
            if (userData.estado === "activo") {
                localStorage.setItem("pase_vip_activo", "true");
                document.body.style.opacity = "1";
                document.body.style.transition = "opacity 0.2s";
            } else {
                document.body.innerHTML = `
                    <div class="seguridad-overlay">
                        <div class="seguridad-card">
                            <i class="fa-solid fa-circle-user seguridad-icon"></i>
                            <div class="seguridad-title">¡Cuenta no activada!</div>
                            <div class="seguridad-text">Hola <strong>${user.displayName || 'Usuario'}</strong>, tu acceso se encuentra <strong>inactivo</strong>. Contacta a soporte.</div>
                            <a href="https://t.me/MaikolEsleiter" class="btn-soporte">Contactar Soporte</a>
                            <button class="btn-salir" onclick="window.expulsarUsuario()">Volver al inicio</button>
                        </div>
                    </div>
                `;
                document.body.style.opacity = "1";
                localStorage.removeItem("pase_vip_activo"); 
            }
        });
    } catch (error) {
        window.expulsarUsuario();
    }
});