// WhatsApp number — REPLACE WITH YOUR REAL NUMBER (include country code, no + or spaces)
export const WHATSAPP_NUMBER = '918787458797'

export const buildOrderMessage = ({ customer, items, total }) => {
  const lines = []
  lines.push('🛒 *NEW ORDER — Figure World*')
  lines.push('')
  lines.push('*Customer Details*')
  lines.push(`👤 Name: ${customer.name}`)
  lines.push(`📞 Phone: ${customer.phone}`)
  lines.push(`📍 Address: ${customer.address}`)
  lines.push('')
  lines.push('*Order Items*')
  items.forEach((it, i) => {
    lines.push(`${i + 1}. ${it.name}`)
    lines.push(`   Qty: ${it.quantity} × ₹${it.price} = ₹${it.quantity * it.price}`)
  })
  lines.push('')
  lines.push(`💰 *Total: ₹${total}*`)
  lines.push('')
  lines.push('Please confirm my order. Thank you!')
  return lines.join('\n')
}

export const openWhatsApp = (message) => {
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
  window.open(url, '_blank')
}
