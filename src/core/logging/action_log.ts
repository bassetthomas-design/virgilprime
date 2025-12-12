export type ActionLogEntry = {
  at: string;
  actionId: string;
  label: string;
  success: boolean;
  notes?: string[];
};

export class ActionLog {
  private entries: ActionLogEntry[] = [];

  record(entry: ActionLogEntry): void {
    this.entries.push(entry);
  }

  list(): ActionLogEntry[] {
    return [...this.entries];
  }
}
