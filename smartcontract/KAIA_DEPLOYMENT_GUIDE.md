# 🌟 Kaia Blockchain Deployment Guide

## 📋 Overview

This guide will help you deploy and verify your Yield Protocol contracts on the **Kaia blockchain**.

## 🌐 Kaia Network Information

### **Kaia Mainnet**
- **Chain ID**: 8217
- **RPC URL**: https://public-en.node.kaia.io
- **Block Explorer**: https://scope.kaia.io
- **Native Token**: KAIA

### **Kaia Kairos Testnet**
- **Chain ID**: 1001
- **RPC URL**: https://public-en-kairos.node.kaia.io
- **Block Explorer**: https://scope.kairos.kaia.io
- **Native Token**: KAIA
- **Faucet**: https://faucet.kairos.kaia.io/

## 🚀 Quick Start

### **Step 1: Get KAIA Tokens**

#### **For Testnet (Kairos)**:
1. Go to https://faucet.kairos.kaia.io/
2. Enter your wallet address
3. Request testnet KAIA tokens

#### **For Mainnet**:
- You need real KAIA tokens from exchanges

### **Step 2: Set Up Environment**

Create a `.env` file:

```env
# Your wallet private key (without 0x prefix)
PRIVATE_KEY=your_private_key_here

# Optional: Custom RPC URLs
KAIA_MAINNET_URL=https://public-en.node.kaia.io
KAIA_TESTNET_URL=https://public-en-kairos.node.kaia.io
```

### **Step 3: Deploy to Kaia**

#### **Deploy to Kaia Testnet (Recommended for testing)**:
```bash
npm run deploy:kaia-testnet
```

#### **Deploy to Kaia Mainnet (Production)**:
```bash
npm run deploy:kaia-mainnet
```

## 🔍 Verification on Kaia

### **Automatic Verification**

The deployment script will provide verification commands. Run them one by one:

```bash
# Example verification commands for Kaia testnet
npx hardhat verify --network kaia-testnet 0x1234...5678 "Tether USD" "USDT" 6
npx hardhat verify --network kaia-testnet 0x7890...1234 "0xUSDT_ADDRESS" "0xKAIA_ADDRESS"
```

### **Manual Verification on Kaia Scope**

1. Go to https://scope.kairos.kaia.io/ (testnet) or https://scope.kaia.io/ (mainnet)
2. Find your contract address
3. Click "Verify Contract"
4. Upload your contract source code
5. Enter constructor arguments
6. Submit for verification

## 🎯 Frontend Integration

### **Kaia Network Configuration**

```javascript
// Kaia Testnet Configuration
export const KAIA_TESTNET_CONFIG = {
    USDT: "0x...", // Your deployed USDT address
    USDC: "0x...", // Your deployed USDC address
    KAIA: "0x...", // Your deployed KAIA address
    ROUTER: "0x...", // Your deployed Router address
    LENDING: "0x...", // Your deployed Lending address
    RANDOM_GENERATOR: "0x...", // Your deployed Random Generator address
    YIELD_MANAGER: "0x...", // Your deployed Yield Manager address
    NETWORK: "kaia-testnet",
    CHAIN_ID: 1001,
    RPC_URL: "https://public-en-kairos.node.kaia.io",
    EXPLORER_URL: "https://scope.kairos.kaia.io"
};

// Kaia Mainnet Configuration
export const KAIA_MAINNET_CONFIG = {
    USDT: "0x...", // Your deployed USDT address
    USDC: "0x...", // Your deployed USDC address
    KAIA: "0x...", // Your deployed KAIA address
    ROUTER: "0x...", // Your deployed Router address
    LENDING: "0x...", // Your deployed Lending address
    RANDOM_GENERATOR: "0x...", // Your deployed Random Generator address
    YIELD_MANAGER: "0x...", // Your deployed Yield Manager address
    NETWORK: "kaia-mainnet",
    CHAIN_ID: 8217,
    RPC_URL: "https://public-en.node.kaia.io",
    EXPLORER_URL: "https://scope.kaia.io"
};
```

### **Frontend Integration Example**

```javascript
import { ethers } from 'ethers';
import { KAIA_TESTNET_CONFIG } from './config';

// Initialize provider for Kaia
const provider = new ethers.providers.JsonRpcProvider(KAIA_TESTNET_CONFIG.RPC_URL);
const signer = provider.getSigner();

// Initialize contracts
const yieldManager = new ethers.Contract(
    KAIA_TESTNET_CONFIG.YIELD_MANAGER,
    YieldManagerABI.abi,
    signer
);

// Use the contracts
const strategies = await yieldManager.getAvailableStrategies();
```

## 🎯 Available Yield Strategies on Kaia

| Strategy | APY | Risk | Min Amount | Description |
|----------|-----|------|------------|-------------|
| Treasury | 0% | 1 | $0 | Safe storage |
| Lending | 6% | 3 | $25 | Lend USDT |
| USDT/KAIA LP | 8% | 5 | $50 | Provide liquidity |
| Native Staking | 10% | 2 | 1000 KAIA | Stake KAIA |

## 🔧 Real Kaia Protocol Integration

### **Replace Mock Contracts with Real Protocols**

Once you have real Kaia protocol addresses, update your contracts:

1. **DEX Protocols**: Replace MockRouter with real Kaia DEX
2. **Lending Protocols**: Replace MockLending with real Kaia lending
3. **Staking Protocols**: Replace MockKaiaStaking with real Kaia staking

### **Find Real Kaia Protocol Addresses**

```bash
# Use the address finder script
npm run find-addresses
```

## 📊 Expected Costs

### **Kaia Testnet**
- **Deployment**: ~0.01-0.02 KAIA
- **Verification**: Free
- **Total**: ~0.01-0.02 KAIA

### **Kaia Mainnet**
- **Deployment**: ~0.1-0.2 KAIA
- **Verification**: Free
- **Total**: ~0.1-0.2 KAIA

## 🆘 Troubleshooting

### **Common Issues**

1. **"Insufficient funds"**
   - Get more KAIA from faucet (testnet) or exchange (mainnet)

2. **"Network error"**
   - Check your internet connection
   - Try the alternative RPC URL

3. **"Verification failed"**
   - Check constructor arguments
   - Ensure contract is deployed
   - Wait a few minutes and try again

4. **"Private key not set"**
   - Create `.env` file with your private key
   - Make sure `.env` is in the project root

### **Getting Help**

- **Kaia Documentation**: https://docs.kaia.io/
- **Kaia Discord**: https://discord.gg/kaia
- **Kaia GitHub**: https://github.com/kaia-io

## 🎉 Success Checklist

- [ ] Got KAIA tokens (testnet or mainnet)
- [ ] Set up `.env` file
- [ ] Deployed contracts to Kaia
- [ ] Verified contracts on Kaia Scope
- [ ] Copied frontend configuration
- [ ] Tested integration
- [ ] Ready for production (if mainnet)

## 🚀 Commands Summary

```bash
# Deploy to Kaia testnet
npm run deploy:kaia-testnet

# Deploy to Kaia mainnet
npm run deploy:kaia-mainnet

# Find real Kaia protocol addresses
npm run find-addresses

# Compile contracts
npm run compile

# Run tests
npm test
```

---

**Your contracts are now ready for Kaia blockchain!** 🌟
