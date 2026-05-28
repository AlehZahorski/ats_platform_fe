import Link from "next/link";
import { Logo } from "@/shared/ui/Logo";
import { ROUTES } from "@/config/routes";

interface Props {
  title: string;
  subtitle?: string;
  footer?: React.ReactNode;
  children: React.ReactNode;
}

/** Centered card layout shared by /konto/zaloguj and /konto/zarejestruj. */
export function AuthShell({ title, subtitle, footer, children }: Props) {
  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-6">
          <Link href={ROUTES.public.home}>
            <Logo className="h-10 w-auto" />
          </Link>
        </div>

        <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
          <h1 className="text-2xl font-semibold text-center">{title}</h1>
          {subtitle && (
            <p className="text-sm text-muted-foreground text-center mt-2">{subtitle}</p>
          )}

          <div className="mt-6 space-y-4">{children}</div>
        </div>

        {footer && <div className="mt-4 text-center text-sm text-muted-foreground">{footer}</div>}
      </div>
    </div>
  );
}
