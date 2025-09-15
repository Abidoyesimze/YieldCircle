/**
 * @title Simple Sepolia Deployment (No Verification)
 * @dev Deploys contracts to Sepolia without automatic verification
 */

const { ethers } = require("hardhat");

async function deployToSepolia() {
    console.log('\n🚀 Deploying to Sepolia Testnet...');

    const [deployer] = await ethers.getSigners();
    console.log(`Deployer: ${deployer.address}`);

    // Check deployer balance
    const balance = await deployer.getBalance();
    console.log(`Deployer balance: ${ethers.utils.formatEther(balance)} ETH`);

    if (balance.lt(ethers.utils.parseEther("0.01"))) {
        console.log('⚠️ Warning: You need at least 0.01 ETH on Sepolia for deployment.');
        console.log('Get testnet ETH from: https://sepoliafaucet.com/');
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

        // Deploy WETH (as KAIA)
        const weth = await MockERC20.deploy("Wrapped Ether", "WETH", 18);
        await weth.deployed();
        console.log(`✅ WETH: ${weth.address}`);

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
            weth.address
        );
        await yieldManager.deployed();
        console.log(`✅ Yield Strategy Manager: ${yieldManager.address}`);

        // 5. Wait for confirmations
        console.log('\n⏳ Waiting for confirmations...');
        await usdt.deployTransaction.wait(2);
        await usdc.deployTransaction.wait(2);
        await weth.deployTransaction.wait(2);
        await router.deployTransaction.wait(2);
        await lending.deployTransaction.wait(2);
        await randomGenerator.deployTransaction.wait(2);
        await yieldManager.deployTransaction.wait(2);

        // 6. Display deployment summary
        console.log('\n📊 Deployment Summary:');
        const network = await ethers.provider.getNetwork();
        console.log(`Network: ${network.name} (Chain ID: ${network.chainId})`);
        console.log(`Deployer: ${deployer.address}`);

        const contracts = {
            usdt: usdt.address,
            usdc: usdc.address,
            weth: weth.address,
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
        console.log(`npx hardhat verify --network sepolia ${usdt.address} "Tether USD" "USDT" 6`);

        console.log('\n# Verify USDC');
        console.log(`npx hardhat verify --network sepolia ${usdc.address} "USD Coin" "USDC" 6`);

        console.log('\n# Verify WETH');
        console.log(`npx hardhat verify --network sepolia ${weth.address} "Wrapped Ether" "WETH" 18`);

        console.log('\n# Verify Mock Router');
        console.log(`npx hardhat verify --network sepolia ${router.address}`);

        console.log('\n# Verify Mock Lending');
        console.log(`npx hardhat verify --network sepolia ${lending.address}`);

        console.log('\n# Verify Random Generator');
        console.log(`npx hardhat verify --network sepolia ${randomGenerator.address} "${deployer.address}" "0x0000000000000000000000000000000000000000000000000000000000000000" 1 200000 3`);

        console.log('\n# Verify Yield Strategy Manager');
        console.log(`npx hardhat verify --network sepolia ${yieldManager.address} "${usdt.address}" "${weth.address}"`);

        // 8. Generate frontend configuration
        console.log('\n🔧 Frontend Configuration:');
        console.log('Copy this configuration to your frontend:');
        console.log(`
// Contract addresses for Sepolia
export const SEPOLIA_CONFIG = {
    USDT: "${usdt.address}",
    USDC: "${usdc.address}",
    WETH: "${weth.address}",
    ROUTER: "${router.address}",
    LENDING: "${lending.address}",
    RANDOM_GENERATOR: "${randomGenerator.address}",
    YIELD_MANAGER: "${yieldManager.address}",
    NETWORK: "sepolia",
    CHAIN_ID: 11155111,
    RPC_URL: "https://rpc.sepolia.org",
    EXPLORER_URL: "https://sepolia.etherscan.io"
};
        `);

        // 9. Generate block explorer URLs
        console.log('\n🔗 Block Explorer URLs:');
        console.log('View your contracts on Sepolia Etherscan:');
        Object.entries(contracts).forEach(([name, address]) => {
            console.log(`${name}: https://sepolia.etherscan.io/address/${address}`);
        });

        console.log('\n🎉 Deployment completed successfully!');
        console.log('\n📝 Next Steps:');
        console.log('1. Copy the verification commands above');
        console.log('2. Run them one by one to verify contracts');
        console.log('3. Copy the frontend configuration');
        console.log('4. Test the integration');

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
    deployToSepolia().catch(console.error);
}

module.exports = { deployToSepolia };
