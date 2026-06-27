import { useState } from 'react'
import { Link } from 'react-router-dom'
import { openWhatsApp, WHATSAPP_NUMBER } from '../utils/whatsapp.js'

const pages = {
  shipping: {
    label: 'Shipping',
    title: 'Shipping',
    accent: 'Updates',
    intro:
      'We pack every collectible with collector-grade care and coordinate delivery details through WhatsApp after checkout.',
    tag: 'Fast dispatch for ready-stock figures',
    primaryAction: 'Shop Ready Stock',
    primaryTo: '/shop',
    cards: [
      {
        title: 'Dispatch Window',
        text: 'Ready-stock figures are usually packed within 24-48 hours after order confirmation.',
      },
      {
        title: 'Shipping Charges',
        text: 'Shipping is confirmed on WhatsApp based on your city, package size, and delivery speed.',
      },
      {
        title: 'Safe Packaging',
        text: 'Figures are bubble-wrapped, boxed securely, and checked before they leave our shelf.',
      },
      {
        title: 'Tracking',
        text: 'Once shipped, tracking details are shared directly on WhatsApp so you can follow the parcel.',
      },
    ],
    steps: ['Confirm cart and address', 'Shipping quote shared', 'Payment and packing', 'Tracking sent on WhatsApp'],
  },
  refund: {
    label: 'Refund',
    title: 'Refund',
    accent: 'Policy',
    intro:
      'If something arrives damaged or incorrect, we help you quickly through WhatsApp with proof and order details.',
    tag: 'Collector-first issue support',
    primaryAction: 'Contact Support',
    primaryTo: '/contact',
    cards: [
      {
        title: 'Damaged Items',
        text: 'Share an unboxing video and clear photos within 24 hours of delivery for damage review.',
      },
      {
        title: 'Wrong Product',
        text: 'If we shipped the wrong figure, we will arrange the next step after checking your order details.',
      },
      {
        title: 'Cancellations',
        text: 'Orders can be cancelled before dispatch. Once shipped, cancellation depends on courier status.',
      },
      {
        title: 'Pre-Orders',
        text: 'Pre-order timelines and refund eligibility are confirmed individually before payment.',
      },
    ],
    steps: ['Message order details', 'Send proof if needed', 'Review by support', 'Resolution shared on WhatsApp'],
  },
}

export default function SupportPage({ type }) {
  const [contact, setContact] = useState({ name: '', phone: '', message: '' })
  const [error, setError] = useState('')
  const page = pages[type]

  const handleContact = (e) => {
    e.preventDefault()
    setError('')

    if (!contact.name.trim() || !contact.phone.trim() || !contact.message.trim()) {
      setError('Please fill in your name, phone, and message.')
      return
    }

    openWhatsApp(
      [
        '*FIGURE WORLD SUPPORT*',
        '',
        `Name: ${contact.name}`,
        `Phone: ${contact.phone}`,
        '',
        contact.message,
      ].join('\n')
    )
  }

  if (type === 'contact') {
    return (
      <div className="container support-page">
        <div className="page-head support-head">
          <span className="hero-tag">Direct collector support</span>
          <h1>Contact <span className="gradient-text">Us</span></h1>
          <p>Need help with an order, figure availability, shipping, or returns? Send us the details and we will continue on WhatsApp.</p>
        </div>

        <div className="support-contact-layout">
          <form className="support-panel" onSubmit={handleContact}>
            <h3>Send a Message</h3>
            <div className="form-group">
              <label>Full Name *</label>
              <input
                type="text"
                value={contact.name}
                onChange={(e) => setContact({ ...contact, name: e.target.value })}
                placeholder="Your name"
              />
            </div>
            <div className="form-group">
              <label>Phone *</label>
              <input
                type="tel"
                value={contact.phone}
                onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                placeholder="+91 98765 43210"
              />
            </div>
            <div className="form-group">
              <label>Message *</label>
              <textarea
                rows="5"
                value={contact.message}
                onChange={(e) => setContact({ ...contact, message: e.target.value })}
                placeholder="Tell us what you need help with..."
              ></textarea>
            </div>
            {error && <div className="error-msg">{error}</div>}
            <button className="btn btn-whatsapp" type="submit">
              <span>💬</span> Message on WhatsApp
            </button>
            <p className="wa-note">Support WhatsApp: <code>+{WHATSAPP_NUMBER}</code></p>
          </form>

          <div className="support-side">
            <div className="support-card featured">
              <span>Response Time</span>
              <h3>Usually same day</h3>
              <p>For faster help, include your order name, phone number, and a clear photo if the issue is about a delivered figure.</p>
            </div>
            <div className="support-mini-grid">
              <Link to="/shipping" className="cat-tile">
                <span className="cat-tile-name">Shipping Info</span>
                <span className="cat-tile-arrow">→</span>
              </Link>
              <Link to="/refund" className="cat-tile">
                <span className="cat-tile-name">Refund Policy</span>
                <span className="cat-tile-arrow">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container support-page">
      <div className="page-head support-head">
        <span className="hero-tag">{page.tag}</span>
        <h1>{page.title} <span className="gradient-text">{page.accent}</span></h1>
        <p>{page.intro}</p>
      </div>

      <div className="support-grid">
        {page.cards.map((card) => (
          <article className="support-card" key={card.title}>
            <span>{page.label}</span>
            <h3>{card.title}</h3>
            <p>{card.text}</p>
          </article>
        ))}
      </div>

      <section className="support-panel support-flow">
        <div>
          <h2>How it Works</h2>
          <p>Simple updates, clear confirmation, and all order conversations in one WhatsApp thread.</p>
        </div>
        <ol className="support-steps">
          {page.steps.map((step, index) => (
            <li key={step}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              {step}
            </li>
          ))}
        </ol>
      </section>

      <div className="support-actions">
        <Link to={page.primaryTo} className="btn btn-primary">{page.primaryAction} →</Link>
        <Link to="/contact" className="btn btn-ghost">Need Help?</Link>
      </div>
    </div>
  )
}
