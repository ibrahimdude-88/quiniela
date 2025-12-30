// ==========================================
// DATOS DEL MUNDIAL FIFA 2026
// ==========================================

const EQUIPOS = {
    // Grupo A
    'MEX': { nombre: 'México', bandera: 'mx' },
    'RSA': { nombre: 'Sudáfrica', bandera: 'za' },
    'KOR': { nombre: 'Corea del Sur', bandera: 'kr' },
    'UEFA4': { nombre: 'Gan. UEFA 4', bandera: null },

    // Grupo B
    'CAN': { nombre: 'Canadá', bandera: 'ca' },
    'UEFA1': { nombre: 'Gan. UEFA 1', bandera: null },
    'QAT': { nombre: 'Catar', bandera: 'qa' },
    'SUI': { nombre: 'Suiza', bandera: 'ch' },

    // Grupo C
    'BRA': { nombre: 'Brasil', bandera: 'br' },
    'MAR': { nombre: 'Marruecos', bandera: 'ma' },
    'HAI': { nombre: 'Haití', bandera: 'ht' },
    'SCO': { nombre: 'Escocia', bandera: 'gb-sct' },

    // Grupo D
    'USA': { nombre: 'EE.UU.', bandera: 'us' },
    'PAR': { nombre: 'Paraguay', bandera: 'py' },
    'AUS': { nombre: 'Australia', bandera: 'au' },
    'UEFA3': { nombre: 'Gan. UEFA 3', bandera: null },

    // Grupo E
    'GER': { nombre: 'Alemania', bandera: 'de' },
    'CUR': { nombre: 'Curazao', bandera: 'cw' },
    'CIV': { nombre: 'Costa de Marfil', bandera: 'ci' },
    'ECU': { nombre: 'Ecuador', bandera: 'ec' },

    // Grupo F
    'NED': { nombre: 'Países Bajos', bandera: 'nl' },
    'JPN': { nombre: 'Japón', bandera: 'jp' },
    'UEFA2': { nombre: 'Gan. UEFA 2', bandera: null },
    'TUN': { nombre: 'Túnez', bandera: 'tn' },

    // Grupo G
    'BEL': { nombre: 'Bélgica', bandera: 'be' },
    'EGY': { nombre: 'Egipto', bandera: 'eg' },
    'IRN': { nombre: 'Irán', bandera: 'ir' },
    'NZL': { nombre: 'Nueva Zelanda', bandera: 'nz' },

    // Grupo H
    'ESP': { nombre: 'España', bandera: 'es' },
    'CPV': { nombre: 'Cabo Verde', bandera: 'cv' },
    'KSA': { nombre: 'Arabia Saudita', bandera: 'sa' },
    'URU': { nombre: 'Uruguay', bandera: 'uy' },

    // Grupo I
    'FRA': { nombre: 'Francia', bandera: 'fr' },
    'SEN': { nombre: 'Senegal', bandera: 'sn' },
    'IC2': { nombre: 'Gan. IC 2', bandera: null },
    'NOR': { nombre: 'Noruega', bandera: 'no' },

    // Grupo J
    'ARG': { nombre: 'Argentina', bandera: 'ar' },
    'ALG': { nombre: 'Argelia', bandera: 'dz' },
    'AUT': { nombre: 'Austria', bandera: 'at' },
    'JOR': { nombre: 'Jordania', bandera: 'jo' },

    // Grupo K
    'POR': { nombre: 'Portugal', bandera: 'pt' },
    'IC1': { nombre: 'Gan. IC 1', bandera: null },
    'UZB': { nombre: 'Uzbekistán', bandera: 'uz' },
    'COL': { nombre: 'Colombia', bandera: 'co' },

    // Grupo L
    'ENG': { nombre: 'Inglaterra', bandera: 'gb-eng' },
    'CRO': { nombre: 'Croacia', bandera: 'hr' },
    'GHA': { nombre: 'Ghana', bandera: 'gh' },
    'PAN': { nombre: 'Panamá', bandera: 'pa' }
};

const PARTIDOS = {
    jornada1: [
        // 11 de Junio
        { id: 1, fecha: '2026-06-11', grupo: 'A', local: 'MEX', visitante: 'RSA', sede: 'CDMX' },
        { id: 2, fecha: '2026-06-11', grupo: 'A', local: 'KOR', visitante: 'UEFA4', sede: 'Guadalajara' },

        // 12 de Junio
        { id: 3, fecha: '2026-06-12', grupo: 'B', local: 'CAN', visitante: 'UEFA1', sede: 'Toronto' },
        { id: 4, fecha: '2026-06-12', grupo: 'D', local: 'USA', visitante: 'PAR', sede: 'Los Ángeles' },

        // 13 de Junio
        { id: 5, fecha: '2026-06-13', grupo: 'C', local: 'BRA', visitante: 'MAR', sede: 'NY/NJ' },
        { id: 6, fecha: '2026-06-13', grupo: 'C', local: 'HAI', visitante: 'SCO', sede: 'Boston' },
        { id: 7, fecha: '2026-06-13', grupo: 'B', local: 'QAT', visitante: 'SUI', sede: 'San Francisco' },
        { id: 8, fecha: '2026-06-13', grupo: 'D', local: 'AUS', visitante: 'UEFA3', sede: 'Vancouver' },

        // 14 de Junio
        { id: 9, fecha: '2026-06-14', grupo: 'E', local: 'GER', visitante: 'CUR', sede: 'Houston' },
        { id: 10, fecha: '2026-06-14', grupo: 'F', local: 'NED', visitante: 'JPN', sede: 'Dallas' },
        { id: 11, fecha: '2026-06-14', grupo: 'E', local: 'CIV', visitante: 'ECU', sede: 'Filadelfia' },
        { id: 12, fecha: '2026-06-14', grupo: 'F', local: 'UEFA2', visitante: 'TUN', sede: 'Monterrey' },

        // 15 de Junio
        { id: 13, fecha: '2026-06-15', grupo: 'H', local: 'ESP', visitante: 'CPV', sede: 'Atlanta' },
        { id: 14, fecha: '2026-06-15', grupo: 'H', local: 'KSA', visitante: 'URU', sede: 'Miami' },
        { id: 15, fecha: '2026-06-15', grupo: 'G', local: 'BEL', visitante: 'EGY', sede: 'Seattle' },
        { id: 16, fecha: '2026-06-15', grupo: 'G', local: 'IRN', visitante: 'NZL', sede: 'Los Ángeles' },

        // 16 de Junio
        { id: 17, fecha: '2026-06-16', grupo: 'I', local: 'FRA', visitante: 'SEN', sede: 'NY/NJ' },
        { id: 18, fecha: '2026-06-16', grupo: 'I', local: 'IC2', visitante: 'NOR', sede: 'Boston' },
        { id: 19, fecha: '2026-06-16', grupo: 'J', local: 'ARG', visitante: 'ALG', sede: 'Kansas City' },
        { id: 20, fecha: '2026-06-16', grupo: 'J', local: 'AUT', visitante: 'JOR', sede: 'San Francisco' },

        // 17 de Junio
        { id: 21, fecha: '2026-06-17', grupo: 'L', local: 'ENG', visitante: 'CRO', sede: 'Dallas' },
        { id: 22, fecha: '2026-06-17', grupo: 'K', local: 'POR', visitante: 'IC1', sede: 'Houston' },
        { id: 23, fecha: '2026-06-17', grupo: 'K', local: 'UZB', visitante: 'COL', sede: 'CDMX' },
        { id: 24, fecha: '2026-06-17', grupo: 'L', local: 'GHA', visitante: 'PAN', sede: 'Toronto' }
    ],

    jornada2: [
        // 18 de Junio
        { id: 25, fecha: '2026-06-18', grupo: 'A', local: 'MEX', visitante: 'KOR', sede: 'TBD' },
        { id: 26, fecha: '2026-06-18', grupo: 'A', local: 'UEFA4', visitante: 'RSA', sede: 'TBD' },
        { id: 27, fecha: '2026-06-18', grupo: 'B', local: 'CAN', visitante: 'QAT', sede: 'TBD' },
        { id: 28, fecha: '2026-06-18', grupo: 'B', local: 'SUI', visitante: 'UEFA1', sede: 'TBD' },

        // 19 de Junio
        { id: 29, fecha: '2026-06-19', grupo: 'D', local: 'USA', visitante: 'AUS', sede: 'TBD' },
        { id: 30, fecha: '2026-06-19', grupo: 'D', local: 'UEFA3', visitante: 'PAR', sede: 'TBD' },
        { id: 31, fecha: '2026-06-19', grupo: 'C', local: 'BRA', visitante: 'HAI', sede: 'TBD' },
        { id: 32, fecha: '2026-06-19', grupo: 'C', local: 'SCO', visitante: 'MAR', sede: 'TBD' },

        // 20 de Junio
        { id: 33, fecha: '2026-06-20', grupo: 'E', local: 'GER', visitante: 'CIV', sede: 'TBD' },
        { id: 34, fecha: '2026-06-20', grupo: 'E', local: 'ECU', visitante: 'CUR', sede: 'TBD' },
        { id: 35, fecha: '2026-06-20', grupo: 'F', local: 'NED', visitante: 'UEFA2', sede: 'TBD' },
        { id: 36, fecha: '2026-06-20', grupo: 'F', local: 'TUN', visitante: 'JPN', sede: 'TBD' },

        // 21 de Junio
        { id: 37, fecha: '2026-06-21', grupo: 'H', local: 'ESP', visitante: 'KSA', sede: 'TBD' },
        { id: 38, fecha: '2026-06-21', grupo: 'H', local: 'URU', visitante: 'CPV', sede: 'TBD' },
        { id: 39, fecha: '2026-06-21', grupo: 'G', local: 'BEL', visitante: 'IRN', sede: 'TBD' },
        { id: 40, fecha: '2026-06-21', grupo: 'G', local: 'NZL', visitante: 'EGY', sede: 'TBD' },

        // 22 de Junio
        { id: 41, fecha: '2026-06-22', grupo: 'J', local: 'ARG', visitante: 'AUT', sede: 'TBD' },
        { id: 42, fecha: '2026-06-22', grupo: 'J', local: 'JOR', visitante: 'ALG', sede: 'TBD' },
        { id: 43, fecha: '2026-06-22', grupo: 'I', local: 'FRA', visitante: 'IC2', sede: 'TBD' },
        { id: 44, fecha: '2026-06-22', grupo: 'I', local: 'NOR', visitante: 'SEN', sede: 'TBD' },

        // 23 de Junio
        { id: 45, fecha: '2026-06-23', grupo: 'L', local: 'ENG', visitante: 'GHA', sede: 'TBD' },
        { id: 46, fecha: '2026-06-23', grupo: 'L', local: 'PAN', visitante: 'CRO', sede: 'TBD' },
        { id: 47, fecha: '2026-06-23', grupo: 'K', local: 'POR', visitante: 'UZB', sede: 'TBD' },
        { id: 48, fecha: '2026-06-23', grupo: 'K', local: 'COL', visitante: 'IC1', sede: 'TBD' }
    ],

    jornada3: [
        // 24 de Junio
        { id: 49, fecha: '2026-06-24', grupo: 'A', local: 'MEX', visitante: 'UEFA4', sede: 'TBD' },
        { id: 50, fecha: '2026-06-24', grupo: 'A', local: 'RSA', visitante: 'KOR', sede: 'TBD' },
        { id: 51, fecha: '2026-06-24', grupo: 'B', local: 'CAN', visitante: 'SUI', sede: 'TBD' },
        { id: 52, fecha: '2026-06-24', grupo: 'B', local: 'QAT', visitante: 'UEFA1', sede: 'TBD' },

        // 25 de Junio
        { id: 53, fecha: '2026-06-25', grupo: 'D', local: 'USA', visitante: 'UEFA3', sede: 'TBD' },
        { id: 54, fecha: '2026-06-25', grupo: 'D', local: 'PAR', visitante: 'AUS', sede: 'TBD' },
        { id: 55, fecha: '2026-06-25', grupo: 'C', local: 'BRA', visitante: 'SCO', sede: 'TBD' },
        { id: 56, fecha: '2026-06-25', grupo: 'C', local: 'MAR', visitante: 'HAI', sede: 'TBD' },

        // 26 de Junio
        { id: 57, fecha: '2026-06-26', grupo: 'E', local: 'GER', visitante: 'ECU', sede: 'TBD' },
        { id: 58, fecha: '2026-06-26', grupo: 'E', local: 'CUR', visitante: 'CIV', sede: 'TBD' },
        { id: 59, fecha: '2026-06-26', grupo: 'F', local: 'NED', visitante: 'TUN', sede: 'TBD' },
        { id: 60, fecha: '2026-06-26', grupo: 'F', local: 'JPN', visitante: 'UEFA2', sede: 'TBD' },
        { id: 61, fecha: '2026-06-26', grupo: 'H', local: 'ESP', visitante: 'URU', sede: 'TBD' },
        { id: 62, fecha: '2026-06-26', grupo: 'H', local: 'CPV', visitante: 'KSA', sede: 'TBD' },
        { id: 63, fecha: '2026-06-26', grupo: 'G', local: 'BEL', visitante: 'NZL', sede: 'TBD' },
        { id: 64, fecha: '2026-06-26', grupo: 'G', local: 'EGY', visitante: 'IRN', sede: 'TBD' },

        // 27 de Junio
        { id: 65, fecha: '2026-06-27', grupo: 'J', local: 'ARG', visitante: 'JOR', sede: 'TBD' },
        { id: 66, fecha: '2026-06-27', grupo: 'J', local: 'ALG', visitante: 'AUT', sede: 'TBD' },
        { id: 67, fecha: '2026-06-27', grupo: 'I', local: 'FRA', visitante: 'NOR', sede: 'TBD' },
        { id: 68, fecha: '2026-06-27', grupo: 'I', local: 'SEN', visitante: 'IC2', sede: 'TBD' },
        { id: 69, fecha: '2026-06-27', grupo: 'L', local: 'ENG', visitante: 'PAN', sede: 'TBD' },
        { id: 70, fecha: '2026-06-27', grupo: 'L', local: 'CRO', visitante: 'GHA', sede: 'TBD' },
        { id: 71, fecha: '2026-06-27', grupo: 'K', local: 'POR', visitante: 'COL', sede: 'TBD' },
        { id: 72, fecha: '2026-06-27', grupo: 'K', local: 'UZB', visitante: 'IC1', sede: 'TBD' }
    ]
};

const REGLAS = `
# 📜 REGLAS DE LA QUINIELA MUNDIAL 2026

## 🎯 Sistema de Puntuación

### Puntos por Acierto:
- **1 Punto**: Acertar el ganador del partido (o empate)
- **3 Puntos Adicionales**: Acertar el marcador exacto
- **Total Máximo por Partido**: 4 puntos (1 + 3)

### Ejemplo:
- Partido: México 2-1 Sudáfrica
- Si pronosticas: "México gana" → **1 punto**
- Si pronosticas: "México 2-1" → **4 puntos** (1 por ganador + 3 por marcador exacto)

## 🔒 Reglas de Pronósticos

1. **Una Sola Oportunidad**: Los pronósticos se guardan UNA SOLA VEZ y NO se pueden modificar.
2. **Confirmación Obligatoria**: Antes de guardar, el sistema pedirá confirmación.
3. **Bloqueo Permanente**: Una vez guardados, los pronósticos quedan bloqueados hasta el final del torneo.

## 📊 Ranking

- El ranking se actualiza automáticamente después de cada jornada.
- Los usuarios se ordenan por puntos totales (mayor a menor).
- En caso de empate, se considera el número de aciertos exactos.

## ⚽ Fase de Grupos

- **12 Grupos** (A al L) con 4 equipos cada uno
- **3 Jornadas** por grupo
- **Clasifican**: Los 2 primeros de cada grupo + los 8 mejores terceros

## 👤 Gestión de Cuenta

- El administrador puede resetear contraseñas si es necesario.
- Los usuarios pueden ver su historial de pronósticos en cualquier momento.

## 💰 Distribución de Premios

Al registrarte, votaste por uno de estos modelos de distribución:

### Modelo Clásico (50/30/20)
- **1er Lugar**: 50% del premio total
- **2do Lugar**: 30% del premio total
- **3er Lugar**: 20% del premio total

### Modelo Gran Ganador (60/25/15)
- **1er Lugar**: 60% del premio total
- **2do Lugar**: 25% del premio total
- **3er Lugar**: 15% del premio total

### Modelo Escalera Suave (45/33/22)
- **1er Lugar**: 45% del premio total
- **2do Lugar**: 33% del premio total
- **3er Lugar**: 22% del premio total

**La distribución final se decidirá por votación mayoritaria de todos los participantes.**

## 🏆 ¡Buena Suerte!

Que gane el mejor pronosticador. ⚽🎉
`;

const ADMIN_PASSWORD = 'Mundial2026!';
