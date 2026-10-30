import { Link } from 'react-router-dom'
import GameCover from '../components/GameCover.jsx'
import { useStore } from '../context/StoreContext.jsx'

export default function Library() {
  const { games, library, scores, loading } = useStore()
  if (loading) return <div className="loader"><div className="spinner" /></div>

  const owned = games.filter((g) => library.includes(g.id))

  return (
    <div className="container page">
      <div className="page-title">
        <h1>📚 Mi biblioteca</h1>
        <p>{owned.length} {owned.length === 1 ? 'juego' : 'juegos'} adquiridos</p>
      </div>

      {owned.length === 0 ? (
        <div className="empty">
          <div className="big">🎮</div>
          <h2>Aún no tienes juegos</h2>
          <p>Compra o reclama un juego gratis para empezar a jugar.</p>
          <Link to="/" className="btn btn-primary">Ir a la tienda</Link>
        </div>
      ) : (
        <div className="grid">
          {owned.map((g) => (
            <article className="game-card lib-card" key={g.id}>
              <Link to={`/game/${g.id}`}><GameCover game={g} /></Link>
              <div className="card-body">
                <div className="card-meta"><span className="card-tag">{g.genre}</span></div>
                <h3 className="card-title">{g.title}</h3>
                <span className="score-pill">🏆 Récord: {scores[g.id] ? `${scores[g.id]} pts` : 'sin jugar'}</span>
                <div className="card-foot">
                  <Link to={`/game/${g.id}`} className="btn btn-ghost btn-sm">Detalles</Link>
                  <Link to={`/play/${g.id}`} className="btn btn-play btn-sm">▶ Jugar</Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
