# 🔍 Contract Verification & Frontend Integration Guide

## 📋 Overview

This guide will help you verify your contracts on a testnet and prepare them for frontend integration.

## 🚀 Step 1: Deploy to Testnet

### Option A: Deploy to Sepolia Testnet (Recommended)

```bash
# Deploy and verify automatically
npm run deploy:testnet
```

### Option B: Deploy to Local Network First

```bash
# Start local node
npm run node

# Deploy locally
npm run deploy:core
```

## 🔍 Step 2: Verify Contracts

### Automatic Verification (Recommended)

The `deploy-and-verify.js` script will automatically verify your contracts after deployment.

### Manual Verification

If automatic verification fails, you can verify manually:

```bash
# Verify individual contracts
npx hardhat verify --network sepolia <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>

# Example for Yield Strategy Manager
npx hardhat verify --network sepolia 0x1234...5678 "0xUSDT_ADDRESS" "0xWETH_ADDRESS"
```

### Manual Verification on Block Explorer

1. Go to [Sepolia Etherscan](https://sepolia.etherscan.io)
2. Find your contract address
3. Click "Verify and Publish"
4. Select "Solidity (Single file)"
5. Upload your contract source code
6. Enter constructor arguments
7. Submit for verification

## 🎯 Step 3: Frontend Integration

### 1. Copy Contract Addresses

After deployment, copy the contract addresses from the deployment output:

```javascript
// Example configuration
export const CONTRACT_ADDRESSES = {
    USDT: "0x1234...5678",
    USDC: "0x2345...6789",
    WETH: "0x3456...7890",
    ROUTER: "0x4567...8901",
    LENDING: "0x5678...9012",
    RANDOM_GENERATOR: "0x6789...0123",
    YIELD_MANAGER: "0x7890...1234"
};
```

### 2. Import Contract ABIs

```javascript
// Import ABIs from compiled contracts
import YieldManagerABI from './artifacts/contracts/KaiaYieldStrategyManager.sol/KaiaYieldStrategyManager.json';
import MockERC20ABI from './artifacts/contracts/mocks/MockERC20.sol/MockERC20.json';
```

### 3. Initialize Contracts

```javascript
import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES } from './config';

// Initialize provider
const provider = new ethers.providers.JsonRpcProvider('YOUR_RPC_URL');
const signer = provider.getSigner();

// Initialize contracts
const yieldManager = new ethers.Contract(
    CONTRACT_ADDRESSES.YIELD_MANAGER,
    YieldManagerABI.abi,
    signer
);

const usdt = new ethers.Contract(
    CONTRACT_ADDRESSES.USDT,
    MockERC20ABI.abi,
    signer
);
```

### 4. Use Contract Functions

```javascript
// Get available strategies
const strategies = await yieldManager.getAvailableStrategies();

// Select best strategy
const [strategyName, explanation] = await yieldManager.selectBestStrategy(
    userAddress,
    ethers.utils.parseUnits("100", 6), // $100 USDT
    30 * 24 * 60 * 60, // 30 days
    5 // Moderate risk
);

// Approve tokens
await usdt.approve(yieldManager.address, amount);

// Invest in strategy (requires CIRCLE_ROLE)
const tx = await yieldManager.investInStrategy(
    userAddress,
    amount,
    strategyName
);
```

## 📊 Available Commands

```bash
# Deploy and verify on testnet
npm run deploy:testnet

# Deploy locally
npm run deploy:core

# Verify existing contracts
npm run verify:contracts

# Compile contracts
npm run compile

# Run tests
npm test
```

## 🔧 Configuration Files

### Frontend Configuration

Use the `frontend-config.js` file for your frontend integration:

```javascript
import { LOCAL_CONFIG, YIELD_STRATEGIES } from './frontend-config.js';

// Get configuration for current network
const config = getConfig(chainId);

// Get strategy information
const strategyInfo = getStrategyInfo('lending');
```

### Network Configuration

Update your `hardhat.config.js` with the correct RPC URLs and API keys:

```javascript
module.exports = {
  networks: {
    sepolia: {
      url: "https://sepolia.infura.io/v3/YOUR_INFURA_KEY",
      accounts: [process.env.PRIVATE_KEY],
      chainId: 11155111
    }
  },
  etherscan: {
    apiKey: "YOUR_ETHERSCAN_API_KEY"
  }
};
```

## 🎯 Yield Strategies Available

| Strategy | APY | Risk | Min Amount | Description |
|----------|-----|------|------------|-------------|
| Treasury | 0% | 1 | $0 | Safe storage |
| Lending | 6% | 3 | $25 | Lend USDT |
| USDT/KAIA LP | 8% | 5 | $50 | Provide liquidity |
| Native Staking | 10% | 2 | 1000 KAIA | Stake KAIA |

## 🔐 Security Considerations

1. **Access Control**: Only contracts with `CIRCLE_ROLE` can invest
2. **Emergency Functions**: Admin can pause contracts in emergencies
3. **Slippage Protection**: Built-in protection for all swaps
4. **Reentrancy Protection**: All functions are protected against reentrancy

## 📝 Next Steps

1. **Deploy to Testnet**: Use `npm run deploy:testnet`
2. **Verify Contracts**: Automatic verification included
3. **Update Frontend Config**: Copy addresses to your frontend
4. **Test Integration**: Test all functions with your frontend
5. **Deploy to Mainnet**: When ready for production

## 🆘 Troubleshooting

### Common Issues

1. **Verification Failed**: Check constructor arguments and source code
2. **Gas Estimation Failed**: Increase gas limit or check contract state
3. **Access Control Error**: Ensure proper roles are granted
4. **Network Issues**: Check RPC URL and network configuration

### Getting Help

- Check the deployment logs for detailed error messages
- Verify your environment variables are set correctly
- Ensure you have sufficient ETH for gas fees
- Check that your contracts are properly compiled

## 🎉 Success Checklist

- [ ] Contracts deployed to testnet
- [ ] Contracts verified on block explorer
- [ ] Contract addresses copied to frontend
- [ ] ABIs imported in frontend
- [ ] Basic integration tested
- [ ] All functions working correctly
- [ ] Ready for production deployment

---

**Your contracts are now ready for frontend integration!** 🚀
