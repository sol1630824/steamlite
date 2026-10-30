import { Link } from 'react-router-dom'
import { useStore } from '../context/StoreContext.jsx'

// Botón dinámico: Comprar / En el carrito / Jugar (según carrito y biblioteca)
export default function GameActions({ game, size = '' }) {
  const { owns, inCart, addToCart, claimFree } = useStore()
  const sm = size === 'sm' ? ' btn-sm' : ''

  if (owns(game.id)) {
    return <Link to={`/play/${game.id}`} className={`btn btn-play${sm}`}>▶ Jugar</Link>
  }
  if (game.price === 0) {
    return <button className={`btn btn-primary${sm}`} onClick={() => claimFree(game.id)}>Obtener gratis</button>
  }
  if (inCart(game.id)) {
    return <Link to="/cart" className={`btn btn-ghost${sm}`}>✔ En el carrito</Link>
  }
  return <button className={`btn btn-primary${sm}`} onClick={() => addToCart(game.id)}>Añadir al carrito</button>
}
