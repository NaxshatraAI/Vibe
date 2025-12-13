import { auth } from "@clerk/nextjs/server";
import { checkUserCredits, consumeCredits } from "./usage";

/**
 * Validates if user has enough credits to perform an action
 * Throws error if credits are insufficient
 */
export async function validateAndConsumeCredits() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("User not authenticated");
  }

  try {
    // Check if user has credits
    const creditStatus = await checkUserCredits();

    if (!creditStatus.hasCredits) {
      throw new Error(creditStatus.message);
    }

    // Consume credits
    const result = await consumeCredits();
    return result;
  } catch (error) {
    throw error;
  }
}

/**
 * Returns credit status and availability for a user
 */
export async function getCreditStatus() {
  try {
    const creditStatus = await checkUserCredits();
    return creditStatus;
  } catch (error) {
    throw error;
  }
}

/**
 * Middleware-like function to check credits before executing action
 * Usage: await validateCredits(() => doSomething());
 */
export async function validateCredits<T>(
  action: () => Promise<T>
): Promise<T> {
  try {
    // First validate and consume credits
    await validateAndConsumeCredits();

    // If credit consumption succeeds, execute the action
    const result = await action();
    return result;
  } catch (error) {
    // Rollback is automatic since we check before executing
    throw error;
  }
}
