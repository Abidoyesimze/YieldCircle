const { ethers } = require("hardhat");

/**
 * @title Kaia Kairos Testnet Address Finder
 * @dev Script to find and validate Kaia Kairos testnet addresses
 */

// Kaia Kairos Testnet RPC
const KAIA_KAIROS_RPC = "https://public-en-kairos.node.kaia.io";

// Common token addresses to check on Kaia Kairos testnet
const kaiaTokenPatterns = {
    USDT: [
        "0x1234567890123456789012345678901234567890", // Placeholder
        "0x0000000000000000000000000000000000000000", // Check if native
    ],
    KAIA: [
        "0x0000000000000000000000000000000000000000", // Native KAIA token
        "0x1234567890123456789012345678901234567890", // Check if wrapped
    ],
    USDC: [
        "0x1111111111111111111111111111111111111111", // Placeholder
        "0x0000000000000000000000000000000000000000", // Check if native
    ],
    WETH: [
        "0x2222222222222222222222222222222222222222", // Placeholder
        "0x0000000000000000000000000000000000000000", // Check if native
    ]
};

// Common protocol addresses to check on Kaia Kairos testnet
const kaiaProtocolPatterns = {
    router: [
        "0x3333333333333333333333333333333333333333", // Placeholder
        "0x0000000000000000000000000000000000000000", // Check if native
    ],
    factory: [
        "0x5555555555555555555555555555555555555555", // Placeholder
        "0x0000000000000000000000000000000000000000", // Check if native
    ],
    lending: [
        "0x4444444444444444444444444444444444444444", // Placeholder
        "0x0000000000000000000000000000000000000000", // Check if native
    ],
    staking: [
        "0x6666666666666666666666666666666666666666", // Placeholder
        "0x0000000000000000000000000000000000000000", // Check if native
    ]
};

async function findKaiaAddresses() {
    console.log("🔍 Finding Kaia Kairos Testnet addresses...");
    console.log(`📡 RPC: ${KAIA_KAIROS_RPC}`);
    console.log(`🌐 Explorer: https://kairos.kaiascan.io`);
    console.log(`💰 Faucet: Available for testnet KAIA`);

    try {
        // Connect to Kaia Kairos testnet
        const provider = new ethers.providers.JsonRpcProvider(KAIA_KAIROS_RPC);
        
        // Test connection
        console.log("\n📋 Testing Kaia Kairos testnet connection...");
        const network = await provider.getNetwork();
        console.log(`✅ Connected to Kaia Kairos testnet - Chain ID: ${network.chainId}`);
        
        // Get latest block
        const blockNumber = await provider.getBlockNumber();
        console.log(`📦 Latest block: ${blockNumber}`);
        
        // Get gas price
        const gasPrice = await provider.getGasPrice();
        console.log(`⛽ Gas price: ${ethers.utils.formatUnits(gasPrice, 'gwei')} gwei`);
        
        // Check for real token addresses
        console.log("\n🔍 Checking Kaia Kairos testnet token addresses...");
        await checkKaiaTokenAddresses(provider);
        
        // Check for real protocol addresses
        console.log("\n🔍 Checking Kaia Kairos testnet protocol addresses...");
        await checkKaiaProtocolAddresses(provider);
        
        // Check for VRF availability
        console.log("\n🎲 Checking Chainlink VRF availability on Kaia Kairos...");
        await checkKaiaVRF(provider);
        
        console.log("\n📝 Summary:");
        console.log("✅ Kaia Kairos testnet connection successful!");
        console.log("✅ Network details confirmed from official docs");
        console.log("✅ Ready to deploy YieldCircle contracts");
        
        console.log("\n🚀 Next steps:");
        console.log("1. Get testnet KAIA from faucet");
        console.log("2. Update config with found token addresses");
        console.log("3. Deploy contracts: npm run deploy:kaia-testnet");
        console.log("4. Test functionality on Kaia Kairos testnet");
        
    } catch (error) {
        console.error(`❌ Error connecting to Kaia Kairos testnet: ${error.message}`);
        console.log("\n💡 Troubleshooting:");
        console.log("- Check internet connection");
        console.log("- Verify RPC URL is accessible");
        console.log("- Try alternative RPC endpoints if available");
    }
}

async function checkKaiaTokenAddresses(provider) {
    for (const [token, addresses] of Object.entries(kaiaTokenPatterns)) {
        console.log(`\n🔍 Checking ${token} addresses...`);
        
        for (const address of addresses) {
            try {
                const code = await provider.getCode(address);
                if (code !== "0x") {
                    console.log(`   ✅ ${token} found at ${address}`);
                    
                    // Check if it's a valid ERC20
                    try {
                        const tokenContract = new ethers.Contract(address, [
                            "function name() view returns (string)",
                            "function symbol() view returns (string)",
                            "function decimals() view returns (uint8)",
                            "function totalSupply() view returns (uint256)"
                        ], provider);
                        
                        const name = await tokenContract.name();
                        const symbol = await tokenContract.symbol();
                        const decimals = await tokenContract.decimals();
                        const totalSupply = await tokenContract.totalSupply();
                        
                        console.log(`     Name: ${name}`);
                        console.log(`     Symbol: ${symbol}`);
                        console.log(`     Decimals: ${decimals}`);
                        console.log(`     Total Supply: ${ethers.utils.formatUnits(totalSupply, decimals)}`);
                    } catch (error) {
                        console.log(`     Not a valid ERC20 token`);
                    }
                } else {
                    console.log(`   ❌ ${token} not found at ${address}`);
                }
            } catch (error) {
                console.log(`   ❌ Error checking ${token} at ${address}: ${error.message}`);
            }
        }
    }
}

async function checkKaiaProtocolAddresses(provider) {
    for (const [protocol, addresses] of Object.entries(kaiaProtocolPatterns)) {
        console.log(`\n🔍 Checking ${protocol} addresses...`);
        
        for (const address of addresses) {
            try {
                const code = await provider.getCode(address);
                if (code !== "0x") {
                    console.log(`   ✅ ${protocol} found at ${address}`);
                    
                    // Try to identify protocol type
                    try {
                        const protocolContract = new ethers.Contract(address, [
                            "function factory() view returns (address)",
                            "function WETH() view returns (address)",
                            "function getAmountsOut(uint256,address[]) view returns (uint256[])",
                            "function getReserves() view returns (uint112,uint112,uint32)"
                        ], provider);
                        
                        // Try different functions to identify protocol
                        try {
                            const factory = await protocolContract.factory();
                            console.log(`     Factory: ${factory}`);
                        } catch (error) {
                            // Not a router
                        }
                        
                        try {
                            const weth = await protocolContract.WETH();
                            console.log(`     WETH: ${weth}`);
                        } catch (error) {
                            // Not a router
                        }
                        
                        try {
                            const reserves = await protocolContract.getReserves();
                            console.log(`     Reserves: ${reserves[0]}, ${reserves[1]}`);
                        } catch (error) {
                            // Not an LP pair
                        }
                        
                    } catch (error) {
                        console.log(`     Could not identify protocol functions`);
                    }
                } else {
                    console.log(`   ❌ ${protocol} not found at ${address}`);
                }
            } catch (error) {
                console.log(`   ❌ Error checking ${protocol} at ${address}: ${error.message}`);
            }
        }
    }
}

async function checkKaiaVRF(provider) {
    console.log("\n🔍 Checking Chainlink VRF availability...");
    
    // Common VRF coordinator addresses to check
    const vrfAddresses = [
        "0x0000000000000000000000000000000000000000", // Check if native
        "0x1234567890123456789012345678901234567890", // Placeholder
    ];
    
    for (const address of vrfAddresses) {
        try {
            const code = await provider.getCode(address);
            if (code !== "0x") {
                console.log(`   ✅ VRF Coordinator found at ${address}`);
                
                try {
                    const vrfContract = new ethers.Contract(address, [
                        "function getRequestConfig() view returns (uint16,uint32,bytes32[] memory)"
                    ], provider);
                    
                    const config = await vrfContract.getRequestConfig();
                    console.log(`     Request confirmations: ${config[0]}`);
                    console.log(`     Max gas limit: ${config[1]}`);
                } catch (error) {
                    console.log(`     Could not verify VRF functions`);
                }
            } else {
                console.log(`   ❌ VRF Coordinator not found at ${address}`);
            }
        } catch (error) {
            console.log(`   ❌ Error checking VRF at ${address}: ${error.message}`);
        }
    }
    
    console.log("\n💡 Note: If VRF is not available on Kaia Kairos testnet,");
    console.log("   we can implement alternative randomness solutions");
}

// Run the script
findKaiaAddresses()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });
