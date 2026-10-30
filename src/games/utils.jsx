// Utilidades compartidas por los mini-juegos

export function drawMessage(ctx, w, h, title, sub) {
  ctx.fillStyle = 'rgba(5, 8, 19, 0.78)'
  ctx.fillRect(0, 0, w, h)
  ctx.textAlign = 'center'
  ctx.fillStyle = '#fff'
  ctx.font = '800 38px Rajdhani, Inter, sans-serif'
  ctx.fillText(title, w / 2, h / 2 - 6)
  if (sub) {
    ctx.fillStyle = '#8e9ac0'
    ctx.font = '500 16px Inter, sans-serif'
    ctx.fillText(sub, w / 2, h / 2 + 26)
  }
}

export function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

// Posición del puntero dentro del canvas (considera el escalado CSS)
export function pointerPos(canvas, e) {
  const rect = canvas.getBoundingClientRect()
  const p = e.touches ? e.touches[0] : e
  return {
    x: ((p.clientX - rect.left) / rect.width) * canvas.width,
    y: ((p.clientY - rect.top) / rect.height) * canvas.height,
  }
}

export function Hud({ stats, buttonLabel, onButton }) {
  return (
    <div className="hud">
      <div className="hud-stats">
        {stats.map(([label, value]) => (
          <span key={label}>{label}<b>{value}</b></span>
        ))}
      </div>
      <button className="btn btn-primary btn-sm" onClick={onButton}>{buttonLabel}</button>
    </div>
  )
}
