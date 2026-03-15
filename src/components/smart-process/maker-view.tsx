import { processFlows} from "@/lib/store"
import { ProcessCard } from "./process-card"
// import { ProcessCardSkeleton } from "./skeleton-loaders"



export function MakerView() {
    return (
      <div className="flex-1 overflow-y-auto space-y-6 p-4 lg:p-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">New Request</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Select a process to get started with your submission.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          { processFlows.map((flow) => (
                <ProcessCard
                  key={flow.id}
                  process={flow}
                />
              ))}
        </div>
      </div>
    );


}
