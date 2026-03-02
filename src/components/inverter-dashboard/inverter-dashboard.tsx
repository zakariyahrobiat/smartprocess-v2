
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UnitAssignmentTab } from "./unit-assignment-tab"
import { PaymentConfirmationTab } from "./payment-confirmation-tab"
import { ComponentAssignmentTab } from "./component-assignment-tab"
import { AnalyticsTab } from "./analytics-tab"
import {
  Cpu,
  CreditCard,
  Wrench,
  BarChart3,
} from "lucide-react"

export function InverterDashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-secondary">
            <svg viewBox="0 0 24 24" className="size-5" fill="none" aria-hidden="true">
              <circle cx="12" cy="12" r="5" fill="#00A651" />
              <g stroke="#F9D926" strokeWidth="1.8" strokeLinecap="round">
                <line x1="12" y1="1" x2="12" y2="4" />
                <line x1="12" y1="20" x2="12" y2="23" />
                <line x1="1" y1="12" x2="4" y2="12" />
                <line x1="20" y1="12" x2="23" y2="12" />
                <line x1="4.2" y1="4.2" x2="6.3" y2="6.3" />
                <line x1="17.7" y1="17.7" x2="19.8" y2="19.8" />
                <line x1="4.2" y1="19.8" x2="6.3" y2="17.7" />
                <line x1="17.7" y1="6.3" x2="19.8" y2="4.2" />
              </g>
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground text-balance">
              Inverter Dashboard
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage unit assignments, payments, components, and analytics
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="unit-assignment" className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 h-auto gap-1 bg-muted/50 p-1">
          <TabsTrigger
            value="unit-assignment"
            className="gap-2 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Cpu className="size-3.5" />
            <span className="hidden sm:inline">Unit Assignment</span>
            <span className="sm:hidden">Units</span>
          </TabsTrigger>
          <TabsTrigger
            value="payment-confirmation"
            className="gap-2 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <CreditCard className="size-3.5" />
            <span className="hidden sm:inline">Payments</span>
            <span className="sm:hidden">Pay</span>
          </TabsTrigger>
          <TabsTrigger
            value="components"
            className="gap-2 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <Wrench className="size-3.5" />
            <span className="hidden sm:inline">Components</span>
            <span className="sm:hidden">Parts</span>
          </TabsTrigger>
          <TabsTrigger
            value="analytics"
            className="gap-2 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            <BarChart3 className="size-3.5" />
            <span className="hidden sm:inline">Analytics</span>
            <span className="sm:hidden">Stats</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="unit-assignment" className="mt-6">
          <UnitAssignmentTab />
        </TabsContent>

        <TabsContent value="payment-confirmation" className="mt-6">
          <PaymentConfirmationTab />
        </TabsContent>

        <TabsContent value="components" className="mt-6">
          <ComponentAssignmentTab />
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <AnalyticsTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
