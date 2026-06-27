import { getStore } from '@netlify/blobs'

const STORE_NAME = 'figure-world-catalog'
const PRODUCTS_KEY = 'products'
const CATEGORIES_KEY = 'categories'

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

const getCatalogStore = () => getStore(STORE_NAME)

const readJSON = async (store, key, fallback) => {
  const value = await store.get(key, { type: 'json' })
  return value || fallback
}

const readCatalog = async () => {
  const store = getCatalogStore()
  const products = await readJSON(store, PRODUCTS_KEY, [])
  const categories = await readJSON(store, CATEGORIES_KEY, [])
  return { store, products, categories }
}

const json = (body, init = {}) =>
  Response.json(body, {
    ...init,
    headers: {
      ...headers,
      ...(init.headers || {}),
    },
  })

export default async function catalog(request) {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers })
  }

  try {
    const { store, products, categories } = await readCatalog()

    if (request.method === 'GET') {
      return json({ products, categories })
    }

    const body = await request.json().catch(() => ({}))

    if (request.method === 'POST' && body.resource === 'product') {
      const product = body.product || {}
      const newProduct = {
        ...product,
        id: 'p-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7),
        createdAt: Date.now(),
      }
      const nextProducts = [newProduct, ...products]
      await store.setJSON(PRODUCTS_KEY, nextProducts)
      return json({ product: newProduct, products: nextProducts, categories })
    }

    if (request.method === 'PUT' && body.resource === 'product') {
      const nextProducts = products.map((product) =>
        product.id === body.id ? { ...product, ...(body.updates || {}) } : product
      )
      await store.setJSON(PRODUCTS_KEY, nextProducts)
      return json({ products: nextProducts, categories })
    }

    if (request.method === 'DELETE' && body.resource === 'product') {
      const nextProducts = products.filter((product) => product.id !== body.id)
      await store.setJSON(PRODUCTS_KEY, nextProducts)
      return json({ products: nextProducts, categories })
    }

    if (request.method === 'POST' && body.resource === 'category') {
      const clean = String(body.name || '').trim()
      if (!clean) return json({ error: 'Category name is required.' }, { status: 400 })
      const nextCategories = categories.includes(clean) ? categories : [...categories, clean]
      await store.setJSON(CATEGORIES_KEY, nextCategories)
      return json({ products, categories: nextCategories })
    }

    if (request.method === 'DELETE' && body.resource === 'category') {
      const nextCategories = categories.filter((category) => category !== body.name)
      await store.setJSON(CATEGORIES_KEY, nextCategories)
      return json({ products, categories: nextCategories })
    }

    return json({ error: 'Unsupported catalog request.' }, { status: 400 })
  } catch (error) {
    console.error('Catalog function failed:', error)
    return json({ error: 'Catalog backend failed.' }, { status: 500 })
  }
}
