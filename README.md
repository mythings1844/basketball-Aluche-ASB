Markdown
# 🏀 Aluche StreetBall — Web Oficial & Clasificación Dinámica

Aplicación web interactiva para la gestión y visualización de jornadas, resultados y tabla de clasificaciones en tiempo real del torneo **Aluche StreetBall**.

---

## 🚀 Características Principales

* **Fases y Jornadas dinámicas:** Navegación fluida por pestañas entre las 7 jornadas de fase regular, Semifinales y Gran Final.
* **Diseño Grid Adaptativo:** Disposición en cuadrícula de 2 columnas para jornadas regulares y vista apilada a ancho completo (`1fr`) para la Gran Final (Best of 3).
* **Cálculo de Clasificación Automático:** Motor en JavaScript que procesa los marcadores finalizados y genera la tabla de posiciones en tiempo real sin requerir una base de datos.
* **Sistema Oficial de Puntuación:** Reglas aplicadas de baloncesto (2 pts por victoria, 1 pt por derrota).
* **Criterios de Desempate:** Ordenación automática por Puntos (PTS), Diferencia de Puntos (DIF) y Puntos a Favor (PF).
* **UI/UX Deportiva:** Encabezados oscuros estilizados, insignias de equipo y leyendas explicativas.

---

## 📁 Estructura del Proyecto

```text
aluche-streetball/
├── index.html              # Estructura principal y contenedores HTML
├── static/
│   ├── css/
│   │   └── styles.css      # Estilos globales, grid de partidos y estilos de la tabla
│   └── js/
│       ├── data.js         # Estructura de datos de jornadas y marcadores
│       └── app.js          # Lógica de renderizado de jornadas y motor de la tabla
└── README.md


🛠️ Modos de Uso y Actualización de Resultados
Para actualizar los resultados del torneo, solo se debe modificar el archivo static/js/data.js. El sistema detecta los cambios y recalcula automáticamente la tabla de posiciones al cargar la página.

## Formato de Partido en data.js
Partido Pendiente:

## JavaScript
{ fecha: "Viernes, 07/08/2026 - 19:00", local: "Team Abrante", badgeLocal: "TA", visitante: "Vieja Guardia", badgeVisitante: "VG", marcador: "-- - --", cancha: "Cancha Principal" }
Partido Jugado:

JavaScript
{ fecha: "Viernes, 24/07/2026 - 19:00", local: "Team Abrante", badgeLocal: "TA", visitante: "Team Bichota", badgeVisitante: "TB", marcador: "78 - 65", cancha: "Cancha Principal" }

⚡ Motor de Cálculo (app.js)
El cálculo de la tabla opera mediante la función calcularYRenderizarTabla() con las siguientes reglas:

Filtrado: Ignora claves no numéricas (semis, final) y marcadores pendientes (-- - -- o VS).

Acumulación de Estadísticas: Suma Partidos Jugados (PJ), Puntos a Favor (PF) y Puntos en Contra (PC).

Puntuación:

Ganador: +2 PTS

Perdedor: +1 PT

Ordenación:

JavaScript
listaEquipos.sort((a, b) => {
  if (b.pts !== a.pts) return b.pts - a.pts;
  if (b.dif !== a.dif) return b.dif - a.dif;
  return b.pf - a.pf;
});
🎨 Personalización de Estilos (styles.css)
Encabezado Oscuro de la Tabla
CSS
.table-container table thead th {
  background-color: #0f172a !important;
  color: #ffffff !important;
  border-bottom: 2px solid #8b0000 !important;
}
Apilación de Tarjetas en la Gran Final
CSS
.matches-grid.full-width-stack {
  grid-template-columns: 1fr !important;
}
💻 Instalación y Ejecución Local
Clona el repositorio o descarga los archivos.

Abre el archivo index.html directamente en cualquier navegador web o despliega el directorio mediante un servidor estático (como GitHub Pages, Vercel o Live Server en VS Code).


Montar servidor de prueba en PS:

cd C:\Projects\Basketball

PS C:\Projects\Basketball> 

$listener = New-Object System.Net.HttpListener; $listener.Prefixes.Add("http://+:8000/"); try { $listener.Start() } catch { $listener.Prefixes.Clear(); $listener.Prefixes.Add("http://localhost:8000/"); $listener.Start() }; Write-Host "Servidor listo en el puerto 8000..."; while ($listener.IsListening) { $context = $listener.GetContext(); $req = $context.Request; $res = $context.Response; $path = Join-Path (Get-Location) ($req.Url.AbsolutePath.TrimStart('/')); if ((Test-Path $path -PathType Leaf) -eq $false) { $path = Join-Path (Get-Location) "index.html" }; $content = [System.IO.File]::ReadAllBytes($path); $res.ContentLength64 = $content.Length; $res.OutputStream.Write($content, 0, $content.Length); $res.Close() }

PS C:\WINDOWS\system32> New-NetFirewallRule -DisplayName "Servidor Local Solo Mi Movil" -Direction Inbound -Action Allow -Protocol TCP -LocalPort 8000 -RemoteAddress 192.168.1.182