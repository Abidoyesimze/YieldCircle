/**
 * @title Deploy to Sepolia Testnet
 * @dev Deploys YieldCircle to Sepolia testnet with real addresses
 */

const { ethers } = require("hardhat");
const { getNetworkConfig } = require('../config/testnet-addresses.js');

async function deployToSepolia() {
    console.log('\n🚀 Deploying YieldCircle to Sepolia Testnet...');

    // Use Sepolia configuration
    const config = getNetworkConfig('sepolia');

    const [deployer] = await ethers.getSigners();
    console.log(`Deployer: ${deployer.address}`);

    // Check deployer balance
    const balance = await deployer.getBalance();
    console.log(`Deployer balance: ${ethers.utils.formatEther(balance)} ETH`);

    if (balance.lt(ethers.utils.parseEther("0.01"))) {
        console.log('⚠️ Warning: Low ETH balance. You may need more ETH for deployment.');
        console.log('Get testnet ETH from: https://sepoliafaucet.com/');
    }

    try {
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
            config.tokens.WETH, // Using WETH instead of KAIA for Sepolia
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

        const CIRCLE_ROLE = await yieldManager.CIRCLE_ROLE();
        await yieldManager.grantRole(CIRCLE_ROLE, factory.address);
        console.log(`✅ Granted CIRCLE_ROLE to factory`);

        const STRATEGY_MANAGER_ROLE = await yieldManager.STRATEGY_MANAGER_ROLE();
        await yieldManager.grantRole(STRATEGY_MANAGER_ROLE, deployer.address);
        console.log(`✅ Granted STRATEGY_MANAGER_ROLE to deployer`);

        const EMERGENCY_ROLE = await yieldManager.EMERGENCY_ROLE();
        await yieldManager.grantRole(EMERGENCY_ROLE, deployer.address);
        console.log(`✅ Granted EMERGENCY_ROLE to deployer`);

        // 5. Display deployment summary
        console.log('\n📊 Deployment Summary:');
        console.log(`Network: Sepolia Testnet`);
        console.log(`Chain ID: ${config.chainId}`);
        console.log(`Explorer: ${config.explorerUrl}`);
        console.log(`Deployer: ${deployer.address}`);
        console.log(`Random Generator: ${randomGenerator.address}`);
        console.log(`Yield Strategy Manager: ${yieldManager.address}`);
        console.log(`Yield Circle Factory: ${factory.address}`);

        // 6. Verify configuration
        console.log('\n🔍 Verifying configuration...');
        const strategies = await yieldManager.getAvailableStrategies();
        console.log('\n📈 Available Yield Strategies:');
        for (let i = 0; i < strategies.names.length; i++) {
            console.log(`  ${strategies.names[i]}: ${strategies.apys[i] / 100}% APY, Risk: ${strategies.riskScores[i]}, Min: $${strategies.minAmounts[i] / 1e6}`);
        }

        // 7. Save deployment info
        const deploymentInfo = {
            network: 'sepolia',
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
            timestamp: new Date().toISOString(),
            explorerUrl: config.explorerUrl
        };

        console.log('\n💾 Deployment completed successfully!');
        console.log('\n🔗 Contract Links:');
        console.log(`Random Generator: ${config.explorerUrl}/address/${randomGenerator.address}`);
        console.log(`Yield Manager: ${config.explorerUrl}/address/${yieldManager.address}`);
        console.log(`Factory: ${config.explorerUrl}/address/${factory.address}`);

        console.log('\n📝 Next Steps:');
        console.log('1. Verify contracts on Etherscan');
        console.log('2. Test yield strategies');
        console.log('3. Create test circles');
        console.log('4. Monitor performance');

        return deploymentInfo;

    } catch (error) {
        console.error('❌ Deployment failed:', error.message);
        throw error;
    }
}

if (require.main === module) {
    deployToSepolia().catch(console.error);
}

module.exports = { deployToSepolia };
