const { ethers } = require("hardhat");

async function main() {
  console.log("🔧 Granting DEFAULT_ADMIN_ROLE to SimpleYieldCircleFactoryTest...");
  
  // Contract addresses
  const testFactoryAddress = "0x0F939ed454028c4edC7bA14cdB09d5E660Bd0fd8";
  const yieldManagerAddress = "0x789FF5585c2de03Be045d8866e69be0a3cf54744";
  
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Using account:", deployer.address);
  
  // Connect to KaiaYieldStrategyManager
  const KaiaYieldStrategyManager = await ethers.getContractFactory("KaiaYieldStrategyManager");
  const yieldManager = KaiaYieldStrategyManager.attach(yieldManagerAddress);
  
  // Check current roles
  const DEFAULT_ADMIN_ROLE = await yieldManager.DEFAULT_ADMIN_ROLE();
  const hasAdminRole = await yieldManager.hasRole(DEFAULT_ADMIN_ROLE, testFactoryAddress);
  
  console.log("SimpleYieldCircleFactoryTest has DEFAULT_ADMIN_ROLE:", hasAdminRole);
  
  if (!hasAdminRole) {
    console.log("Granting DEFAULT_ADMIN_ROLE to SimpleYieldCircleFactoryTest...");
    const tx = await yieldManager.grantRole(DEFAULT_ADMIN_ROLE, testFactoryAddress);
    await tx.wait();
    console.log("✅ DEFAULT_ADMIN_ROLE granted successfully!");
  } else {
    console.log("✅ SimpleYieldCircleFactoryTest already has DEFAULT_ADMIN_ROLE");
  }
  
  // Verify the role was granted
  const hasRoleAfter = await yieldManager.hasRole(DEFAULT_ADMIN_ROLE, testFactoryAddress);
  console.log("Verification - SimpleYieldCircleFactoryTest has DEFAULT_ADMIN_ROLE:", hasRoleAfter);
  
  // Test the factory now
  console.log("\n🧪 Testing factory after DEFAULT_ADMIN_ROLE fix...");
  try {
    const SimpleYieldCircleFactoryTest = await ethers.getContractFactory("SimpleYieldCircleFactoryTest");
    const testFactory = SimpleYieldCircleFactoryTest.attach(testFactoryAddress);
    
    const testMembers = [
      deployer.address,
      "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
    ];
    
    const tx = await testFactory.createCircle(
      testMembers,
      ethers.utils.parseUnits("25", 6), // 25 USDT
      30 * 24 * 60 * 60, // 30 days in seconds
      "Admin Test"
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
