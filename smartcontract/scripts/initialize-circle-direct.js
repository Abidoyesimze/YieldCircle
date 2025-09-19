const { ethers } = require("hardhat");

async function main() {
  console.log("🔧 Initializing circle directly...");

  const circleAddress = "0x0197D9f58d03dB21BC15999eFB8d8ce74474dD22";
  const creatorAddress = "0x6BF7d6b94282BD48ff458599aDafA268BcB009FF"; // The creator

  try {
    // Connect as the creator
    const creator = await ethers.getSigner(creatorAddress);
    console.log("👤 Creator:", creatorAddress);

    // Generate test positions for 5 members
    const RandomGenerator = await ethers.getContractAt(
      "RandomGenerator", 
      "0x654448cee799e8bdeF8e217cFeD1f3a09e17167B"
    );
    
    const positions = await RandomGenerator.generateTestPositions(5);
    console.log("🎲 Generated positions:", positions.map(p => p.toString()));

    // Initialize the circle with positions as the creator
    const YieldCircle = await ethers.getContractAt("YieldCircle", circleAddress);
    const tx = await YieldCircle.connect(creator).initializeWithPositions(positions);
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
    console.error("❌ Error initializing circle:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
