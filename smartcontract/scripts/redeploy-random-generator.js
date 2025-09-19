const { ethers } = require("hardhat");

async function main() {
  console.log("🔧 Redeploying RandomGenerator with MockVRFCoordinator...");
  
  // Contract addresses
  const randomGeneratorAddress = "0xc9843a1aF776BEe8bDb55b94fD23bE2dbf457AbD";
  const simpleFactoryAddress = "0x7F37F6d0F333f64F4Dab8D8ded349f32D9e39ACa";
  
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Using account:", deployer.address);
  
  // Deploy MockVRFCoordinator
  console.log("\n📦 Deploying MockVRFCoordinator...");
  const MockVRFCoordinator = await ethers.getContractFactory("MockVRFCoordinator");
  const mockVRFCoordinator = await MockVRFCoordinator.deploy();
  await mockVRFCoordinator.deployed();
  console.log("✅ MockVRFCoordinator deployed:", mockVRFCoordinator.address);
  
  // Deploy new RandomGenerator with MockVRFCoordinator
  console.log("\n📦 Deploying new RandomGenerator...");
  const RandomGenerator = await ethers.getContractFactory("RandomGenerator");
  const newRandomGenerator = await RandomGenerator.deploy(
    mockVRFCoordinator.address, // MockVRFCoordinator
    ethers.constants.HashZero, // dummy keyHash
    1, // subscriptionId
    200000, // callbackGasLimit
    3 // requestConfirmations
  );
  await newRandomGenerator.deployed();
  console.log("✅ New RandomGenerator deployed:", newRandomGenerator.address);
  
  // Grant OPERATOR_ROLE to SimpleYieldCircleFactory
  console.log("\n🔐 Setting up roles...");
  const OPERATOR_ROLE = await newRandomGenerator.OPERATOR_ROLE();
  const tx = await newRandomGenerator.grantRole(OPERATOR_ROLE, simpleFactoryAddress);
  await tx.wait();
  console.log("✅ Granted OPERATOR_ROLE to SimpleYieldCircleFactory");
  
  // Test the new RandomGenerator
  console.log("\n🧪 Testing new RandomGenerator...");
  try {
    const tx = await newRandomGenerator.requestRandomPositions(5);
    await tx.wait();
    console.log("✅ RandomGenerator test successful!");
    
    // Check if request was fulfilled
    const requestId = 1; // MockVRFCoordinator starts with requestId = 1
    const request = await newRandomGenerator.requests(requestId);
    console.log("Request fulfilled:", request.fulfilled);
    console.log("Random words count:", request.randomWords.length);
  } catch (error) {
    console.log("❌ RandomGenerator test failed:", error.message);
  }
  
  console.log("\n📋 Summary:");
  console.log("Old RandomGenerator:", randomGeneratorAddress);
  console.log("New RandomGenerator:", newRandomGenerator.address);
  console.log("MockVRFCoordinator:", mockVRFCoordinator.address);
  console.log("\n⚠️  You need to update the SimpleYieldCircleFactory to use the new RandomGenerator address!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
