const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("🚀 Deploying YieldCircleFactory to Kaia Kairos Testnet...");
  console.log("👤 Deployer:", deployer.address);
  console.log("💰 Balance:", ethers.utils.formatEther(await deployer.getBalance()), "KAIA");

  // Existing deployed addresses
  const USDT_ADDRESS = "0xbcE20F3B33837527f5eC0d3A686b22D520F32E42";
  const YIELD_MANAGER = "0x45CD51a25EE87E7C56D479BB8C99aF5aBA20e5e0";
  const RANDOM_GENERATOR = "0x557843850b216290743176c8F852c980b803B35f";

  console.log("📋 Using deployed contracts:");
  console.log("   USDT:", USDT_ADDRESS);
  console.log("   Yield Manager:", YIELD_MANAGER);
  console.log("   Random Generator:", RANDOM_GENERATOR);

  // Deploy Factory
  const Factory = await ethers.getContractFactory("YieldCircleFactory");

  const deployOptions = {
    gasPrice: ethers.utils.parseUnits("25", "gwei"),
    gasLimit: ethers.BigNumber.from("8000000"),
    type: 0, // Legacy TX
  };

  console.log("📦 Deploying factory...");
  const factory = await Factory.deploy(
    USDT_ADDRESS,
    YIELD_MANAGER,
    RANDOM_GENERATOR,
    deployOptions
  );

  console.log("⏳ Waiting for deployment...");
  await factory.deployed();
  console.log("✅ YieldCircleFactory deployed at:", factory.address);

  // --- Grant Roles ---
  const yieldManager = await ethers.getContractAt("KaiaYieldStrategyManager", YIELD_MANAGER);

  console.log("🔑 Granting roles...");

  // Give factory permission in YieldManager
  const CIRCLE_ROLE = await yieldManager.CIRCLE_ROLE();
  await (await yieldManager.grantRole(CIRCLE_ROLE, factory.address)).wait();
  console.log("✅ Factory granted CIRCLE_ROLE in YieldManager");

  // Give deployer operator rights in factory
  const OPERATOR_ROLE = await factory.OPERATOR_ROLE();
  await (await factory.grantRole(OPERATOR_ROLE, deployer.address)).wait();
  console.log("✅ Deployer granted OPERATOR_ROLE in Factory");

  // --- Test Deployment ---
  console.log("🧪 Testing factory status...");
  const circleCount = await factory.getCircleCount();
  const canCreate = await factory.canCreateCircle(deployer.address);

  console.log("📊 Factory Status:");
  console.log("   Circle Count:", circleCount.toString());
  console.log("   Can Create:", canCreate);

  // Save deployment info
  const deploymentInfo = {
    network: "kaia-kairos-testnet",
    chainId: 1001,
    deployer: deployer.address,
    factory: factory.address,
    deployedAt: new Date().toISOString(),
    contracts: {
      usdt: USDT_ADDRESS,
      yieldManager: YIELD_MANAGER,
      randomGenerator: RANDOM_GENERATOR,
      factory: factory.address,
    },
  };

  fs.writeFileSync("factory-deployment.json", JSON.stringify(deploymentInfo, null, 2));

  console.log("\n🎉 Deployment Complete!");
  console.log("📝 Details saved to: factory-deployment.json");
  console.log("🔗 Explorer:", `https://kairos.kaiascan.io/address/${factory.address}`);
}

main().catch((error) => {
  console.error("\n❌ Deployment failed:");
  console.error(error);
  process.exit(1);
});
