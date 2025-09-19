const { ethers } = require("hardhat");

async function main() {
  console.log("🧪 Testing RandomGenerator contract...");
  
  // Contract addresses
  const randomGeneratorAddress = "0xc9843a1aF776BEe8bDb55b94fD23bE2dbf457AbD";
  const simpleFactoryAddress = "0x7F37F6d0F333f64F4Dab8D8ded349f32D9e39ACa";
  
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Using account:", deployer.address);
  
  // Connect to RandomGenerator contract
  const RandomGenerator = await ethers.getContractFactory("RandomGenerator");
  const randomGenerator = RandomGenerator.attach(randomGeneratorAddress);
  
  // Check contract state
  console.log("\n📊 Contract State:");
  const vrfCoordinator = await randomGenerator.vrfCoordinator();
  const keyHash = await randomGenerator.keyHash();
  const subscriptionId = await randomGenerator.subscriptionId();
  const callbackGasLimit = await randomGenerator.callbackGasLimit();
  const requestConfirmations = await randomGenerator.requestConfirmations();
  
  console.log("VRF Coordinator:", vrfCoordinator);
  console.log("Key Hash:", keyHash);
  console.log("Subscription ID:", subscriptionId.toString());
  console.log("Callback Gas Limit:", callbackGasLimit.toString());
  console.log("Request Confirmations:", requestConfirmations.toString());
  
  // Check roles
  const OPERATOR_ROLE = await randomGenerator.OPERATOR_ROLE();
  const hasRole = await randomGenerator.hasRole(OPERATOR_ROLE, simpleFactoryAddress);
  console.log("SimpleYieldCircleFactory has OPERATOR_ROLE:", hasRole);
  
  // Test generateTestPositions function
  console.log("\n🧪 Testing generateTestPositions...");
  try {
    const tx = await randomGenerator.generateTestPositions(5);
    await tx.wait();
    console.log("✅ generateTestPositions successful!");
    
    // Get the result
    const positions = await randomGenerator.generateTestPositions(5);
    console.log("Generated positions:", positions.map(p => p.toString()));
  } catch (error) {
    console.log("❌ generateTestPositions failed:", error.message);
  }
  
  // Test requestRandomPositions (this should fail)
  console.log("\n🧪 Testing requestRandomPositions...");
  try {
    const tx = await randomGenerator.requestRandomPositions(5);
    await tx.wait();
    console.log("✅ requestRandomPositions successful!");
  } catch (error) {
    console.log("❌ requestRandomPositions failed:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
