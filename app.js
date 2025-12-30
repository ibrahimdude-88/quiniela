// QUINIELA MUNDIAL FIFA 2026 - Aplicación Completa
// Autor: Sistema Profesional
// Versión: 2.0

// ============================================
// 1. ESTADO GLOBAL
// ============================================
let estado = {
    usuarioActual: null,
    esAdmin: false,
    esModerador: false,
    jornadaActual: 1,
    jornadaResultados: 1,
    jornadaAdmin: 1,
    usuarios: [],
    moderadores: [],
    pronosticos: {},
    resultados: {},
    pronosticosBloqueados: {}, // Formato: { userId: { 1: true, 2: false, 3: false } }
    usuariosPagados: {},
    jornadasHabilitadas: { 1: true, 2: false, 3: false },
    montoCuota: 100,
    bracketVisible: false,
    bracketFasesHabilitadas: {
        dieciseisavos: false,
        octavos: false,
        cuartos: false,
        semifinal: false,
        final: false
    },
    bracket: {
        dieciseisavos: Array(32).fill(null),
        octavos: Array(16).fill(null),
        cuartos: Array(8).fill(null),
        semifinal: Array(4).fill(null),
        final: Array(2).fill(null),
        campeon: null
    },
    bracketResultados: {
        dieciseisavos: Array(16).fill(null),
        octavos: Array(8).fill(null),
        cuartos: Array(4).fill(null),
        semifinal: Array(2).fill(null),
        final: Array(1).fill(null)
    },
    adminPassword: 'Mundial2026!'
};

// ============================================
// 2. PERSISTENCIA DE DATOS
// ============================================
function cargarDatos() {
    const datos = localStorage.getItem('quinielaMundial2026');
    if (datos) {
        try {
            const parsed = JSON.parse(datos);
            estado = { ...estado, ...parsed };

            // Asegurar que resultados existe
            if (!estado.resultados) estado.resultados = {};

            // Migrar formato viejo de bloqueo a nuevo
            Object.keys(estado.pronosticosBloqueados || {}).forEach(userId => {
                if (typeof estado.pronosticosBloqueados[userId] === 'boolean') {
                    const bloqueado = estado.pronosticosBloqueados[userId];
                    estado.pronosticosBloqueados[userId] = {
                        1: bloqueado,
                        2: false,
                        3: false
                    };
                }
            });

        } catch (e) {
            console.error('Error cargando datos:', e);
        }
    }
}

function guardarDatos() {
    try {
        localStorage.setItem('quinielaMundial2026', JSON.stringify(estado));
    } catch (e) {
        console.error('Error guardando datos:', e);
        mostrarToast('X', 'Error al guardar datos');
    }
}

// ============================================
// 3. AUTENTICACIÓN
// ============================================
function iniciarSesion() {
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;

    if (!username || !password) {
        mostrarToast('!', 'Completa todos los campos');
        return;
    }

    const usuario = estado.usuarios.find(u => u.username === username && u.password === password);

    if (usuario) {
        estado.usuarioActual = usuario;
        estado.esAdmin = false;
        estado.esModerador = false;

        // Determinar jornada actual
        for (let j = 3; j >= 1; j--) {
            if (estado.jornadasHabilitadas[j] === true) {
                estado.jornadaActual = j;
                break;
            }
        }

        mostrarApp();
        actualizarNombreConMedalla();
        mostrarToast('OK', 'Bienvenido ' + usuario.nombre);

        // Verificar Top 3
        setTimeout(() => verificarTop3(usuario.id), 1500);
    } else {
        mostrarToast('X', 'Usuario o contrasena incorrectos');
    }
}

function registrarUsuario() {
    const nombre = document.getElementById('regFullName').value.trim();
    const username = document.getElementById('regUsername').value.trim();
    const whatsapp = document.getElementById('regWhatsapp').value.trim();
    const password = document.getElementById('regPassword').value;
    const passwordConfirm = document.getElementById('regPasswordConfirm').value;

    if (!nombre || !username || !whatsapp || !password) {
        mostrarToast('!', 'Completa todos los campos');
        return;
    }

    if (password !== passwordConfirm) {
        mostrarToast('X', 'Las contrasenas no coinciden');
        return;
    }

    if (estado.usuarios.find(u => u.username === username)) {
        mostrarToast('X', 'El usuario ya existe');
        return;
    }

    const nuevoUsuario = {
        id: Date.now().toString(),
        nombre: nombre,
        username: username,
        whatsapp: whatsapp,
        password: password,
        fechaRegistro: new Date().toISOString()
    };

    estado.usuarios.push(nuevoUsuario);
    estado.pronosticosBloqueados[nuevoUsuario.id] = {};
    estado.usuariosPagados[nuevoUsuario.id] = false;

    guardarDatos();

    estado.usuarioActual = nuevoUsuario;
    mostrarApp();
    mostrarToast('OK', 'Cuenta creada exitosamente');
}

function iniciarSesionAdmin() {
    const password = document.getElementById('adminPassword').value;

    if (password === estado.adminPassword) {
        estado.usuarioActual = { id: 'admin', nombre: 'Administrador', username: 'admin' };
        estado.esAdmin = true;
        estado.esModerador = false;
        mostrarApp();
        mostrarToast('OK', 'Acceso de administrador concedido');
    } else {
        const moderador = estado.moderadores.find(m => m.password === password);
        if (moderador) {
            estado.usuarioActual = { id: moderador.id, nombre: moderador.nombre, username: moderador.username };
            estado.esAdmin = false;
            estado.esModerador = true;
            mostrarApp();
            mostrarToast('OK', 'Acceso de moderador: ' + moderador.nombre);
        } else {
            mostrarToast('X', 'Contrasena incorrecta');
        }
    }
}

function cerrarSesion() {
    estado.usuarioActual = null;
    estado.esAdmin = false;
    estado.esModerador = false;
    document.getElementById('appScreen').classList.add('hidden');
    document.getElementById('loginScreen').classList.remove('hidden');
    mostrarFormulario('login');
}

// ============================================
// 4. NAVEGACIÓN
// ============================================
function mostrarApp() {
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('appScreen').classList.remove('hidden');

    if (!estado.esAdmin && !estado.esModerador) {
        actualizarNombreConMedalla();
    } else {
        document.getElementById('currentUserName').textContent = estado.usuarioActual.nombre;
    }

    document.getElementById('navAdmin').classList.toggle('hidden', !estado.esAdmin && !estado.esModerador);
    document.getElementById('navLlaves').classList.toggle('hidden', !estado.bracketVisible);

    cambiarVista('pronosticos');
}

function mostrarFormulario(tipo) {
    document.getElementById('formLogin').classList.add('hidden');
    document.getElementById('formRegister').classList.add('hidden');
    document.getElementById('formAdmin').classList.add('hidden');

    if (tipo === 'login') document.getElementById('formLogin').classList.remove('hidden');
    else if (tipo === 'register') document.getElementById('formRegister').classList.remove('hidden');
    else if (tipo === 'admin') document.getElementById('formAdmin').classList.remove('hidden');
}

function cambiarVista(vista) {
    document.querySelectorAll('.view-section').forEach(s => s.classList.add('hidden'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));

    document.getElementById('view' + vista.charAt(0).toUpperCase() + vista.slice(1)).classList.remove('hidden');
    const btn = document.querySelector(`[data-view="${vista}"]`);
    if (btn) btn.classList.add('active');

    if (vista === 'pronosticos') renderizarPronosticos();
    else if (vista === 'resultados') renderizarResultados();
    else if (vista === 'ranking') renderizarRanking();
    else if (vista === 'reglas') renderizarReglas();
    else if (vista === 'llaves') renderizarBracketUsuario();
    else if (vista === 'admin') renderizarAdmin();
}

function cambiarTabAdmin(tab) {
    document.querySelectorAll('.admin-tab-content').forEach(t => t.classList.add('hidden'));
    document.querySelectorAll('.admin-tab-btn').forEach(b => b.classList.remove('active'));

    document.getElementById('adminTab' + tab.charAt(0).toUpperCase() + tab.slice(1)).classList.remove('hidden');
    const btn = document.querySelector(`[data-admin-tab="${tab}"]`);
    if (btn) btn.classList.add('active');

    if (tab === 'pagos') renderizarPagos();
    else if (tab === 'bracket') renderizarBracketAdmin();
    else if (tab === 'usuarios') renderizarModeradoresAdmin();
    else if (tab === 'jornadas') renderizarControlJornadas();
}

// ============================================
// 5. PRONÓSTICOS (BLOQUEO POR JORNADA)
// ============================================
function renderizarPronosticos() {
    const container = document.getElementById('pronosticosContainer');
    const jornada = 'jornada' + estado.jornadaActual;
    const partidos = PARTIDOS[jornada];

    document.getElementById('jornadaDisplay').textContent = 'Jornada ' + estado.jornadaActual;

    // Inicializar estructura de bloqueo
    if (!estado.pronosticosBloqueados[estado.usuarioActual.id]) {
        estado.pronosticosBloqueados[estado.usuarioActual.id] = {};
    }

    // Verificar si ESTA jornada está bloqueada
    const bloqueadaEstaJornada = estado.pronosticosBloqueados[estado.usuarioActual.id][estado.jornadaActual] === true;
    const habilitada = estado.jornadasHabilitadas[estado.jornadaActual] === true;

    // Botones de navegación
    document.getElementById('btnPrevJornada').style.display =
        (estado.jornadaActual > 1 && estado.jornadasHabilitadas[estado.jornadaActual - 1]) ? 'block' : 'none';
    document.getElementById('btnNextJornada').style.display =
        (estado.jornadaActual < 3 && estado.jornadasHabilitadas[estado.jornadaActual + 1]) ? 'block' : 'none';

    // Advertencia
    const warning = document.getElementById('lockWarning');
    if (!habilitada) {
        warning.classList.remove('hidden');
        warning.textContent = 'Esta jornada aun no esta habilitada.';
    } else if (bloqueadaEstaJornada) {
        warning.classList.remove('hidden');
        warning.textContent = 'Tus pronosticos de Jornada ' + estado.jornadaActual + ' estan bloqueados';
    } else {
        warning.classList.add('hidden');
    }

    // Botón guardar
    document.getElementById('btnGuardarPronosticos').disabled = bloqueadaEstaJornada || !habilitada;

    // Renderizar partidos
    container.innerHTML = '';
    const porGrupo = {};
    partidos.forEach(p => {
        if (!porGrupo[p.grupo]) porGrupo[p.grupo] = [];
        porGrupo[p.grupo].push(p);
    });

    Object.keys(porGrupo).sort().forEach(grupo => {
        const header = document.createElement('h3');
        header.textContent = 'Grupo ' + grupo;
        header.style.cssText = 'grid-column:1/-1;color:var(--primary);margin-top:20px;margin-bottom:10px;';
        container.appendChild(header);

        porGrupo[grupo].forEach(partido => {
            container.appendChild(crearTarjetaPartido(partido, 'pronostico', bloqueadaEstaJornada || !habilitada));
        });
    });
}

function guardarPronosticos() {
    const userId = estado.usuarioActual.id;
    const jornada = estado.jornadaActual;

    // Inicializar estructura
    if (!estado.pronosticosBloqueados[userId]) {
        estado.pronosticosBloqueados[userId] = {};
    }

    // Verificar si ya está bloqueada
    if (estado.pronosticosBloqueados[userId][jornada] === true) {
        mostrarToast('!', 'Los pronosticos de Jornada ' + jornada + ' ya estan bloqueados');
        return;
    }

    if (!estado.jornadasHabilitadas[jornada]) {
        mostrarToast('!', 'Esta jornada no esta habilitada');
        return;
    }

    mostrarConfirmacion(
        'Guardar pronosticos?',
        'Una vez guardados, NO podras modificar los pronosticos de esta jornada. Estas seguro?',
        () => {
            if (!estado.pronosticos[userId]) estado.pronosticos[userId] = {};

            const inputs = document.querySelectorAll('#pronosticosContainer .score-input:not([disabled])');
            const pronosticosTemp = {};

            inputs.forEach(input => {
                const matchId = input.dataset.matchId;
                const team = input.dataset.team;
                const value = input.value.trim();

                if (value === '') return;
                const numero = parseInt(value);
                if (isNaN(numero) || numero < 0) return;

                if (!pronosticosTemp[matchId]) pronosticosTemp[matchId] = {};
                pronosticosTemp[matchId][team] = numero;
            });

            const partidosCompletos = Object.keys(pronosticosTemp).filter(m =>
                pronosticosTemp[m].local !== undefined && pronosticosTemp[m].visitante !== undefined
            ).length;

            const jornadaKey = 'jornada' + jornada;
            const partidosEsperados = PARTIDOS[jornadaKey].length;

            if (partidosCompletos < partidosEsperados) {
                mostrarToast('!', 'Completa todos los pronosticos (' + partidosCompletos + '/' + partidosEsperados + ')');
                return;
            }

            // Guardar pronósticos
            Object.keys(pronosticosTemp).forEach(matchId => {
                estado.pronosticos[userId][matchId] = pronosticosTemp[matchId];
            });

            // Bloquear SOLO esta jornada
            estado.pronosticosBloqueados[userId][jornada] = true;

            guardarDatos();
            renderizarPronosticos();
            mostrarToast('OK', 'Pronosticos de Jornada ' + jornada + ' guardados y bloqueados');
        }
    );
}

// ============================================
// 6. RESULTADOS
// ============================================
function renderizarResultados() {
    const container = document.getElementById('resultadosContainer');
    const jornada = 'jornada' + estado.jornadaResultados;
    const partidos = PARTIDOS[jornada];

    document.getElementById('jornadaDisplayRes').textContent = 'Jornada ' + estado.jornadaResultados;
    container.innerHTML = '';

    // Tablas generales arriba
    const seccionTablas = document.createElement('div');
    seccionTablas.innerHTML = '<h2 style="color:var(--primary);margin-bottom:20px;text-align:center;">Tablas Generales por Grupo</h2>';
    seccionTablas.style.cssText = 'margin-bottom:40px;';

    const grupos = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
    const gridTablas = document.createElement('div');
    gridTablas.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fit,minmax(400px,1fr));gap:20px;margin-bottom:40px;';

    grupos.forEach(grupo => {
        const tabla = calcularTablaPosiciones(grupo);
        if (tabla.length > 0) {
            const contenedorGrupo = document.createElement('div');
            contenedorGrupo.innerHTML = '<h3 style="color:var(--primary);margin-bottom:10px;">Grupo ' + grupo + '</h3>';
            const tablaElement = crearTablaPosiciones(tabla);
            contenedorGrupo.appendChild(tablaElement);
            gridTablas.appendChild(contenedorGrupo);
        }
    });

    seccionTablas.appendChild(gridTablas);
    container.appendChild(seccionTablas);

    // Separador
    const separador = document.createElement('div');
    separador.innerHTML = '<h2 style="color:var(--primary);margin-bottom:20px;text-align:center;border-top:2px solid var(--primary);padding-top:30px;">Resultados de Jornada ' + estado.jornadaResultados + '</h2>';
    container.appendChild(separador);

    // Partidos
    const gridPartidos = document.createElement('div');
    gridPartidos.className = 'partidos-grid';

    const porGrupo = {};
    partidos.forEach(p => {
        if (!porGrupo[p.grupo]) porGrupo[p.grupo] = [];
        porGrupo[p.grupo].push(p);
    });

    Object.keys(porGrupo).sort().forEach(grupo => {
        const header = document.createElement('h3');
        header.textContent = 'Grupo ' + grupo;
        header.style.cssText = 'grid-column:1/-1;color:var(--primary);margin-top:20px;margin-bottom:10px;';
        gridPartidos.appendChild(header);

        porGrupo[grupo].forEach(partido => {
            gridPartidos.appendChild(crearTarjetaPartido(partido, 'resultado'));
        });
    });

    container.appendChild(gridPartidos);
}

function calcularTablaPosiciones(grupo) {
    const todosPartidos = [...PARTIDOS.jornada1, ...PARTIDOS.jornada2, ...PARTIDOS.jornada3];
    const partidosGrupo = todosPartidos.filter(p => p.grupo === grupo);

    const equipos = new Set();
    partidosGrupo.forEach(p => {
        equipos.add(p.local);
        equipos.add(p.visitante);
    });

    const tabla = {};
    equipos.forEach(equipo => {
        tabla[equipo] = {
            nombre: EQUIPOS[equipo].nombre,
            jj: 0, jg: 0, je: 0, jp: 0,
            gf: 0, gc: 0, dif: 0, puntos: 0
        };
    });

    partidosGrupo.forEach(partido => {
        const resultado = estado.resultados[partido.id];
        if (!resultado || resultado.local === undefined) return;

        const local = partido.local;
        const visitante = partido.visitante;

        tabla[local].jj++;
        tabla[visitante].jj++;
        tabla[local].gf += resultado.local;
        tabla[local].gc += resultado.visitante;
        tabla[visitante].gf += resultado.visitante;
        tabla[visitante].gc += resultado.local;

        if (resultado.local > resultado.visitante) {
            tabla[local].jg++;
            tabla[local].puntos += 3;
            tabla[visitante].jp++;
        } else if (resultado.visitante > resultado.local) {
            tabla[visitante].jg++;
            tabla[visitante].puntos += 3;
            tabla[local].jp++;
        } else {
            tabla[local].je++;
            tabla[visitante].je++;
            tabla[local].puntos += 1;
            tabla[visitante].puntos += 1;
        }

        tabla[local].dif = tabla[local].gf - tabla[local].gc;
        tabla[visitante].dif = tabla[visitante].gf - tabla[visitante].gc;
    });

    return Object.values(tabla).sort((a, b) => {
        if (b.puntos !== a.puntos) return b.puntos - a.puntos;
        if (b.dif !== a.dif) return b.dif - a.dif;
        return b.gf - a.gf;
    });
}

function crearTablaPosiciones(tabla) {
    const div = document.createElement('div');
    div.className = 'tabla-posiciones';

    let html = '<table style="width:100%;background:white;border-radius:8px;overflow:hidden;box-shadow:0 2px 4px rgba(0,0,0,0.1);">';
    html += '<thead style="background:var(--primary);color:white;"><tr>';
    html += '<th style="padding:10px;text-align:left;">Equipo</th>';
    html += '<th style="padding:10px;text-align:center;">JJ</th>';
    html += '<th style="padding:10px;text-align:center;">JG</th>';
    html += '<th style="padding:10px;text-align:center;">JE</th>';
    html += '<th style="padding:10px;text-align:center;">JP</th>';
    html += '<th style="padding:10px;text-align:center;">GF</th>';
    html += '<th style="padding:10px;text-align:center;">GC</th>';
    html += '<th style="padding:10px;text-align:center;">Dif</th>';
    html += '<th style="padding:10px;text-align:center;font-weight:800;">Pts</th>';
    html += '</tr></thead><tbody>';

    tabla.forEach((equipo, index) => {
        const bg = index < 2 ? 'rgba(40,167,69,0.1)' : '';
        html += '<tr style="background:' + bg + ';border-bottom:1px solid #f0f0f0;">';
        html += '<td style="padding:10px;font-weight:600;">' + (index + 1) + '. ' + equipo.nombre + '</td>';
        html += '<td style="padding:10px;text-align:center;">' + equipo.jj + '</td>';
        html += '<td style="padding:10px;text-align:center;">' + equipo.jg + '</td>';
        html += '<td style="padding:10px;text-align:center;">' + equipo.je + '</td>';
        html += '<td style="padding:10px;text-align:center;">' + equipo.jp + '</td>';
        html += '<td style="padding:10px;text-align:center;">' + equipo.gf + '</td>';
        html += '<td style="padding:10px;text-align:center;">' + equipo.gc + '</td>';
        html += '<td style="padding:10px;text-align:center;font-weight:600;">' + (equipo.dif > 0 ? '+' : '') + equipo.dif + '</td>';
        html += '<td style="padding:10px;text-align:center;font-weight:800;color:var(--primary);font-size:1.1rem;">' + equipo.puntos + '</td>';
        html += '</tr>';
    });

    html += '</tbody></table>';
    div.innerHTML = html;
    return div;
}

// Continuará en el siguiente mensaje debido al límite de caracteres...

// ============================================
// 7. RANKING
// ============================================
function renderizarRanking() {
    const container = document.getElementById('rankingContainer');
    
    const ranking = estado.usuarios.map(usuario => {
        const puntos = calcularPuntos(usuario.id);
        const aciertos = calcularAciertos(usuario.id);
        const pagado = estado.usuariosPagados[usuario.id] || false;
        return { usuario, puntos, aciertos, pagado };
    }).sort((a, b) => {
        if (b.puntos !== a.puntos) return b.puntos - a.puntos;
        return b.aciertos.exactos - a.aciertos.exactos;
    });
    
    container.innerHTML = '';
    
    if (ranking.length === 0) {
        container.innerHTML = '<p style="text-align:center;padding:40px;color:#999;">No hay usuarios registrados</p>';
        return;
    }
    
    ranking.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'ranking-item';
        
        if (item.pagado) {
            div.style.background = 'linear-gradient(90deg,rgba(0,204,102,0.1),transparent)';
            div.style.borderLeft = '4px solid var(--secondary)';
        } else {
            div.style.background = 'linear-gradient(90deg,rgba(220,53,69,0.1),transparent)';
            div.style.borderLeft = '4px solid var(--danger)';
        }
        
        let medalla = '';
        if (index === 0) medalla = '[1]';
        else if (index === 1) medalla = '[2]';
        else if (index === 2) medalla = '[3]';
        
        const estadoPago = item.pagado ? '[OK]' : '[X]';
        
        div.innerHTML = `
            <div class="ranking-position">${medalla} ${index + 1}</div>
            <div class="ranking-name">${estadoPago} ${item.usuario.nombre}</div>
            <div class="ranking-stats">${item.aciertos.ganadores}/${item.aciertos.total} aciertos</div>
            <div class="ranking-points">${item.puntos} pts</div>
        `;
        
        container.appendChild(div);
    });
}

function calcularPuntos(userId) {
    let puntos = 0;
    const pronosticosUsuario = estado.pronosticos[userId];
    if (!pronosticosUsuario) return 0;
    
    Object.keys(pronosticosUsuario).forEach(matchId => {
        const pronostico = pronosticosUsuario[matchId];
        const resultado = estado.resultados[matchId];
        if (!resultado || resultado.local === undefined) return;
        
        const pronosticoGanador = obtenerGanador(pronostico.local, pronostico.visitante);
        const resultadoGanador = obtenerGanador(resultado.local, resultado.visitante);
        
        if (pronosticoGanador === resultadoGanador) {
            puntos += 1;
            if (pronostico.local === resultado.local && pronostico.visitante === resultado.visitante) {
                puntos += 3;
            }
        }
    });
    
    return puntos;
}

function calcularAciertos(userId) {
    let ganadores = 0, exactos = 0, total = 0;
    const pronosticosUsuario = estado.pronosticos[userId];
    if (!pronosticosUsuario) return { ganadores: 0, exactos: 0, total: 0 };
    
    Object.keys(estado.resultados).forEach(matchId => {
        const resultado = estado.resultados[matchId];
        const pronostico = pronosticosUsuario[matchId];
        if (!resultado || resultado.local === undefined || !pronostico) return;
        
        total++;
        const pronosticoGanador = obtenerGanador(pronostico.local, pronostico.visitante);
        const resultadoGanador = obtenerGanador(resultado.local, resultado.visitante);
        
        if (pronosticoGanador === resultadoGanador) {
            ganadores++;
            if (pronostico.local === resultado.local && pronostico.visitante === resultado.visitante) {
                exactos++;
            }
        }
    });
    
    return { ganadores, exactos, total };
}

function obtenerGanador(local, visitante) {
    if (local > visitante) return 'local';
    if (visitante > local) return 'visitante';
    return 'empate';
}

// ============================================
// 8. UTILIDADES
// ============================================
function crearTarjetaPartido(partido, tipo, bloqueado = false) {
    const card = document.createElement('div');
    card.className = 'partido-card';
    
    const equipoLocal = EQUIPOS[partido.local];
    const equipoVisitante = EQUIPOS[partido.visitante];
    
    const banderaLocal = equipoLocal.bandera ? 
        `<span class="fi fi-${equipoLocal.bandera}" style="font-size:3rem;"></span>` : 
        '<span style="font-size:3rem;">?</span>';
    const banderaVisitante = equipoVisitante.bandera ? 
        `<span class="fi fi-${equipoVisitante.bandera}" style="font-size:3rem;"></span>` : 
        '<span style="font-size:3rem;">?</span>';
    
    let html = `
        <div class="partido-header">
            <span class="grupo-badge">Grupo ${partido.grupo}</span>
            <span class="fecha-badge">${formatearFecha(partido.fecha)}</span>
        </div>
        <div class="equipos-container">
            <div class="equipo">
                ${banderaLocal}
                <span class="equipo-nombre">${equipoLocal.nombre}</span>
            </div>
            <span class="vs-divider">VS</span>
            <div class="equipo">
                ${banderaVisitante}
                <span class="equipo-nombre">${equipoVisitante.nombre}</span>
            </div>
        </div>
    `;
    
    if (tipo === 'pronostico') {
        const pronostico = estado.pronosticos[estado.usuarioActual.id]?.[partido.id] || {};
        const valorLocal = pronostico.local !== undefined ? pronostico.local : 0;
        const valorVisitante = pronostico.visitante !== undefined ? pronostico.visitante : 0;
        
        html += `
            <div class="pronostico-inputs">
                <input type="number" class="score-input" data-match-id="${partido.id}" data-team="local" 
                       value="${valorLocal}" min="0" ${bloqueado ? 'disabled' : ''}>
                <span style="font-size:1.5rem;font-weight:800;">-</span>
                <input type="number" class="score-input" data-match-id="${partido.id}" data-team="visitante" 
                       value="${valorVisitante}" min="0" ${bloqueado ? 'disabled' : ''}>
            </div>
        `;
    } else if (tipo === 'resultado') {
        const resultado = estado.resultados[partido.id];
        if (resultado && resultado.local !== undefined) {
            html += `
                <div class="resultado-display">
                    <span>${resultado.local}</span>
                    <span>-</span>
                    <span>${resultado.visitante}</span>
                </div>
            `;
        } else {
            html += '<p style="text-align:center;color:#999;margin-top:15px;">Sin resultado</p>';
        }
    } else if (tipo === 'admin') {
        const resultado = estado.resultados[partido.id] || {};
        const valorLocal = resultado.local !== undefined ? resultado.local : 0;
        const valorVisitante = resultado.visitante !== undefined ? resultado.visitante : 0;
        
        html += `
            <div class="pronostico-inputs">
                <input type="number" class="score-input admin-score" data-match-id="${partido.id}" data-team="local" 
                       value="${valorLocal}" min="0">
                <span style="font-size:1.5rem;font-weight:800;">-</span>
                <input type="number" class="score-input admin-score" data-match-id="${partido.id}" data-team="visitante" 
                       value="${valorVisitante}" min="0">
            </div>
        `;
    }
    
    card.innerHTML = html;
    return card;
}

function formatearFecha(fecha) {
    const meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
    const date = new Date(fecha + 'T00:00:00');
    return `${date.getDate()} ${meses[date.getMonth()]}`;
}

function mostrarToast(icono, mensaje) {
    const toast = document.getElementById('toast');
    document.getElementById('toastIcon').textContent = icono;
    document.getElementById('toastMessage').textContent = mensaje;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

function mostrarConfirmacion(titulo, mensaje, callback) {
    const modal = document.getElementById('confirmModal');
    document.getElementById('confirmTitle').textContent = titulo;
    document.getElementById('confirmMessage').textContent = mensaje;
    modal.classList.remove('hidden');
    
    document.getElementById('btnConfirmYes').onclick = () => {
        modal.classList.add('hidden');
        callback();
    };
    
    document.getElementById('btnConfirmNo').onclick = () => {
        modal.classList.add('hidden');
    };
}

// ============================================
// 9. TOP 3
// ============================================
function actualizarNombreConMedalla() {
    if (!estado.usuarioActual || estado.esAdmin || estado.esModerador) {
        document.getElementById('currentUserName').textContent = estado.usuarioActual ? estado.usuarioActual.nombre : '';
        return;
    }
    
    const ranking = estado.usuarios.map(u => ({
        id: u.id,
        puntos: calcularPuntos(u.id)
    })).sort((a, b) => b.puntos - a.puntos);
    
    const posicion = ranking.findIndex(r => r.id === estado.usuarioActual.id) + 1;
    
    let medalla = '';
    if (posicion === 1) medalla = '[1] ';
    else if (posicion === 2) medalla = '[2] ';
    else if (posicion === 3) medalla = '[3] ';
    
    document.getElementById('currentUserName').textContent = medalla + estado.usuarioActual.nombre;
}

function verificarTop3(userId) {
    const ranking = estado.usuarios.map(u => ({
        id: u.id,
        puntos: calcularPuntos(u.id)
    })).sort((a, b) => b.puntos - a.puntos);
    
    const posicion = ranking.findIndex(r => r.id === userId) + 1;
    
    if (posicion <= 3 && posicion > 0) {
        mostrarNotificacionTop3(posicion);
    }
}

function mostrarNotificacionTop3(posicion) {
    let medalla = '', mensaje = '';
    
    if (posicion === 1) {
        medalla = '1er LUGAR';
        mensaje = 'Felicidades! Estas en el PRIMER LUGAR del ranking.';
    } else if (posicion === 2) {
        medalla = '2do LUGAR';
        mensaje = 'Excelente! Estas en SEGUNDO LUGAR del ranking.';
    } else if (posicion === 3) {
        medalla = '3er LUGAR';
        mensaje = 'Muy bien! Estas en TERCER LUGAR del ranking.';
    }
    
    const modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;z-index:10000;';
    
    const content = document.createElement('div');
    content.style.cssText = 'background:white;padding:40px;border-radius:20px;text-align:center;max-width:400px;position:relative;box-shadow:0 10px 40px rgba(0,0,0,0.3);';
    
    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'X';
    closeBtn.style.cssText = 'position:absolute;top:10px;right:10px;background:none;border:none;font-size:24px;cursor:pointer;color:#999;';
    closeBtn.onclick = () => document.body.removeChild(modal);
    
    const medallaBig = document.createElement('div');
    medallaBig.textContent = medalla;
    medallaBig.style.cssText = 'font-size:48px;font-weight:800;margin-bottom:20px;color:var(--primary);animation:bounce 1s infinite;';
    
    const titulo = document.createElement('h2');
    titulo.textContent = 'Estas en el Top 3!';
    titulo.style.cssText = 'color:var(--primary);margin-bottom:15px;';
    
    const desc = document.createElement('p');
    desc.textContent = mensaje + ' Sigue asi!';
    desc.style.cssText = 'font-size:1.1rem;color:#666;';
    
    content.appendChild(closeBtn);
    content.appendChild(medallaBig);
    content.appendChild(titulo);
    content.appendChild(desc);
    modal.appendChild(content);
    document.body.appendChild(modal);
    
    modal.onclick = e => {
        if (e.target === modal) document.body.removeChild(modal);
    };
}

// Continuará...

// ============================================
// 10. ADMIN
// ============================================
function renderizarAdmin() {
    renderizarResultadosAdmin();
    renderizarControlJornadas();
    renderizarUsuariosAdmin();
    renderizarModeradoresAdmin();
}

function renderizarResultadosAdmin() {
    const container = document.getElementById('adminResultadosContainer');
    const jornada = 'jornada' + estado.jornadaAdmin;
    const partidos = PARTIDOS[jornada];
    
    document.getElementById('jornadaDisplayAdmin').textContent = 'Jornada ' + estado.jornadaAdmin;
    container.innerHTML = '';
    
    const porGrupo = {};
    partidos.forEach(p => {
        if (!porGrupo[p.grupo]) porGrupo[p.grupo] = [];
        porGrupo[p.grupo].push(p);
    });
    
    Object.keys(porGrupo).sort().forEach(grupo => {
        const header = document.createElement('h3');
        header.textContent = 'Grupo ' + grupo;
        header.style.cssText = 'grid-column:1/-1;color:var(--primary);margin-top:20px;margin-bottom:10px;';
        container.appendChild(header);
        
        porGrupo[grupo].forEach(partido => {
            container.appendChild(crearTarjetaPartido(partido, 'admin'));
        });
    });
}

function guardarResultadosAdmin() {
    const inputs = document.querySelectorAll('.admin-score');
    const resultadosTemp = {};
    
    inputs.forEach(input => {
        const matchId = input.dataset.matchId;
        const team = input.dataset.team;
        const value = input.value.trim();
        const numero = parseInt(value);
        
        if (!isNaN(numero) && numero >= 0) {
            if (!resultadosTemp[matchId]) resultadosTemp[matchId] = {};
            resultadosTemp[matchId][team] = numero;
        }
    });
    
    Object.keys(resultadosTemp).forEach(matchId => {
        if (resultadosTemp[matchId].local !== undefined && resultadosTemp[matchId].visitante !== undefined) {
            if (!estado.resultados[matchId]) estado.resultados[matchId] = {};
            estado.resultados[matchId] = resultadosTemp[matchId];
        }
    });
    
    guardarDatos();
    mostrarToast('OK', 'Resultados guardados: ' + Object.keys(resultadosTemp).length + ' partidos');
    renderizarRanking();
}

function renderizarControlJornadas() {
    const container = document.getElementById('controlJornadasContainer');
    if (!container) return;
    
    container.innerHTML = '<h4 style="margin-bottom:15px;">Control de Jornadas</h4>';
    
    [1, 2, 3].forEach(j => {
        const habilitada = estado.jornadasHabilitadas[j];
        const div = document.createElement('div');
        div.style.cssText = 'display:flex;justify-content:space-between;align-items:center;padding:10px;background:#f8f9fa;border-radius:8px;margin-bottom:10px;';
        div.innerHTML = `
            <span style="font-weight:600;">Jornada ${j}</span>
            <button class="btn-reset" style="background:${habilitada ? '#dc3545' : '#28a745'};" onclick="toggleJornada(${j})">
                ${habilitada ? 'Deshabilitar' : 'Habilitar'}
            </button>
        `;
        container.appendChild(div);
    });
}

window.toggleJornada = function(j) {
    estado.jornadasHabilitadas[j] = !estado.jornadasHabilitadas[j];
    guardarDatos();
    renderizarControlJornadas();
    mostrarToast('OK', 'Jornada ' + j + ' ' + (estado.jornadasHabilitadas[j] ? 'habilitada' : 'deshabilitada'));
};

function renderizarPagos() {
    document.getElementById('montoCuota').value = estado.montoCuota;
    
    const usuariosPagados = Object.keys(estado.usuariosPagados).filter(id => estado.usuariosPagados[id]).length;
    const totalRecaudado = usuariosPagados * estado.montoCuota;
    
    document.getElementById('cantidadPagados').textContent = usuariosPagados;
    document.getElementById('totalRecaudado').textContent = '$' + totalRecaudado.toLocaleString();
    
    const container = document.getElementById('listaPagosContainer');
    container.innerHTML = '';
    
    estado.usuarios.forEach(usuario => {
        const pagado = estado.usuariosPagados[usuario.id] || false;
        const div = document.createElement('div');
        div.style.cssText = 'display:flex;justify-content:space-between;align-items:center;padding:12px;background:#f8f9fa;border-radius:8px;margin-bottom:10px;';
        div.innerHTML = `
            <div>
                <div style="font-weight:600;">${pagado ? '[OK]' : '[X]'} ${usuario.nombre}</div>
                <div style="font-size:0.85rem;color:#666;">@${usuario.username}</div>
            </div>
            <button class="btn-reset" style="background:${pagado ? '#dc3545' : '#28a745'};" onclick="togglePago('${usuario.id}')">
                ${pagado ? 'Marcar No Pagado' : 'Marcar Pagado'}
            </button>
        `;
        container.appendChild(div);
    });
}

window.togglePago = function(userId) {
    const usuario = estado.usuarios.find(u => u.id === userId);
    if (usuario) {
        estado.usuariosPagados[userId] = !estado.usuariosPagados[userId];
        guardarDatos();
        renderizarPagos();
        renderizarRanking();
        mostrarToast('OK', usuario.nombre + ' marcado como ' + (estado.usuariosPagados[userId] ? 'pagado' : 'no pagado'));
    }
};

function renderizarUsuariosAdmin() {
    const container = document.getElementById('usuariosContainer');
    container.innerHTML = '';
    
    if (estado.usuarios.length === 0) {
        container.innerHTML = '<p style="text-align:center;padding:20px;color:#999;">No hay usuarios registrados</p>';
        return;
    }
    
    estado.usuarios.forEach(usuario => {
        const pagado = estado.usuariosPagados[usuario.id] || false;
        const div = document.createElement('div');
        div.className = 'usuario-item';
        div.innerHTML = `
            <div class="usuario-info">
                <div class="usuario-nombre">${pagado ? '[OK]' : '[X]'} ${usuario.nombre}</div>
                <div class="usuario-email">${usuario.whatsapp || 'Sin WhatsApp'} (@${usuario.username})</div>
            </div>
            <div style="display:flex;gap:10px;flex-wrap:wrap;">
                <button class="btn-reset" onclick="resetearPassword('${usuario.id}')">Resetear Contraseña</button>
                <button class="btn-reset" style="background:#dc3545;" onclick="eliminarUsuario('${usuario.id}')">Eliminar</button>
            </div>
        `;
        container.appendChild(div);
    });
}

window.resetearPassword = function(userId) {
    mostrarConfirmacion('Resetear Contraseña', 'Deseas resetear la contraseña de este usuario a "123456"?', () => {
        const usuario = estado.usuarios.find(u => u.id === userId);
        if (usuario) {
            usuario.password = '123456';
            guardarDatos();
            mostrarToast('OK', 'Contraseña reseteada para ' + usuario.nombre);
        }
    });
};

window.eliminarUsuario = function(userId) {
    const usuario = estado.usuarios.find(u => u.id === userId);
    if (!usuario) return;
    
    mostrarConfirmacion('Eliminar Usuario', 'Estas seguro de eliminar a ' + usuario.nombre + '? Esta accion no se puede deshacer.', () => {
        estado.usuarios = estado.usuarios.filter(u => u.id !== userId);
        delete estado.pronosticos[userId];
        delete estado.pronosticosBloqueados[userId];
        delete estado.usuariosPagados[userId];
        guardarDatos();
        renderizarUsuariosAdmin();
        mostrarToast('OK', 'Usuario ' + usuario.nombre + ' eliminado');
    });
};

function renderizarModeradoresAdmin() {
    const container = document.getElementById('moderadoresContainer');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (estado.moderadores.length === 0) {
        container.innerHTML = '<p style="color:#999;text-align:center;padding:20px;">No hay moderadores</p>';
        return;
    }
    
    estado.moderadores.forEach(mod => {
        const div = document.createElement('div');
        div.style.cssText = 'display:flex;justify-content:space-between;align-items:center;padding:12px;background:#f8f9fa;border-radius:8px;margin-bottom:10px;';
        div.innerHTML = `
            <div>
                <div style="font-weight:600;">${mod.nombre}</div>
                <div style="font-size:0.85rem;color:#666;">@${mod.username} - Contraseña: ${mod.password}</div>
            </div>
            <button class="btn-reset" style="background:#dc3545;" onclick="eliminarModerador('${mod.id}')">Eliminar</button>
        `;
        container.appendChild(div);
    });
}

window.cambiarPasswordAdmin = function() {
    const nueva = prompt('Ingresa la nueva contraseña de administrador:');
    if (nueva && nueva.length >= 6) {
        estado.adminPassword = nueva;
        guardarDatos();
        mostrarToast('OK', 'Contraseña de administrador actualizada');
    } else if (nueva) {
        mostrarToast('X', 'La contraseña debe tener al menos 6 caracteres');
    }
};

window.agregarModerador = function() {
    if (estado.usuarios.length === 0) {
        mostrarToast('X', 'No hay usuarios registrados');
        return;
    }
    
    const disponibles = estado.usuarios.filter(u => !estado.moderadores.find(m => m.userId === u.id));
    if (disponibles.length === 0) {
        mostrarToast('X', 'Todos los usuarios ya son moderadores');
        return;
    }
    
    let opciones = disponibles.map((u, i) => (i + 1) + '. ' + u.nombre + ' (@' + u.username + ')').join('\n');
    const seleccion = prompt('Selecciona un usuario para hacer moderador:\n\n' + opciones + '\n\nIngresa el numero:');
    
    if (!seleccion) return;
    
    const index = parseInt(seleccion) - 1;
    if (isNaN(index) || index < 0 || index >= disponibles.length) {
        mostrarToast('X', 'Seleccion invalida');
        return;
    }
    
    const usuario = disponibles[index];
    const password = prompt('Contraseña de moderador para ' + usuario.nombre + ':');
    
    if (!password || password.length < 6) {
        mostrarToast('X', 'La contraseña debe tener al menos 6 caracteres');
        return;
    }
    
    const nuevoMod = {
        id: Date.now().toString(),
        userId: usuario.id,
        nombre: usuario.nombre,
        username: usuario.username,
        password: password
    };
    
    estado.moderadores.push(nuevoMod);
    guardarDatos();
    renderizarModeradoresAdmin();
    mostrarToast('OK', usuario.nombre + ' es ahora moderador');
};

window.eliminarModerador = function(modId) {
    mostrarConfirmacion('Eliminar Moderador', 'Estas seguro de eliminar este moderador?', () => {
        estado.moderadores = estado.moderadores.filter(m => m.id !== modId);
        guardarDatos();
        renderizarModeradoresAdmin();
        mostrarToast('OK', 'Moderador eliminado');
    });
};

window.limpiarTodosDatos = function() {
    const password = prompt('ADVERTENCIA: Esto eliminara TODOS los datos.\n\nPara confirmar, ingresa la contraseña de administrador:');
    
    if (!password) return;
    
    if (password === estado.adminPassword) {
        const confirmar = confirm('Estas ABSOLUTAMENTE seguro? Esta accion NO se puede deshacer.');
        if (confirmar) {
            localStorage.clear();
            alert('Todos los datos han sido eliminados.\n\nLa pagina se recargara.');
            location.reload();
        }
    } else {
        mostrarToast('X', 'Contraseña incorrecta');
    }
};

function renderizarReglas() {
    const container = document.getElementById('reglasContent');
    let html = REGLAS
        .replace(/^# (.+)$/gm, '<h1>$1</h1>')
        .replace(/^## (.+)$/gm, '<h2>$1</h2>')
        .replace(/^### (.+)$/gm, '<h3>$1</h3>')
        .replace(/^\- (.+)$/gm, '<li>$1</li>')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n\n/g, '</p><p>')
        .replace(/^(?!<[hl])/gm, '<p>')
        .replace(/(?<![>])$/gm, '</p>');
    container.innerHTML = html;
}

function renderizarBracketUsuario() {
    const container = document.getElementById('bracketUserContainer');
    if (!estado.bracketVisible) {
        container.innerHTML = '<p style="text-align:center;padding:40px;color:#999;">Las llaves aun no estan disponibles.</p>';
        return;
    }
    container.innerHTML = '<p>Bracket en construccion...</p>';
}

function renderizarBracketAdmin() {
    const container = document.getElementById('bracketAdminContainer');
    container.innerHTML = '<p>Bracket admin en construccion...</p>';
}

window.cambiarSubTabBracket = function() {};

// ============================================
// 11. EVENT LISTENERS
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    cargarDatos();
    
    // Login
    ['loginUsername', 'loginPassword'].forEach(id => {
        document.getElementById(id).addEventListener('keypress', e => {
            if (e.key === 'Enter') iniciarSesion();
        });
    });
    
    // Registro
    ['regFullName', 'regUsername', 'regWhatsapp', 'regPassword', 'regPasswordConfirm'].forEach(id => {
        document.getElementById(id).addEventListener('keypress', e => {
            if (e.key === 'Enter') registrarUsuario();
        });
    });
    
    // Admin
    document.getElementById('adminPassword').addEventListener('keypress', e => {
        if (e.key === 'Enter') iniciarSesionAdmin();
    });
    
    // Botones
    document.getElementById('btnLogin').addEventListener('click', iniciarSesion);
    document.getElementById('btnRegister').addEventListener('click', registrarUsuario);
    document.getElementById('btnAdminLogin').addEventListener('click', iniciarSesionAdmin);
    document.getElementById('btnLogout').addEventListener('click', cerrarSesion);
    
    document.getElementById('btnShowRegister').addEventListener('click', () => mostrarFormulario('register'));
    document.getElementById('btnBackToLogin').addEventListener('click', () => mostrarFormulario('login'));
    document.getElementById('btnShowAdmin').addEventListener('click', () => mostrarFormulario('admin'));
    document.getElementById('btnBackToLoginFromAdmin').addEventListener('click', () => mostrarFormulario('login'));
    
    // Navegación
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', e => cambiarVista(e.target.dataset.view));
    });
    
    document.querySelectorAll('.admin-tab-btn').forEach(btn => {
        btn.addEventListener('click', e => cambiarTabAdmin(e.target.dataset.adminTab));
    });
    
    // Jornadas
    document.getElementById('btnPrevJornada').addEventListener('click', () => {
        if (estado.jornadaActual > 1) {
            estado.jornadaActual--;
            renderizarPronosticos();
        }
    });
    
    document.getElementById('btnNextJornada').addEventListener('click', () => {
        if (estado.jornadaActual < 3) {
            estado.jornadaActual++;
            renderizarPronosticos();
        }
    });
    
    document.getElementById('btnPrevJornadaRes').addEventListener('click', () => {
        if (estado.jornadaResultados > 1) {
            estado.jornadaResultados--;
            renderizarResultados();
        }
    });
    
    document.getElementById('btnNextJornadaRes').addEventListener('click', () => {
        if (estado.jornadaResultados < 3) {
            estado.jornadaResultados++;
            renderizarResultados();
        }
    });
    
    document.getElementById('btnPrevJornadaAdmin').addEventListener('click', () => {
        if (estado.jornadaAdmin > 1) {
            estado.jornadaAdmin--;
            renderizarResultadosAdmin();
        }
    });
    
    document.getElementById('btnNextJornadaAdmin').addEventListener('click', () => {
        if (estado.jornadaAdmin < 3) {
            estado.jornadaAdmin++;
            renderizarResultadosAdmin();
        }
    });
    
    // Guardar
    document.getElementById('btnGuardarPronosticos').addEventListener('click', guardarPronosticos);
    document.getElementById('btnGuardarResultados').addEventListener('click', guardarResultadosAdmin);
    
    // Pagos
    document.getElementById('btnGuardarMonto').addEventListener('click', () => {
        estado.montoCuota = parseInt(document.getElementById('montoCuota').value) || 100;
        guardarDatos();
        renderizarPagos();
        mostrarToast('OK', 'Monto actualizado');
    });
    
    console.log('Aplicacion cargada correctamente');
});

// ============================================
// 12. VER ACIERTOS DE USUARIO
// ============================================
function verAciertosUsuario(userId) {
    const usuario = estado.usuarios.find(u => u.id === userId);
    if (!usuario) return;
    
    const pronosticosUsuario = estado.pronosticos[userId];
    if (!pronosticosUsuario) {
        mostrarToast('!', 'Este usuario no tiene pronosticos');
        return;
    }
    
    // Agrupar aciertos por jornada
    const aciertosPorJornada = {
        1: { ganadores: [], exactos: [] },
        2: { ganadores: [], exactos: [] },
        3: { ganadores: [], exactos: [] }
    };
    
    // Procesar todos los partidos
    [1, 2, 3].forEach(j => {
        const jornada = 'jornada' + j;
        PARTIDOS[jornada].forEach(partido => {
            const resultado = estado.resultados[partido.id];
            const pronostico = pronosticosUsuario[partido.id];
            
            if (!resultado || resultado.local === undefined || !pronostico) return;
            
            const pronosticoGanador = obtenerGanador(pronostico.local, pronostico.visitante);
            const resultadoGanador = obtenerGanador(resultado.local, resultado.visitante);
            
            if (pronosticoGanador === resultadoGanador) {
                const equipoLocal = EQUIPOS[partido.local].nombre;
                const equipoVisitante = EQUIPOS[partido.visitante].nombre;
                
                const acierto = {
                    partido: equipoLocal + ' vs ' + equipoVisitante,
                    pronostico: pronostico.local + '-' + pronostico.visitante,
                    resultado: resultado.local + '-' + resultado.visitante,
                    puntos: 1
                };
                
                if (pronostico.local === resultado.local && pronostico.visitante === resultado.visitante) {
                    acierto.puntos = 4;
                    aciertosPorJornada[j].exactos.push(acierto);
                } else {
                    aciertosPorJornada[j].ganadores.push(acierto);
                }
            }
        });
    });
    
    // Crear modal personalizado
    mostrarModalAciertos(usuario.nombre, aciertosPorJornada);
}

function mostrarModalAciertos(nombreUsuario, aciertosPorJornada) {
    // Crear modal
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;z-index:10000;overflow-y:auto;padding:20px;';
    
    const content = document.createElement('div');
    content.style.cssText = 'background:white;padding:30px;border-radius:20px;max-width:800px;width:100%;max-height:90vh;overflow-y:auto;position:relative;';
    
    // Botón cerrar
    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'X';
    closeBtn.style.cssText = 'position:absolute;top:15px;right:15px;background:none;border:none;font-size:24px;cursor:pointer;color:#999;font-weight:bold;';
    closeBtn.onclick = () => document.body.removeChild(modal);
    
    // Título
    const titulo = document.createElement('h2');
    titulo.textContent = 'Aciertos de ' + nombreUsuario;
    titulo.style.cssText = 'color:var(--primary);margin-bottom:20px;font-size:1.8rem;';
    
    content.appendChild(closeBtn);
    content.appendChild(titulo);
    
    // Contenido por jornada
    [1, 2, 3].forEach(j => {
        const jornada = aciertosPorJornada[j];
        const totalAciertos = jornada.exactos.length + jornada.ganadores.length;
        
        if (totalAciertos === 0) return;
        
        const jornadaDiv = document.createElement('div');
        jornadaDiv.style.cssText = 'margin-bottom:25px;';
        
        const jornadaTitulo = document.createElement('h3');
        jornadaTitulo.textContent = 'Jornada ' + j + ' (' + totalAciertos + ' aciertos)';
        jornadaTitulo.style.cssText = 'color:var(--dark);margin-bottom:15px;font-size:1.3rem;';
        jornadaDiv.appendChild(jornadaTitulo);
        
        // Exactos
        if (jornada.exactos.length > 0) {
            const exactosDiv = document.createElement('div');
            exactosDiv.style.cssText = 'margin-bottom:15px;';
            
            const exactosTitulo = document.createElement('h4');
            exactosTitulo.textContent = 'Marcadores Exactos (' + jornada.exactos.length + ')';
            exactosTitulo.style.cssText = 'color:var(--success);margin-bottom:10px;font-size:1.1rem;';
            exactosDiv.appendChild(exactosTitulo);
            
            jornada.exactos.forEach(acierto => {
                const item = crearItemAcierto(acierto, true);
                exactosDiv.appendChild(item);
            });
            
            jornadaDiv.appendChild(exactosDiv);
        }
        
        // Ganadores
        if (jornada.ganadores.length > 0) {
            const ganadoresDiv = document.createElement('div');
            
            const ganadoresTitulo = document.createElement('h4');
            ganadoresTitulo.textContent = 'Ganadores Acertados (' + jornada.ganadores.length + ')';
            ganadoresTitulo.style.cssText = 'color:var(--primary);margin-bottom:10px;font-size:1.1rem;';
            ganadoresDiv.appendChild(ganadoresTitulo);
            
            jornada.ganadores.forEach(acierto => {
                const item = crearItemAcierto(acierto, false);
                ganadoresDiv.appendChild(item);
            });
            
            jornadaDiv.appendChild(ganadoresDiv);
        }
        
        content.appendChild(jornadaDiv);
    });
    
    modal.appendChild(content);
    document.body.appendChild(modal);
    
    // Cerrar al hacer click fuera
    modal.onclick = e => {
        if (e.target === modal) document.body.removeChild(modal);
    };
}

function crearItemAcierto(acierto, esExacto) {
    const item = document.createElement('div');
    item.style.cssText = 'background:' + (esExacto ? 'rgba(0,204,102,0.1)' : 'rgba(102,126,234,0.1)') + ';padding:12px 15px;border-radius:8px;margin-bottom:8px;display:flex;justify-content:space-between;align-items:center;border-left:4px solid ' + (esExacto ? 'var(--success)' : 'var(--primary)') + ';';
    
    const info = document.createElement('div');
    info.innerHTML = '<div style="font-weight:700;margin-bottom:4px;">' + acierto.partido + '</div><div style="font-size:0.9rem;color:#666;">Pronóstico: ' + acierto.pronostico + ' | Resultado: ' + acierto.resultado + '</div>';
    
    const puntos = document.createElement('div');
    puntos.textContent = '+' + acierto.puntos + ' pts';
    puntos.style.cssText = 'font-weight:800;font-size:1.2rem;color:' + (esExacto ? 'var(--success)' : 'var(--primary)') + ';';
    
    item.appendChild(info);
    item.appendChild(puntos);
    
    return item;
}

// Modificar renderizarRanking para hacer clickeables los aciertos
const _renderizarRankingOriginal = renderizarRanking;
renderizarRanking = function() {
    const container = document.getElementById('rankingContainer');
    
    const ranking = estado.usuarios.map(usuario => {
        const puntos = calcularPuntos(usuario.id);
        const aciertos = calcularAciertos(usuario.id);
        const pagado = estado.usuariosPagados[usuario.id] || false;
        return { usuario, puntos, aciertos, pagado };
    }).sort((a, b) => {
        if (b.puntos !== a.puntos) return b.puntos - a.puntos;
        return b.aciertos.exactos - a.aciertos.exactos;
    });
    
    container.innerHTML = '';
    
    if (ranking.length === 0) {
        container.innerHTML = '<p style="text-align:center;padding:40px;color:#999;">No hay usuarios registrados</p>';
        return;
    }
    
    ranking.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'ranking-item';
        
        if (item.pagado) {
            div.style.background = 'linear-gradient(90deg,rgba(0,204,102,0.1),transparent)';
            div.style.borderLeft = '4px solid var(--success)';
        } else {
            div.style.background = 'linear-gradient(90deg,rgba(220,53,69,0.1),transparent)';
            div.style.borderLeft = '4px solid var(--danger)';
        }
        
        let medalla = '';
        if (index === 0) medalla = '[1] ';
        else if (index === 1) medalla = '[2] ';
        else if (index === 2) medalla = '[3] ';
        
        const estadoPago = item.pagado ? '[OK]' : '[X]';
        
        // Stats clickeable
        const statsDiv = document.createElement('div');
        statsDiv.className = 'ranking-stats';
        statsDiv.textContent = item.aciertos.ganadores + '/' + item.aciertos.total + ' aciertos';
        statsDiv.style.cursor = 'pointer';
        statsDiv.style.color = 'var(--primary)';
        statsDiv.style.textDecoration = 'underline';
        statsDiv.onclick = () => verAciertosUsuario(item.usuario.id);
        statsDiv.title = 'Click para ver detalles';
        
        div.innerHTML = `
            <div class="ranking-position">${medalla}${index + 1}</div>
            <div class="ranking-name">${estadoPago} ${item.usuario.nombre}</div>
        `;
        
        div.appendChild(statsDiv);
        
        const puntosDiv = document.createElement('div');
        puntosDiv.className = 'ranking-points';
        puntosDiv.textContent = item.puntos + ' pts';
        div.appendChild(puntosDiv);
        
        container.appendChild(div);
    });
};

// ============================================
// 13. GENERAR DATOS DE PRUEBA
// ============================================
function generarDatosPrueba() {
    if (!confirm('Esto eliminara todos los datos actuales y creara 10 usuarios de prueba. Continuar?')) {
        return;
    }
    
    console.log('Generando datos de prueba...');
    
    const nombres = [
        'Carlos Mendez', 'Ana Garcia', 'Luis Rodriguez', 'Maria Lopez',
        'Jorge Sanchez', 'Laura Martinez', 'Pedro Hernandez', 'Sofia Torres',
        'Miguel Ramirez', 'Carmen Flores'
    ];
    
    const usuarios = [];
    const pronosticos = {};
    const pronosticosBloqueados = {};
    const usuariosPagados = {};
    
    nombres.forEach((nombre, index) => {
        const username = nombre.toLowerCase().replace(' ', '');
        const id = 'user_' + (index + 1);
        
        usuarios.push({
            id: id,
            nombre: nombre,
            username: username,
            whatsapp: '+52155' + (1000000 + index).toString(),
            password: '123456',
            fechaRegistro: new Date().toISOString()
        });
        
        usuariosPagados[id] = Math.random() > 0.3;
        pronosticos[id] = {};
        pronosticosBloqueados[id] = { 1: true, 2: true, 3: true };
        
        PARTIDOS.jornada1.forEach(partido => {
            pronosticos[id][partido.id] = {
                local: Math.floor(Math.random() * 4),
                visitante: Math.floor(Math.random() * 4)
            };
        });
        
        PARTIDOS.jornada2.forEach(partido => {
            pronosticos[id][partido.id] = {
                local: Math.floor(Math.random() * 4),
                visitante: Math.floor(Math.random() * 4)
            };
        });
        
        PARTIDOS.jornada3.forEach(partido => {
            pronosticos[id][partido.id] = {
                local: Math.floor(Math.random() * 4),
                visitante: Math.floor(Math.random() * 4)
            };
        });
    });
    
    const resultados = {};
    
    PARTIDOS.jornada1.forEach(partido => {
        resultados[partido.id] = {
            local: Math.floor(Math.random() * 4),
            visitante: Math.floor(Math.random() * 4)
        };
    });
    
    PARTIDOS.jornada2.forEach(partido => {
        resultados[partido.id] = {
            local: Math.floor(Math.random() * 4),
            visitante: Math.floor(Math.random() * 4)
        };
    });
    
    PARTIDOS.jornada3.forEach(partido => {
        resultados[partido.id] = {
            local: Math.floor(Math.random() * 4),
            visitante: Math.floor(Math.random() * 4)
        };
    });
    
    estado.usuarios = usuarios;
    estado.pronosticos = pronosticos;
    estado.resultados = resultados;
    estado.pronosticosBloqueados = pronosticosBloqueados;
    estado.usuariosPagados = usuariosPagados;
    estado.jornadasHabilitadas = { 1: true, 2: true, 3: true };
    
    guardarDatos();
    
    alert('Datos de prueba generados!\n\n10 usuarios creados\nPassword: 123456\n\nLa pagina se recargara.');
    location.reload();
}

// Event listener para generar datos
document.addEventListener('DOMContentLoaded', function() {
    const btnGenerar = document.getElementById('btnGenerarDatos');
    if (btnGenerar) {
        btnGenerar.addEventListener('click', generarDatosPrueba);
    }
});

// ============================================
// 14. NUEVAS FUNCIONALIDADES
// ============================================

// Agregar al estado global
estado.votosDistribucion = { clasico: 0, ganador: 0, escalera: 0 };
estado.registroHabilitado = true;

// Modificar función de registro
const _registrarUsuarioOriginal = registrarUsuario;
registrarUsuario = function() {
    // Verificar si el registro está habilitado
    if (!estado.registroHabilitado) {
        mostrarToast('X', 'El registro de nuevos usuarios esta deshabilitado');
        return;
    }
    
    const nombre = document.getElementById('regFullName').value.trim();
    const username = document.getElementById('regUsername').value.trim();
    const whatsapp = document.getElementById('regWhatsapp').value.trim();
    const password = document.getElementById('regPassword').value;
    const passwordConfirm = document.getElementById('regPasswordConfirm').value;
    
    if (!nombre || !username || !whatsapp || !password) {
        mostrarToast('!', 'Completa todos los campos');
        return;
    }
    
    if (password !== passwordConfirm) {
        mostrarToast('X', 'Las contrasenas no coinciden');
        return;
    }
    
    if (estado.usuarios.find(u => u.username === username)) {
        mostrarToast('X', 'El usuario ya existe');
        return;
    }
    
    // Obtener voto de distribución
    const distribucionSeleccionada = document.querySelector('input[name="distribucion"]:checked').value;
    
    const nuevoUsuario = {
        id: Date.now().toString(),
        nombre: nombre,
        username: username,
        whatsapp: whatsapp,
        password: password,
        fechaRegistro: new Date().toISOString(),
        votoDistribucion: distribucionSeleccionada
    };
    
    estado.usuarios.push(nuevoUsuario);
    estado.pronosticosBloqueados[nuevoUsuario.id] = {};
    estado.usuariosPagados[nuevoUsuario.id] = false;
    
    // Registrar voto
    if (!estado.votosDistribucion) estado.votosDistribucion = { clasico: 0, ganador: 0, escalera: 0 };
    estado.votosDistribucion[distribucionSeleccionada]++;
    
    guardarDatos();
    
    estado.usuarioActual = nuevoUsuario;
    mostrarApp();
    mostrarToast('OK', 'Cuenta creada exitosamente. Gracias por votar!');
};

// Modificar renderizarPronosticos para usuarios no pagados
const _renderizarPronosticosOriginal2 = renderizarPronosticos;
renderizarPronosticos = function() {
    const userId = estado.usuarioActual.id;
    const pagado = estado.usuariosPagados[userId];
    
    // Si no ha pagado, solo puede ver la jornada actual
    if (!pagado && estado.jornadaActual !== obtenerJornadaActual()) {
        const container = document.getElementById('pronosticosContainer');
        container.innerHTML = '<div style="text-align:center;padding:40px;background:white;border-radius:12px;"><h3 style="color:var(--warning);margin-bottom:15px;"> Pago Requerido</h3><p style="color:#666;margin-bottom:20px;">Para ver tus pronosticos de jornadas anteriores, debes realizar el pago.</p><p style="color:#666;">Contacta al administrador para mas informacion.</p></div>';
        document.getElementById('btnGuardarPronosticos').style.display = 'none';
        return;
    }
    
    _renderizarPronosticosOriginal2();
};

function obtenerJornadaActual() {
    for (let j = 3; j >= 1; j--) {
        if (estado.jornadasHabilitadas[j] === true) {
            return j;
        }
    }
    return 1;
}

// Modificar renderizarRanking para excluir no pagados
const _renderizarRankingOriginal2 = renderizarRanking;
renderizarRanking = function() {
    const container = document.getElementById('rankingContainer');
    
    // Filtrar solo usuarios pagados
    const ranking = estado.usuarios
        .filter(usuario => estado.usuariosPagados[usuario.id])
        .map(usuario => {
            const puntos = calcularPuntos(usuario.id);
            const aciertos = calcularAciertos(usuario.id);
            const pagado = true;
            return { usuario, puntos, aciertos, pagado };
        })
        .sort((a, b) => {
            if (b.puntos !== a.puntos) return b.puntos - a.puntos;
            return b.aciertos.exactos - a.aciertos.exactos;
        });
    
    container.innerHTML = '';
    
    if (ranking.length === 0) {
        container.innerHTML = '<div style="text-align:center;padding:40px;background:white;border-radius:12px;"><h3 style="color:var(--warning);margin-bottom:15px;"> Ranking No Disponible</h3><p style="color:#666;">El ranking solo muestra usuarios que han realizado el pago.</p></div>';
        return;
    }
    
    ranking.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'ranking-item';
        div.style.background = 'linear-gradient(90deg,rgba(0,204,102,0.1),transparent)';
        div.style.borderLeft = '4px solid var(--success)';
        
        let medalla = '';
        if (index === 0) medalla = '[1] ';
        else if (index === 1) medalla = '[2] ';
        else if (index === 2) medalla = '[3] ';
        
        const statsDiv = document.createElement('div');
        statsDiv.className = 'ranking-stats';
        statsDiv.textContent = item.aciertos.ganadores + '/' + item.aciertos.total + ' aciertos';
        statsDiv.style.cursor = 'pointer';
        statsDiv.style.color = 'var(--primary)';
        statsDiv.style.textDecoration = 'underline';
        statsDiv.onclick = () => verAciertosUsuario(item.usuario.id);
        statsDiv.title = 'Click para ver detalles';
        
        div.innerHTML = `
            <div class="ranking-position">${medalla}${index + 1}</div>
            <div class="ranking-name">${item.usuario.nombre}</div>
        `;
        
        div.appendChild(statsDiv);
        
        const puntosDiv = document.createElement('div');
        puntosDiv.className = 'ranking-points';
        puntosDiv.textContent = item.puntos + ' pts';
        div.appendChild(puntosDiv);
        
        container.appendChild(div);
    });
};

// Agregar control de registro en admin
function renderizarControlRegistro() {
    const container = document.getElementById('usuariosContainer');
    if (!container) return;
    
    const controlDiv = document.createElement('div');
    controlDiv.style.cssText = 'background:#f8f9fa;padding:20px;border-radius:10px;margin-bottom:20px;border:2px solid var(--primary);';
    controlDiv.innerHTML = `
        <h4 style="margin-bottom:15px;color:var(--primary);">Control de Registro</h4>
        <div style="display:flex;justify-content:space-between;align-items:center;">
            <div>
                <strong>Estado del Registro:</strong>
                <span style="margin-left:10px;color:${estado.registroHabilitado ? 'var(--success)' : 'var(--danger)'};font-weight:700;">
                    ${estado.registroHabilitado ? 'HABILITADO' : 'DESHABILITADO'}
                </span>
            </div>
            <button class="btn-reset" style="background:${estado.registroHabilitado ? '#dc3545' : '#28a745'};" onclick="toggleRegistro()">
                ${estado.registroHabilitado ? 'Deshabilitar Registro' : 'Habilitar Registro'}
            </button>
        </div>
    `;
    
    container.insertBefore(controlDiv, container.firstChild);
}

window.toggleRegistro = function() {
    estado.registroHabilitado = !estado.registroHabilitado;
    guardarDatos();
    renderizarUsuariosAdmin();
    mostrarToast('OK', 'Registro ' + (estado.registroHabilitado ? 'habilitado' : 'deshabilitado'));
};

// Modificar renderizarUsuariosAdmin para incluir control
const _renderizarUsuariosAdminOriginal = renderizarUsuariosAdmin;
renderizarUsuariosAdmin = function() {
    _renderizarUsuariosAdminOriginal();
    renderizarControlRegistro();
};

// Mostrar botón de crear cuenta solo si está habilitado
function actualizarBotonRegistro() {
    const btnShowRegister = document.getElementById('btnShowRegister');
    if (btnShowRegister) {
        if (estado.registroHabilitado) {
            btnShowRegister.style.display = 'block';
        } else {
            btnShowRegister.style.display = 'none';
        }
    }
}

// Llamar al cargar
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(actualizarBotonRegistro, 100);
});

// ============================================
// 15. REDIRIGIR A REGLAS EN PRIMER LOGIN
// ============================================

// Modificar la función de registro para marcar primer login
const _registrarUsuarioOriginal2 = registrarUsuario;
registrarUsuario = function() {
    if (!estado.registroHabilitado) {
        mostrarToast('X', 'El registro de nuevos usuarios esta deshabilitado');
        return;
    }
    
    const nombre = document.getElementById('regFullName').value.trim();
    const username = document.getElementById('regUsername').value.trim();
    const whatsapp = document.getElementById('regWhatsapp').value.trim();
    const password = document.getElementById('regPassword').value;
    const passwordConfirm = document.getElementById('regPasswordConfirm').value;
    
    if (!nombre || !username || !whatsapp || !password) {
        mostrarToast('!', 'Completa todos los campos');
        return;
    }
    
    if (password !== passwordConfirm) {
        mostrarToast('X', 'Las contrasenas no coinciden');
        return;
    }
    
    if (estado.usuarios.find(u => u.username === username)) {
        mostrarToast('X', 'El usuario ya existe');
        return;
    }
    
    const distribucionSeleccionada = document.querySelector('input[name="distribucion"]:checked').value;
    
    const nuevoUsuario = {
        id: Date.now().toString(),
        nombre: nombre,
        username: username,
        whatsapp: whatsapp,
        password: password,
        fechaRegistro: new Date().toISOString(),
        votoDistribucion: distribucionSeleccionada,
        primerLogin: true
    };
    
    estado.usuarios.push(nuevoUsuario);
    estado.pronosticosBloqueados[nuevoUsuario.id] = {};
    estado.usuariosPagados[nuevoUsuario.id] = false;
    
    if (!estado.votosDistribucion) estado.votosDistribucion = { clasico: 0, ganador: 0, escalera: 0 };
    estado.votosDistribucion[distribucionSeleccionada]++;
    
    guardarDatos();
    
    estado.usuarioActual = nuevoUsuario;
    mostrarApp();
    
    // Ir directamente a reglas en primer login
    setTimeout(() => {
        cambiarVista('reglas');
        mostrarToast('OK', 'Bienvenido! Lee las reglas del juego');
    }, 500);
};

// Modificar iniciarSesion para detectar primer login
const _iniciarSesionOriginal2 = iniciarSesion;
iniciarSesion = function() {
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;
    
    if (!username || !password) {
        mostrarToast('!', 'Completa todos los campos');
        return;
    }
    
    const usuario = estado.usuarios.find(u => u.username === username && u.password === password);
    
    if (usuario) {
        estado.usuarioActual = usuario;
        estado.esAdmin = false;
        estado.esModerador = false;
        
        for (let j = 3; j >= 1; j--) {
            if (estado.jornadasHabilitadas[j] === true) {
                estado.jornadaActual = j;
                break;
            }
        }
        
        mostrarApp();
        actualizarNombreConMedalla();
        
        // Si es primer login, ir a reglas
        if (usuario.primerLogin) {
            setTimeout(() => {
                cambiarVista('reglas');
                mostrarToast('OK', 'Bienvenido! Lee las reglas del juego');
                
                // Marcar que ya no es primer login
                usuario.primerLogin = false;
                guardarDatos();
            }, 500);
        } else {
            mostrarToast('OK', 'Bienvenido ' + usuario.nombre);
            setTimeout(() => verificarTop3(usuario.id), 1500);
        }
    } else {
        mostrarToast('X', 'Usuario o contrasena incorrectos');
    }
};

// ============================================
// 16. MOSTRAR VOTO DE DISTRIBUCIÓN EN ADMIN
// ============================================

// Sobrescribir renderizarUsuariosAdmin para mostrar votos
const _renderizarUsuariosAdminOriginal2 = renderizarUsuariosAdmin;
renderizarUsuariosAdmin = function() {
    const container = document.getElementById('usuariosContainer');
    container.innerHTML = '';
    
    // Agregar control de registro primero
    renderizarControlRegistro();
    
    // Mostrar resumen de votos
    if (estado.votosDistribucion) {
        const totalVotos = (estado.votosDistribucion.clasico || 0) + 
                          (estado.votosDistribucion.ganador || 0) + 
                          (estado.votosDistribucion.escalera || 0);
        
        if (totalVotos > 0) {
            const resumenDiv = document.createElement('div');
            resumenDiv.style.cssText = 'background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:white;padding:20px;border-radius:12px;margin-bottom:20px;';
            
            const clasicoPct = Math.round((estado.votosDistribucion.clasico || 0) / totalVotos * 100);
            const ganadorPct = Math.round((estado.votosDistribucion.ganador || 0) / totalVotos * 100);
            const escaleraPct = Math.round((estado.votosDistribucion.escalera || 0) / totalVotos * 100);
            
            resumenDiv.innerHTML = `
                <h4 style="margin-bottom:15px;font-size:1.3rem;"> Resumen de Votación - Distribución de Premios</h4>
                <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:15px;">
                    <div style="background:rgba(255,255,255,0.2);padding:15px;border-radius:8px;">
                        <div style="font-size:0.9rem;opacity:0.9;">Modelo Clásico</div>
                        <div style="font-size:2rem;font-weight:800;margin:5px 0;">${estado.votosDistribucion.clasico || 0}</div>
                        <div style="font-size:0.85rem;">${clasicoPct}% de votos</div>
                    </div>
                    <div style="background:rgba(255,255,255,0.2);padding:15px;border-radius:8px;">
                        <div style="font-size:0.9rem;opacity:0.9;">Gran Ganador</div>
                        <div style="font-size:2rem;font-weight:800;margin:5px 0;">${estado.votosDistribucion.ganador || 0}</div>
                        <div style="font-size:0.85rem;">${ganadorPct}% de votos</div>
                    </div>
                    <div style="background:rgba(255,255,255,0.2);padding:15px;border-radius:8px;">
                        <div style="font-size:0.9rem;opacity:0.9;">Escalera Suave</div>
                        <div style="font-size:2rem;font-weight:800;margin:5px 0;">${estado.votosDistribucion.escalera || 0}</div>
                        <div style="font-size:0.85rem;">${escaleraPct}% de votos</div>
                    </div>
                </div>
                <div style="margin-top:15px;padding-top:15px;border-top:1px solid rgba(255,255,255,0.3);">
                    <strong>Total de votos: ${totalVotos}</strong>
                </div>
            `;
            
            container.appendChild(resumenDiv);
        }
    }
    
    if (estado.usuarios.length === 0) {
        const emptyDiv = document.createElement('div');
        emptyDiv.innerHTML = '<p style="text-align:center;padding:20px;color:#999;">No hay usuarios registrados</p>';
        container.appendChild(emptyDiv);
        return;
    }
    
    // Mostrar usuarios con su voto
    estado.usuarios.forEach(usuario => {
        const pagado = estado.usuariosPagados[usuario.id] || false;
        const voto = usuario.votoDistribucion || 'No votó';
        
        // Mapear voto a texto legible
        const votoTexto = {
            'clasico': 'Clásico (50/30/20)',
            'ganador': 'Gran Ganador (60/25/15)',
            'escalera': 'Escalera (45/33/22)'
        };
        
        const votoDisplay = votoTexto[voto] || 'No votó';
        
        // Color según voto
        const votoColor = {
            'clasico': '#667eea',
            'ganador': '#28a745',
            'escalera': '#ff9800'
        };
        
        const color = votoColor[voto] || '#999';
        
        const div = document.createElement('div');
        div.className = 'usuario-item';
        div.innerHTML = `
            <div class="usuario-info">
                <div class="usuario-nombre">${pagado ? '[OK]' : '[X]'} ${usuario.nombre}</div>
                <div class="usuario-email">${usuario.whatsapp || 'Sin WhatsApp'} (@${usuario.username})</div>
                <div style="margin-top:8px;display:flex;align-items:center;gap:8px;">
                    <span style="background:${color};color:white;padding:4px 12px;border-radius:6px;font-size:0.85rem;font-weight:600;">
                         ${votoDisplay}
                    </span>
                </div>
            </div>
            <div style="display:flex;gap:10px;flex-wrap:wrap;">
                <button class="btn-reset" onclick="resetearPassword('${usuario.id}')">Resetear Contraseña</button>
                <button class="btn-reset" style="background:#dc3545;" onclick="eliminarUsuario('${usuario.id}')">Eliminar</button>
            </div>
        `;
        container.appendChild(div);
    });
};

// ============================================
// 17. CORREGIR MOSTRAR APP
// ============================================

// Sobrescribir mostrarApp correctamente
const _mostrarAppOriginal3 = mostrarApp;
mostrarApp = function() {
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('appScreen').classList.remove('hidden');
    
    // Actualizar nombre con medalla solo si NO es admin/moderador
    if (!estado.esAdmin && !estado.esModerador) {
        actualizarNombreConMedalla();
    } else {
        document.getElementById('currentUserName').textContent = estado.usuarioActual.nombre;
    }
    
    // Mostrar/ocultar pestañas según permisos
    const navAdmin = document.getElementById('navAdmin');
    const navLlaves = document.getElementById('navLlaves');
    
    if (navAdmin) {
        navAdmin.classList.toggle('hidden', !estado.esAdmin && !estado.esModerador);
    }
    
    if (navLlaves) {
        navLlaves.classList.toggle('hidden', !estado.bracketVisible);
    }
    
    // Ir a pronósticos por defecto (se sobrescribe si es primer login)
    cambiarVista('pronosticos');
};

// ============================================
// MEJORAR GENERADOR DE DATOS DE PRUEBA CON VOTACION
// ============================================

generarDatosPrueba = function() {
    if (!confirm('Esto eliminara todos los datos actuales y creara 10 usuarios de prueba. Continuar?')) {
        return;
    }
    
    console.log('Generando datos de prueba con votacion...');
    
    const nombres = [
        'Carlos Mendez', 'Ana Garcia', 'Luis Rodriguez', 'Maria Lopez',
        'Jorge Sanchez', 'Laura Martinez', 'Pedro Hernandez', 'Sofia Torres',
        'Miguel Ramirez', 'Carmen Flores'
    ];
    
    const opcionesVoto = ['clasico', 'ganador', 'escalera'];
    
    const usuarios = [];
    const pronosticos = {};
    const pronosticosBloqueados = {};
    const usuariosPagados = {};
    const votosDistribucion = { clasico: 0, ganador: 0, escalera: 0 };
    
    nombres.forEach((nombre, index) => {
        const username = nombre.toLowerCase().replace(' ', '');
        const id = 'user_' + (index + 1);
        
        // Voto aleatorio
        const votoAleatorio = opcionesVoto[Math.floor(Math.random() * opcionesVoto.length)];
        votosDistribucion[votoAleatorio]++;
        
        usuarios.push({
            id: id,
            nombre: nombre,
            username: username,
            whatsapp: '+52155' + (1000000 + index).toString(),
            password: '123456',
            fechaRegistro: new Date().toISOString(),
            votoDistribucion: votoAleatorio,
            primerLogin: false
        });
        
        usuariosPagados[id] = Math.random() > 0.3;
        pronosticos[id] = {};
        pronosticosBloqueados[id] = { 1: true, 2: true, 3: true };
        
        PARTIDOS.jornada1.forEach(partido => {
            pronosticos[id][partido.id] = {
                local: Math.floor(Math.random() * 4),
                visitante: Math.floor(Math.random() * 4)
            };
        });
        
        PARTIDOS.jornada2.forEach(partido => {
            pronosticos[id][partido.id] = {
                local: Math.floor(Math.random() * 4),
                visitante: Math.floor(Math.random() * 4)
            };
        });
        
        PARTIDOS.jornada3.forEach(partido => {
            pronosticos[id][partido.id] = {
                local: Math.floor(Math.random() * 4),
                visitante: Math.floor(Math.random() * 4)
            };
        });
    });
    
    const resultados = {};
    
    PARTIDOS.jornada1.forEach(partido => {
        resultados[partido.id] = {
            local: Math.floor(Math.random() * 4),
            visitante: Math.floor(Math.random() * 4)
        };
    });
    
    PARTIDOS.jornada2.forEach(partido => {
        resultados[partido.id] = {
            local: Math.floor(Math.random() * 4),
            visitante: Math.floor(Math.random() * 4)
        };
    });
    
    PARTIDOS.jornada3.forEach(partido => {
        resultados[partido.id] = {
            local: Math.floor(Math.random() * 4),
            visitante: Math.floor(Math.random() * 4)
        };
    });
    
    estado.usuarios = usuarios;
    estado.pronosticos = pronosticos;
    estado.resultados = resultados;
    estado.pronosticosBloqueados = pronosticosBloqueados;
    estado.usuariosPagados = usuariosPagados;
    estado.jornadasHabilitadas = { 1: true, 2: true, 3: true };
    estado.votosDistribucion = votosDistribucion;
    
    guardarDatos();
    
    console.log('Votos generados:');
    console.log('- Clasico:', votosDistribucion.clasico);
    console.log('- Gran Ganador:', votosDistribucion.ganador);
    console.log('- Escalera:', votosDistribucion.escalera);
    
    alert('Datos de prueba generados!\n\n10 usuarios creados\nPassword: 123456\nVotos aleatorios asignados\n\nLa pagina se recargara.');
    location.reload();
};

// ============================================
// 19. CORRECCIONES FINALES
// ============================================

// Corregir conteo de votos - inicializar correctamente
if (!estado.votosDistribucion) {
    estado.votosDistribucion = { clasico: 0, ganador: 0, escalera: 0 };
}

// Recalcular votos desde usuarios existentes
function recalcularVotos() {
    estado.votosDistribucion = { clasico: 0, ganador: 0, escalera: 0 };
    estado.usuarios.forEach(usuario => {
        if (usuario.votoDistribucion) {
            estado.votosDistribucion[usuario.votoDistribucion]++;
        }
    });
    guardarDatos();
}

// Mejorar control de registro - deshabilitar botón
function actualizarBotonRegistro() {
    const btnShowRegister = document.getElementById('btnShowRegister');
    if (btnShowRegister) {
        if (estado.registroHabilitado) {
            btnShowRegister.disabled = false;
            btnShowRegister.textContent = 'Crear Cuenta';
            btnShowRegister.style.opacity = '1';
            btnShowRegister.style.cursor = 'pointer';
        } else {
            btnShowRegister.disabled = true;
            btnShowRegister.textContent = 'Registro Deshabilitado';
            btnShowRegister.style.opacity = '0.5';
            btnShowRegister.style.cursor = 'not-allowed';
        }
    }
}

// Sobrescribir toggleRegistro
window.toggleRegistro = function() {
    estado.registroHabilitado = !estado.registroHabilitado;
    guardarDatos();
    renderizarUsuariosAdmin();
    actualizarBotonRegistro();
    mostrarToast('OK', 'Registro ' + (estado.registroHabilitado ? 'habilitado' : 'deshabilitado'));
};

// Actualizar al cargar datos
const _cargarDatosOriginal = cargarDatos;
cargarDatos = function() {
    _cargarDatosOriginal();
    
    // Asegurar que votosDistribucion existe
    if (!estado.votosDistribucion) {
        estado.votosDistribucion = { clasico: 0, ganador: 0, escalera: 0 };
    }
    
    // Asegurar que registroHabilitado existe
    if (estado.registroHabilitado === undefined) {
        estado.registroHabilitado = true;
    }
    
    // Recalcular votos al cargar
    recalcularVotos();
};

// Llamar actualizarBotonRegistro al iniciar
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        actualizarBotonRegistro();
    }, 200);
});

// Mejorar actualizarBotonRegistro con advertencia
actualizarBotonRegistro = function() {
    const btnShowRegister = document.getElementById('btnShowRegister');
    const warning = document.getElementById('registroDeshabilitadoWarning');
    
    if (btnShowRegister) {
        if (estado.registroHabilitado) {
            btnShowRegister.disabled = false;
            btnShowRegister.textContent = 'Crear Cuenta';
            btnShowRegister.style.opacity = '1';
            btnShowRegister.style.cursor = 'pointer';
            if (warning) warning.classList.add('hidden');
        } else {
            btnShowRegister.disabled = true;
            btnShowRegister.textContent = 'Registro Deshabilitado';
            btnShowRegister.style.opacity = '0.5';
            btnShowRegister.style.cursor = 'not-allowed';
            if (warning) warning.classList.remove('hidden');
        }
    }
};

// ============================================
// 20. RENDERIZAR REGLAS CON FORMATO PROFESIONAL
// ============================================

renderizarReglas = function() {
    const container = document.getElementById('reglasContent');
    
    container.innerHTML = `
        <div style="max-width:900px;margin:0 auto;">
            <div style="background:var(--gradient);color:white;padding:40px;border-radius:16px;text-align:center;margin-bottom:30px;box-shadow:var(--shadow-lg);">
                <h1 style="font-size:2.5rem;margin-bottom:10px;"> REGLAS DE LA QUINIELA</h1>
                <p style="font-size:1.2rem;opacity:0.9;">Mundial FIFA 2026</p>
            </div>
            
            <div style="background:white;padding:35px;border-radius:16px;margin-bottom:25px;box-shadow:var(--shadow);">
                <h2 style="color:var(--primary);font-size:1.8rem;margin-bottom:20px;border-bottom:3px solid var(--primary);padding-bottom:10px;"> Sistema de Puntuación</h2>
                
                <div style="background:#f8f9fa;padding:20px;border-radius:10px;margin-bottom:20px;">
                    <h3 style="color:var(--dark);font-size:1.3rem;margin-bottom:15px;">Puntos por Acierto:</h3>
                    <div style="display:grid;gap:15px;">
                        <div style="display:flex;align-items:center;gap:15px;">
                            <div style="background:var(--primary);color:white;width:50px;height:50px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1.5rem;font-weight:800;">1</div>
                            <div>
                                <strong>Acertar el ganador del partido (o empate)</strong>
                            </div>
                        </div>
                        <div style="display:flex;align-items:center;gap:15px;">
                            <div style="background:var(--success);color:white;width:50px;height:50px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1.5rem;font-weight:800;">+3</div>
                            <div>
                                <strong>Acertar el marcador exacto</strong>
                                <div style="font-size:0.9rem;color:#666;">Puntos adicionales al acertar ganador</div>
                            </div>
                        </div>
                        <div style="display:flex;align-items:center;gap:15px;">
                            <div style="background:var(--secondary);color:white;width:50px;height:50px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1.5rem;font-weight:800;">4</div>
                            <div>
                                <strong>Total Máximo por Partido</strong>
                                <div style="font-size:0.9rem;color:#666;">1 punto + 3 puntos adicionales</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div style="background:rgba(102,126,234,0.1);padding:20px;border-radius:10px;border-left:4px solid var(--primary);">
                    <h4 style="color:var(--primary);margin-bottom:10px;"> Ejemplo:</h4>
                    <p style="margin-bottom:8px;"><strong>Partido:</strong> México 2-1 Sudáfrica</p>
                    <p style="margin-bottom:8px;"> Si pronosticas: "México gana"  <strong style="color:var(--primary);">1 punto</strong></p>
                    <p> Si pronosticas: "México 2-1"  <strong style="color:var(--success);">4 puntos</strong> (1 por ganador + 3 por marcador exacto)</p>
                </div>
            </div>
            
            <div style="background:white;padding:35px;border-radius:16px;margin-bottom:25px;box-shadow:var(--shadow);">
                <h2 style="color:var(--primary);font-size:1.8rem;margin-bottom:20px;border-bottom:3px solid var(--primary);padding-bottom:10px;"> Reglas de Pronósticos</h2>
                
                <div style="display:grid;gap:15px;">
                    <div style="display:flex;gap:15px;padding:15px;background:#f8f9fa;border-radius:8px;">
                        <div style="color:var(--primary);font-size:1.5rem;font-weight:800;">1.</div>
                        <div>
                            <strong style="color:var(--dark);">Una Sola Oportunidad</strong>
                            <p style="color:#666;margin:5px 0 0 0;">Los pronósticos se guardan UNA SOLA VEZ y NO se pueden modificar.</p>
                        </div>
                    </div>
                    <div style="display:flex;gap:15px;padding:15px;background:#f8f9fa;border-radius:8px;">
                        <div style="color:var(--primary);font-size:1.5rem;font-weight:800;">2.</div>
                        <div>
                            <strong style="color:var(--dark);">Confirmación Obligatoria</strong>
                            <p style="color:#666;margin:5px 0 0 0;">Antes de guardar, el sistema pedirá confirmación.</p>
                        </div>
                    </div>
                    <div style="display:flex;gap:15px;padding:15px;background:#f8f9fa;border-radius:8px;">
                        <div style="color:var(--primary);font-size:1.5rem;font-weight:800;">3.</div>
                        <div>
                            <strong style="color:var(--dark);">Bloqueo por Jornada</strong>
                            <p style="color:#666;margin:5px 0 0 0;">Cada jornada se bloquea independientemente al guardar.</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <div style="background:white;padding:35px;border-radius:16px;margin-bottom:25px;box-shadow:var(--shadow);">
                <h2 style="color:var(--primary);font-size:1.8rem;margin-bottom:20px;border-bottom:3px solid var(--primary);padding-bottom:10px;"> Distribución de Premios</h2>
                
                <p style="margin-bottom:20px;color:#666;font-size:1.05rem;">Al registrarte, votaste por uno de estos modelos de distribución:</p>
                
                <div style="display:grid;gap:20px;">
                    <div style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:white;padding:20px;border-radius:12px;">
                        <h3 style="margin-bottom:15px;font-size:1.3rem;">Modelo Clásico</h3>
                        <div style="display:grid;gap:10px;">
                            <div style="display:flex;justify-content:space-between;padding:10px;background:rgba(255,255,255,0.2);border-radius:6px;">
                                <span> 1er Lugar</span>
                                <strong style="font-size:1.2rem;">50%</strong>
                            </div>
                            <div style="display:flex;justify-content:space-between;padding:10px;background:rgba(255,255,255,0.2);border-radius:6px;">
                                <span> 2do Lugar</span>
                                <strong style="font-size:1.2rem;">30%</strong>
                            </div>
                            <div style="display:flex;justify-content:space-between;padding:10px;background:rgba(255,255,255,0.2);border-radius:6px;">
                                <span> 3er Lugar</span>
                                <strong style="font-size:1.2rem;">20%</strong>
                            </div>
                        </div>
                    </div>
                    
                    <div style="background:linear-gradient(135deg,#28a745 0%,#20c997 100%);color:white;padding:20px;border-radius:12px;">
                        <h3 style="margin-bottom:15px;font-size:1.3rem;">Modelo Gran Ganador</h3>
                        <div style="display:grid;gap:10px;">
                            <div style="display:flex;justify-content:space-between;padding:10px;background:rgba(255,255,255,0.2);border-radius:6px;">
                                <span> 1er Lugar</span>
                                <strong style="font-size:1.2rem;">60%</strong>
                            </div>
                            <div style="display:flex;justify-content:space-between;padding:10px;background:rgba(255,255,255,0.2);border-radius:6px;">
                                <span> 2do Lugar</span>
                                <strong style="font-size:1.2rem;">25%</strong>
                            </div>
                            <div style="display:flex;justify-content:space-between;padding:10px;background:rgba(255,255,255,0.2);border-radius:6px;">
                                <span> 3er Lugar</span>
                                <strong style="font-size:1.2rem;">15%</strong>
                            </div>
                        </div>
                    </div>
                    
                    <div style="background:linear-gradient(135deg,#ff9800 0%,#ff5722 100%);color:white;padding:20px;border-radius:12px;">
                        <h3 style="margin-bottom:15px;font-size:1.3rem;">Modelo Escalera Suave</h3>
                        <div style="display:grid;gap:10px;">
                            <div style="display:flex;justify-content:space-between;padding:10px;background:rgba(255,255,255,0.2);border-radius:6px;">
                                <span> 1er Lugar</span>
                                <strong style="font-size:1.2rem;">45%</strong>
                            </div>
                            <div style="display:flex;justify-content:space-between;padding:10px;background:rgba(255,255,255,0.2);border-radius:6px;">
                                <span> 2do Lugar</span>
                                <strong style="font-size:1.2rem;">33%</strong>
                            </div>
                            <div style="display:flex;justify-content:space-between;padding:10px;background:rgba(255,255,255,0.2);border-radius:6px;">
                                <span> 3er Lugar</span>
                                <strong style="font-size:1.2rem;">22%</strong>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div style="background:#fff3cd;border:2px solid #ffc107;padding:15px;border-radius:10px;margin-top:20px;text-align:center;">
                    <strong style="color:#856404;"> La distribución final se decidirá por votación mayoritaria de todos los participantes.</strong>
                </div>
            </div>
            
            <div style="background:white;padding:35px;border-radius:16px;margin-bottom:25px;box-shadow:var(--shadow);">
                <h2 style="color:var(--primary);font-size:1.8rem;margin-bottom:20px;border-bottom:3px solid var(--primary);padding-bottom:10px;"> Ranking</h2>
                
                <ul style="list-style:none;padding:0;margin:0;">
                    <li style="padding:12px;margin-bottom:10px;background:#f8f9fa;border-radius:8px;border-left:4px solid var(--primary);">
                         El ranking se actualiza automáticamente después de cada jornada
                    </li>
                    <li style="padding:12px;margin-bottom:10px;background:#f8f9fa;border-radius:8px;border-left:4px solid var(--primary);">
                         Los usuarios se ordenan por puntos totales (mayor a menor)
                    </li>
                    <li style="padding:12px;background:#f8f9fa;border-radius:8px;border-left:4px solid var(--primary);">
                         En caso de empate, se considera el número de aciertos exactos
                    </li>
                </ul>
            </div>
            
            <div style="background:white;padding:35px;border-radius:16px;margin-bottom:25px;box-shadow:var(--shadow);">
                <h2 style="color:var(--primary);font-size:1.8rem;margin-bottom:20px;border-bottom:3px solid var(--primary);padding-bottom:10px;"> Fase de Grupos</h2>
                
                <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:20px;">
                    <div style="background:#f8f9fa;padding:20px;border-radius:10px;text-align:center;">
                        <div style="font-size:2.5rem;color:var(--primary);font-weight:800;margin-bottom:10px;">12</div>
                        <div style="color:#666;">Grupos (A al L)</div>
                        <div style="color:#666;font-size:0.9rem;">4 equipos cada uno</div>
                    </div>
                    <div style="background:#f8f9fa;padding:20px;border-radius:10px;text-align:center;">
                        <div style="font-size:2.5rem;color:var(--success);font-weight:800;margin-bottom:10px;">3</div>
                        <div style="color:#666;">Jornadas</div>
                        <div style="color:#666;font-size:0.9rem;">por grupo</div>
                    </div>
                    <div style="background:#f8f9fa;padding:20px;border-radius:10px;text-align:center;">
                        <div style="font-size:2.5rem;color:var(--secondary);font-weight:800;margin-bottom:10px;">32</div>
                        <div style="color:#666;">Clasifican</div>
                        <div style="color:#666;font-size:0.9rem;">2 primeros + 8 terceros</div>
                    </div>
                </div>
            </div>
            
            <div style="background:var(--gradient);color:white;padding:30px;border-radius:16px;text-align:center;box-shadow:var(--shadow-lg);">
                <h2 style="font-size:2rem;margin-bottom:15px;"> ¡Buena Suerte!</h2>
                <p style="font-size:1.2rem;opacity:0.9;">Que gane el mejor pronosticador </p>
            </div>
        </div>
    `;
};

// ============================================
// 21. CORREGIR LÓGICA DE USUARIOS NO PAGADOS
// ============================================

// Sobrescribir renderizarPronosticos - permitir jornada actual siempre
renderizarPronosticos = function() {
    const container = document.getElementById('pronosticosContainer');
    const jornada = 'jornada' + estado.jornadaActual;
    const partidos = PARTIDOS[jornada];
    
    document.getElementById('jornadaDisplay').textContent = 'Jornada ' + estado.jornadaActual;
    
    // Inicializar estructura de bloqueo
    if (!estado.pronosticosBloqueados[estado.usuarioActual.id]) {
        estado.pronosticosBloqueados[estado.usuarioActual.id] = {};
    }
    
    // Verificar si ESTA jornada está bloqueada
    const bloqueadaEstaJornada = estado.pronosticosBloqueados[estado.usuarioActual.id][estado.jornadaActual] === true;
    const habilitada = estado.jornadasHabilitadas[estado.jornadaActual] === true;
    const pagado = estado.usuariosPagados[estado.usuarioActual.id];
    
    // Obtener jornada actual (la más alta habilitada)
    let jornadaActualReal = 1;
    for (let j = 3; j >= 1; j--) {
        if (estado.jornadasHabilitadas[j] === true) {
            jornadaActualReal = j;
            break;
        }
    }
    
    // Si NO ha pagado y está viendo una jornada anterior (ya bloqueada), mostrar advertencia
    if (!pagado && bloqueadaEstaJornada) {
        container.innerHTML = '<div style="text-align:center;padding:40px;background:white;border-radius:12px;box-shadow:var(--shadow);"><h3 style="color:var(--warning);margin-bottom:15px;"> Pago Requerido</h3><p style="color:#666;margin-bottom:20px;">Para ver tus pronósticos de jornadas anteriores, debes realizar el pago.</p><p style="color:#666;">Contacta al administrador para más información.</p></div>';
        document.getElementById('btnGuardarPronosticos').style.display = 'none';
        return;
    }
    
    // Botones de navegación
    document.getElementById('btnPrevJornada').style.display = 
        (estado.jornadaActual > 1 && estado.jornadasHabilitadas[estado.jornadaActual - 1]) ? 'block' : 'none';
    document.getElementById('btnNextJornada').style.display = 
        (estado.jornadaActual < 3 && estado.jornadasHabilitadas[estado.jornadaActual + 1]) ? 'block' : 'none';
    
    // Advertencia
    const warning = document.getElementById('lockWarning');
    if (!habilitada) {
        warning.classList.remove('hidden');
        warning.textContent = 'Esta jornada aún no está habilitada.';
    } else if (bloqueadaEstaJornada && pagado) {
        warning.classList.remove('hidden');
        warning.textContent = 'Tus pronósticos de Jornada ' + estado.jornadaActual + ' están bloqueados';
    } else {
        warning.classList.add('hidden');
    }
    
    // Botón guardar - SIEMPRE visible si no está bloqueada y está habilitada
    const btnGuardar = document.getElementById('btnGuardarPronosticos');
    btnGuardar.style.display = 'block';
    btnGuardar.disabled = bloqueadaEstaJornada || !habilitada;
    
    // Renderizar partidos
    container.innerHTML = '';
    const porGrupo = {};
    partidos.forEach(p => {
        if (!porGrupo[p.grupo]) porGrupo[p.grupo] = [];
        porGrupo[p.grupo].push(p);
    });
    
    Object.keys(porGrupo).sort().forEach(grupo => {
        const header = document.createElement('h3');
        header.textContent = 'Grupo ' + grupo;
        header.style.cssText = 'grid-column:1/-1;color:var(--primary);margin-top:20px;margin-bottom:10px;';
        container.appendChild(header);
        
        porGrupo[grupo].forEach(partido => {
            container.appendChild(crearTarjetaPartido(partido, 'pronostico', bloqueadaEstaJornada || !habilitada));
        });
    });
};

// ============================================
// 22. BANNER DE PREMIO
// ============================================

function actualizarBannerPremio() {
    // Calcular usuarios pagados
    const usuariosPagados = estado.usuarios.filter(u => estado.usuariosPagados[u.id]);
    const totalPagados = usuariosPagados.length;
    const premioTotal = totalPagados * estado.montoCuota;
    
    // Calcular votos solo de usuarios pagados
    const votosPagados = { clasico: 0, ganador: 0, escalera: 0 };
    usuariosPagados.forEach(usuario => {
        if (usuario.votoDistribucion) {
            votosPagados[usuario.votoDistribucion]++;
        }
    });
    
    // Determinar modelo ganador (en caso de empate, mantener el anterior)
    let modeloGanador = 'clasico'; // Default
    let maxVotos = votosPagados.clasico;
    
    if (votosPagados.ganador > maxVotos) {
        modeloGanador = 'ganador';
        maxVotos = votosPagados.ganador;
    }
    
    if (votosPagados.escalera > maxVotos) {
        modeloGanador = 'escalera';
    }
    
    // Si hay empate, mantener el modelo anterior guardado
    if (!estado.modeloDistribucionActual) {
        estado.modeloDistribucionActual = modeloGanador;
    } else {
        // Solo cambiar si hay un claro ganador
        const votosActual = votosPagados[estado.modeloDistribucionActual];
        if (maxVotos > votosActual) {
            estado.modeloDistribucionActual = modeloGanador;
        }
    }
    
    // Distribuciones
    const distribuciones = {
        clasico: { nombre: 'Modelo Clásico', p1: 0.50, p2: 0.30, p3: 0.20 },
        ganador: { nombre: 'Gran Ganador', p1: 0.60, p2: 0.25, p3: 0.15 },
        escalera: { nombre: 'Escalera Suave', p1: 0.45, p2: 0.33, p3: 0.22 }
    };
    
    const dist = distribuciones[estado.modeloDistribucionActual];
    
    const premio1 = Math.round(premioTotal * dist.p1);
    const premio2 = Math.round(premioTotal * dist.p2);
    const premio3 = Math.round(premioTotal * dist.p3);
    
    // Actualizar DOM
    document.getElementById('premioTotal').textContent = '$' + premioTotal.toLocaleString();
    document.getElementById('premioDistribucion').innerHTML = `
        <span class="prize-place"> $${premio1.toLocaleString()}</span>
        <span class="prize-place"> $${premio2.toLocaleString()}</span>
        <span class="prize-place"> $${premio3.toLocaleString()}</span>
    `;
    document.getElementById('premioModelo').textContent = dist.nombre + ' (' + votosPagados[estado.modeloDistribucionActual] + ' votos)';
}

// Llamar al mostrar app
const _mostrarAppOriginal4 = mostrarApp;
mostrarApp = function() {
    document.getElementById('loginScreen').classList.add('hidden');
    document.getElementById('appScreen').classList.remove('hidden');
    
    if (!estado.esAdmin && !estado.esModerador) {
        actualizarNombreConMedalla();
    } else {
        document.getElementById('currentUserName').textContent = estado.usuarioActual.nombre;
    }
    
    const navAdmin = document.getElementById('navAdmin');
    const navLlaves = document.getElementById('navLlaves');
    
    if (navAdmin) {
        navAdmin.classList.toggle('hidden', !estado.esAdmin && !estado.esModerador);
    }
    
    if (navLlaves) {
        navLlaves.classList.toggle('hidden', !estado.bracketVisible);
    }
    
    // Actualizar banner de premio
    actualizarBannerPremio();
    
    cambiarVista('pronosticos');
};

// Actualizar banner al cambiar pagos
const _togglePagoOriginal = window.togglePago;
window.togglePago = function(userId) {
    const usuario = estado.usuarios.find(u => u.id === userId);
    if (usuario) {
        estado.usuariosPagados[userId] = !estado.usuariosPagados[userId];
        guardarDatos();
        renderizarPagos();
        renderizarRanking();
        actualizarBannerPremio();
        mostrarToast('OK', usuario.nombre + ' marcado como ' + (estado.usuariosPagados[userId] ? 'pagado' : 'no pagado'));
    }
};

// ============================================
// 23. MEJORAR BANNER Y RANKING
// ============================================

// Actualizar banner con lugares específicos
actualizarBannerPremio = function() {
    const usuariosPagados = estado.usuarios.filter(u => estado.usuariosPagados[u.id]);
    const totalPagados = usuariosPagados.length;
    const premioTotal = totalPagados * estado.montoCuota;
    
    const votosPagados = { clasico: 0, ganador: 0, escalera: 0 };
    usuariosPagados.forEach(usuario => {
        if (usuario.votoDistribucion) {
            votosPagados[usuario.votoDistribucion]++;
        }
    });
    
    let modeloGanador = 'clasico';
    let maxVotos = votosPagados.clasico;
    
    if (votosPagados.ganador > maxVotos) {
        modeloGanador = 'ganador';
        maxVotos = votosPagados.ganador;
    }
    
    if (votosPagados.escalera > maxVotos) {
        modeloGanador = 'escalera';
    }
    
    if (!estado.modeloDistribucionActual) {
        estado.modeloDistribucionActual = modeloGanador;
    } else {
        const votosActual = votosPagados[estado.modeloDistribucionActual];
        if (maxVotos > votosActual) {
            estado.modeloDistribucionActual = modeloGanador;
        }
    }
    
    const distribuciones = {
        clasico: { nombre: 'Modelo Clásico', p1: 0.50, p2: 0.30, p3: 0.20 },
        ganador: { nombre: 'Gran Ganador', p1: 0.60, p2: 0.25, p3: 0.15 },
        escalera: { nombre: 'Escalera Suave', p1: 0.45, p2: 0.33, p3: 0.22 }
    };
    
    const dist = distribuciones[estado.modeloDistribucionActual];
    
    const premio1 = Math.round(premioTotal * dist.p1);
    const premio2 = Math.round(premioTotal * dist.p2);
    const premio3 = Math.round(premioTotal * dist.p3);
    
    document.getElementById('premioTotal').textContent = '$' + premioTotal.toLocaleString();
    document.getElementById('premioDistribucion').innerHTML = `
        <span class="prize-place"> 1er: $${premio1.toLocaleString()}</span>
        <span class="prize-place"> 2do: $${premio2.toLocaleString()}</span>
        <span class="prize-place"> 3er: $${premio3.toLocaleString()}</span>
    `;
    document.getElementById('premioModelo').textContent = dist.nombre + ' (' + votosPagados[estado.modeloDistribucionActual] + ' votos)';
};

// Mejorar ranking con colores y medallas
renderizarRanking = function() {
    const container = document.getElementById('rankingContainer');
    
    const ranking = estado.usuarios
        .filter(usuario => estado.usuariosPagados[usuario.id])
        .map(usuario => {
            const puntos = calcularPuntos(usuario.id);
            const aciertos = calcularAciertos(usuario.id);
            const pagado = true;
            return { usuario, puntos, aciertos, pagado };
        })
        .sort((a, b) => {
            if (b.puntos !== a.puntos) return b.puntos - a.puntos;
            return b.aciertos.exactos - a.aciertos.exactos;
        });
    
    container.innerHTML = '';
    
    if (ranking.length === 0) {
        container.innerHTML = '<div style="text-align:center;padding:40px;background:white;border-radius:12px;"><h3 style="color:var(--warning);margin-bottom:15px;"> Ranking No Disponible</h3><p style="color:#666;">El ranking solo muestra usuarios que han realizado el pago.</p></div>';
        return;
    }
    
    ranking.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'ranking-item';
        
        let bgColor = 'linear-gradient(90deg,rgba(0,204,102,0.1),transparent)';
        let borderColor = 'var(--success)';
        let medalla = '';
        
        if (index === 0) {
            bgColor = 'linear-gradient(90deg, rgba(255,215,0,0.3), rgba(255,215,0,0.05))';
            borderColor = '#FFD700';
            medalla = '';
        } else if (index === 1) {
            bgColor = 'linear-gradient(90deg, rgba(192,192,192,0.3), rgba(192,192,192,0.05))';
            borderColor = '#C0C0C0';
            medalla = '';
        } else if (index === 2) {
            bgColor = 'linear-gradient(90deg, rgba(205,127,50,0.3), rgba(205,127,50,0.05))';
            borderColor = '#CD7F32';
            medalla = '';
        }
        
        div.style.background = bgColor;
        div.style.borderLeft = '4px solid ' + borderColor;
        
        const statsDiv = document.createElement('div');
        statsDiv.className = 'ranking-stats';
        statsDiv.textContent = item.aciertos.ganadores + '/' + item.aciertos.total + ' aciertos';
        statsDiv.style.cursor = 'pointer';
        statsDiv.style.color = 'var(--primary)';
        statsDiv.style.textDecoration = 'underline';
        statsDiv.onclick = () => verAciertosUsuario(item.usuario.id);
        statsDiv.title = 'Click para ver detalles';
        
        div.innerHTML = `
            <div class="ranking-position" style="font-size:2.5rem;">${medalla || (index + 1)}</div>
            <div class="ranking-name">${item.usuario.nombre}</div>
        `;
        
        div.appendChild(statsDiv);
        
        const puntosDiv = document.createElement('div');
        puntosDiv.className = 'ranking-points';
        puntosDiv.textContent = item.puntos + ' pts';
        div.appendChild(puntosDiv);
        
        container.appendChild(div);
    });
};

// ============================================
// 24. ACTUALIZAR REGLAS CON ACLARACIÓN DE PREMIO
// ============================================

renderizarReglas = function() {
    const container = document.getElementById('reglasContent');
    
    container.innerHTML = `
        <div style="max-width:900px;margin:0 auto;">
            <div style="background:var(--gradient);color:white;padding:40px;border-radius:16px;text-align:center;margin-bottom:30px;box-shadow:var(--shadow-lg);">
                <h1 style="font-size:2.5rem;margin-bottom:10px;"> REGLAS DE LA QUINIELA</h1>
                <p style="font-size:1.2rem;opacity:0.9;">Mundial FIFA 2026</p>
            </div>
            
            <div style="background:white;padding:35px;border-radius:16px;margin-bottom:25px;box-shadow:var(--shadow);">
                <h2 style="color:var(--primary);font-size:1.8rem;margin-bottom:20px;border-bottom:3px solid var(--primary);padding-bottom:10px;"> Sistema de Puntuación</h2>
                
                <div style="background:#f8f9fa;padding:20px;border-radius:10px;margin-bottom:20px;">
                    <h3 style="color:var(--dark);font-size:1.3rem;margin-bottom:15px;">Puntos por Acierto:</h3>
                    <div style="display:grid;gap:15px;">
                        <div style="display:flex;align-items:center;gap:15px;">
                            <div style="background:var(--primary);color:white;width:50px;height:50px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1.5rem;font-weight:800;">1</div>
                            <div>
                                <strong>Acertar el ganador del partido (o empate)</strong>
                            </div>
                        </div>
                        <div style="display:flex;align-items:center;gap:15px;">
                            <div style="background:var(--success);color:white;width:50px;height:50px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1.5rem;font-weight:800;">+3</div>
                            <div>
                                <strong>Acertar el marcador exacto</strong>
                                <div style="font-size:0.9rem;color:#666;">Puntos adicionales al acertar ganador</div>
                            </div>
                        </div>
                        <div style="display:flex;align-items:center;gap:15px;">
                            <div style="background:var(--secondary);color:white;width:50px;height:50px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1.5rem;font-weight:800;">4</div>
                            <div>
                                <strong>Total Máximo por Partido</strong>
                                <div style="font-size:0.9rem;color:#666;">1 punto + 3 puntos adicionales</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div style="background:rgba(102,126,234,0.1);padding:20px;border-radius:10px;border-left:4px solid var(--primary);">
                    <h4 style="color:var(--primary);margin-bottom:10px;"> Ejemplo:</h4>
                    <p style="margin-bottom:8px;"><strong>Partido:</strong> México 2-1 Sudáfrica</p>
                    <p style="margin-bottom:8px;"> Si pronosticas: "México gana"  <strong style="color:var(--primary);">1 punto</strong></p>
                    <p> Si pronosticas: "México 2-1"  <strong style="color:var(--success);">4 puntos</strong> (1 por ganador + 3 por marcador exacto)</p>
                </div>
            </div>
            
            <div style="background:white;padding:35px;border-radius:16px;margin-bottom:25px;box-shadow:var(--shadow);">
                <h2 style="color:var(--primary);font-size:1.8rem;margin-bottom:20px;border-bottom:3px solid var(--primary);padding-bottom:10px;"> Reglas de Pronósticos</h2>
                
                <div style="display:grid;gap:15px;">
                    <div style="display:flex;gap:15px;padding:15px;background:#f8f9fa;border-radius:8px;">
                        <div style="color:var(--primary);font-size:1.5rem;font-weight:800;">1.</div>
                        <div>
                            <strong style="color:var(--dark);">Una Sola Oportunidad</strong>
                            <p style="color:#666;margin:5px 0 0 0;">Los pronósticos se guardan UNA SOLA VEZ y NO se pueden modificar.</p>
                        </div>
                    </div>
                    <div style="display:flex;gap:15px;padding:15px;background:#f8f9fa;border-radius:8px;">
                        <div style="color:var(--primary);font-size:1.5rem;font-weight:800;">2.</div>
                        <div>
                            <strong style="color:var(--dark);">Confirmación Obligatoria</strong>
                            <p style="color:#666;margin:5px 0 0 0;">Antes de guardar, el sistema pedirá confirmación.</p>
                        </div>
                    </div>
                    <div style="display:flex;gap:15px;padding:15px;background:#f8f9fa;border-radius:8px;">
                        <div style="color:var(--primary);font-size:1.5rem;font-weight:800;">3.</div>
                        <div>
                            <strong style="color:var(--dark);">Bloqueo por Jornada</strong>
                            <p style="color:#666;margin:5px 0 0 0;">Cada jornada se bloquea independientemente al guardar.</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <div style="background:white;padding:35px;border-radius:16px;margin-bottom:25px;box-shadow:var(--shadow);">
                <h2 style="color:var(--primary);font-size:1.8rem;margin-bottom:20px;border-bottom:3px solid var(--primary);padding-bottom:10px;"> Distribución de Premios</h2>
                
                <div style="background:#fff3cd;border:3px solid #ffc107;padding:20px;border-radius:12px;margin-bottom:25px;text-align:center;">
                    <strong style="color:#856404;font-size:1.2rem;display:block;margin-bottom:10px;"> IMPORTANTE</strong>
                    <p style="color:#856404;font-size:1.05rem;line-height:1.6;margin:0;">
                        <strong>El monto total del premio cambiará dependiendo de la cantidad de personas que hayan pagado su entrada al juego.</strong>
                        El premio se calcula multiplicando el número de participantes pagados por el costo de entrada.
                    </p>
                </div>
                
                <p style="margin-bottom:20px;color:#666;font-size:1.05rem;">Al registrarte, votaste por uno de estos modelos de distribución:</p>
                
                <div style="display:grid;gap:20px;">
                    <div style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:white;padding:20px;border-radius:12px;">
                        <h3 style="margin-bottom:15px;font-size:1.3rem;">Modelo Clásico</h3>
                        <div style="display:grid;gap:10px;">
                            <div style="display:flex;justify-content:space-between;padding:10px;background:rgba(255,255,255,0.2);border-radius:6px;">
                                <span> 1er Lugar</span>
                                <strong style="font-size:1.2rem;">50%</strong>
                            </div>
                            <div style="display:flex;justify-content:space-between;padding:10px;background:rgba(255,255,255,0.2);border-radius:6px;">
                                <span> 2do Lugar</span>
                                <strong style="font-size:1.2rem;">30%</strong>
                            </div>
                            <div style="display:flex;justify-content:space-between;padding:10px;background:rgba(255,255,255,0.2);border-radius:6px;">
                                <span> 3er Lugar</span>
                                <strong style="font-size:1.2rem;">20%</strong>
                            </div>
                        </div>
                    </div>
                    
                    <div style="background:linear-gradient(135deg,#28a745 0%,#20c997 100%);color:white;padding:20px;border-radius:12px;">
                        <h3 style="margin-bottom:15px;font-size:1.3rem;">Modelo Gran Ganador</h3>
                        <div style="display:grid;gap:10px;">
                            <div style="display:flex;justify-content:space-between;padding:10px;background:rgba(255,255,255,0.2);border-radius:6px;">
                                <span> 1er Lugar</span>
                                <strong style="font-size:1.2rem;">60%</strong>
                            </div>
                            <div style="display:flex;justify-content:space-between;padding:10px;background:rgba(255,255,255,0.2);border-radius:6px;">
                                <span> 2do Lugar</span>
                                <strong style="font-size:1.2rem;">25%</strong>
                            </div>
                            <div style="display:flex;justify-content:space-between;padding:10px;background:rgba(255,255,255,0.2);border-radius:6px;">
                                <span> 3er Lugar</span>
                                <strong style="font-size:1.2rem;">15%</strong>
                            </div>
                        </div>
                    </div>
                    
                    <div style="background:linear-gradient(135deg,#ff9800 0%,#ff5722 100%);color:white;padding:20px;border-radius:12px;">
                        <h3 style="margin-bottom:15px;font-size:1.3rem;">Modelo Escalera Suave</h3>
                        <div style="display:grid;gap:10px;">
                            <div style="display:flex;justify-content:space-between;padding:10px;background:rgba(255,255,255,0.2);border-radius:6px;">
                                <span> 1er Lugar</span>
                                <strong style="font-size:1.2rem;">45%</strong>
                            </div>
                            <div style="display:flex;justify-content:space-between;padding:10px;background:rgba(255,255,255,0.2);border-radius:6px;">
                                <span> 2do Lugar</span>
                                <strong style="font-size:1.2rem;">33%</strong>
                            </div>
                            <div style="display:flex;justify-content:space-between;padding:10px;background:rgba(255,255,255,0.2);border-radius:6px;">
                                <span> 3er Lugar</span>
                                <strong style="font-size:1.2rem;">22%</strong>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div style="background:#e7f3ff;border:2px solid #2196f3;padding:15px;border-radius:10px;margin-top:20px;text-align:center;">
                    <strong style="color:#1976d2;"> La distribución final se decidirá por votación mayoritaria de los participantes que hayan pagado.</strong>
                </div>
            </div>
            
            <div style="background:white;padding:35px;border-radius:16px;margin-bottom:25px;box-shadow:var(--shadow);">
                <h2 style="color:var(--primary);font-size:1.8rem;margin-bottom:20px;border-bottom:3px solid var(--primary);padding-bottom:10px;"> Ranking</h2>
                
                <ul style="list-style:none;padding:0;margin:0;">
                    <li style="padding:12px;margin-bottom:10px;background:#f8f9fa;border-radius:8px;border-left:4px solid var(--primary);">
                         El ranking se actualiza automáticamente después de cada jornada
                    </li>
                    <li style="padding:12px;margin-bottom:10px;background:#f8f9fa;border-radius:8px;border-left:4px solid var(--primary);">
                         Los usuarios se ordenan por puntos totales (mayor a menor)
                    </li>
                    <li style="padding:12px;background:#f8f9fa;border-radius:8px;border-left:4px solid var(--primary);">
                         En caso de empate, se considera el número de aciertos exactos
                    </li>
                </ul>
            </div>
            
            <div style="background:white;padding:35px;border-radius:16px;margin-bottom:25px;box-shadow:var(--shadow);">
                <h2 style="color:var(--primary);font-size:1.8rem;margin-bottom:20px;border-bottom:3px solid var(--primary);padding-bottom:10px;"> Fase de Grupos</h2>
                
                <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:20px;">
                    <div style="background:#f8f9fa;padding:20px;border-radius:10px;text-align:center;">
                        <div style="font-size:2.5rem;color:var(--primary);font-weight:800;margin-bottom:10px;">12</div>
                        <div style="color:#666;">Grupos (A al L)</div>
                        <div style="color:#666;font-size:0.9rem;">4 equipos cada uno</div>
                    </div>
                    <div style="background:#f8f9fa;padding:20px;border-radius:10px;text-align:center;">
                        <div style="font-size:2.5rem;color:var(--success);font-weight:800;margin-bottom:10px;">3</div>
                        <div style="color:#666;">Jornadas</div>
                        <div style="color:#666;font-size:0.9rem;">por grupo</div>
                    </div>
                    <div style="background:#f8f9fa;padding:20px;border-radius:10px;text-align:center;">
                        <div style="font-size:2.5rem;color:var(--secondary);font-weight:800;margin-bottom:10px;">32</div>
                        <div style="color:#666;">Clasifican</div>
                        <div style="color:#666;font-size:0.9rem;">2 primeros + 8 terceros</div>
                    </div>
                </div>
            </div>
            
            <div style="background:var(--gradient);color:white;padding:30px;border-radius:16px;text-align:center;box-shadow:var(--shadow-lg);">
                <h2 style="font-size:2rem;margin-bottom:15px;"> ¡Buena Suerte!</h2>
                <p style="font-size:1.2rem;opacity:0.9;">Que gane el mejor pronosticador </p>
            </div>
        </div>
    `;
};

// ============================================
// 25. FORZAR RANKING CON MEDALLAS (VERSIÓN FINAL)
// ============================================

// Esta es la versión definitiva del ranking con medallas
window.renderizarRanking = function() {
    const container = document.getElementById('rankingContainer');
    
    const ranking = estado.usuarios
        .filter(usuario => estado.usuariosPagados[usuario.id])
        .map(usuario => {
            const puntos = calcularPuntos(usuario.id);
            const aciertos = calcularAciertos(usuario.id);
            const pagado = true;
            return { usuario, puntos, aciertos, pagado };
        })
        .sort((a, b) => {
            if (b.puntos !== a.puntos) return b.puntos - a.puntos;
            return b.aciertos.exactos - a.aciertos.exactos;
        });
    
    container.innerHTML = '';
    
    if (ranking.length === 0) {
        container.innerHTML = '<div style="text-align:center;padding:40px;background:white;border-radius:12px;"><h3 style="color:var(--warning);margin-bottom:15px;"> Ranking No Disponible</h3><p style="color:#666;">El ranking solo muestra usuarios que han realizado el pago.</p></div>';
        return;
    }
    
    ranking.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'ranking-item';
        
        let bgColor = 'linear-gradient(90deg,rgba(0,204,102,0.1),transparent)';
        let borderColor = 'var(--success)';
        let medalla = '';
        
        if (index === 0) {
            bgColor = 'linear-gradient(90deg, rgba(255,215,0,0.4), rgba(255,215,0,0.1))';
            borderColor = '#FFD700';
            medalla = '';
        } else if (index === 1) {
            bgColor = 'linear-gradient(90deg, rgba(192,192,192,0.4), rgba(192,192,192,0.1))';
            borderColor = '#C0C0C0';
            medalla = '';
        } else if (index === 2) {
            bgColor = 'linear-gradient(90deg, rgba(205,127,50,0.4), rgba(205,127,50,0.1))';
            borderColor = '#CD7F32';
            medalla = '';
        }
        
        div.style.background = bgColor;
        div.style.borderLeft = '4px solid ' + borderColor;
        
        const positionDiv = document.createElement('div');
        positionDiv.className = 'ranking-position';
        positionDiv.style.fontSize = '2.5rem';
        positionDiv.textContent = medalla || (index + 1);
        
        const nameDiv = document.createElement('div');
        nameDiv.className = 'ranking-name';
        nameDiv.textContent = item.usuario.nombre;
        
        const statsDiv = document.createElement('div');
        statsDiv.className = 'ranking-stats';
        statsDiv.textContent = item.aciertos.ganadores + '/' + item.aciertos.total + ' aciertos';
        statsDiv.style.cursor = 'pointer';
        statsDiv.style.color = 'var(--primary)';
        statsDiv.style.textDecoration = 'underline';
        statsDiv.onclick = () => verAciertosUsuario(item.usuario.id);
        statsDiv.title = 'Click para ver detalles';
        
        const puntosDiv = document.createElement('div');
        puntosDiv.className = 'ranking-points';
        puntosDiv.textContent = item.puntos + ' pts';
        
        div.appendChild(positionDiv);
        div.appendChild(nameDiv);
        div.appendChild(statsDiv);
        div.appendChild(puntosDiv);
        
        container.appendChild(div);
    });
};

console.log('Ranking con medallas cargado correctamente');

// ============================================
// 26. FORZAR MEDALLAS EN RANKING - VERSIÓN DEFINITIVA
// ============================================

// Esperar a que todo cargue y luego sobrescribir
setTimeout(function() {
    
    window.renderizarRanking = function() {
        console.log('Renderizando ranking con medallas...');
        const container = document.getElementById('rankingContainer');
        
        const ranking = estado.usuarios
            .filter(usuario => estado.usuariosPagados[usuario.id])
            .map(usuario => {
                const puntos = calcularPuntos(usuario.id);
                const aciertos = calcularAciertos(usuario.id);
                const pagado = true;
                return { usuario, puntos, aciertos, pagado };
            })
            .sort((a, b) => {
                if (b.puntos !== a.puntos) return b.puntos - a.puntos;
                return b.aciertos.exactos - a.aciertos.exactos;
            });
        
        container.innerHTML = '';
        
        if (ranking.length === 0) {
            container.innerHTML = '<div style="text-align:center;padding:40px;background:white;border-radius:12px;"><h3 style="color:var(--warning);margin-bottom:15px;"> Ranking No Disponible</h3><p style="color:#666;">El ranking solo muestra usuarios que han realizado el pago.</p></div>';
            return;
        }
        
        ranking.forEach((item, index) => {
            const div = document.createElement('div');
            div.className = 'ranking-item';
            
            let bgColor = 'linear-gradient(90deg,rgba(0,204,102,0.1),transparent)';
            let borderColor = 'var(--success)';
            let medalla = '';
            
            if (index === 0) {
                bgColor = 'linear-gradient(90deg, rgba(255,215,0,0.4), rgba(255,215,0,0.1))';
                borderColor = '#FFD700';
                medalla = '';
            } else if (index === 1) {
                bgColor = 'linear-gradient(90deg, rgba(192,192,192,0.4), rgba(192,192,192,0.1))';
                borderColor = '#C0C0C0';
                medalla = '';
            } else if (index === 2) {
                bgColor = 'linear-gradient(90deg, rgba(205,127,50,0.4), rgba(205,127,50,0.1))';
                borderColor = '#CD7F32';
                medalla = '';
            }
            
            div.style.background = bgColor;
            div.style.borderLeft = '4px solid ' + borderColor;
            
            const positionDiv = document.createElement('div');
            positionDiv.className = 'ranking-position';
            positionDiv.style.fontSize = '2.5rem';
            positionDiv.textContent = medalla || (index + 1);
            
            const nameDiv = document.createElement('div');
            nameDiv.className = 'ranking-name';
            nameDiv.textContent = item.usuario.nombre;
            
            const statsDiv = document.createElement('div');
            statsDiv.className = 'ranking-stats';
            statsDiv.textContent = item.aciertos.ganadores + '/' + item.aciertos.total + ' aciertos';
            statsDiv.style.cursor = 'pointer';
            statsDiv.style.color = 'var(--primary)';
            statsDiv.style.textDecoration = 'underline';
            statsDiv.onclick = () => verAciertosUsuario(item.usuario.id);
            statsDiv.title = 'Click para ver detalles';
            
            const puntosDiv = document.createElement('div');
            puntosDiv.className = 'ranking-points';
            puntosDiv.textContent = item.puntos + ' pts';
            
            div.appendChild(positionDiv);
            div.appendChild(nameDiv);
            div.appendChild(statsDiv);
            div.appendChild(puntosDiv);
            
            container.appendChild(div);
        });
        
        console.log('Ranking renderizado con ' + ranking.length + ' usuarios');
    };
    
    console.log(' Función renderizarRanking con medallas cargada');
    
}, 1000);

// ============================================
// 27. INTEGRACIÓN CON FIREBASE
// ============================================

// Inicializar Firebase al cargar
document.addEventListener('DOMContentLoaded', function() {
    // Intentar inicializar (retorna false si no hay credenciales)
    window.firebaseUtils.inicializar();
    
    // Activar sincronización si está habilitado
    if (window.firebaseUtils.estaHabilitado()) {
        window.firebaseUtils.sincronizar();
    }
});

// Sobrescribir guardarDatos para incluir nube
const _guardarDatosLocal = guardarDatos;
guardarDatos = function() {
    // 1. Guardar en localStorage (siempre)
    localStorage.setItem('quinielaMundial2026', JSON.stringify(estado));
    
    // 2. Guardar en Firebase (si está configurado)
    if (window.firebaseUtils.estaHabilitado()) {
        window.firebaseUtils.guardar(estado);
    }
};

// Sobrescribir cargarDatos para intentar nube primero
const _cargarDatosLocal = cargarDatos;
cargarDatos = function() {
    // 1. Cargar datos locales primero para velocidad inmediata
    _cargarDatosLocal();
    
    // 2. Si Firebase está habilitado, intentar actualizar
    if (window.firebaseUtils.estaHabilitado()) {
        window.firebaseUtils.cargar().then(datosNube => {
            if (datosNube) {
                console.log(" Actualizando estado con datos de la nube...");
                estado = datosNube;
                localStorage.setItem('quinielaMundial2026', JSON.stringify(estado));
                
                // Refrescar UI si el usuario ya está dentro
                if (estado.usuarioActual) {
                     // Recargar vista actual suavemente
                     const vistaActual = document.querySelector('.nav-btn.active')?.dataset.view || 'pronosticos';
                     cambiarVista(vistaActual);
                     actualizarBannerPremio();
                     if (vistaActual === 'ranking') renderizarRanking();
                }
            }
        });
    }
};
