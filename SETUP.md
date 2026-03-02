# SmartProcess v2 — Setup Guide

## Stack
- **Frontend**: React 19 + Vite + TypeScript + Tailwind CSS
- **Auth**: Firebase Authentication (Google OAuth)
- **Database**: Cloud Firestore
- **Storage**: Firebase Storage
- **Routing**: React Router v7

---

## First Time Setup

### 1. Install dependencies
```bash
cd smartprocess-v2
npm install
```

### 2. Environment variables
The `.env` file is already configured. Verify it contains:
```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

### 3. Firebase Console — Authorized Domains
Add your Codespaces URL to Firebase Auth → Settings → Authorized Domains:
```
legendary-garbanzo-jr9959xgxxvc4rp-4000.app.github.dev
```
(Port changes when you restart — add the new port URL each time)

### 4. Run dev server
```bash
npm run dev -- --port 4000
```

---

## Firestore — Required Indexes

Create these composite indexes in Firebase Console → Firestore → Indexes:

| Collection | Fields | Order |
|---|---|---|
| submissions | submittedByUid ASC, submittedAt DESC | — |
| submissions | status ASC, submittedAt DESC | — |
| invoices | status ASC, country ASC, createdAt DESC | — |
| invoices | submitterEmail ASC, status ASC | — |
| refunds | status ASC, country ASC, submissionDate DESC | — |
| refunds | submitterEmail ASC, status ASC | — |

---

## Firestore — Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /submissions/{doc} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null;
    }
    match /roles/{doc} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
    match /invoices/{doc} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null;
    }
    match /refunds/{doc} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null;
    }
    match /config/{doc} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

---

## Setting Yourself as Administrator

1. Sign in with Google once
2. Go to Firebase Console → Firestore → users → your document
3. Change `role` from `"maker"` to `"administrator"`
4. Refresh the app — Administration section appears in sidebar

---

## Project Structure

```
src/
├── components/
│   ├── smart-process/       # Core SP components
│   ├── inverter-dashboard/  # Inverter Dashboard
│   ├── ims/                 # IMS components (Week 3-4)
│   └── ui/                  # shadcn/ui components
├── context/
│   └── auth-provider.tsx    # Firebase Auth + RBAC
├── lib/
│   ├── firebase.ts          # Firebase init
│   ├── rbac.ts              # Roles + permissions (incl. IMS)
│   ├── imsTypes.ts          # IMS TypeScript interfaces
│   ├── submissionService.ts # Firestore CRUD + real-time
│   ├── userService.ts       # User sync on login
│   └── store.ts             # Mock data + process flows
├── pages/
│   ├── LoginPage.tsx
│   ├── admin/
│   │   ├── RolesPage.tsx    # Roles & Permissions table
│   │   └── UsersPage.tsx    # User Management
│   └── ims/
│       ├── IMSPage.tsx      # IMS tab router
│       ├── InvoicesPage.tsx # Invoice module (scaffold)
│       └── RefundsPage.tsx  # Refunds module (scaffold)
├── App.tsx                  # Routes
└── main.tsx                 # Entry point
```

---

## What's Done vs What's Next

### ✅ Done
- React + Vite scaffold (migrated from Next.js)
- Firebase Auth (Google OAuth)
- RBAC system with IMS permissions
- Sidebar with IMS project group (role-gated)
- Submissions wired to Firestore (real-time)
- Checker view wired to Firestore (approve/reject/clarify)
- Admin: Roles & Permissions table
- Admin: User Management
- IMS TypeScript types (Invoice, Refund, Analytics)
- IMS page scaffold (ready for Week 3 build)
- Live pending count in sidebar badge

### ⏳ Next (Week 3)
- Track B: FastAPI scaffold on Google Cloud Run
- Track A: IMS Invoices full UI
- Track A: IMS Refunds full UI
- Email integration via Zapier webhooks

---

## Port Issues (Codespaces)

If port 3000 is taken:
```bash
pkill -f "next\|vite" ; sleep 2 && npm run dev -- --port 4000
```

Then add the new port URL to Firebase Authorized Domains.
