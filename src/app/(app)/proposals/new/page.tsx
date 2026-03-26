"use client";

import { useState } from "react";
import { ProposalForm } from "@/components/proposals/proposal-form";
import { DocumentImport } from "@/components/proposals/document-import";
import { Button } from "@/components/ui/button";
import type { ProposalFormData } from "@/lib/actions/proposals";
import { FileText, PenLine } from "lucide-react";

type Mode = "choose" | "import" | "form";

export default function NewProposalPage() {
  const [mode, setMode] = useState<Mode>("choose");
  const [importedData, setImportedData] = useState<
    ProposalFormData | undefined
  >();

  function handleImportAccept(data: ProposalFormData) {
    setImportedData(data);
    setMode("form");
  }

  if (mode === "choose") {
    return (
      <div>
        <div className="mb-6">
          <h2 className="text-lg font-semibold">New Event Proposal</h2>
          <p className="text-sm text-muted-foreground">
            How would you like to start?
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 max-w-xl sm:grid-cols-2">
          <button
            onClick={() => setMode("import")}
            className="group flex flex-col items-start gap-3 rounded-lg border-2 border-dashed p-6 text-left transition-colors hover:border-primary hover:bg-accent/50"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">Import existing plan</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Paste an email, brief, deck, or notes. AI extracts the structure
                and shows what&apos;s missing.
              </p>
            </div>
          </button>

          <button
            onClick={() => setMode("form")}
            className="group flex flex-col items-start gap-3 rounded-lg border-2 border-dashed p-6 text-left transition-colors hover:border-primary hover:bg-accent/50"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <PenLine className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">Start from scratch</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Fill in the guided form field by field with AI-assisted
                suggestions.
              </p>
            </div>
          </button>
        </div>
      </div>
    );
  }

  if (mode === "import") {
    return (
      <div>
        <div className="mb-6">
          <h2 className="text-lg font-semibold">Import Existing Plan</h2>
          <p className="text-sm text-muted-foreground">
            Paste your existing document below. The AI will extract structured
            fields and show what needs to be added for compliance.
          </p>
        </div>
        <DocumentImport
          onAccept={handleImportAccept}
          onCancel={() => setMode("choose")}
        />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold">
          {importedData ? "Review & Complete Proposal" : "New Event Proposal"}
        </h2>
        <p className="text-sm text-muted-foreground">
          {importedData
            ? "Fields have been pre-populated from your document. Fill in any gaps and submit for readiness assessment."
            : "Fill in the details below. The readiness engine will assess your proposal on submission."}
        </p>
        {importedData && (
          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={() => {
              setImportedData(undefined);
              setMode("choose");
            }}
          >
            Start over
          </Button>
        )}
      </div>
      <ProposalForm initialData={importedData as any} />
    </div>
  );
}
