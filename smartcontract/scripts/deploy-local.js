/**
 * @title Deploy to Local Hardhat Network
 * @dev Deploys YieldCircle to local Hardhat network for testing
 */

const { ethers } = require("hardhat");

async function deployLocal() {
    console.log('\n🚀 Deploying YieldCircle to Local Hardhat Network...');

    const [deployer] = await ethers.getSigners();
    console.log(`Deployer: ${deployer.address}`);

    // Check deployer balance
    const balance = await deployer.getBalance();
    console.log(`Deployer balance: ${ethers.utils.formatEther(balance)} ETH`);

    try {
        // 1. Deploy Mock Tokens first
        console.log('\n📦 Step 1: Deploying Mock Tokens...');

        const MockERC20 = await ethers.getContractFactory("MockERC20");

        // Deploy USDT
        const usdt = await MockERC20.deploy("Tether USD", "USDT", 6);
        await usdt.deployed();
        console.log(`✅ USDT: ${usdt.address}`);

        // Deploy USDC
        const usdc = await MockERC20.deploy("USD Coin", "USDC", 6);
        await usdc.deployed();
        console.log(`✅ USDC: ${usdc.address}`);

        // Deploy WETH (using MockERC20 with 18 decimals)
        const weth = await MockERC20.deploy("Wrapped Ether", "WETH", 18);
        await weth.deployed();
        console.log(`✅ WETH: ${weth.address}`);

        // 2. Deploy Mock Router
        console.log('\n📦 Step 2: Deploying Mock Router...');
        const MockRouter = await ethers.getContractFactory("MockRouter");
        const router = await MockRouter.deploy();
        await router.deployed();
        console.log(`✅ Mock Router: ${router.address}`);

        // 3. Deploy Mock Lending
        console.log('\n📦 Step 3: Deploying Mock Lending...');
        const MockLending = await ethers.getContractFactory("MockLending");
        const lending = await MockLending.deploy();
        await lending.deployed();
        console.log(`✅ Mock Lending: ${lending.address}`);

        // 4. Deploy Random Generator (with mock VRF)
        console.log('\n📦 Step 4: Deploying Random Generator...');
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

        // 5. Deploy Yield Strategy Manager
        console.log('\n📦 Step 5: Deploying Yield Strategy Manager...');
        const KaiaYieldStrategyManager = await ethers.getContractFactory("KaiaYieldStrategyManager");
        const yieldManager = await KaiaYieldStrategyManager.deploy(
            usdt.address,
            weth.address
        );
        await yieldManager.deployed();
        console.log(`✅ Yield Strategy Manager: ${yieldManager.address}`);

        // 6. Deploy Yield Circle Factory
        console.log('\n📦 Step 6: Deploying Yield Circle Factory...');
        const YieldCircleFactory = await ethers.getContractFactory("YieldCircleFactory");
        const factory = await YieldCircleFactory.deploy(
            usdt.address,
            yieldManager.address,
            randomGenerator.address
        );
        await factory.deployed();
        console.log(`✅ Yield Circle Factory: ${factory.address}`);

        // 7. Grant necessary roles
        console.log('\n🔐 Step 7: Setting up roles and permissions...');

        const CIRCLE_ROLE = await yieldManager.CIRCLE_ROLE();
        await yieldManager.grantRole(CIRCLE_ROLE, factory.address);
        console.log(`✅ Granted CIRCLE_ROLE to factory`);

        const STRATEGY_MANAGER_ROLE = await yieldManager.STRATEGY_MANAGER_ROLE();
        await yieldManager.grantRole(STRATEGY_MANAGER_ROLE, deployer.address);
        console.log(`✅ Granted STRATEGY_MANAGER_ROLE to deployer`);

        const EMERGENCY_ROLE = await yieldManager.EMERGENCY_ROLE();
        await yieldManager.grantRole(EMERGENCY_ROLE, deployer.address);
        console.log(`✅ Granted EMERGENCY_ROLE to deployer`);

        // 8. Mint some tokens for testing
        console.log('\n💰 Step 8: Minting test tokens...');
        await usdt.mint(deployer.address, ethers.utils.parseUnits("10000", 6)); // 10,000 USDT
        await usdc.mint(deployer.address, ethers.utils.parseUnits("10000", 6)); // 10,000 USDC
        await weth.mint(deployer.address, ethers.utils.parseEther("100")); // 100 WETH
        console.log(`✅ Minted test tokens`);

        // 9. Display deployment summary
        console.log('\n📊 Deployment Summary:');
        console.log(`Network: Local Hardhat`);
        console.log(`Deployer: ${deployer.address}`);
        console.log(`USDT: ${usdt.address}`);
        console.log(`USDC: ${usdc.address}`);
        console.log(`WETH: ${weth.address}`);
        console.log(`Mock Router: ${router.address}`);
        console.log(`Mock Lending: ${lending.address}`);
        console.log(`Random Generator: ${randomGenerator.address}`);
        console.log(`Yield Strategy Manager: ${yieldManager.address}`);
        console.log(`Yield Circle Factory: ${factory.address}`);

        // 10. Verify configuration
        console.log('\n🔍 Verifying configuration...');
        const strategies = await yieldManager.getAvailableStrategies();
        console.log('\n📈 Available Yield Strategies:');
        for (let i = 0; i < strategies.names.length; i++) {
            console.log(`  ${strategies.names[i]}: ${strategies.apys[i] / 100}% APY, Risk: ${strategies.riskScores[i]}, Min: $${strategies.minAmounts[i] / 1e6}`);
        }

        // 11. Test strategy selection
        console.log('\n🤖 Testing AI Strategy Selection...');
        const testAmount = ethers.utils.parseUnits("100", 6); // $100 USDT
        const timeHorizon = 30 * 24 * 60 * 60; // 30 days
        const riskTolerance = 5; // Moderate risk

        const [selectedStrategy, explanation] = await yieldManager.selectBestStrategy(
            deployer.address,
            testAmount,
            timeHorizon,
            riskTolerance
        );

        console.log(`Selected strategy: ${selectedStrategy}`);
        console.log(`Explanation: ${explanation}`);

        console.log('\n💾 Local deployment completed successfully!');
        console.log('\n📝 Next Steps:');
        console.log('1. Test creating circles');
        console.log('2. Test yield strategies');
        console.log('3. Test emergency functions');
        console.log('4. Deploy to testnet when ready');

        return {
            network: 'local',
            deployer: deployer.address,
            contracts: {
                usdt: usdt.address,
                usdc: usdc.address,
                weth: weth.address,
                router: router.address,
                lending: lending.address,
                randomGenerator: randomGenerator.address,
                yieldManager: yieldManager.address,
                factory: factory.address
            },
            timestamp: new Date().toISOString()
        };

    } catch (error) {
        console.error('❌ Deployment failed:', error.message);
        throw error;
    }
}

if (require.main === module) {
    deployLocal().catch(console.error);
}

module.exports = { deployLocal };
