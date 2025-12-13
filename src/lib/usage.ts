import { prisma } from "./db";
import { auth } from "@clerk/nextjs/server";

// Constants for credit-based token system
export const TOKENS_PER_CREDIT = 2000;
export const FREE_USER_CREDITS = 5;
export const PRO_USER_CREDITS = 100;
export const TOKENS_PER_REQUEST = 2000; // Each request uses up to 2000 tokens (1 credit)

/**
 * Get user's current credit status
 */
export async function getUserCredits() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("User not authenticated");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      credits: true,
      isSubscribed: true,
      subscriptionTier: true,
      subscriptionEndsAt: true,
      totalTokensUsed: true,
      monthlyTokensUsed: true,
      monthlyResetDate: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return user;
}

/**
 * Check if user has sufficient credits for a request
 * Returns object with status and remaining credits
 */
export async function checkUserCredits() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("User not authenticated");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      credits: true,
      isSubscribed: true,
      subscriptionTier: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const hasEnoughCredits = user.credits > 0;

  return {
    hasCredits: hasEnoughCredits,
    credits: user.credits,
    maxTokens: hasEnoughCredits ? TOKENS_PER_CREDIT : 0,
    message: hasEnoughCredits
      ? `You have ${user.credits} credits remaining (${user.credits * TOKENS_PER_CREDIT} tokens)`
      : "Insufficient credits. Please upgrade your plan or wait for your credits to reset.",
  };
}

/**
 * Consume credits and track token usage
 * Deducts 1 credit per request (equivalent to 2000 tokens)
 */
export async function consumeCredits() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("User not authenticated");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      credits: true,
      totalTokensUsed: true,
      monthlyTokensUsed: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Check if user has credits
  if (user.credits <= 0) {
    throw new Error(
      "Insufficient credits. Please upgrade your plan or wait for your credits to reset."
    );
  }

  // Deduct 1 credit and update token usage
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      credits: {
        decrement: 1,
      },
      totalTokensUsed: {
        increment: TOKENS_PER_CREDIT,
      },
      monthlyTokensUsed: {
        increment: TOKENS_PER_CREDIT,
      },
    },
    select: {
      credits: true,
      totalTokensUsed: true,
      monthlyTokensUsed: true,
    },
  });

  return {
    success: true,
    creditsRemaining: updatedUser.credits,
    tokensUsed: TOKENS_PER_CREDIT,
    totalTokensUsed: updatedUser.totalTokensUsed,
    monthlyTokensUsed: updatedUser.monthlyTokensUsed,
    message: `Request processed. ${updatedUser.credits} credits remaining.`,
  };
}

/**
 * Get detailed usage status for the user
 */
export async function getUsageStatus() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("User not authenticated");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      credits: true,
      isSubscribed: true,
      subscriptionTier: true,
      subscriptionEndsAt: true,
      totalTokensUsed: true,
      monthlyTokensUsed: true,
      monthlyResetDate: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const totalTokens = user.credits * TOKENS_PER_CREDIT;
  const availableTokens = Math.max(0, totalTokens);

  return {
    credits: user.credits,
    totalTokens: totalTokens,
    availableTokens: availableTokens,
    tokensPerCredit: TOKENS_PER_CREDIT,
    isSubscribed: user.isSubscribed,
    subscriptionTier: user.subscriptionTier,
    subscriptionEndsAt: user.subscriptionEndsAt,
    totalTokensUsed: user.totalTokensUsed,
    monthlyTokensUsed: user.monthlyTokensUsed,
    monthlyResetDate: user.monthlyResetDate,
  };
}

/**
 * Reset monthly tokens (should be called via cron job monthly)
 */
export async function resetMonthlyTokens(userId: string) {
  await prisma.user.update({
    where: { id: userId },
    data: {
      monthlyTokensUsed: 0,
      monthlyResetDate: new Date(),
    },
  });
}

/**
 * Initialize credits for a new user
 * Free users get 5 credits, pro users get more
 */
export async function initializeUserCredits(userId: string, isPro: boolean = false) {
  const credits = isPro ? PRO_USER_CREDITS : FREE_USER_CREDITS;

  await prisma.user.upsert({
    where: { id: userId },
    update: {},
    create: {
      id: userId,
      credits: credits,
      isSubscribed: isPro,
      subscriptionTier: isPro ? "pro" : "free",
    },
  });
}
