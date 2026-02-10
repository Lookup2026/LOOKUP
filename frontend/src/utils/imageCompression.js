/**
 * Compresse une image avant upload
 * Reduit la taille a max 1200px et qualite 0.8
 * Resultat: ~200-400KB au lieu de 3-5MB
 */
export async function compressImage(file, maxWidth = 1200, quality = 0.8) {
  return new Promise((resolve, reject) => {
    // Si ce n'est pas une image, retourner tel quel
    if (!file.type.startsWith('image/')) {
      resolve(file)
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        // Calculer les dimensions
        let width = img.width
        let height = img.height

        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }

        // Creer le canvas
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)

        // Convertir en blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              // Creer un nouveau File avec le meme nom
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              })
              console.log(`Image compressee: ${(file.size / 1024).toFixed(0)}KB -> ${(compressedFile.size / 1024).toFixed(0)}KB`)
              resolve(compressedFile)
            } else {
              resolve(file) // Fallback si compression echoue
            }
          },
          'image/jpeg',
          quality
        )
      }
      img.onerror = () => resolve(file) // Fallback si erreur
      img.src = e.target.result
    }
    reader.onerror = () => resolve(file) // Fallback si erreur
    reader.readAsDataURL(file)
  })
}

/**
 * Compresse plusieurs images en parallele
 */
export async function compressImages(files, maxWidth = 1200, quality = 0.8) {
  return Promise.all(files.map(file => compressImage(file, maxWidth, quality)))
}
