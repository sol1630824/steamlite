import { useCallback, useEffect, useRef, useState } from 'react'
import { Hud } from './utils.jsx'

const empty = () => Array.from({ length: 4 }, () => Array(4).fill(0))

const addTile = (board) => {
  const free = []
  board.forEach((row, r) => row.forEach((v, c) => { if (!v) free.push([r, c]) }))
  if (!free.length) return board
  const [r, c] = free[Math.floor(Math.random() * free.length)]
  const next = board.map((row) => [...row])
  next[r][c] = Math.random() < 0.9 ? 2 : 4
  return next
}

const newBoard = () => addTile(addTile(empty()))

const slideLeft = (row) => {
  const a = row.filter(Boolean)
  let gained = 0
  for (let i = 0; i < a.length - 1; i++) {
    if (a[i] === a[i + 1]) {
      a[i] *= 2
      gained += a[i]
      a.splice(i + 1, 1)
    }
  }
  while (a.length < 4) a.push(0)
  return [a, gained]
}

const transpose = (b) => b[0].map((_, c) => b.map((row) => row[c]))

const move = (board, dir) => {
  let b = board.map((r) => [...r])
  if (dir === 'up' || dir === 'down') b = transpose(b)
  if (dir === 'right' || dir === 'down') b = b.map((r) => r.reverse())
  let gained = 0
  b = b.map((r) => {
    const [n, g] = slideLeft(r)
    gained += g
    return n
  })
  if (dir === 'right' || dir === 'down') b = b.map((r) => r.reverse())
  if (dir === 'up' || dir === 'down') b = transpose(b)
  return { board: b, gained, moved: JSON.stringify(b) !== JSON.stringify(board) }
}

const canMove = (board) => ['left', 'right', 'up', 'down'].some((d) => move(board, d).moved)

export default function Game2048({ onScore }) {
  const [board, setBoard] = useState(newBoard)
  const [score, setScore] = useState(0)
  const [best, setBest] = useState(0)
  const [over, setOver] = useState(false)
  const boardRef = useRef(null)
  const scoreCb = useRef(onScore)
  scoreCb.current = onScore
  const scoreRef = useRef(0)

  const play = useCallback(
    (dir) => {
      if (over) return
      const res = move(board, dir)
      if (!res.moved) return
      const nb = addTile(res.board)
      const ns = scoreRef.current + res.gained
      scoreRef.current = ns
      setBoard(nb)
      setScore(ns)
      setBest((b) => Math.max(b, ns))
      scoreCb.current(ns)
      if (!canMove(nb)) setOver(true)
    },
    [board, over],
  )

  useEffect(() => {
    const onKey = (e) => {
      const map = { ArrowLeft: 'left', a: 'left', A: 'left', ArrowRight: 'right', d: 'right', D: 'right', ArrowUp: 'up', w: 'up', W: 'up', ArrowDown: 'down', s: 'down', S: 'down' }
      const dir = map[e.key]
      if (dir) { e.preventDefault(); play(dir) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [play])

  // Deslizar con el dedo
  useEffect(() => {
    const el = boardRef.current
    let start = null
    const ts = (e) => { start = { x: e.touches[0].clientX, y: e.touches[0].clientY } }
    const te = (e) => {
      if (!start) return
      const dx = e.changedTouches[0].clientX - start.x
      const dy = e.changedTouches[0].clientY - start.y
      if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return
      play(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : dy > 0 ? 'down' : 'up')
      start = null
    }
    el.addEventListener('touchstart', ts, { passive: true })
    el.addEventListener('touchend', te, { passive: true })
    return () => {
      el.removeEventListener('touchstart', ts)
      el.removeEventListener('touchend', te)
    }
  }, [play])

  const restart = () => {
    scoreRef.current = 0
    setBoard(newBoard())
    setScore(0)
    setOver(false)
  }

  return (
    <>
      <Hud stats={[['Puntos', score], ['Mejor', best]]} buttonLabel="↻ Nueva partida" onButton={restart} />
      <div className="board" ref={boardRef}>
        {board.flat().map((v, i) => (
          <div key={i} className={`tile${v ? ` t${v}` : ''}`}>{v || ''}</div>
        ))}
        {over && (
          <div className="overlay-msg">
            <h3>Sin movimientos</h3>
            <p className="hint">Puntos: {score}</p>
            <button className="btn btn-primary" onClick={restart}>Jugar de nuevo</button>
          </div>
        )}
      </div>
    </>
  )
}
