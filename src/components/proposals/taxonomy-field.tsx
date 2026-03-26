"use client";

import { useState, useEffect } from "react";
import { getTaxonomyEntriesBySlug } from "@/lib/actions/taxonomy";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  slug: string;
  value: string | string[] | undefined;
  onChange: (value: string | string[]) => void;
  multiple?: boolean;
  placeholder?: string;
};

export function TaxonomyField({
  slug,
  value,
  onChange,
  multiple = false,
  placeholder = "Select...",
}: Props) {
  const [open, setOpen] = useState(false);
  const [entries, setEntries] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    getTaxonomyEntriesBySlug(slug).then((data) =>
      setEntries(data.filter((e) => e.active).map((e) => ({ id: e.id, name: e.name })))
    );
  }, [slug]);

  if (multiple) {
    const selected = (value as string[]) ?? [];
    return (
      <div className="space-y-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger render={<Button variant="outline" className="w-full justify-between font-normal" />}>
            {selected.length > 0
              ? `${selected.length} selected`
              : placeholder}
            <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
          </PopoverTrigger>
          <PopoverContent className="w-full p-0" align="start">
            <Command>
              <CommandInput placeholder="Search..." />
              <CommandList>
                <CommandEmpty>No results.</CommandEmpty>
                <CommandGroup>
                  {entries.map((entry) => (
                    <CommandItem
                      key={entry.id}
                      onSelect={() => {
                        const newValue = selected.includes(entry.name)
                          ? selected.filter((v) => v !== entry.name)
                          : [...selected, entry.name];
                        onChange(newValue);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selected.includes(entry.name)
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                      {entry.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        {selected.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {selected.map((name) => (
              <Badge key={name} variant="secondary" className="gap-1">
                {name}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => onChange(selected.filter((v) => v !== name))}
                />
              </Badge>
            ))}
          </div>
        )}
      </div>
    );
  }

  const singleValue = value as string | undefined;
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger render={<Button variant="outline" className="w-full justify-between font-normal" />}>
        {singleValue || placeholder}
        <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput placeholder="Search..." />
          <CommandList>
            <CommandEmpty>No results.</CommandEmpty>
            <CommandGroup>
              {entries.map((entry) => (
                <CommandItem
                  key={entry.id}
                  onSelect={() => {
                    onChange(entry.name);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      singleValue === entry.name ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {entry.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
