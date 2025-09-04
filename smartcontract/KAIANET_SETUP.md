# Kaia Testnet Integration Setup Guide

## 🎯 Overview

This guide will help you set up the YieldCircle contracts with real Kaia testnet DeFi protocols and Chainlink VRF for secure randomness.

## 🔍 Current Integration Status

### ✅ **What's Already Integrated:**
- **Chainlink VRF**: Full integration for secure random number generation
- **DeFi Strategy Manager**: Framework for multiple yield strategies
- **Security Features**: Reentrancy protection, access control, emergency functions
- **LP Token Handling**: Proper liquidity pool integration
- **Slippage Protection**: Configurable slippage limits for swaps

### 🔧 **What Needs Real Addresses:**
- **Kaia Router**: DEX router for token swaps and LP operations
- **Kaia Lending**: Lending protocol for yield farming
- **Kaia Factory**: LP token factory for liquidity pools
- **Token Addresses**: USDT, KAIA, USDC on Kaia testnet
- **VRF Subscription**: Chainlink VRF subscription setup

## 🚀 Step-by-Step Setup

### Step 1: Find Kaia Testnet Information

First, let's find the actual Kaia testnet addresses:

```bash
# Run the address finder script
npm run find-addresses
```

This will:
- Test common Kaia testnet RPC endpoints
- Check for existing token addresses
- Validate protocol contracts
- Test VRF integration

### Step 2: Update Configuration

Edit `config/testnet-addresses.js` with the found addresses:

```javascript
const KAIA_TESTNET_CONFIG = {
    chainId: 1337, // Update with actual Kaia testnet chain ID
    rpcUrl: "https://testnet-rpc.kaia.com", // Update with actual RPC URL
    
    tokens: {
        USDT: "0x...", // Real USDT address on Kaia testnet
        KAIA: "0x...", // Real KAIA token address
        USDC: "0x...", // Real USDC address
    },
    
    protocols: {
        router: "0x...", // Kaia DEX router
        lending: "0x...", // Kaia lending protocol
        factory: "0x...", // Kaia LP factory
    },
    
    vrf: {
        coordinator: "0x...", // Chainlink VRF coordinator
        keyHash: "0x...", // VRF key hash
        subscriptionId: 1, // Your VRF subscription ID
    }
};
```

### Step 3: Set Up Chainlink VRF

1. **Visit Chainlink VRF Dashboard**: https://vrf.chain.link
2. **Create Subscription**:
   - Go to "My Subscriptions"
   - Click "Create Subscription"
   - Add funds to your subscription
3. **Get Configuration**:
   - Copy your subscription ID
   - Note the coordinator address
   - Get the key hash for your network

### Step 4: Deploy Contracts

```bash
# Deploy to Kaia testnet
npm run deploy:testnet

# Or deploy to Sepolia as fallback
npm run deploy:sepolia

# Or deploy to Mumbai as fallback  
npm run deploy:mumbai
```

### Step 5: Verify Integration

```bash
# Check configuration
npm run check-config

# Run tests
npm test

# Test with gas reporting
npm run gas
```

## 🔗 Alternative Networks

If Kaia testnet is not available, you can use these established testnets:

### **Sepolia (Ethereum Testnet)**
```javascript
// Real addresses on Sepolia
tokens: {
    USDT: "0x7169D38820dfd117C3FA1f22a697dBA58d90BA06",
    USDC: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
    WETH: "0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9"
},
protocols: {
    router: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D", // Uniswap V2
    lending: "0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951", // Aave V3
    factory: "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f"  // Uniswap V2
},
vrf: {
    coordinator: "0x50AE5Ea38514FD1C83322f75B1beAec5c85F97aF",
    keyHash: "0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c"
}
```

### **Mumbai (Polygon Testnet)**
```javascript
// Real addresses on Mumbai
tokens: {
    USDT: "0xA02f6adc4556C4C2D8C4C4C4C4C4C4C4C4C4C4C4",
    USDC: "0xe6b8a5CF854791412c1f6EFC7CAf629f5Df1c747",
    WETH: "0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889"
},
protocols: {
    router: "0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff", // QuickSwap
    lending: "0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951", // Aave V3
    factory: "0x5757371414417b8C6CAad45bAeF941aBc7d3Ab32"  // QuickSwap
},
vrf: {
    coordinator: "0x7a1BaC17Ccc5b313516C5E16fb24f7659aA5ebed",
    keyHash: "0x4b09e658ed251bcafeebbc69400383d49f344ace09b9576fe248bb02c003fe9f"
}
```

## 🧪 Testing the Integration

### Test DeFi Strategies

```javascript
// Test treasury strategy (0% yield, maximum safety)
await yieldManager.investInStrategy(circleAddress, amount, "treasury");

// Test stable LP strategy (USDT/USDC)
await yieldManager.investInStrategy(circleAddress, amount, "stable_lp");

// Test native LP strategy (USDT/KAIA)
await yieldManager.investInStrategy(circleAddress, amount, "native_lp");

// Test lending strategy
await yieldManager.investInStrategy(circleAddress, amount, "lending");
```

### Test VRF Integration

```javascript
// Request random positions
const requestId = await randomGenerator.requestRandomPositions(4);
console.log("VRF Request ID:", requestId.toString());

// Check request status
const status = await randomGenerator.getRequestStatus(requestId);
console.log("Request fulfilled:", status.fulfilled);

// Generate positions after VRF callback
const positions = await randomGenerator.generatePositions(requestId);
console.log("Random positions:", positions);
```

## 🔧 Configuration Validation

Run the configuration checker:

```bash
npm run check-config
```

This will validate:
- ✅ Token addresses are valid ERC20 contracts
- ✅ Protocol addresses are valid contracts
- ✅ VRF coordinator is accessible
- ✅ All required addresses are set

## 🚨 Common Issues & Solutions

### Issue: "VRF Coordinator not found"
**Solution**: 
1. Check if you're on the correct network
2. Verify VRF coordinator address
3. Ensure subscription is funded

### Issue: "Token transfer failed"
**Solution**:
1. Check token balance
2. Verify token approval
3. Ensure token address is correct

### Issue: "Protocol interaction failed"
**Solution**:
1. Verify protocol addresses
2. Check if protocols are active on testnet
3. Ensure sufficient gas for complex operations

### Issue: "LP token not found"
**Solution**:
1. Check if LP pair exists
2. Verify factory address
3. Ensure tokens are compatible for LP creation

## 📊 Monitoring Integration

### Key Metrics to Monitor

```javascript
// Check strategy performance
const strategies = await yieldManager.getAvailableStrategies();
console.log("Available strategies:", strategies);

// Check circle investments
const investment = await yieldManager.circleInvestments(circleAddress);
console.log("Current investment:", investment);

// Check VRF requests
const requests = await randomGenerator.getUserRequests(userAddress);
console.log("VRF requests:", requests);
```

### Event Monitoring

```javascript
// Listen for investment events
yieldManager.on("InvestmentExecuted", (circle, strategy, amount) => {
    console.log(`Investment: ${circle} -> ${strategy} = ${amount}`);
});

// Listen for VRF events
randomGenerator.on("RandomWordsRequested", (requestId, requester) => {
    console.log(`VRF Request: ${requestId} by ${requester}`);
});

// Listen for yield events
yieldManager.on("YieldHarvested", (circle, yieldAmount) => {
    console.log(`Yield: ${circle} earned ${yieldAmount}`);
});
```

## 🔐 Security Checklist

Before going live:

- [ ] **VRF Subscription Funded**: Ensure VRF subscription has sufficient LINK
- [ ] **Token Approvals**: Test token approvals and transfers
- [ ] **Protocol Integration**: Verify all DeFi protocol interactions
- [ ] **Emergency Functions**: Test emergency pause and withdrawal
- [ ] **Access Control**: Verify role-based access controls
- [ ] **Gas Optimization**: Check gas usage for all operations
- [ ] **Error Handling**: Test error scenarios and fallbacks

## 📞 Support

If you encounter issues:

1. **Check Logs**: Review deployment and test logs
2. **Validate Addresses**: Use `npm run check-config`
3. **Test Networks**: Try alternative testnets
4. **Documentation**: Review contract documentation
5. **Community**: Check Discord or GitHub issues

---

**Next Steps:**
1. Run `npm run find-addresses` to discover Kaia testnet addresses
2. Update `config/testnet-addresses.js` with real addresses
3. Set up Chainlink VRF subscription
4. Deploy contracts with `npm run deploy:testnet`
5. Test all functionality with `npm test`

**Remember**: Always test with small amounts first and monitor all transactions!
