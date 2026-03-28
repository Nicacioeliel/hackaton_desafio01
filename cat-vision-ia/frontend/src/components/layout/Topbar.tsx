import { Menu, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store/app.store";
import { cn } from "@/lib/utils";

export function Topbar({
  title,
  subtitle,
  variant = "default",
}: {
  title: string;
  subtitle?: string;
  /** `compact` reduz altura e omite subtítulo (modo foco) */
  variant?: "default" | "compact";
}) {
  const toggleNav = useAppStore((s) => s.toggleMobileNav);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  const compact = variant === "compact";

  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-border bg-background/80 px-4 backdrop-blur-md sm:px-6",
        compact ? "h-12" : "h-16",
      )}
    >
      <div className="flex min-w-0 items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          type="button"
          onClick={toggleNav}
          aria-label="Abrir menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div className="min-w-0">
          <h1
            className={cn(
              "truncate font-semibold tracking-tight",
              compact ? "text-base" : "text-lg",
            )}
          >
            {title}
          </h1>
          {!compact && subtitle && (
            <p className="truncate text-sm text-muted-fg">{subtitle}</p>
          )}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          type="button"
          className={compact ? "h-8 w-8" : undefined}
          onClick={() => setDark((d) => !d)}
          aria-label="Alternar tema"
        >
          {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
      </div>
    </header>
  );
}
