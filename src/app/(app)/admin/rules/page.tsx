import { getRules } from "@/lib/actions/rules";
import { RulesManager } from "@/components/admin/rules-manager";

export default async function RulesPage() {
  const rules = await getRules();

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h2 className="text-lg font-semibold">Readiness Rules</h2>
        <p className="text-sm text-muted-foreground">
          Configure what "ready" means. Rules are evaluated when proposals are
          assessed.
        </p>
      </div>
      <RulesManager rules={rules} />
    </div>
  );
}
