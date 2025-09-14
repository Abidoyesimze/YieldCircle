/**
 * @title Deploy Yield Strategy Manager
 * @dev Deploys the yield strategy manager with proper configuration
 */

const { ethers } = require("hardhat");
const { getNetworkConfig } = require('../config/testnet-addresses.js');

async function deployYieldManager() {
    const networkName = process.env.NETWORK || 'kaia-testnet';
    const config = getNetworkConfig(networkName);

    console.log(`\n🚀 Deploying Yield Strategy Manager to ${networkName}...`);

    // Get the contract factory
    const KaiaYieldStrategyManager = await ethers.getContractFactory("KaiaYieldStrategyManager");

    // Deploy with configuration
    const yieldManager = await KaiaYieldStrategyManager.deploy(
        config.tokens.USDT,
        config.tokens.KAIA,
        config.tokens.USDC,
        config.protocols.router,
        config.protocols.lending
    );

    await yieldManager.deployed();

    console.log(`✅ Yield Strategy Manager deployed to: ${yieldManager.address}`);

    // Grant roles
    const [deployer] = await ethers.getSigners();
    console.log(`📝 Granting roles to deployer: ${deployer.address}`);

    // Grant CIRCLE_ROLE to factory (will be deployed next)
    // This will be done after factory deployment

    // Display deployment info
    console.log('\n📊 Deployment Information:');
    console.log(`Network: ${networkName}`);
    console.log(`Chain ID: ${config.chainId}`);
    console.log(`Deployer: ${deployer.address}`);
    console.log(`Yield Manager: ${yieldManager.address}`);

    // Verify configuration
    console.log('\n🔍 Verifying configuration...');
    const usdtAddress = await yieldManager.USDT();
    const kaiaAddress = await yieldManager.KAIA();
    const usdcAddress = await yieldManager.USDC();
    const routerAddress = await yieldManager.kaiaRouter();
    const lendingAddress = await yieldManager.kaiaLending();

    console.log(`USDT: ${usdtAddress}`);
    console.log(`KAIA: ${kaiaAddress}`);
    console.log(`USDC: ${usdcAddress}`);
    console.log(`Router: ${routerAddress}`);
    console.log(`Lending: ${lendingAddress}`);

    // Get available strategies
    const strategies = await yieldManager.getAvailableStrategies();
    console.log('\n📈 Available Strategies:');
    for (let i = 0; i < strategies.names.length; i++) {
        console.log(`${strategies.names[i]}: ${strategies.apys[i] / 100}% APY, Risk: ${strategies.riskScores[i]}, Min: $${strategies.minAmounts[i] / 1e6}`);
    }

    return {
        yieldManager,
        address: yieldManager.address,
        deployer: deployer.address
    };
}

if (require.main === module) {
    deployYieldManager().catch(console.error);
}

module.exports = { deployYieldManager };
