import type { ReactNode } from "react";
import { Badge } from "../ui/badge";
import { USE_MOCK_MODE } from "../../config/runtime";

type Props = {
  title: string;
  description: string;
  children: ReactNode;
};

export function AuthLayout({ title, description, children }: Props) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-background to-muted/50 px-4 py-12">
      <div className="mb-8 flex w-full max-w-md flex-col items-center gap-3 text-center">
        <Badge variant="secondary">Web User</Badge>
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <p className="text-sm text-muted-foreground">{description}</p>
        <Badge variant={USE_MOCK_MODE ? "warning" : "secondary"} className="mt-1">
          {USE_MOCK_MODE ? "Mock 模式" : "Real 模式"}
        </Badge>
      </div>
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
