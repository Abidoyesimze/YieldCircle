// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title Mock Lending Protocol
 * @dev Mock lending protocol for testing yield strategies
 */
contract MockLending {
    mapping(address => mapping(address => uint256)) public userSupplies;
    mapping(address => uint256) public totalSupplies;

    function supply(address asset, uint256 amount) external {
        IERC20(asset).transferFrom(msg.sender, address(this), amount);
        userSupplies[msg.sender][asset] += amount;
        totalSupplies[asset] += amount;
    }

    function withdraw(
        address asset,
        uint256 amount
    ) external returns (uint256) {
        require(
            userSupplies[msg.sender][asset] >= amount,
            "Insufficient supply"
        );

        userSupplies[msg.sender][asset] -= amount;
        totalSupplies[asset] -= amount;

        IERC20(asset).transfer(msg.sender, amount);
        return amount;
    }

    function getSupplyRate(address asset) external pure returns (uint256) {
        return 600; // 6% APY in basis points
    }

    function balanceOf(address user) external view returns (uint256) {
        // Return total balance across all assets
        uint256 total = 0;
        // This is a simplified version for testing
        return total;
    }

    function getReserveData(
        address asset
    )
        external
        view
        returns (
            uint256 configuration,
            uint256 liquidityIndex,
            uint256 variableBorrowIndex,
            uint256 currentLiquidityRate,
            uint256 currentVariableBorrowRate,
            uint256 currentStableBorrowRate,
            uint40 lastUpdateTimestamp
        )
    {
        return (
            0, // configuration
            1e27, // liquidityIndex (1.0)
            1e27, // variableBorrowIndex (1.0)
            600, // currentLiquidityRate (6% APY)
            800, // currentVariableBorrowRate (8% APY)
            700, // currentStableBorrowRate (7% APY)
            uint40(block.timestamp) // lastUpdateTimestamp
        );
    }
}
