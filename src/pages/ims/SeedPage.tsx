import { useState } from "react"
import { collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle2 } from "lucide-react"
import { COST_CENTERS } from "@/lib/seedData/costCenters"
import { VENDORS } from "@/lib/seedData/vendors"

export default function SeedPage() {
  const [log, setLog] = useState<string[]>([])
  const [running, setRunning] = useState(false)
  const [done, setDone] = useState(false)

  const addLog = (msg: string) => setLog(prev => [...prev, msg])

  const seedCollection = async (name: string, items: { code: string; name: string }[]) => {
    addLog(`Seeding ${name} (${items.length} records)...`)
    const snap = await getDocs(collection(db, name))
    for (const d of snap.docs) await deleteDoc(doc(db, name, d.id))
    addLog(`  Cleared ${snap.size} existing records`)
    let count = 0
    for (const item of items) {
      await addDoc(collection(db, name), item)
      count++
      if (count % 50 === 0) addLog(`  ${count}/${items.length} done...`)
    }
    addLog(`  ✓ ${items.length} ${name} seeded`)
  }

  const handleSeed = async () => {
    setRunning(true)
    setLog([])
    try {
      await seedCollection("costCenters", COST_CENTERS)
      await seedCollection("vendors", VENDORS)
      addLog("✓ All done! Remove /seed from App.tsx when confirmed.")
      setDone(true)
    } catch (e) {
      addLog(`ERROR: ${e instanceof Error ? e.message : String(e)}`)
    } finally {
      setRunning(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Firestore Seeder</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Seeds {COST_CENTERS.length} cost centers + {VENDORS.length} vendors into Firestore. Run once only.
        </p>
      </div>
      <div className="rounded-xl border border-yellow-600/40 bg-yellow-500/10 p-4 text-sm text-yellow-600 dark:text-yellow-400">
        ⚠ This will <strong>clear and re-seed</strong> costCenters and vendors collections. Run once only.
      </div>
      <Button
        onClick={handleSeed}
        disabled={running || done}
        className="gap-2 bg-sk-orange hover:bg-sk-orange-hover text-white"
      >
        {running ? <><Loader2 className="size-4 animate-spin" /> Seeding...</> :
         done    ? <><CheckCircle2 className="size-4" /> Done</> : "Run Seed"}
      </Button>
      {log.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-4 font-mono text-xs space-y-1 max-h-96 overflow-y-auto">
          {log.map((line, i) => (
            <p key={i} className={
              line.startsWith("ERROR") ? "text-destructive" :
              line.startsWith("✓")    ? "text-sk-teal" : "text-muted-foreground"
            }>{line}</p>
          ))}
        </div>
      )}
    </div>
  )
}
