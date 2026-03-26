"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { FileText, Calendar, Lightbulb, Settings, Shield } from "lucide-react";

const navigation = [
  { name: "Proposals", href: "/proposals", icon: FileText },
  { name: "Calendar", href: "/calendar", icon: Calendar },
  { name: "Field Guidance", href: "/admin/guidance", icon: Lightbulb },
  { name: "Taxonomy", href: "/admin/taxonomy", icon: Settings },
  { name: "Readiness Rules", href: "/admin/rules", icon: Shield },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-56 flex-col border-r bg-card">
      <div className="flex h-14 items-center border-b px-4">
        <h1 className="text-sm font-semibold tracking-tight">
          Event Readiness
        </h1>
      </div>
      <div className="flex flex-1 flex-col">
        <nav className="flex-1 space-y-1 p-2">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                pathname.startsWith(item.href)
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          ))}
        </nav>
        <div className="border-t p-2">
          <button
            onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-xs text-muted-foreground hover:bg-accent/50 transition-colors"
          >
            <span>Search</span>
            <kbd className="ml-auto rounded border bg-muted px-1.5 py-0.5 text-[10px] font-mono">⌘K</kbd>
          </button>
        </div>
      </div>
    </aside>
  );
}
