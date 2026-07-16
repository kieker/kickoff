import type { ReactNode } from "react";
import { MoreHorizontal } from "lucide-react";
import { Button, Card, CardContent, CardHeader, CardTitle, cn } from "@kickoff/ui";

type WidgetShellProps = {
  title: string;
  eyebrow?: string;
  action?: ReactNode;
  className?: string;
  children: ReactNode;
};

export function WidgetShell({
  title,
  eyebrow,
  action,
  className,
  children
}: WidgetShellProps) {
  return (
    <Card className={cn("min-h-0 overflow-hidden", className)}>
      <CardHeader>
        <div className="min-w-0">
          {eyebrow ? (
            <p className="mb-1 text-[11px] font-medium uppercase text-muted-foreground">
              {eyebrow}
            </p>
          ) : null}
          <CardTitle>{title}</CardTitle>
        </div>
        {action ?? (
          <Button aria-label={`${title} options`} size="icon" variant="ghost">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
