# Credit System - Quick Reference

## System at a Glance

```
Free Users
├─ 5 Credits
├─ 10,000 Tokens (2,000 per credit)
└─ Resets every 30 days

Pro Users
├─ 100 Credits  
├─ 200,000 Tokens (2,000 per credit)
└─ Resets on renewal date

Each Request = 1 Credit = 2,000 Tokens
```

## Core Constants

```typescript
TOKENS_PER_CREDIT = 2000
FREE_USER_CREDITS = 5
PRO_USER_CREDITS = 100
TOKENS_PER_REQUEST = 2000
```

## Main Functions

### Check Credits (No consumption)
```typescript
import { checkUserCredits } from '@/lib/usage';

const status = await checkUserCredits();
// { hasCredits, credits, maxTokens, message }
```

### Consume Credits
```typescript
import { consumeCredits } from '@/lib/usage';

const result = await consumeCredits();
// { success, creditsRemaining, tokensUsed, totalTokensUsed, monthlyTokensUsed }
```

### Get Full Usage Status
```typescript
import { getUsageStatus } from '@/lib/usage';

const status = await getUsageStatus();
// { credits, totalTokens, availableTokens, isSubscribed, ... }
```

### User Management
```typescript
import {
  initializeUserOnSignup,
  upgradeUserToPro,
  downgradeUserToFree,
  grantBonusCredits,
  getSubscriptionStatus,
  renewSubscription
} from '@/lib/user-initialization';
```

## API Endpoints

### Get User Usage
```
GET /api/user/usage
Response: { success: true, data: { credits, totalTokens, ... } }
```

### Start Code Generation (costs 1 credit)
```
POST /api/projects/start-workflow
Body: { projectId }
Response: { success, creditInfo: { creditsRemaining, tokensUsed, ... } }
```

### Generate Code Review (costs 1 credit)
```
POST /api/review/generate
Body: { projectId, files? }
Response: { review, creditInfo: { creditsRemaining, tokensUsed, ... } }
```

## Common Patterns

### Pattern 1: Check Before Action
```typescript
const status = await checkUserCredits();
if (!status.hasCredits) {
  return res.status(429).json({ error: status.message });
}
// Proceed with action
```

### Pattern 2: Consume Credits
```typescript
try {
  const result = await consumeCredits();
  // Take action
  return res.json({ creditInfo: result });
} catch (e) {
  return res.status(429).json({ error: e.message });
}
```

### Pattern 3: Display to User
```typescript
const usage = await getUsageStatus();
console.log(`${usage.credits} Credits • ${usage.availableTokens} Tokens`);
```

## Error Handling

### Insufficient Credits
```json
{
  "error": "Insufficient credits",
  "detail": "You have 0 credits remaining (0 tokens)",
  "status": 429
}
```

### Unauthorized
```json
{
  "error": "Unauthorized",
  "status": 401
}
```

## Database Fields

```prisma
User {
  credits: Int                    // Current balance
  totalTokensUsed: Int           // Lifetime usage
  monthlyTokensUsed: Int         // Current month usage
  monthlyResetDate: DateTime     // When monthly resets
  isSubscribed: Boolean          // Paid plan?
  subscriptionTier: String       // free | pro | enterprise
  subscriptionEndsAt: DateTime?  // When plan expires
  updatedAt: DateTime            // Last update
}
```

## Frontend Integration

### Show Credit Balance
```typescript
const usage = await fetch('/api/user/usage').then(r => r.json());
const { credits, availableTokens } = usage.data;
```

### Handle Insufficient Credits
```typescript
if (response.status === 429) {
  showError("Not enough credits!");
  showUpgradeButton();
}
```

### Update After Action
```typescript
const data = await response.json();
setCreditBalance(data.creditInfo.creditsRemaining);
```

## Migration Commands

```bash
# Apply all migrations
npx prisma migrate deploy

# Create new migration
npx prisma migrate dev --name add_feature

# Reset database (development only)
npx prisma migrate reset

# Check migration status
npx prisma migrate status

# Generate Prisma Client
npx prisma generate
```

## Useful Queries

```typescript
// Get user with all credit info
const user = await prisma.user.findUnique({
  where: { id: userId },
  select: {
    credits,
    totalTokensUsed,
    monthlyTokensUsed,
    isSubscribed,
    subscriptionTier,
    subscriptionEndsAt
  }
});

// Find users out of credits
const outOfCredits = await prisma.user.findMany({
  where: { credits: 0 }
});

// Find pro users
const proUsers = await prisma.user.findMany({
  where: { isSubscribed: true }
});

// Find expired subscriptions
const expired = await prisma.user.findMany({
  where: {
    subscriptionEndsAt: { lt: new Date() },
    isSubscribed: true
  }
});
```

## Testing

```typescript
// Create test user with specific credits
const testUser = await prisma.user.create({
  data: {
    id: "test_user_123",
    credits: 1,
    isSubscribed: false,
    subscriptionTier: "free"
  }
});

// Manually set usage
await prisma.user.update({
  where: { id: testUser.id },
  data: {
    totalTokensUsed: 5000,
    monthlyTokensUsed: 2000
  }
});

// Check status
const status = await getUsageStatus();
console.log(status);
```

## Troubleshooting

### User not found error
- Ensure user exists in database
- Check userId is correct
- Call `initializeUserOnSignup` for new users

### Credits not deducting
- Check database connection
- Verify user ID format
- Look for errors in logs

### Tokens not tracking
- Ensure monthly reset date is set
- Check user exists before consuming
- Verify API response format

## Production Checklist

- [ ] Database migrations applied
- [ ] User initialization on signup
- [ ] Credit checks in all expensive operations
- [ ] Error handling for insufficient credits
- [ ] Frontend displaying credit balance
- [ ] Upgrade/downgrade flows tested
- [ ] Monthly reset cron job scheduled
- [ ] Subscription expiry checks automated
- [ ] Analytics tracking setup
- [ ] Rate limiting in place

## Support

For detailed documentation, see:
- `IMPLEMENTATION_GUIDE.md` - Full setup guide
- `CREDIT_TOKEN_SYSTEM.md` - Technical reference
- `src/lib/usage.ts` - Core functions
- `src/lib/user-initialization.ts` - User management
