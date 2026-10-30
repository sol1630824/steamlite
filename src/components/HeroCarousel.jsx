import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import GameActions from './GameActions.jsx'
import { money } from '../context/StoreContext.jsx'

export default function HeroCarousel({ games }) {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const total = games.length

  useEffect(() => {
    if (paused || total < 2) return
    const timer = setInterval(() => setIndex((i) => (i + 1) % total), 6000)
    return () => clearInterval(timer)
  }, [paused, total])

  if (total === 0) return null
  const go = (n) => setIndex((n + total) % total)

  return (
    <section
      className="hero"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-label="Juegos destacados"
    >
      {games.map((g, i) => (
        <div
          key={g.id}
          className={`hero-slide${i === index ? ' active' : ''}`}
          style={{ '--c1': g.colors[0], '--c2': g.colors[1] }}
          aria-hidden={i !== index}
        >
          <div className="hero-text">
            <span className="hero-tag">⭐ Destacado · {g.genre}</span>
            <h1>{g.title}</h1>
            <p>{g.tagline} {g.description.split('.')[0]}.</p>
            <div className="hero-actions">
              <span className="hero-price">{money(g.price)}</span>
              <GameActions game={g} />
              <Link to={`/game/${g.id}`} className="btn btn-ghost">Ver detalles</Link>
            </div>
          </div>
          <div className="hero-art">{g.icon}</div>
        </div>
      ))}

      <button className="hero-nav prev" onClick={() => go(index - 1)} aria-label="Anterior">‹</button>
      <button className="hero-nav next" onClick={() => go(index + 1)} aria-label="Siguiente">›</button>
      <div className="hero-dots">
        {games.map((g, i) => (
          <button key={g.id} className={`dot${i === index ? ' active' : ''}`} onClick={() => setIndex(i)} aria-label={`Ir a ${g.title}`} />
        ))}
      </div>
    </section>
  )
}
