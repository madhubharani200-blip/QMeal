# QMeal

**Preorder. Pick Up. Skip the Queue.**

College canteen preorder, forecasting & waste-reduction platform — hackathon demo-ready.

## Stack

- React + Vite + Tailwind CSS
- Firebase Auth + Firestore (optional — runs in **local demo mode** without credentials)
- Recharts, `qrcode`, `html5-qrcode`
- COD + **simulated UPI** (no paid gateway; production path: Razorpay test mode)

## Quick start

```bash
npm install
npm run dev
```

Open the app and use demo accounts (password `demo1234`):

| Role    | Email               |
|---------|---------------------|
| Student | student@qmeal.demo  |
| Chef    | chef@qmeal.demo     |
| Staff   | staff@qmeal.demo    |
| Manager | manager@qmeal.demo  |

Local demo data (7 days of orders, menu, slots, payments, no-shows) seeds automatically into `localStorage`. Use **Reset seeded demo data** on the login screen if needed.

## Firebase (optional)

1. Create a Firebase project with Auth (Email/Password) + Firestore
2. Copy `.env.example` → `.env` and fill `VITE_FIREBASE_*`
3. Deploy rules: `firestore.rules`
4. Restart `npm run dev`

Without env vars, the app uses a localStorage-backed store that mirrors the same collections.

## Roles

- **Student** — menu → payment (COD/UPI) → 15-min slot → QR → history / cancel before cutoff
- **Chef** — live prep queue, mark prepared
- **Staff** — scan QR / enter code, mark picked up, see `paymentStatus`, no-show auto-flag
- **Manager** — menu CRUD, slots, forecast table, waste entry, payments panel, meals saved

## Forecast (rule-based, not ML)

```
predicted = 0.5×sameWeekday7d + 0.3×last3dAvg + 0.2×currentPreorders
adjusted  = predicted × (1 − avgNoShowRate)
prep      = ceil(adjusted × 1.05)
fallback  = currentPreorders × 1.2
```

## Deploy

- Frontend: Vercel (`npm run build`, output `dist`)
- Backend: Firebase Auth + Firestore

## Demo script (3 min)

1. Tagline + problem (10s)
2. Student: preorder → simulated UPI → slot → QR (35s)
3. Chef: prep queue updates (15s)
4. Staff: scan/enter `QM424242` → picked up + payment status (20s)
5. Manager: forecast formula one-liner (25s)
6. Manager: prepared/sold → waste % (20s)
7. Meals saved + waste trend + payments split (25s)
8. Close: zero hardware, four roles, predict & prevent waste (10s)
