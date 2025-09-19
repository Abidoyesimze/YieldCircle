const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying SimpleYieldCircleFactoryTest...");
  
  // Contract addresses
  const mockUSDTAddress = "0xFE2e76f1DcF3A706e34cCB6083125D4A4a59876E";
  const yieldManagerAddress = "0x789FF5585c2de03Be045d8866e69be0a3cf54744";
  const randomGeneratorAddress = "0xc9843a1aF776BEe8bDb55b94fD23bE2dbf457AbD";
  
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Using account:", deployer.address);
  
  // Deploy SimpleYieldCircleFactoryTest
  console.log("\n📦 Deploying SimpleYieldCircleFactoryTest...");
  const SimpleYieldCircleFactoryTest = await ethers.getContractFactory("SimpleYieldCircleFactoryTest");
  const testFactory = await SimpleYieldCircleFactoryTest.deploy(
    mockUSDTAddress,
    yieldManagerAddress,
    randomGeneratorAddress
  );
  await testFactory.deployed();
  console.log("✅ SimpleYieldCircleFactoryTest deployed:", testFactory.address);
  
  // Grant CIRCLE_ROLE to the test factory
  console.log("\n🔐 Setting up roles...");
  const KaiaYieldStrategyManager = await ethers.getContractFactory("KaiaYieldStrategyManager");
  const yieldManager = KaiaYieldStrategyManager.attach(yieldManagerAddress);
  
  const CIRCLE_ROLE = await yieldManager.CIRCLE_ROLE();
  const tx = await yieldManager.grantRole(CIRCLE_ROLE, testFactory.address);
  await tx.wait();
  console.log("✅ Granted CIRCLE_ROLE to test factory");
  
  // Test the factory
  console.log("\n🧪 Testing factory...");
  try {
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
  
  console.log("\n📋 Summary:");
  console.log("SimpleYieldCircleFactoryTest:", testFactory.address);
  console.log("Mock USDT:", mockUSDTAddress);
  console.log("Yield Manager:", yieldManagerAddress);
  console.log("Random Generator:", randomGeneratorAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
