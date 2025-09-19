const { ethers } = require("hardhat");

async function deployFactorySimple() {
    console.log("🚀 Deploying YieldCircleFactory...\n");
    
    try {
        // Get signers
        const signers = await ethers.getSigners();
        console.log(`Found ${signers.length} signers`);
        
        if (signers.length === 0) {
            console.log("❌ No signers found. Please check your network configuration.");
            console.log("Make sure you have:");
            console.log("1. A valid PRIVATE_KEY in .env file");
            console.log("2. The correct RPC URL for your network");
            console.log("3. Sufficient balance for gas fees");
            return;
        }
        
        const deployer = signers[0];
        console.log(`Deployer: ${deployer.address}`);
        
        // Get network info
        const network = await ethers.provider.getNetwork();
        console.log(`Network: ${network.name} (Chain ID: ${network.chainId})`);
        
        // Get balance
        const balance = await deployer.getBalance();
        console.log(`Balance: ${ethers.utils.formatEther(balance)} ETH/KAIA`);
        
        if (balance.lt(ethers.utils.parseEther("0.001"))) {
            console.log("⚠️ Warning: Very low balance. You may need more tokens for gas fees.");
        }
        
        console.log("\n📋 Using contract addresses:");
        const USDT_ADDRESS = "0x89fde6067B334226f1BdA9f077eFB6d48f0e1443";
        const YIELD_MANAGER_ADDRESS = "0xf81F832BaBc8753477B56DD4f73334c69b7Ed442";
        const RANDOM_GENERATOR_ADDRESS = "0x654448cee799e8bdeF8e217cFeD1f3a09e17167B";
        
        console.log(`USDT: ${USDT_ADDRESS}`);
        console.log(`Yield Manager: ${YIELD_MANAGER_ADDRESS}`);
        console.log(`Random Generator: ${RANDOM_GENERATOR_ADDRESS}`);
        
        // Verify contracts exist
        console.log("\n🔍 Verifying contracts...");
        const usdtCode = await ethers.provider.getCode(USDT_ADDRESS);
        const yieldManagerCode = await ethers.provider.getCode(YIELD_MANAGER_ADDRESS);
        const randomGeneratorCode = await ethers.provider.getCode(RANDOM_GENERATOR_ADDRESS);
        
        console.log(`USDT exists: ${usdtCode !== '0x' ? '✅' : '❌'}`);
        console.log(`Yield Manager exists: ${yieldManagerCode !== '0x' ? '✅' : '❌'}`);
        console.log(`Random Generator exists: ${randomGeneratorCode !== '0x' ? '✅' : '❌'}`);
        
        if (usdtCode === '0x' || yieldManagerCode === '0x' || randomGeneratorCode === '0x') {
            console.log("\n❌ One or more dependency contracts don't exist!");
            console.log("Please deploy the missing contracts first or update the addresses.");
            return;
        }
        
        // Deploy YieldCircleFactory
        console.log("\n📦 Deploying YieldCircleFactory...");
        const YieldCircleFactory = await ethers.getContractFactory("YieldCircleFactory");
        
        console.log("Sending deployment transaction...");
        const factory = await YieldCircleFactory.deploy(
            USDT_ADDRESS,
            YIELD_MANAGER_ADDRESS,
            RANDOM_GENERATOR_ADDRESS
        );
        
        console.log("Waiting for deployment confirmation...");
        await factory.deployed();
        console.log(`✅ YieldCircleFactory deployed to: ${factory.address}`);
        
        // Set up roles
        console.log("\n🔐 Setting up roles...");
        
        try {
            const randomGenerator = await ethers.getContractAt("RandomGenerator", RANDOM_GENERATOR_ADDRESS);
            await randomGenerator.grantRole(await randomGenerator.OPERATOR_ROLE(), factory.address);
            console.log("✅ Granted OPERATOR_ROLE to factory");
        } catch (error) {
            console.log(`❌ Error granting OPERATOR_ROLE: ${error.message}`);
        }
        
        try {
            const yieldManager = await ethers.getContractAt("KaiaYieldStrategyManager", YIELD_MANAGER_ADDRESS);
            await yieldManager.grantRole(await yieldManager.CIRCLE_ROLE(), factory.address);
            console.log("✅ Granted CIRCLE_ROLE to factory");
        } catch (error) {
            console.log(`❌ Error granting CIRCLE_ROLE: ${error.message}`);
        }
        
        // Verify factory
        console.log("\n🔍 Verifying factory...");
        const isPaused = await factory.paused();
        console.log(`Factory paused: ${isPaused ? '❌ YES' : '✅ NO'}`);
        
        const template = await factory.templates("family");
        console.log(`Family template active: ${template.isActive ? '✅ YES' : '❌ NO'}`);
        
        console.log("\n🎉 Deployment Complete!");
        console.log("=" * 50);
        console.log(`YieldCircleFactory: ${factory.address}`);
        console.log("=" * 50);
        
        console.log("\n📝 Update your frontend configuration:");
        console.log("In frontend/src/abi/index.tsx, update:");
        console.log(`export const YieldCircleFactoryContract = {
    abi: YieldCircleFactory,
    address: '${factory.address}',
}`);
        
    } catch (error) {
        console.error("❌ Deployment failed:", error.message);
        if (error.message.includes("insufficient funds")) {
            console.log("\n💡 You need more tokens for gas fees. Get testnet tokens from:");
            console.log("   Kaia Testnet Faucet: https://kairos.kaiascan.io/faucet");
        }
    }
}

deployFactorySimple()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

