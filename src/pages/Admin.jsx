import { useState } from 'react'
import { useShop } from '../context/ShopContext.jsx'
import { formatPrice } from '../utils/storage.js'
import { uploadProductImages } from '../utils/upload.js'

const STOCK_OPTIONS = ['In Stock', 'Limited', 'Out of Stock']
const EMPTY_FORM = {
  name: '',
  price: '',
  category: '',
  description: '',
  stock: 'In Stock',
  images: [],
}

export default function Admin() {
  const {
    isAdmin, loginAdmin, logoutAdmin,
    products, customProducts, isCustomProduct,
    addProduct, updateProduct, deleteProduct,
    categories, catalogLoading, catalogError,
    customCategories, addCategory, deleteCategory,
  } = useShop()

  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')

  const [tab, setTab] = useState('products')
  const [form, setForm] = useState(EMPTY_FORM)
  const [editingId, setEditingId] = useState(null)
  const [newCat, setNewCat] = useState('')
  const [uploadingImages, setUploadingImages] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [savingProduct, setSavingProduct] = useState(false)
  const [saveError, setSaveError] = useState('')

  // ---------- Login screen ----------
  if (!isAdmin) {
    return (
      <div className="container admin-login">
        <div className="login-card">
          <h1>Admin <span className="gradient-text">Access</span></h1>
          <p className="login-note">
            😊 Hello <strong>Sumit Ji</strong> 
            <br /> Welcome Back
          </p>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                if (!loginAdmin(password)) setLoginError('Incorrect password')
              }
            }}
          />
          {loginError && <div className="error-msg">{loginError}</div>}
          <button
            className="btn btn-primary"
            onClick={() => {
              if (!loginAdmin(password)) setLoginError('Incorrect password')
            }}
          >
            Enter Admin
          </button>
        </div>
      </div>
    )
  }

  // ---------- Image handling ----------
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return
    setUploadingImages(true)
    setUploadError('')

    try {
      const imageUrls = await uploadProductImages(files)
      setForm((f) => ({ ...f, images: [...f.images, ...imageUrls] }))
    } catch (error) {
      setUploadError(error.message || 'Image upload failed. Make sure the backend is running.')
    } finally {
      setUploadingImages(false)
      e.target.value = ''
    }
  }

  const removeImageFromForm = (idx) => {
    setForm((f) => ({
      ...f,
      images: f.images.filter((_, i) => i !== idx),
    }))
  }

  // ---------- Submit product ----------
  const submitProduct = async (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.price || !form.category) {
      alert('Please fill name, price and category.')
      return
    }
    setSavingProduct(true)
    setSaveError('')

    const payload = {
      name: form.name.trim(),
      price: Number(form.price),
      category: form.category,
      description: form.description.trim(),
      stock: form.stock,
      images: form.images,
    }

    try {
      if (editingId) {
        await updateProduct(editingId, payload)
        setEditingId(null)
      } else {
        await addProduct(payload)
      }
      setForm(EMPTY_FORM)
    } catch (error) {
      setSaveError(error.message || 'Could not save product to backend.')
    } finally {
      setSavingProduct(false)
    }
  }

  const startEdit = (p) => {
    if (!isCustomProduct(p.id)) {
      alert('This product cannot be edited from the admin panel.')
      return
    }
    setEditingId(p.id)
    setForm({
      name: p.name,
      price: p.price,
      category: p.category,
      description: p.description || '',
      stock: p.stock || 'In Stock',
      images: p.images || [],
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setForm(EMPTY_FORM)
  }

  const handleDelete = (p) => {
    if (!isCustomProduct(p.id)) {
      alert('This product cannot be deleted from the admin panel.')
      return
    }
    if (confirm(`Delete "${p.name}"?`)) {
      deleteProduct(p.id).catch((error) => {
        alert(error.message || 'Could not delete product from backend.')
      })
    }
  }

  // ---------- Categories ----------
  const handleAddCategory = async (e) => {
    e.preventDefault()
    if (!newCat.trim()) return
    try {
      await addCategory(newCat)
      setNewCat('')
    } catch (error) {
      alert(error.message || 'Could not save category to backend.')
    }
  }

  return (
    <div className="container admin-page">
      <div className="admin-head">
        <div>
          <h1>Admin <span className="gradient-text">Panel</span></h1>
          <p>Manage products, categories & inventory.</p>
        </div>
        <button className="btn btn-ghost" onClick={logoutAdmin}>Logout</button>
      </div>

      <div className="warn-banner">
        ⚠️ This admin panel is exclusively developed for <strong>Suman Sarkar </strong>. Any unauthorized access, copying, modification, redistribution, or commercial use is strictly prohibited. All rights reserved. Violators may face legal action.
      </div>
      {catalogLoading && <div className="warn-banner">Loading backend catalog...</div>}
      {catalogError && <div className="error-msg">{catalogError}</div>}

      <div className="admin-tabs">
        <button
          className={tab === 'products' ? 'active' : ''}
          onClick={() => setTab('products')}
        >
          Products ({products.length})
        </button>
        <button
          className={tab === 'categories' ? 'active' : ''}
          onClick={() => setTab('categories')}
        >
          Categories ({categories.length})
        </button>
      </div>

      {tab === 'products' && (
        <>
          {/* Product Form */}
          <section className="admin-card">
            <h2>{editingId ? 'Edit Product' : 'Add Product'}</h2>
            <form onSubmit={submitProduct} className="admin-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Product Name *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Premium Collector Figure"
                  />
                </div>
                <div className="form-group">
                  <label>Price (₹) *</label>
                  <input
                    type="number"
                    min="0"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    placeholder="4999"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Category *</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                  >
                    <option value="">-- Select --</option>
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Stock</label>
                  <select
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                  >
                    {STOCK_OPTIONS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  rows="4"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder={'Write a short sentence, then add points:\n- Mini Anime Figure\n- Premium Metal/3D Keychain\n- Surprise Bonus Item'}
                />
              </div>

              <div className="form-group">
                <label>Images (multiple)</label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  disabled={uploadingImages}
                />
                <small className="hint">
                  {uploadingImages
                    ? 'Uploading images...'
                    : 'Images use backend storage when available, with a browser fallback for local development.'}
                </small>
                {uploadError && <div className="error-msg">{uploadError}</div>}

                {form.images.length > 0 && (
                  <div className="img-preview-grid">
                    {form.images.map((src, i) => (
                      <div key={i} className="img-preview">
                        <img src={src} alt={`upload ${i}`} />
                        <button
                          type="button"
                          onClick={() => removeImageFromForm(i)}
                          title="Remove image"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  {savingProduct ? 'Saving...' : editingId ? 'Update Product' : 'Add Product'}
                </button>
                {saveError && <div className="error-msg">{saveError}</div>}
                {editingId && (
                  <button type="button" className="btn btn-ghost" onClick={cancelEdit}>
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </section>

          {/* Product List */}
          <section className="admin-card">
            <h2>All Products</h2>
            {customProducts.length === 0 && (
              <p className="hint">No products yet. Add your first product above.</p>
            )}
            <div className="admin-product-list">
              {products.map((p) => (
                <div key={p.id} className="admin-prod-row">
                  <div className="admin-prod-img">
                    {p.images?.[0] ? <img src={p.images[0]} alt={p.name} /> : <div className="no-img">—</div>}
                  </div>
                  <div className="admin-prod-info">
                    <strong>{p.name}</strong>
                    <span>{p.category} • {formatPrice(p.price)} • {p.stock}</span>
                  </div>
                  <div className="admin-prod-actions">
                    <button
                      className="btn-mini"
                      onClick={() => startEdit(p)}
                      disabled={!isCustomProduct(p.id)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn-mini btn-danger"
                      onClick={() => handleDelete(p)}
                      disabled={!isCustomProduct(p.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      {tab === 'categories' && (
        <section className="admin-card">
          <h2>Categories</h2>
          <form onSubmit={handleAddCategory} className="cat-add-form">
            <input
              type="text"
              value={newCat}
              onChange={(e) => setNewCat(e.target.value)}
              placeholder="New category name"
            />
            <button type="submit" className="btn btn-primary">Add Category</button>
          </form>

          <div className="cat-list">
            {categories.map((c) => {
              const isCustom = customCategories.includes(c)
              const productCount = products.filter((product) => product.category === c).length
              const canDelete = isCustom && productCount === 0
              return (
                <div key={c} className="cat-row">
                  <span>{c}{productCount > 0 ? ` (${productCount} products)` : ''}</span>
                  <button
                    className="btn-mini btn-danger"
                    onClick={() => {
                      if (productCount > 0) {
                        alert('This category is used by existing products. Move or delete those products first.')
                        return
                      }
                      if (confirm(`Delete category "${c}"?`)) {
                        deleteCategory(c).catch((error) => {
                          alert(error.message || 'Could not delete category from backend.')
                        })
                      }
                    }}
                    disabled={!canDelete}
                  >
                    Delete
                  </button>
                </div>
              )
            })}
          </div>
        </section>
      )}
    </div>
  )
}
