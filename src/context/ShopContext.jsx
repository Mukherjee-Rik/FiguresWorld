import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { STORAGE_KEYS, loadFromStorage, saveToStorage } from '../utils/storage.js'
import {
  createCategory,
  createProduct,
  getCatalog,
  removeCategory,
  removeProduct,
  saveProduct,
} from '../utils/catalogApi.js'

const ShopContext = createContext(null)
const LOCAL_CATALOG_MESSAGE =
  'Catalog backend is unavailable, so changes are being saved in this browser only. Use Netlify Dev or deploy the Netlify functions for a shared catalog.'

export const useShop = () => {
  const ctx = useContext(ShopContext)
  if (!ctx) throw new Error('useShop must be used inside ShopProvider')
  return ctx
}

export function ShopProvider({ children }) {
  // Products/categories use the backend when available, with a local dev fallback.
  const [customProducts, setCustomProducts] = useState([])
  const [customCategories, setCustomCategories] = useState([])
  const [catalogLoading, setCatalogLoading] = useState(true)
  const [catalogError, setCatalogError] = useState('')
  // Cart
  const [cart, setCart] = useState(() => loadFromStorage(STORAGE_KEYS.CART, []))
  // Admin auth is intentionally not persisted, so /admin always asks for a password on a fresh visit.
  const [isAdmin, setIsAdmin] = useState(false)

  const refreshCatalog = useCallback(async () => {
    setCatalogLoading(true)
    setCatalogError('')

    try {
      const catalog = await getCatalog()
      setCustomProducts(catalog.products || [])
      setCustomCategories(catalog.categories || [])
      if (catalog.localOnly) setCatalogError(LOCAL_CATALOG_MESSAGE)
    } catch (error) {
      setCatalogError(error.message || 'Could not load backend catalog.')
    } finally {
      setCatalogLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshCatalog()
  }, [refreshCatalog])

  // Persist per-visitor state only.
  useEffect(() => saveToStorage(STORAGE_KEYS.CART, cart), [cart])

  const products = useMemo(() => [...customProducts], [customProducts])

  // Categories saved in the backend.
  const categories = useMemo(() => {
    const set = new Set(customCategories)
    return Array.from(set)
  }, [customCategories])

  // --- Product CRUD ---
  const addProduct = async (product) => {
    const catalog = await createProduct(product)
    setCustomProducts(catalog.products || [])
    setCustomCategories(catalog.categories || [])
    setCatalogError(catalog.localOnly ? LOCAL_CATALOG_MESSAGE : '')
    return catalog.product
  }

  const updateProduct = async (id, updates) => {
    const catalog = await saveProduct(id, updates)
    setCustomProducts(catalog.products || [])
    setCustomCategories(catalog.categories || [])
    setCatalogError(catalog.localOnly ? LOCAL_CATALOG_MESSAGE : '')
  }

  const deleteProduct = async (id) => {
    const catalog = await removeProduct(id)
    setCustomProducts(catalog.products || [])
    setCustomCategories(catalog.categories || [])
    setCatalogError(catalog.localOnly ? LOCAL_CATALOG_MESSAGE : '')
  }

  const isCustomProduct = (id) => customProducts.some((p) => p.id === id)

  // --- Category CRUD ---
  const addCategory = async (name) => {
    const clean = name.trim()
    if (!clean) return
    if (categories.includes(clean)) return
    const catalog = await createCategory(clean)
    setCustomProducts(catalog.products || [])
    setCustomCategories(catalog.categories || [])
    setCatalogError(catalog.localOnly ? LOCAL_CATALOG_MESSAGE : '')
  }

  const deleteCategory = async (name) => {
    const catalog = await removeCategory(name)
    setCustomProducts(catalog.products || [])
    setCustomCategories(catalog.categories || [])
    setCatalogError(catalog.localOnly ? LOCAL_CATALOG_MESSAGE : '')
  }

  // --- Cart ---
  const addToCart = (product, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === product.id)
      if (existing) {
        return prev.map((i) =>
          i.id === product.id ? { ...i, quantity: i.quantity + quantity } : i
        )
      }
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.images?.[0] || '',
          quantity,
        },
      ]
    })
  }

  const updateCartQty = (id, quantity) => {
    if (quantity <= 0) {
      removeFromCart(id)
      return
    }
    setCart((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantity } : i))
    )
  }

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((i) => i.id !== id))
  }

  const clearCart = () => setCart([])

  const cartTotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0)

  // --- Admin auth ---
  const loginAdmin = (password) => {
    if (password === 'suman@sarkar') {
      setIsAdmin(true)
      return true
    }
    return false
  }
  const logoutAdmin = () => setIsAdmin(false)

  const value = {
    products,
    categories,
    catalogLoading,
    catalogError,
    refreshCatalog,
    customCategories,
    customProducts,
    isCustomProduct,
    addProduct,
    updateProduct,
    deleteProduct,
    addCategory,
    deleteCategory,
    cart,
    cartTotal,
    cartCount,
    addToCart,
    updateCartQty,
    removeFromCart,
    clearCart,
    isAdmin,
    loginAdmin,
    logoutAdmin,
  }

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>
}
