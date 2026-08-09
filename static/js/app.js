// URL para el entorno PRO (GitHub Pages)
const SHEET_PRO = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTcA_VSyzux4ZBuDVvQe35kBlcSaBM5g46rY9rBb3Jr1hSlGkq9_9aCxYN_vWsziHzUWafWKhKKD5lE/pub?gid=0&single=true&output=csv";

// URL para tus pruebas en LOCAL (Pega aquí la URL en CSV de tu hoja de pruebas)
const SHEET_LOCAL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSohtSgegLqJZ34ssDO9UyhHjWBm0k8dJcC7EFiV6s9oi-wp2S2JVo-JTz-6pidywP71VDxy7rs7hMO/pub?gid=0&single=true&output=csv";

// Detecta si estás ejecutando el proyecto en tu ordenador (localhost / 127.0.0.1)
const host = window.location.hostname;
const esLocal = host === "localhost" || 
                host === "127.0.0.1" || 
                host.startsWith("192.168.") || 
                host.startsWith("10.") || 
                window.location.protocol === "file:";

// Selecciona la URL correcta según dónde estés trabajando
const SHEET_CSV_URL = esLocal ? SHEET_LOCAL : SHEET_PRO;

document.addEventListener("DOMContentLoaded", async () => {
  const matchesContainer = document.getElementById("matchesContainer");
  const tabButtons = document.querySelectorAll(".tab-btn");
  const navLinks = document.querySelectorAll(".nav-link");
  const views = document.querySelectorAll(".page-view");
  const btnGoToCalendar = document.getElementById("btnGoToCalendar");

  // NAVEGACIÓN ENTRE SECCIONES DEL MENÚ
  function switchView(targetName) {
    if (!targetName) return;

    const cleanTarget = targetName.replace(/^#/, "").replace(/^view-/, "");

    views.forEach(view => {
      const isTarget = view.id === `view-${cleanTarget}`;
      view.classList.toggle("hidden", !isTarget);
    });

    navLinks.forEach(link => {
      const rawTarget = link.getAttribute("data-view") || link.getAttribute("data-target") || link.getAttribute("href") || "";
      const linkTarget = rawTarget.replace(/^#/, "").replace(/^view-/, "");
      link.classList.toggle("active", linkTarget === cleanTarget);
    });
  }

  navLinks.forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const currentLink = e.currentTarget;
      const target = currentLink.getAttribute("data-view") || 
                     currentLink.getAttribute("data-target") || 
                     currentLink.getAttribute("href");
      switchView(target);
    });
  });

  if (btnGoToCalendar) {
    btnGoToCalendar.addEventListener("click", () => switchView("calendario"));
  }

  // RENDERIZADO DE PARTIDOS
  function cargarJornada(jornadaKey) {
    if (typeof datosJornadas === "undefined" || !datosJornadas[jornadaKey]) return;

    const partidos = datosJornadas[jornadaKey];

    if (String(jornadaKey) === "final") {
      matchesContainer.classList.add("full-width-stack");
    } else {
      matchesContainer.classList.remove("full-width-stack");
    }

    tabButtons.forEach(btn => {
      const key = btn.getAttribute("data-jornada");
      btn.classList.toggle("active", String(key) === String(jornadaKey));
    });

    let html = "";
    let lastDate = null;

    partidos.forEach(partido => {
      const currentDate = partido.fecha ? partido.fecha.split(" - ")[0] : null;

      if (lastDate && currentDate && lastDate !== currentDate && String(jornadaKey) !== "final") {
        html += `<hr class="day-divider">`;
      }
      lastDate = currentDate;

      const logoLocal = typeof renderLogo === "function" ? renderLogo(partido.local, partido.badgeLocal) : "";
      const logoVisitante = typeof renderLogo === "function" ? renderLogo(partido.visitante, partido.badgeVisitante) : "";

      html += `
        <div class="match-card">
          <div class="match-date">${partido.fecha}</div>
          <div class="match-teams">
            <div class="team home">
              ${logoLocal}
              <span class="team-name">${partido.local}</span>
            </div>

            <div class="score">${partido.marcador || "-- - --"}</div>

            <div class="team away">
              <span class="team-name">${partido.visitante}</span>
              ${logoVisitante}
            </div>
          </div>
        </div>
      `;
    });

    matchesContainer.innerHTML = html;
  }

  // ACTUALIZA AUTOMÁTICAMENTE EL ESTADO DE LAS JORNADAS
  function actualizarEstadoJornadas() {
    if (typeof datosJornadas === "undefined") return;

    tabButtons.forEach(btn => {
      const jornadaKey = btn.getAttribute("data-jornada");

      // Solo queremos calcular las jornadas 1 a 7
      // Semifinales y final NO se marcan automáticamente como completadas
      if (!["1", "2", "3", "4", "5", "6", "7"].includes(String(jornadaKey))) {
        btn.classList.remove("completed");
        return;
      }

      const partidos = datosJornadas[jornadaKey];

      // Si no existen partidos, no está completa
      if (!Array.isArray(partidos) || partidos.length === 0) {
        btn.classList.remove("completed");
        return;
      }

      // Todos los partidos tienen que tener un marcador REAL
      const jornadaCompleta = partidos.every(partido => {
        const marcador = String(partido.marcador || "").trim();

        // "VS", "-- - --", vacío, etc. NO son resultados
        if (
          marcador === "" ||
          marcador === "-- - --" ||
          marcador === "--" ||
          marcador.toUpperCase() === "VS"
        ) {
          return false;
        }

        return true;
      });

      // Verde si está completa, quitar verde si no
      btn.classList.toggle("completed", jornadaCompleta);
    });
  }

  // EVENTOS DE PESTAÑAS
  tabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const jornadaKey = btn.getAttribute("data-jornada");
      cargarJornada(jornadaKey);
    });
  });

  // 1. Intentar sincronizar datos con Google Sheets
  await sincronizarMarcadores();

  // 2. Actualizar automáticamente qué jornadas están completas
  actualizarEstadoJornadas();

  // 3. Pintar la UI (garantizado que se ejecuta SIEMPRE)
  cargarJornada("1");
  calcularYRenderizarTabla();
});

// FUNCIÓN DE SINCRONIZACIÓN MEJORADA
async function sincronizarMarcadores() {
  if (!SHEET_CSV_URL || SHEET_CSV_URL.includes("PEGA_AQUI_TU_ENLACE")) return;

  try {
    const response = await fetch(SHEET_CSV_URL);
    if (!response.ok) return;

    const csvText = await response.text();
    const lineas = csvText.split(/\r?\n/).filter(l => l.trim() !== "");

    // i = 1 para saltar la fila de encabezados
    for (let i = 1; i < lineas.length; i++) {
      const columnas = lineas[i].split(",").map(c => c.replace(/^"|"$/g, '').trim());
      const [idPartido, local, marcador] = columnas;

      if (!idPartido || !marcador) continue;

      const partes = idPartido.split("-");
      const jornadaKey = partes[0];

      if (typeof datosJornadas !== "undefined" && datosJornadas[jornadaKey]) {
        // Busca el partido por su ID exacto (ej. "1-1") o en su defecto por el equipo local
        const partido = datosJornadas[jornadaKey].find(p => p.id === idPartido || p.local.toLowerCase() === local.toLowerCase());
        if (partido) {
          partido.marcador = marcador;
        }
      }
    }
  } catch (error) {
    console.warn("No se pudieron descargar los datos remotos, cargando estructura local:", error);
  }
}

// CÁLCULO DE TABLA DE POSICIONES

/* ==========================================================================
   LÓGICA DE CÁLCULO DE TABLA Y DESEMPATES (REGLAMENTO FIBA)
   ==========================================================================

   1. LÍDER Y POSICIONES GENERALES:
      - Queda por encima (líder) el equipo que sume MÁS PUNTOS totales.
      - Asignación de puntos por partido:
        • Victoria = 2 puntos
        • Derrota  = 1 punto

   2. SECUENCIA DE DESEMPATE (SI DOS O MÁS EQUIPOS EMPATAN EN PUNTOS):

      - 1.º PARTIDO DIRECTO (EL DUELO DIRECTO MANDA):
        Queda por encima el equipo que haya ganado el partido entre ellos.
        (Ejemplo: Si B le ganó a A, B queda por delante de A aunque A tenga 
        mejor diferencia de puntos global).

      - 2.º MINI-LIGA (SI EMPATAN 3 O MÁS EQUIPOS):
        Se crea una tabla evaluando ÚNICAMENTE los partidos jugados entre los 
        equipos empatados (Puntos -> Diferencia de puntos -> Puntos a favor).

      - 3.º DIFERENCIA DE PUNTOS GENERAL (DIF):
        Si no han jugado entre sí todavía, 
        se mira la diferencia de puntos global de todo el torneo (PF - PC).

      - 4.º PUNTOS A FAVOR GENERAL (PF):
        Puntos totales anotados a lo largo del torneo.
   ========================================================================== */

// CÁLCULO DE TABLA DE POSICIONES CON REGLAMENTO FIBA
function calcularYRenderizarTabla() {
  if (typeof datosJornadas === "undefined") return;

  const equipos = {};
  const partidosJugados = [];

  // 1. Procesar partidos y construir acumulados generales
  Object.keys(datosJornadas).forEach(jornadaKey => {
    if (isNaN(jornadaKey)) return;

    datosJornadas[jornadaKey].forEach(partido => {
      // Registrar todos los equipos participantes aunque no hayan jugado
      [
        { nombre: partido.local, badge: partido.badgeLocal },
        { nombre: partido.visitante, badge: partido.badgeVisitante }
      ].forEach(eq => {
        if (!equipos[eq.nombre]) {
          equipos[eq.nombre] = { nombre: eq.nombre, badge: eq.badge, pj: 0, pg: 0, pp: 0, pf: 0, pc: 0, dif: 0, pts: 0 };
        }
      });

      // Ignorar partidos no jugados
      if (!partido.marcador || partido.marcador.includes("--") || partido.marcador === "VS") return;

      const [puntosLocal, puntosVisitante] = partido.marcador.split("-").map(p => parseInt(p.trim(), 10));
      if (isNaN(puntosLocal) || isNaN(puntosVisitante)) return;

      // Guardar el registro del partido jugado para los desempates FIBA
      partidosJugados.push({
        local: partido.local,
        visitante: partido.visitante,
        puntosLocal,
        puntosVisitante
      });

      // Acumular datos del local
      equipos[partido.local].pj += 1;
      equipos[partido.local].pf += puntosLocal;
      equipos[partido.local].pc += puntosVisitante;

      // Acumular datos del visitante
      equipos[partido.visitante].pj += 1;
      equipos[partido.visitante].pf += puntosVisitante;
      equipos[partido.visitante].pc += puntosLocal;

      if (puntosLocal > puntosVisitante) {
        equipos[partido.local].pg += 1;
        equipos[partido.local].pts += 2; // En FIBA: Victoria = 2 pts
        equipos[partido.visitante].pp += 1;
        equipos[partido.visitante].pts += 1; // En FIBA: Derrota = 1 pt
      } else {
        equipos[partido.visitante].pg += 1;
        equipos[partido.visitante].pts += 2;
        equipos[partido.local].pp += 1;
        equipos[partido.local].pts += 1;
      }
    });
  });

  const listaEquipos = Object.values(equipos).map(eq => {
    eq.dif = eq.pf - eq.pc;
    return eq;
  });

  // 2. Función auxiliar para desempates en enfrentamiento directo (Regla FIBA)
  function compararDirectoFIBA(eqA, eqB, grupoEmpatados) {
    const nombresGrupo = new Set(grupoEmpatados.map(e => e.nombre));

    // Filtrar únicamente los partidos jugados ENTRE los miembros del grupo empatado
    const partidosDirectos = partidosJugados.filter(
      p => nombresGrupo.has(p.local) && nombresGrupo.has(p.visitante)
    );

    // Si no han jugado entre sí todavía dentro del grupo
    if (partidosDirectos.length === 0) return 0;

    // Calcular estadísticas dentro de la "mini-tabla" del grupo empatado
    const statsA = { pts: 0, pf: 0, pc: 0 };
    const statsB = { pts: 0, pf: 0, pc: 0 };

    partidosDirectos.forEach(p => {
      if (p.local === eqA.nombre || p.visitante === eqA.nombre) {
        const esLocal = p.local === eqA.nombre;
        const pf = esLocal ? p.puntosLocal : p.puntosVisitante;
        const pc = esLocal ? p.puntosVisitante : p.puntosLocal;
        statsA.pf += pf;
        statsA.pc += pc;
        statsA.pts += (pf > pc) ? 2 : 1;
      }
      if (p.local === eqB.nombre || p.visitante === eqB.nombre) {
        const esLocal = p.local === eqB.nombre;
        const pf = esLocal ? p.puntosLocal : p.puntosVisitante;
        const pc = esLocal ? p.puntosVisitante : p.puntosLocal;
        statsB.pf += pf;
        statsB.pc += pc;
        statsB.pts += (pf > pc) ? 2 : 1;
      }
    });

    // Criterio 1 FIBA en directo: Puntos de clasificación entre ellos
    if (statsB.pts !== statsA.pts) return statsB.pts - statsA.pts;

    // Criterio 2 FIBA en directo: Diferencia de puntos entre ellos
    const difA = statsA.pf - statsA.pc;
    const difB = statsB.pf - statsB.pc;
    if (difB !== difA) return difB - difA;

    // Criterio 3 FIBA en directo: Puntos anotados a favor entre ellos
    if (statsB.pf !== statsA.pf) return statsB.pf - statsA.pf;

    return 0; // Si continúan totalmente igualados en directo
  }

  // 3. Ordenar la tabla usando los criterios FIBA completamos
  listaEquipos.sort((a, b) => {
    // 1º Criterio: Puntos de clasificación en la tabla general
    if (b.pts !== a.pts) return b.pts - a.pts;

    // Si hay empate en puntos generales, buscamos todos los equipos con esos mismos PTS
    const empatados = listaEquipos.filter(e => e.pts === a.pts);

    if (empatados.length >= 2) {
      const resDirecto = compararDirectoFIBA(a, b, empatados);
      if (resDirecto !== 0) return resDirecto;
    }

    // 2º Criterio (Si persiste el empate): Diferencia general del torneo
    if (b.dif !== a.dif) return b.dif - a.dif;

    // 3º Criterio: Puntos a favor general del torneo
    return b.pf - a.pf;
  });

  // 4. Renderizar el HTML
  const tbody = document.querySelector(".table-container table tbody");
  if (!tbody) return;

  tbody.innerHTML = listaEquipos.map((eq, index) => {
    const posicion = index + 1;
    const logo = typeof renderLogo === "function" ? renderLogo(eq.nombre, eq.badge) : "";
    const difFormatted = eq.dif > 0 ? `+${eq.dif}` : eq.dif;
    const posClass = posicion <= 4 ? "pos-qualify" : "pos-eliminated";

    return `
      <tr>
        <td class="col-pos ${posClass}"><strong>${posicion}</strong></td>
        <td>
          <div style="display: flex; align-items: center; gap: 10px;">
            ${logo}
            <span style="font-weight: 600;">${eq.nombre}</span>
          </div>
        </td>
        <td>${eq.pj}</td>
        <td>${eq.pg}</td>
        <td>${eq.pp}</td>
        <td>${eq.pf}</td>
        <td>${eq.pc}</td>
        <td>${difFormatted}</td>
        <td><strong>${eq.pts}</strong></td>
      </tr>
    `;
  }).join("");
}