# YieldCircle Smart Contracts v2.0

Production-ready smart contracts for trust-based group savings with DeFi yield integration.

## 🚀 Overview

YieldCircle is a decentralized platform that combines traditional rotating savings and credit associations (ROSCAs) with modern DeFi yield strategies. Members contribute USDT regularly, and each cycle one member receives the pooled funds plus accumulated yield from various DeFi protocols.

## 🔒 Security Features

### ✅ Fixed Issues from v1.0
- **Secure Randomness**: Replaced weak `block.difficulty` with Chainlink VRF
- **LP Withdrawal Logic**: Implemented proper liquidity pool withdrawal mechanisms
- **Slippage Protection**: Added slippage protection for all token swaps
- **Access Control**: Enhanced role-based access control with emergency functions
- **Reentrancy Protection**: Comprehensive reentrancy guards on all external calls
- **Bounds Checking**: Added bounds checking for all loops and arrays
- **Error Handling**: Custom error types for better gas efficiency

### 🛡️ Security Enhancements
- **Emergency Controls**: Pause functionality and emergency withdrawal mechanisms
- **Input Validation**: Comprehensive validation for all user inputs
- **Gas Optimization**: Optimized for gas efficiency with proper data structures
- **Audit Ready**: Structured for professional security audits

## 📁 Contract Architecture

```
contracts/
├── interfaces/
│   └── IKaiasProtocol.sol          # Kaia DeFi protocol interfaces
├── libraries/
│   └── RandomGenerator.sol          # Secure random number generation
├── KaiaYieldStrategyManager.sol    # DeFi yield strategy management
├── YieldCircleFactory.sol          # Circle creation and management
└── YieldCircle.sol                 # Main circle contract
```

## 🏗️ Contract Components

### 1. RandomGenerator.sol
- **Purpose**: Secure random number generation using Chainlink VRF
- **Features**: 
  - VRF integration for fair payout position assignment
  - Request tracking and fulfillment
  - Fallback mechanisms for testing

### 2. KaiaYieldStrategyManager.sol
- **Purpose**: Manages DeFi yield strategies and investments
- **Strategies**:
  - Treasury (0% yield, maximum safety)
  - USDT/USDC LP (4.5% APY, low risk)
  - USDT/KAIA LP (8% APY, medium risk)
  - USDT Lending (6% APY, conservative)
- **Features**:
  - AI-powered strategy selection
  - Slippage protection
  - Emergency controls
  - Actual yield tracking

### 3. YieldCircleFactory.sol
- **Purpose**: Creates and manages yield circles
- **Features**:
  - Template-based circle creation
  - Member validation and limits
  - Security controls
  - Gas optimization

### 4. YieldCircle.sol
- **Purpose**: Main circle contract handling contributions and payouts
- **Features**:
  - Secure random position assignment
  - Automated yield investment
  - Social resolution for defaults
  - Emergency controls

## 🚀 Deployment

### Prerequisites
```bash
npm install
```

### Environment Variables
Create a `.env` file:
```env
# Network RPC URLs
SEPOLIA_URL=https://sepolia.infura.io/v3/YOUR-PROJECT-ID
MAINNET_URL=https://mainnet.infura.io/v3/YOUR-PROJECT-ID

# Private Key (for deployment)
PRIVATE_KEY=your_private_key_here

# Token Addresses
USDT_ADDRESS=0x...  # USDT token address
KAIA_ADDRESS=0x...  # KAIA token address
USDC_ADDRESS=0x...  # USDC token address

# Kaia Protocol Addresses
KAIA_ROUTER=0x...   # Kaia router address
KAIA_LENDING=0x...  # Kaia lending address

# Chainlink VRF
VRF_COORDINATOR=0x...  # VRF coordinator address
VRF_KEY_HASH=0x...     # VRF key hash
VRF_SUBSCRIPTION_ID=0  # VRF subscription ID

# API Keys
ETHERSCAN_API_KEY=your_etherscan_api_key
```

### Deploy to Testnet
```bash
npm run deploy:testnet
```

### Deploy to Mainnet
```bash
npm run deploy:mainnet
```

## 🧪 Testing

### Run Tests
```bash
npm test
```

### Run Tests with Gas Reporting
```bash
npm run gas
```

### Run Coverage
```bash
npm run test:coverage
```

## 🔍 Verification

### Verify on Etherscan
```bash
npx hardhat verify --network sepolia DEPLOYED_CONTRACT_ADDRESS "constructor_arg1" "constructor_arg2"
```

## 📊 Gas Optimization

The contracts are optimized for gas efficiency:
- Custom error types instead of require statements
- Efficient data structures
- Optimized loops and bounds checking
- Minimal storage operations

## 🛡️ Security Checklist

### Pre-Deployment
- [ ] Run comprehensive tests
- [ ] Perform gas analysis
- [ ] Run security linter
- [ ] Conduct manual review
- [ ] Professional audit (recommended)

### Post-Deployment
- [ ] Verify contracts on Etherscan
- [ ] Test all functions on testnet
- [ ] Monitor for any issues
- [ ] Set up monitoring and alerts

## 🔧 Configuration

### Strategy Parameters
- **APY Rates**: Configurable via admin functions
- **Risk Scores**: 1-10 scale for strategy selection
- **Minimum Investments**: Strategy-specific minimums
- **Slippage Protection**: Default 2%, max 5%

### Circle Templates
- **Family**: 3-8 members, $25-$1000 contributions
- **Friends**: 4-12 members, $50-$500 contributions  
- **Community**: 8-20 members, $100-$2000 contributions

## 🚨 Emergency Procedures

### Emergency Pause
```javascript
// Pause all operations
await yieldManager.activateEmergencyMode("Security concern detected");
```

### Emergency Withdrawal
```javascript
// Withdraw funds to treasury
await yieldManager.emergencyWithdraw(circleAddress);
```

## 📈 Monitoring

### Key Metrics
- Total circles created
- Total value locked (TVL)
- Yield earned across strategies
- Gas usage per operation
- Error rates and failures

### Alerts
- Unusual withdrawal patterns
- Failed transactions
- Gas price spikes
- Contract errors

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

- **Documentation**: [docs.yieldcircle.com](https://docs.yieldcircle.com)
- **Discord**: [discord.gg/yieldcircle](https://discord.gg/yieldcircle)
- **Email**: support@yieldcircle.com

## ⚠️ Disclaimer

These smart contracts are provided as-is. Users should conduct their own research and due diligence before using them. The authors are not responsible for any financial losses incurred through the use of these contracts.

---

**Version**: 2.0.0  
**Last Updated**: 2024  
**Solidity Version**: 0.8.19  
**License**: MIT
