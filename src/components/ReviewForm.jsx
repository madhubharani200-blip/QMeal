import { useState } from 'react'
import RatingStars from './RatingStars'
import { createReview } from '../services/reviewService'
import { useAuth } from '../hooks/useAuth'
import { MessageSquarePlus, CheckCircle2, X } from 'lucide-react'

export default function ReviewForm({ order, item, onClose, onSubmitted }) {
  const { user } = useAuth()
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!rating) {
      setError('Please select a rating star')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      await createReview({
        orderId: order.id,
        itemId: item.itemId,
        itemName: item.name,
        outletId: order.outletId,
        studentId: user?.uid || order.studentId,
        studentName: user?.name || 'Student',
        rating,
        comment,
      })
      setDone(true)
      setTimeout(() => {
        onSubmitted && onSubmitted()
      }, 1200)
    } catch (err) {
      setError(err.message || 'Failed to submit review')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/80 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-stone-900 p-6 shadow-2xl">
        <button
          onClick={onClose}
          type="button"
          className="absolute top-4 right-4 rounded-xl p-1.5 text-stone-400 hover:bg-stone-800 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        {done ? (
          <div className="py-8 text-center space-y-3">
            <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-400 animate-bounce" />
            <h3 className="text-xl font-bold text-white">Thank You for Your Feedback!</h3>
            <p className="text-xs text-stone-400">
              Your rating helps improve campus food quality and reduces food waste.
            </p>
          </div>
        ) : (
          <div>
            <div className="mb-4 flex items-center gap-2">
              <MessageSquarePlus className="h-5 w-5 text-amber-400" />
              <h3 className="text-lg font-bold text-white">Rate & Review Item</h3>
            </div>

            <p className="mb-4 text-xs text-stone-300">
              How was <span className="font-bold text-emerald-400">{item.name}</span> from order #{order.orderCode}?
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="rounded-2xl bg-stone-950/70 p-4 text-center border border-stone-800">
                <label className="mb-2 block text-xs font-semibold text-stone-400">
                  Tap stars to rate
                </label>
                <div className="flex justify-center">
                  <RatingStars value={rating} onChange={setRating} size={28} showValue />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-stone-300">
                  Comments or Suggestions (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Perfectly cooked, served fast and hot!"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full rounded-xl border border-stone-700 bg-stone-950 p-3 text-xs text-white placeholder-stone-500 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              {error && <p className="text-xs text-rose-400">{error}</p>}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 rounded-xl border border-stone-700 py-2.5 text-xs font-bold text-stone-300 hover:bg-stone-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white hover:bg-emerald-500 disabled:opacity-60"
                >
                  {submitting ? 'Submitting…' : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
