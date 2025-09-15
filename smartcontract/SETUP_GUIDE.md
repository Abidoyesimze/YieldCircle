# 🔧 Setup Guide for Testnet Deployment

## 📋 Prerequisites

Before deploying to testnet, you need to set up a few things:

### 1. **Get Testnet ETH**

You need Sepolia ETH for gas fees. Get it from:
- **Sepolia Faucet**: https://sepoliafaucet.com/
- **Alchemy Faucet**: https://sepoliafaucet.com/
- **Chainlink Faucet**: https://faucets.chain.link/sepolia

### 2. **Set Up Environment Variables**

Create a `.env` file in your project root:

```bash
# Copy the example file
cp env.example .env
```

Then edit `.env` with your values:

```env
# Your wallet private key (without 0x prefix)
PRIVATE_KEY=your_private_key_here

# Etherscan API key (optional, for automatic verification)
ETHERSCAN_API_KEY=your_etherscan_api_key_here

# Infura API key (optional, for better RPC)
INFURA_API_KEY=your_infura_api_key_here
```

### 3. **Get API Keys (Optional)**

#### **Etherscan API Key** (for automatic verification):
1. Go to https://etherscan.io/apis
2. Create a free account
3. Generate an API key
4. Add it to your `.env` file

#### **Infura API Key** (for better RPC):
1. Go to https://infura.io/
2. Create a free account
3. Create a new project
4. Copy the project ID
5. Add it to your `.env` file

## 🚀 Deployment Options

### **Option 1: Simple Deployment (No API Keys Required)**

```bash
# Deploy to Sepolia without automatic verification
npx hardhat run scripts/deploy-sepolia-simple.js --network sepolia
```

This will:
- ✅ Deploy all contracts
- ✅ Show verification commands
- ✅ Generate frontend configuration
- ⚠️ Manual verification required

### **Option 2: Full Deployment with Verification**

```bash
# Deploy and verify automatically (requires API keys)
npm run deploy:testnet
```

This will:
- ✅ Deploy all contracts
- ✅ Verify automatically
- ✅ Generate frontend configuration
- ✅ Show block explorer URLs

## 🔍 Manual Verification

If you use Option 1, you'll get verification commands like this:

```bash
# Verify USDT
npx hardhat verify --network sepolia 0x1234...5678 "Tether USD" "USDT" 6

# Verify Yield Strategy Manager
npx hardhat verify --network sepolia 0x7890...1234 "0xUSDT_ADDRESS" "0xWETH_ADDRESS"
```

## 🎯 Quick Start (Recommended)

1. **Get Sepolia ETH**:
   ```bash
   # Visit https://sepoliafaucet.com/
   # Enter your wallet address
   # Wait for ETH to arrive
   ```

2. **Deploy without API keys**:
   ```bash
   npx hardhat run scripts/deploy-sepolia-simple.js --network sepolia
   ```

3. **Copy the verification commands** from the output

4. **Run verification commands** one by one

5. **Copy the frontend configuration** from the output

## 🆘 Troubleshooting

### **"Insufficient funds"**
- Get more Sepolia ETH from faucets
- Check your wallet address is correct

### **"Network error"**
- Check your internet connection
- Try a different RPC URL

### **"Verification failed"**
- Check constructor arguments
- Ensure contract is deployed
- Wait a few minutes and try again

### **"Private key not set"**
- Create `.env` file with your private key
- Make sure `.env` is in the project root

## 📊 Expected Costs

- **Deployment**: ~0.01-0.02 ETH
- **Verification**: Free
- **Total**: ~0.01-0.02 ETH

## 🎉 Success Checklist

- [ ] Got Sepolia ETH
- [ ] Set up `.env` file
- [ ] Deployed contracts
- [ ] Verified contracts
- [ ] Copied frontend configuration
- [ ] Tested integration

---

**Ready to deploy?** Run the simple deployment command above! 🚀
