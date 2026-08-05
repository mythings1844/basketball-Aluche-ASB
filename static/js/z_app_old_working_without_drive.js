document.addEventListener("DOMContentLoaded", () => {
  const matchesContainer = document.getElementById("matchesContainer");
  const tabButtons = document.querySelectorAll(".tab-btn");
  const navLinks = document.querySelectorAll(".nav-link");
  const views = document.querySelectorAll(".page-view");
  const btnGoToCalendar = document.getElementById("btnGoToCalendar");

  // NAVEGACIÓN ENTRE SECCIONES DEL MENÚ
  function switchView(targetName) {
    if (!targetName) return;

    // Normaliza el nombre eliminando prefijos "view-" o "#"
    const cleanTarget = targetName.replace(/^#/, "").replace(/^view-/, "");

    // 1. Alternar visibilidad de las secciones (<section id="view-resultados">, etc.)
    views.forEach(view => {
      const isTarget = view.id === `view-${cleanTarget}`;
      view.classList.toggle("hidden", !isTarget);
    });

    // 2. Actualizar estado activo en los enlaces de navegación
    navLinks.forEach(link => {
      const rawTarget = link.getAttribute("data-view") || link.getAttribute("data-target") || link.getAttribute("href") || "";
      const linkTarget = rawTarget.replace(/^#/, "").replace(/^view-/, "");
      
      link.classList.toggle("active", linkTarget === cleanTarget);
    });
  }

  // Asignar eventos a los links de la barra de navegación
  navLinks.forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      
      // Obtiene el objetivo usando e.currentTarget (garantiza capturar el <a> aunque pises el <i> o <span>)
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

  // RENDERIZADO DE PARTIDOS CON SEPARADOR DIFUMINADO
  function cargarJornada(jornadaKey) {
    if (typeof datosJornadas === "undefined" || !datosJornadas[jornadaKey]) return;

    const partidos = datosJornadas[jornadaKey];

    // Si es la Gran Final, activamos la vista vertical de 1 sola columna
    if (String(jornadaKey) === "final") {
      matchesContainer.classList.add("full-width-stack");
    } else {
      matchesContainer.classList.remove("full-width-stack");
    }

    // Marcar pestaña activa
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

            <div class="score">${partido.marcador}</div>

            <div class="team away">
              <span class="team-name">${partido.visitante}</span>
              ${logoVisitante}
            </div>
          </div>
          <div class="match-location">📍 ${partido.cancha}</div>
        </div>
      `;
    });

    matchesContainer.innerHTML = html;
  }

  // EVENTOS PARA LAS PESTAÑAS DE JORNADAS
  tabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const jornadaKey = btn.getAttribute("data-jornada");
      cargarJornada(jornadaKey);
    });
  });

  // Inicializar cargando la Jornada 1 por defecto
  cargarJornada("1");
  
  // Calcular y renderizar la tabla al cargar el DOM
  calcularYRenderizarTabla();
});

// Función para calcular y renderizar la tabla de posiciones dinámicamente
function calcularYRenderizarTabla() {
  if (typeof datosJornadas === "undefined") return;

  const equipos = {};

  Object.keys(datosJornadas).forEach(jornadaKey => {
    if (isNaN(jornadaKey)) return;

    datosJornadas[jornadaKey].forEach(partido => {
      if (!partido.marcador || partido.marcador.includes("--") || partido.marcador === "VS") return;

      const [puntosLocal, puntosVisitante] = partido.marcador.split("-").map(p => parseInt(p.trim(), 10));
      if (isNaN(puntosLocal) || isNaN(puntosVisitante)) return;

      [
        { nombre: partido.local, badge: partido.badgeLocal },
        { nombre: partido.visitante, badge: partido.badgeVisitante }
      ].forEach(eq => {
        if (!equipos[eq.nombre]) {
          equipos[eq.nombre] = { nombre: eq.nombre, badge: eq.badge, pj: 0, pg: 0, pp: 0, pf: 0, pc: 0, dif: 0, pts: 0 };
        }
      });

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

    // Determina la clase según el puesto
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