# Credit System Integration Checklist

## Phase 1: Backend Setup ✅ (Already Completed)

- [x] Database schema updated with credit fields
- [x] Migration created and applied
- [x] Core utility functions implemented (`src/lib/usage.ts`)
- [x] Credit validation helpers created (`src/lib/credit-validator.ts`)
- [x] User management utilities created (`src/lib/user-initialization.ts`)
- [x] API endpoints integrated and credit checks added
- [x] Usage stats endpoint created (`/api/user/usage`)

## Phase 2: Frontend Integration (Todo - Do This Next)

### 2.1 Display Credit Balance
- [ ] Add credit display component to header/navbar
- [ ] Show: "X Credits • Y Tokens Available"
- [ ] Fetch from `/api/user/usage` endpoint
- [ ] Auto-refresh every 30 seconds or on action

**Example Component:**
```tsx
import { useEffect, useState } from 'react';

function CreditDisplay() {
  const [credits, setCredits] = useState(0);

  useEffect(() => {
    const fetchCredits = async () => {
      const res = await fetch('/api/user/usage');
      const { data } = await res.json();
      setCredits(data.credits);
    };
    fetchCredits();
  }, []);

  return <div>💳 {credits} Credits</div>;
}
```

### 2.2 Handle Insufficient Credits Error
- [ ] Update code generation button to check before sending
- [ ] Show toast/modal when 429 error returned
- [ ] Provide link to upgrade page

**Example:**
```tsx
async function generateCode() {
  const res = await fetch('/api/projects/start-workflow', {
    method: 'POST',
    body: JSON.stringify({ projectId })
  });

  if (res.status === 429) {
    showError("Not enough credits!");
    showUpgradeButton();
    return;
  }

  const data = await res.json();
  updateCreditDisplay(data.creditInfo.creditsRemaining);
}
```

### 2.3 Update UI After Action
- [ ] After successful code generation, update credit count
- [ ] Show success message with remaining credits
- [ ] Disable/enable generation buttons based on credits

**Example:**
```tsx
const data = await response.json();
setCredits(data.creditInfo.creditsRemaining);
toast.success(`Code generated! ${data.creditInfo.creditsRemaining} credits remaining.`);
```

## Phase 3: User Signup Integration (Todo)

### 3.1 Auto-Initialize Credits
- [ ] Add to Clerk webhook or auth handler
- [ ] Call `initializeUserOnSignup()` on user creation

**Example:**
```typescript
// In your auth callback or Clerk webhook
import { initializeUserOnSignup } from '@/lib/user-initialization';

export async function handleUserCreated(userId: string) {
  await initializeUserOnSignup(userId, { isPro: false });
  // User now has 5 credits
}
```

### 3.2 Set Up Upgrade Flow
- [ ] Create upgrade page/modal
- [ ] Call `upgradeUserToPro()` after payment
- [ ] Show confirmation with new credit balance

**Example:**
```typescript
import { upgradeUserToPro } from '@/lib/user-initialization';

async function handleUpgrade(userId: string) {
  await upgradeUserToPro(userId, 30); // 30-day subscription
  setCredits(100);
  toast.success("Upgraded! You now have 100 credits.");
}
```

## Phase 4: Admin Features (Todo)

### 4.1 Grant Bonus Credits
- [ ] Create admin panel for support team
- [ ] Allow granting bonus credits to users

**Example:**
```typescript
import { grantBonusCredits } from '@/lib/user-initialization';

async function grantBonus(userId: string, amount: number) {
  const result = await grantBonusCredits(userId, amount);
  console.log(`User now has ${result.credits} credits`);
}
```

### 4.2 Check User Status
- [ ] Create admin user dashboard
- [ ] Show credit balance and usage for any user
- [ ] View subscription status

**Example:**
```typescript
import { getSubscriptionStatus } from '@/lib/user-initialization';

const status = await getSubscriptionStatus(userId);
// Shows: credits, usage, subscription status, days until expiry
```

### 4.3 Manage Subscriptions
- [ ] Extend subscription for users
- [ ] Downgrade users manually
- [ ] View upcoming expirations

**Example:**
```typescript
import { renewSubscription, downgradeUserToFree } from '@/lib/user-initialization';

// Extend subscription
await renewSubscription(userId, 30); // 30 more days

// Downgrade user
await downgradeUserToFree(userId);
```

## Phase 5: Monitoring & Analytics (Todo)

### 5.1 Credit Usage Tracking
- [ ] Log each credit consumption
- [ ] Track which features use credits
- [ ] Build analytics dashboard

**Example:**
```typescript
// Add to consumeCredits call
console.log(`User ${userId} used 1 credit for ${feature}`);
```

### 5.2 Usage Alerts
- [ ] Alert when user reaches 0 credits
- [ ] Email when free tier about to reset
- [ ] Notify about subscription expiry

### 5.3 Metrics to Track
- [ ] Average credits per user per month
- [ ] Free vs paid user ratio
- [ ] Feature popularity (code gen vs review)
- [ ] Conversion rate (free to paid)

## Phase 6: Cron Jobs & Automation (Todo)

### 6.1 Monthly Reset
- [ ] Set up cron job to reset monthly tokens

**Example (using node-cron):**
```typescript
import cron from 'node-cron';
import { resetMonthlyTokens } from '@/lib/usage';
import { prisma } from '@/lib/db';

// Run at midnight every day
cron.schedule('0 0 * * *', async () => {
  const users = await prisma.user.findMany();
  for (const user of users) {
    const daysSinceReset = Math.floor(
      (Date.now() - user.monthlyResetDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    if (daysSinceReset >= 30) {
      await resetMonthlyTokens(user.id);
      console.log(`Reset monthly tokens for user ${user.id}`);
    }
  }
});
```

### 6.2 Subscription Expiry Check
- [ ] Set up cron job to check subscription expiry

**Example:**
```typescript
import cron from 'node-cron';
import { checkSubscriptionExpiry } from '@/lib/user-initialization';
import { prisma } from '@/lib/db';

// Run daily at 6 AM
cron.schedule('0 6 * * *', async () => {
  const proUsers = await prisma.user.findMany({
    where: { isSubscribed: true }
  });

  for (const user of proUsers) {
    await checkSubscriptionExpiry(user.id);
  }
  
  console.log(`Checked subscription expiry for ${proUsers.length} users`);
});
```

### 6.3 Send Email Notifications
- [ ] Low credit warning email
- [ ] Subscription expiry reminder
- [ ] Welcome email with credit info

## Phase 7: Documentation (Todo)

### 7.1 User Documentation
- [ ] Write user guide on credit system
- [ ] FAQ about credits and upgrades
- [ ] Pricing page with credit info

### 7.2 Support Documentation
- [ ] Staff guide for managing credits
- [ ] Troubleshooting guide
- [ ] Common questions and answers

### 7.3 Developer Documentation
- [ ] API reference (already done ✅)
- [ ] Integration examples
- [ ] Deployment guide

## Phase 8: Testing (Todo)

### 8.1 Unit Tests
- [ ] Test `checkUserCredits()` function
- [ ] Test `consumeCredits()` function
- [ ] Test insufficient credits error

**Example:**
```typescript
describe('Credit System', () => {
  it('should deny request with insufficient credits', async () => {
    const user = await createTestUser({ credits: 0 });
    expect(async () => checkUserCredits()).toThrow('insufficient');
  });

  it('should consume 1 credit per request', async () => {
    const user = await createTestUser({ credits: 5 });
    await consumeCredits();
    expect(user.credits).toBe(4);
  });
});
```

### 8.2 Integration Tests
- [ ] Test full workflow: signup → generate → credit check
- [ ] Test upgrade flow
- [ ] Test subscription expiry

### 8.3 Load Tests
- [ ] Test credit consumption under high load
- [ ] Test concurrent requests
- [ ] Test database performance

## Phase 9: Deployment (Todo)

### 9.1 Pre-Deployment
- [ ] Code review completed
- [ ] All tests passing
- [ ] Documentation complete
- [ ] Monitoring setup

### 9.2 Deployment Steps
- [ ] Back up production database
- [ ] Run migrations on production
- [ ] Deploy backend code
- [ ] Deploy frontend code
- [ ] Verify endpoints working

### 9.3 Post-Deployment
- [ ] Monitor error rates
- [ ] Check credit consumption logs
- [ ] Confirm users see credit balance
- [ ] Test upgrade flow in production

## Quick Links

- **Implementation Guide**: `IMPLEMENTATION_GUIDE.md`
- **Technical Reference**: `CREDIT_TOKEN_SYSTEM.md`
- **Quick Reference**: `CREDIT_SYSTEM_QUICK_REF.md`
- **Usage Core**: `src/lib/usage.ts`
- **User Management**: `src/lib/user-initialization.ts`
- **Validator**: `src/lib/credit-validator.ts`

## Status

- ✅ Phase 1: Backend Setup - **COMPLETE**
- ⏳ Phase 2: Frontend Integration - **READY TO START**
- ⏳ Phase 3: User Signup - **READY TO START**
- ⏳ Phase 4: Admin Features - **NEXT**
- ⏳ Phase 5: Monitoring - **NEXT**
- ⏳ Phase 6: Automation - **NEXT**
- ⏳ Phase 7: Documentation - **NEXT**
- ⏳ Phase 8: Testing - **NEXT**
- ⏳ Phase 9: Deployment - **NEXT**

## Next Steps

1. **Start with Phase 2** - Add credit display to frontend
2. **Implement signup integration** (Phase 3)
3. **Set up admin features** (Phase 4)
4. **Add automation jobs** (Phase 6)
5. **Deploy and monitor** (Phase 9)

All backend code is ready. You can start frontend integration immediately!
