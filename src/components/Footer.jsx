import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <span>© {new Date().getFullYear()} SteamLite · Proyecto Integrador Frontend</span>
        <div className="footer-links">
          <Link to="/">Tienda</Link>
          <Link to="/library">Biblioteca</Link>
          <Link to="/cart">Carrito</Link>
        </div>
      </div>
    </footer>
  )
}
