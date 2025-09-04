const { ethers } = require("hardhat");
const { getNetworkConfig, validateAddresses } = require("../config/testnet-addresses");

async function main() {
  console.log("🚀 Deploying YieldCircle contracts...");

  // Get deployer account
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying contracts with account:", deployer.address);
  console.log("💰 Account balance:", (await deployer.getBalance()).toString());

  // Network configuration
  const network = await ethers.provider.getNetwork();
  console.log("🌐 Network ID:", network.chainId);

  // Get network configuration
  let networkName = 'sepolia'; // Default to Sepolia
  if (network.chainId === 1337) {
    networkName = 'kaia-testnet';
  } else if (network.chainId === 80001) {
    networkName = 'mumbai';
  }
  
  const config = getNetworkConfig(networkName);
  console.log(`📋 Using configuration for: ${networkName}`);

  // Validate addresses before deployment
  validateAddresses(config);

  // Extract addresses from config
  const {
    tokens: { USDT, KAIA, USDC },
    protocols: { router: KAIA_ROUTER, lending: KAIA_LENDING, factory: KAIA_FACTORY },
    vrf: { coordinator: VRF_COORDINATOR, keyHash: VRF_KEY_HASH, subscriptionId: VRF_SUBSCRIPTION_ID, callbackGasLimit: VRF_CALLBACK_GAS_LIMIT, requestConfirmations: VRF_REQUEST_CONFIRMATIONS }
  } = config;

  console.log("📋 Configuration:");
  console.log("  USDT:", USDT);
  console.log("  KAIA:", KAIA);
  console.log("  USDC:", USDC);
  console.log("  Kaia Router:", KAIA_ROUTER);
  console.log("  Kaia Lending:", KAIA_LENDING);
  console.log("  Kaia Factory:", KAIA_FACTORY);
  console.log("  VRF Coordinator:", VRF_COORDINATOR);
  console.log("  VRF Key Hash:", VRF_KEY_HASH);
  console.log("  VRF Subscription ID:", VRF_SUBSCRIPTION_ID);

  // Validate critical addresses
  if (USDT === "0x0000000000000000000000000000000000000000" || 
      USDT === "0x1234567890123456789012345678901234567890") {
    throw new Error("USDT_ADDRESS not properly configured");
  }

  if (VRF_COORDINATOR === "0x0000000000000000000000000000000000000000" ||
      VRF_COORDINATOR === "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa") {
    throw new Error("VRF_COORDINATOR not properly configured");
  }

  // Deploy RandomGenerator first
  console.log("\n🎲 Deploying RandomGenerator...");
  const RandomGenerator = await ethers.getContractFactory("RandomGenerator");
  const randomGenerator = await RandomGenerator.deploy(
    VRF_COORDINATOR,
    VRF_KEY_HASH,
    VRF_SUBSCRIPTION_ID,
    VRF_CALLBACK_GAS_LIMIT,
    VRF_REQUEST_CONFIRMATIONS
  );
  await randomGenerator.deployed();
  console.log("✅ RandomGenerator deployed to:", randomGenerator.address);

  // Deploy KaiaYieldStrategyManager
  console.log("\n🏦 Deploying KaiaYieldStrategyManager...");
  const KaiaYieldStrategyManager = await ethers.getContractFactory("KaiaYieldStrategyManager");
  const yieldManager = await KaiaYieldStrategyManager.deploy(
    USDT,
    KAIA,
    USDC,
    KAIA_ROUTER,
    KAIA_LENDING
  );
  await yieldManager.deployed();
  console.log("✅ KaiaYieldStrategyManager deployed to:", yieldManager.address);

  // Deploy YieldCircleFactory
  console.log("\n🏭 Deploying YieldCircleFactory...");
  const YieldCircleFactory = await ethers.getContractFactory("YieldCircleFactory");
  const factory = await YieldCircleFactory.deploy(
    USDT,
    yieldManager.address,
    randomGenerator.address
  );
  await factory.deployed();
  console.log("✅ YieldCircleFactory deployed to:", factory.address);

  // Grant necessary roles
  console.log("\n🔐 Setting up roles...");
  
  // Grant OPERATOR_ROLE to factory for random position initialization
  await randomGenerator.grantRole(await randomGenerator.OPERATOR_ROLE(), factory.address);
  console.log("✅ Granted OPERATOR_ROLE to factory");

  // Grant CIRCLE_ROLE to factory for yield manager access
  await yieldManager.grantRole(await yieldManager.CIRCLE_ROLE(), factory.address);
  console.log("✅ Granted CIRCLE_ROLE to factory");

  // Set LP token addresses if available
  console.log("\n🔗 Setting up LP token addresses...");
  try {
    if (KAIA_FACTORY !== "0x0000000000000000000000000000000000000000") {
      // Get LP token addresses from factory
      const factoryContract = new ethers.Contract(KAIA_FACTORY, [
        "function getPair(address tokenA, address tokenB) external view returns (address pair)"
      ], ethers.provider);
      
      // Get USDT/USDC LP
      const usdtUsdcLP = await factoryContract.getPair(USDT, USDC);
      if (usdtUsdcLP !== "0x0000000000000000000000000000000000000000") {
        await yieldManager.setLPTokenAddress("stable_lp", usdtUsdcLP);
        console.log("✅ Set USDT/USDC LP address:", usdtUsdcLP);
      }
      
      // Get USDT/KAIA LP
      const usdtKaiaLP = await factoryContract.getPair(USDT, KAIA);
      if (usdtKaiaLP !== "0x0000000000000000000000000000000000000000") {
        await yieldManager.setLPTokenAddress("native_lp", usdtKaiaLP);
        console.log("✅ Set USDT/KAIA LP address:", usdtKaiaLP);
      }
    }
  } catch (error) {
    console.log("⚠️ Could not set LP token addresses:", error.message);
  }

  // Update strategy APY rates based on config
  console.log("\n📊 Updating strategy APY rates...");
  try {
    const strategies = config.strategies;
    for (const [key, strategy] of Object.entries(strategies)) {
      if (key !== 'treasury') { // Treasury has 0% APY
        await yieldManager.updateStrategyAPY(key, strategy.apy);
        console.log(`✅ Updated ${key} APY to ${strategy.apy / 100}%`);
      }
    }
  } catch (error) {
    console.log("⚠️ Could not update APY rates:", error.message);
  }

  // Verify deployments
  console.log("\n🔍 Verifying deployments...");
  
  // Verify RandomGenerator
  try {
    await hre.run("verify:verify", {
      address: randomGenerator.address,
      constructorArguments: [
        VRF_COORDINATOR,
        VRF_KEY_HASH,
        VRF_SUBSCRIPTION_ID,
        VRF_CALLBACK_GAS_LIMIT,
        VRF_REQUEST_CONFIRMATIONS
      ],
    });
    console.log("✅ RandomGenerator verified on Etherscan");
  } catch (error) {
    console.log("⚠️ RandomGenerator verification failed:", error.message);
  }

  // Verify KaiaYieldStrategyManager
  try {
    await hre.run("verify:verify", {
      address: yieldManager.address,
      constructorArguments: [
        USDT,
        KAIA,
        USDC,
        KAIA_ROUTER,
        KAIA_LENDING
      ],
    });
    console.log("✅ KaiaYieldStrategyManager verified on Etherscan");
  } catch (error) {
    console.log("⚠️ KaiaYieldStrategyManager verification failed:", error.message);
  }

  // Verify YieldCircleFactory
  try {
    await hre.run("verify:verify", {
      address: factory.address,
      constructorArguments: [
        USDT,
        yieldManager.address,
        randomGenerator.address
      ],
    });
    console.log("✅ YieldCircleFactory verified on Etherscan");
  } catch (error) {
    console.log("⚠️ YieldCircleFactory verification failed:", error.message);
  }

  // Test VRF integration
  console.log("\n🎲 Testing VRF integration...");
  try {
    const requestId = await randomGenerator.requestRandomPositions(3);
    console.log("✅ VRF request submitted, ID:", requestId.toString());
    console.log("ℹ️ Random positions will be available after VRF callback");
  } catch (error) {
    console.log("⚠️ VRF test failed:", error.message);
    console.log("ℹ️ Make sure VRF subscription is funded and active");
  }

  // Deployment summary
  console.log("\n🎉 Deployment completed successfully!");
  console.log("📊 Deployment Summary:");
  console.log("  Network:", networkName);
  console.log("  RandomGenerator:", randomGenerator.address);
  console.log("  KaiaYieldStrategyManager:", yieldManager.address);
  console.log("  YieldCircleFactory:", factory.address);
  console.log("\n🔗 Next steps:");
  console.log("  1. Fund VRF subscription for random number generation");
  console.log("  2. Test circle creation and operations");
  console.log("  3. Monitor for any issues");
  console.log("  4. Set up monitoring and alerting");

  // Save deployment info
  const deploymentInfo = {
    network: networkName,
    chainId: network.chainId,
    deployer: deployer.address,
    contracts: {
      RandomGenerator: randomGenerator.address,
      KaiaYieldStrategyManager: yieldManager.address,
      YieldCircleFactory: factory.address
    },
    configuration: {
      USDT: USDT,
      KAIA: KAIA,
      USDC: USDC,
      KaiaRouter: KAIA_ROUTER,
      KaiaLending: KAIA_LENDING,
      KaiaFactory: KAIA_FACTORY,
      VRFCoordinator: VRF_COORDINATOR,
      VRFKeyHash: VRF_KEY_HASH,
      VRFSubscriptionId: VRF_SUBSCRIPTION_ID
    },
    timestamp: new Date().toISOString()
  };

  const fs = require('fs');
  fs.writeFileSync(
    `deployment-${networkName}-${network.chainId}-${Date.now()}.json`,
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log("📄 Deployment info saved to file");

  // Print important reminders
  console.log("\n⚠️ IMPORTANT REMINDERS:");
  console.log("  1. Fund your VRF subscription on Chainlink VRF dashboard");
  console.log("  2. Test with small amounts first");
  console.log("  3. Monitor contract events for any issues");
  console.log("  4. Keep private keys secure");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
