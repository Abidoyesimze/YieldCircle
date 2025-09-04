// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title Kaia Protocol Interfaces
 * @dev Interfaces for Kaia DeFi protocol integration
 */

interface IKaiaRouter {
    function addLiquidity(
        address tokenA,
        address tokenB,
        uint amountADesired,
        uint amountBDesired,
        uint amountAMin,
        uint amountBMin,
        address to,
        uint deadline
    ) external returns (uint amountA, uint amountB, uint liquidity);
    
    function removeLiquidity(
        address tokenA,
        address tokenB,
        uint liquidity,
        uint amountAMin,
        uint amountBMin,
        address to,
        uint deadline
    ) external returns (uint amountA, uint amountB);
    
    function swapExactTokensForTokens(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external returns (uint[] memory amounts);
    
    function getAmountsOut(uint amountIn, address[] calldata path)
        external view returns (uint[] memory amounts);
}

interface IKaiaLP {
    function balanceOf(address owner) external view returns (uint);
    function totalSupply() external view returns (uint);
    function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast);
    function token0() external view returns (address);
    function token1() external view returns (address);
    function approve(address spender, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}

interface IKaiaLending {
    function supply(address asset, uint256 amount) external;
    function withdraw(address asset, uint256 amount) external returns (uint256);
    function getSupplyRate(address asset) external view returns (uint256);
    function balanceOf(address user) external view returns (uint256);
    function getReserveData(address asset) external view returns (
        uint256 configuration,
        uint256 liquidityIndex,
        uint256 variableBorrowIndex,
        uint256 currentLiquidityRate,
        uint256 currentVariableBorrowRate,
        uint256 currentStableBorrowRate,
        uint40 lastUpdateTimestamp
    );
}

interface IChainlinkVRF {
    function requestRandomWords(
        bytes32 keyHash,
        uint64 subId,
        uint16 requestConfirmations,
        uint32 callbackGasLimit,
        uint32 numWords
    ) external returns (uint256 requestId);
    
    function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords) external;
}
