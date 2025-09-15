/**
 * @title Deploy to Kaia Blockchain
 * @dev Deploys contracts to Kaia mainnet or testnet
 */

const { ethers } = require("hardhat");

async function deployToKaia() {
    console.log('\n🚀 Deploying to Kaia Blockchain...');

    const [deployer] = await ethers.getSigners();
    console.log(`Deployer: ${deployer.address}`);

    // Check deployer balance
    const balance = await deployer.getBalance();
    console.log(`Deployer balance: ${ethers.utils.formatEther(balance)} KAIA`);

    // Get network info
    const network = await ethers.provider.getNetwork();
    console.log(`Network: ${network.name} (Chain ID: ${network.chainId})`);

    if (balance.lt(ethers.utils.parseEther("0.1"))) {
        console.log('⚠️ Warning: You need at least 0.1 KAIA for deployment.');
        if (network.chainId === 1001) {
            console.log('Get testnet KAIA from: https://faucet.kairos.kaia.io/');
        }
        return;
    }

    try {
        // 1. Deploy Mock Tokens
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

        // Deploy KAIA (native token)
        const kaia = await MockERC20.deploy("Kaia", "KAIA", 18);
        await kaia.deployed();
        console.log(`✅ KAIA: ${kaia.address}`);

        // 2. Deploy Mock Protocols
        console.log('\n📦 Step 2: Deploying Mock Protocols...');

        const MockRouter = await ethers.getContractFactory("MockRouter");
        const router = await MockRouter.deploy();
        await router.deployed();
        console.log(`✅ Mock Router: ${router.address}`);

        const MockLending = await ethers.getContractFactory("MockLending");
        const lending = await MockLending.deploy();
        await lending.deployed();
        console.log(`✅ Mock Lending: ${lending.address}`);

        // 3. Deploy Random Generator
        console.log('\n📦 Step 3: Deploying Random Generator...');
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

        // 4. Deploy Yield Strategy Manager
        console.log('\n📦 Step 4: Deploying Yield Strategy Manager...');
        const KaiaYieldStrategyManager = await ethers.getContractFactory("KaiaYieldStrategyManager");
        const yieldManager = await KaiaYieldStrategyManager.deploy(
            usdt.address,
            kaia.address
        );
        await yieldManager.deployed();
        console.log(`✅ Yield Strategy Manager: ${yieldManager.address}`);

        // 5. Wait for confirmations
        console.log('\n⏳ Waiting for confirmations...');
        await usdt.deployTransaction.wait(2);
        await usdc.deployTransaction.wait(2);
        await kaia.deployTransaction.wait(2);
        await router.deployTransaction.wait(2);
        await lending.deployTransaction.wait(2);
        await randomGenerator.deployTransaction.wait(2);
        await yieldManager.deployTransaction.wait(2);

        // 6. Display deployment summary
        console.log('\n📊 Deployment Summary:');
        console.log(`Network: ${network.name} (Chain ID: ${network.chainId})`);
        console.log(`Deployer: ${deployer.address}`);

        const contracts = {
            usdt: usdt.address,
            usdc: usdc.address,
            kaia: kaia.address,
            router: router.address,
            lending: lending.address,
            randomGenerator: randomGenerator.address,
            yieldManager: yieldManager.address
        };

        console.log('\n📋 Contract Addresses:');
        Object.entries(contracts).forEach(([name, address]) => {
            console.log(`${name}: ${address}`);
        });

        // 7. Generate verification commands
        console.log('\n🔍 Manual Verification Commands:');
        console.log('Run these commands to verify your contracts:');
        console.log('\n# Verify USDT');
        console.log(`npx hardhat verify --network kaia-${network.chainId === 8217 ? 'mainnet' : 'testnet'} ${usdt.address} "Tether USD" "USDT" 6`);

        console.log('\n# Verify USDC');
        console.log(`npx hardhat verify --network kaia-${network.chainId === 8217 ? 'mainnet' : 'testnet'} ${usdc.address} "USD Coin" "USDC" 6`);

        console.log('\n# Verify KAIA');
        console.log(`npx hardhat verify --network kaia-${network.chainId === 8217 ? 'mainnet' : 'testnet'} ${kaia.address} "Kaia" "KAIA" 18`);

        console.log('\n# Verify Mock Router');
        console.log(`npx hardhat verify --network kaia-${network.chainId === 8217 ? 'mainnet' : 'testnet'} ${router.address}`);

        console.log('\n# Verify Mock Lending');
        console.log(`npx hardhat verify --network kaia-${network.chainId === 8217 ? 'mainnet' : 'testnet'} ${lending.address}`);

        console.log('\n# Verify Random Generator');
        console.log(`npx hardhat verify --network kaia-${network.chainId === 8217 ? 'mainnet' : 'testnet'} ${randomGenerator.address} "${deployer.address}" "0x0000000000000000000000000000000000000000000000000000000000000000" 1 200000 3`);

        console.log('\n# Verify Yield Strategy Manager');
        console.log(`npx hardhat verify --network kaia-${network.chainId === 8217 ? 'mainnet' : 'testnet'} ${yieldManager.address} "${usdt.address}" "${kaia.address}"`);

        // 8. Generate frontend configuration
        console.log('\n🔧 Frontend Configuration:');
        console.log('Copy this configuration to your frontend:');
        console.log(`
// Contract addresses for Kaia ${network.chainId === 8217 ? 'Mainnet' : 'Testnet'}
export const KAIA_CONFIG = {
    USDT: "${usdt.address}",
    USDC: "${usdc.address}",
    KAIA: "${kaia.address}",
    ROUTER: "${router.address}",
    LENDING: "${lending.address}",
    RANDOM_GENERATOR: "${randomGenerator.address}",
    YIELD_MANAGER: "${yieldManager.address}",
    NETWORK: "kaia-${network.chainId === 8217 ? 'mainnet' : 'testnet'}",
    CHAIN_ID: ${network.chainId},
    RPC_URL: "${network.chainId === 8217 ? 'https://public-en.node.kaia.io' : 'https://public-en-kairos.node.kaia.io'}",
    EXPLORER_URL: "${network.chainId === 8217 ? 'https://scope.kaia.io' : 'https://scope.kairos.kaia.io'}"
};
        `);

        // 9. Generate block explorer URLs
        const explorerUrl = network.chainId === 8217 ? 'https://scope.kaia.io' : 'https://scope.kairos.kaia.io';
        console.log('\n🔗 Block Explorer URLs:');
        console.log(`View your contracts on Kaia Scope: ${explorerUrl}`);
        Object.entries(contracts).forEach(([name, address]) => {
            console.log(`${name}: ${explorerUrl}/address/${address}`);
        });

        // 10. Test the deployment
        console.log('\n🧪 Testing Deployment...');
        try {
            // Test strategy selection
            const [strategyName, explanation] = await yieldManager.selectBestStrategy(
                deployer.address,
                ethers.utils.parseUnits("100", 6), // $100 USDT
                30 * 24 * 60 * 60, // 30 days
                5 // Moderate risk
            );
            console.log(`✅ Strategy selection working: ${strategyName}`);
            console.log(`   Explanation: ${explanation}`);

            // Test getting available strategies
            const strategies = await yieldManager.getAvailableStrategies();
            console.log(`✅ Available strategies: ${strategies.names.length} strategies loaded`);

        } catch (error) {
            console.log(`⚠️ Test failed: ${error.message}`);
        }

        console.log('\n🎉 Kaia deployment completed successfully!');
        console.log('\n📝 Next Steps:');
        console.log('1. Copy the verification commands above');
        console.log('2. Run them one by one to verify contracts');
        console.log('3. Copy the frontend configuration');
        console.log('4. Test the integration with your frontend');
        console.log('5. Replace mock contracts with real Kaia protocols when available');

        return {
            success: true,
            network: network.name,
            chainId: network.chainId,
            deployer: deployer.address,
            contracts,
            timestamp: new Date().toISOString()
        };

    } catch (error) {
        console.error('❌ Deployment failed:', error.message);
        throw error;
    }
}

if (require.main === module) {
    deployToKaia().catch(console.error);
}

module.exports = { deployToKaia };
