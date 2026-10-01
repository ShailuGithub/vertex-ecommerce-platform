import { ReactNode } from "react";
import { ShoppingBag } from "lucide-react";
import Card, { CardBody, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";

export default function AuthCard({
  storeName,
  title,
  subtitle,
  children,
  footer,
}: {
  storeName: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-center gap-2">
          <ShoppingBag className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold text-foreground">{storeName}</span>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{title}</CardTitle>
            {subtitle && <CardDescription>{subtitle}</CardDescription>}
          </CardHeader>
          <CardBody>{children}</CardBody>
        </Card>

        {footer && <p className="mt-4 text-center text-sm text-muted-foreground">{footer}</p>}
      </div>
    </div>
  );
}
