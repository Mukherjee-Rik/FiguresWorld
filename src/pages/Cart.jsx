import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useShop } from '../context/ShopContext.jsx'
import { formatPrice } from '../utils/storage.js'
import { buildOrderMessage, openWhatsApp, WHATSAPP_NUMBER } from '../utils/whatsapp.js'

export default function Cart() {
  const { cart, updateCartQty, removeFromCart, cartTotal, clearCart } = useShop()
  const [customer, setCustomer] = useState({ name: '', phone: '', address: '' })
  const [error, setError] = useState('')

  const handleOrder = () => {
    setError('')
    if (!customer.name.trim() || !customer.phone.trim() || !customer.address.trim()) {
      setError('Please fill in name, phone, and address before ordering.')
      return
    }
    if (cart.length === 0) {
      setError('Your cart is empty.')
      return
    }
    const msg = buildOrderMessage({
      customer,
      items: cart,
      total: cartTotal,
    })
    openWhatsApp(msg)
  }

  if (cart.length === 0) {
    return (
      <div className="container empty">
        <h2>Your cart is empty</h2>
        <p>Discover premium collectibles waiting for you.</p>
        <Link to="/shop" className="btn btn-primary">Browse Shop</Link>
      </div>
    )
  }

  return (
    <div className="container cart-page">
      <div className="page-head">
        <h1>Your <span className="gradient-text">Cart</span></h1>
        <p>{cart.length} item(s)</p>
      </div>

      <div className="cart-layout">
        <div className="cart-items">
          {cart.map((item) => (
            <div key={item.id} className="cart-row">
              <div className="cart-row-img">
                {item.image ? <img src={item.image} alt={item.name} /> : <div className="no-img">—</div>}
              </div>
              <div className="cart-row-info">
                <Link to={`/product/${item.id}`} className="cart-row-name">
                  {item.name}
                </Link>
                <div className="cart-row-price">{formatPrice(item.price)}</div>
              </div>
              <div className="qty-control">
                <button onClick={() => updateCartQty(item.id, item.quantity - 1)}>−</button>
                <span>{item.quantity}</span>
                <button onClick={() => updateCartQty(item.id, item.quantity + 1)}>+</button>
              </div>
              <div className="cart-row-total">
                {formatPrice(item.price * item.quantity)}
              </div>
              <button
                className="cart-remove"
                onClick={() => removeFromCart(item.id)}
                title="Remove"
              >
                ✕
              </button>
            </div>
          ))}
          <button className="btn btn-ghost" onClick={clearCart}>
            Clear Cart
          </button>
        </div>

        <div className="cart-checkout">
          <h3>Checkout via WhatsApp</h3>
          <p className="checkout-note">
            We process orders through WhatsApp. Fill your details — we'll generate
            a complete order message you can send instantly.
          </p>

          <div className="form-group">
            <label>Full Name *</label>
            <input
              type="text"
              value={customer.name}
              onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
              placeholder="John Doe"
            />
          </div>
          <div className="form-group">
            <label>Phone *</label>
            <input
              type="tel"
              value={customer.phone}
              onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
              placeholder="+91 98765 43210"
            />
          </div>
          <div className="form-group">
            <label>Shipping Address *</label>
            <textarea
              rows="3"
              value={customer.address}
              onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
              placeholder="Street, City, State, PIN"
            ></textarea>
          </div>

          <div className="checkout-summary">
            <div className="row"><span>Subtotal</span><span>{formatPrice(cartTotal)}</span></div>
            <div className="row"><span>Shipping</span><span>Discuss on WhatsApp</span></div>
            <div className="row total"><span>Total</span><span>{formatPrice(cartTotal)}</span></div>
          </div>

          {error && <div className="error-msg">{error}</div>}

          <button className="btn btn-whatsapp" onClick={handleOrder}>
            <span>💬</span> Order on WhatsApp
          </button>
        </div>
      </div>
    </div>
  )
}
