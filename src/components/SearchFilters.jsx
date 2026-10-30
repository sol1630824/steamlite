export default function SearchFilters({ query, setQuery, genres, genre, setGenre, sort, setSort }) {
  return (
    <div className="filters">
      <div className="search">
        <span>🔍</span>
        <input
          type="text"
          placeholder="Buscar juegos en tiempo real…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Buscar juegos"
        />
      </div>

      <div className="chips">
        {genres.map((g) => (
          <button key={g} className={`chip${g === genre ? ' active' : ''}`} onClick={() => setGenre(g)}>
            {g}
          </button>
        ))}
      </div>

      <select className="select" value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Ordenar">
        <option value="popular">Más populares</option>
        <option value="price-asc">Precio: menor a mayor</option>
        <option value="price-desc">Precio: mayor a menor</option>
        <option value="rating">Mejor valorados</option>
        <option value="title">Nombre (A-Z)</option>
      </select>
    </div>
  )
}
