const UPLOAD_API_URL = import.meta.env.VITE_UPLOAD_API_URL || '/.netlify/functions/upload'

const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error('Could not read image file.'))
    reader.readAsDataURL(file)
  })

const uploadImagesLocally = async (files) => Promise.all(files.map(fileToDataUrl))

export const uploadProductImages = async (files) => {
  const formData = new FormData()
  files.forEach((file) => formData.append('images', file))

  try {
    const response = await fetch(UPLOAD_API_URL, {
      method: 'POST',
      body: formData,
    })

    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
      throw new Error(data.error || 'Image upload backend is not available.')
    }

    return data.urls || []
  } catch (error) {
    console.warn('Image upload backend unavailable. Using browser storage fallback.', error)
    return uploadImagesLocally(files)
  }
}
