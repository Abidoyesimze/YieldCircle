/**
 * @title Deploy and Verify Contracts on Testnet
 * @dev Deploys contracts to testnet and verifies them automatically
 */

const { ethers, run } = require("hardhat");

async function deployAndVerify() {
    console.log('\n🚀 Deploying and Verifying Contracts on Testnet...');

    const [deployer] = await ethers.getSigners();
    console.log(`Deployer: ${deployer.address}`);

    // Check deployer balance
    const balance = await deployer.getBalance();
    console.log(`Deployer balance: ${ethers.utils.formatEther(balance)} ETH`);

    if (balance.lt(ethers.utils.parseEther("0.01"))) {
        console.log('⚠️ Warning: Low balance. You may need more ETH for deployment and verification.');
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
        await usdt.deployTransaction.wait(5);
        await usdc.deployTransaction.wait(5);
        await weth.deployTransaction.wait(5);
        await router.deployTransaction.wait(5);
        await lending.deployTransaction.wait(5);
        await randomGenerator.deployTransaction.wait(5);
        await yieldManager.deployTransaction.wait(5);

        // 6. Verify contracts
        console.log('\n🔍 Step 5: Verifying contracts...');

        // Verify USDT
        console.log('Verifying USDT...');
        try {
            await run("verify:verify", {
                address: usdt.address,
                constructorArguments: ["Tether USD", "USDT", 6],
            });
            console.log('✅ USDT verified');
        } catch (error) {
            console.log('⚠️ USDT verification failed:', error.message);
        }

        // Verify USDC
        console.log('Verifying USDC...');
        try {
            await run("verify:verify", {
                address: usdc.address,
                constructorArguments: ["USD Coin", "USDC", 6],
            });
            console.log('✅ USDC verified');
        } catch (error) {
            console.log('⚠️ USDC verification failed:', error.message);
        }

        // Verify WETH
        console.log('Verifying WETH...');
        try {
            await run("verify:verify", {
                address: weth.address,
                constructorArguments: ["Wrapped Ether", "WETH", 18],
            });
            console.log('✅ WETH verified');
        } catch (error) {
            console.log('⚠️ WETH verification failed:', error.message);
        }

        // Verify Router
        console.log('Verifying Mock Router...');
        try {
            await run("verify:verify", {
                address: router.address,
                constructorArguments: [],
            });
            console.log('✅ Mock Router verified');
        } catch (error) {
            console.log('⚠️ Mock Router verification failed:', error.message);
        }

        // Verify Lending
        console.log('Verifying Mock Lending...');
        try {
            await run("verify:verify", {
                address: lending.address,
                constructorArguments: [],
            });
            console.log('✅ Mock Lending verified');
        } catch (error) {
            console.log('⚠️ Mock Lending verification failed:', error.message);
        }

        // Verify Random Generator
        console.log('Verifying Random Generator...');
        try {
            await run("verify:verify", {
                address: randomGenerator.address,
                constructorArguments: [
                    deployer.address,
                    "0x0000000000000000000000000000000000000000000000000000000000000000",
                    1,
                    200000,
                    3
                ],
            });
            console.log('✅ Random Generator verified');
        } catch (error) {
            console.log('⚠️ Random Generator verification failed:', error.message);
        }

        // Verify Yield Strategy Manager
        console.log('Verifying Yield Strategy Manager...');
        try {
            await run("verify:verify", {
                address: yieldManager.address,
                constructorArguments: [usdt.address, weth.address],
            });
            console.log('✅ Yield Strategy Manager verified');
        } catch (error) {
            console.log('⚠️ Yield Strategy Manager verification failed:', error.message);
        }

        // 7. Display deployment summary
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

        // 8. Generate frontend configuration
        console.log('\n🔧 Frontend Configuration:');
        console.log('Copy this configuration to your frontend:');
        console.log(`
// Contract addresses for ${network.name}
export const CONTRACT_ADDRESSES = {
    USDT: "${usdt.address}",
    USDC: "${usdc.address}",
    WETH: "${weth.address}",
    ROUTER: "${router.address}",
    LENDING: "${lending.address}",
    RANDOM_GENERATOR: "${randomGenerator.address}",
    YIELD_MANAGER: "${yieldManager.address}",
    NETWORK: "${network.name}",
    CHAIN_ID: ${network.chainId}
};
        `);

        // 9. Generate block explorer URLs
        const explorerUrl = getExplorerUrl(network.chainId);
        if (explorerUrl) {
            console.log('\n🔗 Block Explorer URLs:');
            Object.entries(contracts).forEach(([name, address]) => {
                console.log(`${name}: ${explorerUrl}/address/${address}`);
            });
        }

        console.log('\n🎉 Deployment and verification completed!');
        console.log('\n📝 Next Steps:');
        console.log('1. Copy the contract addresses to your frontend');
        console.log('2. Update your frontend configuration');
        console.log('3. Test the integration');
        console.log('4. Deploy to mainnet when ready');

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

function getExplorerUrl(chainId) {
    const explorers = {
        1: 'https://etherscan.io',
        11155111: 'https://sepolia.etherscan.io',
        5: 'https://goerli.etherscan.io',
        137: 'https://polygonscan.com',
        80001: 'https://mumbai.polygonscan.com'
    };

    return explorers[chainId] || null;
}

if (require.main === module) {
    deployAndVerify().catch(console.error);
}

module.exports = { deployAndVerify };
