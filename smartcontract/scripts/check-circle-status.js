const { ethers } = require("hardhat");

async function main() {
  console.log("🔍 Checking circle status...");

  const circleAddress = "0x0197D9f58d03dB21BC15999eFB8d8ce74474dD22";

  try {
    const YieldCircle = await ethers.getContractAt("YieldCircle", circleAddress);
    
    // Get circle info
    const circleInfo = await YieldCircle.circle();
    console.log("📊 Circle Info:");
    console.log("- Name:", circleInfo.name);
    console.log("- Creator:", circleInfo.creator);
    console.log("- Phase:", circleInfo.phase.toString());
    console.log("- Positions Initialized:", circleInfo.positionsInitialized);
    console.log("- Is Active:", circleInfo.isActive);
    console.log("- Contribution Amount:", ethers.utils.formatUnits(circleInfo.contributionAmount, 6), "USDT");
    console.log("- Cycle Duration:", circleInfo.cycleDuration.toString(), "seconds");
    
    // Check members
    console.log("\n👥 Members:");
    for (let i = 0; i < 10; i++) {
      try {
        const member = await YieldCircle.memberList(i);
        if (member !== "0x0000000000000000000000000000000000000000") {
          const memberInfo = await YieldCircle.members(member);
          console.log(`- Member ${i}: ${member} (${memberInfo.name || "No name"})`);
        }
      } catch (e) {
        break;
      }
    }

  } catch (error) {
    console.error("❌ Error checking circle:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
