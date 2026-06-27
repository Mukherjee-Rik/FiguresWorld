import { getStore } from '@netlify/blobs'

const STORE_NAME = 'figure-world-images'

export default async function blobImage(request) {
  const url = new URL(request.url)
  const key = url.searchParams.get('key')

  if (!key) {
    return new Response('Missing image key.', { status: 400 })
  }

  try {
    const store = getStore(STORE_NAME)
    const result = await store.getWithMetadata(key, { type: 'arrayBuffer' })

    if (!result?.data) {
      return new Response('Image not found.', { status: 404 })
    }

    return new Response(result.data, {
      headers: {
        'Content-Type': result.metadata?.contentType || 'application/octet-stream',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (error) {
    console.error('Image function failed:', error)
    return new Response('Image backend failed.', { status: 500 })
  }
}
