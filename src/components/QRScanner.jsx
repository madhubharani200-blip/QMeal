import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { parseScannedOrder } from '../services/qrService'

export default function QRScanner({ onScan }) {
  const [manual, setManual] = useState('')
  const [error, setError] = useState('')
  const [scanning, setScanning] = useState(false)
  const scannerRef = useRef(null)
  const started = useRef(false)

  useEffect(() => {
    return () => {
      if (scannerRef.current && started.current) {
        scannerRef.current.stop().catch(() => {})
      }
    }
  }, [])

  const start = async () => {
    setError('')
    try {
      const scanner = new Html5Qrcode('qmeal-qr-reader')
      scannerRef.current = scanner
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 8, qrbox: { width: 220, height: 220 } },
        (decoded) => {
          const code = parseScannedOrder(decoded)
          if (code) {
            onScan(code)
            scanner.stop().catch(() => {})
            started.current = false
            setScanning(false)
          }
        },
      )
      started.current = true
      setScanning(true)
    } catch (e) {
      setError(e.message || 'Camera unavailable — use manual entry')
      setScanning(false)
    }
  }

  const stop = async () => {
    if (scannerRef.current && started.current) {
      await scannerRef.current.stop().catch(() => {})
      started.current = false
    }
    setScanning(false)
  }

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-stone-100">
      <div id="qmeal-qr-reader" className="overflow-hidden rounded-xl" />
      <div className="mt-3 flex flex-wrap gap-2">
        {!scanning ? (
          <button type="button" onClick={start} className="rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white">
            Start camera scan
          </button>
        ) : (
          <button type="button" onClick={stop} className="rounded-xl bg-stone-200 px-4 py-2 text-sm font-semibold">
            Stop camera
          </button>
        )}
      </div>
      {error && <p className="mt-2 text-sm text-danger">{error}</p>}
      <div className="mt-4 border-t border-stone-100 pt-4">
        <label className="text-sm font-medium">Or enter order code</label>
        <div className="mt-2 flex gap-2">
          <input
            value={manual}
            onChange={(e) => setManual(e.target.value.toUpperCase())}
            placeholder="QM424242"
            className="flex-1 rounded-xl border border-stone-200 px-3 py-2 text-sm outline-none focus:border-brand"
          />
          <button
            type="button"
            onClick={() => {
              const code = parseScannedOrder(manual)
              if (code) onScan(code)
              else setError('Invalid order code')
            }}
            className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white"
          >
            Verify
          </button>
        </div>
      </div>
    </div>
  )
}
