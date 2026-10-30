import { useEffect, useRef, useState } from 'react'
import { Hud, drawMessage, roundRect } from './utils.jsx'

const W = 400
const H = 560
const GAP = 160
const PIPE_W = 62

export default function SkyHop({ onScore }) {
  const canvasRef = useRef(null)
  const [run, setRun] = useState(0)
  const [score, setScore] = useState(0)
  const [best, setBest] = useState(0)
  const scoreCb = useRef(onScore)
  scoreCb.current = onScore

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    const sky = () => {
      const g = ctx.createLinearGradient(0, 0, 0, H)
      g.addColorStop(0, '#1b3a6b')
      g.addColorStop(1, '#6dd5ed')
      ctx.fillStyle = g
      ctx.fillRect(0, 0, W, H)
    }

    if (run === 0) {
      sky()
      drawMessage(ctx, W, H, 'SKY HOP', 'Pulsa JUGAR y toca para volar')
      return
    }

    const bird = { x: 90, y: H / 2, vy: 0, r: 15 }
    const pipes = []
    const clouds = Array.from({ length: 5 }, () => ({ x: Math.random() * W, y: 40 + Math.random() * 300, s: 0.3 + Math.random() * 0.5 }))
    let state = 'ready'
    let sc = 0
    let raf
    let last = performance.now()
    let t = 0
    setScore(0)

    const flap = () => {
      if (state === 'over') return
      if (state === 'ready') state = 'playing'
      bird.vy = -7.4
    }

    const finish = () => {
      state = 'over'
      scoreCb.current(sc)
      setBest((b) => Math.max(b, sc))
    }

    const update = (f) => {
      t += f
      clouds.forEach((c) => { c.x -= c.s * f; if (c.x < -80) c.x = W + 40 })
      if (state === 'ready') {
        bird.y = H / 2 + Math.sin(t / 10) * 8
        return
      }
      bird.vy += 0.42 * f
      bird.y += bird.vy * f

      const speed = 2.6 + Math.min(sc * 0.06, 1.6)
      if (!pipes.length || pipes[pipes.length - 1].x < W - 220) {
        const top = 70 + Math.random() * (H - GAP - 140)
        pipes.push({ x: W + 10, top, passed: false })
      }
      pipes.forEach((p) => {
        p.x -= speed * f
        if (!p.passed && p.x + PIPE_W < bird.x - bird.r) {
          p.passed = true
          sc += 1
          setScore(sc)
        }
        const inX = bird.x + bird.r - 3 > p.x && bird.x - bird.r + 3 < p.x + PIPE_W
        if (inX && (bird.y - bird.r + 3 < p.top || bird.y + bird.r - 3 > p.top + GAP)) finish()
      })
      if (pipes[0] && pipes[0].x < -PIPE_W - 10) pipes.shift()
      if (bird.y + bird.r > H - 24 || bird.y - bird.r < -40) finish()
    }

    const draw = () => {
      sky()
      ctx.fillStyle = 'rgba(255,255,255,0.55)'
      clouds.forEach((c) => {
        ctx.beginPath()
        ctx.arc(c.x, c.y, 22, 0, Math.PI * 2)
        ctx.arc(c.x + 24, c.y + 4, 18, 0, Math.PI * 2)
        ctx.arc(c.x - 24, c.y + 6, 16, 0, Math.PI * 2)
        ctx.fill()
      })
      pipes.forEach((p) => {
        const g = ctx.createLinearGradient(p.x, 0, p.x + PIPE_W, 0)
        g.addColorStop(0, '#2fd18b')
        g.addColorStop(1, '#16885c')
        ctx.fillStyle = g
        roundRect(ctx, p.x, -10, PIPE_W, p.top + 10, 8); ctx.fill()
        roundRect(ctx, p.x, p.top + GAP, PIPE_W, H - p.top - GAP, 8); ctx.fill()
        ctx.fillStyle = '#3ff0a6'
        roundRect(ctx, p.x - 5, p.top - 22, PIPE_W + 10, 22, 6); ctx.fill()
        roundRect(ctx, p.x - 5, p.top + GAP, PIPE_W + 10, 22, 6); ctx.fill()
      })
      ctx.fillStyle = '#0c1d33'
      ctx.fillRect(0, H - 24, W, 24)
      ctx.fillStyle = '#3ddc97'
      ctx.fillRect(0, H - 24, W, 4)

      ctx.save()
      ctx.translate(bird.x, bird.y)
      ctx.rotate(Math.max(-0.5, Math.min(bird.vy / 12, 1.0)))
      ctx.font = '34px serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.rotate(Math.PI / 4)
      ctx.fillText('🚀', 0, 0)
      ctx.restore()

      ctx.textAlign = 'center'
      ctx.textBaseline = 'alphabetic'
      ctx.fillStyle = '#fff'
      ctx.font = '800 54px Rajdhani, sans-serif'
      ctx.strokeStyle = 'rgba(0,0,0,0.35)'
      ctx.lineWidth = 5
      ctx.strokeText(sc, W / 2, 80)
      ctx.fillText(sc, W / 2, 80)

      if (state === 'ready') {
        ctx.font = '600 16px Inter, sans-serif'
        ctx.fillStyle = '#fff'
        ctx.fillText('Toca, clic o Espacio para volar', W / 2, H / 2 + 80)
      }
      if (state === 'over') drawMessage(ctx, W, H, 'FIN DEL JUEGO', `Puntos: ${sc} · Pulsa JUGAR de nuevo`)
    }

    const loop = (now) => {
      const f = Math.min((now - last) / 16.67, 3)
      last = now
      update(f)
      draw()
      if (state !== 'over') raf = requestAnimationFrame(loop)
    }

    const onKey = (e) => {
      if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') { e.preventDefault(); flap() }
    }
    const onPointer = (e) => { e.preventDefault(); flap() }

    window.addEventListener('keydown', onKey)
    canvas.addEventListener('mousedown', onPointer)
    canvas.addEventListener('touchstart', onPointer, { passive: false })
    raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('keydown', onKey)
      canvas.removeEventListener('mousedown', onPointer)
      canvas.removeEventListener('touchstart', onPointer)
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
        <canvas ref={canvasRef} className="game" width={W} height={H} style={{ width: 'min(400px, 100%)' }} />
      </div>
    </>
  )
}
