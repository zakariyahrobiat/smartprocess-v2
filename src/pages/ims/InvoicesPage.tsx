// IMS Invoices Page — scaffold ready for FastAPI integration
// Full implementation in Week 3 (Track A)
import { Receipt } from "lucide-react"

export default function InvoicesPage() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
      <div className="w-16 h-16 rounded-2xl bg-green-900/30 border border-green-800 flex items-center justify-center">
        <Receipt className="w-8 h-8 text-green-400" />
      </div>
      <h2 className="text-white text-xl font-semibold">Invoices</h2>
      <p className="text-gray-400 text-sm max-w-sm">
        Invoice submission, approval workflow, and tracking.
        <br />
        <span className="text-green-500 font-medium">Coming in Week 3</span> — FastAPI backend + React UI.
      </p>
      <div className="mt-2 text-xs text-gray-600 space-y-1">
        <p>✓ TypeScript interfaces ready</p>
        <p>✓ RBAC permissions configured</p>
        <p>✓ Firestore schema defined</p>
        <p>⏳ FastAPI endpoints — Track B</p>
        <p>⏳ React form + workflow tree — Week 3</p>
      </div>
    </div>
  )
}
