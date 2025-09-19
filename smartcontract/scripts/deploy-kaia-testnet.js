require("dotenv").config();
const { ethers } = require("ethers");
const { getNetworkConfig } = require("../config/testnet-addresses");
const fs = require("fs");

async function main() {
    console.log("🚀 Deploying YieldCircle contracts to Kaia Kairos Testnet...");

    // Load Kaia testnet config
    const config = getNetworkConfig("kaia-testnet");

    // Connect to Kaia provider (ethers v5)
    const provider = new ethers.providers.JsonRpcProvider(
        process.env.KAIA_TESTNET_URL || config.rpcUrl
    );

    // Use your real private key
    const deployer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    console.log("👤 Deployer:", deployer.address);

    const balance = await provider.getBalance(deployer.address);
    console.log("💰 Balance:", ethers.utils.formatEther(balance), "KAIA");

    if (balance.lt(ethers.utils.parseEther("0.1"))) {
        console.error("⚠️ Not enough balance for deployment. Fund your wallet with testnet KAIA.");
        process.exit(1);
    }

    // ✅ Fixed overrides (EIP-1559 compatible)
    const overrides = {
        gasPrice: ethers.utils.parseUnits("25", "gwei"),
        gasLimit: 8_500_000
        // type: 0 // 👉 uncomment ONLY if RPC complains about "legacy tx required"
    };

    console.log("\n📦 Deploying Mock Tokens...");

    const MockERC20Artifact = require("../artifacts/contracts/mocks/MockERC20.sol/MockERC20.json");

    const MockUSDT = new ethers.ContractFactory(MockERC20Artifact.abi, MockERC20Artifact.bytecode, deployer);
    const mockUSDT = await MockUSDT.deploy("Mock USDT", "USDT", 6, overrides);
    await mockUSDT.deployTransaction.wait(1);
    console.log("✅ Mock USDT deployed:", mockUSDT.address);

    const mockUSDC = await MockUSDT.deploy("Mock USDC", "USDC", 6, overrides);
    await mockUSDC.deployTransaction.wait(1);
    console.log("✅ Mock USDC deployed:", mockUSDC.address);

    const mockKAIA = await MockUSDT.deploy("Mock KAIA", "KAIA", 18, overrides);
    await mockKAIA.deployTransaction.wait(1);
    console.log("✅ Mock KAIA deployed:", mockKAIA.address);

    console.log("\n📦 Deploying Random Generator...");

    const RandomGeneratorArtifact = require("../artifacts/contracts/libraries/RandomGenerator.sol/RandomGenerator.json");
    const RandomGenerator = new ethers.ContractFactory(RandomGeneratorArtifact.abi, RandomGeneratorArtifact.bytecode, deployer);
    const randomGenerator = await RandomGenerator.deploy(
        deployer.address, // dummy VRF coordinator
        ethers.constants.HashZero, // dummy keyHash
        1, // subscriptionId
        200000, // callbackGasLimit
        3, // requestConfirmations
        overrides
    );
    await randomGenerator.deployTransaction.wait(1);
    console.log("✅ RandomGenerator deployed:", randomGenerator.address);

    console.log("\n📦 Deploying KaiaYieldStrategyManager...");

    const KaiaYieldArtifact = require("../artifacts/contracts/KaiaYieldStrategyManager.sol/KaiaYieldStrategyManager.json");
    const KaiaYieldStrategyManager = new ethers.ContractFactory(KaiaYieldArtifact.abi, KaiaYieldArtifact.bytecode, deployer);
    const yieldManager = await KaiaYieldStrategyManager.deploy(
        mockUSDT.address,
        mockKAIA.address,
        overrides
    );
    await yieldManager.deployTransaction.wait(1);
    console.log("✅ KaiaYieldStrategyManager deployed:", yieldManager.address);

    console.log("\n📦 Deploying YieldCircleFactory...");

    const YieldCircleFactoryArtifact = require("../artifacts/contracts/YieldCircleFactory.sol/YieldCircleFactory.json");
    const YieldCircleFactory = new ethers.ContractFactory(YieldCircleFactoryArtifact.abi, YieldCircleFactoryArtifact.bytecode, deployer);
    const factory = await YieldCircleFactory.deploy(
        mockUSDT.address,
        yieldManager.address,
        randomGenerator.address,
        overrides
    );
    await factory.deployTransaction.wait(1);
    console.log("✅ YieldCircleFactory deployed:", factory.address);

    console.log("\n📦 Setting up roles...");
    await (await yieldManager.grantRole(await yieldManager.CIRCLE_ROLE(), factory.address, overrides)).wait();
    await (await yieldManager.grantRole(await yieldManager.STRATEGY_MANAGER_ROLE(), factory.address, overrides)).wait();
    await (await randomGenerator.grantRole(await randomGenerator.OPERATOR_ROLE(), factory.address, overrides)).wait();
    console.log("✅ Roles granted successfully");

    console.log("\n⚙️ Loading default templates via helper...");
    const FactoryTemplatesArtifact = require("../artifacts/contracts/FactoryTemplates.sol/FactoryTemplates.json");
    const FactoryTemplates = new ethers.ContractFactory(FactoryTemplatesArtifact.abi, FactoryTemplatesArtifact.bytecode, deployer);
    const templates = await FactoryTemplates.deploy(overrides);
    await templates.deployTransaction.wait(1);
    console.log("✅ FactoryTemplates deployed:", templates.address);
    await (await templates.loadDefaults(factory.address, overrides)).wait();
    console.log("✅ Templates loaded into factory");

    // Save deployment info
    const deploymentInfo = {
        network: "kaia-testnet",
        chainId: config.chainId,
        deployer: await deployer.getAddress(),
        contracts: {
            mockUSDT: mockUSDT.address,
            mockUSDC: mockUSDC.address,
            mockKAIA: mockKAIA.address,
            randomGenerator: randomGenerator.address,
            yieldManager: yieldManager.address,
            factory: factory.address,
            factoryTemplates: templates.address,
        },
        timestamp: new Date().toISOString(),
    };

    fs.writeFileSync("deployment-kaia-testnet.json", JSON.stringify(deploymentInfo, null, 2));
    console.log("\n💾 Deployment info saved to deployment-kaia-testnet.json");
    console.log("\n🎉 Deployment Complete!");
}

main().catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
});
