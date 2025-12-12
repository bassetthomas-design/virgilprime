import { RuleSeverity } from "./rule";

export type RuleEvidence = {
  key: string;
  value: unknown;
  note?: string;
};

export type RuleResult = {
  ruleId: string;
  severity: RuleSeverity;
  title: string;
  summary: string;
  details?: string[];
  evidence?: RuleEvidence[];
};
