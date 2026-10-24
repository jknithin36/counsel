import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Empty, EmptyDescription, EmptyHeader } from "@/components/ui/empty";
import { cn } from "@/lib/utils";

/** A dashboard card with a Manrope title, optional description and action. */
export function SectionCard({
  title,
  description,
  action,
  className,
  contentClassName,
  children,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
  contentClassName?: string;
  children: React.ReactNode;
}) {
  return (
    <Card className={cn("h-full gap-4", className)}>
      <CardHeader>
        <CardTitle className="font-sans text-sm font-semibold">
          {title}
        </CardTitle>
        {description && (
          <CardDescription className="text-xs">{description}</CardDescription>
        )}
        {action && <CardAction>{action}</CardAction>}
      </CardHeader>
      <CardContent className={cn("flex-1", contentClassName)}>
        {children}
      </CardContent>
    </Card>
  );
}

export function CardEmpty({ children }: { children: React.ReactNode }) {
  return (
    <Empty className="min-h-40 border border-dashed p-4">
      <EmptyHeader>
        <EmptyDescription className="text-sm">{children}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
