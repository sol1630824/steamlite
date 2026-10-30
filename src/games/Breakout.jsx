import { useEffect, useRef, useState } from 'react'
import { Hud, drawMessage, pointerPos, roundRect } from './utils.jsx'

const W = 640
const H = 480
const COLS = 10
const ROWS = 6
const BW = 58
const BH = 20
const GAP = 4
const LEFT = (W - (COLS * (BW + GAP) - GAP)) / 2
const TOP = 56
const ROW_COLORS = ['#ff5d73', '#ff9a3c', '#ffd24d', '#3ddc97', '#4cc9f0', '#7b5cff']

export default function Breakout({ onScore }) {
  const canvasRef = useRef(null)
  const [run, setRun] = useState(0)
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(3)
  const [best, setBest] = useState(0)
  const scoreCb = useRef(onScore)
  scoreCb.current = onScore

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    if (run === 0) {
      ctx.fillStyle = '#0b1020'
      ctx.fillRect(0, 0, W, H)
      drawMessage(ctx, W, H, 'BRICK BLASTER', 'Pulsa JUGAR para empezar')
      return
    }

    const bricks = []
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        bricks.push({ x: LEFT + c * (BW + GAP), y: TOP + r * (BH + GAP), row: r, alive: true })
      }
    }
    const paddle = { x: W / 2 - 50, w: 100, h: 12, y: H - 34 }
    const ball = { x: W / 2, y: paddle.y - 8, vx: 0, vy: 0, r: 7, launched: false }
    let sc = 0
    let lv = 3
    let speed = 5.2
    let state = 'playing'
    let left = 0
    let right = 0
    let raf
    let last = performance.now()
    setScore(0)
    setLives(3)

    const resetBall = () => {
      ball.launched = false
      ball.vx = 0
      ball.vy = 0
    }

    const launch = () => {
      if (state !== 'playing' || ball.launched) return
      ball.launched = true
      const a = (-Math.PI / 2) + (Math.random() * 0.6 - 0.3)
      ball.vx = Math.cos(a) * speed
      ball.vy = Math.sin(a) * speed
    }

    const finish = (won) => {
      state = won ? 'won' : 'over'
      scoreCb.current(sc)
      setBest((b) => Math.max(b, sc))
    }

    const update = (f) => {
      paddle.x += (right - left) * 8 * f
      paddle.x = Math.max(0, Math.min(W - paddle.w, paddle.x))

      if (!ball.launched) {
        ball.x = paddle.x + paddle.w / 2
        ball.y = paddle.y - ball.r - 1
        return
      }

      ball.x += ball.vx * f
      ball.y += ball.vy * f

      if (ball.x < ball.r) { ball.x = ball.r; ball.vx = Math.abs(ball.vx) }
      if (ball.x > W - ball.r) { ball.x = W - ball.r; ball.vx = -Math.abs(ball.vx) }
      if (ball.y < ball.r) { ball.y = ball.r; ball.vy = Math.abs(ball.vy) }

      // Paleta: el ángulo depende de dónde golpea
      if (ball.vy > 0 && ball.y + ball.r >= paddle.y && ball.y - ball.r <= paddle.y + paddle.h && ball.x >= paddle.x - 4 && ball.x <= paddle.x + paddle.w + 4) {
        const hit = (ball.x - (paddle.x + paddle.w / 2)) / (paddle.w / 2)
        const angle = hit * (Math.PI / 3)
        const s = Math.hypot(ball.vx, ball.vy)
        ball.vx = Math.sin(angle) * s
        ball.vy = -Math.cos(angle) * s
        ball.y = paddle.y - ball.r
      }

      // Ladrillos
      for (const b of bricks) {
        if (!b.alive) continue
        if (ball.x + ball.r > b.x && ball.x - ball.r < b.x + BW && ball.y + ball.r > b.y && ball.y - ball.r < b.y + BH) {
          b.alive = false
          sc += (ROWS - b.row) * 10
          setScore(sc)
          const ox = Math.min(ball.x + ball.r - b.x, b.x + BW - (ball.x - ball.r))
          const oy = Math.min(ball.y + ball.r - b.y, b.y + BH - (ball.y - ball.r))
          if (ox < oy) ball.vx *= -1
          else ball.vy *= -1
          const k = 1.012
          ball.vx *= k
          ball.vy *= k
          if (bricks.every((x) => !x.alive)) finish(true)
          break
        }
      }

      if (ball.y - ball.r > H) {
        lv -= 1
        setLives(lv)
        if (lv <= 0) finish(false)
        else resetBall()
      }
    }

    const draw = () => {
      ctx.fillStyle = '#0b1020'
      ctx.fillRect(0, 0, W, H)
      bricks.forEach((b) => {
        if (!b.alive) return
        ctx.fillStyle = ROW_COLORS[b.row]
        roundRect(ctx, b.x, b.y, BW, BH, 5)
        ctx.fill()
        ctx.fillStyle = 'rgba(255,255,255,0.22)'
        roundRect(ctx, b.x + 2, b.y + 2, BW - 4, 5, 3)
        ctx.fill()
      })
      const g = ctx.createLinearGradient(paddle.x, 0, paddle.x + paddle.w, 0)
      g.addColorStop(0, '#4cc9f0')
      g.addColorStop(1, '#7b5cff')
      ctx.fillStyle = g
      ctx.shadowColor = '#4cc9f0'
      ctx.shadowBlur = 14
      roundRect(ctx, paddle.x, paddle.y, paddle.w, paddle.h, 6)
      ctx.fill()
      ctx.fillStyle = '#fff'
      ctx.shadowColor = '#fff'
      ctx.beginPath()
      ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2)
      ctx.fill()
      ctx.shadowBlur = 0
      if (!ball.launched && state === 'playing') {
        ctx.textAlign = 'center'
        ctx.fillStyle = '#8e9ac0'
        ctx.font = '500 15px Inter, sans-serif'
        ctx.fillText('Espacio o clic para lanzar', W / 2, H - 60)
      }
      if (state === 'won') drawMessage(ctx, W, H, '¡VICTORIA!', `Puntos: ${sc} · Pulsa JUGAR de nuevo`)
      if (state === 'over') drawMessage(ctx, W, H, 'FIN DEL JUEGO', `Puntos: ${sc} · Pulsa JUGAR de nuevo`)
    }

    const loop = (now) => {
      const f = Math.min((now - last) / 16.67, 3)
      last = now
      if (state === 'playing') update(f)
      draw()
      if (state === 'playing') raf = requestAnimationFrame(loop)
      else draw()
    }

    const onKeyDown = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') { left = 1; e.preventDefault() }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') { right = 1; e.preventDefault() }
      if (e.key === ' ') { e.preventDefault(); launch() }
    }
    const onKeyUp = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') left = 0
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') right = 0
    }
    const onMove = (e) => {
      const p = pointerPos(canvas, e)
      paddle.x = Math.max(0, Math.min(W - paddle.w, p.x - paddle.w / 2))
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    canvas.addEventListener('mousemove', onMove)
    canvas.addEventListener('touchmove', onMove, { passive: true })
    canvas.addEventListener('click', launch)
    canvas.addEventListener('touchstart', launch, { passive: true })
    raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      canvas.removeEventListener('mousemove', onMove)
      canvas.removeEventListener('touchmove', onMove)
      canvas.removeEventListener('click', launch)
      canvas.removeEventListener('touchstart', launch)
    }
  }, [run])

  return (
    <>
      <Hud
        stats={[['Puntos', score], ['Vidas', '❤️'.repeat(Math.max(lives, 0)) || '💀'], ['Mejor', best]]}
        buttonLabel={run === 0 ? '▶ JUGAR' : '↻ Reiniciar'}
        onButton={() => setRun((r) => r + 1)}
      />
      <div className="canvas-wrap">
        <canvas ref={canvasRef} className="game" width={W} height={H} style={{ width: 'min(640px, 100%)' }} />
      </div>
    </>
  )
}
