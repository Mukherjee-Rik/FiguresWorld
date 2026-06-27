import { randomUUID } from 'crypto'
import { getStore } from '@netlify/blobs'

const STORE_NAME = 'figure-world-images'

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

const allowedTypes = new Map([
  ['image/jpeg', 'jpg'],
  ['image/png', 'png'],
  ['image/webp', 'webp'],
  ['image/gif', 'gif'],
])

const json = (body, init = {}) =>
  Response.json(body, {
    ...init,
    headers: {
      ...headers,
      ...(init.headers || {}),
    },
  })

export default async function upload(request) {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers })
  }

  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed.' }, { status: 405 })
  }

  try {
    const formData = await request.formData()
    const files = formData.getAll('images')

    if (files.length === 0) {
      return json({ error: 'No images uploaded.' }, { status: 400 })
    }

    const store = getStore(STORE_NAME)
    const urls = []

    for (const file of files) {
      if (!file || typeof file.arrayBuffer !== 'function') continue

      const extension = allowedTypes.get(file.type)
      if (!extension) {
        return json({ error: 'Only JPG, PNG, WEBP, and GIF images are allowed.' }, { status: 400 })
      }

      const key = `${Date.now()}-${randomUUID()}.${extension}`
      await store.set(key, file, {
        metadata: {
          contentType: file.type,
          fileName: file.name,
        },
      })

      urls.push(`/.netlify/functions/blob-image?key=${encodeURIComponent(key)}`)
    }

    return json({ urls })
  } catch (error) {
    console.error('Upload function failed:', error)
    return json({ error: 'Image upload failed.' }, { status: 500 })
  }
}
