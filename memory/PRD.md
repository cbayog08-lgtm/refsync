# RefSync OS — PRD

## Problem Statement (original)
App prototipo tipo smartwatch para árbitros de fútbol. Formato reloj REDONDO (Wear OS/watchOS), fondo negro puro (#000000), alto contraste. Cronómetro gigante que cuenta hacia arriba hasta el tope de cada parte. Pausa/Reanudar que al pausar activa un cronómetro secundario de "Tiempo Añadido". Tres botones grandes: Verde "+GOL", Amarillo "TARJETA", Azul "CAMBIO". Registro de goles (dorsal+equipo), tarjetas (dorsal 1-99, amarilla/roja) con vibración, y cambios (dorsal sale/entra + equipo). Resumen con "Fin de Partido".

## Stack / Architecture
- Frontend: Expo Router (React Native), formato reloj redondo vía `WatchScreen`. Fuentes: Bebas Neue (display) + DM Sans. Iconos Phosphor. React Query para datos de servidor. Estado del partido y cronómetro en `src/context/match.tsx`. Overlay de avisos global (`NoticeOverlay`).
- Backend: FastAPI + MongoDB (Motor). Modelos `Match` (category, half_duration_min, status) y `Event` (goal/card/substitution, minute, added_minute, team, dorsal, card_color, dorsal_out/in, reason). Rutas bajo `/api`.
- Sin autenticación.

## User Persona
Árbitro de fútbol que necesita controlar el partido desde el reloj: cronómetro, tarjetas, goles, cambios y acta final.

## Core Requirements (static)
1. UI reloj redonda, negro OLED, alto contraste.
2. Cronómetro cuenta arriba hasta el tope de la categoría; pausa activa tiempo añadido.
3. Botones GOL / TARJETA / CAMBIO con vibración al guardar.
4. Selección de categoría pre-partido (duración por parte).
5. Lógica arbitral: doble amarilla → roja automática + aviso EXPULSIÓN; 5 expulsiones/equipo → aviso PARTIDO SUSPENDIDO.
6. FIN DE PARTIDO no borra datos: archiva en historial y muestra acta.

## Implemented (2026-06)
- [x] Cronómetro principal (tope por categoría) + tiempo añadido al pausar.
- [x] Registro GOL (dorsal + equipo Local/Visitante) con marcador en vivo.
- [x] Registro TARJETA: numpad dorsal 1-99 → amarilla/roja, guarda evento con minuto, vibra.
- [x] Registro CAMBIO: dorsal sale + entra + equipo + minuto.
- [x] Resumen en vivo con lista de eventos.
- [x] Formato reloj redondo (Wear OS/watchOS) en todas las pantallas.
- [x] Selección de categoría: Alevín 2x30', Infantil 2x35', Cadete 2x40', Juvenil/Aficionado 2x45'.
- [x] Doble amarilla → roja automática (reason=double_yellow) + overlay EXPULSIÓN.
- [x] Roja directa → overlay EXPULSIÓN.
- [x] 5 expulsiones por equipo → overlay PARTIDO SUSPENDIDO.
- [x] FIN DE PARTIDO archiva (status=finished) sin borrar; navega al acta.
- [x] Historial de partidos finalizados + acta con marcador/eventos y exportar (Share).
- [x] Testing agent: backend 23/23 pytest; flujos frontend validados.

## Backlog / Next
- P2: Estadísticas por jugador / minutos jugados.
- P2: Exportar acta a PDF y compartir por email.
- P2: Segunda parte / descanso con reinicio de reloj de parte.

## Iteración 5 (2026-06)
- [x] Arquitectura dual en una app Expo: selector Modo Reloj / Modo Móvil al abrir.
- [x] Sincronización vía backend con código de 6 dígitos (pair_code); el JSON del partido incluye equipos, colores, categoría y alineaciones.
- [x] Modo Móvil: configura y muestra pantalla SINCRONIZAR con el código + acceso a Historial.
- [x] Modo Reloj: carga por código (pantalla emparejar) o funciona autónomo (partido nuevo).
- [x] Exportación del acta en PDF real (expo-print + expo-sharing).
- [x] i18n Español/Portugués con provider, archivos es.json/pt.json y selector en Ajustes; pantallas principales traducidas.
- [x] Testing agent: backend 29/29; flujos de sync/PDF/idioma verdes.

## Iteración 4 (2026-06)
- [x] FIX tiempo añadido: botones +/- funcionales, valor en pastilla amarilla de alto contraste "+N MIN".
- [x] FIX scroll: resumen, acta e historial a pantalla completa (ListScreen) con scroll fluido, sin recortes.
- [x] Motivo de tarjeta por siglas (Amarillas AP/PR/JP/DT/C, Rojas DOGSO/JVG/CD/INS) guardado en el acta.
- [x] Control de expulsados: dorsal expulsado no admite más tarjetas ni entra/sale en cambios.
- [x] Alineaciones con titulares y reservas; los cambios actualizan el once en campo.
- [x] Paleta ampliada a 16 colores + nombres de equipo editables; distintivo de color en marcador y selectores.
- [x] Testing agent: backend 23/23; 8/8 mejoras frontend verdes.

- [x] FIX: pantalla de partido rediseñada en 2 pestañas (Tiempo+Marcador / Acciones) con indicadores tocables y swipe; sin solapamientos.
- [x] Configuración pre-partido `setup`: nombre + color (paleta de 8) para Local y Visitante; distintivo de color en marcador y selectores.
- [x] Normativa de cambios por categoría: Alevín/Infantil/Cadete ilimitados; Juvenil/Aficionado máx 5 cambios / 3 ventanas con avisos (6º cambio, 4ª ventana).
- [x] Tiempo añadido manual (stepper +/-) en la pestaña de tiempo.
- [x] Modo Plantilla opcional: `lineup` para titulares+banca; en GOL/TARJETA/CAMBIO se eligen jugadores en campo (PlayerGrid) y los cambios actualizan la alineación.
- [x] Backend: Match guarda home_color/away_color; acta/historial muestran nombres y colores.
- [x] Testing agent: backend 23/23; 11/11 flujos frontend verdes.

