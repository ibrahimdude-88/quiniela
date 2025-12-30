// GENERADOR DE DATOS DE PRUEBA
// Ejecuta esto en la consola del navegador para crear 10 usuarios con pronósticos

function generarDatosPrueba() {
    console.log('Generando datos de prueba...');

    // Limpiar datos existentes
    localStorage.clear();

    // Nombres aleatorios
    const nombres = [
        'Carlos Mendez', 'Ana Garcia', 'Luis Rodriguez', 'Maria Lopez',
        'Jorge Sanchez', 'Laura Martinez', 'Pedro Hernandez', 'Sofia Torres',
        'Miguel Ramirez', 'Carmen Flores'
    ];

    const usuarios = [];
    const pronosticos = {};
    const pronosticosBloqueados = {};
    const usuariosPagados = {};

    // Crear 10 usuarios
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

        // Marcar algunos como pagados aleatoriamente
        usuariosPagados[id] = Math.random() > 0.3;

        // Crear pronósticos para las 3 jornadas
        pronosticos[id] = {};
        pronosticosBloqueados[id] = { 1: true, 2: true, 3: true };

        // Jornada 1
        PARTIDOS.jornada1.forEach(partido => {
            pronosticos[id][partido.id] = {
                local: Math.floor(Math.random() * 4),
                visitante: Math.floor(Math.random() * 4)
            };
        });

        // Jornada 2
        PARTIDOS.jornada2.forEach(partido => {
            pronosticos[id][partido.id] = {
                local: Math.floor(Math.random() * 4),
                visitante: Math.floor(Math.random() * 4)
            };
        });

        // Jornada 3
        PARTIDOS.jornada3.forEach(partido => {
            pronosticos[id][partido.id] = {
                local: Math.floor(Math.random() * 4),
                visitante: Math.floor(Math.random() * 4)
            };
        });
    });

    // Crear algunos resultados para las 3 jornadas
    const resultados = {};

    // Resultados Jornada 1 (todos)
    PARTIDOS.jornada1.forEach(partido => {
        resultados[partido.id] = {
            local: Math.floor(Math.random() * 4),
            visitante: Math.floor(Math.random() * 4)
        };
    });

    // Resultados Jornada 2 (todos)
    PARTIDOS.jornada2.forEach(partido => {
        resultados[partido.id] = {
            local: Math.floor(Math.random() * 4),
            visitante: Math.floor(Math.random() * 4)
        };
    });

    // Resultados Jornada 3 (todos)
    PARTIDOS.jornada3.forEach(partido => {
        resultados[partido.id] = {
            local: Math.floor(Math.random() * 4),
            visitante: Math.floor(Math.random() * 4)
        };
    });

    // Guardar todo
    const estadoPrueba = {
        usuarios: usuarios,
        pronosticos: pronosticos,
        resultados: resultados,
        pronosticosBloqueados: pronosticosBloqueados,
        usuariosPagados: usuariosPagados,
        jornadasHabilitadas: { 1: true, 2: true, 3: true },
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
        adminPassword: 'Mundial2026!',
        moderadores: []
    };

    localStorage.setItem('quinielaMundial2026', JSON.stringify(estadoPrueba));

    console.log('✅ Datos de prueba generados!');
    console.log('📊 10 usuarios creados');
    console.log('⚽ Pronósticos para 3 jornadas');
    console.log('📈 Resultados completos');
    console.log('');
    console.log('Usuarios creados (password: 123456):');
    usuarios.forEach(u => console.log('- ' + u.username));
    console.log('');
    console.log('Recarga la página (F5) para ver los datos');
}

// Ejecutar
generarDatosPrueba();
