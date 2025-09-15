// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title Mock Router
 * @dev Mock router for testing yield strategies
 */
contract MockRouter {
    function addLiquidity(
        address tokenA,
        address tokenB,
        uint amountADesired,
        uint amountBDesired,
        uint amountAMin,
        uint amountBMin,
        address to,
        uint deadline
    ) external returns (uint amountA, uint amountB, uint liquidity) {
        // Mock implementation - return the desired amounts
        return (
            amountADesired,
            amountBDesired,
            amountADesired + amountBDesired
        );
    }

    function removeLiquidity(
        address tokenA,
        address tokenB,
        uint liquidity,
        uint amountAMin,
        uint amountBMin,
        address to,
        uint deadline
    ) external returns (uint amountA, uint amountB) {
        // Mock implementation - return half of liquidity for each token
        uint halfLiquidity = liquidity / 2;
        return (halfLiquidity, halfLiquidity);
    }

    function swapExactTokensForTokens(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external returns (uint[] memory amounts) {
        // Mock implementation - return 1:1 swap
        uint[] memory result = new uint[](2);
        result[0] = amountIn;
        result[1] = amountIn; // 1:1 swap for testing
        return result;
    }

    function getAmountsOut(
        uint amountIn,
        address[] calldata path
    ) external pure returns (uint[] memory amounts) {
        // Mock implementation - return 1:1 amounts
        uint[] memory result = new uint[](2);
        result[0] = amountIn;
        result[1] = amountIn; // 1:1 for testing
        return result;
    }

    function getPair(
        address tokenA,
        address tokenB
    ) external pure returns (address pair) {
        // Mock implementation - return a mock pair address
        // In real implementation, this would return the actual LP token address
        return address(0x1234567890123456789012345678901234567890);
    }

    function createPair(
        address tokenA,
        address tokenB
    ) external returns (address pair) {
        // Mock implementation - return a mock pair address
        // In real implementation, this would create and return the actual LP token address
        return address(0x1234567890123456789012345678901234567890);
    }

    function setLPAPY(address pair, uint256 apy) external {
        // Mock implementation - in real protocol this would update the LP APY
        // For testing purposes, this method is called during initialization
    }

    function getLPYield(
        address user,
        address lpToken
    ) external pure returns (uint256 yield) {
        // Mock implementation - return a mock yield amount
        // In real implementation, this would calculate actual LP yield
        return 1000; // Mock yield amount
    }

    function claimLPYield(address lpToken) external {
        // Mock implementation - in real protocol this would claim LP rewards
        // For testing purposes, this method is called to claim yield
    }
}
