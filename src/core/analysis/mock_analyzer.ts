import { Analyzer } from "./analyzer";
import { SystemSnapshot } from "./system_snapshot";

export class MockAnalyzer implements Analyzer {
  constructor(private readonly snapshot: SystemSnapshot) {}

  async capture(): Promise<SystemSnapshot> {
    return JSON.parse(JSON.stringify(this.snapshot)) as SystemSnapshot;
  }
}
