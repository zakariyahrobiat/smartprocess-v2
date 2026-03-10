interface DetailItem {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
}

interface DetailCardProps {
  title: string;
  items: DetailItem[];
}

export default function DetailCard({ title, items }: DetailCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h2 className="text-sm font-semibold text-foreground mb-4">{title}</h2>

      <dl className="grid gap-3 sm:grid-cols-2">
        {items.map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-start gap-2">
            <Icon className="mt-0.5 size-4 text-muted-foreground shrink-0" />
            <div>
              <dt className="text-xs text-muted-foreground">{label}</dt>
              <dd className="text-sm font-medium text-foreground">{value}</dd>
            </div>
          </div>
        ))}
      </dl>
    </div>
  );
}
