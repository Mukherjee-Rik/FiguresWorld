import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-grid">
        <div>
          <h3 className="footer-logo">FIGURE <span className="gold">WORLD</span></h3>
          <p>Premium anime & action figures, hand-picked for true collectors.</p>
        </div>
        <div>
          <h4>Explore</h4>
          <Link to="/">Home</Link>
          <Link to="/shop">Shop</Link>
          <Link to="/cart">Cart</Link>
          <Link to="/admin">Admin</Link>
        </div>
        <div>
          <h4>Support</h4>
          <Link to="/shipping">Shipping</Link>
          <Link to="/refund">Refund</Link>
          <Link to="/contact">Contact Us</Link>
        </div>
        <div>
          <h4>Follow</h4>
          <a href="https://www.instagram.com/figureworld_0025?igsh=MW5rbXo2NW5udXBicg==">Instagram</a>
          <a href="#!">YouTube</a>
          <a href="#!">Discord</a>
        </div>
      </div>
      <div className="footer-bottom">
        © {new Date().getFullYear()} Figure World — Crafted for collectors.
      </div>
    </footer>
  )
}
