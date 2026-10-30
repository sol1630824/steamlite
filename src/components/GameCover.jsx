export default function GameCover({ game, size = 'md', icon }) {
  return (
    <div className={`cover cover-${size}`} style={{ '--c1': game.colors[0], '--c2': game.colors[1] }}>
      <span className="cover-icon">{icon || game.icon}</span>
    </div>
  )
}
