import { useNavigate } from "react-router-dom";
import { cn } from "../lib/utils";

type DetailLinkButtonProps = {
  to: string;
  label?: string;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
};

export const DetailLinkButton = ({
  to,
  label = "查看详情",
  className,
  onClick
}: DetailLinkButtonProps) => {
  const navigate = useNavigate();
  return (
    <button
      type="button"
      className={cn(
        "shrink-0 rounded-lg border border-border px-2.5 py-1 text-[11px] font-medium text-primary active:bg-muted",
        className
      )}
      onClick={(e) => {
        onClick?.(e);
        e.stopPropagation();
        navigate(to);
      }}
    >
      {label}
    </button>
  );
};
