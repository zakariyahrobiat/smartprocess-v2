function SideBarLabel({ label }: { label: string }) {
  return (
    <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
      {label}
    </p>
  )
}
export default SideBarLabel