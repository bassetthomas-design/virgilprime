export type ActionRisk = "SAFE" | "PRUDENT" | "RISKY";

export function riskOrder(r: ActionRisk): number {
  switch (r) {
    case "SAFE":
      return 1;
    case "PRUDENT":
      return 2;
    case "RISKY":
      return 3;
  }
}
