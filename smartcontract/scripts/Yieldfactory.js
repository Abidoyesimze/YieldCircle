const { ethers } = require("hardhat");

async function main() {
    console.log("Starting YieldCircleFactory deployment...");

    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with account:", deployer.address);

    const balance = await deployer.getBalance();
    console.log("Account balance:", balance.toString());

    const network = await ethers.provider.getNetwork();
    console.log(`Network: ${network.name} Chain ID: ${network.chainId}`);

    // -------------------------------
    // Deploy Mock USDT
    // -------------------------------
    console.log("Deploying Mock USDT...");
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    const mockUSDT = await MockERC20.deploy("Mock USDT", "USDT", 18);
    await mockUSDT.deployed();
    console.log("Mock USDT deployed to:", mockUSDT.address);

    // -------------------------------
    // Deploy Mock VRF Coordinator
    // -------------------------------
    console.log("Deploying Mock VRF Coordinator...");
    const MockVRFCoordinator = await ethers.getContractFactory("MockVRFCoordinator");
    const mockVrfCoordinator = await MockVRFCoordinator.deploy();
    await mockVrfCoordinator.deployed();
    console.log("Mock VRF Coordinator deployed to:", mockVrfCoordinator.address);

    // -------------------------------
    // Deploy Mock LINK
    // -------------------------------
    console.log("Deploying Mock LINK Token...");
    const mockLink = await MockERC20.deploy("Mock LINK", "LINK", 18);
    await mockLink.deployed();
    console.log("Mock LINK deployed to:", mockLink.address);

    // -------------------------------
    // Deploy RandomGenerator
    // -------------------------------
    console.log("Deploying RandomGenerator...");
    const RandomGenerator = await ethers.getContractFactory("RandomGenerator");

    const randomGenerator = await RandomGenerator.deploy(
        mockVrfCoordinator.address,                       // _vrfCoordinator
        ethers.utils.formatBytes32String("keyHash123"),   // _keyHash (dummy for testing)
        1,                                                // _subscriptionId
        200000,                                           // _callbackGasLimit
        3                                                 // _requestConfirmations
    );

    await randomGenerator.deployed();
    console.log("RandomGenerator deployed to:", randomGenerator.address);

    // -------------------------------
    // Deploy YieldCircleFactory
    // -------------------------------
    console.log("Deploying YieldCircleFactory...");
    const YieldCircleFactory = await ethers.getContractFactory("YieldCircleFactory");

    const yieldCircleFactory = await YieldCircleFactory.deploy(
        mockUSDT.address,
        randomGenerator.address,
        mockLink.address
    );

    await yieldCircleFactory.deployed();
    console.log("YieldCircleFactory deployed to:", yieldCircleFactory.address);
}

main().catch((error) => {
    console.error("Deployment failed:", error);
    process.exitCode = 1;
});
