import { useMemo, useState } from 'react'
import HeroCarousel from '../components/HeroCarousel.jsx'
import SearchFilters from '../components/SearchFilters.jsx'
import GameCard from '../components/GameCard.jsx'
import { useStore } from '../context/StoreContext.jsx'

const sorters = {
  popular: () => 0,
  'price-asc': (a, b) => a.price - b.price,
  'price-desc': (a, b) => b.price - a.price,
  rating: (a, b) => b.rating - a.rating,
  title: (a, b) => a.title.localeCompare(b.title),
}

export default function Home() {
  const { games, loading, error } = useStore()
  const [query, setQuery] = useState('')
  const [genre, setGenre] = useState('Todos')
  const [sort, setSort] = useState('popular')

  const genres = useMemo(() => ['Todos', ...new Set(games.map((g) => g.genre))], [games])
  const featured = useMemo(() => games.filter((g) => g.featured), [games])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return games
      .filter((g) => (genre === 'Todos' || g.genre === genre))
      .filter((g) => !q || g.title.toLowerCase().includes(q) || g.genre.toLowerCase().includes(q) || g.tagline.toLowerCase().includes(q))
      .sort(sorters[sort])
  }, [games, query, genre, sort])

  const filtering = query.trim() !== '' || genre !== 'Todos' || sort !== 'popular'

  if (loading) {
    return <div className="loader"><div className="spinner" /><span>Cargando catálogo…</span></div>
  }
  if (error) {
    return <div className="container page"><div className="empty"><div className="big">⚠️</div><h2>{error}</h2><p>Revisa que el archivo public/data/games.json exista.</p></div></div>
  }

  return (
    <div className="container">
      <HeroCarousel games={featured} />

      <SearchFilters
        query={query} setQuery={setQuery}
        genres={genres} genre={genre} setGenre={setGenre}
        sort={sort} setSort={setSort}
      />

      {filtering ? (
        <section className="section">
          <div className="section-head">
            <h2>Resultados</h2>
            <span>{filtered.length} {filtered.length === 1 ? 'juego' : 'juegos'}</span>
          </div>
          {filtered.length ? (
            <div className="grid">{filtered.map((g) => <GameCard key={g.id} game={g} />)}</div>
          ) : (
            <div className="empty">
              <div className="big">🕹️</div>
              <h2>Sin resultados</h2>
              <p>No encontramos juegos para tu búsqueda.</p>
              <button className="btn btn-primary" onClick={() => { setQuery(''); setGenre('Todos'); setSort('popular') }}>Limpiar filtros</button>
            </div>
          )}
        </section>
      ) : (
        genres.slice(1).map((gen) => (
          <section className="section" key={gen}>
            <div className="section-head">
              <h2>{gen}</h2>
              <button className="chip" onClick={() => setGenre(gen)}>Ver todo</button>
            </div>
            <div className="grid">
              {games.filter((g) => g.genre === gen).map((g) => <GameCard key={g.id} game={g} />)}
            </div>
          </section>
        ))
      )}
    </div>
  )
}
