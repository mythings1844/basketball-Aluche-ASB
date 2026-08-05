// URL de tu hoja publicada en CSV
const SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTcA_VSyzux4ZBuDVvQe35kBlcSaBM5g46rY9rBb3Jr1hSlGkq9_9aCxYN_vWsziHzUWafWKhKKD5lE/pub?output=csv";

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

  // EVENTOS DE PESTAÑAS
  tabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const jornadaKey = btn.getAttribute("data-jornada");
      cargarJornada(jornadaKey);
    });
  });

  // 1. Intentar sincronizar datos con Google Sheets
  await sincronizarMarcadores();

  // 2. Pintar la UI (garantizado que se ejecuta SIEMPRE)
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
function calcularYRenderizarTabla() {
  if (typeof datosJornadas === "undefined") return;

  const equipos = {};

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

      equipos[partido.local].pj += 1;
      equipos[partido.local].pf += puntosLocal;
      equipos[partido.local].pc += puntosVisitante;

      equipos[partido.visitante].pj += 1;
      equipos[partido.visitante].pf += puntosVisitante;
      equipos[partido.visitante].pc += puntosLocal;

      if (puntosLocal > puntosVisitante) {
        equipos[partido.local].pg += 1;
        equipos[partido.local].pts += 2;
        equipos[partido.visitante].pp += 1;
        equipos[partido.visitante].pts += 1;
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

  listaEquipos.sort((a, b) => {
    if (b.pts !== a.pts) return b.pts - a.pts;
    if (b.dif !== a.dif) return b.dif - a.dif;
    return b.pf - a.pf;
  });

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