export const TEST_SUBSCRIPTION_PLAN_NAME_PREFIX = "TEST-";

export function isTestSubscriptionPlanName(name: string): boolean {
  return name.startsWith(TEST_SUBSCRIPTION_PLAN_NAME_PREFIX);
}
