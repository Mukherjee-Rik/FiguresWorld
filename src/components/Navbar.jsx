import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useShop } from '../context/ShopContext.jsx'

export default function Navbar() {
  const { cartCount } = useShop()
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const navigate = useNavigate()

  const submitSearch = (e) => {
    e.preventDefault()
    navigate(`/shop?q=${encodeURIComponent(search.trim())}`)
    setOpen(false)
  }

  const close = () => setOpen(false)

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="logo" onClick={close}>
          <span className="logo-mark">FW</span>
          <span className="logo-text">
            FIGURE <span className="gold">WORLD</span>
          </span>
        </Link>

        <nav className={`nav-links ${open ? 'open' : ''}`}>
          <NavLink to="/" end onClick={close}>Home</NavLink>
          <NavLink to="/shop" onClick={close}>Shop</NavLink>
          <NavLink to="/cart" onClick={close}>Cart</NavLink>

          <form onSubmit={submitSearch} className="nav-search mobile-only">
            <input
              type="text"
              placeholder="Search figures..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button type="submit">🔍</button>
          </form>
        </nav>

        <form onSubmit={submitSearch} className="nav-search desktop-only">
          <input
            type="text"
            placeholder="Search figures..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit">🔍</button>
        </form>

        <Link to="/cart" className="cart-btn" onClick={close}>
          🛒
          {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
        </Link>

        <button
          className={`burger ${open ? 'open' : ''}`}
          onClick={() => setOpen(!open)}
          aria-label="Menu"
        >
          <span></span><span></span><span></span>
        </button>
      </div>
    </header>
  )
}
