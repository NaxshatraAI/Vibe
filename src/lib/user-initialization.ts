/**
 * User initialization utilities
 * Use this when a user first signs up or authenticates
 */

import { prisma } from "./db";
import { initializeUserCredits } from "./usage";

/**
 * Initialize or update user on first login/signup
 * This should be called from your Clerk webhook or sign-up flow
 */
export async function initializeUserOnSignup(
  userId: string,
  userData?: {
    email?: string;
    isPro?: boolean;
  }
) {
  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (existingUser) {
      return existingUser; // User already initialized
    }

    // Initialize new user with credits
    const isPro = userData?.isPro ?? false;
    await initializeUserCredits(userId, isPro);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        credits: true,
        isSubscribed: true,
        subscriptionTier: true,
      },
    });

    console.log(
      `[User Init] User ${userId} initialized with ${user?.credits} credits`
    );

    return user;
  } catch (error) {
    console.error(`[User Init Error] Failed to initialize user ${userId}:`, error);
    throw error;
  }
}

/**
 * Upgrade user to premium/pro plan
 */
export async function upgradeUserToPro(userId: string, durationDays: number = 30) {
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + durationDays);

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      credits: 100, // Pro users get 100 credits
      isSubscribed: true,
      subscriptionTier: "pro",
      subscriptionEndsAt: expiryDate,
    },
    select: {
      id: true,
      credits: true,
      subscriptionTier: true,
      subscriptionEndsAt: true,
    },
  });

  console.log(
    `[Upgrade] User ${userId} upgraded to pro until ${expiryDate.toISOString()}`
  );

  return updatedUser;
}

/**
 * Downgrade user back to free plan
 */
export async function downgradeUserToFree(userId: string) {
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      credits: 5, // Reset to free tier credits
      isSubscribed: false,
      subscriptionTier: "free",
      subscriptionEndsAt: null,
    },
    select: {
      id: true,
      credits: true,
      subscriptionTier: true,
      isSubscribed: true,
    },
  });

  console.log(`[Downgrade] User ${userId} downgraded to free tier`);

  return updatedUser;
}

/**
 * Renew/extend subscription for a pro user
 */
export async function renewSubscription(userId: string, durationDays: number = 30) {
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + durationDays);

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      subscriptionEndsAt: expiryDate,
    },
    select: {
      id: true,
      subscriptionEndsAt: true,
      credits: true,
    },
  });

  console.log(`[Renewal] User ${userId} subscription renewed until ${expiryDate.toISOString()}`);

  return updatedUser;
}

/**
 * Grant bonus credits to a user (for promotions, etc.)
 */
export async function grantBonusCredits(userId: string, bonusCredits: number) {
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      credits: {
        increment: bonusCredits,
      },
    },
    select: {
      id: true,
      credits: true,
    },
  });

  console.log(
    `[Bonus] Granted ${bonusCredits} credits to user ${userId}. New balance: ${updatedUser.credits}`
  );

  return updatedUser;
}

/**
 * Check if user's subscription has expired
 */
export async function checkSubscriptionExpiry(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      isSubscribed: true,
      subscriptionEndsAt: true,
    },
  });

  if (!user?.isSubscribed || !user?.subscriptionEndsAt) {
    return false; // Not subscribed or no expiry
  }

  const now = new Date();
  const hasExpired = user.subscriptionEndsAt < now;

  if (hasExpired) {
    // Auto-downgrade if subscription expired
    await downgradeUserToFree(userId);
    console.log(`[Expiry] User ${userId} subscription expired, downgraded to free`);
  }

  return hasExpired;
}

/**
 * Get user's subscription status
 */
export async function getSubscriptionStatus(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      credits: true,
      isSubscribed: true,
      subscriptionTier: true,
      subscriptionEndsAt: true,
      totalTokensUsed: true,
      monthlyTokensUsed: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const hasExpired =
    user.isSubscribed && user.subscriptionEndsAt
      ? user.subscriptionEndsAt < new Date()
      : false;

  const daysUntilExpiry = user.subscriptionEndsAt
    ? Math.ceil(
        (user.subscriptionEndsAt.getTime() - new Date().getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : null;

  return {
    ...user,
    hasExpired,
    daysUntilExpiry,
    isActive: user.isSubscribed && !hasExpired,
  };
}
