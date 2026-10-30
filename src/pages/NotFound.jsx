import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="container page">
      <div className="empty">
        <div className="big">👾</div>
        <h2>404 — Página no encontrada</h2>
        <p>Parece que te saliste del mapa.</p>
        <Link to="/" className="btn btn-primary">Volver a la tienda</Link>
      </div>
    </div>
  )
}
