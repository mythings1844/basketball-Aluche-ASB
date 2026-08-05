// Mapeo completo de logos/escudos en img/
const escudos = {
  "Team Abrante": "img/abrante.png",
  "Team Bichota": "img/bichota.png",
  "Vieja Guardia": "img/guardia.png",
  "Marqués de Vadillo": "img/marques.png",
  "Cheo Madera": "img/madera.png",
  "Team Sufrido": "img/sufridos.png",
  "Team Azua": "img/azua.png",
  "A.Q.P": "img/aqp.png"
};

// Función para renderizar el logo en JS dinámico
function renderLogo(nombreEquipo, iniciales) {
  const rutaLogo = escudos[nombreEquipo];
  if (rutaLogo) {
    return `<img src="${rutaLogo}" alt="${nombreEquipo}" class="team-logo-img">`;
  }
  return `<div class="team-badge">${iniciales}</div>`;
}

// Datos de todas las jornadas, semifinales y final
const datosJornadas = {
  1: [
    { fecha: "Viernes, 24/07/2026 - 19:00", local: "Team Abrante", badgeLocal: "TA", visitante: "Team Bichota", badgeVisitante: "TB", marcador: "67 - 50", cancha: "Cancha Principal" },
    { fecha: "Viernes, 24/07/2026 - 20:15", local: "Vieja Guardia", badgeLocal: "VG", visitante: "Cheo Madera", badgeVisitante: "CM", marcador: "50 - 55", cancha: "Cancha Principal" },
    { fecha: "Sábado, 25/07/2026 - 19:00", local: "Team Sufrido", badgeLocal: "TS", visitante: "Marqués de Vadillo", badgeVisitante: "MV", marcador: "55 - 63", cancha: "Cancha Principal" },
    { fecha: "Sábado, 25/07/2026 - 20:15", local: "A.Q.P", badgeLocal: "AQP", visitante: "Team Azua", badgeVisitante: "LS", marcador: "46 - 52", cancha: "Cancha Principal" }
  ],
  2: [
    { fecha: "Viernes, 31/07/2026 - 19:00", local: "Team Bichota", badgeLocal: "TB", visitante: "Cheo Madera", badgeVisitante: "CM", marcador: "74 - 73", cancha: "Cancha Principal" },
    { fecha: "Viernes, 31/07/2026 - 20:15", local: "Team Abrante", badgeLocal: "TA", visitante: "Marqués de Vadillo", badgeVisitante: "MV", marcador: "64 - 75", cancha: "Cancha Principal" },
    { fecha: "Sábado, 01/08/2026 - 19:00", local: "Vieja Guardia", badgeLocal: "VG", visitante: "A.Q.P", badgeVisitante: "AQP", marcador: "-- - --", cancha: "Cancha Principal" },
    { fecha: "Sábado, 01/08/2026 - 20:15", local: "Team Sufrido", badgeLocal: "TS", visitante: "Team Azua", badgeVisitante: "LS", marcador: "-- - --", cancha: "Cancha Principal" }
  ],
  3: [
    { fecha: "Viernes, 07/08/2026 - 19:00", local: "Team Abrante", badgeLocal: "TA", visitante: "Cheo Madera", badgeVisitante: "CM", marcador: "-- - --", cancha: "Cancha Principal" },
    { fecha: "Viernes, 07/08/2026 - 20:15", local: "Vieja Guardia", badgeLocal: "VG", visitante: "Team Sufrido", badgeVisitante: "TS", marcador: "-- - --", cancha: "Cancha Principal" },
    { fecha: "Sábado, 08/08/2026 - 19:00", local: "Team Bichota", badgeLocal: "TB", visitante: "Team Azua", badgeVisitante: "LS", marcador: "-- - --", cancha: "Cancha Principal" },
    { fecha: "Sábado, 08/08/2026 - 20:15", local: "Marqués de Vadillo", badgeLocal: "MV", visitante: "A.Q.P", badgeVisitante: "AQP", marcador: "-- - --", cancha: "Cancha Principal" }
  ],
  4: [
    { fecha: "Viernes, 14/08/2026 - 19:00", local: "Marqués de Vadillo", badgeLocal: "MV", visitante: "Cheo Madera", badgeVisitante: "CM", marcador: "-- - --", cancha: "Cancha Principal" },
    { fecha: "Viernes, 14/08/2026 - 20:15", local: "Team Abrante", badgeLocal: "TA", visitante: "Team Azua", badgeVisitante: "LS", marcador: "-- - --", cancha: "Cancha Principal" },
    { fecha: "Sábado, 15/08/2026 - 19:00", local: "Vieja Guardia", badgeLocal: "VG", visitante: "Team Bichota", badgeVisitante: "TB", marcador: "-- - --", cancha: "Cancha Principal" },
    { fecha: "Sábado, 15/08/2026 - 20:15", local: "Team Sufrido", badgeLocal: "TS", visitante: "A.Q.P", badgeVisitante: "AQP", marcador: "-- - --", cancha: "Cancha Principal" }
  ],
  5: [
    { fecha: "Viernes, 21/08/2026 - 19:00", local: "Team Sufrido", badgeLocal: "TS", visitante: "Cheo Madera", badgeVisitante: "CM", marcador: "-- - --", cancha: "Cancha Principal" },
    { fecha: "Viernes, 21/08/2026 - 20:15", local: "Vieja Guardia", badgeLocal: "VG", visitante: "Team Azua", badgeVisitante: "LS", marcador: "-- - --", cancha: "Cancha Principal" },
    { fecha: "Sábado, 22/08/2026 - 19:00", local: "Team Bichota", badgeLocal: "TB", visitante: "Marqués de Vadillo", badgeVisitante: "MV", marcador: "-- - --", cancha: "Cancha Principal" },
    { fecha: "Sábado, 22/08/2026 - 20:15", local: "Team Abrante", badgeLocal: "TA", visitante: "A.Q.P", badgeVisitante: "AQP", marcador: "-- - --", cancha: "Cancha Principal" }
  ],
  6: [
    { fecha: "Viernes, 28/08/2026 - 19:00", local: "A.Q.P", badgeLocal: "AQP", visitante: "Cheo Madera", badgeVisitante: "CM", marcador: "-- - --", cancha: "Cancha Principal" },
    { fecha: "Viernes, 28/08/2026 - 20:15", local: "Team Abrante", badgeLocal: "TA", visitante: "Team Sufrido", badgeVisitante: "TS", marcador: "-- - --", cancha: "Cancha Principal" },
    { fecha: "Sábado, 29/08/2026 - 19:00", local: "Team Bichota", badgeLocal: "TB", visitante: "Team Azua", badgeVisitante: "LS", marcador: "-- - --", cancha: "Cancha Principal" },
    { fecha: "Sábado, 29/08/2026 - 20:15", local: "Vieja Guardia", badgeLocal: "VG", visitante: "Marqués de Vadillo", badgeVisitante: "MV", marcador: "-- - --", cancha: "Cancha Principal" }
  ],
  7: [
    { fecha: "Viernes, 04/09/2026 - 19:00", local: "Vieja Guardia", badgeLocal: "VG", visitante: "Team Abrante", badgeVisitante: "TA", marcador: "-- - --", cancha: "Cancha Principal" },
    { fecha: "Viernes, 04/09/2026 - 20:15", local: "Team Azua", badgeLocal: "LS", visitante: "Cheo Madera", badgeVisitante: "CM", marcador: "-- - --", cancha: "Cancha Principal" },
    { fecha: "Sábado, 05/09/2026 - 19:00", local: "Team Bichota", badgeLocal: "TB", visitante: "Team Sufrido", badgeVisitante: "TS", marcador: "-- - --", cancha: "Cancha Principal" },
    { fecha: "Sábado, 05/09/2026 - 20:15", local: "Marqués de Vadillo", badgeLocal: "MV", visitante: "A.Q.P", badgeVisitante: "AQP", marcador: "-- - --", cancha: "Cancha Principal" }
  ],
  "semis": [
    { fecha: "Viernes, 11/09/2026 - 19:00", local: "1.° Clasificado", badgeLocal: "1º", visitante: "4.° Clasificado", badgeVisitante: "4º", marcador: "VS", cancha: "Cancha Principal" },
    { fecha: "Viernes, 11/09/2026 - 20:15", local: "2.° Clasificado", badgeLocal: "2º", visitante: "3.° Clasificado", badgeVisitante: "3º", marcador: "VS", cancha: "Cancha Principal" }
  ],
  "final": [
    { fecha: "Partido 1 — Sábado, 12/09/2026 - 20:00", local: "Finalista 1", badgeLocal: "S1", visitante: "Finalista 2", badgeVisitante: "S2", marcador: "VS", cancha: "Cancha Principal" },
    { fecha: "Partido 2 — Viernes, 18/09/2026 - 20:00", local: "Finalista 1", badgeLocal: "S1", visitante: "Finalista 2", badgeVisitante: "S2", marcador: "VS", cancha: "Cancha Principal" },
    { fecha: "Partido 3* — Sábado, 19/09/2026 - 20:00", local: "Finalista 1", badgeLocal: "S1", visitante: "Finalista 2", badgeVisitante: "S2", marcador: "VS", cancha: "Cancha Principal (De ser necesario)" }
  ]
};