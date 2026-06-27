import { Link } from 'react-router-dom'
import { useShop } from '../context/ShopContext.jsx'
import { formatPrice } from '../utils/storage.js'

export default function ProductCard({ product }) {
  const { addToCart } = useShop()
  const img = product.images?.[0]
  const outOfStock = product.stock === 'Out of Stock'

  return (
    <div className="product-card">
      <Link to={`/product/${product.id}`} className="product-card-img">
        {img ? (
          <img src={img} alt={product.name} loading="lazy" />
        ) : (
          <div className="no-img">No Image</div>
        )}
        <span className={`stock-badge ${product.stock?.replace(/\s+/g, '-').toLowerCase()}`}>
          {product.stock}
        </span>
      </Link>
      <div className="product-card-body">
        <span className="product-cat">{product.category}</span>
        <Link to={`/product/${product.id}`} className="product-name">
          {product.name}
        </Link>
        <div className="product-card-bottom">
          <span className="product-price">{formatPrice(product.price)}</span>
          <button
            className="btn-add"
            disabled={outOfStock}
            onClick={() => addToCart(product, 1)}
          >
            {outOfStock ? 'Sold Out' : 'Add'}
          </button>
        </div>
      </div>
    </div>
  )
}
