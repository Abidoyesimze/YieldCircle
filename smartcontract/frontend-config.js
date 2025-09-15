/**
 * @title Frontend Configuration
 * @dev Contract addresses and configuration for frontend integration
 */

// Local Hardhat Network Configuration
export const LOCAL_CONFIG = {
    USDT: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
    USDC: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
    WETH: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
    ROUTER: "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9",
    LENDING: "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9",
    RANDOM_GENERATOR: "0x5FC8d32690cc91D4c39d9d3abcBD16989F875707",
    YIELD_MANAGER: "0x0165878A594ca255338adfa4d48449f69242Eb8F",
    NETWORK: "localhost",
    CHAIN_ID: 31337,
    RPC_URL: "http://localhost:8545"
};

// Sepolia Testnet Configuration (update after deployment)
export const SEPOLIA_CONFIG = {
    USDT: "", // Update after deployment
    USDC: "", // Update after deployment
    WETH: "", // Update after deployment
    ROUTER: "", // Update after deployment
    LENDING: "", // Update after deployment
    RANDOM_GENERATOR: "", // Update after deployment
    YIELD_MANAGER: "", // Update after deployment
    NETWORK: "sepolia",
    CHAIN_ID: 11155111,
    RPC_URL: "https://sepolia.infura.io/v3/YOUR_INFURA_KEY",
    EXPLORER_URL: "https://sepolia.etherscan.io"
};

// Yield Strategy Configuration
export const YIELD_STRATEGIES = {
    TREASURY: {
        name: "treasury",
        displayName: "Treasury",
        apy: 0,
        risk: 1,
        minAmount: 0,
        description: "Safe storage with no yield"
    },
    LENDING: {
        name: "lending",
        displayName: "Lending",
        apy: 6,
        risk: 3,
        minAmount: 25,
        description: "Lend USDT for 6% APY"
    },
    USDT_KAIA_LP: {
        name: "usdt_kaia_lp",
        displayName: "USDT/KAIA LP",
        apy: 8,
        risk: 5,
        minAmount: 50,
        description: "Provide liquidity for 8% APY"
    },
    NATIVE_STAKING: {
        name: "native_staking",
        displayName: "Native Staking",
        apy: 10,
        risk: 2,
        minAmount: 1000,
        description: "Stake KAIA for 10% APY"
    }
};

// Risk Levels
export const RISK_LEVELS = {
    1: { name: "Very Conservative", color: "green" },
    2: { name: "Conservative", color: "lightgreen" },
    3: { name: "Moderate Conservative", color: "yellow" },
    4: { name: "Moderate", color: "orange" },
    5: { name: "Moderate Aggressive", color: "darkorange" },
    6: { name: "Aggressive", color: "red" },
    7: { name: "Very Aggressive", color: "darkred" },
    8: { name: "Extremely Aggressive", color: "purple" },
    9: { name: "Maximum Risk", color: "black" },
    10: { name: "Ultra High Risk", color: "maroon" }
};

// Contract ABIs (you'll need to import these from your compiled contracts)
export const CONTRACT_ABIS = {
    // Import from artifacts/contracts/KaiaYieldStrategyManager.sol/KaiaYieldStrategyManager.json
    YIELD_MANAGER: [], // Add ABI here

    // Import from artifacts/contracts/mocks/MockERC20.sol/MockERC20.json
    MOCK_ERC20: [], // Add ABI here

    // Import from artifacts/contracts/mocks/MockRouter.sol/MockRouter.json
    MOCK_ROUTER: [], // Add ABI here

    // Import from artifacts/contracts/mocks/MockLending.sol/MockLending.json
    MOCK_LENDING: [] // Add ABI here
};

// Helper function to get configuration based on network
export function getConfig(chainId) {
    switch (chainId) {
        case 31337:
            return LOCAL_CONFIG;
        case 11155111:
            return SEPOLIA_CONFIG;
        default:
            return LOCAL_CONFIG;
    }
}

// Helper function to get strategy info
export function getStrategyInfo(strategyName) {
    return YIELD_STRATEGIES[strategyName.toUpperCase()] || null;
}

// Helper function to get risk level info
export function getRiskLevel(riskScore) {
    return RISK_LEVELS[riskScore] || { name: "Unknown", color: "gray" };
}

// Frontend integration example
export const FRONTEND_EXAMPLE = `
// Example usage in your React/Vue/Angular app:

import { ethers } from 'ethers';
import { LOCAL_CONFIG, YIELD_STRATEGIES } from './config';

// Initialize provider and signer
const provider = new ethers.providers.JsonRpcProvider(LOCAL_CONFIG.RPC_URL);
const signer = provider.getSigner();

// Initialize contracts
const yieldManager = new ethers.Contract(
    LOCAL_CONFIG.YIELD_MANAGER,
    CONTRACT_ABIS.YIELD_MANAGER,
    signer
);

// Get available strategies
const strategies = await yieldManager.getAvailableStrategies();

// Select best strategy
const [strategyName, explanation] = await yieldManager.selectBestStrategy(
    userAddress,
    ethers.utils.parseUnits("100", 6), // $100 USDT
    30 * 24 * 60 * 60, // 30 days
    5 // Moderate risk
);

// Invest in strategy
const tx = await yieldManager.investInStrategy(
    userAddress,
    amount,
    strategyName
);
`;

export default {
    LOCAL_CONFIG,
    SEPOLIA_CONFIG,
    YIELD_STRATEGIES,
    RISK_LEVELS,
    CONTRACT_ABIS,
    getConfig,
    getStrategyInfo,
    getRiskLevel,
    FRONTEND_EXAMPLE
};
