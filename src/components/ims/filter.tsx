import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

type FilterTab = "all" | "pending" | "approved" | "paid" | "rejected";
interface FilterProps {
  search: string;
  setSearch: (value: string) => void;
  filterTab: FilterTab;
  setFilterTab: React.Dispatch<React.SetStateAction<FilterTab>>;
  filterTabs: { id: FilterTab; label: string }[];
  placeholder?: string;
}

export default function Filter({
  search,
  setSearch,
  filterTab,
  setFilterTab,
  filterTabs,
  placeholder = "Search...",
}: FilterProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1 max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <input
          className="w-full pl-9 pr-4 h-9 rounded-lg border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
          placeholder={placeholder}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="flex gap-1 border border-border rounded-lg p-1 bg-card">
        {filterTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterTab(tab.id)}
            className={cn(
              "px-3 py-1 text-xs font-medium rounded-md transition-colors",
              filterTab === tab.id
                ? "bg-primary/20 text-primary"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
 