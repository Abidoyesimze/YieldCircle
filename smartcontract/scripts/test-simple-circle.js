const { ethers } = require("hardhat");

async function main() {
  console.log("🧪 Testing simple circle creation...");
  
  // Contract addresses
  const testFactoryAddress = "0x0F939ed454028c4edC7bA14cdB09d5E660Bd0fd8";
  
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Using account:", deployer.address);
  
  // Connect to test factory
  const SimpleYieldCircleFactoryTest = await ethers.getContractFactory("SimpleYieldCircleFactoryTest");
  const testFactory = SimpleYieldCircleFactoryTest.attach(testFactoryAddress);
  
  // Test with minimal parameters - just 2 members
  const testMembers = [
    deployer.address,
    "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
  ];
  
  console.log("\n📊 Test Parameters:");
  console.log("Members:", testMembers);
  console.log("Contribution Amount: 25 USDT (25e6)");
  console.log("Cycle Duration: 30 days (2592000 seconds)");
  console.log("Circle Name: 'Simple Test'");
  
  // Test each validation step individually
  console.log("\n🔍 Testing individual validations...");
  
  // Test 1: Check if factory is paused
  try {
    const isPaused = await testFactory.paused();
    console.log("✅ Factory paused status:", isPaused);
  } catch (error) {
    console.log("❌ Could not check pause status:", error.message);
  }
  
  // Test 2: Check user limits
  try {
    const userCircleCount = await testFactory.circleCount(deployer.address);
    const maxCirclesPerUser = await testFactory.maxCirclesPerUser();
    console.log("✅ User circle count:", userCircleCount.toString());
    console.log("✅ Max circles per user:", maxCirclesPerUser.toString());
  } catch (error) {
    console.log("❌ Could not check user limits:", error.message);
  }
  
  // Test 3: Check creation frequency
  try {
    const lastCreation = await testFactory.lastCircleCreation(deployer.address);
    const minDelay = await testFactory.minCircleCreationDelay();
    const currentTime = Math.floor(Date.now() / 1000);
    const timeSinceLastCreation = currentTime - parseInt(lastCreation.toString());
    const canCreate = currentTime >= parseInt(lastCreation.toString()) + parseInt(minDelay.toString());
    console.log("✅ Last creation:", lastCreation.toString());
    console.log("✅ Min delay:", minDelay.toString());
    console.log("✅ Can create:", canCreate);
  } catch (error) {
    console.log("❌ Could not check creation frequency:", error.message);
  }
  
  // Test 4: Try to create circle
  console.log("\n🧪 Attempting circle creation...");
  try {
    const tx = await testFactory.createCircle(
      testMembers,
      ethers.utils.parseUnits("25", 6), // 25 USDT
      30 * 24 * 60 * 60, // 30 days in seconds
      "Simple Test"
    );
    await tx.wait();
    console.log("✅ Circle creation successful!");
    
    const circleCount = await testFactory.getCircleCount();
    console.log("Total circles created:", circleCount.toString());
  } catch (error) {
    console.log("❌ Circle creation failed:", error.message);
    
    // Try to decode the error
    if (error.data) {
      console.log("Error data:", error.data);
      const errorSelector = error.data.slice(0, 10);
      console.log("Error selector:", errorSelector);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
