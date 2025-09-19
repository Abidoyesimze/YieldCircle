const { ethers } = require("hardhat");

async function main() {
  console.log("🔧 Fixing circle initialization...");

  const circleAddress = "0x0197D9f58d03dB21BC15999eFB8d8ce74474dD22"; // The circle that needs fixing

  console.log("📋 Circle Address:", circleAddress);

  try {
    // We know this circle has 5 members from the check
    const memberCount = 5;
    console.log("📊 Member count:", memberCount);

    // Generate test positions for 5 members
    const RandomGenerator = await ethers.getContractAt(
      "RandomGenerator", 
      "0x654448cee799e8bdeF8e217cFeD1f3a09e17167B"
    );
    
    const positions = await RandomGenerator.generateTestPositions(memberCount);
    console.log("🎲 Generated positions:", positions.map(p => p.toString()));

    // Initialize the circle with positions using the factory
    const SimpleYieldCircleFactoryTest = await ethers.getContractAt(
      "SimpleYieldCircleFactoryTest",
      "0x0F939ed454028c4edC7bA14cdB09d5E660Bd0fd8"
    );
    
    const tx = await SimpleYieldCircleFactoryTest.initializeCircleWithTestPositions(circleAddress);
    console.log("📝 Transaction hash:", tx.hash);

    await tx.wait();
    console.log("✅ Circle initialized successfully!");

    // Verify the circle is now properly initialized
    const circleInfo = await YieldCircle.circle();
    
    console.log("📊 Circle Status After Fix:");
    console.log("- Phase:", circleInfo.phase.toString());
    console.log("- Positions Initialized:", circleInfo.positionsInitialized);
    console.log("- Is Active:", circleInfo.isActive);

  } catch (error) {
    console.error("❌ Error fixing circle:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });