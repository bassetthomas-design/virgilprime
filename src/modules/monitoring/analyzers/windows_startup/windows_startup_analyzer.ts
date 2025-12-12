import { Analyzer } from "../../../core/analysis/analyzer";
import { SystemSnapshot, StartupEntry } from "../../../core/analysis/system_snapshot";
import { CommandRunner } from "../command_runner";
import { NodeCommandRunner } from "../node_command_runner";
import { parseRegQueryRunKey, parseSchtasksCsv, makeStartupId } from "./parsing";
import { promises as fs } from "node:fs";
import path from "node:path";

export type WindowsStartupAnalyzerOptions = {
  runner?: CommandRunner;
};

function envPath(name: string): string | undefined {
  const v = process.env[name];
  return v && v.trim().length ? v : undefined;
}

async function safeReadDir(dir: string): Promise<string[]> {
  try {
    const items = await fs.readdir(dir);
    return items;
  } catch {
    return [];
  }
}

function startupFolderEntries(files: string[], folderPath: string, source: "STARTUP_FOLDER"): StartupEntry[] {
  return files
    .filter((f) => !f.toLowerCase().endsWith(".ini"))
    .map((file) => {
      const full = path.join(folderPath, file);
      return {
        id: makeStartupId(source, full),
        name: file,
        source,
        enabled: true,
      };
    });
}

/**
 * Windows Startup Analyzer (read-only).
 * Captures startup entries from:
 * - HKCU/HKLM Run keys
 * - Startup folders (user + common)
 * - Task Scheduler (best-effort logon/startup tasks)
 */
export class WindowsStartupAnalyzer implements Analyzer {
  private readonly runner: CommandRunner;

  constructor(opt: WindowsStartupAnalyzerOptions = {}) {
    this.runner = opt.runner ?? new NodeCommandRunner();
  }

  async capture(): Promise<SystemSnapshot> {
    const capturedAt = new Date().toISOString();

    const startupEntries: StartupEntry[] = [];

    // Registry: HKCU Run
    const hkcu = await this.runner.run("reg", [
      "query",
      "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run",
    ]);
    if (hkcu.code === 0 && hkcu.stdout) {
      startupEntries.push(...parseRegQueryRunKey(hkcu.stdout, "HKCU_RUN"));
    }

    // Registry: HKLM Run
    const hklm = await this.runner.run("reg", [
      "query",
      "HKLM\\Software\\Microsoft\\Windows\\CurrentVersion\\Run",
    ]);
    if (hklm.code === 0 && hklm.stdout) {
      startupEntries.push(...parseRegQueryRunKey(hklm.stdout, "HKLM_RUN"));
    }

    // Startup folders
    const appData = envPath("APPDATA");
    const programData = envPath("PROGRAMDATA");

    const userStartup = appData
      ? path.join(appData, "Microsoft", "Windows", "Start Menu", "Programs", "Startup")
      : undefined;

    const commonStartup = programData
      ? path.join(programData, "Microsoft", "Windows", "Start Menu", "Programs", "StartUp")
      : undefined;

    if (userStartup) {
      const files = await safeReadDir(userStartup);
      startupEntries.push(...startupFolderEntries(files, userStartup, "STARTUP_FOLDER"));
    }

    if (commonStartup) {
      const files = await safeReadDir(commonStartup);
      startupEntries.push(...startupFolderEntries(files, commonStartup, "STARTUP_FOLDER"));
    }

    // Task Scheduler
    const tasks = await this.runner.run("schtasks", ["/Query", "/FO", "CSV", "/V"]);
    if (tasks.code === 0 && tasks.stdout) {
      startupEntries.push(...parseSchtasksCsv(tasks.stdout));
    }

    // Deduplicate by id.
    const uniq = new Map<string, StartupEntry>();
    for (const e of startupEntries) {
      if (!uniq.has(e.id)) uniq.set(e.id, e);
    }

    return {
      capturedAt,
      startupEntries: [...uniq.values()],
    };
  }
}
