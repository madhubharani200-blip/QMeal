import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { storage, useFirebase } from './firebase'

/**
 * Uploads a profile picture to Firebase Storage or converts to base64 Data URL as fallback.
 * @param {string} userId - User UID
 * @param {File|Blob} file - The image file
 * @returns {Promise<string>} Download URL or base64 string
 */
export async function uploadProfilePicture(userId, file) {
  if (!file) throw new Error('No file provided')

  if (useFirebase && storage) {
    const ext = file.name ? file.name.split('.').pop() : 'jpg'
    const storageRef = ref(storage, `users/${userId}/profile_${Date.now()}.${ext}`)
    const snapshot = await uploadBytes(storageRef, file, {
      contentType: file.type || 'image/jpeg',
    })
    return await getDownloadURL(snapshot.ref)
  }

  // Fallback to Data URL for offline / local mode
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = (error) => reject(error)
    reader.readAsDataURL(file)
  })
}

/**
 * Uploads a menu item image to Firebase Storage or converts to base64 Data URL.
 * @param {string} itemId - Menu Item ID
 * @param {File|Blob} file - The image file
 * @returns {Promise<string>}
 */
export async function uploadMenuItemImage(itemId, file) {
  if (!file) throw new Error('No file provided')

  if (useFirebase && storage) {
    const ext = file.name ? file.name.split('.').pop() : 'jpg'
    const storageRef = ref(storage, `menu/${itemId}_${Date.now()}.${ext}`)
    const snapshot = await uploadBytes(storageRef, file, {
      contentType: file.type || 'image/jpeg',
    })
    return await getDownloadURL(snapshot.ref)
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = (error) => reject(error)
    reader.readAsDataURL(file)
  })
}
