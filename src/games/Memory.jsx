import { useEffect, useRef, useState } from 'react'
import { Hud } from './utils.jsx'

const SYMBOLS = ['🚀', '👾', '🎮', '🕹️', '👑', '⭐', '🔥', '💎']

const shuffle = () =>
  [...SYMBOLS, ...SYMBOLS]
    .map((s, i) => ({ id: i, s, r: Math.random() }))
    .sort((a, b) => a.r - b.r)
    .map(({ id, s }) => ({ id, s }))

export default function Memory({ onScore }) {
  const [cards, setCards] = useState(shuffle)
  const [flipped, setFlipped] = useState([])
  const [matched, setMatched] = useState([])
  const [moves, setMoves] = useState(0)
  const [seconds, setSeconds] = useState(0)
  const [started, setStarted] = useState(false)
  const [best, setBest] = useState(0)
  const [lock, setLock] = useState(false)
  const scoreCb = useRef(onScore)
  scoreCb.current = onScore

  const won = matched.length === cards.length

  // Cronómetro
  useEffect(() => {
    if (!started || won) return
    const t = setInterval(() => setSeconds((s) => s + 1), 1000)
    return () => clearInterval(t)
  }, [started, won])

  // Puntuación al ganar
  useEffect(() => {
    if (!won) return
    const pts = Math.max(100, 1000 - moves * 20 - seconds * 5)
    scoreCb.current(pts)
    setBest((b) => Math.max(b, pts))
  }, [won]) // eslint-disable-line react-hooks/exhaustive-deps

  const flip = (i) => {
    if (lock || flipped.includes(i) || matched.includes(i) || won) return
    setStarted(true)
    const nf = [...flipped, i]
    setFlipped(nf)
    if (nf.length === 2) {
      setMoves((m) => m + 1)
      setLock(true)
      const [a, b] = nf
      if (cards[a].s === cards[b].s) {
        setMatched((m) => [...m, a, b])
        setFlipped([])
        setLock(false)
      } else {
        setTimeout(() => { setFlipped([]); setLock(false) }, 800)
      }
    }
  }

  const restart = () => {
    setCards(shuffle())
    setFlipped([]); setMatched([]); setMoves(0); setSeconds(0); setStarted(false); setLock(false)
  }

  const finalScore = Math.max(100, 1000 - moves * 20 - seconds * 5)

  return (
    <>
      <Hud
        stats={[['Movimientos', moves], ['Tiempo', `${seconds}s`], ['Mejor', best]]}
        buttonLabel="↻ Reiniciar"
        onButton={restart}
      />
      <div style={{ position: 'relative', width: 'min(440px, 100%)' }}>
        <div className="mem-grid" style={{ width: '100%' }}>
          {cards.map((c, i) => {
            const isFlipped = flipped.includes(i) || matched.includes(i)
            return (
              <button
                key={c.id}
                className={`mem-card${isFlipped ? ' flipped' : ''}${matched.includes(i) ? ' matched' : ''}`}
                onClick={() => flip(i)}
                aria-label={isFlipped ? c.s : 'Carta oculta'}
              >
                <div className="mem-inner">
                  <div className="mem-face mem-front">?</div>
                  <div className="mem-face mem-back">{c.s}</div>
                </div>
              </button>
            )
          })}
        </div>
        {won && (
          <div className="overlay-msg">
            <h3>🎉 ¡Completado!</h3>
            <p className="hint">{moves} movimientos · {seconds}s · {finalScore} pts</p>
            <button className="btn btn-primary" onClick={restart}>Jugar de nuevo</button>
          </div>
        )}
      </div>
    </>
  )
}
