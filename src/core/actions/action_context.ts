export type ActionContext = {
  /** ISO timestamp for action run */
  runAt: string;

  /** If true, allows running RISKY actions. */
  expertMode: boolean;

  /** Enables extra diagnostics/logging */
  debug?: boolean;
};
