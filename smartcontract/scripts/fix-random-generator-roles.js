const { ethers } = require("hardhat");

async function main() {
  console.log("🔧 Fixing RandomGenerator roles...");
  
  // Contract addresses
  const randomGeneratorAddress = "0xc9843a1aF776BEe8bDb55b94fD23bE2dbf457AbD";
  const simpleFactoryAddress = "0x7F37F6d0F333f64F4Dab8D8ded349f32D9e39ACa";
  
  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Using account:", deployer.address);
  
  // Connect to RandomGenerator contract
  const RandomGenerator = await ethers.getContractFactory("RandomGenerator");
  const randomGenerator = RandomGenerator.attach(randomGeneratorAddress);
  
  // Check current roles
  const OPERATOR_ROLE = await randomGenerator.OPERATOR_ROLE();
  const hasRole = await randomGenerator.hasRole(OPERATOR_ROLE, simpleFactoryAddress);
  
  console.log("SimpleYieldCircleFactory has OPERATOR_ROLE:", hasRole);
  
  if (!hasRole) {
    console.log("Granting OPERATOR_ROLE to SimpleYieldCircleFactory...");
    const tx = await randomGenerator.grantRole(OPERATOR_ROLE, simpleFactoryAddress);
    await tx.wait();
    console.log("✅ OPERATOR_ROLE granted successfully!");
  } else {
    console.log("✅ SimpleYieldCircleFactory already has OPERATOR_ROLE");
  }
  
  // Verify the role was granted
  const hasRoleAfter = await randomGenerator.hasRole(OPERATOR_ROLE, simpleFactoryAddress);
  console.log("Verification - SimpleYieldCircleFactory has OPERATOR_ROLE:", hasRoleAfter);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exit(1);
  });
