const UPI_REGEX = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/

export function validateUpiId(upiId) {
  if (!upiId || typeof upiId !== 'string') return false
  return UPI_REGEX.test(upiId.trim())
}

export function generateTransactionId() {
  const n = Math.floor(Math.random() * 1e12)
    .toString()
    .padStart(12, '0')
  return `TXN${n}`
}

/** Simulated UPI — 2s fake processing, always succeeds in demo */
export function simulateUpiPayment(upiId) {
  return new Promise((resolve, reject) => {
    if (!validateUpiId(upiId)) {
      reject(new Error('Invalid UPI ID. Use format name@bank'))
      return
    }
    setTimeout(() => {
      resolve({
        ok: true,
        transactionId: generateTransactionId(),
        paymentStatus: 'paid',
        paymentMethod: 'upi',
      })
    }, 2000)
  })
}

export function buildCodPayment() {
  return {
    ok: true,
    transactionId: null,
    paymentStatus: 'pending',
    paymentMethod: 'cod',
  }
}
