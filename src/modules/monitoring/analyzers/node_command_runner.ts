import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { CommandResult, CommandRunner } from "./command_runner";

const execFileAsync = promisify(execFile);

export class NodeCommandRunner implements CommandRunner {
  async run(cmd: string, args: string[]): Promise<CommandResult> {
    try {
      const { stdout, stderr } = await execFileAsync(cmd, args, {
        windowsHide: true,
        maxBuffer: 10 * 1024 * 1024,
      });
      return { stdout: String(stdout ?? ""), stderr: String(stderr ?? ""), code: 0 };
    } catch (err: any) {
      // execFile throws on non-zero exit. Capture best-effort output.
      return {
        stdout: String(err?.stdout ?? ""),
        stderr: String(err?.stderr ?? String(err ?? "")),
        code: typeof err?.code === "number" ? err.code : 1,
      };
    }
  }
}
