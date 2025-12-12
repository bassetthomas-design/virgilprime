export type StartupEntrySource =
  | "HKCU_RUN"
  | "HKLM_RUN"
  | "STARTUP_FOLDER"
  | "TASK_SCHEDULER"
  | "UNKNOWN";

export type StartupEntry = {
  id: string;
  name: string;
  publisher?: string;
  source: StartupEntrySource;
  enabled: boolean;
  impactScore?: number;
};

export type DiskStatus = {
  systemDrive: string;
  totalBytes: number;
  freeBytes: number;
};

export type MemoryStatus = {
  totalBytes: number;
  usedBytes: number;
};

export type SystemSnapshot = {
  capturedAt: string;
  startupEntries: StartupEntry[];
  disk?: DiskStatus;
  memory?: MemoryStatus;
};
