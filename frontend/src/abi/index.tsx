import YieldCircle from './YieldCircle.json';
import YieldCircleFactory from './YieldCircleFactory.json';
import KaiaYieldStrategyManager from './KaiaYieldStrategyManager.json';
import RandomGenerator from './RandomGenerator.json';
import MockERC20 from './MockERC20.json';
import MockRouter from './MockRouter.json';
import MockLending from './MockLending.json';

export const YieldCircleContract = {
    abi: YieldCircle,
    address: '0x0000000000000000000000000000000000000000', // Individual circle contract (created by factory)
    
}

export const YieldCircleFactoryContract = {
    abi: YieldCircleFactory,
    address: '0x277490C4cc17Ca14A43f0a293656f78E6e10448C', // Factory contract that creates circles
    
}

export const KaiaYieldStrategyManagerContract = {
    abi: KaiaYieldStrategyManager,
    address: '0xf81F832BaBc8753477B56DD4f73334c69b7Ed442',
    
}

export const RandomGeneratorContract = {
    abi: RandomGenerator,
    address: '0x654448cee799e8bdeF8e217cFeD1f3a09e17167B',
    
}


// Additional contracts
export const USDTContract = {
    abi: MockERC20, // Using MockERC20 ABI for USDT
    address: '0x89fde6067B334226f1BdA9f077eFB6d48f0e1443',
}

export const USDCContract = {
    abi: MockERC20, // Using MockERC20 ABI for USDC
    address: '0x2DdE38f5b316De59Ac48EEC50f02F4222edA0B7f',
}

export const KAIAContract = {
    abi: MockERC20, // Using MockERC20 ABI for KAIA
    address: '0xbE173555472C07530F6CC24e0FDe22a3fB0C06a1',
}

export const RouterContract = {
    abi: MockRouter, // Using MockRouter ABI
    address: '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9',
}

export const LendingContract = {
    abi: MockLending, // Using MockLending ABI
    address: '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9',
}

// Export all contracts as an object for easy access
export const contracts = {
    YieldCircle: YieldCircleContract,
    YieldCircleFactory: YieldCircleFactoryContract,
    KaiaYieldStrategyManager: KaiaYieldStrategyManagerContract,
    RandomGenerator: RandomGeneratorContract,
    USDT: USDTContract,
    USDC: USDCContract,
    KAIA: KAIAContract,
    Router: RouterContract,
    Lending: LendingContract,
}

// Helper function to get contract by name
export const getContract = (contractName: keyof typeof contracts) => {
    return contracts[contractName];
}

// Helper function to get contract address by name
export const getContractAddress = (contractName: keyof typeof contracts): string => {
    return contracts[contractName].address;
}

// Helper function to get contract ABI by name
export const getContractABI = (contractName: keyof typeof contracts) => {
    return contracts[contractName].abi;
}