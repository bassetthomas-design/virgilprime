import { StartupEntry, StartupEntrySource } from "../../../core/analysis/system_snapshot";

// Simple stable hash (FNV-1a 32-bit). Good enough for ids.
export function fnv1a(input: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  // unsigned
  return (hash >>> 0).toString(16).padStart(8, "0");
}

export function makeStartupId(source: StartupEntrySource, key: string): string {
  return `${source}:${fnv1a(`${source}|${key}`)}`;
}

/**
 * Parses `reg query` output lines for Run keys.
 */
export function parseRegQueryRunKey(stdout: string, source: StartupEntrySource): StartupEntry[] {
  const lines = stdout.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const out: StartupEntry[] = [];

  for (const line of lines) {
    // Skip header lines like: HKEY_CURRENT_USER\...
    if (line.startsWith("HKEY_")) continue;

    // Expected: <ValueName>    <Type>    <Data>
    // Sometimes spacing is inconsistent, so split by 2+ spaces.
    const parts = line.split(/\s{2,}/);
    if (parts.length < 3) continue;

    const name = parts[0];
    const type = parts[1];
    const data = parts.slice(2).join(" ");

    // Only keep string-ish values.
    if (!/^REG_(SZ|EXPAND_SZ)$/i.test(type)) continue;

    const id = makeStartupId(source, `${name}|${data}`);
    out.push({
      id,
      name,
      source,
      enabled: true,
      // publisher unknown at this stage
    });
  }

  return out;
}

/**
 * Parses `schtasks /Query /FO CSV /V` output.
 * We keep only tasks that look like logon/startup triggers.
 */
export function parseSchtasksCsv(stdout: string): StartupEntry[] {
  const lines = stdout.split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];

  // Basic CSV parsing for schtasks output (quotes + commas).
  const parseCsvLine = (line: string): string[] => {
    const res: string[] = [];
    let cur = "";
    let inQ = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQ && line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQ = !inQ;
        }
      } else if (ch === "," && !inQ) {
        res.push(cur);
        cur = "";
      } else {
        cur += ch;
      }
    }
    res.push(cur);
    return res;
  };

  const header = parseCsvLine(lines[0]).map((h) => h.trim());
  const idxName = header.findIndex((h) => /taskname/i.test(h));
  const idxSchedule = header.findIndex((h) => /schedule type/i.test(h));
  const idxStatus = header.findIndex((h) => /^status$/i.test(h));

  if (idxName < 0 || idxSchedule < 0) return [];

  const out: StartupEntry[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = parseCsvLine(lines[i]);
    const taskName = (cols[idxName] ?? "").trim();
    const schedule = (cols[idxSchedule] ?? "").trim();
    const status = idxStatus >= 0 ? (cols[idxStatus] ?? "").trim() : "";

    if (!taskName) continue;

    const scheduleLower = schedule.toLowerCase();
    // Keep common triggers.
    const isLogon = scheduleLower.includes("logon") || scheduleLower.includes("log on");
    const isStartup = scheduleLower.includes("startup") || scheduleLower.includes("boot");
    if (!isLogon && !isStartup) continue;

    // If status explicitly says Disabled, mark disabled.
    const enabled = !/disabled/i.test(status);

    const id = makeStartupId("TASK_SCHEDULER", `${taskName}|${schedule}|${status}`);
    out.push({
      id,
      name: taskName,
      source: "TASK_SCHEDULER",
      enabled,
    });
  }

  return out;
}
