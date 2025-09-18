const { ethers } = require("hardhat");

async function deployFactoryKaia() {
    console.log("🚀 Deploying YieldCircleFactory to Kaia Testnet...\n");
    
    const [deployer] = await ethers.getSigners();
    console.log(`Deployer: ${deployer.address}`);
    console.log(`Balance: ${ethers.utils.formatEther(await deployer.getBalance())} KAIA\n`);
    
    try {
        // Use the existing deployed contract addresses from your frontend config
        const USDT_ADDRESS = "0x89fde6067B334226f1BdA9f077eFB6d48f0e1443";
        const YIELD_MANAGER_ADDRESS = "0xf81F832BaBc8753477B56DD4f73334c69b7Ed442";
        const RANDOM_GENERATOR_ADDRESS = "0x654448cee799e8bdeF8e217cFeD1f3a09e17167B";
        
        console.log("📋 Using existing contract addresses:");
        console.log(`USDT: ${USDT_ADDRESS}`);
        console.log(`Yield Manager: ${YIELD_MANAGER_ADDRESS}`);
        console.log(`Random Generator: ${RANDOM_GENERATOR_ADDRESS}\n`);
        
        // Verify contracts exist
        console.log("🔍 Verifying existing contracts...");
        const provider = ethers.provider;
        
        const usdtCode = await provider.getCode(USDT_ADDRESS);
        const yieldManagerCode = await provider.getCode(YIELD_MANAGER_ADDRESS);
        const randomGeneratorCode = await provider.getCode(RANDOM_GENERATOR_ADDRESS);
        
        console.log(`USDT contract exists: ${usdtCode !== '0x' ? '✅' : '❌'}`);
        console.log(`Yield Manager contract exists: ${yieldManagerCode !== '0x' ? '✅' : '❌'}`);
        console.log(`Random Generator contract exists: ${randomGeneratorCode !== '0x' ? '✅' : '❌'}\n`);
        
        if (usdtCode === '0x' || yieldManagerCode === '0x' || randomGeneratorCode === '0x') {
            throw new Error("One or more dependency contracts don't exist at the specified addresses!");
        }
        
        // Deploy YieldCircleFactory
        console.log("📦 Deploying YieldCircleFactory...");
        const YieldCircleFactory = await ethers.getContractFactory("YieldCircleFactory");
        const factory = await YieldCircleFactory.deploy(
            USDT_ADDRESS,           // USDT
            YIELD_MANAGER_ADDRESS,   // Yield Manager
            RANDOM_GENERATOR_ADDRESS // Random Generator
        );
        await factory.deployed();
        console.log(`✅ YieldCircleFactory deployed to: ${factory.address}\n`);
        
        // Set up roles and permissions
        console.log("🔐 Setting up roles and permissions...");
        
        // Grant OPERATOR_ROLE to factory for random position initialization
        const randomGenerator = await ethers.getContractAt("RandomGenerator", RANDOM_GENERATOR_ADDRESS);
        await randomGenerator.grantRole(await randomGenerator.OPERATOR_ROLE(), factory.address);
        console.log("✅ Granted OPERATOR_ROLE to factory");
        
        // Grant CIRCLE_ROLE to factory for yield manager access
        const yieldManager = await ethers.getContractAt("KaiaYieldStrategyManager", YIELD_MANAGER_ADDRESS);
        await yieldManager.grantRole(await yieldManager.CIRCLE_ROLE(), factory.address);
        console.log("✅ Granted CIRCLE_ROLE to factory");
        
        // Verify factory is working
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
        
        console.log("\n🎉 Deployment Complete!");
        console.log("=" * 50);
        console.log("📋 New Factory Address:");
        console.log(`YieldCircleFactory: ${factory.address}`);
        console.log("=" * 50);
        
        console.log("\n📝 Update your frontend configuration:");
        console.log("Update frontend/src/abi/index.tsx:");
        console.log(`
export const YieldCircleFactoryContract = {
    abi: YieldCircleFactory,
    address: '${factory.address}',
}
        `);
        
        console.log("\n✅ Factory is ready to create circles!");
        console.log("🌐 View on explorer: https://kairos.kaiascan.io/address/" + factory.address);
        
    } catch (error) {
        console.error("❌ Deployment failed:", error);
        throw error;
    }
}

deployFactoryKaia()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
