export type CommandResult = {
  stdout: string;
  stderr: string;
  code: number | null;
};

export interface CommandRunner {
  run(cmd: string, args: string[]): Promise<CommandResult>;
}
