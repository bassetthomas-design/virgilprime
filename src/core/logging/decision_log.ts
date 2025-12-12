export type DecisionLogEntry = {
  at: string;
  ruleId: string;
  decision: "ACCEPT" | "IGNORE";
  reason?: string;
};

export class DecisionLog {
  private entries: DecisionLogEntry[] = [];

  record(entry: DecisionLogEntry): void {
    this.entries.push(entry);
  }

  list(): DecisionLogEntry[] {
    return [...this.entries];
  }
}
