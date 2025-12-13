# Credit-Based Token System Implementation

## Overview
A credit-based token limiting system has been successfully implemented. Free users get **5 credits** and each credit allows **2000 tokens** to be used.

## Key Features

### 1. **Credit System**
- **Free Users**: 5 credits (10,000 tokens total)
- **Pro Users**: 100 credits (200,000 tokens total)
- **1 Credit = 2000 Tokens**
- Each request (code generation or code review) costs 1 credit

### 2. **Token Tracking**
- `totalTokensUsed`: Lifetime token usage tracking
- `monthlyTokensUsed`: Monthly token usage (resets monthly)
- `monthlyResetDate`: When the monthly token counter resets

### 3. **Subscription Support**
- `isSubscribed`: Boolean flag for paid plans
- `subscriptionTier`: free, pro, or enterprise
- `subscriptionEndsAt`: When subscription expires (optional)

## Database Changes

### Updated User Model Fields
```prisma
credits            Int       @default(5)      // Free users get 5 credits
totalTokensUsed    Int       @default(0)      // Lifetime tracking
monthlyTokensUsed  Int       @default(0)      // Monthly tracking
monthlyResetDate   DateTime  @default(now())  // Reset date
isSubscribed       Boolean   @default(false)  // Paid plan flag
subscriptionTier   String?   @default("free") // Subscription tier
subscriptionEndsAt DateTime? // Subscription expiry
createdAt          DateTime  @default(now())
updatedAt          DateTime  @updatedAt
```

## API Usage

### Core Functions in [src/lib/usage.ts](src/lib/usage.ts)

#### 1. **checkUserCredits()**
Checks if user has sufficient credits without consuming them.

```typescript
const status = await checkUserCredits();
// Returns:
// {
//   hasCredits: boolean,
//   credits: number,
//   maxTokens: number,
//   message: string
// }
```

#### 2. **consumeCredits()**
Deducts 1 credit and updates token usage tracking.

```typescript
const result = await consumeCredits();
// Returns:
// {
//   success: true,
//   creditsRemaining: number,
//   tokensUsed: 2000,
//   totalTokensUsed: number,
//   monthlyTokensUsed: number,
//   message: string
// }
```

#### 3. **getUsageStatus()**
Gets detailed usage information for the user.

```typescript
const status = await getUsageStatus();
// Returns:
// {
//   credits: number,
//   totalTokens: number,
//   availableTokens: number,
//   tokensPerCredit: 2000,
//   isSubscribed: boolean,
//   subscriptionTier: string,
//   totalTokensUsed: number,
//   monthlyTokensUsed: number,
//   monthlyResetDate: Date
// }
```

#### 4. **getUserCredits()**
Gets user's current credit status.

```typescript
const credits = await getUserCredits();
```

#### 5. **initializeUserCredits(userId, isPro)**
Initialize credits for a new user.

```typescript
await initializeUserCredits(userId, false); // Free user
await initializeUserCredits(userId, true);  // Pro user
```

### Helper Functions in [src/lib/credit-validator.ts](src/lib/credit-validator.ts)

#### 1. **validateAndConsumeCredits()**
Checks and consumes credits in one operation.

```typescript
try {
  const result = await validateAndConsumeCredits();
  // Proceed with action
} catch (error) {
  // Show error to user: "Insufficient credits"
}
```

#### 2. **getCreditStatus()**
Returns current credit status.

```typescript
const status = await getCreditStatus();
```

#### 3. **validateCredits(action)**
Middleware-like function to validate before executing an action.

```typescript
await validateCredits(async () => {
  // Your expensive operation here
  return await generateCode();
});
```

## Integrated Endpoints

### 1. **Start Workflow** - [src/app/api/projects/start-workflow/route.ts](src/app/api/projects/start-workflow/route.ts)
- Cost: 1 credit (2000 tokens)
- Checks credits before starting code generation
- Returns remaining credits in response

### 2. **Generate Review** - [src/app/api/review/generate/route.ts](src/app/api/review/generate/route.ts)
- Cost: 1 credit (2000 tokens)
- Checks credits before starting code review
- Returns remaining credits in response

## Response Format

Both endpoints now return credit information:

```json
{
  "success": true,
  "creditInfo": {
    "tokensUsed": 2000,
    "creditsRemaining": 4,
    "totalTokensUsed": 2000
  }
}
```

Error response for insufficient credits:

```json
{
  "error": "Insufficient credits",
  "detail": "You have 0 credits remaining (0 tokens)",
  "remainingCredits": 0,
  "maxTokens": 0,
  "status": 429
}
```

## How It Works

### For Code Generation
1. User clicks "Generate Code"
2. System checks if user has at least 1 credit
3. If yes, deducts 1 credit and starts code-agent workflow
4. Returns remaining credits to frontend
5. If no, returns 429 error with message

### For Code Review
1. User clicks "Generate Review"
2. System checks if user has at least 1 credit
3. If yes, generates review and deducts 1 credit
4. Returns remaining credits to frontend
5. If no, returns 429 error before starting review

## Frontend Integration

Update your frontend to:

1. **Show credit balance**
```typescript
const { credits, totalTokens, availableTokens } = await getUsageStatus();
// Display: "You have 5 credits (10,000 tokens available)"
```

2. **Handle insufficient credits**
```typescript
if (response.status === 429) {
  showToast("Insufficient credits. Please upgrade your plan.");
}
```

3. **Update UI after action**
```typescript
const data = await response.json();
updateCreditDisplay(data.creditInfo.creditsRemaining);
```

## Monthly Reset

To reset monthly tokens (should be done via a cron job or scheduled task):

```typescript
import { resetMonthlyTokens } from '@/lib/usage';

// In your scheduled job
await resetMonthlyTokens(userId);
```

## Upgrade Path

When a user upgrades from free to pro:

```typescript
// Update user in database
await prisma.user.update({
  where: { id: userId },
  data: {
    credits: 100,        // Pro credits
    isSubscribed: true,
    subscriptionTier: "pro",
    subscriptionEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
  },
});
```

## Constants

| Constant | Value | Description |
|----------|-------|-------------|
| `TOKENS_PER_CREDIT` | 2000 | Tokens available per credit |
| `FREE_USER_CREDITS` | 5 | Initial credits for free users |
| `PRO_USER_CREDITS` | 100 | Initial credits for pro users |
| `TOKENS_PER_REQUEST` | 2000 | Token cost per request (= 1 credit) |

## Migration Details

A new migration `20251213150416_add_credit_token_system` was created that adds:
- `credits` field with default value of 5
- `totalTokensUsed` field for lifetime tracking
- `monthlyTokensUsed` field for monthly tracking
- `monthlyResetDate` field for reset tracking
- `isSubscribed` boolean field
- `subscriptionTier` field
- `subscriptionEndsAt` timestamp field
- `updatedAt` field to User model

The database has been reset and all migrations have been applied successfully.
