/**
 * @title Deploy Complete YieldCircle System
 * @dev Deploys all contracts with proper integration
 */

const { ethers } = require("hardhat");
const { getNetworkConfig } = require('../config/testnet-addresses.js');

async function deployCompleteSystem() {
    const networkName = process.env.NETWORK || 'kaia-testnet';
    const config = getNetworkConfig(networkName);

    console.log(`\n🚀 Deploying Complete YieldCircle System to ${networkName}...`);

    const [deployer] = await ethers.getSigners();
    console.log(`Deployer: ${deployer.address}`);

    // 1. Deploy Random Generator
    console.log('\n📦 Step 1: Deploying Random Generator...');
    const RandomGenerator = await ethers.getContractFactory("RandomGenerator");
    const randomGenerator = await RandomGenerator.deploy(
        config.vrf.coordinator,
        config.vrf.keyHash,
        config.vrf.subscriptionId,
        config.vrf.callbackGasLimit,
        config.vrf.requestConfirmations
    );
    await randomGenerator.deployed();
    console.log(`✅ Random Generator: ${randomGenerator.address}`);

    // 2. Deploy Yield Strategy Manager
    console.log('\n📦 Step 2: Deploying Yield Strategy Manager...');
    const KaiaYieldStrategyManager = await ethers.getContractFactory("KaiaYieldStrategyManager");
    const yieldManager = await KaiaYieldStrategyManager.deploy(
        config.tokens.USDT,
        config.tokens.KAIA,
        config.tokens.USDC,
        config.protocols.router,
        config.protocols.lending
    );
    await yieldManager.deployed();
    console.log(`✅ Yield Strategy Manager: ${yieldManager.address}`);

    // 3. Deploy Yield Circle Factory
    console.log('\n📦 Step 3: Deploying Yield Circle Factory...');
    const YieldCircleFactory = await ethers.getContractFactory("YieldCircleFactory");
    const factory = await YieldCircleFactory.deploy(
        config.tokens.USDT,
        yieldManager.address,
        randomGenerator.address
    );
    await factory.deployed();
    console.log(`✅ Yield Circle Factory: ${factory.address}`);

    // 4. Grant necessary roles
    console.log('\n🔐 Step 4: Setting up roles and permissions...');

    // Grant CIRCLE_ROLE to factory
    const CIRCLE_ROLE = await yieldManager.CIRCLE_ROLE();
    await yieldManager.grantRole(CIRCLE_ROLE, factory.address);
    console.log(`✅ Granted CIRCLE_ROLE to factory`);

    // Grant STRATEGY_MANAGER_ROLE to deployer
    const STRATEGY_MANAGER_ROLE = await yieldManager.STRATEGY_MANAGER_ROLE();
    await yieldManager.grantRole(STRATEGY_MANAGER_ROLE, deployer.address);
    console.log(`✅ Granted STRATEGY_MANAGER_ROLE to deployer`);

    // Grant EMERGENCY_ROLE to deployer
    const EMERGENCY_ROLE = await yieldManager.EMERGENCY_ROLE();
    await yieldManager.grantRole(EMERGENCY_ROLE, deployer.address);
    console.log(`✅ Granted EMERGENCY_ROLE to deployer`);

    // 5. Set LP token addresses (if available)
    console.log('\n🔗 Step 5: Configuring LP token addresses...');
    if (config.lpTokens.USDT_USDC !== "0x0000000000000000000000000000000000000000") {
        await yieldManager.setLPTokenAddress("stable_lp", config.lpTokens.USDT_USDC);
        console.log(`✅ Set USDT/USDC LP token address`);
    }

    if (config.lpTokens.USDT_KAIA !== "0x0000000000000000000000000000000000000000") {
        await yieldManager.setLPTokenAddress("native_lp", config.lpTokens.USDT_KAIA);
        console.log(`✅ Set USDT/KAIA LP token address`);
    }

    // 6. Display deployment summary
    console.log('\n📊 Deployment Summary:');
    console.log(`Network: ${networkName}`);
    console.log(`Chain ID: ${config.chainId}`);
    console.log(`Deployer: ${deployer.address}`);
    console.log(`Random Generator: ${randomGenerator.address}`);
    console.log(`Yield Strategy Manager: ${yieldManager.address}`);
    console.log(`Yield Circle Factory: ${factory.address}`);

    // 7. Verify system integration
    console.log('\n🔍 Verifying system integration...');

    // Check factory configuration
    const factoryUSDT = await factory.USDT();
    const factoryYieldManager = await factory.yieldManager();
    const factoryRandomGenerator = await factory.randomGenerator();

    console.log(`Factory USDT: ${factoryUSDT}`);
    console.log(`Factory Yield Manager: ${factoryYieldManager}`);
    console.log(`Factory Random Generator: ${factoryRandomGenerator}`);

    // Check yield manager strategies
    const strategies = await yieldManager.getAvailableStrategies();
    console.log('\n📈 Available Yield Strategies:');
    for (let i = 0; i < strategies.names.length; i++) {
        console.log(`  ${strategies.names[i]}: ${strategies.apys[i] / 100}% APY, Risk: ${strategies.riskScores[i]}, Min: $${strategies.minAmounts[i] / 1e6}`);
    }

    // 8. Save deployment info
    const deploymentInfo = {
        network: networkName,
        chainId: config.chainId,
        deployer: deployer.address,
        contracts: {
            randomGenerator: randomGenerator.address,
            yieldManager: yieldManager.address,
            factory: factory.address
        },
        tokens: config.tokens,
        protocols: config.protocols,
        vrf: config.vrf,
        timestamp: new Date().toISOString()
    };

    console.log('\n💾 Deployment info saved to deployment-info.json');

    return deploymentInfo;
}

if (require.main === module) {
    deployCompleteSystem().catch(console.error);
}

module.exports = { deployCompleteSystem };
