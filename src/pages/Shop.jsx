import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useShop } from '../context/ShopContext.jsx'
import ProductCard from '../components/ProductCard.jsx'

export default function Shop() {
  const { products, categories } = useShop()
  const [params, setParams] = useSearchParams()

  const [search, setSearch] = useState(params.get('q') || '')
  const [category, setCategory] = useState(params.get('cat') || 'All')
  const [sort, setSort] = useState('newest')

  useEffect(() => {
    const next = new URLSearchParams()
    if (search) next.set('q', search)
    if (category && category !== 'All') next.set('cat', category)
    setParams(next, { replace: true })
  }, [search, category, setParams])

  const filtered = useMemo(() => {
    let list = [...products]
    if (category && category !== 'All') {
      list = list.filter((p) => p.category === category)
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q)
      )
    }
    if (sort === 'low') list.sort((a, b) => a.price - b.price)
    else if (sort === 'high') list.sort((a, b) => b.price - a.price)
    else if (sort === 'name') list.sort((a, b) => a.name.localeCompare(b.name))
    else list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
    return list
  }, [products, search, category, sort])

  return (
    <div className="shop-page container">
      <div className="page-head">
        <h1>Shop <span className="gradient-text">Figures</span></h1>
        <p>{filtered.length} products available</p>
      </div>

      <div className="shop-toolbar">
        <input
          className="shop-search"
          type="text"
          placeholder="Search by name, category, description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="newest">Sort: Newest</option>
          <option value="low">Price: Low → High</option>
          <option value="high">Price: High → Low</option>
          <option value="name">Name: A → Z</option>
        </select>
      </div>

      <div className="shop-layout">
        <aside className="shop-filters">
          <h3>Categories</h3>
          <button
            className={`filter-pill ${category === 'All' ? 'active' : ''}`}
            onClick={() => setCategory('All')}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c}
              className={`filter-pill ${category === c ? 'active' : ''}`}
              onClick={() => setCategory(c)}
            >
              {c}
            </button>
          ))}
        </aside>

        <div className="shop-results">
          {filtered.length === 0 ? (
            <div className="empty">
              <h3>No figures found</h3>
              <p>Try a different search or category.</p>
            </div>
          ) : (
            <div className="product-grid">
              {filtered.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
