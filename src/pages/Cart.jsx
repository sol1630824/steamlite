import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import GameCover from '../components/GameCover.jsx'
import CheckoutForm from '../components/CheckoutForm.jsx'
import { money, useStore } from '../context/StoreContext.jsx'

export default function Cart() {
  const { cartGames, subtotal, removeFromCart, checkout, loading } = useStore()
  const [receipt, setReceipt] = useState(null) // modal de compra exitosa
  const navigate = useNavigate()

  if (loading) return <div className="loader"><div className="spinner" /></div>

  const handlePay = () => {
    const items = cartGames
    checkout()
    setReceipt(items)
  }

  return (
    <div className="container page">
      <div className="page-title">
        <h1>🛒 Tu carrito</h1>
        <p>{cartGames.length} {cartGames.length === 1 ? 'juego' : 'juegos'}</p>
      </div>

      {cartGames.length === 0 && !receipt ? (
        <div className="empty">
          <div className="big">🛍️</div>
          <h2>Tu carrito está vacío</h2>
          <p>Explora el catálogo y añade tus juegos favoritos.</p>
          <Link to="/" className="btn btn-primary">Explorar tienda</Link>
        </div>
      ) : (
        <div className="cart-layout">
          <section className="panel">
            <h2>Resumen del pedido</h2>
            {cartGames.map((g) => (
              <div className="cart-item" key={g.id}>
                <GameCover game={g} size="sm" />
                <div className="cart-item-info">
                  <Link to={`/game/${g.id}`}><h3>{g.title}</h3></Link>
                  <small>{g.genre}</small>
                </div>
                <span className="price">{money(g.price)}</span>
                <button className="btn btn-danger btn-sm" onClick={() => removeFromCart(g.id)} aria-label={`Quitar ${g.title}`}>✕</button>
              </div>
            ))}
            <div className="totals">
              <div><span>Subtotal ({cartGames.length})</span><span>${subtotal.toFixed(2)}</span></div>
              <div className="total"><span>Total</span><span>${subtotal.toFixed(2)}</span></div>
            </div>
          </section>

          <section className="panel">
            <h2>Pasarela de pago</h2>
            <CheckoutForm total={subtotal} onPay={handlePay} />
          </section>
        </div>
      )}

      {receipt && (
        <div className="modal-bg" role="dialog" aria-modal="true">
          <div className="modal">
            <div className="big">🎉</div>
            <h2>¡Compra exitosa!</h2>
            <p>Tus juegos ya están disponibles en tu biblioteca.</p>
            <ul>{receipt.map((g) => <li key={g.id}>{g.icon} {g.title}</li>)}</ul>
            <button className="btn btn-play btn-block" onClick={() => navigate('/library')}>Ir a mi biblioteca</button>
          </div>
        </div>
      )}
    </div>
  )
}
