import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'

const StoreContext = createContext(null)

const KEYS = {
  cart: 'steamlite_cart',
  library: 'steamlite_library',
  scores: 'steamlite_scores',
}

// Lectura segura de localStorage (evita errores si el JSON está dañado)
const read = (key, fallback) => {
  try {
    const value = localStorage.getItem(key)
    return value ? JSON.parse(value) : fallback
  } catch {
    return fallback
  }
}

export function StoreProvider({ children }) {
  const [games, setGames] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [cart, setCart] = useState(() => read(KEYS.cart, []))
  const [library, setLibrary] = useState(() => read(KEYS.library, []))
  const [scores, setScores] = useState(() => read(KEYS.scores, {}))
  const [toast, setToast] = useState(null)
  const toastTimer = useRef(null)

  // Carga inicial del catálogo
  useEffect(() => {
    let alive = true
    fetch(`${import.meta.env.BASE_URL}data/games.json`)
      .then((res) => {
        if (!res.ok) throw new Error('Error al cargar el catálogo')
        return res.json()
      })
      .then((data) => {
        if (alive) {
          setGames(data)
          setLoading(false)
        }
      })
      .catch(() => {
        if (alive) {
          setError('No se pudo cargar el catálogo de juegos.')
          setLoading(false)
        }
      })
    return () => {
      alive = false
    }
  }, [])

  // Persistencia
  useEffect(() => {
  localStorage.setItem(KEYS.cart, JSON.stringify(cart))}, [cart])
  useEffect(() => {
  localStorage.setItem(KEYS.library, JSON.stringify(library))}, [library])
  useEffect(() => {
  localStorage.setItem(KEYS.scores, JSON.stringify(scores))}, [scores])

  const showToast = useCallback((message) => {
    setToast(message)
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 2400)
  }, [])

  const getGame = useCallback((id) => games.find((g) => g.id === id), [games])
  const owns = useCallback((id) => library.includes(id), [library])
  const inCart = useCallback((id) => cart.includes(id), [cart])

  const addToCart = useCallback(
    (id) => {
      if (library.includes(id) || cart.includes(id)) return
      setCart((c) => [...c, id])
      const g = games.find((x) => x.id === id)
      showToast(`🛒 ${g ? g.title : 'Juego'} añadido al carrito`)
    },
    [library, cart, games, showToast],
  )

  const removeFromCart = useCallback((id) => setCart((c) => c.filter((x) => x !== id)), [])

  // Juegos gratuitos: van directo a la biblioteca
  const claimFree = useCallback(
    (id) => {
      setLibrary((l) => (l.includes(id) ? l : [...l, id]))
      const g = games.find((x) => x.id === id)
      showToast(`🎉 ${g ? g.title : 'Juego'} añadido a tu biblioteca`)
    },
    [games, showToast],
  )

  // Simulación de compra exitosa: el carrito pasa a la biblioteca
  const checkout = useCallback(() => {
    const bought = cart
    setLibrary((l) => [...new Set([...l, ...bought])])
    setCart([])
    return bought
  }, [cart])

  const saveScore = useCallback((id, value) => {
    setScores((s) => (value > (s[id] || 0) ? { ...s, [id]: value } : s))
  }, [])

  const cartGames = useMemo(() => cart.map((id) => games.find((g) => g.id === id)).filter(Boolean), [cart, games])
  const subtotal = useMemo(() => cartGames.reduce((sum, g) => sum + g.price, 0), [cartGames])

  const value = {
    games, loading, error,
    cart, cartGames, subtotal, library, scores, toast,
    getGame, owns, inCart,
    addToCart, removeFromCart, claimFree, checkout, saveScore, showToast,
  }

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export const useStore = () => {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore debe usarse dentro de StoreProvider')
  return ctx
}

export const money = (n) => (n === 0 ? 'Gratis' : `$${n.toFixed(2)}`)
