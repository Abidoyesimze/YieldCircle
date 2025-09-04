const { ethers } = require("hardhat");
const { getNetworkConfig } = require("../config/testnet-addresses");

/**
 * @title Kaia Kairos Testnet Deployment Script
 * @dev Deploys YieldCircle contracts to Kaia Kairos testnet with mock tokens
 */

async function main() {
    console.log("🚀 Deploying YieldCircle contracts to Kaia Kairos Testnet...");
    
    // Get network configuration
    const config = getNetworkConfig('kaia-testnet');
    console.log(`📡 Network: Kaia Kairos Testnet (Chain ID: ${config.chainId})`);
    console.log(`🌐 Explorer: ${config.explorerUrl}`);
    
    const [deployer] = await ethers.getSigners();
    console.log(`👤 Deploying from: ${deployer.address}`);
    console.log(`💰 Deployer balance: ${ethers.utils.formatEther(await deployer.getBalance())} KAIA`);
    
    // Check if we have enough balance
    const balance = await deployer.getBalance();
    if (balance.lt(ethers.utils.parseEther("0.1"))) {
        console.log("⚠️ Warning: Low balance. Get testnet KAIA from faucet:");
        console.log("   Visit: https://kairos.kaiascan.io/faucet");
        return;
    }
    
    console.log("\n📦 Step 1: Deploying Mock Tokens...");
    
    // Deploy Mock USDT
    const MockUSDT = await ethers.getContractFactory("MockERC20");
    const mockUSDT = await MockUSDT.deploy("Mock USDT", "USDT", 6);
    await mockUSDT.deployed();
    console.log(`✅ Mock USDT deployed to: ${mockUSDT.address}`);
    
    // Deploy Mock USDC
    const mockUSDC = await MockUSDT.deploy("Mock USDC", "USDC", 6);
    await mockUSDC.deployed();
    console.log(`✅ Mock USDC deployed to: ${mockUSDC.address}`);
    
    // Deploy Mock KAIA (wrapped version)
    const mockKAIA = await MockUSDT.deploy("Mock KAIA", "KAIA", 18);
    await mockKAIA.deployed();
    console.log(`✅ Mock KAIA deployed to: ${mockKAIA.address}`);
    
    console.log("\n📦 Step 2: Deploying Mock DeFi Protocols...");
    
    // Deploy Mock Router
    const MockRouter = await ethers.getContractFactory("MockRouter");
    const mockRouter = await MockRouter.deploy();
    await mockRouter.deployed();
    console.log(`✅ Mock Router deployed to: ${mockRouter.address}`);
    
    // Deploy Mock Lending
    const MockLending = await ethers.getContractFactory("MockLending");
    const mockLending = await MockLending.deploy(mockUSDT.address);
    await mockLending.deployed();
    console.log(`✅ Mock Lending deployed to: ${mockLending.address}`);
    
    // Deploy Mock Factory
    const MockFactory = await ethers.getContractFactory("MockFactory");
    const mockFactory = await MockFactory.deploy();
    await mockFactory.deployed();
    console.log(`✅ Mock Factory deployed to: ${mockFactory.address}`);
    
    console.log("\n📦 Step 3: Deploying Alternative Randomness...");
    
    // Deploy Alternative Random Generator (since VRF not available)
    const AlternativeRandomGenerator = await ethers.getContractFactory("AlternativeRandomGenerator");
    const randomGenerator = await AlternativeRandomGenerator.deploy();
    await randomGenerator.deployed();
    console.log(`✅ Alternative Random Generator deployed to: ${randomGenerator.address}`);
    
    console.log("\n📦 Step 4: Deploying Yield Strategy Manager...");
    
    // Deploy KaiaYieldStrategyManager with mock addresses
    const KaiaYieldStrategyManager = await ethers.getContractFactory("KaiaYieldStrategyManager");
    const yieldManager = await KaiaYieldStrategyManager.deploy(
        mockUSDT.address,  // USDT
        mockKAIA.address,  // KAIA
        mockUSDC.address,  // USDC
        mockRouter.address, // Router
        mockLending.address // Lending
    );
    await yieldManager.deployed();
    console.log(`✅ KaiaYieldStrategyManager deployed to: ${yieldManager.address}`);
    
    console.log("\n📦 Step 5: Deploying Yield Circle Factory...");
    
    // Deploy YieldCircleFactory
    const YieldCircleFactory = await ethers.getContractFactory("YieldCircleFactory");
    const factory = await YieldCircleFactory.deploy(
        mockUSDT.address,     // USDT
        yieldManager.address,  // Yield Manager
        randomGenerator.address // Random Generator
    );
    await factory.deployed();
    console.log(`✅ YieldCircleFactory deployed to: ${factory.address}`);
    
    console.log("\n📦 Step 6: Setting up permissions...");
    
    // Grant roles
    await yieldManager.grantRole(await yieldManager.STRATEGY_MANAGER_ROLE(), factory.address);
    await yieldManager.grantRole(await yieldManager.CIRCLE_ROLE(), factory.address);
    await randomGenerator.grantRole(await randomGenerator.OPERATOR_ROLE(), factory.address);
    
    console.log("✅ Permissions granted");
    
    console.log("\n📦 Step 7: Initializing strategies...");
    
    // Initialize strategies with mock data
    await yieldManager.addStrategy(
        "treasury",
        "Treasury Reserve",
        ethers.constants.AddressZero,
        0, // 0% APY
        1, // Risk score
        10, // Liquidity score
        0, // Min amount
        1000000e6, // Max amount
        0 // Strategy type
    );
    
    await yieldManager.addStrategy(
        "lending",
        "USDT Lending",
        mockLending.address,
        600, // 6% APY
        3, // Risk score
        9, // Liquidity score
        25e6, // Min amount
        200000e6, // Max amount
        1 // Strategy type
    );
    
    console.log("✅ Strategies initialized");
    
    console.log("\n🎉 Deployment Complete!");
    console.log("\n📋 Contract Addresses:");
    console.log(`   Mock USDT: ${mockUSDT.address}`);
    console.log(`   Mock USDC: ${mockUSDC.address}`);
    console.log(`   Mock KAIA: ${mockKAIA.address}`);
    console.log(`   Mock Router: ${mockRouter.address}`);
    console.log(`   Mock Lending: ${mockLending.address}`);
    console.log(`   Mock Factory: ${mockFactory.address}`);
    console.log(`   Random Generator: ${randomGenerator.address}`);
    console.log(`   Yield Manager: ${yieldManager.address}`);
    console.log(`   Factory: ${factory.address}`);
    
    console.log("\n🔗 Explorer Links:");
    console.log(`   Factory: ${config.explorerUrl}/address/${factory.address}`);
    console.log(`   Yield Manager: ${config.explorerUrl}/address/${yieldManager.address}`);
    
    console.log("\n🚀 Next Steps:");
    console.log("1. Test contract interactions");
    console.log("2. Create a test circle");
    console.log("3. Test yield strategies");
    console.log("4. Test randomness generation");
    
    // Save deployment info
    const deploymentInfo = {
        network: "kaia-kairos-testnet",
        chainId: config.chainId,
        deployer: deployer.address,
        contracts: {
            mockUSDT: mockUSDT.address,
            mockUSDC: mockUSDC.address,
            mockKAIA: mockKAIA.address,
            mockRouter: mockRouter.address,
            mockLending: mockLending.address,
            mockFactory: mockFactory.address,
            randomGenerator: randomGenerator.address,
            yieldManager: yieldManager.address,
            factory: factory.address
        },
        timestamp: new Date().toISOString()
    };
    
    require('fs').writeFileSync(
        'deployment-kaia-testnet.json',
        JSON.stringify(deploymentInfo, null, 2)
    );
    console.log("\n💾 Deployment info saved to: deployment-kaia-testnet.json");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Deployment failed:", error);
        process.exit(1);
    });
