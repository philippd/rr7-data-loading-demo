export type PageLoadingBehavior = "fast" | "slow" | "error" | "slow-error";

const DELAYS: Record<PageLoadingBehavior, number> = {
  fast: 50,
  slow: 2000,
  error: 50,
  "slow-error": 2000,
};

export async function simulateLoading(behavior: PageLoadingBehavior) {
  const delay = DELAYS[behavior];

  if (delay > 0) {
    await new Promise((resolve) => setTimeout(resolve, delay));
  }

  if (behavior === "error" || behavior === "slow-error") {
    throw new Error(`Simulated ${behavior}`);
  }
}

export function parseLoadingBehavior(
  value: string | null
): PageLoadingBehavior {
  const valid: PageLoadingBehavior[] = ["fast", "slow", "error", "slow-error"];
  return valid.includes(value as PageLoadingBehavior)
    ? (value as PageLoadingBehavior)
    : "fast";
}
