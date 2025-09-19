const { ethers } = require("hardhat");

async function main() {
  console.log("🔧 Fixing role permissions for SimpleYieldCircleFactoryTest...");
  
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
  const STRATEGY_MANAGER_ROLE = await yieldManager.STRATEGY_MANAGER_ROLE();
  
  const hasAdminRole = await yieldManager.hasRole(DEFAULT_ADMIN_ROLE, testFactoryAddress);
  const hasStrategyRole = await yieldManager.hasRole(STRATEGY_MANAGER_ROLE, testFactoryAddress);
  
  console.log("Test Factory has DEFAULT_ADMIN_ROLE:", hasAdminRole);
  console.log("Test Factory has STRATEGY_MANAGER_ROLE:", hasStrategyRole);
  
  if (!hasStrategyRole) {
    console.log("Granting STRATEGY_MANAGER_ROLE to SimpleYieldCircleFactoryTest...");
    const tx = await yieldManager.grantRole(STRATEGY_MANAGER_ROLE, testFactoryAddress);
    await tx.wait();
    console.log("✅ STRATEGY_MANAGER_ROLE granted successfully!");
  } else {
    console.log("✅ SimpleYieldCircleFactoryTest already has STRATEGY_MANAGER_ROLE");
  }
  
  // Verify the role was granted
  const hasRoleAfter = await yieldManager.hasRole(STRATEGY_MANAGER_ROLE, testFactoryAddress);
  console.log("Verification - Test Factory has STRATEGY_MANAGER_ROLE:", hasRoleAfter);
  
  // Test the factory now
  console.log("\n🧪 Testing factory after role fix...");
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
