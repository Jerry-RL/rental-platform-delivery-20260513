type DetailLineProps = {
  label: string;
  value: React.ReactNode;
};

export const DetailLine = ({ label, value }: DetailLineProps) => (
  <div className="flex justify-between gap-3 text-sm">
    <span className="shrink-0 text-muted-foreground">{label}</span>
    <span className="text-right font-medium text-foreground">{value}</span>
  </div>
);
