const { ethers } = require("hardhat");

async function main() {
  console.log("🧪 Testing YieldCircle constructor directly...");
  
  // Contract addresses
  const mockUSDTAddress = "0xFE2e76f1DcF3A706e34cCB6083125D4A4a59876E";
  const yieldManagerAddress = "0x789FF5585c2de03Be045d8866e69be0a3cf54744";
  const randomGeneratorAddress = "0xc9843a1aF776BEe8bDb55b94fD23bE2dbf457AbD";
  
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Using account:", deployer.address);
  
  // Test members
  const testMembers = [
    deployer.address,
    "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC"
  ];
  
  console.log("\n📊 Test Parameters:");
  console.log("Members:", testMembers);
  console.log("Contribution Amount: 25 USDT (25e6)");
  console.log("Cycle Duration: 30 days (2592000 seconds)");
  console.log("Circle Name: 'Test Circle'");
  console.log("Creator:", deployer.address);
  console.log("Request ID: 0");
  
  // Test YieldCircle constructor directly
  console.log("\n🧪 Testing YieldCircle constructor...");
  try {
    const YieldCircle = await ethers.getContractFactory("YieldCircle");
    const yieldCircle = await YieldCircle.deploy(
      mockUSDTAddress,
      yieldManagerAddress,
      randomGeneratorAddress,
      testMembers,
      ethers.utils.parseUnits("25", 6), // 25 USDT
      30 * 24 * 60 * 60, // 30 days in seconds
      "Test Circle",
      deployer.address,
      0 // No VRF request ID
    );
    await yieldCircle.deployed();
    console.log("✅ YieldCircle constructor successful!");
    console.log("YieldCircle address:", yieldCircle.address);
    
    // Test basic functions
    const circleInfo = await yieldCircle.circle();
    console.log("Circle name:", circleInfo.name);
    console.log("Creator:", circleInfo.creator);
    console.log("Contribution amount:", circleInfo.contributionAmount.toString());
    console.log("Cycle duration:", circleInfo.cycleDuration.toString());
    console.log("Total cycles:", circleInfo.totalCycles.toString());
    
  } catch (error) {
    console.log("❌ YieldCircle constructor failed:", error.message);
    
    // Try to decode the error
    if (error.data) {
      console.log("Error data:", error.data);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
