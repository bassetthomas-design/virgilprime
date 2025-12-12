export type UndoToken = {
  /** Unique undo id */
  id: string;

  /** Action id that produced this token */
  actionId: string;

  /** Payload needed for best-effort undo */
  payload: Record<string, unknown>;
};

export interface UndoProvider {
  /**
   * Attempt undo. Must be best-effort and never throw fatal errors.
   * Returns true if undo appears successful.
   */
  undo(token: UndoToken): Promise<boolean>;
}
