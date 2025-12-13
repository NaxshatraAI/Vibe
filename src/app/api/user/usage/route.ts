import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getUsageStatus } from '@/lib/usage';

/**
 * GET /api/user/usage
 * Returns the current user's credit and token usage information
 * 
 * Response:
 * {
 *   credits: number,
 *   totalTokens: number,
 *   availableTokens: number,
 *   tokensPerCredit: number,
 *   isSubscribed: boolean,
 *   subscriptionTier: string,
 *   subscriptionEndsAt: Date | null,
 *   totalTokensUsed: number,
 *   monthlyTokensUsed: number,
 *   monthlyResetDate: Date
 * }
 */
export async function GET() {
  try {
    const session = await auth();
    
    if (!session.userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const usageStatus = await getUsageStatus();

    return NextResponse.json({
      success: true,
      data: usageStatus,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Usage API Error]', message);

    return NextResponse.json(
      {
        error: 'Failed to fetch usage data',
        detail: message,
      },
      { status: 500 }
    );
  }
}
