
import { useState, useRef, useCallback } from "react"
import { getProductComponentConfig, type ComponentConfig } from "@/lib/inverter-store"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import {
  Search,
  Battery,
  Zap,
  Sun,
  User,
  Barcode,
  MapPin,
  Package,
  Send,
  RotateCcw,
  CheckCircle2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface ComponentSearchResult {
  prospectId: string
  name: string
  unit: string
  location: string
  productName: string
  rowId: number
}

export function ComponentAssignmentTab() {
  const [searchInput, setSearchInput] = useState("")
  const [result, setResult] = useState<ComponentSearchResult | null>(null)
  const [config, setConfig] = useState<ComponentConfig | null>(null)
  const [batteries, setBatteries] = useState<string[]>([])
  const [inverters, setInverters] = useState<string[]>([])
  const [panels, setPanels] = useState<string[]>([])
  const [isSubmitted, setIsSubmitted] = useState(false)

  const batteryRefs = useRef<(HTMLInputElement | null)[]>([])
  const inverterRefs = useRef<(HTMLInputElement | null)[]>([])
  const panelRefs = useRef<(HTMLInputElement | null)[]>([])

  const handleSearch = () => {
    if (!searchInput.trim()) {
      toast.error("Please enter a Prospect ID or Unit Number.")
      return
    }
    // Mock: simulate finding a record
    const mockResult: ComponentSearchResult = {
      prospectId: "PID-90126",
      name: "Funke Adeyemi",
      unit: "SKU-7890",
      location: "Ibadan",
      productName: "PowerHub Pro (5 kW): 5 kWh Battery, 2.7 kWp Solar",
      rowId: 5,
    }
    const componentConfig = getProductComponentConfig(mockResult.productName)
    setResult(mockResult)
    setConfig(componentConfig)
    setBatteries(new Array(componentConfig.batteries).fill(""))
    setInverters(new Array(componentConfig.inverters).fill(""))
    setPanels(new Array(componentConfig.panels).fill(""))
    setIsSubmitted(false)
  }

  const updateSerial = useCallback(
    (type: "battery" | "inverter" | "panel", index: number, value: string) => {
      const setFn = type === "battery" ? setBatteries : type === "inverter" ? setInverters : setPanels
      setFn((prev) => {
        const next = [...prev]
        next[index] = value
        return next
      })
    },
    []
  )

  const handleSerialKeyDown = useCallback(
    (
      type: "battery" | "inverter" | "panel",
      index: number,
      e: React.KeyboardEvent<HTMLInputElement>
    ) => {
      if (e.key === "Enter" || e.key === "Tab") {
        const refs =
          type === "battery"
            ? batteryRefs
            : type === "inverter"
              ? inverterRefs
              : panelRefs
        const maxLen =
          type === "battery"
            ? config?.batteries || 0
            : type === "inverter"
              ? config?.inverters || 0
              : config?.panels || 0
        if (index < maxLen - 1) {
          e.preventDefault()
          refs.current[index + 1]?.focus()
        }
      }
    },
    [config]
  )

  const allFilled =
    config &&
    batteries.every((b) => b.trim() !== "") &&
    inverters.every((i) => i.trim() !== "") &&
    panels.every((p) => p.trim() !== "")

  const filledBatteries = batteries.filter((b) => b.trim()).length
  const filledInverters = inverters.filter((i) => i.trim()).length
  const filledPanels = panels.filter((p) => p.trim()).length

  const handleSubmit = () => {
    if (!allFilled) {
      toast.error("Please fill all serial number fields.")
      return
    }
    toast.success("Components assigned and email sent!", {
      description: `${batteries.length} batteries, ${inverters.length} inverters, ${panels.length} panels`,
    })
    setIsSubmitted(true)
  }

  const handleReset = () => {
    setResult(null)
    setConfig(null)
    setBatteries([])
    setInverters([])
    setPanels([])
    setSearchInput("")
    setIsSubmitted(false)
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="text-sm font-semibold text-foreground">Search Unit for Components</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Search by <strong className="text-foreground">Prospect ID</strong> or{" "}
          <strong className="text-foreground">Unit Number</strong>
        </p>
        <div className="mt-3 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Enter Prospect ID or Unit Number"
              className="pl-9"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>
          <Button onClick={handleSearch} className="bg-primary text-primary-foreground hover:bg-primary/90">
            Search
          </Button>
        </div>
      </div>

      {/* Component Form */}
      {result && config && (
        <div className="space-y-4">
          {/* Info Bar */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="flex items-center gap-2 rounded-lg border border-border bg-card p-3">
              <User className="size-4 text-muted-foreground shrink-0" />
              <span className="text-xs font-medium text-foreground truncate">{result.name}</span>
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-border bg-card p-3">
              <Barcode className="size-4 text-muted-foreground shrink-0" />
              <span className="text-xs text-foreground">
                Unit: <strong className="font-mono">{result.unit}</strong>
              </span>
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-border bg-card p-3">
              <MapPin className="size-4 text-muted-foreground shrink-0" />
              <span className="text-xs text-foreground">{result.location}</span>
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-border bg-card p-3">
              <Package className="size-4 text-muted-foreground shrink-0" />
              <span className="text-xs text-foreground truncate">{result.productName}</span>
            </div>
          </div>

          {/* Component Requirements Badges */}
          <div className="flex flex-wrap gap-2">
            <Badge className="bg-[#0EA5E9]/15 text-[#0369A1] dark:text-info border-[#0EA5E9]/30 gap-1.5 py-1">
              <Battery className="size-3" />
              Batteries: {filledBatteries}/{config.batteries}
            </Badge>
            <Badge className="bg-warning/15 text-[#92400E] dark:text-warning border-warning/30 gap-1.5 py-1">
              <Zap className="size-3" />
              Inverters: {filledInverters}/{config.inverters}
            </Badge>
            <Badge className="bg-success/15 text-[#065F46] dark:text-success border-success/30 gap-1.5 py-1">
              <Sun className="size-3" />
              Panels: {filledPanels}/{config.panels}
            </Badge>
          </div>

          {/* Serial Number Input Sections */}
          <div className="space-y-4">
            {config.batteries > 0 && (
              <div className="rounded-xl border border-border bg-card p-4">
                <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Battery className="size-4 text-[#0369A1] dark:text-info" />
                  Battery Serial Numbers
                </h4>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {batteries.map((val, i) => (
                    <Input
                      key={`bat-${i}`}
                      ref={(el) => { batteryRefs.current[i] = el }}
                      placeholder={`Battery ${i + 1}`}
                      value={val}
                      onChange={(e) => updateSerial("battery", i, e.target.value)}
                      onKeyDown={(e) => handleSerialKeyDown("battery", i, e)}
                      disabled={isSubmitted}
                      className={cn(val.trim() && "border-success")}
                    />
                  ))}
                </div>
              </div>
            )}

            {config.inverters > 0 && (
              <div className="rounded-xl border border-border bg-card p-4">
                <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Zap className="size-4 text-[#92400E] dark:text-warning" />
                  Inverter Serial Numbers
                </h4>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {inverters.map((val, i) => (
                    <Input
                      key={`inv-${i}`}
                      ref={(el) => { inverterRefs.current[i] = el }}
                      placeholder={`Inverter ${i + 1}`}
                      value={val}
                      onChange={(e) => updateSerial("inverter", i, e.target.value)}
                      onKeyDown={(e) => handleSerialKeyDown("inverter", i, e)}
                      disabled={isSubmitted}
                      className={cn(val.trim() && "border-success")}
                    />
                  ))}
                </div>
              </div>
            )}

            {config.panels > 0 && (
              <div className="rounded-xl border border-border bg-card p-4">
                <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Sun className="size-4 text-[#065F46] dark:text-success" />
                  Panel Serial Numbers
                </h4>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {panels.map((val, i) => (
                    <Input
                      key={`pan-${i}`}
                      ref={(el) => { panelRefs.current[i] = el }}
                      placeholder={`Panel ${i + 1}`}
                      value={val}
                      onChange={(e) => updateSerial("panel", i, e.target.value)}
                      onKeyDown={(e) => handleSerialKeyDown("panel", i, e)}
                      disabled={isSubmitted}
                      className={cn(val.trim() && "border-success")}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Completion status */}
          {allFilled && !isSubmitted && (
            <div className="flex items-center gap-2 rounded-lg bg-success/10 p-3 text-sm text-[#065F46] dark:text-success">
              <CheckCircle2 className="size-4" />
              All components scanned - Ready to submit
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              onClick={handleSubmit}
              disabled={!allFilled || isSubmitted}
              className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Send className="size-4" />
              Submit All
            </Button>
            <Button variant="outline" onClick={handleReset} className="gap-2">
              <RotateCcw className="size-4" />
              Reset
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
