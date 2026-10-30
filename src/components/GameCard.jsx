import { Link } from 'react-router-dom'
import GameCover from './GameCover.jsx'
import GameActions from './GameActions.jsx'
import { money, useStore } from '../context/StoreContext.jsx'

export default function GameCard({ game }) {
  const { owns } = useStore()
  const owned = owns(game.id)

  return (
    <article className="game-card">
      <Link to={`/game/${game.id}`} style={{ position: 'relative', display: 'block' }}>
        {owned && <span className="owned-ribbon">EN TU BIBLIOTECA</span>}
        <GameCover game={game} />
      </Link>
      <div className="card-body">
        <div className="card-meta">
          <span className="card-tag">{game.genre}</span>
          <span><span className="stars">★</span> {game.rating.toFixed(1)}</span>
        </div>
        <Link to={`/game/${game.id}`}><h3 className="card-title">{game.title}</h3></Link>
        <p className="hint">{game.tagline}</p>
        <div className="card-foot">
          <span className={`price${game.price === 0 ? ' free' : ''}`}>{owned ? '' : money(game.price)}</span>
          <GameActions game={game} size="sm" />
        </div>
      </div>
    </article>
  )
}
