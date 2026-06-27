import { Link } from 'react-router-dom'
import { useShop } from '../context/ShopContext.jsx'
import ProductCard from '../components/ProductCard.jsx'

export default function Home() {
  const { products, categories } = useShop()
  const featured = products.slice(0, 4)
  const limited = products.filter((p) => p.stock === 'Limited').slice(0, 4)

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-bg"></div>
        <div className="hero-grid-overlay"></div>
        <div className="hero-content">
          <span className="hero-tag">⚡ Premium Collector Series</span>
          <h1 className="hero-title">
            Unleash Your
            <span className="gradient-text"> Inner Legend</span>
          </h1>
          <p className="hero-sub">
            Hand-crafted anime, sci-fi & superhero figures for true collectors.
            Limited drops. Cinematic detail. Shipped worldwide.
          </p>
          <div className="hero-cta">
            <Link to="/shop" className="btn btn-primary">Shop Collection →</Link>
            <Link to="/shop?cat=Limited+Edition" className="btn btn-ghost">Limited Drops</Link>
          </div>
          <div className="hero-stats">
            <div><strong>500+</strong><span>Figures</span></div>
            <div><strong>50K+</strong><span>Collectors</span></div>
            <div><strong>★ 4.9</strong><span>Rated</span></div>
          </div>
        </div>
        <div className="hero-decor">
          <div className="glow-orb orb-1"></div>
          <div className="glow-orb orb-2"></div>
        </div>
      </section>

      {/* Categories */}
      <section className="section">
        <div className="section-head">
          <h2>Shop by Category</h2>
          <Link to="/shop" className="see-all">View all →</Link>
        </div>
        <div className="cat-grid">
          {categories.map((c) => (
            <Link
              key={c}
              to={`/shop?cat=${encodeURIComponent(c)}`}
              className="cat-tile"
            >
              <span className="cat-tile-name">{c}</span>
              <span className="cat-tile-arrow">→</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="section">
        <div className="section-head">
          <h2>Featured Drops</h2>
          <Link to="/shop" className="see-all">View all →</Link>
        </div>
        <div className="product-grid">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* Limited */}
      {limited.length > 0 && (
        <section className="section">
          <div className="section-head">
            <h2>⚠️ Limited Edition</h2>
            <Link to="/shop" className="see-all">View all →</Link>
          </div>
          <div className="product-grid">
            {limited.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Banner */}
      <section className="banner">
        <div className="banner-inner">
          <h2>Become a <span className="gradient-text">Founding Collector</span></h2>
          <p>Join early access drops, exclusive variants & insider previews.</p>
          <Link to="/shop" className="btn btn-primary">Start Collecting</Link>
        </div>
      </section>
    </div>
  )
}
