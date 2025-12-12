import { WindowsStartupAnalyzer } from "../modules/monitoring/analyzers/windows_startup/windows_startup_analyzer";

async function main() {
  const analyzer = new WindowsStartupAnalyzer();
  const snapshot = await analyzer.capture();
  console.log(JSON.stringify(snapshot, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
