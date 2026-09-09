// ==========================================
// CONFIGURACIÓN DE URLS (LOCAL VS PRO)
// ==========================================
// Partidos / Resultados
const SHEET_PARTIDOS_PRO = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTcA_VSyzux4ZBuDVvQe35kBlcSaBM5g46rY9rBb3Jr1hSlGkq9_9aCxYN_vWsziHzUWafWKhKKD5lE/pub?gid=0&single=true&output=csv";
const SHEET_PARTIDOS_LOCAL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSohtSgegLqJZ34ssDO9UyhHjWBm0k8dJcC7EFiV6s9oi-wp2S2JVo-JTz-6pidywP71VDxy7rs7hMO/pub?gid=0&single=true&output=csv";

// Noticias
const SHEET_NOTICIAS_PRO = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTcA_VSyzux4ZBuDVvQe35kBlcSaBM5g46rY9rBb3Jr1hSlGkq9_9aCxYN_vWsziHzUWafWKhKKD5lE/pub?gid=1862417261&single=true&output=csv";
const SHEET_NOTICIAS_LOCAL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSohtSgegLqJZ34ssDO9UyhHjWBm0k8dJcC7EFiV6s9oi-wp2S2JVo-JTz-6pidywP71VDxy7rs7hMO/pub?gid=386113331&single=true&output=csv";

// Detección de entorno local
const host = window.location.hostname;
const esLocal = host === "localhost" || 
                host === "127.0.0.1" || 
                host.startsWith("192.168.") || 
                host.startsWith("10.") || 
                window.location.protocol === "file:";

const SHEET_CSV_URL = esLocal ? SHEET_PARTIDOS_LOCAL : SHEET_PARTIDOS_PRO;
const URL_CSV_NOTICIAS = esLocal ? SHEET_NOTICIAS_LOCAL : SHEET_NOTICIAS_PRO;


// ==========================================
// INICIALIZACIÓN UNIFICADA
// ==========================================
document.addEventListener("DOMContentLoaded", async () => {
  const matchesContainer = document.getElementById("matchesContainer");
  const tabButtons = document.querySelectorAll(".tab-btn");
  const navLinks = document.querySelectorAll(".nav-link");
  const views = document.querySelectorAll(".page-view");
  const btnGoToCalendar = document.getElementById("btnGoToCalendar");

  // 1. Manejo unificado de Hash y vistas
  function switchView(targetName, updateHash = true) {
    if (!targetName) return;

    const cleanTarget = targetName.replace(/^#/, "").replace(/^view-/, "");

    if (updateHash && window.location.hash !== `#${cleanTarget}`) {
      window.location.hash = cleanTarget;
    }

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

  function cambiarVistaSegunHash() {
    const currentHash = window.location.hash ? window.location.hash.replace("#", "") : "noticias";
    switchView(currentHash, false);
  }

  // Eventos del menú principal
  navLinks.forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const target = link.getAttribute("data-view") || 
                     link.getAttribute("data-target") || 
                     link.getAttribute("href");
      switchView(target, true);
    });
  });

  if (btnGoToCalendar) {
    btnGoToCalendar.addEventListener("click", () => switchView("calendario", true));
  }

  window.addEventListener("hashchange", cambiarVistaSegunHash);

  // 2. RENDERIZADO DE PARTIDOS
  function cargarJornada(jornadaKey) {
    if (typeof datosJornadas === "undefined" || !datosJornadas[jornadaKey] || !matchesContainer) return;

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

  function actualizarEstadoJornadas() {
    if (typeof datosJornadas === "undefined") return;

    tabButtons.forEach(btn => {
      const jornadaKey = btn.getAttribute("data-jornada");
      const partidos = datosJornadas[jornadaKey];

      if (!Array.isArray(partidos) || partidos.length === 0) {
        btn.classList.remove("completed");
        return;
      }

      const jornadaCompleta = partidos.every(partido => {
        const marcador = String(partido.marcador || "").trim();
        return !(marcador === "" || marcador === "-- - --" || marcador === "--" || marcador.toUpperCase() === "VS");
      });

      btn.classList.toggle("completed", jornadaCompleta);
    });
  }

  tabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const jornadaKey = btn.getAttribute("data-jornada");
      cargarJornada(jornadaKey);
    });
  });

  // Inicialización de Modales
  inicializarModales();

  // Carga inicial paralela
  cambiarVistaSegunHash();
  cargarJornada("1");

  // Disparar carga de noticias inmediatamente
  cargarNoticias();

  // Sincronizar partidos en segundo plano sin bloquear
  sincronizarMarcadores().then(() => {
    actualizarEstadoJornadas();
    cargarJornada("1");
    calcularYRenderizarTabla();
  });
}); // <-- AQUÍ SE CIERRA DOMCONTENTLOADED CORRECTAMENTE


// ==========================================
// SINCRONIZACIÓN CSV GOOGLE SHEETS
// ==========================================
async function sincronizarMarcadores() {
  if (!SHEET_CSV_URL) return;

  try {
    const response = await fetch(SHEET_CSV_URL);
    if (!response.ok) return;

    const csvText = await response.text();
    const lineas = csvText.split(/\r?\n/).filter(l => l.trim() !== "");

    for (let i = 1; i < lineas.length; i++) {
      const columnas = lineas[i].split(",").map(c => c.replace(/^"|"$/g, '').trim());
      const [idPartido, localVal, visitanteVal, marcadorVal] = columnas;

      if (!idPartido) continue;

      const partes = idPartido.split("-");
      const jornadaKey = partes[0];

      if (typeof datosJornadas !== "undefined" && datosJornadas[jornadaKey]) {
        const partido = datosJornadas[jornadaKey].find(p => {
          if (p.id && p.id.toLowerCase() === idPartido.toLowerCase()) return true;
          const nombreLimpio = partes.slice(1).join("-").toLowerCase();
          return p.local && p.local.toLowerCase() === nombreLimpio;
        });

        if (partido) {
          if (localVal && localVal.trim() !== "") partido.local = localVal;
          if (visitanteVal && visitanteVal.trim() !== "") partido.visitante = visitanteVal;
          if (marcadorVal && marcadorVal.trim() !== "") partido.marcador = marcadorVal;
        }
      }
    }
  } catch (error) {
    console.warn("No se pudieron cargar los datos remotos:", error);
  }
}


// ==========================================
// CÁLCULO DE TABLA FIBA
// ==========================================
function calcularYRenderizarTabla() {
  if (typeof datosJornadas === "undefined") return;

  const equipos = {};
  const partidosJugados = [];

  Object.keys(datosJornadas).forEach(jornadaKey => {
    if (isNaN(jornadaKey)) return;

    datosJornadas[jornadaKey].forEach(partido => {
      [
        { nombre: partido.local, badge: partido.badgeLocal },
        { nombre: partido.visitante, badge: partido.badgeVisitante }
      ].forEach(eq => {
        if (!equipos[eq.nombre]) {
          equipos[eq.nombre] = { nombre: eq.nombre, badge: eq.badge, pj: 0, pg: 0, pp: 0, pf: 0, pc: 0, dif: 0, pts: 0 };
        }
      });

      if (!partido.marcador || partido.marcador.includes("--") || partido.marcador === "VS") return;

      const [puntosLocal, puntosVisitante] = partido.marcador.split("-").map(p => parseInt(p.trim(), 10));
      if (isNaN(puntosLocal) || isNaN(puntosVisitante)) return;

      partidosJugados.push({
        local: partido.local,
        visitante: partido.visitante,
        puntosLocal,
        puntosVisitante
      });

      equipos[partido.local].pj += 1;
      equipos[partido.local].pf += puntosLocal;
      equipos[partido.local].pc += puntosVisitante;

      equipos[partido.visitante].pj += 1;
      equipos[partido.visitante].pf += puntosVisitante;
      equipos[partido.visitante].pc += puntosLocal;

      const esForfeitVisitante = (puntosLocal === 20 && puntosVisitante === 0);
      const esForfeitLocal = (puntosLocal === 0 && puntosVisitante === 20);

      if (puntosLocal > puntosVisitante) {
        equipos[partido.local].pg += 1;
        equipos[partido.local].pts += 2;
        equipos[partido.visitante].pp += 1;
        equipos[partido.visitante].pts += esForfeitVisitante ? 0 : 1;
      } else {
        equipos[partido.visitante].pg += 1;
        equipos[partido.visitante].pts += 2;
        equipos[partido.local].pp += 1;
        equipos[partido.local].pts += esForfeitLocal ? 0 : 1;
      }
    });
  });

  const listaEquipos = Object.values(equipos).map(eq => {
    eq.dif = eq.pf - eq.pc;
    return eq;
  });

  function compararDirectoFIBA(eqA, eqB, grupoEmpatados) {
    const nombresGrupo = new Set(grupoEmpatados.map(e => e.nombre));
    const partidosDirectos = partidosJugados.filter(p => nombresGrupo.has(p.local) && nombresGrupo.has(p.visitante));

    if (partidosDirectos.length === 0) return 0;

    const statsA = { pts: 0, pf: 0, pc: 0 };
    const statsB = { pts: 0, pf: 0, pc: 0 };

    partidosDirectos.forEach(p => {
      if (p.local === eqA.nombre || p.visitante === eqA.nombre) {
        const esLocal = p.local === eqA.nombre;
        const pf = esLocal ? p.puntosLocal : p.puntosVisitante;
        const pc = esLocal ? p.puntosVisitante : p.puntosLocal;
        const esForfeit = (pf === 0 && pc === 20);
        statsA.pf += pf;
        statsA.pc += pc;
        statsA.pts += (pf > pc) ? 2 : (esForfeit ? 0 : 1);
      }
      if (p.local === eqB.nombre || p.visitante === eqB.nombre) {
        const esLocal = p.local === eqB.nombre;
        const pf = esLocal ? p.puntosLocal : p.puntosVisitante;
        const pc = esLocal ? p.puntosVisitante : p.puntosLocal;
        const esForfeit = (pf === 0 && pc === 20);
        statsB.pf += pf;
        statsB.pc += pc;
        statsB.pts += (pf > pc) ? 2 : (esForfeit ? 0 : 1);
      }
    });

    if (statsB.pts !== statsA.pts) return statsB.pts - statsA.pts;

    const difA = statsA.pf - statsA.pc;
    const difB = statsB.pf - statsB.pc;
    if (difB !== difA) return difB - difA;

    if (statsB.pf !== statsA.pf) return statsB.pf - statsA.pf;

    return 0;
  }

  listaEquipos.sort((a, b) => {
    if (b.pts !== a.pts) return b.pts - a.pts;

    const empatados = listaEquipos.filter(e => e.pts === a.pts);

    if (empatados.length >= 2) {
      const resDirecto = compararDirectoFIBA(a, b, empatados);
      if (resDirecto !== 0) return resDirecto;
    }

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

function parsearFechaDDMMYYYY(fechaStr) {
  if (!fechaStr) return new Date(0);
  const partes = fechaStr.trim().split('/');
  if (partes.length !== 3) return new Date(0);
  
  const dia = parseInt(partes[0], 10);
  const mes = parseInt(partes[1], 10) - 1;
  const anio = parseInt(partes[2], 10);
  
  return new Date(anio, mes, dia);
}


// ==========================================
// MÓDULO DE NOTICIAS CON PARSER SEGURO
// ==========================================
async function cargarNoticias() {
  const container = document.getElementById("newsContainer");
  if (!container) return;

  container.innerHTML = Array(3).fill(`
    <article class="news-card" style="opacity: 0.5;">
      <div style="background:#ddd; height:180px; width:100%;"></div>
      <div class="news-body" style="padding:15px;">
        <div style="background:#ddd; height:15px; width:30%; margin-bottom:10px;"></div>
        <div style="background:#ddd; height:20px; width:80%; margin-bottom:10px;"></div>
        <div style="background:#ddd; height:40px; width:100%;"></div>
      </div>
    </article>
  `).join("");

  try {
    const res = await fetch(URL_CSV_NOTICIAS);
    const text = await res.text();
    const noticias = parsearCSVNoticias(text);

    if (noticias.length === 0) {
      container.innerHTML = `<p style="text-align:center; color:#777; width:100%;">No hay noticias disponibles.</p>`;
      return;
    }

    noticias.sort((a, b) => {
      const fechaA = parsearFechaDDMMYYYY(a.fecha);
      const fechaB = parsearFechaDDMMYYYY(b.fecha);
      return fechaB - fechaA;
    });

    container.innerHTML = noticias.map((post, index) => `
      <article class="news-card">
        <img 
          src="${post.imagen}" 
          class="news-image" 
          alt="${post.titulo}" 
          loading="${index === 0 ? 'eager' : 'lazy'}" 
          decoding="async"
          onerror="this.onerror=null; this.src='img/aluche_logo.png'"
        >
        <div class="news-body">
          <div class="news-meta">
            <span class="news-tag">${post.etiqueta}</span>
            <span><i class="fa-regular fa-calendar"></i> ${post.fecha}</span>
          </div>
          <h3 class="news-title">${post.titulo}</h3>
          <p class="news-excerpt">${post.resumen}</p>
          <a href="noticia.html?id=${post.id}" class="btn-read-more">LEER MÁS</a>
        </div>
      </article>
    `).join("");

  } catch (err) {
    console.error("Error al cargar las noticias:", err);
    container.innerHTML = `<p style="text-align:center; color:#8b0000; width:100%;">Error al cargar las noticias.</p>`;
  }
}

function parsearCSVNoticias(text) {
  const result = [];
  let row = [];
  let entry = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    const nextC = text[i + 1];

    if (c === '"') {
      if (inQuotes && nextC === '"') {
        entry += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (c === ',' && !inQuotes) {
      row.push(entry.trim());
      entry = '';
    } else if ((c === '\r' || c === '\n') && !inQuotes) {
      if (c === '\r' && nextC === '\n') i++;
      row.push(entry.trim());
      if (row.length > 1 || row[0] !== '') {
        result.push(row);
      }
      row = [];
      entry = '';
    } else {
      entry += c;
    }
  }
  if (entry || row.length > 0) {
    row.push(entry.trim());
    result.push(row);
  }

  const noticias = [];
  for (let i = 1; i < result.length; i++) {
    const cols = result[i];
    if (cols.length >= 4) {
      noticias.push({
        id: cols[0],
        fecha: cols[1],
        etiqueta: cols[2],
        titulo: cols[3],
        imagen: cols[4] || 'img/aluche_logo.png',
        resumen: cols[5] || '',
        contenido: cols[6] || cols[5] || ''
      });
    }
  }
  return noticias;
}


// ==========================================
// MANEJO DE MODALES
// ==========================================
function inicializarModales() {
  const modal = document.getElementById("imageModal");
  const imgModalTarget = document.getElementById("imgModalTarget");
  const tableModalTarget = document.getElementById("tableModalTarget");
  const closeModalBtn = document.querySelector(".close-modal");

  document.addEventListener("click", (e) => {
    if (e.target && e.target.id === "imgCalendario") {
      if (tableModalTarget) tableModalTarget.style.display = "none";
      if (imgModalTarget && modal) {
        imgModalTarget.src = e.target.src;
        imgModalTarget.style.display = "block";
        modal.style.display = "flex";
      }
    }
  });

  document.addEventListener("click", (e) => {
    const tableContainer = e.target.closest(".table-container");

    if (tableContainer && modal && tableModalTarget) {
      if (imgModalTarget) imgModalTarget.style.display = "none";

      const scaler = tableModalTarget.querySelector(".modal-table-scaler");
      if (!scaler) return;

      const tablaClonada = tableContainer.cloneNode(true);

      scaler.innerHTML = "";
      scaler.appendChild(tablaClonada);

      scaler.style.transform = "none";
      tableModalTarget.style.width = "auto";
      tableModalTarget.style.height = "auto";

      tableModalTarget.style.display = "block";
      modal.style.display = "flex";

      setTimeout(() => {
        const table = scaler.querySelector("table");

        if (table) {
          const anchoPantalla = window.innerWidth * 0.92;
          const anchoTabla = table.offsetWidth;
          const altoTabla = table.offsetHeight;

          if (anchoTabla > 0 && anchoTabla > anchoPantalla) {
            const escala = anchoPantalla / anchoTabla;

            scaler.style.transform = `scale(${escala})`;
            scaler.style.transformOrigin = "top left";

            tableModalTarget.style.width = `${anchoTabla * escala + 20}px`;
            tableModalTarget.style.height = `${altoTabla * escala + 20}px`;
          } else if (anchoTabla > 0) {
            tableModalTarget.style.width = `${anchoTabla + 20}px`;
            tableModalTarget.style.height = `${altoTabla + 20}px`;
          }
        }
      }, 30);
    }
  });

  if (closeModalBtn) {
    closeModalBtn.addEventListener("click", () => {
      if (modal) modal.style.display = "none";
    });
  }

  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.style.display = "none";
      }
    });
  }
}