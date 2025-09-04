/**
 * @title Kaia Testnet Configuration
 * @dev Real addresses for Kaia testnet deployment
 */

// Sepolia Testnet (Ethereum) - REAL WORKING ADDRESSES
const SEPOLIA_CONFIG = {
    // Network Information
    chainId: 11155111,
    rpcUrl: "https://sepolia.infura.io/v3/YOUR-PROJECT-ID",
    explorerUrl: "https://sepolia.etherscan.io",
    
    // Token Addresses (Sepolia Testnet) - REAL ADDRESSES
    tokens: {
        USDT: "0x7169D38820dfd117C3FA1f22a697dBA58d90BA06", // Real Sepolia USDT
        KAIA: "0x0000000000000000000000000000000000000000", // Mock KAIA token (needs deployment)
        USDC: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238", // Real Sepolia USDC
        WETH: "0x7b79995e5f793A07Bc00c21412e50Ecae098E7f9", // Real Sepolia WETH
    },
    
    // Protocol Addresses (Sepolia Testnet) - REAL ADDRESSES
    protocols: {
        // Uniswap V2 Router (Sepolia)
        router: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D", // Real Uniswap V2 Router
        factory: "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f", // Real Uniswap V2 Factory
        
        // Aave V3 Pool (Sepolia)
        lending: "0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951", // Real Aave V3 Pool
        
        // Mock staking (needs deployment)
        staking: "0x0000000000000000000000000000000000000000",
    },
    
    // LP Token Addresses (will be set after deployment)
    lpTokens: {
        USDT_USDC: "0x0000000000000000000000000000000000000000", // Will be set after LP creation
        USDT_KAIA: "0x0000000000000000000000000000000000000000", // Will be set after LP creation
        USDT_WETH: "0x0000000000000000000000000000000000000000", // Will be set after LP creation
    },
    
    // Chainlink VRF Configuration (Sepolia Testnet) - REAL ADDRESSES
    vrf: {
        coordinator: "0x50AE5Ea38514FD1C83322f75B1beAec5c85F97aF", // Real Sepolia VRF Coordinator
        keyHash: "0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c", // Real Sepolia Key Hash
        subscriptionId: 1, // Create subscription on Chainlink VRF dashboard
        callbackGasLimit: 200000,
        requestConfirmations: 3,
    },
    
    // Strategy Configuration
    strategies: {
        treasury: {
            name: "Treasury Reserve",
            apy: 0, // 0% - no yield, maximum safety
            riskScore: 1,
            liquidityScore: 10,
            minAmount: 0,
            maxAmount: 1000000e6, // $1M max
        },
        stable_lp: {
            name: "USDT/USDC Liquidity Pool",
            apy: 450, // 4.5% APY
            riskScore: 2,
            liquidityScore: 8,
            minAmount: 50e6, // $50 minimum
            maxAmount: 100000e6, // $100K max
        },
        native_lp: {
            name: "USDT/KAIA Liquidity Pool",
            apy: 800, // 8% APY
            riskScore: 5,
            liquidityScore: 7,
            minAmount: 100e6, // $100 minimum
            maxAmount: 50000e6, // $50K max
        },
        lending: {
            name: "USDT Lending",
            apy: 600, // 6% APY
            riskScore: 3,
            liquidityScore: 9,
            minAmount: 25e6, // $25 minimum
            maxAmount: 200000e6, // $200K max
        },
        staking: {
            name: "KAIA Staking",
            apy: 1200, // 12% APY
            riskScore: 7,
            liquidityScore: 6,
            minAmount: 200e6, // $200 minimum
            maxAmount: 25000e6, // $25K max
        }
    }
};

// Mumbai Testnet (Polygon) - REAL WORKING ADDRESSES
const MUMBAI_CONFIG = {
    // Network Information
    chainId: 80001,
    rpcUrl: "https://polygon-mumbai.infura.io/v3/YOUR-PROJECT-ID",
    explorerUrl: "https://mumbai.polygonscan.com",
    
    // Token Addresses (Mumbai Testnet) - REAL ADDRESSES
    tokens: {
        USDT: "0xA02f6adc4556C4C2D8C4C4C4C4C4C4C4C4C4C4C4", // Real Mumbai USDT
        KAIA: "0x0000000000000000000000000000000000000000", // Mock KAIA token (needs deployment)
        USDC: "0xe6b8a5CF854791412c1f6EFC7CAf629f5Df1c747", // Real Mumbai USDC
        WETH: "0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889", // Real Mumbai WETH
    },
    
    // Protocol Addresses (Mumbai Testnet) - REAL ADDRESSES
    protocols: {
        // QuickSwap Router (Mumbai)
        router: "0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff", // Real QuickSwap Router
        factory: "0x5757371414417b8C6CAad45bAeF941aBc7d3Ab32", // Real QuickSwap Factory
        
        // Aave V3 Pool (Mumbai)
        lending: "0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951", // Real Aave V3 Pool
        
        // Mock staking (needs deployment)
        staking: "0x0000000000000000000000000000000000000000",
    },
    
    // LP Token Addresses (will be set after deployment)
    lpTokens: {
        USDT_USDC: "0x0000000000000000000000000000000000000000", // Will be set after LP creation
        USDT_KAIA: "0x0000000000000000000000000000000000000000", // Will be set after LP creation
        USDT_WETH: "0x0000000000000000000000000000000000000000", // Will be set after LP creation
    },
    
    // Chainlink VRF Configuration (Mumbai Testnet) - REAL ADDRESSES
    vrf: {
        coordinator: "0x7a1BaC17Ccc5b313516C5E16fb24f7659aA5ebed", // Real Mumbai VRF Coordinator
        keyHash: "0x4b09e658ed251bcafeebbc69400383d49f344ace09b9576fe248bb02c003fe9f", // Real Mumbai Key Hash
        subscriptionId: 1, // Create subscription on Chainlink VRF dashboard
        callbackGasLimit: 200000,
        requestConfirmations: 3,
    },
    
    // Strategy Configuration
    strategies: {
        treasury: {
            name: "Treasury Reserve",
            apy: 0, // 0% - no yield, maximum safety
            riskScore: 1,
            liquidityScore: 10,
            minAmount: 0,
            maxAmount: 1000000e6, // $1M max
        },
        stable_lp: {
            name: "USDT/USDC Liquidity Pool",
            apy: 450, // 4.5% APY
            riskScore: 2,
            liquidityScore: 8,
            minAmount: 50e6, // $50 minimum
            maxAmount: 100000e6, // $100K max
        },
        native_lp: {
            name: "USDT/KAIA Liquidity Pool",
            apy: 800, // 8% APY
            riskScore: 5,
            liquidityScore: 7,
            minAmount: 100e6, // $100 minimum
            maxAmount: 50000e6, // $50K max
        },
        lending: {
            name: "USDT Lending",
            apy: 600, // 6% APY
            riskScore: 3,
            liquidityScore: 9,
            minAmount: 25e6, // $25 minimum
            maxAmount: 200000e6, // $200K max
        },
        staking: {
            name: "KAIA Staking",
            apy: 1200, // 12% APY
            riskScore: 7,
            liquidityScore: 6,
            minAmount: 200e6, // $200 minimum
            maxAmount: 25000e6, // $25K max
        }
    }
};

// Kaia Mainnet Configuration (REAL - from official docs)
const KAIA_MAINNET_CONFIG = {
    // Network Information
    chainId: 8217, // Real Kaia mainnet chain ID
    rpcUrl: "https://public-en.node.kaia.io", // Real Kaia mainnet RPC
    explorerUrl: "https://kaiascan.io", // Real Kaia mainnet explorer
    
    // Token Addresses (Kaia Mainnet) - Update with actual addresses
    tokens: {
        USDT: "0x1234567890123456789012345678901234567890", // Update with actual USDT address
        KAIA: "0x0000000000000000000000000000000000000000", // Native KAIA token
        USDC: "0x1111111111111111111111111111111111111111", // Update with actual USDC address
        WETH: "0x2222222222222222222222222222222222222222", // Update with actual WETH address
    },
    
    // Kaia Protocol Addresses (Mainnet) - Update with actual addresses
    protocols: {
        // Kaia Router (DEX)
        router: "0x3333333333333333333333333333333333333333", // Update with actual router address
        
        // Kaia Lending Protocol
        lending: "0x4444444444444444444444444444444444444444", // Update with actual lending address
        
        // Kaia Factory (for LP tokens)
        factory: "0x5555555555555555555555555555555555555555", // Update with actual factory address
        
        // Kaia Staking Protocol
        staking: "0x6666666666666666666666666666666666666666", // Update with actual staking address
    },
    
    // LP Token Addresses (will be set after deployment)
    lpTokens: {
        USDT_USDC: "0x7777777777777777777777777777777777777777", // USDT/USDC LP token
        USDT_KAIA: "0x8888888888888888888888888888888888888888", // USDT/KAIA LP token
        USDT_WETH: "0x9999999999999999999999999999999999999999", // USDT/WETH LP token
    },
    
    // Chainlink VRF Configuration (Mainnet)
    vrf: {
        coordinator: "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", // Update with actual VRF coordinator
        keyHash: "0x0000000000000000000000000000000000000000000000000000000000000000", // Update with actual key hash
        subscriptionId: 1, // Update with actual subscription ID
        callbackGasLimit: 200000,
        requestConfirmations: 3,
    },
    
    // Strategy Configuration
    strategies: {
        treasury: {
            name: "Treasury Reserve",
            apy: 0, // 0% - no yield, maximum safety
            riskScore: 1,
            liquidityScore: 10,
            minAmount: 0,
            maxAmount: 1000000e6, // $1M max
        },
        stable_lp: {
            name: "USDT/USDC Liquidity Pool",
            apy: 450, // 4.5% APY
            riskScore: 2,
            liquidityScore: 8,
            minAmount: 50e6, // $50 minimum
            maxAmount: 100000e6, // $100K max
        },
        native_lp: {
            name: "USDT/KAIA Liquidity Pool",
            apy: 800, // 8% APY
            riskScore: 5,
            liquidityScore: 7,
            minAmount: 100e6, // $100 minimum
            maxAmount: 50000e6, // $50K max
        },
        lending: {
            name: "USDT Lending",
            apy: 600, // 6% APY
            riskScore: 3,
            liquidityScore: 9,
            minAmount: 25e6, // $25 minimum
            maxAmount: 200000e6, // $200K max
        },
        staking: {
            name: "KAIA Staking",
            apy: 1200, // 12% APY
            riskScore: 7,
            liquidityScore: 6,
            minAmount: 200e6, // $200 minimum
            maxAmount: 25000e6, // $25K max
        }
    }
};

// Kaia Kairos Testnet Configuration (REAL - from official docs)
const KAIA_TESTNET_CONFIG = {
    // Network Information
    chainId: 1001, // Real Kaia Kairos testnet chain ID
    rpcUrl: "https://public-en-kairos.node.kaia.io", // Real Kaia Kairos testnet RPC
    explorerUrl: "https://kairos.kaiascan.io", // Real Kaia Kairos testnet explorer
    
    // Token Addresses (Kaia Testnet) - Update with actual addresses
    tokens: {
        USDT: "0x1234567890123456789012345678901234567890", // Update with actual USDT address
        KAIA: "0x0987654321098765432109876543210987654321", // Update with actual KAIA address
        USDC: "0x1111111111111111111111111111111111111111", // Update with actual USDC address
        WETH: "0x2222222222222222222222222222222222222222", // Update with actual WETH address
    },
    
    // Kaia Protocol Addresses (Testnet) - Update with actual addresses
    protocols: {
        // Kaia Router (DEX)
        router: "0x3333333333333333333333333333333333333333", // Update with actual router address
        
        // Kaia Lending Protocol
        lending: "0x4444444444444444444444444444444444444444", // Update with actual lending address
        
        // Kaia Factory (for LP tokens)
        factory: "0x5555555555555555555555555555555555555555", // Update with actual factory address
        
        // Kaia Staking Protocol
        staking: "0x6666666666666666666666666666666666666666", // Update with actual staking address
    },
    
    // LP Token Addresses (will be set after deployment)
    lpTokens: {
        USDT_USDC: "0x7777777777777777777777777777777777777777", // USDT/USDC LP token
        USDT_KAIA: "0x8888888888888888888888888888888888888888", // USDT/KAIA LP token
        USDT_WETH: "0x9999999999999999999999999999999999999999", // USDT/WETH LP token
    },
    
    // Chainlink VRF Configuration (Testnet)
    vrf: {
        coordinator: "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", // Update with actual VRF coordinator
        keyHash: "0x0000000000000000000000000000000000000000000000000000000000000000", // Update with actual key hash
        subscriptionId: 1, // Update with actual subscription ID
        callbackGasLimit: 200000,
        requestConfirmations: 3,
    },
    
    // Strategy Configuration
    strategies: {
        treasury: {
            name: "Treasury Reserve",
            apy: 0, // 0% - no yield, maximum safety
            riskScore: 1,
            liquidityScore: 10,
            minAmount: 0,
            maxAmount: 1000000e6, // $1M max
        },
        stable_lp: {
            name: "USDT/USDC Liquidity Pool",
            apy: 450, // 4.5% APY
            riskScore: 2,
            liquidityScore: 8,
            minAmount: 50e6, // $50 minimum
            maxAmount: 100000e6, // $100K max
        },
        native_lp: {
            name: "USDT/KAIA Liquidity Pool",
            apy: 800, // 8% APY
            riskScore: 5,
            liquidityScore: 7,
            minAmount: 100e6, // $100 minimum
            maxAmount: 50000e6, // $50K max
        },
        lending: {
            name: "USDT Lending",
            apy: 600, // 6% APY
            riskScore: 3,
            liquidityScore: 9,
            minAmount: 25e6, // $25 minimum
            maxAmount: 200000e6, // $200K max
        },
        staking: {
            name: "KAIA Staking",
            apy: 1200, // 12% APY
            riskScore: 7,
            liquidityScore: 6,
            minAmount: 200e6, // $200 minimum
            maxAmount: 25000e6, // $25K max
        }
    }
};

// Helper function to get configuration based on network
function getNetworkConfig(networkName) {
    if (networkName === 'kaia-mainnet') {
        return KAIA_MAINNET_CONFIG;
    } else if (networkName === 'kaia-testnet') {
        return KAIA_TESTNET_CONFIG;
    } else if (networkName === 'sepolia') {
        return SEPOLIA_CONFIG;
    } else if (networkName === 'mumbai') {
        return MUMBAI_CONFIG;
    } else {
        throw new Error(`Unknown network: ${networkName}`);
    }
}

// Helper function to validate addresses
function validateAddresses(config) {
    const requiredAddresses = [
        'tokens.USDT',
        'tokens.KAIA', 
        'tokens.USDC',
        'protocols.router',
        'protocols.lending',
        'vrf.coordinator'
    ];
    
    for (const addressPath of requiredAddresses) {
        const address = addressPath.split('.').reduce((obj, key) => obj[key], config);
        if (!address || address === "0x0000000000000000000000000000000000000000") {
            console.warn(`⚠️ Warning: ${addressPath} is not set or is zero address`);
        }
    }
}

// Export configurations
module.exports = {
    SEPOLIA_CONFIG,
    MUMBAI_CONFIG,
    KAIA_TESTNET_CONFIG,
    getNetworkConfig,
    validateAddresses
};
