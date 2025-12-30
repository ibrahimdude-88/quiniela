// ============================================
// FIREBASE CONFIGURATION
// ============================================

// Configuración de Firebase (Reemplaza con tus credenciales)
const firebaseConfig = {
    apiKey: "AIzaSyDqGuPJd9OjWXuCRgZdEwQ14WNusVjYACU",
    authDomain: "quiniela-aeff3.firebaseapp.com",
    databaseURL: "https://quiniela-aeff3-default-rtdb.firebaseio.com",
    projectId: "quiniela-aeff3",
    storageBucket: "quiniela-aeff3.firebasestorage.app",
    messagingSenderId: "101537532338",
    appId: "1:101537532338:web:0f7d51983cae8ab51cbcab"
};

// Variable para controlar si Firebase está habilitado
let firebaseHabilitado = false;
let database = null;

// Inicializar Firebase
function inicializarFirebase() {
    try {
        // Verificar si las credenciales están configuradas
        if (firebaseConfig.apiKey === "TU_API_KEY") {
            console.log("⚠️ Firebase no configurado. Usando localStorage.");
            return false;
        }

        // Inicializar Firebase
        firebase.initializeApp(firebaseConfig);
        database = firebase.database();
        firebaseHabilitado = true;

        console.log("✅ Firebase inicializado correctamente");
        return true;
    } catch (error) {
        console.error("❌ Error al inicializar Firebase:", error);
        firebaseHabilitado = false;
        return false;
    }
}

// Guardar datos en Firebase
function guardarEnFirebase(datos) {
    if (!firebaseHabilitado || !database) {
        return Promise.resolve();
    }

    return database.ref('quinielaMundial').set(datos)
        .then(() => {
            console.log("✅ Datos guardados en Firebase");
        })
        .catch((error) => {
            console.error("❌ Error al guardar en Firebase:", error);
        });
}

// Cargar datos desde Firebase
function cargarDesdeFirebase() {
    if (!firebaseHabilitado || !database) {
        return Promise.resolve(null);
    }

    return database.ref('quinielaMundial').once('value')
        .then((snapshot) => {
            const datos = snapshot.val();
            if (datos) {
                console.log("✅ Datos cargados desde Firebase");
                return datos;
            }
            return null;
        })
        .catch((error) => {
            console.error("❌ Error al cargar desde Firebase:", error);
            return null;
        });
}

// Sincronizar cambios en tiempo real
function sincronizarFirebase() {
    if (!firebaseHabilitado || !database) {
        return;
    }

    database.ref('quinielaMundial').on('value', (snapshot) => {
        const datos = snapshot.val();
        if (datos) {
            // Actualizar estado local
            Object.assign(estado, datos);

            // Actualizar UI si es necesario
            if (estado.usuarioActual) {
                actualizarBannerPremio();
            }

            console.log("🔄 Datos sincronizados desde Firebase");
        }
    });
}

// Exportar funciones
window.firebaseUtils = {
    inicializar: inicializarFirebase,
    guardar: guardarEnFirebase,
    cargar: cargarDesdeFirebase,
    sincronizar: sincronizarFirebase,
    estaHabilitado: () => firebaseHabilitado
};
