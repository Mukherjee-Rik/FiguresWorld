// LocalStorage helpers
export const STORAGE_KEYS = {
  CART: 'fw_cart',
  CATALOG_PRODUCTS: 'fw_catalog_products',
  CATALOG_CATEGORIES: 'fw_catalog_categories',
}

export const loadFromStorage = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw)
  } catch (e) {
    console.error('Storage load error:', e)
    return fallback
  }
}

export const saveToStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (e) {
    console.error('Storage save error (may be quota exceeded):', e)
    alert('Storage limit reached. Try using fewer or smaller images.')
  }
}

export const formatPrice = (n) =>
  '₹' + Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })
