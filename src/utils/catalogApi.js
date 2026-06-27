import { STORAGE_KEYS, loadFromStorage, saveToStorage } from './storage.js'

const CATALOG_API_URL = import.meta.env.VITE_CATALOG_API_URL || '/.netlify/functions/catalog'

const loadLocalCatalog = () => ({
  products: loadFromStorage(STORAGE_KEYS.CATALOG_PRODUCTS, []),
  categories: loadFromStorage(STORAGE_KEYS.CATALOG_CATEGORIES, []),
  localOnly: true,
})

const saveLocalCatalog = ({ products, categories }) => {
  saveToStorage(STORAGE_KEYS.CATALOG_PRODUCTS, products)
  saveToStorage(STORAGE_KEYS.CATALOG_CATEGORIES, categories)
  return { products, categories, localOnly: true }
}

const createLocalProduct = (product) => {
  const catalog = loadLocalCatalog()
  const newProduct = {
    ...product,
    id: 'local-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7),
    createdAt: Date.now(),
  }
  const products = [newProduct, ...catalog.products]
  const saved = saveLocalCatalog({ products, categories: catalog.categories })
  return { ...saved, product: newProduct }
}

const saveLocalProduct = (id, updates) => {
  const catalog = loadLocalCatalog()
  const products = catalog.products.map((product) =>
    product.id === id ? { ...product, ...updates } : product
  )
  return saveLocalCatalog({ products, categories: catalog.categories })
}

const removeLocalProduct = (id) => {
  const catalog = loadLocalCatalog()
  const products = catalog.products.filter((product) => product.id !== id)
  return saveLocalCatalog({ products, categories: catalog.categories })
}

const createLocalCategory = (name) => {
  const clean = String(name || '').trim()
  const catalog = loadLocalCatalog()
  const categories = clean && !catalog.categories.includes(clean)
    ? [...catalog.categories, clean]
    : catalog.categories
  return saveLocalCatalog({ products: catalog.products, categories })
}

const removeLocalCategory = (name) => {
  const catalog = loadLocalCatalog()
  const categories = catalog.categories.filter((category) => category !== name)
  return saveLocalCatalog({ products: catalog.products, categories })
}

const requestRemoteCatalog = async (options = {}) => {
  const response = await fetch(CATALOG_API_URL, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(data.error || 'Catalog backend is not available.')
  }

  return data
}

const withLocalFallback = async (remoteRequest, localRequest) => {
  try {
    return await remoteRequest()
  } catch (error) {
    console.warn('Catalog backend unavailable. Using browser storage fallback.', error)
    return localRequest()
  }
}

export const getCatalog = () =>
  withLocalFallback(
    () => requestRemoteCatalog(),
    () => loadLocalCatalog()
  )

export const createProduct = (product) =>
  withLocalFallback(
    () => requestRemoteCatalog({
      method: 'POST',
      body: JSON.stringify({ resource: 'product', product }),
    }),
    () => createLocalProduct(product)
  )

export const saveProduct = (id, updates) =>
  withLocalFallback(
    () => requestRemoteCatalog({
      method: 'PUT',
      body: JSON.stringify({ resource: 'product', id, updates }),
    }),
    () => saveLocalProduct(id, updates)
  )

export const removeProduct = (id) =>
  withLocalFallback(
    () => requestRemoteCatalog({
      method: 'DELETE',
      body: JSON.stringify({ resource: 'product', id }),
    }),
    () => removeLocalProduct(id)
  )

export const createCategory = (name) =>
  withLocalFallback(
    () => requestRemoteCatalog({
      method: 'POST',
      body: JSON.stringify({ resource: 'category', name }),
    }),
    () => createLocalCategory(name)
  )

export const removeCategory = (name) =>
  withLocalFallback(
    () => requestRemoteCatalog({
      method: 'DELETE',
      body: JSON.stringify({ resource: 'category', name }),
    }),
    () => removeLocalCategory(name)
  )
