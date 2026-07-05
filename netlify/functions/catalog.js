import postgres from 'postgres'

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

const connectionString =
  process.env.DATABASE_URL ||
  process.env.NETLIFY_DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.NETLIFY_DATABASE_URL_UNPOOLED

let sql
let initialized = false

const getSQL = () => {
  if (!connectionString) {
    throw new Error('DATABASE_URL is not configured.')
  }

  if (!sql) {
    sql = postgres(connectionString, {
      max: 1,
      ssl: connectionString.includes('localhost') ? false : 'require',
    })
  }

  return sql
}

const json = (body, init = {}) =>
  Response.json(body, {
    ...init,
    headers: {
      ...headers,
      ...(init.headers || {}),
    },
  })

const normalizeProduct = (row) => ({
  id: String(row.id),
  name: row.name,
  price: Number(row.price || 0),
  category: row.category || '',
  description: row.description || '',
  stock: row.stock || 'In Stock',
  images: Array.isArray(row.image_urls) ? row.image_urls : [],
  createdAt: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
})

const ensureSchema = async (db) => {
  if (initialized) return

  await db`CREATE EXTENSION IF NOT EXISTS pgcrypto`
  await db`
    CREATE TABLE IF NOT EXISTS categories (
      id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
      name text NOT NULL UNIQUE,
      created_at timestamptz NOT NULL DEFAULT now()
    )
  `
  await db`
    CREATE TABLE IF NOT EXISTS products (
      id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
      name text NOT NULL,
      price numeric NOT NULL,
      category_id text NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
      description text DEFAULT '',
      stock text NOT NULL DEFAULT 'In Stock',
      image_urls jsonb NOT NULL DEFAULT '[]'::jsonb,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    )
  `

  initialized = true
}

const readCatalog = async (db) => {
  const categories = await db`
    SELECT name
    FROM categories
    ORDER BY name ASC
  `

  const products = await db`
    SELECT
      products.id,
      products.name,
      products.price,
      products.description,
      products.stock,
      products.image_urls,
      products.created_at,
      categories.name AS category
    FROM products
    JOIN categories ON categories.id = products.category_id
    ORDER BY products.created_at DESC
  `

  return {
    products: products.map(normalizeProduct),
    categories: categories.map((category) => category.name),
  }
}

const getCategoryByName = async (db, name) => {
  const rows = await db`
    SELECT id, name
    FROM categories
    WHERE name = ${name}
    LIMIT 1
  `

  return rows[0]
}

const requireCategory = async (db, name) => {
  const clean = String(name || '').trim()
  if (!clean) throw new Error('Category is required.')

  const category = await getCategoryByName(db, clean)
  if (!category) throw new Error('Please add this category before saving a product.')

  return category
}

const createCategory = async (db, name) => {
  const clean = String(name || '').trim()
  if (!clean) throw new Error('Category name is required.')

  await db`
    INSERT INTO categories (name)
    VALUES (${clean})
    ON CONFLICT (name) DO NOTHING
  `
}

const saveProduct = async (db, id, updates) => {
  const category = await requireCategory(db, updates.category)

  await db`
    UPDATE products
    SET
      name = ${String(updates.name || '').trim()},
      price = ${Number(updates.price || 0)},
      category_id = ${category.id},
      description = ${String(updates.description || '').trim()},
      stock = ${updates.stock || 'In Stock'},
      image_urls = ${db.json(Array.isArray(updates.images) ? updates.images : [])},
      updated_at = now()
    WHERE id = ${id}
  `
}

export default async function catalog(request) {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers })
  }

  try {
    const db = getSQL()
    await ensureSchema(db)

    if (request.method === 'GET') {
      return json(await readCatalog(db))
    }

    const body = await request.json().catch(() => ({}))

    if (request.method === 'POST' && body.resource === 'category') {
      await createCategory(db, body.name)
      return json(await readCatalog(db))
    }

    if (request.method === 'DELETE' && body.resource === 'category') {
      const name = String(body.name || '').trim()
      const category = await getCategoryByName(db, name)

      if (category) {
        const used = await db`
          SELECT 1
          FROM products
          WHERE category_id = ${category.id}
          LIMIT 1
        `

        if (used.length > 0) {
          return json(
            { error: 'This category is used by existing products. Move or delete those products first.' },
            { status: 400 }
          )
        }

        await db`DELETE FROM categories WHERE id = ${category.id}`
      }

      return json(await readCatalog(db))
    }

    if (request.method === 'POST' && body.resource === 'product') {
      const product = body.product || {}
      const category = await requireCategory(db, product.category)

      const rows = await db`
        INSERT INTO products (
          name,
          price,
          category_id,
          description,
          stock,
          image_urls
        )
        VALUES (
          ${String(product.name || '').trim()},
          ${Number(product.price || 0)},
          ${category.id},
          ${String(product.description || '').trim()},
          ${product.stock || 'In Stock'},
          ${db.json(Array.isArray(product.images) ? product.images : [])}
        )
        RETURNING id
      `

      const catalog = await readCatalog(db)
      const created = catalog.products.find((item) => item.id === String(rows[0].id))
      return json({ ...catalog, product: created })
    }

    if (request.method === 'PUT' && body.resource === 'product') {
      await saveProduct(db, body.id, body.updates || {})
      return json(await readCatalog(db))
    }

    if (request.method === 'DELETE' && body.resource === 'product') {
      await db`DELETE FROM products WHERE id = ${body.id}`
      return json(await readCatalog(db))
    }

    return json({ error: 'Unsupported catalog request.' }, { status: 400 })
  } catch (error) {
    console.error('Catalog function failed:', error)
    return json({ error: error.message || 'Catalog backend failed.' }, { status: 500 })
  }
}
