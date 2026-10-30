# 🎮 SteamLite — Plataforma de distribución digital y mini-juegos

SPA hecha con **Vite + React**, **react-router-dom**, **Formik + Yup** y **localStorage**.
Catálogo de videojuegos web, carrito, pasarela de pago simulada y biblioteca personal con 6 mini-juegos jugables.

## ▶️ Cómo ejecutarlo en Visual Studio Code

1. Instala **Node.js (versión LTS)** desde https://nodejs.org (solo la primera vez).
2. Descomprime el ZIP y abre la carpeta `steamlite` con **Visual Studio Code** (`Archivo > Abrir carpeta`).
3. Abre la terminal integrada (`Ctrl + ñ`  o  `Terminal > Nueva terminal`) y ejecuta:

```bash
npm install
npm run dev
```

4. Se abrirá el navegador en **http://localhost:5173**. Si no se abre, copia esa dirección.

Para generar la versión final: `npm run build` (y `npm run preview` para probarla).

> Si usas **Visual Studio 2022** (no Code): abre la carpeta con `Archivo > Abrir > Carpeta` y ejecuta los mismos comandos desde `Ver > Terminal`.

## 🗂️ Estructura

```
steamlite/
├─ public/
│  └─ data/games.json        ← catálogo (títulos, precios, géneros, descripciones, rutas)
├─ src/
│  ├─ context/StoreContext   ← estado global: catálogo, carrito, biblioteca, récords (localStorage)
│  ├─ components/            ← Navbar, Footer, HeroCarousel, GameCard, SearchFilters, CheckoutForm...
│  ├─ pages/                 ← Home, GameDetail, Cart, Library, Play, NotFound
│  ├─ games/                 ← Snake, Breakout, Pong, Memory, 2048, SkyHop (Canvas / lógica JS)
│  ├─ App.jsx  main.jsx  index.css
```

## 🧭 Rutas

| Ruta | Descripción |
|------|-------------|
| `/` | Carrusel destacado, búsqueda en tiempo real, filtros por género y catálogo por categorías |
| `/game/:id` | Detalle, capturas, reseñas y acciones (Comprar / Jugar) |
| `/cart` | Resumen del pedido + pasarela de pago (Formik + Yup) |
| `/library` | Juegos adquiridos |
| `/play/:id` | Ejecuta el mini-juego dentro de la plataforma |

## ✅ Requisitos del proyecto cubiertos

- Vite + React, arquitectura modular y componentes reutilizables.
- `useEffect` para cargar el catálogo; `useState` para filtros, pestañas, carrusel, modales y juegos.
- Formulario de pago con **Formik** (estado) y **Yup** (reglas y mensajes de error visuales).
- Compra simulada → se guarda en **localStorage**; la tienda cambia el botón a **"Jugar"** / **"En tu biblioteca"**.
- Récords de cada juego guardados en localStorage.
- Diseño oscuro, responsive (móvil, tablet, escritorio).

## 🔀 Flujo Git sugerido para el equipo

```bash
git init && git add . && git commit -m "chore: proyecto base SteamLite"
git branch -M main
git checkout -b feature/catalogo      # trabajo de cada integrante en su rama
git checkout -b feature/carrito
git checkout -b feature/juegos
```

Sube cada rama a GitHub, abre **Pull Requests** hacia `main` (aprobados por un compañero) y usa **GitHub Projects**
con las columnas **To Do · In Progress · In Review · Done**, vinculando cada tarea a su Issue.
Sugerencia de reparto: *catálogo + juegos* (`src/games`, `games.json`, `SearchFilters`), *UI y rutas* (`App.jsx`, `pages`, `components`, `index.css`), *carrito y persistencia* (`StoreContext`, `Cart`, `CheckoutForm`, `Library`).

## 🧪 Datos de prueba para el pago

Cualquier tarjeta de 16 dígitos, por ejemplo `4242 4242 4242 4242`, vencimiento futuro (`12/29`) y CVV `123`. No se realiza ningún cargo real.

## 🛠️ Agregar un juego nuevo

1. Crea el componente en `src/games/MiJuego.jsx`.
2. Regístralo en `src/games/index.js`.
3. Añade su ficha en `public/data/games.json` (el `id` debe coincidir).
