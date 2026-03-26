"use client";

import { useState } from "react";
import type { ReadinessRule } from "@/lib/types";
import { addRule, updateRule } from "@/lib/actions/rules";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Plus, Pencil, ToggleLeft, ToggleRight } from "lucide-react";
import { toast } from "sonner";

const TYPE_BADGES: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  required: { label: "Required", variant: "destructive" },
  conditional: { label: "Conditional", variant: "secondary" },
  placeholder: { label: "Placeholder", variant: "outline" },
  quality: { label: "Quality (AI)", variant: "default" },
};

export function RulesManager({ rules }: { rules: ReadinessRule[] }) {
  const [showAdd, setShowAdd] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={showAdd} onOpenChange={setShowAdd}>
          <DialogTrigger render={<Button size="sm" />}>
            <Plus className="h-4 w-4 mr-1" />
            Add Rule
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Readiness Rule</DialogTitle>
            </DialogHeader>
            <RuleForm
              onSave={async (data) => {
                await addRule(data);
                setShowAdd(false);
                toast.success("Rule added");
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-2">
        {rules.map((rule) => (
          <RuleRow key={rule.id} rule={rule} />
        ))}
      </div>
    </div>
  );
}

function RuleRow({ rule }: { rule: ReadinessRule }) {
  const [editing, setEditing] = useState(false);
  const badge = TYPE_BADGES[rule.type];

  return (
    <Card className={!rule.active ? "opacity-50" : ""}>
      <CardContent className="flex items-start gap-3 py-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium">{rule.name}</span>
            <Badge variant={badge.variant} className="text-xs">
              {badge.label}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">{rule.message}</p>
          {rule.condition && (
            <p className="text-xs text-muted-foreground font-mono mt-1">
              Condition: {rule.condition}
            </p>
          )}
          {rule.fields && (
            <p className="text-xs text-muted-foreground mt-1">
              Fields: {(rule.fields as string[]).join(", ")}
            </p>
          )}
        </div>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={async () => {
              await updateRule(rule.id, { active: !rule.active });
              toast.success(rule.active ? "Rule deactivated" : "Rule activated");
            }}
          >
            {rule.active ? (
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
                <DialogTitle>Edit Rule</DialogTitle>
              </DialogHeader>
              <RuleForm
                initialData={rule}
                onSave={async (data) => {
                  await updateRule(rule.id, data);
                  setEditing(false);
                  toast.success("Rule updated");
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}

function RuleForm({
  initialData,
  onSave,
}: {
  initialData?: ReadinessRule;
  onSave: (data: {
    type: "required" | "conditional" | "placeholder" | "quality";
    name: string;
    fields?: string[];
    condition?: string;
    message: string;
  }) => Promise<void>;
}) {
  const [type, setType] = useState(initialData?.type ?? "required");
  const [name, setName] = useState(initialData?.name ?? "");
  const [fields, setFields] = useState(
    (initialData?.fields as string[])?.join(", ") ?? ""
  );
  const [condition, setCondition] = useState(initialData?.condition ?? "");
  const [message, setMessage] = useState(initialData?.message ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    await onSave({
      type: type as "required" | "conditional" | "placeholder" | "quality",
      name,
      fields: fields
        ? fields.split(",").map((f) => f.trim())
        : undefined,
      condition: condition || undefined,
      message,
    });
    setSaving(false);
  }

  return (
    <div className="space-y-4 pt-2">
      <div className="space-y-2">
        <Label>Type</Label>
        <Select value={type} onValueChange={(v) => v && setType(v)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="required">Required</SelectItem>
            <SelectItem value="conditional">Conditional</SelectItem>
            <SelectItem value="placeholder">Placeholder</SelectItem>
            <SelectItem value="quality">Quality (AI)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>Name</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>Fields (comma-separated)</Label>
        <Input
          value={fields}
          onChange={(e) => setFields(e.target.value)}
          placeholder="e.g., title, objective"
        />
      </div>
      {type === "conditional" && (
        <div className="space-y-2">
          <Label>Condition</Label>
          <Input
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            placeholder="e.g., eventType IN ['Executive Dinner']"
          />
        </div>
      )}
      <div className="space-y-2">
        <Label>Message</Label>
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Message shown when this rule fires"
        />
      </div>
      <Button onClick={handleSave} disabled={saving || !name || !message} className="w-full">
        {saving ? "Saving..." : "Save"}
      </Button>
    </div>
  );
}
