const { ethers } = require("hardhat");

async function deployFactoryOnly() {
    console.log("🚀 Deploying YieldCircleFactory with correct dependencies...\n");
    
    const [deployer] = await ethers.getSigners();
    console.log(`Deployer: ${deployer.address}`);
    console.log(`Balance: ${ethers.utils.formatEther(await deployer.getBalance())} ETH\n`);
    
    try {
        // Step 1: Deploy Mock Contracts (if not already deployed)
        console.log("📦 Step 1: Deploying Mock Contracts...");
        
        // Deploy Mock USDT
        const MockERC20 = await ethers.getContractFactory("MockERC20");
        const mockUSDT = await MockERC20.deploy("Mock USDT", "USDT", 6);
        await mockUSDT.deployed();
        console.log(`✅ Mock USDT: ${mockUSDT.address}`);
        
        // Deploy Mock USDC
        const mockUSDC = await MockERC20.deploy("Mock USDC", "USDC", 6);
        await mockUSDC.deployed();
        console.log(`✅ Mock USDC: ${mockUSDC.address}`);
        
        // Deploy Mock KAIA
        const mockKAIA = await MockERC20.deploy("Mock KAIA", "KAIA", 18);
        await mockKAIA.deployed();
        console.log(`✅ Mock KAIA: ${mockKAIA.address}`);
        
        // Deploy Mock Router
        const MockRouter = await ethers.getContractFactory("MockRouter");
        const mockRouter = await MockRouter.deploy();
        await mockRouter.deployed();
        console.log(`✅ Mock Router: ${mockRouter.address}`);
        
        // Deploy Mock Lending
        const MockLending = await ethers.getContractFactory("MockLending");
        const mockLending = await MockLending.deploy(mockUSDT.address);
        await mockLending.deployed();
        console.log(`✅ Mock Lending: ${mockLending.address}`);
        
        // Step 2: Deploy Random Generator
        console.log("\n📦 Step 2: Deploying Random Generator...");
        
        // For testnet, we'll use a mock VRF coordinator
        const RandomGenerator = await ethers.getContractFactory("RandomGenerator");
        const randomGenerator = await RandomGenerator.deploy(
            deployer.address, // Mock VRF coordinator
            "0x0000000000000000000000000000000000000000000000000000000000000000", // Mock key hash
            1, // Mock subscription ID
            200000, // Callback gas limit
            3 // Request confirmations
        );
        await randomGenerator.deployed();
        console.log(`✅ Random Generator: ${randomGenerator.address}`);
        
        // Step 3: Deploy Yield Strategy Manager
        console.log("\n📦 Step 3: Deploying Yield Strategy Manager...");
        
        const KaiaYieldStrategyManager = await ethers.getContractFactory("KaiaYieldStrategyManager");
        const yieldManager = await KaiaYieldStrategyManager.deploy(
            mockUSDT.address,  // USDT
            mockKAIA.address,  // KAIA
            mockUSDC.address,  // USDC
            mockRouter.address, // Router
            mockLending.address // Lending
        );
        await yieldManager.deployed();
        console.log(`✅ Yield Strategy Manager: ${yieldManager.address}`);
        
        // Step 4: Deploy Yield Circle Factory
        console.log("\n📦 Step 4: Deploying Yield Circle Factory...");
        
        const YieldCircleFactory = await ethers.getContractFactory("YieldCircleFactory");
        const factory = await YieldCircleFactory.deploy(
            mockUSDT.address,        // USDT
            yieldManager.address,     // Yield Manager
            randomGenerator.address   // Random Generator
        );
        await factory.deployed();
        console.log(`✅ Yield Circle Factory: ${factory.address}`);
        
        // Step 5: Set up roles and permissions
        console.log("\n🔐 Step 5: Setting up roles and permissions...");
        
        // Grant OPERATOR_ROLE to factory for random position initialization
        await randomGenerator.grantRole(await randomGenerator.OPERATOR_ROLE(), factory.address);
        console.log("✅ Granted OPERATOR_ROLE to factory");
        
        // Grant CIRCLE_ROLE to factory for yield manager access
        await yieldManager.grantRole(await yieldManager.CIRCLE_ROLE(), factory.address);
        console.log("✅ Granted CIRCLE_ROLE to factory");
        
        // Grant STRATEGY_MANAGER_ROLE to deployer
        await yieldManager.grantRole(await yieldManager.STRATEGY_MANAGER_ROLE(), deployer.address);
        console.log("✅ Granted STRATEGY_MANAGER_ROLE to deployer");
        
        // Step 6: Display final configuration
        console.log("\n🎉 Deployment Complete!");
        console.log("=" * 50);
        console.log("📋 Contract Addresses:");
        console.log(`USDT: ${mockUSDT.address}`);
        console.log(`USDC: ${mockUSDC.address}`);
        console.log(`KAIA: ${mockKAIA.address}`);
        console.log(`Router: ${mockRouter.address}`);
        console.log(`Lending: ${mockLending.address}`);
        console.log(`Random Generator: ${randomGenerator.address}`);
        console.log(`Yield Manager: ${yieldManager.address}`);
        console.log(`Yield Circle Factory: ${factory.address}`);
        console.log("=" * 50);
        
        // Step 7: Verify factory is working
        console.log("\n🔍 Verifying Factory Setup...");
        
        // Check if factory is paused
        const isPaused = await factory.paused();
        console.log(`Factory paused: ${isPaused ? '❌ YES' : '✅ NO'}`);
        
        // Check family template
        const template = await factory.templates("family");
        console.log(`Family template active: ${template.isActive ? '✅ YES' : '❌ NO'}`);
        console.log(`Family template min members: ${template.minMembers.toString()}`);
        console.log(`Family template max members: ${template.maxMembers.toString()}`);
        console.log(`Family template min contribution: ${template.minContribution.toString()}`);
        console.log(`Family template max contribution: ${template.maxContribution.toString()}`);
        
        // Check dependencies
        const factoryUSDT = await factory.USDT();
        const factoryYieldManager = await factory.yieldManager();
        const factoryRandomGenerator = await factory.randomGenerator();
        
        console.log("\n🔗 Factory Dependencies:");
        console.log(`Factory USDT: ${factoryUSDT}`);
        console.log(`Factory Yield Manager: ${factoryYieldManager}`);
        console.log(`Factory Random Generator: ${factoryRandomGenerator}`);
        
        console.log("\n✅ Factory is ready to create circles!");
        
        // Step 8: Save configuration for frontend
        console.log("\n📝 Frontend Configuration:");
        console.log("Update your frontend/src/abi/index.tsx with these addresses:");
        console.log(`
export const USDTContract = {
    abi: MockERC20,
    address: '${mockUSDT.address}',
}

export const USDCContract = {
    abi: MockERC20,
    address: '${mockUSDC.address}',
}

export const KAIAContract = {
    abi: MockERC20,
    address: '${mockKAIA.address}',
}

export const RouterContract = {
    abi: MockRouter,
    address: '${mockRouter.address}',
}

export const LendingContract = {
    abi: MockLending,
    address: '${mockLending.address}',
}

export const RandomGeneratorContract = {
    abi: RandomGenerator,
    address: '${randomGenerator.address}',
}

export const KaiaYieldStrategyManagerContract = {
    abi: KaiaYieldStrategyManager,
    address: '${yieldManager.address}',
}

export const YieldCircleFactoryContract = {
    abi: YieldCircleFactory,
    address: '${factory.address}',
}
        `);
        
    } catch (error) {
        console.error("❌ Deployment failed:", error);
        throw error;
    }
}

deployFactoryOnly()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
