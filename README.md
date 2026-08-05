# 🏀 Aluche StreetBall — Web Oficial & Clasificación Dinámica


## 📁 Estructura del Proyecto

aluche-streetball/
├── index.html            # Estructura principal y contenedores HTML
├── static/
│   ├── css/
│   │   └── styles.css    # Estilos globales, grid de partidos y diseño de la tabla
│   └── js/
│       ├── data.js       # Estructura de datos de jornadas y marcadores
│       └── app.js        # Lógica de renderizado de jornadas y motor de la tabla
└── README.md             # Documentación del proyecto


> Aplicación web interactiva para la gestión y visualización en tiempo real de jornadas, resultados y tabla de posiciones del torneo **Aluche StreetBall**.

---

## 🚀 Características Principales

* 📅 **Fases y Jornadas dinámicas:** Navegación fluida mediante pestañas entre las 7 jornadas de la fase regular, Semifinales y Gran Final.
* 📐 **Diseño Grid Adaptativo:** Layout en cuadrícula de 2 columnas para jornadas regulares y vista apilada a ancho completo (`1fr`) para la Gran Final *(Best of 3)*.
* ⚡ **Cálculo de Clasificación Automático:** Motor en JavaScript que procesa los marcadores finalizados y genera la tabla de posiciones en tiempo real sin necesidad de base de datos.
* 🏆 **Sistema Oficial de Puntuación:** Reglas oficiales de baloncesto aplicadas (2 pts por victoria, 1 pt por derrota).
* ⚖️ **Criterios de Desempate:** Ordenación automática por **Puntos (PTS)**, **Diferencia de Puntos (DIF)** y **Puntos a Favor (PF)**.
* 🎨 **UI/UX Deportiva:** Encabezados oscuros estilizados, insignias de equipo, tarjetas de partidos y leyendas explicativas.

🛠️ Modos de Uso y Actualización de Resultados
Para actualizar los resultados del torneo, solo se debe modificar el archivo static/js/data.js. El sistema detecta los cambios y recalcula automáticamente la tabla de posiciones al cargar la página.

## Formato de Partido en data.js
Partido Pendiente:

##  🛠️ Integración con Google Drive & Google Sheets Para actualizar los resultados sin tocar el código fuente, la aplicación sincroniza la información desde una hoja de cálculo en Google Drive.

1. Formato de la Hoja de Cálculo (Google Sheets)La hoja de trabajo debe incluir la siguiente estructura de columnas en su primera pestaña: ID | Local | Marcador

2. Métodos de Publicación
Opción A: Publicación Estándar CSV (Refresco en ~5 minutos)
Ve a Archivo > Compartir > Publicar en la web.

Selecciona la hoja de marcadores y elige el formato Valores separados por comas (.csv).

Copia el enlace generado y pégalo en la constante SHEET_CSV_URL de app.js.

## JavaScript (Resultadas Manuales)
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

💻 Instalación y Ejecución Local
Clona el repositorio o descarga los archivos.

💻 Montar servidor de prueba en PS:

cd C:\Projects\Basketball

PS C:\Projects\Basketball> 

$listener = New-Object System.Net.HttpListener; $listener.Prefixes.Add("http://+:8000/"); try { $listener.Start() } catch { $listener.Prefixes.Clear(); $listener.Prefixes.Add("http://localhost:8000/"); $listener.Start() }; Write-Host "Servidor listo en el puerto 8000..."; while ($listener.IsListening) { $context = $listener.GetContext(); $req = $context.Request; $res = $context.Response; $path = Join-Path (Get-Location) ($req.Url.AbsolutePath.TrimStart('/')); if ((Test-Path $path -PathType Leaf) -eq $false) { $path = Join-Path (Get-Location) "index.html" }; $content = [System.IO.File]::ReadAllBytes($path); $res.ContentLength64 = $content.Length; $res.OutputStream.Write($content, 0, $content.Length); $res.Close() }

PS C:\WINDOWS\system32> New-NetFirewallRule -DisplayName "Servidor Local Solo Mi Movil" -Direction Inbound -Action Allow -Protocol TCP -LocalPort 8000 -RemoteAddress 192.168.1.182
