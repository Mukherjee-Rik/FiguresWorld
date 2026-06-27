import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="container notfound">
      <div className="nf-glow"></div>
      <h1 className="nf-code">404</h1>
      <h2>Lost in the <span className="gradient-text">Multiverse</span></h2>
      <p>The figure you're looking for doesn't exist on this timeline.</p>
      <div className="nf-actions">
        <Link to="/" className="btn btn-primary">Back Home</Link>
        <Link to="/shop" className="btn btn-ghost">Browse Shop</Link>
      </div>
    </div>
  )
}
