/**
 * Razorpay TEST MODE Payment Gateway Service
 */

const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_campus_demo'

export function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true)
      return
    }
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

export async function processRazorpayPayment({
  amount,
  orderCode,
  outletName = 'QMeal Canteen',
  userEmail = 'student@campus.edu',
  userName = 'Student',
  userPhone = '9876543210',
}) {
  const loaded = await loadRazorpayScript()
  const amountInPaise = Math.round(amount * 100)

  return new Promise((resolve, reject) => {
    if (loaded && window.Razorpay && RAZORPAY_KEY && !RAZORPAY_KEY.includes('campus_demo')) {
      const options = {
        key: RAZORPAY_KEY,
        amount: amountInPaise,
        currency: 'INR',
        name: 'QMeal Campus Preorder',
        description: `Preorder for ${outletName} — Order #${orderCode}`,
        image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&q=80',
        handler: function (response) {
          resolve({
            ok: true,
            razorpayPaymentId: response.razorpay_payment_id || `pay_test_${Date.now()}`,
            paymentStatus: 'paid',
            paymentMethod: 'razorpay',
          })
        },
        prefill: {
          name: userName,
          email: userEmail,
          contact: userPhone,
        },
        theme: {
          color: '#059669',
        },
        modal: {
          ondismiss: function () {
            reject(new Error('Razorpay payment modal closed by user.'))
          },
        },
      }

      try {
        const rzp = new window.Razorpay(options)
        rzp.on('payment.failed', function (response) {
          reject(new Error(response.error?.description || 'Razorpay test payment failed.'))
        })
        rzp.open()
        return
      } catch (err) {
        console.warn('Native Razorpay script failed, fallback to test simulator:', err)
      }
    }

    // Fallback Simulated Test Gateway (Simulates authentic Razorpay Test Mode modal behavior)
    setTimeout(() => {
      resolve({
        ok: true,
        razorpayPaymentId: `pay_test_${Math.floor(Math.random() * 1e12)}`,
        paymentStatus: 'paid',
        paymentMethod: 'razorpay',
      })
    }, 1200)
  })
}

export function buildCodPayment() {
  return {
    ok: true,
    razorpayPaymentId: null,
    paymentStatus: 'pending',
    paymentMethod: 'cod',
  }
}
