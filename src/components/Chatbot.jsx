import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useShop } from '../context/ShopContext.jsx'
import { formatPrice } from '../utils/storage.js'
import { openWhatsApp } from '../utils/whatsapp.js'

const starterMessages = [
  {
    from: 'bot',
    text: 'Hi, I am Figure World support. Ask me about products, prices, stock, delivery, returns, or checkout.',
  },
]

const quickReplies = ['Show products', 'In stock', 'Under 5000', 'How to order?']

const stopWords = new Set([
  'a',
  'an',
  'and',
  'any',
  'are',
  'can',
  'do',
  'for',
  'from',
  'have',
  'i',
  'is',
  'me',
  'of',
  'please',
  'show',
  'some',
  'the',
  'to',
  'u',
  'you',
  'your',
])

const intentRules = [
  {
    name: 'shipping',
    terms: ['ship', 'shipping', 'delivery', 'deliver', 'courier', 'tracking', 'track', 'arrive', 'days', 'time'],
  },
  {
    name: 'refund',
    terms: ['refund', 'return', 'replace', 'replacement', 'damage', 'damaged', 'broken', 'wrong', 'cancel'],
  },
  {
    name: 'contact',
    terms: ['contact', 'support', 'help', 'call', 'phone', 'email', 'message', 'whatsapp', 'human'],
  },
  {
    name: 'order',
    terms: ['order', 'buy', 'purchase', 'checkout', 'payment', 'pay', 'book', 'reserve', 'cart'],
  },
  {
    name: 'product',
    terms: [
      'product',
      'products',
      'figure',
      'figures',
      'stock',
      'available',
      'catalog',
      'collection',
      'price',
      'cost',
      'cheap',
      'budget',
      'limited',
      'new',
    ],
  },
  {
    name: 'greeting',
    terms: ['hi', 'hello', 'hey', 'yo', 'namaste', 'hii'],
  },
]

function productLine(product) {
  return `${product.name} - ${formatPrice(product.price)} (${product.stock})`
}

function normalizeText(value) {
  return value
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function getTokens(text) {
  return normalizeText(text)
    .split(' ')
    .filter((word) => word.length > 1 && !stopWords.has(word))
}

function hasTerm(text, term) {
  return text.includes(term) || text.split(' ').some((word) => word.startsWith(term))
}

function getIntent(text, products, categories) {
  const normalized = normalizeText(text)
  const scores = intentRules.map((intent) => ({
    name: intent.name,
    score: intent.terms.reduce((sum, term) => sum + (hasTerm(normalized, term) ? 1 : 0), 0),
  }))
  const productScore = scores.find((intent) => intent.name === 'product')

  if (getPriceFilter(normalized)) {
    productScore.score += 3
  }

  if (categories.some((category) => normalized.includes(category.toLowerCase()))) {
    productScore.score += 2
  }

  if (
    products.some((product) => {
      const firstWord = product.name?.toLowerCase().split(/\s+/)[0]
      return firstWord && normalized.includes(firstWord)
    })
  ) {
    productScore.score += 2
  }

  scores.sort((a, b) => b.score - a.score)
  return scores[0].score > 0 ? scores[0].name : 'unknown'
}

function getPriceFilter(text) {
  const normalized = normalizeText(text)
  const match = normalized.match(/(?:under|below|less than|within|max|maximum|upto|up to)\s*(?:rs|inr|rupees)?\s*(\d+)/)
  if (match) return { type: 'max', value: Number(match[1]) }

  const minMatch = normalized.match(/(?:above|over|more than|min|minimum)\s*(?:rs|inr|rupees)?\s*(\d+)/)
  if (minMatch) return { type: 'min', value: Number(minMatch[1]) }

  return null
}

function getMatchingProducts(message, products, categories) {
  const text = normalizeText(message)
  let matches = [...products]
  const matchedCategory = categories.find((category) => text.includes(category.toLowerCase()))

  if (matchedCategory) {
    matches = matches.filter((product) => product.category === matchedCategory)
  }

  if (text.includes('limited')) {
    matches = matches.filter((product) => product.stock === 'Limited' || product.category === 'Limited Edition')
  }

  if (text.includes('in stock') || text.includes('available') || text.includes('ready stock')) {
    matches = matches.filter((product) => product.stock !== 'Out of Stock')
  }

  const priceFilter = getPriceFilter(text)
  if (priceFilter?.type === 'max') {
    matches = matches.filter((product) => Number(product.price || 0) <= priceFilter.value)
  } else if (priceFilter?.type === 'min') {
    matches = matches.filter((product) => Number(product.price || 0) >= priceFilter.value)
  }

  const keywords = getTokens(text).filter(
    (word) => !['available', 'budget', 'cheap', 'cost', 'limited', 'new', 'price', 'stock'].includes(word)
  )

  if (keywords.length === 0 || matchedCategory || priceFilter) return matches

  return matches.filter((product) => {
    const haystack = [
      product.name,
      product.category,
      product.stock,
      product.description,
    ].join(' ').toLowerCase()

    return keywords.some((keyword) => haystack.includes(keyword))
  })
}

function getProductReply(message, products, categories) {
  if (products.length === 0) {
    return 'No products are listed right now. Add products from the admin panel, then I can help customers search them.'
  }

  const matches = getMatchingProducts(message, products, categories)
  const priceFilter = getPriceFilter(message)
  const visible = matches.slice(0, 5)

  if (matches.length === 0) {
    if (priceFilter?.type === 'max') {
      return `No products under ${formatPrice(priceFilter.value)} right now.`
    }

    if (priceFilter?.type === 'min') {
      return `No products above ${formatPrice(priceFilter.value)} right now.`
    }

    const categoryHint = categories.length > 0 ? categories.join(', ') : 'a product category'
    return `I could not find a matching figure for that yet. Try ${categoryHint}, in-stock figures, limited figures, or a budget like "under 5000".`
  }

  const intro = matches.length === products.length
    ? `We have ${products.length} products right now. Here are some:`
    : `I found ${matches.length} matching product${matches.length === 1 ? '' : 's'}:`

  const extra = matches.length > visible.length
    ? `\n\nThere are ${matches.length - visible.length} more in the shop.`
    : ''

  return `${intro}\n${visible.map(productLine).join('\n')}${extra}`
}

function getBotReply(message, products, categories) {
  const text = normalizeText(message)
  const intent = getIntent(message, products, categories)

  if (intent === 'shipping') {
    return 'Ready-stock figures are usually packed within 24-48 hours after confirmation. Shipping charges and tracking are shared on WhatsApp.'
  }

  if (intent === 'refund') {
    return 'For damaged or wrong items, message us within 24 hours of delivery with clear photos and an unboxing video. We review everything on WhatsApp.'
  }

  if (intent === 'contact') {
    return 'You can contact Figure World through the Contact Us page or send your message directly on WhatsApp from this chat.'
  }

  if (intent === 'order') {
    return 'Add figures to your cart, fill your details, and tap Order on WhatsApp. We confirm stock, shipping, and payment details there.'
  }

  if (intent === 'product') {
    return getProductReply(message, products, categories)
  }

  if (intent === 'greeting') {
    return 'Hey, welcome to Figure World. Tell me the category, budget, or stock type you want, and I will narrow it down.'
  }

  if (text.includes('thank')) {
    return 'Happy to help. I am here if you want product suggestions or checkout help.'
  }

  return 'I can help with product search, price ranges, stock, shipping, returns, contact, and ordering. Try "show in-stock figures under 5000".'
}

export default function Chatbot() {
  const { products, categories } = useShop()
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState(starterMessages)
  const messagesRef = useRef(null)

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight
    }
  }, [messages, open])

  const sendMessage = (text = input) => {
    const clean = text.trim()
    if (!clean) return

    const reply = getBotReply(clean, products, categories)
    setMessages((current) => [
      ...current,
      { from: 'user', text: clean },
      { from: 'bot', text: reply },
    ])
    setInput('')
  }

  const sendToWhatsApp = () => {
    const lastUserMessage = [...messages].reverse().find((message) => message.from === 'user')
    openWhatsApp(
      [
        '*FIGURE WORLD CHAT SUPPORT*',
        '',
        lastUserMessage?.text || 'Hi, I need help with Figure World.',
      ].join('\n')
    )
  }

  return (
    <div className={`chatbot ${open ? 'open' : ''}`}>
      {open && (
        <section className="chatbot-panel" aria-label="Figure World chatbot">
          <div className="chatbot-head">
            <div>
              <span>Figure World</span>
              <h3>Collector Assistant</h3>
              <p><i></i> Online support</p>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close chat">
              x
            </button>
          </div>

          <div className="chatbot-messages" ref={messagesRef}>
            {messages.map((message, index) => (
              <div className={`chat-msg ${message.from}`} key={`${message.from}-${index}`}>
                <span>{message.text}</span>
              </div>
            ))}
          </div>

          <div className="chatbot-quick">
            {quickReplies.map((reply) => (
              <button type="button" key={reply} onClick={() => sendMessage(reply)}>
                {reply}
              </button>
            ))}
          </div>

          <form
            className="chatbot-form"
            onSubmit={(e) => {
              e.preventDefault()
              sendMessage()
            }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask: in-stock under 5000..."
            />
            <button type="submit">Send</button>
          </form>

          <div className="chatbot-actions">
            <Link to="/contact" onClick={() => setOpen(false)}>Contact Page</Link>
            <button type="button" onClick={sendToWhatsApp}>WhatsApp</button>
          </div>
        </section>
      )}

      <button
        type="button"
        className="chatbot-toggle"
        onClick={() => setOpen((current) => !current)}
        aria-label={open ? 'Close chat' : 'Open chat'}
      >
        {open ? 'x' : 'Chat'}
      </button>
    </div>
  )
}
