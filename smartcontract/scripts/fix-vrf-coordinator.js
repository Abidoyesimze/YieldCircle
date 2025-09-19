const { ethers } = require("hardhat");

async function main() {
  console.log("🔧 Fixing VRF Coordinator for RandomGenerator...");
  
  // Contract addresses
  const randomGeneratorAddress = "0xc9843a1aF776BEe8bDb55b94fD23bE2dbf457AbD";
  
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Using account:", deployer.address);
  
  // Deploy MockVRFCoordinator
  console.log("Deploying MockVRFCoordinator...");
  const MockVRFCoordinator = await ethers.getContractFactory("MockVRFCoordinator");
  const mockVRFCoordinator = await MockVRFCoordinator.deploy();
  await mockVRFCoordinator.deployed();
  console.log("✅ MockVRFCoordinator deployed:", mockVRFCoordinator.address);
  
  // Connect to RandomGenerator contract
  const RandomGenerator = await ethers.getContractFactory("RandomGenerator");
  const randomGenerator = RandomGenerator.attach(randomGeneratorAddress);
  
  // Check current VRF coordinator
  const currentCoordinator = await randomGenerator.vrfCoordinator();
  console.log("Current VRF Coordinator:", currentCoordinator);
  console.log("New MockVRFCoordinator:", mockVRFCoordinator.address);
  
  // Note: We can't change the VRF coordinator after deployment as it's immutable
  // The RandomGenerator contract needs to be redeployed with the correct VRF coordinator
  
  console.log("\n❌ Cannot update VRF coordinator - it's immutable in the contract");
  console.log("💡 Solution: RandomGenerator needs to be redeployed with MockVRFCoordinator");
  console.log("📝 MockVRFCoordinator address:", mockVRFCoordinator.address);
  
  // Test the MockVRFCoordinator
  console.log("\n🧪 Testing MockVRFCoordinator...");
  try {
    const tx = await mockVRFCoordinator.requestRandomWords(
      ethers.constants.HashZero, // keyHash
      1, // subscriptionId
      3, // requestConfirmations
      200000, // callbackGasLimit
      5 // numWords
    );
    await tx.wait();
    console.log("✅ MockVRFCoordinator test successful!");
  } catch (error) {
    console.log("❌ MockVRFCoordinator test failed:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
