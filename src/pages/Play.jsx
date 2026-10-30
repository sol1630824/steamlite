import { Suspense, useRef } from 'react'
import { Link, useParams } from 'react-router-dom'
import { gameComponents } from '../games/index.js'
import { useStore } from '../context/StoreContext.jsx'

export default function Play() {
  const { id } = useParams()
  const { getGame, owns, loading, scores, saveScore } = useStore()
  const stageRef = useRef(null)
  const game = getGame(id)

  if (loading) return <div className="loader"><div className="spinner" /></div>

  if (!game) {
    return (
      <div className="container page">
        <div className="empty"><div className="big">🔎</div><h2>Juego no encontrado</h2><Link to="/" className="btn btn-primary">Volver a la tienda</Link></div>
      </div>
    )
  }

  if (!owns(game.id)) {
    return (
      <div className="container page">
        <div className="empty">
          <div className="big">🔒</div>
          <h2>Aún no tienes {game.title}</h2>
          <p>Debes adquirir el juego para poder ejecutarlo.</p>
          <Link to={`/game/${game.id}`} className="btn btn-primary">Ver juego</Link>
        </div>
      </div>
    )
  }

  const GameComponent = gameComponents[game.id]
  const fullscreen = () => {
    const el = stageRef.current
    if (!el) return
    if (document.fullscreenElement) document.exitFullscreen()
    else el.requestFullscreen?.()
  }

  return (
    <div className="container page">
      <Link to="/library" className="back">← Volver a la biblioteca</Link>
      <div className="page-title"><h1>{game.icon} {game.title}</h1><p>{game.tagline}</p></div>

      <div className="play-layout">
        <div className="stage" ref={stageRef}>
          <Suspense fallback={<div className="loader"><div className="spinner" /><span>Cargando juego…</span></div>}>
            {GameComponent ? <GameComponent onScore={(s) => saveScore(game.id, s)} /> : <p>Este juego aún no está disponible.</p>}
          </Suspense>
        </div>

        <aside className="side">
          <div className="panel"><h3>🎮 Controles</h3><p>{game.controls}</p></div>
          <div className="panel"><h3>🏆 Tu récord</h3><p style={{ fontSize: '1.8rem', color: 'var(--warn)', fontWeight: 800 }}>{scores[game.id] || 0} pts</p></div>
          <button className="btn btn-ghost btn-block" onClick={fullscreen}>⛶ Pantalla completa</button>
        </aside>
      </div>
    </div>
  )
}
