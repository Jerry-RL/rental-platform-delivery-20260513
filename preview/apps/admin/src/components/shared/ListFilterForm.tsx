import { Search, RotateCcw } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select } from "../ui/select";

export type FilterField = {
  key: string;
  label: string;
  type: "text" | "select";
  placeholder?: string;
  options?: { value: string; label: string }[];
};

type ListFilterFormProps = {
  fields: FilterField[];
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
  onSearch: () => void;
  onReset: () => void;
  loading?: boolean;
};

export function ListFilterForm({ fields, values, onChange, onSearch, onReset, loading }: ListFilterFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch();
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-border bg-muted/30 p-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {fields.map((f) => (
          <div key={f.key} className="space-y-1.5">
            <Label htmlFor={`filter-${f.key}`}>{f.label}</Label>
            {f.type === "select" ? (
              <Select
                id={`filter-${f.key}`}
                value={values[f.key] ?? ""}
                onChange={(e) => onChange(f.key, e.target.value)}
                options={f.options ?? []}
                placeholder={f.placeholder ?? "全部"}
              />
            ) : (
              <Input
                id={`filter-${f.key}`}
                value={values[f.key] ?? ""}
                onChange={(e) => onChange(f.key, e.target.value)}
                placeholder={f.placeholder}
              />
            )}
          </div>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button type="submit" size="sm" disabled={loading}>
          <Search className="mr-1.5 h-4 w-4" />
          查询
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={onReset} disabled={loading}>
          <RotateCcw className="mr-1.5 h-4 w-4" />
          重置
        </Button>
      </div>
    </form>
  );
}
