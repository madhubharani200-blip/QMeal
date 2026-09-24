import QRCode from 'qrcode'

/** Encode orderCode into a QR data URL for student confirmation */
export async function generateOrderQR(orderCode) {
  return QRCode.toDataURL(JSON.stringify({ type: 'qmeal_order', orderCode }), {
    width: 280,
    margin: 2,
    color: { dark: '#1a5c3a', light: '#ffffff' },
  })
}

/** Visual-only mock UPI QR (not a real payment link) */
export async function generateMockUpiQR(upiId, amount) {
  const payload = `upi://pay?pa=${encodeURIComponent(upiId)}&am=${amount}&pn=QMeal&tn=Simulated`
  return QRCode.toDataURL(payload, {
    width: 200,
    margin: 2,
    color: { dark: '#0f3d26', light: '#ffffff' },
  })
}

export function parseScannedOrder(text) {
  try {
    const data = JSON.parse(text)
    if (data?.orderCode) return data.orderCode
  } catch {
    /* plain code */
  }
  const trimmed = String(text || '').trim()
  if (/^QM\d+/i.test(trimmed)) return trimmed.toUpperCase()
  return null
}
