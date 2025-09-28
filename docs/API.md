# YieldCircle API Documentation

This document provides comprehensive API documentation for YieldCircle smart contracts and frontend integration.

## Table of Contents

1. [Smart Contract APIs](#smart-contract-apis)
2. [Frontend Integration](#frontend-integration)
3. [Event Monitoring](#event-monitoring)
4. [Error Handling](#error-handling)
5. [Gas Estimation](#gas-estimation)

## Smart Contract APIs

### YieldCircle Contract

#### Core Functions

##### `contribute(uint256 amount)`
Contribute USDT to the current cycle.

**Parameters:**
- `amount` (uint256): Amount of USDT to contribute (in wei, 6 decimals)

**Returns:**
- None

**Events:**
- `ContributionMade(address indexed member, uint256 cycle, uint256 amount)`

**Requirements:**
- Circle must be in COLLECTING phase
- Member must not have already contributed to current cycle
- Amount must equal circle's contribution amount
- Member must have approved USDT transfer

**Example:**
```solidity
// Contribute 100 USDT (100 * 10^6)
await yieldCircle.contribute(100000000);
```

##### `requestPayout()`
Request payout for the current cycle's designated member.

**Parameters:**
- None

**Returns:**
- None

**Events:**
- `PayoutExecuted(address indexed recipient, uint256 amount, uint256 cycle, uint256 yieldShare)`

**Requirements:**
- Circle must be in PAYOUT_READY phase
- All members must have contributed
- Caller must be the designated payout recipient
- Sufficient funds must be available

##### `joinCircle(string memory name)`
Join an existing circle.

**Parameters:**
- `name` (string): Member's display name

**Returns:**
- None

**Events:**
- `MemberJoined(address indexed member, string name, uint256 position)`

**Requirements:**
- Circle must be in SETUP phase
- Circle must not be full
- Member must not already be in circle

##### `leaveCircle()`
Leave a circle during setup phase.

**Parameters:**
- None

**Returns:**
- None

**Requirements:**
- Circle must be in SETUP phase
- Member must be in the circle

#### View Functions

##### `getCircleInfo()`
Get complete circle information.

**Returns:**
```solidity
struct CircleInfo {
    string name;           // Circle name
    address creator;       // Creator address
    uint256 contributionAmount;  // USDT amount per contribution
    uint256 cycleDuration;       // Duration of each cycle
    uint256 currentCycle;        // Current cycle number
    uint256 totalCycles;         // Total number of cycles
    uint256 cycleStartTime;      // Start time of current cycle
    uint256 poolBalance;         // Current pool balance
    uint256 totalYieldEarned;    // Total yield earned
    uint256 totalDistributed;    // Total distributed
    CirclePhase phase;           // Current phase
    bool isActive;               // Whether circle is active
    bool emergencyPaused;        // Emergency pause status
}
```

##### `getMemberInfo(address member)`
Get member information.

**Parameters:**
- `member` (address): Member's wallet address

**Returns:**
```solidity
struct Member {
    address wallet;           // Wallet address
    string name;              // Display name
    uint256 payoutPosition;   // Payout order (1, 2, 3, etc.)
    bool hasContributed;      // Contributed to current cycle
    bool hasReceivedPayout;   // Received payout lifetime
    uint256 totalContributions; // Total contributions made
    uint256 joinedTimestamp;  // When they joined
    bool isActive;            // Active status
}
```

##### `getPayoutSchedule()`
Get the payout schedule for all cycles.

**Returns:**
- `uint256[]`: Array of member addresses in payout order

### YieldCircleFactory Contract

#### Core Functions

##### `createCircle(string memory name, address[] memory members, uint256 contributionAmount, uint256 cycleDuration)`
Create a new yield circle.

**Parameters:**
- `name` (string): Circle name
- `members` (address[]): Array of member addresses
- `contributionAmount` (uint256): USDT amount per contribution
- `cycleDuration` (uint256): Cycle duration in seconds

**Returns:**
- `address`: Address of the created circle contract

**Events:**
- `CircleCreated(address indexed circle, address indexed creator, string name, uint256 memberCount, uint256 contributionAmount, uint256 cycleDuration, uint256 requestId)`

**Requirements:**
- Valid member count (3-50)
- Valid contribution amount ($10-$10,000)
- Valid cycle duration (1-365 days)
- Creator must be in members list
- No duplicate members

##### `createCircleFromTemplate(string memory templateName, address[] memory members, uint256 contributionAmount, uint256 cycleDuration)`
Create a circle using a predefined template.

**Parameters:**
- `templateName` (string): Template name ("Family", "Friends", "Community")
- `members` (address[]): Array of member addresses
- `contributionAmount` (uint256): USDT amount per contribution
- `cycleDuration` (uint256): Cycle duration in seconds

**Returns:**
- `address`: Address of the created circle contract

#### View Functions

##### `getUserCircles(address user)`
Get all circles created by a user.

**Parameters:**
- `user` (address): User's wallet address

**Returns:**
- `address[]`: Array of circle addresses

##### `getTemplate(string memory templateName)`
Get template information.

**Parameters:**
- `templateName` (string): Template name

**Returns:**
```solidity
struct CircleTemplate {
    string name;                    // Template name
    uint256 minMembers;            // Minimum members
    uint256 maxMembers;            // Maximum members
    uint256 minContribution;       // Minimum contribution
    uint256 maxContribution;       // Maximum contribution
    uint256[] allowedDurations;    // Allowed durations
    bool isActive;                 // Template active status
    uint256 maxTotalValue;         // Maximum total value
    uint256 gasEstimate;           // Gas estimate
}
```

### KaiaYieldStrategyManager Contract

#### Core Functions

##### `investFunds(address circleAddress, uint256 amount, string memory strategy)`
Invest circle funds in a yield strategy.

**Parameters:**
- `circleAddress` (address): Circle contract address
- `amount` (uint256): Amount to invest
- `strategy` (string): Strategy name ("Treasury", "USDT/USDC LP", "USDT/KAIA LP", "USDT Lending")

**Returns:**
- None

**Events:**
- `InvestmentMade(address indexed circle, string strategy, uint256 amount, uint256 timestamp)`

##### `withdrawFunds(address circleAddress, uint256 amount)`
Withdraw funds from yield strategies.

**Parameters:**
- `circleAddress` (address): Circle contract address
- `amount` (uint256): Amount to withdraw

**Returns:**
- None

**Events:**
- `WithdrawalMade(address indexed circle, uint256 amount, uint256 timestamp)`

#### View Functions

##### `getAvailableStrategies()`
Get list of available yield strategies.

**Returns:**
```solidity
struct Strategy {
    string name;           // Strategy name
    uint256 apy;          // Annual percentage yield
    uint256 riskScore;    // Risk score (1-10)
    uint256 minAmount;    // Minimum investment
    uint256 maxAmount;    // Maximum investment
    bool isActive;        // Strategy active status
}
```

##### `getCircleInvestments(address circleAddress)`
Get investment information for a circle.

**Parameters:**
- `circleAddress` (address): Circle contract address

**Returns:**
```solidity
struct InvestmentInfo {
    string currentStrategy;    // Current strategy
    uint256 totalInvested;    // Total invested amount
    uint256 yieldEarned;      // Yield earned so far
    uint256 lastUpdate;       // Last update timestamp
}
```

## Frontend Integration

### React Hooks

#### `useYieldCircle(circleAddress)`
Custom hook for interacting with a yield circle.

```typescript
import { useYieldCircle } from '@/hooks/useYieldCircle';

function CircleComponent({ circleAddress }: { circleAddress: string }) {
  const {
    circleInfo,
    memberInfo,
    contribute,
    requestPayout,
    isLoading,
    error
  } = useYieldCircle(circleAddress);

  const handleContribute = async () => {
    try {
      await contribute();
      // Handle success
    } catch (error) {
      // Handle error
    }
  };

  return (
    <div>
      <h2>{circleInfo?.name}</h2>
      <p>Current Phase: {circleInfo?.phase}</p>
      <p>Pool Balance: {circleInfo?.poolBalance}</p>
      
      {circleInfo?.phase === 'COLLECTING' && (
        <button onClick={handleContribute}>
          Contribute {circleInfo.contributionAmount} USDT
        </button>
      )}
    </div>
  );
}
```

#### `useYieldCircleFactory()`
Custom hook for creating circles.

```typescript
import { useYieldCircleFactory } from '@/hooks/useYieldCircleFactory';

function CreateCircleForm() {
  const { createCircle, isLoading, error } = useYieldCircleFactory();

  const handleCreateCircle = async (formData: CreateCircleData) => {
    try {
      const circleAddress = await createCircle({
        name: formData.name,
        members: formData.members,
        contributionAmount: formData.amount,
        cycleDuration: formData.duration
      });
      
      // Handle success
      console.log('Circle created:', circleAddress);
    } catch (error) {
      // Handle error
    }
  };

  return (
    <form onSubmit={handleCreateCircle}>
      {/* Form fields */}
    </form>
  );
}
```

### TypeScript Types

```typescript
// Circle information type
interface CircleInfo {
  name: string;
  creator: string;
  contributionAmount: string;
  cycleDuration: number;
  currentCycle: number;
  totalCycles: number;
  cycleStartTime: number;
  poolBalance: string;
  totalYieldEarned: string;
  totalDistributed: string;
  phase: CirclePhase;
  isActive: boolean;
  emergencyPaused: boolean;
}

// Member information type
interface Member {
  wallet: string;
  name: string;
  payoutPosition: number;
  hasContributed: boolean;
  hasReceivedPayout: boolean;
  totalContributions: string;
  joinedTimestamp: number;
  isActive: boolean;
}

// Circle phases
type CirclePhase = 
  | 'SETUP' 
  | 'WAITING_RANDOM' 
  | 'COLLECTING' 
  | 'INVESTING' 
  | 'PAYOUT_READY' 
  | 'COMPLETED' 
  | 'PAUSED';

// Yield strategies
type YieldStrategy = 
  | 'Treasury' 
  | 'USDT/USDC LP' 
  | 'USDT/KAIA LP' 
  | 'USDT Lending';
```

## Event Monitoring

### Key Events

#### Circle Lifecycle Events
```typescript
// Member joined
yieldCircle.on('MemberJoined', (member, name, position) => {
  console.log(`${name} joined circle at position ${position}`);
});

// Circle started
yieldCircle.on('CircleStarted', (startTime, deadline) => {
  console.log(`Circle started at ${new Date(startTime * 1000)}`);
});

// Contribution made
yieldCircle.on('ContributionMade', (member, cycle, amount) => {
  console.log(`${member} contributed ${amount} to cycle ${cycle}`);
});

// Payout executed
yieldCircle.on('PayoutExecuted', (recipient, amount, cycle, yieldShare) => {
  console.log(`${recipient} received ${amount} (${yieldShare} yield) in cycle ${cycle}`);
});
```

#### Investment Events
```typescript
// Investment made
yieldManager.on('InvestmentMade', (circle, strategy, amount, timestamp) => {
  console.log(`Circle ${circle} invested ${amount} in ${strategy}`);
});

// Yield updated
yieldManager.on('YieldUpdated', (newYieldTotal) => {
  console.log(`Total yield updated: ${newYieldTotal}`);
});
```

### Event Filtering

```typescript
// Filter events by member
const memberEvents = yieldCircle.filters.ContributionMade(memberAddress);

// Filter events by cycle
const cycleEvents = yieldCircle.filters.ContributionMade(null, cycleNumber);

// Get historical events
const pastEvents = await yieldCircle.queryFilter(memberEvents, fromBlock, toBlock);
```

## Error Handling

### Custom Errors

The contracts use custom errors for gas efficiency:

```solidity
// Common errors
error CircleNotActive();
error InvalidPhase();
error MemberNotFound();
error AlreadyContributed();
error AlreadyReceivedPayout();
error InsufficientFunds();
error InvalidAmount();
error PositionsNotInitialized();
error TooManyMembers();
error InvalidContributionAmount();
error InvalidCycleDuration();
error CreatorOnly();
error MemberOnly();
```

### Error Handling in Frontend

```typescript
try {
  await yieldCircle.contribute(amount);
} catch (error) {
  if (error.code === 'CALL_EXCEPTION') {
    // Contract call failed
    const reason = error.reason || error.message;
    
    if (reason.includes('AlreadyContributed')) {
      showError('You have already contributed to this cycle');
    } else if (reason.includes('InvalidPhase')) {
      showError('Circle is not in contribution phase');
    } else if (reason.includes('InsufficientFunds')) {
      showError('Insufficient USDT balance or allowance');
    }
  } else if (error.code === 'UNPREDICTABLE_GAS_LIMIT') {
    showError('Transaction may fail - check your balance and allowance');
  } else {
    showError('Transaction failed: ' + error.message);
  }
}
```

## Gas Estimation

### Gas Costs (Approximate)

#### YieldCircle Operations
- `contribute()`: ~120,000 gas
- `requestPayout()`: ~150,000 gas
- `joinCircle()`: ~80,000 gas
- `leaveCircle()`: ~60,000 gas

#### Factory Operations
- `createCircle()`: ~800,000 gas
- `createCircleFromTemplate()`: ~750,000 gas

#### Yield Manager Operations
- `investFunds()`: ~200,000 gas
- `withdrawFunds()`: ~180,000 gas

### Gas Optimization Tips

1. **Batch Operations**: Combine multiple operations in a single transaction when possible
2. **Optimize View Calls**: Cache frequently accessed data
3. **Use Events**: Monitor events instead of polling state
4. **Gas Price**: Monitor gas prices and time transactions appropriately

### Gas Estimation in Frontend

```typescript
// Estimate gas for contribution
const gasEstimate = await yieldCircle.estimateGas.contribute(contributionAmount);

// Set gas limit with buffer
const gasLimit = gasEstimate.mul(120).div(100); // 20% buffer

// Execute transaction
const tx = await yieldCircle.contribute(contributionAmount, { gasLimit });
```

---

## Support

For API questions or issues:
- **Documentation**: [README.md](../README.md)
- **GitHub Issues**: [Report Issues](https://github.com/your-username/yieldcircle/issues)
- **Discord**: [Join Discord](https://discord.gg/yieldcircle)

**Last Updated**: December 20, 2024  
**Version**: 2.0.0
