import { SystemSnapshot } from "./system_snapshot";

export interface Analyzer {
  capture(): Promise<SystemSnapshot>;
}
