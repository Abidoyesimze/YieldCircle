const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Creating new circle with fixed initialization...");

  try {
    // Get the deployer account
    const [deployer] = await ethers.getSigners();
    console.log("👤 Deployer:", deployer.address);

    // Connect to the factory
    const SimpleYieldCircleFactoryTest = await ethers.getContractAt(
      "SimpleYieldCircleFactoryTest",
      "0x0F939ed454028c4edC7bA14cdB09d5E660Bd0fd8"
    );

    // Create unique placeholder addresses for the invitation system
    const members = [
      deployer.address, // Creator
      "0x1111111100000001111111111111111111111111",
      "0x1111111100000002111111111111111111111111", 
      "0x1111111100000003111111111111111111111111",
      "0x1111111100000004111111111111111111111111"
    ];

    const contributionAmount = ethers.utils.parseUnits("25", 6); // 25 USDT
    const cycleDuration = 30 * 24 * 60 * 60; // 30 days in seconds
    const circleName = "Test Circle Fixed";

    console.log("📋 Circle Details:");
    console.log("- Name:", circleName);
    console.log("- Members:", members.length);
    console.log("- Contribution:", "25 USDT");
    console.log("- Duration:", "30 days");

    // Create the circle
    const tx = await SimpleYieldCircleFactoryTest.createCircle(
      members,
      contributionAmount,
      cycleDuration,
      circleName
    );

    console.log("📝 Transaction hash:", tx.hash);
    const receipt = await tx.wait();
    console.log("✅ Circle created successfully!");

    // Get the circle address from the event
    const event = receipt.events.find(e => e.event === "CircleCreated");
    const circleAddress = event.args.circle;
    console.log("📍 Circle Address:", circleAddress);

    // Check the circle status
    const YieldCircle = await ethers.getContractAt("YieldCircle", circleAddress);
    const circleInfo = await YieldCircle.circle();
    
    console.log("📊 Circle Status:");
    console.log("- Phase:", circleInfo.phase.toString());
    console.log("- Positions Initialized:", circleInfo.positionsInitialized);
    console.log("- Is Active:", circleInfo.isActive);

    // Generate invitation link
    const invitationLink = `http://localhost:3000/join-circle?circle=${circleAddress}&name=${encodeURIComponent(circleName)}&members=${members.length}&amount=25.0&duration=30`;
    console.log("🔗 Invitation Link:", invitationLink);

  } catch (error) {
    console.error("❌ Error creating circle:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
