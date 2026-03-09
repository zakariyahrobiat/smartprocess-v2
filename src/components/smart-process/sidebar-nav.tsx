import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from "@/components/ui/sheet"
import SidebarContent from "../nav/sideBarContent"


// ─── Sun King logo mark ───────────────────────────────────────────────────────

function SKLogoMark({ size = 7 }: { size?: number }) {
  return (
    <div className={`flex size-${size} items-center justify-center rounded-md bg-secondary`}>
      <svg viewBox="0 0 24 24" className="size-4" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="5" fill="#00A651" />
        <g stroke="#F9D926" strokeWidth="1.8" strokeLinecap="round">
          <line x1="12" y1="1"  x2="12" y2="4"  />
          <line x1="12" y1="20" x2="12" y2="23" />
          <line x1="1"  y1="12" x2="4"  y2="12" />
          <line x1="20" y1="12" x2="23" y2="12" />
        </g>
      </svg>
    </div>
  )
}

interface SidebarNavProps {
  pendingCount: number
  mobileOpen: boolean
  onMobileClose: () => void
}

function SidebarNav({ mobileOpen, onMobileClose, pendingCount }: SidebarNavProps) {
  return (
    <>
      <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-border bg-sidebar">
        <SidebarContent pendingCount={pendingCount} />
      </aside>
      {/* <Sheet open={mobileOpen} onOpenChange={setMobileOpen}> */}
      <Sheet open={mobileOpen} onOpenChange={onMobileClose}>
        <SheetContent side="left" className="w-72 p-0 bg-sidebar">
          <SheetHeader className="border-b border-border px-4 py-3">
            <SheetTitle className="flex items-center gap-2 text-sidebar-foreground">
              <SKLogoMark />
              <div className="flex flex-col">
                <span className="text-sm font-bold leading-tight">Sun King</span>
                <span className="text-[10px] leading-tight text-muted-foreground">
                  SmartProcess
                </span>
              </div>
            </SheetTitle>
          </SheetHeader>

          <SidebarContent pendingCount={pendingCount} onItemClick={onMobileClose} />
        </SheetContent>
      </Sheet>
    </>
  )
}

export default SidebarNav

// export function SidebarNav(props: SidebarNavProps) {
//   const { mobileOpen, onMobileClose, ...rest } = props

//   return (
//     <>
//       {/* Desktop sidebar */}
//       <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-border bg-sidebar">
//         <SidebarContent {...rest} onMobileClose={() => {}} />
//       </aside>

//       {/* Mobile sidebar */}
//       <Sheet open={mobileOpen} onOpenChange={onMobileClose}>
//         <SheetContent side="left" className="w-72 p-0 bg-sidebar">
//           <SheetHeader className="border-b border-border px-4 py-3">
//             <SheetTitle className="flex items-center gap-2 text-sidebar-foreground">
//               <SKLogoMark />
//               <div className="flex flex-col">
//                 <span className="text-sm font-bold leading-tight">Sun King</span>
//                 <span className="text-[10px] leading-tight text-muted-foreground">SmartProcess</span>
//               </div>
//             </SheetTitle>
//           </SheetHeader>
//           <SidebarContent {...rest} onMobileClose={onMobileClose} />
//         </SheetContent>
//       </Sheet>
//     </>
//   )
// }
