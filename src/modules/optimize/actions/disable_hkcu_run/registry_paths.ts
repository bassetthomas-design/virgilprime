export const HKCU_RUN_KEY = "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run";

// Virgil-managed backup location for disabled entries.
export const VIRGIL_DISABLED_ROOT = "HKCU\\Software\\VirgilPrime\\DisabledStartup\\Run";

export function disabledValueKey(originalValueName: string): string {
  // Keep original value name as-is. Caller can validate.
  return originalValueName;
}
