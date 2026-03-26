"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { FileText, Plus, Settings, Shield } from "lucide-react";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  function navigate(href: string) {
    setOpen(false);
    router.push(href);
  }

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Actions">
          <CommandItem onSelect={() => navigate("/proposals/new")}>
            <Plus className="mr-2 h-4 w-4" />
            Create New Proposal
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Navigation">
          <CommandItem onSelect={() => navigate("/proposals")}>
            <FileText className="mr-2 h-4 w-4" />
            All Proposals
          </CommandItem>
          <CommandItem onSelect={() => navigate("/admin/taxonomy")}>
            <Settings className="mr-2 h-4 w-4" />
            Taxonomy Admin
          </CommandItem>
          <CommandItem onSelect={() => navigate("/admin/rules")}>
            <Shield className="mr-2 h-4 w-4" />
            Readiness Rules
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
