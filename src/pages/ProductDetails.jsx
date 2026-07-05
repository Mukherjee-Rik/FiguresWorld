import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useShop } from '../context/ShopContext.jsx'
import { formatPrice } from '../utils/storage.js'
import ProductCard from '../components/ProductCard.jsx'

function renderDescription(description = '') {
  const lines = description
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)

  if (lines.length === 0) return null

  const blocks = []
  let bulletItems = []

  const flushBullets = () => {
    if (bulletItems.length === 0) return
    blocks.push(
      <ul key={`list-${blocks.length}`}>
        {bulletItems.map((item, index) => <li key={index}>{item}</li>)}
      </ul>
    )
    bulletItems = []
  }

  lines.forEach((line) => {
    const bullet = line.match(/^[-*•✓]\s*(.+)$/)

    if (bullet) {
      bulletItems.push(bullet[1])
      return
    }

    flushBullets()
    blocks.push(<p key={`text-${blocks.length}`}>{line}</p>)
  })

  flushBullets()
  return blocks
}

export default function ProductDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { products, addToCart } = useShop()
  const product = products.find((p) => p.id === id)
  const [activeImg, setActiveImg] = useState(0)
  const [qty, setQty] = useState(1)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  useEffect(() => {
    if (!lightboxOpen) return

    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setLightboxOpen(false)
    }

    document.addEventListener('keydown', closeOnEscape)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', closeOnEscape)
      document.body.style.overflow = ''
    }
  }, [lightboxOpen])

  if (!product) {
    return (
      <div className="container empty">
        <h2>Product not found</h2>
        <Link to="/shop" className="btn btn-primary">Back to Shop</Link>
      </div>
    )
  }

  const related = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4)

  const outOfStock = product.stock === 'Out of Stock'

  return (
    <div className="container product-details">
      <div className="breadcrumb">
        <Link to="/">Home</Link> / <Link to="/shop">Shop</Link> /{' '}
        <span>{product.name}</span>
      </div>

      <div className="pd-grid">
        <div className="pd-gallery">
          <div className="pd-main-img">
            {product.images?.[activeImg] ? (
              <button
                type="button"
                className="pd-image-open"
                onClick={() => setLightboxOpen(true)}
                aria-label="Open product image full screen"
              >
                <img src={product.images[activeImg]} alt={product.name} />
              </button>
            ) : (
              <div className="no-img">No Image</div>
            )}
            <span className={`stock-badge ${product.stock?.replace(/\s+/g, '-').toLowerCase()}`}>
              {product.stock}
            </span>
          </div>
          {product.images?.length > 1 && (
            <div className="pd-thumbs">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`pd-thumb ${i === activeImg ? 'active' : ''}`}
                >
                  <img src={img} alt={`view ${i + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="pd-info">
          <span className="product-cat">{product.category}</span>
          <h1>{product.name}</h1>
          <div className="pd-price">{formatPrice(product.price)}</div>
          <div className="pd-desc">{renderDescription(product.description)}</div>

          <div className="pd-qty">
            <span>Quantity</span>
            <div className="qty-control">
              <button onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
              <span>{qty}</span>
              <button onClick={() => setQty(qty + 1)}>+</button>
            </div>
          </div>

          <div className="pd-actions">
            <button
              className="btn btn-primary"
              disabled={outOfStock}
              onClick={() => addToCart(product, qty)}
            >
              {outOfStock ? 'Sold Out' : 'Add to Cart'}
            </button>
            <button
              className="btn btn-gold"
              disabled={outOfStock}
              onClick={() => {
                addToCart(product, qty)
                navigate('/cart')
              }}
            >
              Buy Now →
            </button>
          </div>

          <ul className="pd-features">
            <li>✓ Authentic premium collectible</li>
            <li>✓ Hand-painted detail</li>
            <li>✓ WhatsApp checkout — order anywhere</li>
            <li>✓ Worldwide shipping</li>
          </ul>
        </div>
      </div>

      {related.length > 0 && (
        <section className="section">
          <h2>You may also like</h2>
          <div className="product-grid">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {lightboxOpen && product.images?.[activeImg] && (
        <div
          className="image-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={`${product.name} full screen image`}
          onClick={() => setLightboxOpen(false)}
        >
          <button
            type="button"
            className="image-lightbox-close"
            onClick={() => setLightboxOpen(false)}
            aria-label="Close full screen image"
          >
            ×
          </button>
          <img
            src={product.images[activeImg]}
            alt={product.name}
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      )}
    </div>
  )
}
