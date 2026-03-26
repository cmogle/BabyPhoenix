import { getFieldGuidance } from "@/lib/actions/knowledge";
import { GuidanceManager } from "@/components/admin/guidance-manager";
import { PROPOSAL_FIELDS } from "@/lib/types";

export default async function GuidancePage() {
  const guidance = await getFieldGuidance();

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-semibold">Field Guidance</h2>
        <p className="text-sm text-muted-foreground">
          Configure org-specific guidance for each proposal field. This helps
          your team understand what &quot;good&quot; looks like.
        </p>
      </div>
      <GuidanceManager
        fields={PROPOSAL_FIELDS}
        existingGuidance={guidance}
      />
    </div>
  );
}
