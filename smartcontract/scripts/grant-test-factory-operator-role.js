const { ethers } = require("hardhat");

async function main() {
  console.log("🔧 Granting OPERATOR_ROLE to SimpleYieldCircleFactoryTest...");
  
  // Contract addresses
  const testFactoryAddress = "0x0F939ed454028c4edC7bA14cdB09d5E660Bd0fd8";
  const randomGeneratorAddress = "0xc9843a1aF776BEe8bDb55b94fD23bE2dbf457AbD";
  
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Using account:", deployer.address);
  
  // Connect to RandomGenerator contract
  const RandomGenerator = await ethers.getContractFactory("RandomGenerator");
  const randomGenerator = RandomGenerator.attach(randomGeneratorAddress);
  
  // Check current roles
  const OPERATOR_ROLE = await randomGenerator.OPERATOR_ROLE();
  const hasRole = await randomGenerator.hasRole(OPERATOR_ROLE, testFactoryAddress);
  
  console.log("SimpleYieldCircleFactoryTest has OPERATOR_ROLE:", hasRole);
  
  if (!hasRole) {
    console.log("Granting OPERATOR_ROLE to SimpleYieldCircleFactoryTest...");
    const tx = await randomGenerator.grantRole(OPERATOR_ROLE, testFactoryAddress);
    await tx.wait();
    console.log("✅ OPERATOR_ROLE granted successfully!");
  } else {
    console.log("✅ SimpleYieldCircleFactoryTest already has OPERATOR_ROLE");
  }
  
  // Verify the role was granted
  const hasRoleAfter = await randomGenerator.hasRole(OPERATOR_ROLE, testFactoryAddress);
  console.log("Verification - SimpleYieldCircleFactoryTest has OPERATOR_ROLE:", hasRoleAfter);
  
  // Test the factory now
  console.log("\n🧪 Testing factory after OPERATOR_ROLE fix...");
  try {
    const SimpleYieldCircleFactoryTest = await ethers.getContractFactory("SimpleYieldCircleFactoryTest");
    const testFactory = SimpleYieldCircleFactoryTest.attach(testFactoryAddress);
    
    const testMembers = [
      deployer.address,
      "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
      "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC"
    ];
    
    const tx = await testFactory.createCircle(
      testMembers,
      ethers.utils.parseUnits("25", 6), // 25 USDT
      30 * 24 * 60 * 60, // 30 days in seconds
      "Test Circle"
    );
    await tx.wait();
    console.log("✅ Test circle creation successful!");
    
    const circleCount = await testFactory.getCircleCount();
    console.log("Total circles created:", circleCount.toString());
  } catch (error) {
    console.log("❌ Test failed:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
