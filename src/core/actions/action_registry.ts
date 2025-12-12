import { ActionRegistryEntry } from "./action_executor";

export class ActionRegistry {
  private readonly entries = new Map<string, ActionRegistryEntry>();

  register(entry: ActionRegistryEntry): void {
    this.entries.set(entry.descriptor.id, entry);
  }

  get(actionId: string): ActionRegistryEntry | undefined {
    return this.entries.get(actionId);
  }

  list(): ActionRegistryEntry[] {
    return [...this.entries.values()];
  }
}
