import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useStore } from '../context/StoreContext.jsx'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const { cart, library } = useStore()
  const close = () => setOpen(false)
  const cls = ({ isActive }) => `nav-link${isActive ? ' active' : ''}`

  return (
    <header className="navbar">
      <div className="container nav-inner">
        <Link to="/" className="logo" onClick={close}>
          <span className="logo-mark">🎮</span>
          Steam<b>Lite</b>
        </Link>

        <nav className={`nav-links${open ? ' open' : ''}`}>
          <NavLink to="/" end className={cls} onClick={close}>Tienda</NavLink>
          <NavLink to="/library" className={cls} onClick={close}>
            Biblioteca{library.length > 0 && <span className="badge">{library.length}</span>}
          </NavLink>
          <NavLink to="/cart" className={cls} onClick={close}>
            🛒 Carrito{cart.length > 0 && <span className="badge">{cart.length}</span>}
          </NavLink>
        </nav>

        <button className="burger" aria-label="Menú" onClick={() => setOpen((o) => !o)}>
          {open ? '✕' : '☰'}
        </button>
      </div>
    </header>
  )
}
