import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import GameCover from '../components/GameCover.jsx'
import GameActions from '../components/GameActions.jsx'
import { money, useStore } from '../context/StoreContext.jsx'

const stars = (n) => '★'.repeat(Math.round(n)) + '☆'.repeat(5 - Math.round(n))

export default function GameDetail() {
  const { id } = useParams()
  const { getGame, loading, owns, scores } = useStore()
  const [tab, setTab] = useState('about')
  const game = getGame(id)

  if (loading) return <div className="loader"><div className="spinner" /></div>
  if (!game) {
    return (
      <div className="container page">
        <div className="empty"><div className="big">🔎</div><h2>Juego no encontrado</h2><p>Este juego no existe en el catálogo.</p><Link to="/" className="btn btn-primary">Volver a la tienda</Link></div>
      </div>
    )
  }

  const avg = game.reviews.length ? game.reviews.reduce((s, r) => s + r.rating, 0) / game.reviews.length : game.rating

  return (
    <div className="container page">
      <Link to="/" className="back">← Volver a la tienda</Link>

      <div className="detail-top">
        <GameCover game={game} size="lg" />
        <div className="detail-info">
          <span className="card-tag" style={{ alignSelf: 'flex-start' }}>{game.genre}</span>
          <h1>{game.title}</h1>
          <div><span className="stars">{stars(game.rating)}</span> <span className="hint">{game.rating.toFixed(1)} · {game.reviews.length} reseñas</span></div>
          <p style={{ color: '#c4cdea' }}>{game.tagline}</p>

          <div className="meta-list">
            <div className="meta-item"><small>Desarrollador</small>{game.developer}</div>
            <div className="meta-item"><small>Lanzamiento</small>{game.year}</div>
            <div className="meta-item"><small>Controles</small>{game.controls}</div>
            <div className="meta-item"><small>Tu récord</small>{scores[game.id] ? `${scores[game.id]} pts` : '—'}</div>
          </div>

          <div className="buy-box">
            {owns(game.id) ? <span className="price" style={{ color: 'var(--good)' }}>✔ En tu biblioteca</span> : <span className={`price${game.price === 0 ? ' free' : ''}`}>{money(game.price)}</span>}
            <GameActions game={game} />
          </div>
        </div>
      </div>

      <div className="tabs" role="tablist">
        {[['about', 'Acerca del juego'], ['shots', 'Capturas'], ['reviews', `Reseñas (${game.reviews.length})`]].map(([key, label]) => (
          <button key={key} role="tab" className={`tab${tab === key ? ' active' : ''}`} onClick={() => setTab(key)}>{label}</button>
        ))}
      </div>

      {tab === 'about' && (
        <div className="about"><p>{game.description}</p></div>
      )}

      {tab === 'shots' && (
        <div className="shots">
          {game.screenshots.map((s) => (
            <figure className="shot" key={s.caption}>
              <GameCover game={game} icon={s.icon} />
              <p>{s.caption}</p>
            </figure>
          ))}
        </div>
      )}

      {tab === 'reviews' && (
        <div className="reviews">
          <p className="hint">Valoración media: <b style={{ color: 'var(--text)' }}>{avg.toFixed(1)}</b> / 5</p>
          {game.reviews.map((r) => (
            <div className="review" key={r.user}>
              <div className="review-head"><span>{r.user}</span><span className="stars">{stars(r.rating)}</span></div>
              <p style={{ color: '#c4cdea' }}>{r.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
