import { useEffect, useRef, useState } from 'react'
import { Hud, drawMessage, roundRect } from './utils.jsx'

const N = 20
const C = 24
const W = N * C

const spawn = (snake) => {
  let p
  do {
    p = { x: Math.floor(Math.random() * N), y: Math.floor(Math.random() * N) }
  } while (snake.some((s) => s.x === p.x && s.y === p.y))
  return p
}

export default function Snake({ onScore }) {
  const canvasRef = useRef(null)
  const [run, setRun] = useState(0)
  const [score, setScore] = useState(0)
  const [best, setBest] = useState(0)
  const scoreCb = useRef(onScore)
  scoreCb.current = onScore

  useEffect(() => {
    const ctx = canvasRef.current.getContext('2d')

    const drawBg = () => {
      ctx.fillStyle = '#0b1020'
      ctx.fillRect(0, 0, W, W)
      ctx.strokeStyle = 'rgba(255,255,255,0.04)'
      ctx.lineWidth = 1
      for (let i = 0; i <= N; i++) {
        ctx.beginPath(); ctx.moveTo(i * C, 0); ctx.lineTo(i * C, W); ctx.stroke()
        ctx.beginPath(); ctx.moveTo(0, i * C); ctx.lineTo(W, i * C); ctx.stroke()
      }
    }

    if (run === 0) {
      drawBg()
      drawMessage(ctx, W, W, 'NEON SNAKE', 'Pulsa JUGAR para empezar')
      return
    }

    let snake = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }]
    let dir = { x: 1, y: 0 }
    let next = dir
    let food = spawn(snake)
    let sc = 0
    setScore(0)

    const draw = () => {
      drawBg()
      ctx.shadowColor = '#ff5d73'
      ctx.shadowBlur = 18
      ctx.fillStyle = '#ff5d73'
      ctx.beginPath()
      ctx.arc(food.x * C + C / 2, food.y * C + C / 2, C / 2 - 4, 0, Math.PI * 2)
      ctx.fill()
      ctx.shadowColor = '#3ddc97'
      ctx.shadowBlur = 12
      snake.forEach((s, i) => {
        ctx.fillStyle = i === 0 ? '#9dffd6' : `hsl(${160 - i * 2}, 80%, ${55 - Math.min(i, 20)}%)`
        roundRect(ctx, s.x * C + 2, s.y * C + 2, C - 4, C - 4, 7)
        ctx.fill()
      })
      ctx.shadowBlur = 0
    }

    const end = () => {
      clearInterval(timer)
      scoreCb.current(sc)
      setBest((b) => Math.max(b, sc))
      draw()
      drawMessage(ctx, W, W, 'FIN DEL JUEGO', `Puntos: ${sc} · Pulsa JUGAR de nuevo`)
    }

    const step = () => {
      dir = next
      const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y }
      if (head.x < 0 || head.y < 0 || head.x >= N || head.y >= N || snake.some((s) => s.x === head.x && s.y === head.y)) {
        end()
        return
      }
      snake.unshift(head)
      if (head.x === food.x && head.y === food.y) {
        sc += 10
        setScore(sc)
        food = spawn(snake)
      } else {
        snake.pop()
      }
      draw()
    }

    const onKey = (e) => {
      const map = {
        ArrowUp: [0, -1], w: [0, -1], W: [0, -1],
        ArrowDown: [0, 1], s: [0, 1], S: [0, 1],
        ArrowLeft: [-1, 0], a: [-1, 0], A: [-1, 0],
        ArrowRight: [1, 0], d: [1, 0], D: [1, 0],
      }
      const m = map[e.key]
      if (!m) return
      e.preventDefault()
      if (m[0] !== -dir.x || m[1] !== -dir.y) next = { x: m[0], y: m[1] }
    }

    // Soporte táctil: deslizar el dedo
    let touch = null
    const onTouchStart = (e) => { touch = { x: e.touches[0].clientX, y: e.touches[0].clientY } }
    const onTouchEnd = (e) => {
      if (!touch) return
      const dx = e.changedTouches[0].clientX - touch.x
      const dy = e.changedTouches[0].clientY - touch.y
      if (Math.max(Math.abs(dx), Math.abs(dy)) < 20) return
      const m = Math.abs(dx) > Math.abs(dy) ? [Math.sign(dx), 0] : [0, Math.sign(dy)]
      if (m[0] !== -dir.x || m[1] !== -dir.y) next = { x: m[0], y: m[1] }
      touch = null
    }

    const canvas = canvasRef.current
    window.addEventListener('keydown', onKey)
    canvas.addEventListener('touchstart', onTouchStart, { passive: true })
    canvas.addEventListener('touchend', onTouchEnd, { passive: true })
    const timer = setInterval(step, 105)
    draw()

    return () => {
      clearInterval(timer)
      window.removeEventListener('keydown', onKey)
      canvas.removeEventListener('touchstart', onTouchStart)
      canvas.removeEventListener('touchend', onTouchEnd)
    }
  }, [run])

  return (
    <>
      <Hud
        stats={[['Puntos', score], ['Mejor', best]]}
        buttonLabel={run === 0 ? '▶ JUGAR' : '↻ Reiniciar'}
        onButton={() => setRun((r) => r + 1)}
      />
      <div className="canvas-wrap">
        <canvas ref={canvasRef} className="game" width={W} height={W} style={{ width: 'min(480px, 100%)' }} />
      </div>
    </>
  )
}
