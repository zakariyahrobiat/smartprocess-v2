import { ArrowLeft } from "lucide-react";
import { Button } from "../ui/button";
import StatusBadge from "./statusBadge";

interface DetailHeaderProps {
  title: string;
  subtitle: string;
  status: string;
  onBack: () => void;
  type: "refund" | "invoice" 
}

export default function DetailHeader({
  title,
  subtitle,
  status,
  onBack,
  type,
}: DetailHeaderProps) {
  return (
    <div className="flex items-center gap-3">
      <Button variant="ghost" size="icon" onClick={onBack}>
        <ArrowLeft className="size-4" />
      </Button>

      <div className="flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="text-xl font-bold text-foreground">{title}</h1>
          <StatusBadge status={status} type={type} />
        </div>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  );
}
