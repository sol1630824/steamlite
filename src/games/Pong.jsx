import { useEffect, useRef, useState } from 'react'
import { Hud, drawMessage, pointerPos, roundRect } from './utils.jsx'

const W = 640
const H = 400
const PW = 12
const PH = 78
const WIN = 7

export default function Pong({ onScore }) {
  const canvasRef = useRef(null)
  const [run, setRun] = useState(0)
  const [you, setYou] = useState(0)
  const [cpu, setCpu] = useState(0)
  const [best, setBest] = useState(0)
  const scoreCb = useRef(onScore)
  scoreCb.current = onScore

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    if (run === 0) {
      ctx.fillStyle = '#0b1020'
      ctx.fillRect(0, 0, W, H)
      drawMessage(ctx, W, H, 'PONG PRO', `Primero en llegar a ${WIN} puntos gana`)
      return
    }

    const player = { y: H / 2 - PH / 2 }
    const ai = { y: H / 2 - PH / 2 }
    const ball = { x: W / 2, y: H / 2, vx: 0, vy: 0, r: 8 }
    let a = 0
    let b = 0
    let up = 0
    let down = 0
    let state = 'playing'
    let serveDelay = 60
    let raf
    let last = performance.now()
    setYou(0)
    setCpu(0)

    const serve = (dir) => {
      ball.x = W / 2
      ball.y = H / 2
      const ang = (Math.random() * 0.8 - 0.4)
      const s = 5
      ball.vx = Math.cos(ang) * s * dir
      ball.vy = Math.sin(ang) * s
      serveDelay = 60
    }
    serve(Math.random() < 0.5 ? 1 : -1)

    const finish = () => {
      state = 'over'
      const total = a * 100 + (a > b ? 500 : 0)
      scoreCb.current(total)
      setBest((x) => Math.max(x, total))
    }

    const update = (f) => {
      player.y += (down - up) * 7 * f
      player.y = Math.max(0, Math.min(H - PH, player.y))

      // IA con velocidad limitada (se puede vencer)
      const target = ball.y - PH / 2
      const maxMove = 4.2 * f
      ai.y += Math.max(-maxMove, Math.min(maxMove, target - ai.y))
      ai.y = Math.max(0, Math.min(H - PH, ai.y))

      if (serveDelay > 0) { serveDelay -= f; return }

      ball.x += ball.vx * f
      ball.y += ball.vy * f
      if (ball.y < ball.r) { ball.y = ball.r; ball.vy *= -1 }
      if (ball.y > H - ball.r) { ball.y = H - ball.r; ball.vy *= -1 }

      const hitPaddle = (px, py, dir) => {
        const hit = (ball.y - (py + PH / 2)) / (PH / 2)
        const s = Math.min(Math.hypot(ball.vx, ball.vy) * 1.06, 13)
        const ang = hit * (Math.PI / 4)
        ball.vx = Math.cos(ang) * s * dir
        ball.vy = Math.sin(ang) * s
        ball.x = px + (dir > 0 ? PW + ball.r : -ball.r)
      }

      if (ball.vx < 0 && ball.x - ball.r <= 24 + PW && ball.x - ball.r >= 12 && ball.y >= player.y - 4 && ball.y <= player.y + PH + 4) {
        hitPaddle(24, player.y, 1)
      }
      if (ball.vx > 0 && ball.x + ball.r >= W - 24 - PW && ball.x + ball.r <= W - 12 && ball.y >= ai.y - 4 && ball.y <= ai.y + PH + 4) {
        hitPaddle(W - 24 - PW, ai.y, -1)
      }

      if (ball.x < -20) { b += 1; setCpu(b); if (b >= WIN) finish(); else serve(1) }
      if (ball.x > W + 20) { a += 1; setYou(a); if (a >= WIN) finish(); else serve(-1) }
    }

    const draw = () => {
      ctx.fillStyle = '#0b1020'
      ctx.fillRect(0, 0, W, H)
      ctx.setLineDash([10, 12])
      ctx.strokeStyle = 'rgba(255,255,255,0.15)'
      ctx.lineWidth = 3
      ctx.beginPath(); ctx.moveTo(W / 2, 0); ctx.lineTo(W / 2, H); ctx.stroke()
      ctx.setLineDash([])
      ctx.textAlign = 'center'
      ctx.fillStyle = 'rgba(255,255,255,0.18)'
      ctx.font = '700 72px Rajdhani, sans-serif'
      ctx.fillText(a, W / 2 - 80, 80)
      ctx.fillText(b, W / 2 + 80, 80)

      ctx.shadowBlur = 14
      ctx.shadowColor = '#4cc9f0'
      ctx.fillStyle = '#4cc9f0'
      roundRect(ctx, 24, player.y, PW, PH, 6); ctx.fill()
      ctx.shadowColor = '#ff6b6b'
      ctx.fillStyle = '#ff6b6b'
      roundRect(ctx, W - 24 - PW, ai.y, PW, PH, 6); ctx.fill()
      ctx.shadowColor = '#fff'
      ctx.fillStyle = '#fff'
      ctx.beginPath(); ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2); ctx.fill()
      ctx.shadowBlur = 0

      if (state === 'over') {
        drawMessage(ctx, W, H, a > b ? '¡GANASTE!' : 'PERDISTE', `${a} - ${b} · Pulsa JUGAR de nuevo`)
      }
    }

    const loop = (now) => {
      const f = Math.min((now - last) / 16.67, 3)
      last = now
      if (state === 'playing') update(f)
      draw()
      if (state === 'playing') raf = requestAnimationFrame(loop)
    }

    const onKeyDown = (e) => {
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') { up = 1; e.preventDefault() }
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') { down = 1; e.preventDefault() }
    }
    const onKeyUp = (e) => {
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') up = 0
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') down = 0
    }
    const onMove = (e) => {
      const p = pointerPos(canvas, e)
      player.y = Math.max(0, Math.min(H - PH, p.y - PH / 2))
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    canvas.addEventListener('mousemove', onMove)
    canvas.addEventListener('touchmove', onMove, { passive: true })
    raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      canvas.removeEventListener('mousemove', onMove)
      canvas.removeEventListener('touchmove', onMove)
    }
  }, [run])

  return (
    <>
      <Hud
        stats={[['Tú', you], ['CPU', cpu], ['Mejor', best]]}
        buttonLabel={run === 0 ? '▶ JUGAR' : '↻ Reiniciar'}
        onButton={() => setRun((r) => r + 1)}
      />
      <div className="canvas-wrap">
        <canvas ref={canvasRef} className="game" width={W} height={H} style={{ width: 'min(640px, 100%)' }} />
      </div>
    </>
  )
}
