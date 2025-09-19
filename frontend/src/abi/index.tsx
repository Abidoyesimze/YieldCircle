import YieldCircle from './YieldCircle.json';
import YieldCircleFactory from './YieldCircleFactory.json';
import SimpleYieldCircleFactory from './SimpleYieldCircleFactory.json';
import KaiaYieldStrategyManager from './KaiaYieldStrategyManager.json';
import RandomGenerator from './RandomGenerator.json';
import MockERC20 from './MockERC20.json';
import MockRouter from './MockRouter.json';
import MockLending from './MockLending.json';

export const YieldCircleContract = {
    abi: YieldCircle,
    address: '0x277490C4cc17Ca14A43f0a293656f78E6e10448C', // Individual circle contract (created by factory)
    
}



export const SimpleYieldCircleFactoryContract = {
    abi: SimpleYieldCircleFactory,
    address: '0x0F939ed454028c4edC7bA14cdB09d5E660Bd0fd8', // Working test factory contract that creates circles
    
}

export const KaiaYieldStrategyManagerContract = {
    abi: KaiaYieldStrategyManager,
    address: '0x789FF5585c2de03Be045d8866e69be0a3cf54744',
    
}

export const RandomGeneratorContract = {
    abi: RandomGenerator,
    address: '0xc9843a1aF776BEe8bDb55b94fD23bE2dbf457AbD',
    
}


// Additional contracts
export const USDTContract = {
    abi: MockERC20, // Using MockERC20 ABI for USDT
    address: '0xFE2e76f1DcF3A706e34cCB6083125D4A4a59876E',
}

export const USDCContract = {
    abi: MockERC20, // Using MockERC20 ABI for USDC
    address: '0xc48022cC602f38d26Fc29A6148eB3605d0639aCB',
}

export const KAIAContract = {
    abi: MockERC20, // Using MockERC20 ABI for KAIA
    address: '0x442815Ec82C9879BDb13A4809c3Ae7C396D658f4',
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
    SimpleYieldCircleFactory: SimpleYieldCircleFactoryContract,
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