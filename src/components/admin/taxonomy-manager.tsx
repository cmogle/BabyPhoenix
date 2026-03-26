"use client";

import { useState } from "react";
import type { TaxonomyCategory, TaxonomyEntry } from "@/lib/types";
import {
  addTaxonomyEntry,
  updateTaxonomyEntry,
} from "@/lib/actions/taxonomy";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Pencil, ToggleLeft, ToggleRight } from "lucide-react";
import { toast } from "sonner";

type CategoryWithEntries = TaxonomyCategory & {
  entries: TaxonomyEntry[];
};

export function TaxonomyManager({
  categories,
}: {
  categories: CategoryWithEntries[];
}) {
  return (
    <Accordion className="space-y-2">
      {categories.map((category) => (
        <AccordionItem key={category.id} value={category.id} className="border rounded-lg px-4">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-3">
              <span className="font-medium">{category.name}</span>
              <Badge variant="secondary">{category.entries.length}</Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <CategoryEntries category={category} />
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

function CategoryEntries({ category }: { category: CategoryWithEntries }) {
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);

  async function handleAdd() {
    if (!newName.trim()) return;
    setAdding(true);
    await addTaxonomyEntry(category.id, newName.trim());
    setNewName("");
    setAdding(false);
    toast.success(`Added "${newName.trim()}" to ${category.name}`);
  }

  return (
    <div className="space-y-3 pb-4">
      <div className="space-y-1">
        {category.entries.map((entry) => (
          <EntryRow key={entry.id} entry={entry} />
        ))}
      </div>
      <div className="flex gap-2 items-end pt-2 border-t">
        <div className="flex-1 space-y-1">
          <Label className="text-xs">New entry</Label>
          <Input
            placeholder="Entry name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          />
        </div>
        <Button size="sm" onClick={handleAdd} disabled={adding || !newName.trim()}>
          <Plus className="h-4 w-4 mr-1" />
          Add
        </Button>
      </div>
    </div>
  );
}

function EntryRow({ entry }: { entry: TaxonomyEntry }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(entry.name);
  const [description, setDescription] = useState(entry.description ?? "");

  async function handleSave() {
    await updateTaxonomyEntry(entry.id, {
      name: name.trim(),
      description: description.trim() || undefined,
    });
    setEditing(false);
    toast.success("Entry updated");
  }

  async function handleToggleActive() {
    await updateTaxonomyEntry(entry.id, { active: !entry.active });
    toast.success(entry.active ? "Entry deactivated" : "Entry activated");
  }

  return (
    <div className="flex items-center gap-2 py-1 px-2 rounded hover:bg-accent/50 group">
      <span
        className={`flex-1 text-sm ${!entry.active ? "text-muted-foreground line-through" : ""}`}
      >
        {entry.name}
      </span>
      {entry.description && (
        <span className="text-xs text-muted-foreground max-w-48 truncate">
          {entry.description}
        </span>
      )}
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={handleToggleActive}
          title={entry.active ? "Deactivate" : "Activate"}
        >
          {entry.active ? (
            <ToggleRight className="h-3.5 w-3.5" />
          ) : (
            <ToggleLeft className="h-3.5 w-3.5" />
          )}
        </Button>
        <Dialog open={editing} onOpenChange={setEditing}>
          <DialogTrigger render={<Button variant="ghost" size="icon" className="h-7 w-7" />}>
            <Pencil className="h-3.5 w-3.5" />
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Entry</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Description (optional)</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <Button onClick={handleSave} className="w-full">
                Save
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
