import { lazy } from 'react'

// Registro de mini-juegos: id del juego (games.json) → componente (carga diferida)
export const gameComponents = {
  snake: lazy(() => import('./Snake.jsx')),
  breakout: lazy(() => import('./Breakout.jsx')),
  pong: lazy(() => import('./Pong.jsx')),
  memory: lazy(() => import('./Memory.jsx')),
  2048: lazy(() => import('./Game2048.jsx')),
  skyhop: lazy(() => import('./SkyHop.jsx')),
}
