import { useState, useRef } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useOutlet } from '../hooks/useOutlet'
import { uploadProfilePicture } from '../services/storageService'
import { Link, useNavigate } from 'react-router-dom'
import {
  User,
  Camera,
  Mail,
  Phone,
  ShieldCheck,
  Building2,
  Calendar,
  AlertTriangle,
  ArrowLeft,
  LogOut,
  Save,
  CheckCircle2,
} from 'lucide-react'

export default function Profile() {
  const { user, updateUserProfile, logout } = useAuth()
  const { outlets } = useOutlet()
  const navigate = useNavigate()
  const fileInputRef = useRef(null)

  const [name, setName] = useState(user?.name || '')
  const [phone, setPhone] = useState(user?.phone || '')
  const [regNo, setRegNo] = useState(user?.registrationNumber || '')
  const [empId, setEmpId] = useState(user?.employeeId || '')
  const [busy, setBusy] = useState(false)
  const [uploadingImg, setUploadingImg] = useState(false)
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')

  const assignedOutlet = outlets.find((o) => o.id === user?.outletId)

  const handleSave = async (e) => {
    e.preventDefault()
    setBusy(true)
    setMsg('')
    setError('')
    try {
      await updateUserProfile({
        name,
        phone,
        registrationNumber: user?.role === 'student' ? regNo : null,
        employeeId: user?.role !== 'student' ? empId : null,
      })
      setMsg('Profile updated successfully!')
      setTimeout(() => setMsg(''), 3000)
    } catch (err) {
      setError(err.message || 'Failed to update profile')
    } finally {
      setBusy(false)
    }
  }

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file || !user) return
    setUploadingImg(true)
    setError('')
    try {
      const url = await uploadProfilePicture(user.uid, file)
      await updateUserProfile({ profilePictureUrl: url })
      setMsg('Profile photo updated!')
      setTimeout(() => setMsg(''), 3000)
    } catch (err) {
      setError(err.message || 'Failed to upload photo')
    } finally {
      setUploadingImg(false)
    }
  }

  const backLink =
    user?.role === 'chef'
      ? '/chef'
      : user?.role === 'staff'
        ? '/staff'
        : user?.role === 'manager'
          ? '/manager'
          : '/student'

  const noShowRate =
    user?.totalOrders > 0
      ? Math.round(((user?.noShowCount || 0) / user.totalOrders) * 100)
      : 0

  return (
    <div className="min-h-screen bg-stone-950 font-sans text-stone-100">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-stone-800 bg-stone-950/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3 sm:px-6">
          <Link
            to={backLink}
            className="inline-flex items-center gap-2 text-xs font-bold text-stone-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </Link>

          <button
            type="button"
            onClick={logout}
            className="inline-flex items-center gap-1.5 rounded-xl border border-rose-900/50 bg-rose-950/30 px-3 py-1.5 text-xs font-bold text-rose-400 hover:bg-rose-900/50"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Form */}
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <div className="rounded-3xl border border-white/10 bg-stone-900/90 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
          {/* Avatar Section */}
          <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6 pb-6 border-b border-stone-800">
            <div className="relative group">
              <div className="h-24 w-24 overflow-hidden rounded-full border-2 border-emerald-500/50 bg-stone-950 shadow-xl flex items-center justify-center">
                {user?.profilePictureUrl ? (
                  <img
                    src={user.profilePictureUrl}
                    alt={user.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-3xl font-black text-emerald-400 uppercase">
                    {user?.name ? user.name[0] : 'U'}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingImg}
                className="absolute bottom-0 right-0 rounded-full bg-emerald-600 p-2 text-white shadow-md hover:bg-emerald-500 transition"
                title="Upload Profile Picture"
              >
                <Camera className="h-4 w-4" />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/*"
                className="hidden"
              />
            </div>

            <div className="text-center sm:text-left space-y-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="text-2xl font-black text-white">{user?.name}</h1>
                <span className="rounded-full bg-emerald-950 px-3 py-0.5 text-xs font-bold text-emerald-400 border border-emerald-800/60 uppercase">
                  {user?.role}
                </span>
              </div>
              <p className="text-xs text-stone-400">{user?.email}</p>
              {user?.registrationNumber && (
                <p className="text-xs font-mono font-bold text-amber-400">
                  Reg No: {user.registrationNumber}
                </p>
              )}
              {user?.employeeId && (
                <p className="text-xs font-mono font-bold text-cyan-400">
                  Employee ID: {user.employeeId} {assignedOutlet ? `• ${assignedOutlet.name}` : ''}
                </p>
              )}
            </div>
          </div>

          {/* Stats Badges */}
          <div className="grid grid-cols-2 gap-4 py-6 sm:grid-cols-3 border-b border-stone-800">
            <div className="rounded-2xl border border-stone-800 bg-stone-950/60 p-4">
              <span className="text-xs font-medium text-stone-400">Total Orders</span>
              <div className="mt-1 text-2xl font-black text-white">
                {user?.totalOrders || 0}
              </div>
            </div>

            <div className="rounded-2xl border border-stone-800 bg-stone-950/60 p-4">
              <span className="text-xs font-medium text-stone-400">No-Show Count</span>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-2xl font-black text-amber-400">
                  {user?.noShowCount || 0}
                </span>
                <span className="text-[10px] text-stone-500">
                  ({noShowRate}% rate)
                </span>
              </div>
            </div>

            <div className="col-span-2 rounded-2xl border border-stone-800 bg-stone-950/60 p-4 sm:col-span-1">
              <span className="text-xs font-medium text-stone-400">Standing</span>
              <div className="mt-1 flex items-center gap-1.5 text-sm font-bold text-emerald-400">
                <ShieldCheck className="h-4 w-4" />
                <span>{(user?.noShowCount || 0) > 3 ? 'Caution' : 'Good Standing'}</span>
              </div>
            </div>
          </div>

          {/* Edit Form */}
          <form onSubmit={handleSave} className="space-y-4 pt-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-stone-300">
              Account Details
            </h3>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold text-stone-300">
                  Full Name
                </label>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-stone-700 bg-stone-950 p-2.5 text-sm text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-stone-300">
                  Phone Number
                </label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 9876543210"
                  className="w-full rounded-xl border border-stone-700 bg-stone-950 p-2.5 text-sm text-white outline-none focus:border-emerald-500"
                />
              </div>

              {user?.role === 'student' ? (
                <div>
                  <label className="mb-1 block text-xs font-semibold text-stone-300">
                    Student Registration Number
                  </label>
                  <input
                    value={regNo}
                    onChange={(e) => setRegNo(e.target.value.toUpperCase())}
                    className="w-full rounded-xl border border-stone-700 bg-stone-950 p-2.5 text-sm uppercase text-white outline-none focus:border-emerald-500"
                  />
                </div>
              ) : (
                <div>
                  <label className="mb-1 block text-xs font-semibold text-stone-300">
                    Employee ID
                  </label>
                  <input
                    value={empId}
                    onChange={(e) => setEmpId(e.target.value.toUpperCase())}
                    className="w-full rounded-xl border border-stone-700 bg-stone-950 p-2.5 text-sm uppercase text-white outline-none focus:border-emerald-500"
                  />
                </div>
              )}

              <div>
                <label className="mb-1 block text-xs font-semibold text-stone-300">
                  Email (Permanent)
                </label>
                <input
                  disabled
                  value={user?.email || ''}
                  className="w-full rounded-xl border border-stone-800 bg-stone-950/40 p-2.5 text-sm text-stone-500 cursor-not-allowed"
                />
              </div>
            </div>

            {msg && (
              <div className="flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-950/60 p-3 text-xs text-emerald-300">
                <CheckCircle2 className="h-4 w-4" />
                <span>{msg}</span>
              </div>
            )}

            {error && (
              <div className="rounded-xl border border-rose-500/40 bg-rose-950/60 p-3 text-xs text-rose-300">
                {error}
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={busy}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg hover:bg-emerald-500 disabled:opacity-60"
              >
                <Save className="h-4 w-4" />
                <span>{busy ? 'Saving Changes…' : 'Save Profile'}</span>
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
